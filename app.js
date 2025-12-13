// app.js (stable production-ready)
// Firebase ESM
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Cloudinary
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

// ---------------------- DOM HELPERS ----------------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const el = (tag, attrs = {}, html = '') => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=> e.setAttribute(k,v));
  e.innerHTML = html;
  return e;
};

// ---------------------- AUTH ----------------------
let currentUser = null;
const authModal = $('#auth-modal');
const navAdmin = $('#nav-admin');

function showView(id){
  $$('.view').forEach(v => v.style.display='none');
  const v = $('#'+id+'-view');
  if(v) v.style.display='block';
}

function showAuthModal(show){
  if(authModal) authModal.style.display = show ? 'flex' : 'none';
}

// ---------------------- AUTH ACTIONS ----------------------
$('#signup-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  if(!name || !email || !password){ $('#auth-message').textContent='Fill all fields'; return; }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db,'users',cred.user.uid), { name, email, createdAt: serverTimestamp() });
    $('#auth-message').textContent='Account created';
  } catch(err){ $('#auth-message').textContent=err.message; }
});

$('#login-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  try { await signInWithEmailAndPassword(auth,email,password); } 
  catch(err){ $('#auth-message').textContent=err.message; }
});

$('#logout-btn')?.addEventListener('click', async ()=>{
  await signOut(auth);
});

// ---------------------- AUTH STATE ----------------------
onAuthStateChanged(auth, async user=>{
  currentUser = user;
  if(user){
    showAuthModal(false);
    $('#logout-btn').style.display='inline-block';
    navAdmin.style.display = (user.uid===ADMIN_UID)? 'inline-block':'none';
    await renderAll();
    showView('feed');
  } else {
    showAuthModal(true);
    $('#logout-btn').style.display='none';
    navAdmin.style.display='none';
    showView('feed');
  }
});

// ---------------------- PRODUCTS ----------------------
const products = [ /* same product objects as before */ ];

async function renderProducts(){
  const container = $('#product-list');
  container.innerHTML='';
  products.forEach(p=>{
    const card = el('div',{class:'card product'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
  attachProductHandlers();
}

function attachProductHandlers(){
  $$('.order').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const {name, price} = e.currentTarget.dataset;
      const url = `https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`;
      window.open(url,'_blank');
    });
  });
  $$('.read-more').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const id = a.dataset.id;
      const p = products.find(x=>x.id===id);
      alert(p.name+'\n\n'+p.description);
    });
  });
}

// ---------------------- FEED ----------------------
async function renderFeed(){
  const feed = $('#feed');
  feed.innerHTML='';

  // Products first
  products.forEach(p=>{
    const card = el('div',{class:'card post'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more-prod">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    feed.appendChild(card);
  });

  // User posts
  try {
    const snap = await getDocs(query(collection(db,'posts'), orderBy('timestamp','desc')));
    snap.forEach(docSnap=>{
      const post = docSnap.data();
      const card = el('div',{class:'card post'},`
        <img src="${post.image||'images/default_profile.png'}" alt="">
        <h3>${post.name||'User'}</h3>
        <p>${post.text}</p>
        <p class="muted">by ${post.email||'user'}</p>
      `);
      if(currentUser && (currentUser.uid===post.uid || currentUser.uid===ADMIN_UID)){
        const del = el('button',{class:'btn'},'Delete');
        del.style.background='crimson';
        del.addEventListener('click', async ()=>{
          await deleteDoc(doc(db,'posts',docSnap.id));
          renderFeed();
        });
        card.appendChild(del);
      }
      feed.appendChild(card);
    });
  } catch(err){ console.error('Feed error',err); }

  attachProductHandlers();
  $$('.read-more-prod').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const p = products.find(x=>x.id===a.dataset.id);
      alert(p.name+'\n\n'+p.description);
    });
  });
}

// ---------------------- POST ----------------------
$('#post-btn')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in first'); return; }
  const text = $('#post-text').value.trim();
  const file = $('#post-image').files[0];
  let imageUrl = '';
  if(file){
    const fd = new FormData();
    fd.append('file',file);
    fd.append('upload_preset',UPLOAD_PRESET);
    try {
      const res = await fetch(CLOUDINARY_URL,{method:'POST', body:fd});
      const data = await res.json();
      imageUrl = data.secure_url;
    } catch(err){ alert('Image upload failed'); return; }
  }
  await addDoc(collection(db,'posts'), { uid:currentUser.uid, email:currentUser.email, name:currentUser.displayName||'', text, image:imageUrl, timestamp:serverTimestamp() });
  $('#post-text').value=''; $('#post-image').value='';
  renderFeed();
});

