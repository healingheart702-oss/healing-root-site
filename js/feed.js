// js/feed.js
import { auth, db } from './firebase.js';
import { CLOUDINARY } from './cloudinary.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

// DOM
const postBtn = document.getElementById('post-btn');
const postText = document.getElementById('post-text');
const postImage = document.getElementById('post-image');
const feedContainer = document.getElementById('feed-container');
const productsGrid = document.getElementById('products-grid');

const PRODUCTS = [
  {
    id:'tenera',
    name:'Tenera Oil Palm Seedlings',
    price:'₦1,000 per seedling',
    short: 'Tenera oil palm seedlings — high oil-to-bunch ratio and early bearing. Suitable for commercial plantations.',
    long: `Healing root AGRO ventures stands as a trusted name in quality crop seedlings across Nigeria. We have built our reputation on reliability, clarity, and genuine agricultural knowledge that helps farmers and investors create lasting income. Our goal is simple. To deliver seedlings that give strong survival rate, high yield, and a clear path to long term returns. Every seedling we raise is nurtured in a clean nursery environment, inspected carefully, and supplied with full guidance for establishment and expansion.

The Tenera oil palm variety is one of the most respected agricultural assets for anyone who understands sustainable agriculture and long term wealth creation. It is the variety that drives most modern plantations today because of its high oil content, strong performance on the field, resilience, and impressive yearly returns. At Healing Root Agro Ventures, we supply Tenera seedlings that are true to type and well prepared for plantation establishment across Nigeria.

This presents everything you need to know before investing in Tenera oil palm. It covers the myths, the industrial demand, the benefits, and the full financial potential of one acre and one hectare. The purpose is to give you clarity and confidence as you step into one of Africa’s strongest agricultural opportunities.

COMMON MYTHS ABOUT OIL PALM FARMING

Many people hold beliefs that prevent them from securing the long term reward that oil palm offers. Some think oil palm requires too much money to start. Others believe it takes too long before harvest. Some assume oil palm is only for big corporations. Many also think the market for palm oil is already saturated and will not grow again.

These assumptions are incomplete and often misleading. What oil palm requires is structure, patience, and correct spacing. What it pays back is consistent yearly income. An oil palm plantation that is properly spaced, weeded, fertilised, and maintained will outperform most short term crops. It provides a steady source of income that keeps growing every year. The market is not saturated. In fact, Nigeria still imports palm oil to meet local demand. That means the opportunity is still open for serious investors who want renewable income for life.

INDUSTRIAL USES OF TENERA PALM OIL

Palm oil is one of the most widely used industrial oils in Africa and around the world. It is used in food production, cosmetics, pharmaceuticals, soaps, biodiesel, lubricants, and more than a hundred manufacturing processes. Every sector of Nigeria’s economy has one product that depends on palm oil or palm kernel oil. This is why demand keeps growing regardless of the season.

... (text continues — full long description included) ...`
  },
  // add other products similarly (cassava, plantain, banana, cocoa, pineapple, coconut, yam)
  {
    id:'tme419',
    name:'TME 419 Cassava Stems',
    price:'₦1,000 per bundle',
    short:'High-yield, disease-resistant cassava variety, excellent tuber quality.',
    long: 'TME 419 is a high-yield, disease-resistant cassava variety developed by IITA. It ensures faster maturity, excellent tuber quality, and adaptability across diverse soils and climates. Farmers planting TME 419 benefit from consistent sprouting, vigorous growth, and high starch content suitable for industrial processing. (Full description continues...)'
  }
];

function renderProducts(){
  productsGrid.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product-card';
    const short = p.short;
    const preview = short.length > 180 ? short.slice(0,180)+'...' : short;
    card.innerHTML = `
      <h4>${p.name}</h4>
      <p class="small">${preview} <button class="read-more small" data-id="${p.id}">Read more</button></p>
      <p><strong>${p.price}</strong></p>
      <p><a target="_blank" href="https://wa.me/2349138938301?text=${encodeURIComponent('I want to order '+p.name)}">Order via WhatsApp</a></p>
      <div id="long-${p.id}" style="display:none;" class="small"></div>
    `;
    productsGrid.appendChild(card);
    document.getElementById(`long-${p.id}`).textContent = p.long;
  });
}

document.addEventListener('click', (e)=>{
  if(e.target && e.target.matches('.read-more')){
    const id = e.target.dataset.id;
    const el = document.getElementById(`long-${id}`);
    if(el.style.display === 'none'){ el.style.display='block'; e.target.textContent='Read less'; }
    else{ el.style.display='none'; e.target.textContent='Read more'; }
  }
});

