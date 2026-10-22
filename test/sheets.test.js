import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sendOrderToSheets} from '../netlify/sheets.mjs';
const order={id:1,requestId:'test-id',customer:'Client test',phone:'0600000000',address:'Rabat',items:[{name:'Vase',quantity:1}],total:239,status:'Nouvelle'};
const env={GOOGLE_SHEETS_WEBHOOK_URL:'https://script.google.com/macros/s/test/exec',GOOGLE_SHEETS_SYNC_TOKEN:'test-only-private-token'};
test('Sheets: non configuré sans requête réseau',async()=>{const result=await sendOrderToSheets(order,{env:{},fetchImpl:()=>{throw Error('Ne doit pas appeler le réseau');}});assert.equal(result.state,'unconfigured');});
test('Sheets: payload limité et confirmation obligatoire',async()=>{const result=await sendOrderToSheets({...order,internal:'not-exported'},{env,fetchImpl:async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.token,env.GOOGLE_SHEETS_SYNC_TOKEN);assert.equal(body.order.customer,'Client test');assert.equal(body.order.internal,undefined);return Response.json({ok:true});}});assert.equal(result.state,'synced');});
test('Sheets: refus et panne restent en attente, sans divulguer le secret',async()=>{for(const fetchImpl of [async()=>Response.json({ok:false}),async()=>{throw Error(env.GOOGLE_SHEETS_SYNC_TOKEN);},async()=>new Response('error',{status:500})]){const result=await sendOrderToSheets(order,{env,fetchImpl});assert.equal(result.state,'pending');assert.ok(!JSON.stringify(result).includes(env.GOOGLE_SHEETS_SYNC_TOKEN));}});
test('Sheets: destination non Google refusée sans réseau',async()=>{const result=await sendOrderToSheets(order,{env:{...env,GOOGLE_SHEETS_WEBHOOK_URL:'https://example.com/exec'},fetchImpl:()=>{assert.fail('Requête interdite');}});assert.equal(result.state,'pending');});
