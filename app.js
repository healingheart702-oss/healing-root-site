// app.js (module)
// Save as app.js in same folder as index.html and style.css

// Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, 
  onAuthStateChanged, updateProfile 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, doc, setDoc, addDoc, getDocs, onSnapshot, 
  query, where, orderBy, serverTimestamp, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

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
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// ---------------------- DOM Helpers ----------------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function el(tag, attrs = {}, html=''){ const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); e.innerHTML=html; return e; }

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

$('#signup-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent = '';
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  if(!name||!email||!password){ authMessage.textContent='Fill all fields'; return; }
  try {
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await updateProfile(cred.user,{displayName:name});
    await setDoc(doc(db,'users',cred.user.uid),{name,email,createdAt:serverTimestamp()});
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
    renderNotifications();
  } else {
    showAuthModal(true);
    $('#logout-btn').style.display='none';
    navAdmin.style.display='none';
    showView('feed');
  }
});

// ---------------------- PRODUCTS ----------------------
const products = [
  {id:"cassava",name:"Cassava Stems (TME419)",image:"images/cassava.JPG",price:1000,description:`Healing Root Agro Ventures provides TME419 cassava stems, carefully selected for disease resistance, high yield, and excellent starch content.`},
  {id:"plantain",name:"Hybrid Plantain Suckers",image:"images/plantain.JPG",price:500,description:`Our hybrid plantain suckers are chosen for early maturity, high disease tolerance, and consistent bunch formation.`},
  {id:"banana",name:"Hybrid Dwarf Banana",image:"images/giant_banana.JPG",price:500,description:`The Hybrid Dwarf Banana is optimized for fast returns, easy maintenance, and compact plantation layouts.`},
  {id:"oilpalm",name:"Tenera Oil Palm Seedlings",image:"images/oilpalm.JPG",price:1000,description:`Tenera oil palm seedlings are a long-term agricultural investment, carefully raised for strong root development and high oil yield.`},
  {id:"coconut",name:"Hybrid Dwarf Coconut Seedlings",image:"images/coconut.JPG",price:4500,description:`Premium hybrid dwarf coconut seedlings that thrive under various soil and climate conditions.`},
  {id:"giant_cocoa",name:"Hybrid Giant Cocoa Seedlings",image:"images/giant_cocoa.JPG",price:500,description:`Hybrid giant cocoa seedlings nurtured for strong roots, disease resistance, and vigorous growth.`},
  {id:"pineapple",name:"Pineapple Seedlings",image:"images/pineapple.JPG",price:400,description:`Pineapple seedlings carefully selected for sweetness, uniform size, and pest resistance.`},
  {id:"yam",name:"Treated Yam Setts",image:"images/Yamsett.JPG",price:700,description:`Treated yam setts sourced from disease-free, high-yielding tubers, ensuring healthy growth and strong tubers.`}
];

async function renderProducts(){
  const container = $('#product-list'); container.innerHTML='';
  products.forEach(p=>{
    const card = el('div',{class:'card product'}, `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description}</p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
  $$('.order').forEach(btn=>btn.addEventListener('click', ev=>{
    const name=ev.currentTarget.dataset.name, price=ev.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`,'_blank');
  }));
}

