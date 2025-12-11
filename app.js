// app.js - central logic for Healing Root Social Farm
import { auth, db, storage } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

import {
  collection, addDoc, doc, setDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

import { ref as sref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";

/* -------------------- Utilities -------------------- */
const $ = sel => document.querySelector(sel);
const create = (tag, attrs={}) => { const el = document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v)); return el; };
const escapeHtml = s => s ? s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') : '';

/* -------------------- INDEX init -------------------- */
export function initIndex(){
  // open auth modal buttons
  const openBtns = [...document.querySelectorAll('#btn-open-auth, #btn-open-auth-2')].filter(Boolean);
  const authModal = $('#auth-modal');
  openBtns.forEach(b => b.addEventListener('click', ()=> authModal.classList.remove('hidden')));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', ()=> b.closest('.modal').classList.add('hidden')));

  // signup
  $('#signup-form').addEventListener('submit', async e=>{
    e.preventDefault();
    $('#auth-error').textContent = '';
    const username = $('#signup-username').value.trim().toLowerCase();
    const name = $('#signup-name').value.trim();
    const email = $('#signup-email').value.trim();
    const pw = $('#signup-password').value;
    if(!username || !name || !email || !pw){ $('#auth-error').textContent='Fill all fields'; return; }

    // check username uniqueness
    const q = query(collection(db,'users'), where('username','==',username));
    const snaps = await getDocs(q);
    if(!snaps.empty){ $('#auth-error').textContent='Username taken'; return; }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      const uid = cred.user.uid;
      await setDoc(doc(db,'users',uid), {
        username, name, email, bio:'', profilePic:'', friends:[], requestsIn:[], requestsOut:[], createdAt: serverTimestamp()
      });
      window.location.href = 'feed.html';
    } catch(err){
      $('#auth-error').textContent = err.message;
    }
  });

  // login
  $('#login-form').addEventListener('submit', async e=>{
    e.preventDefault();
    $('#auth-error').textContent = '';
    const email = $('#login-email').value.trim();
    const pw = $('#login-password').value;
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      window.location.href = 'feed.html';
    } catch(err){
      $('#auth-error').textContent = err.message;
    }
  });
}

