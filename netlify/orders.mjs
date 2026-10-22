export function validateOrder(body){
const text=(value,min,max)=>typeof value==='string'&&value.trim().length>=min&&value.trim().length<=max;
if(!text(body.customer,2,120)||!/^\+?[\d\s-]{9,18}$/.test(body.phone||'')||!text(body.city,2,100)||!text(body.address,5,600)||!Number.isInteger(body.productId)||!Number.isInteger(body.quantity)||body.quantity<1||body.quantity>99||!/^[-a-f0-9]{36}$/.test(body.requestId||''))throw Error('Vérifiez votre nom, téléphone, ville, adresse et quantité.');
return {...body,customer:body.customer.trim(),city:body.city.trim(),address:body.address.trim(),phone:body.phone.trim()};
}
export function placeOrder(state,body){
const previous=state.orders.find(o=>o.requestId===body.requestId);if(previous)return{id:previous.id,total:previous.total};
const p=state.products.find(p=>p.id===body.productId);if(!p||p.stock<body.quantity)throw Error('Ce produit n’est pas disponible dans cette quantité.');
const subtotal=Math.round(p.price*body.quantity*100)/100,shipping=subtotal>=800?0:39,total=Math.round((subtotal+shipping)*100)/100;
const id=state.nextOrder++;state.orders.push({id,requestId:body.requestId,customer:body.customer,phone:body.phone,address:body.city+' — '+body.address,items:[{id:p.id,name:p.name,price:p.price,quantity:body.quantity}],total,status:'Nouvelle',created:new Date().toISOString()});p.stock-=body.quantity;return{id,total};
}
