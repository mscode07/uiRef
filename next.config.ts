import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["playwright", "sharp", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/references/*/process": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/demo/preview": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};
export default config;
