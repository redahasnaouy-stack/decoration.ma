export async function sendOrderToSheets(order,{env=process.env,fetchImpl=fetch}={}){
if(!env.GOOGLE_SHEETS_WEBHOOK_URL||!env.GOOGLE_SHEETS_SYNC_TOKEN)return{state:'unconfigured',message:'Google Sheets non configuré'};
try{const url=new URL(env.GOOGLE_SHEETS_WEBHOOK_URL);if(url.protocol!=='https:'||url.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname))throw Error('Configuration invalide');
const response=await fetchImpl(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:env.GOOGLE_SHEETS_SYNC_TOKEN,order:{id:order.id,requestId:order.requestId||'legacy-'+order.id,created:order.created,customer:order.customer,phone:order.phone,address:order.address,items:order.items,total:order.total,status:order.status}}),signal:AbortSignal.timeout(7000),redirect:'follow'});
if(!response.ok)throw Error('Google indisponible');const data=await response.json();if(data.ok!==true)throw Error('Synchronisation refusée');return{state:'synced',message:'Synchronisé',updated:new Date().toISOString()};
}catch{return{state:'pending',message:'Envoi non confirmé. Réessayez depuis l’administration.'};}}
