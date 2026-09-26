import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { gunzipSync, inflateSync, brotliDecompressSync } from "node:zlib";
import ipaddr from "ipaddr.js";

export function isPublicAddress(address: string) {
  try {
    let ip = ipaddr.parse(address);
    if (ip.kind() === "ipv6" && (ip as ipaddr.IPv6).isIPv4MappedAddress())
      ip = (ip as ipaddr.IPv6).toIPv4Address();
    return ip.range() === "unicast";
  } catch {
    return false;
  }
}

export async function publicTarget(input: string) {
  const url = new URL(input);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port))
  )
    throw new Error(
      "Use a public HTTP or HTTPS website without credentials or a custom port.",
    );
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = await lookup(hostname, { all: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => !isPublicAddress(address))
  )
    throw new Error(
      "Only public websites can be captured. Local and private network addresses are not allowed.",
    );
  return { url, address: addresses[0] };
}

// Resolve once, validate, then pin the actual connection to that IP. Every redirect
// and subresource passes through this function too; the browser never fetches directly.
export async function fetchPublicResource(input: string, signal: AbortSignal) {
  const { url, address } = await publicTarget(input);
  return new Promise<{
    status: number;
    headers: Record<string, string>;
    body: Buffer;
  }>((resolve, reject) => {
    const request = (url.protocol === "https:" ? https : http).request(
      url,
      {
        method: "GET",
        family: address.family,
        signal,
        timeout: 12000,
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; UIRef/1.0; visual reference capture)",
          "accept-encoding": "identity",
          accept: "*/*",
        },
        lookup: (_hostname, _options, callback) =>
          callback(null, address.address, address.family),
      },
      (response) => {
        let length = 0;
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => {
          length += chunk.length;
          if (length > 12 * 1024 * 1024) {
            response.destroy(new Error("Resource too large."));
            return;
          }
          chunks.push(chunk);
        });
        response.on("error", reject);
        response.on("end", () => {
          try {
            let body = Buffer.concat(chunks);
            const options = { maxOutputLength: 20 * 1024 * 1024 };
            if (response.headers["content-encoding"] === "gzip")
              body = gunzipSync(body, options);
            if (response.headers["content-encoding"] === "br")
              body = brotliDecompressSync(body, options);
            if (response.headers["content-encoding"] === "deflate")
              body = inflateSync(body, options);
            const headers: Record<string, string> = {};
            // Keep redirects and MIME types, never cookies or transfer/compression headers.
            for (const key of [
              "content-type",
              "location",
              "access-control-allow-origin",
            ])
              if (typeof response.headers[key] === "string")
                headers[key] = response.headers[key] as string;
            resolve({ status: response.statusCode || 502, headers, body });
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    request.on("timeout", () =>
      request.destroy(new Error("Website request timed out.")),
    );
    request.on("error", reject);
    request.end();
  });
}
