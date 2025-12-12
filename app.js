// app.js — Healingroot Agro Ventures
// Modules: Auth, Products, Feed, Profile, Friends/Chat, Notifications, Admin
// IMPORTANT: Place in same folder as index.html and style.css

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Cloudinary config (profile pics & posts)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.appspot.com",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin UID
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// ---------------------- PRODUCTS ----------------------
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures is a trusted provider of high-quality cassava stems across Nigeria. Each TME419 stem is carefully nurtured in our clean nursery, ensuring robust health, strong survival rates, and high yields. Farmers and investors benefit from detailed planting guidance, spacing advice, fertilizer schedules, pest and weed control instructions, and harvest planning. This variety matures early, offers excellent tuber quality, and provides access to multiple markets including food, industrial starch, and bioethanol production. Properly managed, these stems reduce risk, maximize income, and create long-term farming success. Healingroot AGRO Ventures ensures every customer receives planting material and support to generate consistent profits while building sustainable agricultural businesses. This investment in TME419 stems guarantees predictable returns, mitigates crop failure, and allows farmers to scale with confidence, tapping into both local and industrial supply chains. Our stems help smallholders and large-scale farmers alike achieve profitable, food-secure, and market-ready cassava production.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures provides hybrid plantain suckers selected for early maturity, uniform bunch size, and disease tolerance. Each sucker is cultivated in controlled nurseries to develop strong roots and healthy crowns. Our guidance includes spacing, fertilizer regimes, pest and weed management, and irrigation practices. Hybrid plantains deliver early yields, consistent fruit quality, and reliable cash flow for both smallholders and commercial farmers. They are versatile for intercropping, household consumption, and market sale. With proper field management and high-quality suckers, farmers reduce establishment risks and achieve higher profitability. Healingroot AGRO Ventures ensures all customers have access to planting materials and professional support to maximize field performance and market readiness, enabling sustainable income generation and long-term farm growth.`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `Hybrid Dwarf Banana from Healingroot AGRO Ventures is ideal for farmers seeking fast returns, easy management, and early fruiting. These suckers are selected for uniformity, vigor, and superior fruit quality. Dwarf varieties are less prone to wind damage, require less space, and integrate well with mixed cropping systems. Our comprehensive guidance covers planting, fertilization, disease monitoring, and post-harvest management to maximize yield and marketability. Bananas provide rapid cash flow, processed product opportunities, and strong market demand. Healingroot ensures that each customer receives planting material supported by agronomy advice for sustainable production, early income, and scalable plantation success.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures supplies Tenera oil palm seedlings — a strategic investment crop. These seedlings are raised under optimal nursery conditions to ensure early vigor, high survival, and robust long-term productivity. Tenera palms produce high oil content, mature early, and adapt to a wide range of soil types. Healingroot provides planting guidance, spacing instructions, fertilization programs, pest and weed management strategies, and plantation establishment support. Oil palm is a generational crop delivering predictable income for decades, supporting both smallholders and large-scale investors. With certified seedlings and structured guidance, customers can maximize returns, access industrial markets, and create sustainable agricultural wealth with confidence.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures provides high-quality hybrid dwarf coconut seedlings raised for uniform growth, strong roots, and high survival rates. Coconuts are versatile: producing nuts, copra, oil, and by-products for food, cosmetics, and industry. Proper planting, irrigation, fertilization, and pest management ensure early establishment and long-term productivity. With our seedlings, farmers establish resilient plantations that yield income for decades. Healingroot also offers guidance on field management to protect investments, maximize harvest quality, and secure consistent economic returns. Our seedlings support both smallholder and commercial coconut farming, fostering sustainable and profitable agricultural enterprises.`
  },
  {
    id: "giant_cocoa",
    name: "Hybrid Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures delivers hybrid giant cocoa seedlings for consistent, high-quality cocoa production. Cocoa is a premium cash crop with strong global demand. Each seedling is nurtured to ensure robust growth, disease resistance, and high yield potential. Planting our certified seedlings minimizes establishment risk, provides uniformity for market-ready beans, and ensures sustained income. Customers receive guidance on planting, shading, pruning, and integrated pest management, creating productive cocoa stands for smallholders and commercial growers alike.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Healingroot AGRO Ventures supplies premium pineapple seedlings with uniform growth and strong resistance to pests. Our seedlings ensure predictable fruit quality and high market value. We provide recommendations for variety selection, planting density, fertilization, pest management, and harvest planning. Pineapple is a high-value horticultural crop with fresh and processed market channels. Customers benefit from quality planting material and expert guidance to maximize yield, marketability, and profitability, creating reliable income streams and sustainable cultivation practices.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures provides treated yam setts from disease-free mother tubers to ensure rapid sprouting and strong tuber development. Yams are essential for food security and market income. Our treated setts reduce rot, improve sprouting success, and increase yield predictability. We offer guidance on staking, fertilization, irrigation, and harvest timing to achieve premium tuber quality. Farmers adopting our treated setts gain higher establishment rates, better yields, and more reliable income. Healingroot supports growers with planting materials and agronomy advice to build sustainable yam production systems and long-term farm profitability.`
  }
];

