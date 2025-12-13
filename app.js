// app.js (module)
// IMPORTANT: Save this file as app.js in the same folder as index.html and style.css

// Firebase modules (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Cloudinary config
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
    description: `Healingroot AGRO ventures stands as a trusted name in quality crop seedlings across Nigeria. ... [full description from your previous message]`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Hybrid plantain suckers supplied by Healingroot AGRO Ventures are selected for their early maturity, disease tolerance, and consistent bunch size. ... [full description from your previous message]`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `The Hybrid Dwarf Banana offered by Healingroot AGRO Ventures is tailored for farmers who want fast returns and ease of management. ... [full description from your previous message]`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera oil palm seedlings from Healingroot AGRO Ventures are a long-term agricultural investment. ... [full description from your previous message]`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures supplies quality coconut seedlings chosen for high survival and productive potential. ... [full description from your previous message]`
  },
  {
    id: "giant_cocoa",
    name: "Hybrid Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures supplies high-quality giant cocoa seedlings for reliable cocoa production. ... [full description from your previous message]`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Premium pineapple seedlings from Healingroot AGRO Ventures deliver uniform, sweet fruits with strong resistance to common pests. ... [full description from your previous message]`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 700,
    description: `Healingroot AGRO Ventures supplies treated yam setts selected from high-yielding, disease-free mother tubers to ensure rapid sprouting and strong tuber development. ... [full description from your previous message]`
  }
];

// ---------------------- DOM Helpers ----------------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function el(tag, attrs = {}, html='') { const e = document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); e.innerHTML=html; return e; }

// ---------------------- AUTH ----------------------
let currentUser = null;
const authModal = $('#auth-modal');
const authMessage = $('#auth-message');
const navAdmin = $('#nav-admin');

function showView(id){
  $$('.view').forEach(v=>v.style.display='none');
  const view = $('#'+id+'-view');
  if(view) view.style.display='block';
}
function showAuthModal(show){ authModal.style.display = show ? 'flex':'none'; }

// ---------------------- AUTH EVENTS ----------------------
$('#signup-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent = '';
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  if(!name||!email||!password){ authMessage.textContent='Fill all fields'; return; }
  try {
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,'users',cred.user.uid), { name, email, createdAt: serverTimestamp() });
    authMessage.textContent='Account created — signed in';
  } catch(err){ authMessage.textContent=err.message; }
});

$('#login-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent = '';
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  try { await signInWithEmailAndPassword(auth,email,password); }
  catch(err){ authMessage.textContent = err.message; }
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
    navAdmin.style.display=(user.uid===ADMIN_UID)?'inline-block':'none';
    $('#nav-feed').click();
    await renderAll();
  } else {
    showAuthModal(true);
    $('#logout-btn').style.display='none';
    navAdmin.style.display='none';
    showView('feed');
  }
});

// ---------------------- PRODUCTS ----------------------
async function renderProducts(){
  const container = $('#product-list'); container.innerHTML='';
  products.forEach(p=>{
    const card = el('div',{class:'card product'}, `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
  $$('.order').forEach(btn=>btn.addEventListener('click', ev=>{
    const name=ev.currentTarget.dataset.name, price=ev.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`,'_blank');
  }));
  $$('.read-more').forEach(a=>a.addEventListener('click', e=>{
    e.preventDefault();
    const id=a.dataset.id;
    const p=products.find(x=>x.id===id);
    alert(p.name+"\n\n"+p.description);
  }));
}

// ---------------------- FEED ----------------------
async function renderFeed(){
  const feed = $('#feed'); feed.innerHTML='';
  // product posts
  products.forEach(p=>{
    const card = el('div',{class:'card post'}, `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more-prod">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
      <div class="likes"><span class="like-count">0</span> Likes <button class="like-btn btn small">Like</button></div>
      <div class="comments"></div>
      <input class="comment-input" placeholder="Comment..."><button class="comment-btn btn small">Comment</button>
    `);
    feed.appendChild(card);
  });

  // user posts from Firestore
  const postsRef = collection(db,'posts');
  onSnapshot(query(postsRef, orderBy('timestamp','desc')), snap=>{
    feed.innerHTML=''; // clear first to refresh
    // render products again
    products.forEach(p=>{
      const card = el('div',{class:'card post'}, `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
        <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more-prod">Read more</a></p>
        <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
        <div class="likes"><span class="like-count">0</span> Likes <button class="like-btn btn small">Like</button></div>
        <div class="comments"></div>
        <input class="comment-input" placeholder="Comment..."><button class="comment-btn btn small">Comment</button>
      `);
      feed.appendChild(card);
    });

    snap.forEach(docSnap=>{
      const post = docSnap.data();
      const card = el('div',{class:'card post'});
      card.innerHTML = `
        <img src="${post.image||'images/default_profile.png'}">
        <h3>${post.name||'User'}</h3>
        <p>${post.text}</p>
        <p class="muted">by ${post.email||'user'}</p>
        <div class="likes"><span class="like-count">0</span> Likes <button class="like-btn btn small">Like</button></div>
        <div class="comments"></div>
        <input class="comment-input" placeholder="Comment..."><button class="comment-btn btn small">Comment</button>
      `;
      // append delete button for owner/admin
      if(currentUser && (currentUser.uid===post.uid || currentUser.uid===ADMIN_UID)){
        const del = el('button',{class:'btn'},'Delete');
        del.style.background='crimson';
        del.addEventListener('click', async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); alert('Post deleted'); });
        card.appendChild(del);
      }
      feed.appendChild(card);
    });
  });

  // order buttons
  $$('.order').forEach(btn=>btn.addEventListener('click', ev=>{
    const name=ev.currentTarget.dataset.name, price=ev.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`,'_blank');
  }));

  // read more buttons
  $$('.read-more-prod').forEach(a=>a.addEventListener('click', e=>{
    e.preventDefault();
    const id=a.dataset.id;
    const p=products.find(x=>x.id===id);
    alert(p.name+"\n\n"+p.description);
  }));
}