// ---------------------- FEED ----------------------
async function renderFeed(){
  const feed = $('#feed'); feed.innerHTML='';
  const postsRef = collection(db,'posts');
  onSnapshot(query(postsRef, orderBy('timestamp','desc')), snap=>{
    feed.innerHTML='';
    snap.forEach(docSnap=>{
      const post = docSnap.data();
      const card = el('div',{class:'card post'});
      card.innerHTML = `
        <img src="${post.image||'images/default_profile.png'}" class="feed-profile" data-uid="${post.uid}">
        <h3 class="feed-name" data-uid="${post.uid}">${post.name||'User'}</h3>
        <p>${post.text}</p>
        <p class="muted">by ${post.email||'user'}</p>
        <div class="likes"><span class="like-count">${post.likes?.length||0}</span> Likes <button class="like-btn btn small">Like</button></div>
        <div class="comments"></div>
        <input class="comment-input" placeholder="Comment..."><button class="comment-btn btn small">Comment</button>
      `;
      if(currentUser && (currentUser.uid===post.uid || currentUser.uid===ADMIN_UID)){
        const del = el('button',{class:'btn'},'Delete'); del.style.background='crimson';
        del.addEventListener('click', async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); alert('Post deleted'); });
        card.appendChild(del);
      }
      feed.appendChild(card);

      // Clickable profile
      card.querySelectorAll('.feed-profile, .feed-name').forEach(elm=>{
        elm.addEventListener('click',()=>openProfile(post.uid));
      });

      // like
      card.querySelector('.like-btn')?.addEventListener('click', async ()=>{
        const likes = post.likes || [];
        if(!likes.includes(currentUser.uid)) likes.push(currentUser.uid);
        await updateDoc(doc(db,'posts',docSnap.id),{likes});
        if(post.uid) await addDoc(collection(db,'notifications'),{userId:post.uid,type:'like',fromName:currentUser.displayName||currentUser.email,message:'liked your post',read:false,timestamp:serverTimestamp()});
      });

      // comment
      card.querySelector('.comment-btn')?.addEventListener('click', async ()=>{
        const input = card.querySelector('.comment-input');
        const text = input.value.trim(); if(!text) return;
        const comment = {uid:currentUser.uid,name:currentUser.displayName||currentUser.email,text,timestamp:serverTimestamp()};
        const comments = post.comments||[];
        comments.push(comment);
        await updateDoc(doc(db,'posts',docSnap.id),{comments});
        if(post.uid) await addDoc(collection(db,'notifications'),{userId:post.uid,type:'comment',fromName:currentUser.displayName||currentUser.email,message:'commented on your post',read:false,timestamp:serverTimestamp()});
        input.value='';
      });
    });
  });
}

// ---------------------- PROFILE ----------------------
// Open user profile (self or other)
async function openProfile(uid){
  showView('profile');
  const profileCard = $('#profile-view'); profileCard.innerHTML='';
  const userSnap = await getDocs(collection(db,'users'));
  let userData = null;
  userSnap.forEach(doc=>{ if(doc.id===uid) userData=doc.data(); });
  if(!userData) return alert('User not found');

  // Profile HTML
  profileCard.innerHTML = `
    <div class="profile-cover">
      <img id="cover-photo" src="${userData.coverPhoto||'images/default_cover.jpg'}" alt="Cover">
    </div>
    <div class="profile-main">
      <img id="profile-pic" src="${userData.profilePic||'images/default_profile.png'}" alt="Profile Pic" class="profile-pic">
      <h2>${userData.name||userData.email}</h2>
      <p>${userData.email}</p>
      <p>${userData.bio||''}</p>
      <div id="profile-actions"></div>
    </div>
    <h3>Posts</h3>
    <div id="profile-posts" class="grid"></div>
  `;

  const actionsDiv = $('#profile-actions');
  if(uid!==currentUser.uid){
    const chatBtn = el('button',{},'Chat'); chatBtn.className='btn';
    chatBtn.addEventListener('click',()=>openChat(uid,userData.name));
    actionsDiv.appendChild(chatBtn);

    const frBtn = el('button',{},'Add Friend'); frBtn.className='btn';
    frBtn.addEventListener('click', async ()=>{
      await addDoc(collection(db,'friendRequests'),{from:currentUser.uid,to:uid,status:'pending',createdAt:serverTimestamp()});
      await addDoc(collection(db,'notifications'),{userId:uid,type:'friendRequest',fromName:currentUser.displayName||currentUser.email,message:'sent you a friend request',read:false,timestamp:serverTimestamp()});
      alert('Friend request sent');
    });
    actionsDiv.appendChild(frBtn);
  }

  // Render user posts
  const postsRef = collection(db,'posts');
  onSnapshot(query(postsRef, where('uid','==',uid), orderBy('timestamp','desc')), snap=>{
    const postsDiv = $('#profile-posts'); postsDiv.innerHTML='';
    snap.forEach(docSnap=>{
      const post = docSnap.data();
      const card = el('div',{class:'card post'},`
        <img src="${post.image||userData.profilePic||'images/default_profile.png'}">
        <p>${post.text}</p>
        <div class="likes"><span class="like-count">${post.likes?.length||0}</span> Likes <button class="like-btn btn small">Like</button></div>
        <div class="comments"></div>
      `);
      postsDiv.appendChild(card);

      // like
      card.querySelector('.like-btn')?.addEventListener('click', async ()=>{
        const likes = post.likes||[];
        if(!likes.includes(currentUser.uid)) likes.push(currentUser.uid);
        await updateDoc(doc(db,'posts',docSnap.id),{likes});
        if(post.uid) await addDoc(collection(db,'notifications'),{userId:post.uid,type:'like',fromName:currentUser.displayName||currentUser.email,message:'liked your post',read:false,timestamp:serverTimestamp()});
      });
    });
  });
}

