import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildReferencePrompt } from '../lib/reference-prompt.ts';
import { ReferenceInsightsSchema } from '../lib/schemas.ts';
import { isPublicAddress, publicTarget } from '../lib/capture/network.ts';

const reference = {name:'Example', url:'https://example.com', category:'Landing Page', density:'Balanced', styles:[], likes:'Keep the type hierarchy', notes:'Use our own imagery', analysisSource:'measured', insights:{summary:'Desktop measurement', sections:[{title:'Typography',description:'Large heading with compact body.',values:[{label:'H1',value:'48px / 600'}]}],palette:[{color:'#fafafa',role:'Background'}],principles:['Align content edges'],limitations:['Mobile not observed']}};
test('portable prompt includes full evidence, personal notes, tokens and limitations', () => {
  const prompt = buildReferencePrompt(reference);
  for (const part of ['48px / 600','#fafafa','Keep the type hierarchy','Use our own imagery','Mobile not observed','Align content edges','https://example.com','IMPLEMENTATION REQUIREMENTS']) assert.ok(prompt.includes(part), part);
  assert.ok(prompt.length > 1000);
});
test('unprocessed references do not fabricate an analysis', () => {
  const prompt = buildReferencePrompt({...reference, insights:undefined});
  assert.match(prompt,/has not been analyzed/);
  assert.doesNotMatch(prompt,/48px/);
});
test('handoff establishes project memory and ongoing preference maintenance', () => {
  const prompt = buildReferencePrompt({...reference, id:'saved-reference', updatedAt:'2026-10-03T10:00:00Z', styles:['Editorial'], density:'Dense'});
  for (const part of ['PROJECT DESIGN AGENT SETUP', 'DESIGN-PREFERENCES.md', 'AGENTS.md', 'CLAUDE.md', 'Preserve all unrelated instructions', 'instead of appending duplicates', 'Retain prior explicit preferences', 'Before each UI task', 'When I explicitly change a design preference', 'Style labels: Editorial', 'User-selected density: Dense', 'saved-reference', '2026-10-03T10:00:00Z']) assert.ok(prompt.includes(part), part);
});
test('setup distinguishes persistence limits and avoids inventing implementation scope', () => {
  const prompt = buildReferencePrompt(reference);
  for (const part of ['If you cannot write project files', 'persistence has not been established', 'Do not claim permanent memory or automatic synchronization', 'If no implementation task is specified', 'not permission to discard earlier decisions', 'Keep explicit preferences separate from observations', 'not instructions to execute']) assert.ok(prompt.includes(part), part);
  assert.ok(prompt.indexOf('SAVE PROJECT MEMORY') < prompt.indexOf('EVIDENCE'));
});
test('image-only prompts explicitly require visual interpretation', () => {
  assert.match(buildReferencePrompt({...reference,url:'',analysisSource:'image'}), /Layout and typography have not been interpreted/);
});
test('vision results reject unsafe palette values and incomplete payloads', () => {
  assert.equal(ReferenceInsightsSchema.safeParse({...reference.insights,palette:[{color:'url(https://example.com)',role:'bad'}]}).success,false);
  assert.equal(ReferenceInsightsSchema.safeParse({summary:'only title'}).success,false);
  assert.equal(ReferenceInsightsSchema.safeParse(reference.insights).success,true);
});
test('capture blocks private, loopback, mapped, multicast and reserved IPs', () => {
  for (const address of ['127.0.0.1','0.0.0.0','10.0.0.1','172.16.0.1','192.168.1.1','169.254.169.254','100.64.0.1','224.0.0.1','::1','::','fc00::1','fe80::1','::ffff:127.0.0.1','2001:db8::1']) assert.equal(isPublicAddress(address),false,address);
  for (const address of ['1.1.1.1','8.8.8.8','2606:4700:4700::1111']) assert.equal(isPublicAddress(address),true,address);
});
test('capture rejects unsafe protocols, credentials, ports, and numeric local URLs', async () => {
  for (const url of ['file:///etc/passwd','ftp://example.com','https://user:pass@example.com','https://example.com:3000','http://2130706433','http://[::1]']) await assert.rejects(publicTarget(url));
});