// ---------------------- CREATE POST ----------------------
$('#post-btn')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in first'); return; }
  const text = $('#post-text').value.trim();
  const file = $('#post-image').files[0];
  let imageUrl = '';
  if(file){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    try { const res = await fetch(CLOUDINARY_URL,{method:'POST',body:fd}); const data=await res.json(); imageUrl=data.secure_url; } catch(err){ alert('Upload failed'); return; }
  }
  await addDoc(collection(db,'posts'), {
    uid: currentUser.uid,
    email: currentUser.email,
    name: currentUser.displayName||'',
    text,
    image: imageUrl,
    timestamp: serverTimestamp()
  });
  $('#post-text').value=''; $('#post-image').value='';
});

// ---------------------- PROFILE ----------------------
$('#save-profile-pic')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in'); return; }
  const file = $('#profile-upload').files[0];
  if(!file){ alert('Choose file'); return; }
  const fd = new FormData(); fd.append('file',file); fd.append('upload_preset',UPLOAD_PRESET);
  try { const res = await fetch(CLOUDINARY_URL,{method:'POST',body:fd}); const data = await res.json(); const url = data.secure_url;
    await setDoc(doc(db,'users',currentUser.uid),{ profilePic:url, email:currentUser.email, name:currentUser.displayName||''},{merge:true});
    $('#profile-pic').src=url;
    alert('Profile picture saved');
  } catch(err){ alert('Upload failed'); }
});

$('#save-bio')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in'); return; }
  const bio = $('#bio').value.trim();
  await setDoc(doc(db,'users',currentUser.uid),{bio},{merge:true});
  alert('Bio saved');
});

