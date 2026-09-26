import assert from 'node:assert/strict';
import {test} from 'node:test';
import {ReferenceInputSchema,DesignAnalysisSchema} from '../lib/schemas.ts';
test('rejects executable source URLs',()=>assert.equal(ReferenceInputSchema.safeParse({name:'A',url:'javascript:alert(1)'}).success,false));
test('rejects screenshot path traversal',()=>assert.equal(ReferenceInputSchema.safeParse({name:'A',screenshot:'/api/uploads/../../etc/passwd'}).success,false));
test('accepts HTTPS bookmarks',()=>assert.equal(ReferenceInputSchema.safeParse({name:'A',url:'https://example.com'}).success,true));
test('rejects incomplete AI analysis',()=>assert.equal(DesignAnalysisSchema.safeParse({category:'Dashboard',styles:['Minimal']}).success,false));