// ---------------------- DOM Helper ----------------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function el(tag, attrs = {}, html=''){ const e = document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); e.innerHTML=html; return e; }

// ---------------------- AUTH MODULE ----------------------
const authModal = $('#auth-modal');
const signupForm = $('#signup-form');
const loginForm = $('#login-form');
const authMessage = $('#auth-message');
let currentUser = null;

function showView(id){
  $$('.view').forEach(v=>v.style.display='none');
  $('#'+id+'-view')?.style.display='block';
}
function showAuthModal(show){ authModal.style.display = show?'flex':'none'; }

signupForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  if(!name||!email||!password){ authMessage.textContent='Fill all fields'; return;}
  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,'users',cred.user.uid),{name,email,createdAt:serverTimestamp(),profilePic:'images/default_profile.png',bio:'',friends:[],notifications:[]});
    authMessage.textContent='Account created!';
  }catch(err){ authMessage.textContent=err.message; }
});

loginForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  try{ await signInWithEmailAndPassword(auth,email,password); }catch(err){ authMessage.textContent=err.message; }
});

$('#logout-btn')?.addEventListener('click', async ()=>{ await signOut(auth); });

// ---------------------- AUTH STATE ----------------------
onAuthStateChanged(auth, async user=>{
  currentUser=user;
  if(user){
    showAuthModal(false);
    $('#logout-btn').style.display='inline-block';
    if(user.uid===ADMIN_UID) $('#nav-admin').style.display='inline-block';
    await renderAll();
    showView('feed');
  }else{
    showAuthModal(true);
    $('#logout-btn').style.display='none';
    $('#nav-admin').style.display='none';
    showView('feed');
  }
});

