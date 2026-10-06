import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { ReferenceInputSchema } from '../lib/schemas.ts';
const id='12345678-1234-1234-1234-123456789012';
const context={params:Promise.resolve({id})};
const base={id,name:'Original',url:'https://example.com',notes:'Keep notes',tags:['keep'],styles:['Minimal'],category:'Other',density:'Balanced',likes:'Typography',screenshot:'/api/uploads/1234.png',capturedAt:'2026-01-01',createdAt:'2026-01-01',updatedAt:'2026-01-01',insights:{summary:'old'}};
function endpoint(existing=base) {
 let record=existing && {...existing};
 const exports={};
 const imports={
  'next/server':{NextResponse:{json:(value,options)=>Response.json(value,options)}},
  '@/lib/schemas':{ReferenceInputSchema},
  '@/lib/db/references':{
   listReferences:async()=>record?[record]:[],
   updateReference:async(_,patch,revision)=>{assert.equal(revision,record.updatedAt);record={...record,...patch};return record},
   deleteReference:async()=>{const found=!!record;record=null;return found},
  },
 };
 const code=ts.transpileModule(readFileSync(new URL('../app/api/references/[id]/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,Response,URL,require:name=>imports[name]});
 return exports;
}
const request=(method,body,origin='http://localhost')=>new Request(`http://localhost/api/references/${id}`,{method,headers:{host:'localhost',origin,'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
test('editing a name preserves notes, tags and capture',async()=>{
 const response=await endpoint().PATCH(request('PATCH',{name:'Renamed'}),context);
 assert.equal(response.status,200);const saved=await response.json();
 assert.equal(saved.name,'Renamed');assert.equal(saved.notes,'Keep notes');assert.deepEqual(saved.tags,['keep']);assert.equal(saved.screenshot,base.screenshot);
});
test('changing URL clears generated screenshot and stale analysis',async()=>{
 const response=await endpoint().PATCH(request('PATCH',{url:'https://example.org'}),context);
 const saved=await response.json();assert.equal(response.status,200);
 assert.equal(saved.screenshot,undefined);assert.equal(saved.insights,undefined);assert.equal(saved.capturedAt,undefined);
});
test('replacement image survives source change; uploaded images survive metadata edits',async()=>{
 const response=await endpoint().PATCH(request('PATCH',{url:'https://example.org',screenshot:'/api/uploads/abcd.png'}),context);
 assert.equal((await response.json()).screenshot,'/api/uploads/abcd.png');
 const upload=await endpoint({...base,capturedAt:undefined}).PATCH(request('PATCH',{url:''}),context);
 assert.equal(upload.status,200);assert.equal((await upload.json()).screenshot,base.screenshot);
});
test('rejects missing source, invalid fields and attempts to mutate server-owned identity',async()=>{
 for(const body of [{url:''},{name:''},{id:'other'},{sample:true},{url:'javascript:alert(1)'}]) {
  assert.equal((await endpoint().PATCH(request('PATCH',body),context)).status,400);
 }
});
test('mutation endpoints reject foreign origins and absent records',async()=>{
 for(const method of ['PATCH','DELETE']) {
  assert.equal((await endpoint()[method](request(method,method==='PATCH'?{name:'x'}:undefined,'https://foreign.example'),context)).status,403);
  assert.equal((await endpoint(null)[method](request(method,method==='PATCH'?{name:'x'}:undefined),context)).status,404);
 }
});
test('delete removes the reference and returns no content',async()=>{
 const api=endpoint();assert.equal((await api.DELETE(request('DELETE'),context)).status,204);
 assert.equal((await api.PATCH(request('PATCH',{name:'Gone'}),context)).status,404);
});