/* -------------------- FEED init -------------------- */
export function initFeed(){
  // top actions (profile/logout)
  $('#top-actions').innerHTML = `<button id="btn-profile" class="small-btn">Profile</button> <button id="btn-logout" class="small-btn danger">Logout</button>`;
  $('#btn-profile').addEventListener('click', ()=> window.location.href='profile.html');
  $('#btn-logout').addEventListener('click', async ()=> { await signOut(auth); window.location.href='index.html'; });

  // load user info to show mini avatar + start feed
  onAuthStateChanged(auth, async user => {
    if(!user) { window.location.href='index.html'; return; }
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const data = userDoc.exists() ? userDoc.data() : {};
    $('#mini-avatar').src = data.profilePic || 'images/default-profile.png';
    startFeedListener();
    renderProductsSidebar();
    renderFriendsPreview();
  });

  // post creation
  $('#btn-post').addEventListener('click', async () => {
    const text = $('#post-text').value.trim();
    const file = $('#post-image').files[0];
    if(!text && !file){ alert('Write something or attach an image'); return; }
    const user = auth.currentUser;
    if(!user){ alert('Please login'); return; }
    const postRef = await addDoc(collection(db,'posts'), {
      uid: user.uid, text, image:'', likes:[], createdAt: serverTimestamp()
    });
    if(file){
      const storageRef = sref(storage, `posts/${postRef.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(postRef, { image: url });
    }
    $('#post-text').value = '';
    $('#post-image').value = '';
  });
}

/* start feed realtime listener */
function startFeedListener(){
  const q = query(collection(db,'posts'), orderBy('createdAt','desc'));
  onSnapshot(q, async snap => {
    $('#posts-container').innerHTML = '';
    for(const d of snap.docs){
      const post = d.data(); const id = d.id;
      const authorDoc = await getDoc(doc(db,'users', post.uid));
      const author = authorDoc.exists() ? authorDoc.data() : {name:'Unknown', profilePic:''};
      const el = buildPostElement(id, post, author);
      $('#posts-container').appendChild(el);
    }
  });
}

/* build a post element with likes and comments realtime */
function buildPostElement(id, post, author){
  const el = create('div'); el.className = 'card post';
  const dateStr = post.createdAt && post.createdAt.toDate ? post.createdAt.toDate().toLocaleString() : '';
  el.innerHTML = `
    <div class="post-head">
      <img src="${author.profilePic || 'images/default-profile.png'}" class="avatar-sm">
      <div><strong>${escapeHtml(author.name || author.username || 'Unknown')}</strong><div class="meta">${dateStr}</div></div>
    </div>
    <div class="post-body">${escapeHtml(post.text||'')}</div>
    ${post.image ? `<img src="${post.image}" class="post-img">` : ''}
    <div style="margin-top:8px">
      <button class="like-btn">Like (${(post.likes||[]).length})</button>
      <button class="comment-btn">Comment</button>
      <button class="delete-post-btn" style="display:none;background:#f8d7da;border:none;padding:6px;border-radius:6px;margin-left:6px;">Delete</button>
    </div>
    <div class="comments-list" id="comments-${id}"></div>
    <div id="addcomment-${id}" style="display:none;margin-top:8px;gap:6px">
      <input placeholder="Write a comment..." id="comment-input-${id}">
      <button data-postid="${id}" class="submit-comment small-btn">Send</button>
    </div>
  `;

  // show delete if admin (client-side check)
  onAuthStateChanged(auth, user => {
    if(user && user.email === 'healingheart702@gmail.com') {
      const btn = el.querySelector('.delete-post-btn');
      if(btn) btn.style.display = 'inline-block';
    }
  });

  // like handler
  el.querySelector('.like-btn').addEventListener('click', async ()=>{
    const pRef = doc(db,'posts',id);
    const pSnap = await getDoc(pRef);
    if(!pSnap.exists()) return;
    const likes = pSnap.data().likes || [];
    const uid = auth.currentUser.uid;
    if(likes.includes(uid)){
      await updateDoc(pRef, { likes: likes.filter(u => u !== uid) });
    } else {
      likes.push(uid);
      await updateDoc(pRef, { likes });
    }
  });

  // comment toggle
  el.querySelector('.comment-btn').addEventListener('click', ()=>{
    const row = $(`#addcomment-${id}`);
    row.style.display = row.style.display === 'none' ? 'flex' : 'none';
  });

  // submit comment
  el.querySelector('.submit-comment').addEventListener('click', async (e)=>{
    const postId = e.target.getAttribute('data-postid');
    const text = $(`#comment-input-${postId}`).value.trim();
    if(!text) return;
    await addDoc(collection(db,'comments'), {
      postId, uid: auth.currentUser.uid, text, createdAt: serverTimestamp()
    });
    $(`#comment-input-${postId}`).value = '';
  });

  // delete post (admin)
  el.querySelector('.delete-post-btn')?.addEventListener('click', async ()=>{
    if(!confirm('Delete this post?')) return;
    await deleteDoc(doc(db,'posts',id));
    // also delete comments for this post (optional)
    const qc = query(collection(db,'comments'), where('postId','==',id));
    const snaps = await getDocs(qc);
    for(const c of snaps.docs) await deleteDoc(doc(db,'comments',c.id));
  });

  // real-time comments listener for this post
  const qc = query(collection(db,'comments'), where('postId','==',id), orderBy('createdAt','asc'));
  onSnapshot(qc, async snapC => {
    const list = el.querySelector(`#comments-${id}`);
    list.innerHTML = '';
    for(const cd of snapC.docs){
      const c = cd.data();
      const userDoc = await getDoc(doc(db,'users', c.uid));
      const name = userDoc.exists() ? (userDoc.data().name || userDoc.data().username) : 'Unknown';
      const date = c.createdAt && c.createdAt.toDate ? c.createdAt.toDate().toLocaleString() : '';
      const div = create('div'); div.className = 'comment-card';
      div.innerHTML = `<div><strong>${escapeHtml(name)}</strong> <span class="meta">${date}</span></div><div>${escapeHtml(c.text)}</div>`;
      list.appendChild(div);
    }
  });

  return el;
}

/* -------------------- PRODUCTS: sidebar + shop page -------------------- */
const products = [
  { id:'tme419', name:'TME 419 Cassava Stems', price:'₦1,000 per bundle', img:'images/cassava.JPG', desc: generateDesc('TME 419 Cassava Stems') },
  { id:'plantain', name:'Hybrid Giant Plantain Sucker', price:'₦500 per sucker', img:'images/plantain.JPG', desc: generateDesc('Hybrid Giant Plantain Sucker') },
  { id:'banana', name:'Hybrid Dwarf Banana Sucker', price:'₦500 per sucker', img:'images/giant_banana.JPG', desc: generateDesc('Hybrid Dwarf Banana Sucker') },
  { id:'oilpalm', name:'Tenera Oil Palm Seedlings', price:'₦1,000 per seedling', img:'images/oilpalm.JPG', desc: generateDesc('Tenera Oil Palm Seedlings') },
  { id:'cocoa', name:'Hybrid Cocoa Nursery Plant', price:'₦500 per plant', img:'images/giant_cocoa.JPG', desc: generateDesc('Hybrid Cocoa Nursery Plant') },
  { id:'pineapple', name:'Pineapple Sucker', price:'₦400 per sucker', img:'images/pineapple.JPG', desc: generateDesc('Pineapple Sucker') },
  { id:'coconut', name:'Hybrid Dwarf Coconut Seedlings', price:'₦4,500 per seedling', img:'images/coconut.JPG', desc: generateDesc('Hybrid Dwarf Coconut Seedlings') },
  { id:'yam', name:'Treated Yam Setts', price:'₦700 per sett', img:'images/treated_yam.JPG', desc: generateDesc('Treated Yam Setts') }
];

function generateDesc(name){
  // short-to-moderate placeholder descriptions; if you want 2500-char marketing copy, ask and I'll expand.
  return `${name} — high quality product from Healing Root Agro Ventures. Carefully selected, disease-resilient, and suitable for Nigerian farming conditions. Order now via WhatsApp or save an order for admin to review.`;
}

function renderProductsSidebar(){
  const container = $('#products-list');
  if(!container) return;
  container.innerHTML = '';
  products.forEach(p=>{
    const d = create('div'); d.style.marginBottom = '12px';
    d.innerHTML = `<div style="display:flex;gap:8px">
      <img src="${p.img}" style="width:78px;height:78px;object-fit:cover;border-radius:6px">
      <div style="flex:1"><strong>${p.name}</strong><div style="font-size:13px;color:#666">${p.price}</div><div style="margin-top:6px"><a target="_blank" href="https://wa.me/2349138938301?text=${encodeURIComponent(`I want to order ${p.name} — ${p.price}`)}" class="small-btn">Order via WhatsApp</a> <button class="small-btn save-order" data-id="${p.id}" style="background:#3b7a3b">Save order</button></div></div></div>`;
    container.appendChild(d);
    d.querySelector('.save-order')?.addEventListener('click', async (e)=>{
      const id = e.target.getAttribute('data-id');
      const prod = products.find(x=>x.id===id);
      const user = auth.currentUser;
      if(!user){ alert('Please login to save order'); return; }
      await addDoc(collection(db,'orders'), { uid: user.uid, productId: prod.id, productName: prod.name, price: prod.price, createdAt: serverTimestamp() });
      alert('Order saved for admin review. Please send via WhatsApp to complete purchase.');
    });
  });
}

/* render shop page */
export function initProducts(){
  const container = $('#shop-products');
  if(!container) return;
  container.innerHTML = '';
  products.forEach(p=>{
    const card = create('div'); card.className='card';
    card.innerHTML = `<div style="display:flex;gap:12px"><img src="${p.img}" style="width:140px;height:140px;object-fit:cover;border-radius:8px"><div style="flex:1"><h3>${p.name}</h3><p style="color:#444">${p.desc}</p><div><strong>${p.price}</strong></div><div style="margin-top:8px"><a target="_blank" href="https://wa.me/2349138938301?text=${encodeURIComponent(`I want to order ${p.name} — ${p.price}`)}" class="small-btn">Order via WhatsApp</a></div></div></div>`;
    container.appendChild(card);
  });
}

/* -------------------- FRIENDS: preview and full page -------------------- */
async function renderFriendsPreview(){
  const u = auth.currentUser; if(!u) return;
  const docU = await getDoc(doc(db,'users',u.uid));
  const friends = docU.exists() ? (docU.data().friends || []) : [];
  const preview = $('#friends-preview'); if(!preview) return;
  preview.innerHTML = '';
  for(const fid of friends.slice(0,6)){
    const fdoc = await getDoc(doc(db,'users',fid));
    if(!fdoc.exists()) continue;
    const data = fdoc.data();
    const div = create('div'); div.style.display='flex'; div.style.alignItems='center'; div.style.gap='8px'; div.style.marginBottom='8px';
    div.innerHTML = `<img src="${data.profilePic || 'images/default-profile.png'}" style="width:44px;height:44px;border-radius:50%"><div>${escapeHtml(data.name)}</div>`;
    preview.appendChild(div);
  }
}

/* init friends page */
export async function initFriends(){
  const suggestions = $('#suggestions-list');
  const incoming = $('#incoming-requests');
  const outgoing = $('#outgoing-requests');
  suggestions.innerHTML = incoming.innerHTML = outgoing.innerHTML = '';
  const all = await getDocs(collection(db,'users'));
  const meId = auth.currentUser.uid;
  const myDoc = await getDoc(doc(db,'users',meId));
  const myData = myDoc.exists()? myDoc.data() : { friends:[], requestsIn:[], requestsOut:[] };

  all.forEach(d=>{
    const id = d.id; const data = d.data();
    if(id === meId) return;
    const isFriend = (myData.friends || []).includes(id);
    const requested = (myData.requestsOut || []).includes(id);
    const incomingReq = (myData.requestsIn || []).includes(id);

    const card = create('div'); card.className='card'; card.style.marginBottom='8px';
    card.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><img src="${data.profilePic||'images/default-profile.png'}" style="width:56px;height:56px;border-radius:50%"><div><strong>${escapeHtml(data.name||data.username)}</strong><div style="font-size:13px;color:#666">@${escapeHtml(data.username||'')}</div></div><div style="margin-left:auto"></div></div>`;

    if(!isFriend && !requested && !incomingReq){
      const btn = create('button'); btn.className='small-btn'; btn.textContent='Add friend';
      btn.addEventListener('click', async ()=>{
        // update requestsOut for me and requestsIn for them
        const myRef = doc(db,'users',meId);
        const theirRef = doc(db,'users',id);
        const mySnap = await getDoc(myRef); const myD = mySnap.exists()?mySnap.data():{};
        const theirSnap = await getDoc(theirRef); const theirD = theirSnap.exists()?theirSnap.data():{};
        await updateDoc(myRef, { requestsOut: [...(myD.requestsOut||[]), id] });
        await updateDoc(theirRef, { requestsIn: [...(theirD.requestsIn||[]), meId] });
        alert('Friend request sent');
        initFriends();
      });
      card.querySelector('div[style*="margin-left:auto"]').appendChild(btn);
      suggestions.appendChild(card);
    } else if(incomingReq){
      const acceptBtn = create('button'); acceptBtn.className='small-btn'; acceptBtn.textContent='Accept';
      acceptBtn.addEventListener('click', async ()=>{
        const myRef = doc(db,'users',meId); const theirRef = doc(db,'users',id);
        const mySnap = await getDoc(myRef); const myD = mySnap.exists()?mySnap.data():{};
        const theirSnap = await getDoc(theirRef); const theirD = theirSnap.exists()?theirSnap.data():{};
        const myFriends = [...(myD.friends||[]), id];
        const theirFriends = [...(theirD.friends||[]), meId];
        const newReqIn = (myD.requestsIn || []).filter(x=>x!==id);
        const newReqOutTheir = (theirD.requestsOut || []).filter(x=>x!==meId);
        await updateDoc(myRef, { friends: myFriends, requestsIn: newReqIn });
        await updateDoc(theirRef, { friends: theirFriends, requestsOut: newReqOutTheir });
        alert('Friend added');
        initFriends();
      });
      card.querySelector('div[style*="margin-left:auto"]').appendChild(acceptBtn);
      incoming.appendChild(card);
    } else if(requested){
      card.querySelector('div[style*="margin-left:auto"]').innerHTML = `<em>Requested</em>`;
      outgoing.appendChild(card);
    } else if(isFriend){
      card.querySelector('div[style*="margin-left:auto"]').innerHTML = `<em>Friend</em>`;
      // do not add to suggestions
    }
  });
}

/* -------------------- PROFILE page init -------------------- */
export async function initProfile(){
  const me = auth.currentUser; if(!me){ window.location.href='index.html'; return; }
  $('#go-feed').addEventListener('click', ()=> window.location.href='feed.html');

  const udoc = await getDoc(doc(db,'users',me.uid));
  const data = udoc.exists()? udoc.data() : {};
  $('#profile-avatar').src = data.profilePic || 'images/default-profile.png';
  $('#profile-displayname').textContent = data.name || data.username || 'No name';
  $('#profile-username').textContent = '@' + (data.username || '');
  $('#profile-bio').value = data.bio || '';

  $('#profile-upload').addEventListener('change', async (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const storageRef = sref(storage, `profilePics/${me.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db,'users',me.uid), { profilePic: url });
    $('#profile-avatar').src = url;
  });

  $('#save-profile').addEventListener('click', async ()=>{
    const name = $('#profile-displayname').textContent.trim();
    const bio = $('#profile-bio').value.trim();
    await updateDoc(doc(db,'users',me.uid), { name, bio });
    alert('Saved');
  });

  // list friends
  const myDoc = await getDoc(doc(db,'users',me.uid));
  const friends = myDoc.exists()? (myDoc.data().friends || []) : [];
  const friendsEl = $('#profile-friends');
  friendsEl.innerHTML = '';
  for(const fid of friends){
    const fdoc = await getDoc(doc(db,'users',fid));
    if(!fdoc.exists()) continue;
    const d = fdoc.data();
    const div = create('div'); div.style.display='flex'; div.style.alignItems='center'; div.style.gap='10px'; div.style.marginBottom='8px';
    div.innerHTML = `<img src="${d.profilePic || 'images/default-profile.png'}" style="width:56px;height:56px;border-radius:50%"><div><strong>${escapeHtml(d.name)}</strong><div style="font-size:13px;color:#666">@${escapeHtml(d.username||'')}</div></div><div style="margin-left:auto"><button class="small-btn" data-chat="${fid}">Chat</button></div>`;
    friendsEl.appendChild(div);
    div.querySelector('[data-chat]')?.addEventListener('click', ()=> {
      // only allow chat if mutual friend - check inside openChat
      window.location.href = `chat.html?with=${fid}`;
    });
  }
}

/* -------------------- CHAT page init (only friends) -------------------- */
export async function initChatPage(){
  const me = auth.currentUser; if(!me){ window.location.href='index.html'; return; }
  const list = $('#chat-users'); if(!list) return;
  list.innerHTML = '';
  const users = await getDocs(collection(db,'users'));
  users.forEach(d=>{
    if(d.id === me.uid) return;
    const u = d.data();
    const div = create('div'); div.className='card';
    div.innerHTML = `<div style="display:flex;align-items:center;gap:10px"><img src="${u.profilePic||'images/default-profile.png'}" style="width:56px;height:56px;border-radius:50%"><div><strong>${escapeHtml(u.name||u.username)}</strong><div style="font-size:13px;color:#666">@${escapeHtml(u.username||'')}</div></div><div style="margin-left:auto"><button class="small-btn">Chat</button></div></div>`;
    list.appendChild(div);
    div.querySelector('button')?.addEventListener('click', ()=> {
      // navigate to chat with query param; chat page will enforce friend-only chat
      window.location.href = `chat.html?with=${d.id}`;
    });
  });

  // if url has ?with=ID open chat UI
  const params = new URLSearchParams(window.location.search);
  const withId = params.get('with');
  if(withId) openChatPage(withId);
}

/* open chat page UI (enforces friend-only) */
async function openChatPage(partnerId){
  const me = auth.currentUser; if(!me){ window.location.href='index.html'; return; }
  // check mutual friendship
  const myDoc = await getDoc(doc(db,'users',me.uid));
  const theirDoc = await getDoc(doc(db,'users',partnerId));
  if(!myDoc.exists() || !theirDoc.exists()){ alert('User not found'); return; }
  const myData = myDoc.data(); const theirData = theirDoc.data();
  const isFriend = (myData.friends || []).includes(partnerId) && (theirData.friends || []).includes(me.uid);
  if(!isFriend){ alert('You can only chat with your friends. Send a friend request first.'); window.location.href='feed.html'; return; }

  // build chat UI on this page
  document.body.innerHTML = `
    <header class="topbar"><div class="brand">Chat with ${escapeHtml(theirData.name || theirData.username)}</div><div class="actions"><a href="feed.html" class="small-btn">Back</a></div></header>
    <main style="max-width:900px;margin:20px auto;padding:12px"><div class="card"><div id="chat-box" class="chat-box"></div><div class="chat-input-row"><input id="chat-msg" placeholder="Write a message..."><button id="send-msg" class="small-btn">Send</button></div></div></main>
  `;

  const chatBox = $('#chat-box');
  const chatId = [me.uid, partnerId].sort().join('_');
  const msgsRef = collection(db, 'chats', chatId, 'messages');
  const q = query(msgsRef, orderBy('createdAt','asc'));
  onSnapshot(q, snap => {
    chatBox.innerHTML = '';
    snap.docs.forEach(d=>{
      const m = d.data();
      const bubble = create('div'); bubble.className='chat-bubble'; bubble.style.background = m.uid === me.uid ? '#d1f7d6' : '#eef';
      bubble.innerHTML = `<div style="font-size:14px">${escapeHtml(m.text)}</div><div style="font-size:11px;color:#666">${m.createdAt && m.createdAt.toDate ? m.createdAt.toDate().toLocaleString() : ''}</div>`;
      chatBox.appendChild(bubble);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // send handler
  $('#send-msg').addEventListener('click', async ()=>{
    const txt = $('#chat-msg').value.trim();
    if(!txt) return;
    await addDoc(msgsRef, { uid: me.uid, text: txt, createdAt: serverTimestamp() });
    $('#chat-msg').value = '';
  });
}

/* -------------------- ADMIN page init -------------------- */
export async function initAdmin(){
  // only allow admin email
  onAuthStateChanged(auth, async user => {
    if(!user) return window.location.href = 'index.html';
    if(user.email !== 'healingheart702@gmail.com'){ alert('Not authorized'); return window.location.href='feed.html'; }
    // render users, posts, orders, chats
    renderAdminUsers();
    renderAdminPosts();
    renderAdminOrders();
    renderAdminChats();
  });
}

async function renderAdminUsers(){
  const container = $('#admin-users'); if(!container) return;
  container.innerHTML = '';
  const snaps = await getDocs(collection(db,'users'));
  for(const d of snaps.docs){
    const u = d.data();
    const id = d.id;
    const div = create('div'); div.className='card'; div.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><img src="${u.profilePic||'images/default-profile.png'}" style="width:56px;height:56px;border-radius:50%"><div><strong>${escapeHtml(u.name||u.username)}</strong><div style="font-size:13px;color:#666">${escapeHtml(u.email||'')}</div></div><div style="margin-left:auto"><button data-id="${id}" class="small-btn del-user">Delete</button></div></div>`;
    container.appendChild(div);
    div.querySelector('.del-user')?.addEventListener('click', async ()=>{
      if(!confirm('Delete user and all their data?')) return;
      await deleteDoc(doc(db,'users',id));
      // optionally delete their posts/comments/chats/orders
      renderAdminUsers();
    });
  }
}

async function renderAdminPosts(){
  const container = $('#admin-posts'); if(!container) return;
  container.innerHTML = '';
  const snaps = await getDocs(collection(db,'posts'));
  for(const d of snaps.docs){
    const p = d.data(); const id = d.id;
    const udoc = await getDoc(doc(db,'users',p.uid));
    const author = udoc.exists() ? udoc.data() : {};
    const div = create('div'); div.className='card';
    div.innerHTML = `<div><strong>${escapeHtml(author.name||author.username||'Unknown')}</strong> — ${p.text || ''} <div style="font-size:13px;color:#666">${p.createdAt && p.createdAt.toDate ? p.createdAt.toDate().toLocaleString() : ''}</div></div><div style="margin-top:8px"><button data-id="${id}" class="small-btn del-post">Delete Post</button></div>`;
    container.appendChild(div);
    div.querySelector('.del-post')?.addEventListener('click', async ()=>{
      if(!confirm('Delete post?')) return;
      await deleteDoc(doc(db,'posts',id));
      renderAdminPosts();
    });
  }
}

async function renderAdminOrders(){
  const container = $('#admin-orders'); if(!container) return;
  container.innerHTML = '';
  const snaps = await getDocs(collection(db,'orders'));
  for(const d of snaps.docs){
    const o = d.data(); const id = d.id;
    const userDoc = await getDoc(doc(db,'users',o.uid));
    const u = userDoc.exists()? userDoc.data() : {};
    const div = create('div'); div.className='card';
    div.innerHTML = `<div><strong>${escapeHtml(o.productName)}</strong> — ${escapeHtml(o.price)} by ${escapeHtml(u.name || u.username || o.uid)} <div style="font-size:13px;color:#666">${o.createdAt && o.createdAt.toDate? o.createdAt.toDate().toLocaleString() : ''}</div></div><div style="margin-top:8px"><button data-id="${id}" class="small-btn del-order">Delete</button></div>`;
    container.appendChild(div);
    div.querySelector('.del-order')?.addEventListener('click', async ()=>{
      if(!confirm('Delete order record?')) return;
      await deleteDoc(doc(db,'orders',id));
      renderAdminOrders();
    });
  }
}

async function renderAdminChats(){
  const container = $('#admin-chats'); if(!container) return;
  container.innerHTML = '';
  // list chat collections (not trivial via client) — simple preview: show recent messages across known chat subcollections by scanning 'chats' subcollections if you have flat structure.
  // For simplicity, show message documents in top-level 'chats_preview' if you store; otherwise admin can inspect Firestore console for full chat structure.
  container.innerHTML = '<div class="card">Open Firebase Console → Firestore → chats to view threads (admin preview not implemented). Use admin console for full chat inspection.</div>';
}

/* -------------------- small exports for HTML pages to call -------------------- */
export { initIndex as default };
