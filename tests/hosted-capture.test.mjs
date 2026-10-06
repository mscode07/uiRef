import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Writable, Readable } from 'node:stream';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file, imports, env = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const exports = {};
  vm.runInNewContext(code, {exports, Buffer, crypto, process:{env,platform:'linux',cwd:()=>'/read-only'}, require:name => name in imports ? imports[name] : require(name)});
  return exports;
}
test('hosted capture launches bundled Chromium without requiring a Playwright browser install', async()=>{
  let options;
  const {captureWebsiteInMemory} = load('../lib/capture/website.ts', {
    'server-only':{},
    'playwright':{chromium:{launch:async value=>{options=value; throw Error('launch inspected')}}},
    '@sparticuz/chromium':{args:['--no-sandbox'],executablePath:async()=>'/tmp/chromium'},
    './network':{publicTarget:async()=>{}}, '../storage':{},
  }, {VERCEL:'1'});
  await assert.rejects(captureWebsiteInMemory('https://example.com'), /launch inspected/);
  assert.equal(options.executablePath,'/tmp/chromium');
  assert.equal(options.chromiumSandbox,false);
  assert.deepEqual(Array.from(options.args),['--no-sandbox']);
});
function imageStore(env, failUpload = false) {
  const files = new Map();
  let diskWrites = 0;
  class GridFSBucket {
    openUploadStream(key) {
      return new Writable({write(chunk, _, done){
        if(failUpload) return done(Error('database unavailable'));
        files.set(key, Buffer.from(chunk)); done();
      }});
    }
    openDownloadStreamByName(key) { return Readable.from([files.get(key)]); }
  }
  const imports = {'server-only':{}, 'mongodb':{GridFSBucket}, '../db/mongodb':{database:async()=>({})},
    'node:fs/promises':{mkdir:async()=>{diskWrites++}, writeFile:async()=>{diskWrites++},readFile:async()=>{throw Error('No local file')}}};
  return {storage:load('../lib/storage/index.ts',imports,env).storage,files,diskWrites:()=>diskWrites};
}
test('MongoDB screenshots round-trip through GridFS without disk writes', async()=>{
  const store = imageStore({MONGODB_URI:'configured',VERCEL:'1'});
  const url = await store.storage.put(Buffer.from('screenshot'), 'png');
  assert.match(url,/^\/api\/uploads\/[a-f0-9-]+\.png$/);
  assert.equal((await store.storage.get(url.split('/').pop())).toString(),'screenshot');
  assert.equal(store.diskWrites(),0);
  await assert.rejects(store.storage.get('../secret.png'),/Invalid file/);
});
test('failed MongoDB image writes propagate instead of returning a broken image URL',async()=>{
  const store = imageStore({MONGODB_URI:'configured'},true);
  await assert.rejects(store.storage.put(Buffer.from('image'),'png'),/database unavailable/);
  assert.equal(store.diskWrites(),0);
});
test('Vercel never falls back to ephemeral image storage when MongoDB is missing',async()=>{
  const store = imageStore({VERCEL:'1'});
  await assert.rejects(store.storage.put(Buffer.from('image'),'png'),/Configure MongoDB/);
  assert.equal(store.diskWrites(),0);
});