// ---------------------- FRIENDS & CHAT ----------------------
async function renderFriends(){
  const container = $('#friends'); container.innerHTML='';
  const snap = await getDocs(collection(db,'users'));
  snap.forEach(d=>{
    const u=d.data(); if(d.id===currentUser.uid) return;
    const card = el('div',{class:'card friend'},`<h4>${u.name||u.email}</h4><p class="muted">${u.email||''}</p>`);
    const btn = el('button',{},'Add Friend'); btn.className='btn';
    btn.addEventListener('click', async ()=>{ await addDoc(collection(db,'friendRequests'),{from:currentUser.uid,to:d.id,status:'pending',createdAt:serverTimestamp()}); alert('Friend request sent'); });
    card.appendChild(btn); container.appendChild(card);
  });
}

async function renderChatFriends(){
  const c = $('#friends-chat-list'); c.innerHTML='';
  const snap = await getDocs(collection(db,'friends'));
  snap.forEach(d=>{
    const fr=d.data(); if(fr.uids && fr.uids.includes(currentUser.uid)){
      const other = fr.uids.find(id=>id!==currentUser.uid);
      const card = el('div',{class:'card friend'},`<h4>Friend</h4>`);
      const chatBtn = el('button',{},'Open Chat'); chatBtn.className='btn';
      chatBtn.addEventListener('click',()=>openChat(other));
      card.appendChild(chatBtn); c.appendChild(card);
    }
  });
}

let activeChatWith = null;
function openChat(uid){ activeChatWith = uid; $('#chat-window').style.display='block'; $('#chat-with').textContent='Chat: '+uid; loadMessages(uid); }
$('#send-chat')?.addEventListener('click', async ()=>{
  if(!currentUser||!activeChatWith) return alert('Select friend');
  const msg = $('#chat-input').value.trim(); if(!msg) return;
  await addDoc(collection(db,'chats'),{from:currentUser.uid,to:activeChatWith,text:msg,timestamp:serverTimestamp()});
  $('#chat-input').value=''; loadMessages(activeChatWith);
});

async function loadMessages(uid){
  $('#messages').innerHTML='';
  const q = query(collection(db,'chats'), where('from','in',[currentUser.uid,uid]));
  const snap = await getDocs(q);
  snap.forEach(d=>{
    const m=d.data();
    const div = el('div',{},`<strong>${m.from===currentUser.uid?'You':'Friend'}:</strong> ${m.text}`);
    $('#messages').appendChild(div);
  });
}

// ---------------------- ADMIN ----------------------
async function renderAdmin(){
  if(!currentUser || currentUser.uid!==ADMIN_UID) return;
  $('#admin-view').style.display='block';
  const usersContainer = $('#admin-users'); usersContainer.innerHTML='';
  const usnap = await getDocs(collection(db,'users'));
  usnap.forEach(d=>{ const u=d.data(); usersContainer.appendChild(el('div',{class:'card user'},`<h4>${u.name||u.email}</h4><p>${d.id}</p>`)); });
  const postsContainer = $('#admin-posts'); postsContainer.innerHTML='';
  const psnap = await getDocs(collection(db,'posts'));
  psnap.forEach(docSnap=>{ const p=docSnap.data(); 
    const card = el('div',{class:'card post'},`<h4>${p.name||p.email}</h4><p>${p.text}</p>`); 
    const del = el('button',{class:'btn'},'Delete'); del.style.background='crimson'; 
    del.addEventListener('click', async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); alert('Deleted'); renderAdmin(); }); 
    card.appendChild(del); postsContainer.appendChild(card); 
  });
}

// ---------------------- NAV ----------------------
$('#nav-feed').addEventListener('click', ()=>showView('feed'));
$('#nav-products').addEventListener('click', ()=>showView('products'));
$('#nav-profile').addEventListener('click', ()=>{ showView('profile'); renderFriends(); });
$('#nav-chat').addEventListener('click', ()=>{ showView('chat'); renderChatFriends(); });
$('#nav-admin').addEventListener('click', ()=>{ showView('admin'); renderAdmin(); });

// ---------------------- INITIAL RENDER ----------------------
async function renderAll(){ renderProducts(); renderFeed(); }
