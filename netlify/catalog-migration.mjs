import catalog from './catalog.json' with {type:'json'};
const demos=new Map([
['Vase Terra',[249,18,'Vases','Une silhouette organique, une texture brute. Un vase décoratif aux inspirations méditerranéennes.']],
['Miroir Halo',[690,8,'Miroirs','Un miroir rond pour apporter lumière et profondeur à votre intérieur.']],
['Lampe Sora',[459,12,'Luminaires','Une lumière douce et une présence sculpturale pour vos soirées à la maison.']],
['Coussin Nomade',[189,30,'Textiles','Des tons naturels et un toucher chaleureux pour habiller votre canapé.']],
['Vase Ligne',[320,15,'Vases','Des lignes épurées, un objet intemporel qui trouve sa place partout.']],
['Suspension Naya',[790,6,'Luminaires','Une suspension aérienne pour composer une atmosphère accueillante.']]
]);
function untouchedDemo(p){const original=demos.get(p.name);return original&&p.id<=6&&p.image?.startsWith('https://images.unsplash.com/')&&original.every((value,i)=>value===[p.price,p.stock,p.category,p.description][i]);}
export function migrateCatalog(state){
if(state.catalogRevision==='engro-2026-10-22'){migrateStock(state);return;}
state.products=state.products.filter(p=>!untouchedDemo(p));
let next=Math.max(1001,state.nextProduct||1,...state.products.map(p=>p.id+1));
for(const p of catalog){if(state.products.some(x=>x.sourceId===p.sourceId))continue;state.products.push({...p,id:next++});}
state.nextProduct=next;state.catalogRevision='engro-2026-10-22';migrateStock(state);
}
export const catalogRevision='engro-2026-10-22';

export const stockRevision='engro-stock-10-v1';
function migrateStock(state){
if(state.stockRevision===stockRevision)return;
const importedIds=new Set(catalog.map(p=>p.sourceId));
for(const p of state.products)if(importedIds.has(p.sourceId)&&p.stock===0)p.stock=10;
state.stockRevision=stockRevision;
}