// Auth + posting
onAuthStateChanged(auth, user=>{
  if(!user) location.href = 'index.html';
});

// helper: upload to Cloudinary unsigned and return secure_url
async function uploadToCloudinary(file){
  const url = CLOUDINARY.uploadUrl(CLOUDINARY.cloudName);
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.unsignedPreset);
  fd.append('folder', `healingroot/posts`);
  const res = await fetch(url, { method: 'POST', body: fd });
  const json = await res.json();
  return json.secure_url;
}

postBtn?.addEventListener('click', async ()=>{
  const user = auth.currentUser;
  if(!user) return alert('Login first');
  const text = (postText?.value || '').trim();
  if(!text && (!postImage.files || !postImage.files[0])) return alert('Add text or image');
  let imageUrl = '';
  if(postImage.files && postImage.files[0]) imageUrl = await uploadToCloudinary(postImage.files[0]);
  await addDoc(collection(db,'posts'),{ userUid: user.uid, text, imageUrl, timestamp: new Date(), likes:0 });
  postText.value=''; postImage.value='';
});

// live feed
const q = query(collection(db,'posts'), orderBy('timestamp','desc'));
onSnapshot(q, async snap=>{
  feedContainer.innerHTML = '';
  for(const docSnap of snap.docs){
    const p = docSnap.data();
    const postEl = document.createElement('div');
    postEl.className = 'post-card';
    // fetch poster name
    let name = 'User';
    try{ const udoc = await getDoc(doc(db,'users',p.userUid)); if(udoc.exists()) name = udoc.data().name || name; }catch(e){}
    postEl.innerHTML = `
      <div class="row" style="align-items:center">
        <img src="${p.imageUrl? p.imageUrl : 'images/default-profile.png'}" style="width:54px;height:54px;border-radius:8px;object-fit:cover;margin-right:10px">
        <div>
          <strong>${name}</strong><div class="small">${new Date(p.timestamp?.seconds ? p.timestamp.seconds*1000 : p.timestamp).toLocaleString()}</div>
        </div>
      </div>
      <p>${p.text || ''}</p>
      ${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width:100%;margin-top:8px;border-radius:8px">` : ''}
      <div class="row" style="margin-top:8px">
        <button class="comment-btn" data-id="${docSnap.id}">Comment</button>
        ${(auth.currentUser && (auth.currentUser.email==='healingheart702@gmail.com' || p.userUid===auth.currentUser.uid)) ? `<button class="delete-post" data-id="${docSnap.id}">Delete</button>` : ''}
        <a target="_blank" class="small" href="https://wa.me/2349138938301?text=${encodeURIComponent('I want to order / enquire about this post: '+ (p.text||''))}">Order via WhatsApp</a>
      </div>
      <div id="comments-${docSnap.id}" style="margin-top:8px"></div>
      <div id="comment-box-${docSnap.id}" style="display:none; margin-top:8px;">
        <input id="comment-input-${docSnap.id}" placeholder="Write a comment">
        <button class="send-comment" data-id="${docSnap.id}">Send</button>
      </div>
    `;
    feedContainer.appendChild(postEl);
    // set up comments listener
    const commentsQ = query(collection(db, 'posts', docSnap.id, 'comments'), orderBy('timestamp'));
    onSnapshot(commentsQ, csnap=>{
      const cdiv = document.getElementById(`comments-${docSnap.id}`);
      cdiv.innerHTML='';
      csnap.forEach(cdoc=>{
        const cd = cdoc.data();
        const pEl = document.createElement('p');
        pEl.innerHTML = `<b>${cd.name}:</b> ${cd.text}`;
        cdiv.appendChild(pEl);
      });
    });
  }
});

// event delegation for comment / delete
document.addEventListener('click', async (e)=>{
  if(e.target.matches('.comment-btn')){
    const id = e.target.dataset.id;
    const box = document.getElementById(`comment-box-${id}`);
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  } else if(e.target.matches('.send-comment')){
    const id = e.target.dataset.id;
    const input = document.getElementById(`comment-input-${id}`);
    const text = input.value.trim();
    if(!text) return;
    const user = auth.currentUser;
    const udoc = await getDoc(doc(db,'users',user.uid));
    const name = udoc.exists() ? udoc.data().name : (user.email.split('@')[0]);
    await addDoc(collection(db,'posts',id,'comments'), { uid: user.uid, name, text, timestamp: new Date() });
    input.value='';
  } else if(e.target.matches('.delete-post')){
    const id = e.target.dataset.id;
    if(confirm('Delete post?')) await deleteDoc(doc(db,'posts',id));
  }
});

// initial render for products
renderProducts();