// ---------------------- FRIENDS ----------------------
async function renderFriends(){
  const container = $('#friends'); container.innerHTML='';
  const snap = await getDocs(collection(db,'users'));
  snap.forEach(d=>{
    const u=d.data(); if(d.id===currentUser.uid) return;
    const card = el('div',{class:'card friend'},`<h4>${u.name||u.email}</h4><p class="muted">${u.email||''}</p>`);
    const btn = el('button',{},'Add Friend'); btn.className='btn';
    btn.addEventListener('click', async ()=>{
      await addDoc(collection(db,'friendRequests'),{from:currentUser.uid,to:d.id,status:'pending',createdAt:serverTimestamp()});
      await addDoc(collection(db,'notifications'),{userId:d.id,type:'friendRequest',fromName:currentUser.displayName||currentUser.email,message:'sent you a friend request',read:false,timestamp:serverTimestamp()});
      alert('Friend request sent');
    });
    card.appendChild(btn); container.appendChild(card);
  });
}

// ---------------------- NOTIFICATIONS ----------------------
async function renderNotifications(){
  const container = $('#notifications'); if(!currentUser) return;
  const q = query(collection(db,'notifications'),where('userId','==',currentUser.uid),orderBy('timestamp','desc'));
  onSnapshot(q,snap=>{
    container.innerHTML='';
    snap.forEach(docSnap=>{
      const n = docSnap.data();
      const div = el('div',{class:'notification'},`<strong>${n.fromName}</strong> ${n.message}`);
      container.appendChild(div);
    });
  });
}

// ---------------------- CHAT ----------------------
let activeChatWith = null;
function openChat(uid,name){
  activeChatWith=uid; $('#chat-window').style.display='block'; $('#chat-with').textContent='Chat with '+name;
  loadMessages(uid);
}
$('#send-chat')?.addEventListener('click', async ()=>{
  if(!currentUser||!activeChatWith) return alert('Select friend'); 
  const msg = $('#chat-input').value.trim(); if(!msg) return;
  await addDoc(collection(db,'chats'),{from:currentUser.uid,to:activeChatWith,participants:[currentUser.uid,activeChatWith],text:msg,timestamp:serverTimestamp()});
  $('#chat-input').value=''; loadMessages(activeChatWith);
});

async function loadMessages(uid){
  const messagesEl = $('#messages'); messagesEl.innerHTML='';
  const q = query(collection(db,'chats'),where('participants','array-contains',currentUser.uid),orderBy('timestamp','asc'));
  onSnapshot(q,snap=>{
    messagesEl.innerHTML='';
    snap.forEach(docSnap=>{
      const m=docSnap.data();
      if(m.participants.includes(uid)){
        const div = el('div',{},`<strong>${m.from===currentUser.uid?'You':'Friend'}:</strong> ${m.text}`);
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    });
  });
}

// ---------------------- NAV ----------------------
$('#nav-feed').addEventListener('click', ()=>showView('feed'));
$('#nav-products').addEventListener('click', ()=>showView('products'));
$('#nav-profile').addEventListener('click', ()=>openProfile(currentUser.uid));
$('#nav-chat').addEventListener('click', ()=>{ showView('chat'); });
$('#nav-admin').addEventListener('click', ()=>{ showView('admin'); renderAdmin(); });

// ---------------------- INITIAL RENDER ----------------------
async function renderAll(){ renderProducts(); renderFeed(); renderNotifications(); }