// ---------------------- PRODUCTS & FEED ----------------------
async function renderProducts(){
  const container = $('#product-list');
  container.innerHTML='';
  products.forEach(p=>{
    const card = el('div',{class:'card product'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">₦${p.price}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
  $$('.order').forEach(btn=>btn.addEventListener('click', e=>{
    const name=e.currentTarget.dataset.name;
    const price=e.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`,'_blank');
  }));
  $$('.read-more').forEach(a=>a.addEventListener('click', e=>{
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const p = products.find(x=>x.id===id);
    alert(p.name+'\n\n'+p.description);
  }));
}

async function renderFeed(){
  const feed = $('#feed');
  feed.innerHTML='';
  // products as posts
  products.forEach(p=>{
    const card = el('div',{class:'card post'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₦${p.price}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more-feed">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    feed.appendChild(card);
  });
  $$('.order').forEach(btn=>btn.addEventListener('click', e=>{
    const name=e.currentTarget.dataset.name;
    const price=e.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`,'_blank');
  }));
  $$('.read-more-feed').forEach(a=>a.addEventListener('click', e=>{
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const p = products.find(x=>x.id===id);
    alert(p.name+'\n\n'+p.description);
  }));

  // user posts from Firestore
  const q = query(collection(db,'posts'),orderBy('timestamp','desc'));
  const snap = await getDocs(q);
  snap.forEach(docSnap=>{
    const post = docSnap.data();
    const card = el('div',{class:'card post'});
    card.innerHTML=`
      <img src="${post.image||'images/default_profile.png'}" alt="">
      <h3>${post.name||'User'}</h3>
      <p>${post.text}</p>
      <p class="muted">by ${post.email||'user'}</p>
    `;
    if(currentUser && (currentUser.uid===post.uid || currentUser.uid===ADMIN_UID)){
      const del = el('button', {class:'btn'}, 'Delete');
      del.style.background='crimson';
      del.addEventListener('click', async ()=>{
        await deleteDoc(doc(db,'posts',docSnap.id));
        alert('Deleted');
        renderFeed();
      });
      card.appendChild(del);
    }
    feed.appendChild(card);
  });
}

// ---------------------- CREATE POST ----------------------
$('#post-btn')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in'); return; }
  const text = $('#post-text').value.trim();
  const file = $('#post-image').files[0];
  let imageUrl = '';
  if(file){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    try{
      const res = await fetch(CLOUDINARY_URL,{method:'POST',body:fd});
      const data = await res.json();
      imageUrl = data.secure_url;
    }catch(err){ console.error(err); alert('Image upload failed'); return; }
  }
  await addDoc(collection(db,'posts'),{
    uid:currentUser.uid,
    name:currentUser.displayName||'',
    email:currentUser.email,
    text,
    image:imageUrl,
    timestamp:serverTimestamp()
  });
  $('#post-text').value=''; $('#post-image').value='';
  alert('Posted!');
  renderFeed();
});

// ---------------------- PROFILE ----------------------
$('#save-profile-pic')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in'); return; }
  const file = $('#profile-upload').files[0];
  if(!file){ alert('Choose file'); return; }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  try{
    const res = await fetch(CLOUDINARY_URL,{method:'POST',body:fd});
    const data = await res.json();
    await setDoc(doc(db,'users',currentUser.uid),{profilePic:data.secure_url},{merge:true});
    $('#profile-pic').src=data.secure_url;
    alert('Saved!');
  }catch(err){ console.error(err); alert('Upload failed'); }
});

$('#save-bio')?.addEventListener('click', async ()=>{
  if(!currentUser) return alert('Sign in');
  const bio = $('#bio').value.trim();
  await setDoc(doc(db,'users',currentUser.uid),{bio},{merge:true});
  alert('Bio saved');
});

// ---------------------- FRIENDS & CHAT ----------------------
// Friend requests
async function renderFriends(){
  const container = $('#friends');
  container.innerHTML='';
  const snap = await getDocs(collection(db,'users'));
  snap.forEach(d=>{
    if(d.id===currentUser.uid) return;
    const u=d.data();
    const card = el('div',{class:'card friend'}, `<h4>${u.name||u.email}</h4><p class="muted">${u.email||''}</p>`);
    const btn = el('button',{},'Add Friend'); btn.className='btn';
    btn.addEventListener('click', async ()=>{
      await addDoc(collection(db,'friendRequests'),{from:currentUser.uid,to:d.id,status:'pending',createdAt:serverTimestamp()});
      alert('Friend request sent');
    });
    card.appendChild(btn);
    container.appendChild(card);
  });
}

// Chat friends
async function renderChatFriends(){
  const c = $('#friends-chat-list'); c.innerHTML='';
  const snap = await getDocs(collection(db,'friends'));
  snap.forEach(d=>{
    const fr=d.data();
    if(fr.uids.includes(currentUser.uid)){
      const other = fr.uids.find(id=>id!==currentUser.uid);
      const card = el('div',{class:'card friend'}, `<h4>Friend</h4>`);
      const chatBtn = el('button',{},'Open Chat'); chatBtn.className='btn';
      chatBtn.addEventListener('click', ()=> openChat(other));
      card.appendChild(chatBtn); c.appendChild(card);
    }
  });
}

