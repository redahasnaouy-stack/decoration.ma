import {getStore} from '@netlify/blobs';
import {migrateCatalog,catalogRevision,stockRevision} from './catalog-migration.mjs';
export function createRepository(store=getStore({name:'decoration-store-v1',consistency:'strong'})){
const fresh=()=>({products:[],orders:[],nextProduct:1,nextOrder:1});
async function read(){return await store.getWithMetadata('state',{type:'json'})||null;}
return {
async snapshot(){const current=await read();if(current?.data.catalogRevision===catalogRevision&&current.data.stockRevision===stockRevision)return current.data;return this.mutate(state=>structuredClone(state));},
async mutate(fn){for(let attempt=0;attempt<8;attempt++){const current=await read();const state=current?.data||fresh();migrateCatalog(state);const result=fn(state);const write=await store.setJSON('state',state,current?{onlyIfMatch:current.etag}:{onlyIfNew:true});if(write.modified)return result;}throw Object.assign(Error('La boutique est occupée. Réessayez dans un instant.'),{status:409});}
};}
