import {test} from 'node:test';
import assert from 'node:assert/strict';
import {render,fromGraph,isEmployee,sharedSignature} from '../src/signature.js';
import {makeHandler} from '../src/handler.js';
import {createProfileReader} from '../src/profile-client.js';
const employee = {displayName:'Jasmine Example',jobTitle:'Engineer',mail:'jasmine@matertec.com',businessPhones:['+61 8 5550 0100'],mobilePhone:'PRIVATE'};
const profile = fromGraph(employee,employee.mail);
test('employee profile uses work contact data and approved template',()=>{
 const s=render(profile); assert.match(s.html,/>Jasmine Example<\/strong>/); assert.match(s.html,/>Engineer<\/span>/); assert.match(s.html,/width="108" height="150"/); assert.match(s.text,/jasmine@matertec.com/); assert.doesNotMatch(s.html,/PRIVATE|Aba Raha|404 777/);
});
test('missing optional details are omitted instead of borrowed',()=>{
 const p=fromGraph({...employee,jobTitle:null,businessPhones:[]},employee.mail); const s=render(p); assert.equal(p.phone,'');assert.doesNotMatch(s.html,/undefined|null|PRIVATE|Engineer|404 777/);
});
test('mobile phone needs explicit opt in',()=>{
 assert.equal(fromGraph({...employee,businessPhones:[]},employee.mail,true).phone,'PRIVATE');
});
test('profile text cannot inject HTML',()=>{
 const s=render(fromGraph({...employee,displayName:'<img src=x onerror="bad">',jobTitle:'A&B<script>'},employee.mail)); assert.doesNotMatch(s.html,/<script>|onerror="bad"/);assert.match(s.html,/&lt;img/);assert.match(s.html,/A&amp;B&lt;script&gt;/);
});
test('admin, emergency, role, foreign and deceptive domain identities are excluded',()=>{
 for(const email of ['aba.raha-admin@matertec.com','emergency-access-01@matertec.com','emergency-access-02@matertec.com','admin_emergency@matertec.com','info@matertec.com','all@matertec.com','a@matertec.com.evil.test','a@other.test','x"@matertec.com']) assert.equal(isEmployee(email),false,email);
 assert.equal(isEmployee('new.employee@matertec.com'),true);
});
test('wrong Graph profile and unverified alias are refused',()=>{
 assert.throws(()=>fromGraph({...employee,mail:'other@matertec.com'},employee.mail));
 assert.throws(()=>fromGraph({...employee,mail:null,userPrincipalName:employee.mail},employee.mail));
});
test('shared roles retain role spacing and Aba contacts',()=>{
 for(const role of ['admin','info','accounts']) {const s=sharedSignature(`${role}@matertec.com`);assert.match(s.html,/<\/strong><br><br>/);assert.match(s.text,/aba.raha@matertec.com/);assert.doesNotMatch(s.html,/Business Innovation Architect|>Aba Raha</);}
});
function harness(read = async()=>profile, sender=employee.mail) {
 let handler, completed=0, timer, senderNow=sender;const inserted=[];
 const Office={context:{mailbox:{userProfile:{emailAddress:employee.mail},item:{from:{getAsync(cb){cb({status:'ok',value:{emailAddress:senderNow}});}},body:{getTypeAsync(cb){cb({status:'ok',value:'html'});},setSignatureAsync(value,_,cb){inserted.push(value);cb({status:'ok'});},getAsync(){assert.fail('Body read');},setAsync(){assert.fail('Whole body rewritten');}}}}},AsyncResultStatus:{Succeeded:'ok'},CoercionType:{Html:'html',Text:'text'}};
 handler=makeHandler(Office,read,{setTimeout(fn){timer=fn;return 1;},clearTimeout(){}});
 return {inserted,run(){handler({completed(){completed++;}});},setSender(email){senderNow=email;},timeout(){timer();},get completed(){return completed;}};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('employee event inserts without reading history',async()=>{const h=harness();h.run();await tick();assert.equal(h.inserted.length,1);assert.equal(h.completed,1);});
test('profile failure leaves current draft unchanged',async()=>{const h=harness(async()=>{throw Error('no consent');});h.run();await tick();assert.equal(h.inserted.length,0);assert.equal(h.completed,1);});
test('delegated unknown employee cannot inherit signed-in user data',async()=>{let calls=0;const h=harness(async()=>{calls++;return profile;},'someone.else@matertec.com');h.run();await tick();assert.equal(calls,0);assert.equal(h.inserted.length,0);});
test('late employee result cannot overwrite a newer shared From selection',async()=>{
 let resolve;const h=harness(()=>new Promise(r=>resolve=r));h.run();h.setSender('accounts@matertec.com');h.run();resolve(profile);await tick();assert.equal(h.inserted.length,1);assert.match(h.inserted[0],/>Accounts<\/strong>/);assert.equal(h.completed,2);
});
test('late profile after timeout does not alter draft',async()=>{let resolve;const h=harness(()=>new Promise(r=>resolve=r));h.run();h.timeout();resolve(profile);await tick();assert.equal(h.inserted.length,0);assert.equal(h.completed,1);});
const config={tenantId:'11111111-1111-1111-1111-111111111111',clientId:'22222222-2222-2222-2222-222222222222',publishMobilePhone:false};
function reader(options={}) {
 const calls=[];let popups=0;
 const read=createProfileReader(options.config||config,async setup=>{calls.push(setup);return {
 acquireTokenSilent:async request=>{calls.push(request);if(options.failure)throw options.failure;return {accessToken:'TEST-TOKEN',tenantId:options.tenant||config.tenantId};},
 acquireTokenPopup:async()=>{popups++;return {accessToken:'TEST-TOKEN',tenantId:config.tenantId};}
 };},async(url,init)=>{calls.push({url,init});return {ok:true,json:async()=>options.data||employee};});
 return {read,calls,get popups(){return popups;}};
}
test('only own selected Graph fields and User.Read are requested without persistent token storage',async()=>{
 const r=reader();await r.read(employee.mail);assert.deepEqual(r.calls[1].scopes,['https://graph.microsoft.com/User.Read']);assert.equal(r.calls[0].cache.cacheLocation,'memoryStorage');assert.equal(r.calls[2].url,'https://graph.microsoft.com/v1.0/me?$select=displayName,jobTitle,mail,businessPhones');assert.equal(r.calls[2].init.redirect,'error');assert.equal(r.calls[2].init.headers.Authorization,'Bearer TEST-TOKEN');
});
test('unconfigured client makes no token or profile request',async()=>{const r=reader({config:{tenantId:'',clientId:''}});await assert.rejects(r.read(employee.mail));assert.equal(r.calls.length,0);});
test('compose consent failure never opens a popup or sends a Graph request',async()=>{const r=reader({failure:{errorCode:'interaction_required'}});await assert.rejects(r.read(employee.mail));assert.equal(r.popups,0);assert.equal(r.calls.length,2);});
test('interactive setup is the only path allowed to prompt',async()=>{const r=reader({failure:{errorCode:'interaction_required'}});await r.read(employee.mail,true);assert.equal(r.popups,1);});
test('wrong tenant stops before any Graph request',async()=>{const r=reader({tenant:'33333333-3333-3333-3333-333333333333'});await assert.rejects(r.read(employee.mail));assert.equal(r.calls.length,2);});
test('wrong account response cannot produce an employee signature',async()=>{const r=reader({data:{...employee,mail:'different@matertec.com'}});await assert.rejects(r.read(employee.mail));});