// chat logic
let activeChatWith=null;
function openChat(uid){
  activeChatWith=uid; $('#chat-window').style.display='block';
  $('#chat-with').textContent='Chat: '+uid; loadMessages(uid);
}
$('#send-chat')?.addEventListener('click', async ()=>{
  if(!currentUser||!activeChatWith) return alert('Select friend');
  const msg = $('#chat-input').value.trim(); if(!msg) return;
  await addDoc(collection(db,'chats'),{from:currentUser.uid,to:activeChatWith,text:msg,timestamp:serverTimestamp()});
  $('#chat-input').value=''; loadMessages(activeChatWith);
});
async function loadMessages(uid){
  $('#messages').innerHTML='';
  const snap = await getDocs(collection(db,'chats'));
  snap.forEach(d=>{
    const m=d.data();
    if((m.from===currentUser.uid && m.to===uid)||(m.to===currentUser.uid && m.from===uid)){
      const div=el('div',{},`<strong>${m.from===currentUser.uid?'You':'Friend'}:</strong> ${m.text}`);
      $('#messages').appendChild(div);
    }
  });
}

// ---------------------- NOTIFICATIONS ----------------------
async function renderNotifications(){
  const n = $('#notifications'); n.innerHTML='';
  const udoc = await getDoc(doc(db,'users',currentUser.uid));
  if(udoc.exists()){
    const data=udoc.data();
    (data.notifications||[]).forEach(note=>{
      const div = el('div', {class:'notification'}, note);
      n.appendChild(div);
    });
  }
}

// ---------------------- ADMIN ----------------------
async function renderAdmin(){
  if(!currentUser||currentUser.uid!==ADMIN_UID) return;
  $('#admin-view').style.display='block';
  const usersContainer = $('#admin-users'); usersContainer.innerHTML='';
  const usnap = await getDocs(collection(db,'users'));
  usnap.forEach(d=>{
    const u = d.data();
    const card = el('div',{class:'card user'}, `<h4>${u.name||u.email}</h4><p>${d.id}</p>`);
    usersContainer.appendChild(card);
  });
  const postsContainer = $('#admin-posts'); postsContainer.innerHTML='';
  const psnap = await getDocs(collection(db,'posts'));
  psnap.forEach(async docSnap=>{
    const p = docSnap.data();
    const card = el('div',{class:'card post'});
    card.innerHTML=`<h4>${p.name||p.email}</h4><p>${p.text}</p>`;
    const del = el('button',{class:'btn'},'Delete'); del.style.background='crimson';
    del.addEventListener('click', async ()=>{
      await deleteDoc(doc(db,'posts',docSnap.id));
      alert('Deleted'); renderAdmin();
    });
    card.appendChild(del); postsContainer.appendChild(card);
  });
}

// ---------------------- NAVIGATION ----------------------
$('#nav-feed')?.addEventListener('click', ()=>showView('feed'));
$('#nav-products')?.addEventListener('click', ()=>showView('products'));
$('#nav-profile')?.addEventListener('click', ()=>showView('profile'));
$('#nav-chat')?.addEventListener('click', ()=>showView('chat'));
$('#nav-admin')?.addEventListener('click', ()=>showView('admin'));

// ---------------------- RENDER ALL ----------------------
async function renderAll(){
  await renderProducts(); await renderFeed();
  if(currentUser){
    const udoc = await getDoc(doc(db,'users',currentUser.uid));
    if(udoc.exists()){ const data=udoc.data(); if(data.profilePic) $('#profile-pic').src=data.profilePic; if(data.bio) $('#bio').value=data.bio; }
    renderFriends(); renderChatFriends(); renderNotifications(); renderAdmin();
  }
}

// initial render
document.addEventListener('DOMContentLoaded', ()=>{ renderAll(); });
