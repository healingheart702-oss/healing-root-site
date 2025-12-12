// js/products.js
import { auth } from './firebase.js';
const PRODUCTS = [
  { id:'tme419', name:'TME 419 Cassava Stems', price:'₦1,000 per bundle', img:'images/cassava.JPG', short:'High-yield, disease-resistant cassava variety.', file:'tme419' },
  { id:'plantain', name:'Hybrid Giant Plantain Sucker', price:'₦500 per sucker', img:'images/plantain.JPG', short:'Fast-growing hybrid plantain.', file:'plantain' },
  { id:'banana', name:'Hybrid Dwarf Banana Sucker', price:'₦500 per sucker', img:'images/giant_banana.JPG', short:'Early-fruiting dwarf banana.', file:'banana' },
  { id:'oilpalm', name:'Tenera Oil Palm Seedlings', price:'₦1,000 per seedling', img:'images/oilpalm.JPG', short:'High oil-to-bunch ratio variety.', file:'oilpalm' },
  { id:'cocoa', name:'Hybrid Cocoa Nursery Plant', price:'₦500 per plant', img:'images/giant_cocoa.JPG', short:'High-yield cocoa nursery plant.', file:'cocoa' },
  { id:'pineapple', name:'Pineapple Sucker', price:'₦400 per sucker', img:'images/pineapple.JPG', short:'High-quality pineapple suckers.', file:'pineapple' },
  { id:'coconut', name:'Hybrid Dwarf Coconut Seedlings', price:'₦4,500 per seedling', img:'images/coconut.JPG', short:'High-yield coconut seedlings.', file:'coconut' },
  { id:'yam', name:'Treated Yam Setts', price:'₦700 per sett', img:'images/treated_yam.JPG', short:'Treated yam setts for optimal sprouting.', file:'yam' }
];

const grid = document.getElementById('products-grid');
const cartModal = document.getElementById('cartModal');
const cartClose = document.getElementById('cartClose');
const cartTitle = document.getElementById('cartTitle');
const cartPrice = document.getElementById('cartPrice');
const cartName = document.getElementById('cartName');
const cartPhone = document.getElementById('cartPhone');
const cartQty = document.getElementById('cartQty');
const cartMessage = document.getElementById('cartMessage');
const cartSend = document.getElementById('cartSend');

let currentProduct = null;

function renderProducts(){
  grid.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const c = document.createElement('div'); c.className='product-card';
    c.innerHTML = `<img src="${p.img}" style="width:100%;height:160px;object-fit:cover"><h4>${p.name}</h4><p class="small">${p.short}</p><p><strong>${p.price}</strong></p><div class="row"><button class="order-btn" data-id="${p.id}">Order</button></div>`;
    grid.appendChild(c);
  });
}

document.addEventListener('click', (e)=>{
  if(e.target.matches('.order-btn')){
    const id = e.target.dataset.id; currentProduct = PRODUCTS.find(x=>x.id===id);
    cartTitle.textContent = currentProduct.name; cartPrice.textContent = currentProduct.price;
    cartQty.value = 1; cartName.value = ''; cartPhone.value = ''; cartMessage.value = '';
    cartModal.style.display = 'flex';
  }
});

cartClose?.addEventListener('click', ()=>cartModal.style.display='none');

cartSend?.addEventListener('click', ()=>{
  const name = cartName.value.trim() || 'No name';
  const phone = cartPhone.value.trim() || '';
  const qty = cartQty.value || 1;
  const msg = `Order: ${currentProduct.name}\nQty: ${qty}\nName: ${name}\nPhone: ${phone}\nMessage: ${cartMessage.value}`;
  if(!phone) { alert('Enter phone number'); return; }
  const wa = `https://wa.me/234${phone.replace(/^0/,'') ? phone.replace(/^0/,'') : phone}?text=${encodeURIComponent(msg)}`;
  window.open(wa,'_blank');
});
renderProducts();
