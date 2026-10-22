import {getStore} from '@netlify/blobs';
import catalog from './catalog.json' with {type:'json'};
export function createRepository(store=getStore({name:'decoration-store-v1',consistency:'strong'})){
const fresh=()=>({products:structuredClone(catalog),orders:[],nextProduct:Math.max(...catalog.map(p=>p.id))+1,nextOrder:1});
async function read(){return await store.getWithMetadata('state',{type:'json'})||null;}
return {
async snapshot(){return (await read())?.data||fresh();},
async mutate(fn){for(let attempt=0;attempt<8;attempt++){const current=await read();const state=current?.data||fresh();const result=fn(state);const write=await store.setJSON('state',state,current?{onlyIfMatch:current.etag}:{onlyIfNew:true});if(write.modified)return result;}throw Object.assign(Error('La boutique est occupée. Réessayez dans un instant.'),{status:409});}
};}
