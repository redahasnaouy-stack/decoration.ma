const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('fr-MA',{maximumFractionDigits:0}).format(n)+' DH';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let products=[],category='Tout';
function render(){const q=$('#search').value.toLowerCase();let list=products.filter(p=>(category==='Tout'||p.category===category)&&(p.name+' '+p.description).toLowerCase().includes(q));if($('#sort').value!=='default')list.sort((a,b)=>$('#sort').value==='asc'?a.price-b.price:b.price-a.price);$('#products').innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-image"><a href="#produit-${p.id}" data-detail="${p.id}" aria-label="Découvrir ${esc(p.name)}"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}"></a><span class="tag">${esc(p.category)}</span><button class="quick-view" data-detail="${p.id}" aria-label="Voir les détails de ${esc(p.name)}">Découvrir ↗</button></div><div class="product-body"><div class="product-category">${esc(p.category)}</div><h3 class="product-name"><a href="#produit-${p.id}" data-detail="${p.id}">${esc(p.name)}</a></h3><div class="product-meta"><strong>${money(p.price)}</strong></div><button class="product-details" data-detail="${p.id}"><span>Voir le produit</span><span aria-hidden="true">↗</span></button></div></article>`).join(''):'<p>Aucune pièce trouvée. Essayez une autre recherche.</p>';}

document.addEventListener('click',e=>{
const detail=e.target.closest('[data-detail]');
if(detail){e.preventDefault();const p=products.find(p=>p.id===Number(detail.dataset.detail));if(!p)return;
$('#product-dialog').innerHTML=`<div class="dialog-head"><span class="eyebrow">${esc(p.category)}</span><button data-close="product-dialog" aria-label="Fermer">✕</button></div><img class="detail-image" src="${esc(p.image)}" alt="${esc(p.name)}"><h2 class="detail-title" id="product-title">${esc(p.name)}</h2><div class="detail-price">${money(p.price)}</div><h3 class="description-heading">À propos de cette pièce</h3><p class="detail-description">${esc(p.description||'Découvrez cette pièce de notre collection.')}</p>`;
$('#product-dialog').showModal();}
const close=e.target.closest('[data-close]');if(close)document.getElementById(close.dataset.close).close();
});
$('#search').oninput=render;$('#sort').onchange=render;$('#year').textContent=new Date().getFullYear();try{const r=await fetch('/api/products');if(!r.ok)throw Error();products=await r.json();$('#filters').innerHTML=['Tout',...new Set(products.map(p=>p.category))].map(c=>`<button class="${c==='Tout'?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('');$('#filters').onclick=e=>{const b=e.target.closest('button');if(!b)return;category=b.dataset.filter;$('#filters').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render();};render();}catch{$('#products').textContent='La collection est momentanément indisponible. Réessayez dans quelques instants.';}

// A deliberate click on the backdrop closes the dialog; clicks and drags inside keep it open.
for(const dialog of document.querySelectorAll('dialog')){
const outside=event=>{const r=dialog.getBoundingClientRect();return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;};
let beganOutside=false;
dialog.addEventListener('pointerdown',event=>{beganOutside=event.target===dialog&&outside(event);});
dialog.addEventListener('click',event=>{if(beganOutside&&event.target===dialog&&outside(event))dialog.close();beganOutside=false;});
}
