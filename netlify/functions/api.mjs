import {defaultMarketing,validateMarketing} from '../marketing.mjs';
import {sendOrderToSheets} from '../sheets.mjs';
import {validateOrder,placeOrder} from '../orders.mjs';
import {getStore} from '@netlify/blobs';
import {randomUUID} from 'node:crypto';
import {decodeImage,validImage} from '../uploads.mjs';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {createRepository} from '../store.mjs';
const reply=(status,data,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
const sign=value=>createHmac('sha256',process.env.ADMIN_PASSWORD).update(value).digest('hex');
const equal=(a,b)=>a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
function authenticated(req){if(!process.env.ADMIN_PASSWORD)return false;const cookie=(req.headers.get('cookie')||'').match(/(?:^|;\s*)session=([^;]+)/)?.[1];if(!cookie)return false;const [expiry,sig]=cookie.split('.');return /^\d+$/.test(expiry)&&Number(expiry)>Date.now()&&equal(sig||'',sign(expiry));}
function product(p){if(typeof p.name!=='string'||!p.name.trim()||typeof p.category!=='string'||!p.category.trim()||!Number.isFinite(p.price)||p.price<=0||!Number.isInteger(p.stock)||p.stock<0||!validImage(p.image))throw Error('Produit invalide');return[p.name.trim(),p.category.trim(),p.price,p.stock,p.image,String(p.description||'')];}
export default async function handler(req){try{const url=new URL(req.url);const route=url.pathname.replace(/^\/\.netlify\/functions\/api/,'/api');if(!['GET','POST','PUT','DELETE','PATCH'].includes(req.method))return reply(405,{error:'Méthode refusée'});if(req.method!=='GET'&&req.headers.get('origin')&&req.headers.get('origin')!==url.origin)return reply(403,{error:'Origine refusée'});const body=async()=>{const text=await req.text();if(text.length>100000)throw Error('Requête trop volumineuse');return JSON.parse(text||'{}');};
if(route==='/api/admin/session'&&req.method==='GET')return reply(200,{authenticated:authenticated(req),needsSetup:!process.env.ADMIN_PASSWORD});
if(route==='/api/admin/login'&&req.method==='POST'){if(!process.env.ADMIN_PASSWORD||process.env.ADMIN_PASSWORD.length<12)return reply(503,{error:'Configurez ADMIN_PASSWORD (12 caractères minimum) dans Netlify puis redéployez.'});const b=await body();if(!equal(sign(String(b.password||'')),sign(process.env.ADMIN_PASSWORD)))return reply(401,{error:'Mot de passe incorrect'});const expiry=String(Date.now()+86400000);return reply(200,{ok:true},{'set-cookie':`session=${expiry}.${sign(expiry)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`});}
if(route==='/api/admin/logout'&&req.method==='POST')return reply(200,{ok:true},{'set-cookie':'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
if(route.startsWith('/api/admin/')&&!authenticated(req))return reply(401,{error:'Connexion requise'});
const asset=route.match(/^\/api\/images\/([a-f0-9-]{36})$/);
if(asset&&req.method==='GET'){const image=await getStore({name:'dicoration-images',consistency:'strong'}).getWithMetadata(asset[1],{type:'arrayBuffer'});if(!image)return reply(404,{error:'Image introuvable'});return new Response(image.data,{headers:{'content-type':image.metadata.mime,'cache-control':'public, max-age=31536000, immutable','x-content-type-options':'nosniff'}});}
if(route==='/api/admin/images'&&req.method==='POST'){const text=await req.text();if(text.length>2900000)throw Error('Image trop volumineuse');const {bytes,mime}=decodeImage(JSON.parse(text));const id=randomUUID();await getStore({name:'dicoration-images',consistency:'strong'}).set(id,bytes,{metadata:{mime}});return reply(201,{image:'/api/images/'+id});}
if(route==='/api/orders'&&req.method==='POST'){const input=validateOrder(await body());const repository=createRepository();const result=await repository.mutate(state=>placeOrder(state,input));try{await syncSheets(repository,result.id);}catch{}return reply(201,result);}
const db=createRepository();
if((route==='/api/marketing'||route==='/api/admin/marketing')&&req.method==='GET')return reply(200,(await db.snapshot()).marketing||defaultMarketing);
if(route==='/api/admin/marketing'&&req.method==='PUT'){const settings=validateMarketing(await body());await db.mutate(state=>{state.marketing=settings;});return reply(200,settings);}
if(route==='/api/products'&&req.method==='GET')return reply(200,(await db.snapshot()).products.sort((a,b)=>b.id-a.id));

if(route==='/api/admin/orders'&&req.method==='GET')return reply(200,(await db.snapshot()).orders.sort((a,b)=>b.id-a.id));
if(route==='/api/admin/products'&&req.method==='POST'){const values=product(await body());return reply(201,await db.mutate(state=>{const id=state.nextProduct++;state.products.push(Object.fromEntries(['id','name','category','price','stock','image','description'].map((key,i)=>[key,[id,...values][i]])));return{id};}));}
const sheetOrder=route.match(/^\/api\/admin\/orders\/(\d+)\/sheets$/);if(sheetOrder&&req.method==='POST'){const result=await syncSheets(db,Number(sheetOrder[1]));return reply(200,result);}
const pm=route.match(/^\/api\/admin\/products\/(\d+)$/);if(pm&&req.method==='PUT'){const values=product(await body());await db.mutate(state=>{const p=state.products.find(p=>p.id===Number(pm[1]));if(!p)throw Error('Produit introuvable');Object.assign(p,Object.fromEntries(['name','category','price','stock','image','description'].map((key,i)=>[key,values[i]])));});return reply(200,{ok:true});}
if(pm&&req.method==='DELETE'){await db.mutate(state=>{state.products=state.products.filter(p=>p.id!==Number(pm[1]));});return reply(200,{ok:true});}
const om=route.match(/^\/api\/admin\/orders\/(\d+)$/);if(om&&req.method==='PATCH'){const {status}=await body();if(!['Nouvelle','Confirmée','Expédiée','Livrée','Annulée'].includes(status))throw Error('Statut invalide');await db.mutate(state=>{const order=state.orders.find(o=>o.id===Number(om[1]));if(!order)throw Error('Commande introuvable');order.status=status;});return reply(200,{ok:true});}return reply(404,{error:'Introuvable'});
}catch(e){if(e.status===409)return reply(409,{error:e.message});if(e.name==='MissingBlobsEnvironmentError'||e.code||/fetch failed|Netlify Blobs/i.test(e.message)){console.error('Storage unavailable:',e.name);return reply(503,{error:'Stockage Netlify indisponible. Vérifiez le déploiement et l’activation de Blobs.'});}return reply(400,{error:e.message});}}

async function syncSheets(repository,id){
const order=(await repository.snapshot()).orders.find(o=>o.id===id);if(!order)throw Error('Commande introuvable');
if(order.sheets?.state==='synced')return order.sheets;
const result=await sendOrderToSheets(order);
try{await repository.mutate(state=>{const current=state.orders.find(o=>o.id===id);if(current&&current.sheets?.state!=='synced')current.sheets=result;});}catch{return{state:'pending',message:'État de synchronisation à vérifier. Réessayez.'};}
return result;
}