// ---------------------- PROFILE ----------------------
$('#save-profile-pic')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in'); return; }
  const file = $('#profile-upload').files[0]; if(!file){ alert('Choose file'); return; }
  const fd = new FormData();
  fd.append('file',file); fd.append('upload_preset',UPLOAD_PRESET);
  try {
    const res = await fetch(CLOUDINARY_URL,{method:'POST', body:fd});
    const data = await res.json();
    const url = data.secure_url;
    await setDoc(doc(db,'users',currentUser.uid),{ profilePic:url }, {merge:true});
    $('#profile-pic').src=url;
    alert('Profile saved');
  } catch(err){ console.error(err); alert('Upload failed'); }
});

$('#save-bio')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in'); return; }
  const bio = $('#bio').value.trim();
  await setDoc(doc(db,'users',currentUser.uid),{ bio }, {merge:true});
  alert('Bio saved');
});

// ---------------------- FRIENDS ----------------------
async function renderFriends(){
  const container = $('#friends'); container.innerHTML='';
  const snap = await getDocs(collection(db,'users'));
  snap.forEach(d=>{
    if(d.id===currentUser.uid) return;
    const u = d.data();
    const card = el('div',{class:'card friend'},`<h4>${u.name||u.email}</h4><p>${u.email||''}</p>`);
    const btn = el('button',{},'Add Friend'); btn.className='btn';
    btn.addEventListener('click', async ()=>{
      await addDoc(collection(db,'friendRequests'),{ from:currentUser.uid, to:d.id, status:'pending', createdAt:serverTimestamp() });
      alert('Friend request sent');
    });
    card.appendChild(btn); container.appendChild(card);
  });
}

// ---------------------- CHAT ----------------------
let activeChatWith=null;
function openChat(uid){
  activeChatWith = uid; $('#chat-window').style.display='block'; $('#chat-with').textContent='Chat: '+uid;
  loadMessages(uid);
}

$('#send-chat')?.addEventListener('click', async ()=>{
  if(!currentUser||!activeChatWith) return;
  const msg = $('#chat-input').value.trim(); if(!msg) return;
  await addDoc(collection(db,'chats'),{ from:currentUser.uid, to:activeChatWith, text:msg, timestamp:serverTimestamp() });
  $('#chat-input').value=''; loadMessages(activeChatWith);
});

async function loadMessages(uid){
  $('#messages').innerHTML='';
  const snap = await getDocs(collection(db,'chats'));
  snap.forEach(d=>{
    const m = d.data();
    if((m.from===currentUser.uid && m.to===uid) || (m.from===uid && m.to===currentUser.uid)){
      const div = el('div',{},`<strong>${m.from===currentUser.uid?'You':'Friend'}:</strong> ${m.text}`);
      $('#messages').appendChild(div);
    }
  });
}

// ---------------------- ADMIN ----------------------
async function renderAdmin(){
  if(!currentUser || currentUser.uid!==ADMIN_UID) return;
  $('#admin-view').style.display='block';

  const usersContainer = $('#admin-users'); usersContainer.innerHTML='';
  const usnap = await getDocs(collection(db,'users'));
  usnap.forEach(d=>{
    const u=d.data();
    const card=el('div',{class:'card user'},`<h4>${u.name||u.email}</h4><p>${d.id}</p>`);
    usersContainer.appendChild(card);
  });

  const postsContainer = $('#admin-posts'); postsContainer.innerHTML='';
  const psnap = await getDocs(collection(db,'posts'));
  psnap.forEach(docSnap=>{
    const p=docSnap.data();
    const card=el('div',{class:'card post'},`<h4>${p.name||p.email}</h4><p>${p.text}</p>`);
    const del=el('button',{class:'btn'},'Delete'); del.style.background='crimson';
    del.addEventListener('click', async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); renderAdmin(); });
    card.appendChild(del); postsContainer.appendChild(card);
  });
}

// ---------------------- NAV ----------------------
$('#nav-feed')?.addEventListener('click',()=>showView('feed'));
$('#nav-products')?.addEventListener('click',()=>showView('products'));
$('#nav-profile')?.addEventListener('click',()=>showView('profile'));
$('#nav-chat')?.addEventListener('click',()=>showView('chat'));
$('#nav-admin')?.addEventListener('click',()=>showView('admin'));

// ---------------------- RENDER ALL ----------------------
async function renderAll(){
  await renderProducts();
  await renderFeed();
  if(currentUser){
    const udoc = await getDoc(doc(db,'users',currentUser.uid));
    if(udoc.exists()){
      const data=udoc.data();
      if(data.profilePic) $('#profile-pic').src=data.profilePic;
      if(data.bio) $('#bio').value=data.bio;
    }
    await renderFriends();
    await renderAdmin();
  }
}

// ---------------------- STARTUP ----------------------
document.addEventListener('DOMContentLoaded', ()=>{
  showView('feed');
});
