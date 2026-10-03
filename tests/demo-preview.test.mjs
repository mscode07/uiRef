import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { ReferenceInputSchema } from '../lib/schemas.ts';
import { buildReferencePrompt } from '../lib/reference-prompt.ts';
const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../app/api/demo/preview/route.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
const insights = {summary:'Measured',palette:[],sections:[],principles:[],limitations:[]};
function endpoint(capture = async () => ({bytes:Buffer.from('image'),evidence:{title:'Demo'}})) {
  const exports = {};
  const imports = {
    'next/server': {NextResponse:{json:(value, options) => Response.json(value,options)}},
    'sharp': () => ({resize(){return this},webp(){return this},async toBuffer(){return Buffer.from('preview')}}),
    '@/lib/capture/website': {captureWebsiteInMemory:capture},
    '@/lib/capture/network': {publicTarget: async url => {if(!url.startsWith('https://example.com')) throw Error('Blocked')}},
    '@/lib/ai/insights': {imageEvidence:async()=>({}),measuredInsights:()=>insights},
    '@/lib/reference-prompt':{buildReferencePrompt},
    '@/lib/schemas':{ReferenceInputSchema},
  };
  vm.runInNewContext(code, {exports, Buffer, URL, Response, require:name=> {
    if(name in imports) return imports[name];
    if(name==='zod') return require(name);
    throw Error(`Unexpected dependency: ${name}. Demo must not access persistence.`);
  }});
  return exports.POST;
}
const request = (body, origin) => new Request('http://localhost/api/demo/preview',{method:'POST',headers:{'content-type':'application/json',...(origin?{origin}:{})},body:JSON.stringify(body)});
test('temporary previews return inline images and measured prompts without persistence dependencies', async()=>{
 const response=await endpoint()(request({url:'https://example.com'}));
 assert.equal(response.status,200);
 assert.equal(response.headers.get('cache-control'),'no-store');
 const body=await response.json();
 assert.match(body.screenshot,/^data:image\/webp;base64,/);
 assert.match(body.prompt,/https:\/\/example.com/);
 assert.equal(body.insights.summary,'Measured');
});
test('invalid and private URLs and cross-origin requests never reach capture',async()=>{
 let calls=0; const post=endpoint(async()=>{calls++; throw Error('Must not capture')});
 for(const body of [{url:'not a url'},{url:'http://127.0.0.1'},{url:'file:///tmp/x'},{}]) assert.equal((await post(request(body))).status,400);
 assert.equal((await post(request({url:'https://example.com'},'https://other.example'))).status,403);
 assert.equal(calls,0);
});
test('failed capture releases capacity and preserves a useful retry error',async()=>{
 const post=endpoint(async()=>{throw Error('Capture failed')});
 for(let i=0;i<3;i++) {
 const response=await post(request({url:'https://example.com'}));
 assert.equal(response.status,502); assert.match((await response.json()).error,/Try another public URL/);
 }
});
test('temporary capture uses an in-memory result while saved capture retains storage',()=>{
 const capture=readFileSync(new URL('../lib/capture/website.ts',import.meta.url),'utf8');
 const raw=capture.slice(capture.indexOf('export async function captureWebsiteInMemory'));
 assert.doesNotMatch(raw,/storage\.(put|get)|writeFile|saveReference|updateReference/);
 assert.match(raw,/return \{ bytes: screenshot, evidence \}/);
 assert.match(capture,/storage.put\(capture.bytes, "png"\)/);
});
test('same-origin browser requests use the public Host behind Next.js internal URL', async()=>{
 const req=new Request('http://localhost:3000/api/demo/preview',{method:'POST',headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000','content-type':'application/json'},body:JSON.stringify({url:'https://example.com'})});
 assert.equal((await endpoint()(req)).status,200);
});
