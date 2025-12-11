// app.js
// Firebase + app logic for social feed + products + basic chat

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, setDoc, getDoc, updateDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";

/* ---------- CONFIG: your Firebase (already provided) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.firebasestorage.app",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

/* ---------- INIT ---------- */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ---------- DOM ---------- */
const btnLoginOpen = document.getElementById('btn-login-open');
const authModal = document.getElementById('auth-modal');
const profileModal = document.getElementById('profile-modal');
const chatModal = document.getElementById('chat-modal');
const authError = document.getElementById('auth-error');

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');

const createCard = document.getElementById('create-card');
const postText = document.getElementById('post-text');
const postImageInput = document.getElementById('post-image');
const btnPost = document.getElementById('btn-post');
const postsContainer = document.getElementById('posts-container');
const productsListEl = document.getElementById('products-list');
const friendsListEl = document.getElementById('friends-list');

const profilePhoto = document.getElementById('profile-photo');
const profileUpload = document.getElementById('profile-upload');
const profileNameInput = document.getElementById('profile-name');
const profileBioInput = document.getElementById('profile-bio');
const profileSave = document.getElementById('profile-save');
const btnLogout = document.getElementById('btn-logout');

const chatHeader = document.getElementById('chat-header');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

let currentUser = null;
let currentChatPartner = null;

/* ---------- PRODUCTS (static list; full descriptions can be expanded) ---------- */
const products = [
  { id: 'tme419', name: 'TME 419 Cassava Stems', price: '₦1,000 per bundle', img: 'images/cassava.JPG', desc: 'High-yield, disease-resistant cassava variety for excellent tuber quality and industrial suitability. Fast maturity ensures multiple cropping cycles.'},
  { id: 'plantain', name: 'Hybrid Giant Plantain Sucker', price: '₦500 per sucker', img: 'images/plantain.JPG', desc: 'Robust, fast-growing plantain with high yield, disease tolerance, and excellent fruit quality.'},
  { id: 'banana', name: 'Hybrid Dwarf Banana Sucker', price: '₦500 per sucker', img: 'images/giant_banana.JPG', desc: 'Early-fruiting dwarf banana with superior growth, pest resistance, and high-quality fruit.'},
  { id: 'oilpalm', name: 'Tenera Oil Palm Seedlings', price: '₦1,000 per seedling', img: 'images/oilpalm.JPG', desc: 'Improved oil palm seedlings with early bearing, high oil yield, and adaptability to Nigerian soils.'},
  { id: 'cocoa', name: 'Hybrid Cocoa Nursery Plant', price: '₦500 per plant', img: 'images/giant_cocoa.JPG', desc: 'High-quality, disease-resistant cocoa nursery plant with early bearing and high pod yield.'},
  { id: 'pineapple', name: 'Pineapple Sucker', price: '₦400 per sucker', img: 'images/pineapple.JPG', desc: 'Premium pineapple suckers for high yield and uniform fruits.'},
  { id: 'coconut', name: 'Hybrid Dwarf Coconut Seedlings', price: '₦4,500 per seedling', img: 'images/coconut.JPG', desc: 'High-yield, disease-resistant coconut seedlings selected for early fruiting.'},
  { id: 'yam', name: 'Treated Yam Setts', price: '₦700 per sett', img: 'images/treated_yam.JPG', desc: 'High-quality treated yam setts for optimal sprouting and high tuber yield.'}
];

/* ---------- UI helpers ---------- */
function openModal(el){ el.classList.remove('hidden'); }
function closeModal(el){ el.classList.add('hidden'); }
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', e=>{
  closeModal(e.target.closest('.modal'));
}));
btnLoginOpen.addEventListener('click', ()=> openModal(authModal));

/* clicking brand area or avatar open profile if logged in */
document.querySelector('.brand')?.addEventListener('click', ()=> {
  if(currentUser) openModal(profileModal);
});

/* ---------- AUTH: signup / login ---------- */
signupForm.addEventListener('submit', async e=>{
  e.preventDefault();
  authError.textContent = '';
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pw = document.getElementById('signup-password').value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    currentUser = cred.user;
    // create user doc
    await setDoc(doc(db, 'users', currentUser.uid), {
      name, email, bio: '', profilePic: '', friends: [], createdAt: serverTimestamp()
    });
    closeModal(authModal);
    showSignedInUI();
  } catch(err){
    authError.textContent = err.message;
  }
});

loginForm.addEventListener('submit', async e=>{
  e.preventDefault();
  authError.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-password').value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pw);
    currentUser = cred.user;
    closeModal(authModal);
    showSignedInUI();
  } catch(err){
    authError.textContent = err.message;
  }
});

/* ---------- Auth state ---------- */
onAuthStateChanged(auth, user => {
  currentUser = user;
  if(user){
    showSignedInUI();
  } else {
    // show login button
    createCard.classList.add('hidden');
    document.getElementById('auth-actions').innerHTML = `<button id="btn-login-open">Login / Sign up</button>`;
    document.getElementById('btn-login-open').addEventListener('click', ()=> openModal(authModal));
  }
});

/* ---------- Show UI when signed in ---------- */
async function showSignedInUI(){
  // change top-right
  document.getElementById('auth-actions').innerHTML = `<button id="btn-open-profile">Profile</button>`;
  document.getElementById('btn-open-profile').addEventListener('click', ()=> openModal(profileModal));
  // show create post area
  createCard.classList.remove('hidden');

  // load profile preview
  const udoc = await getDoc(doc(db, 'users', currentUser.uid));
  const udata = udoc.exists() ? udoc.data() : null;
  if(udata?.profilePic) document.getElementById('mini-avatar').src = udata.profilePic;
  else document.getElementById('mini-avatar').src = 'images/default-profile.png';

  // populate profile modal fields
  if(udata){
    profilePhoto.src = udata.profilePic || 'images/default-profile.png';
    profileNameInput.value = udata.name || '';
    profileBioInput.value = udata.bio || '';
  }

  // start feed listener
  startFeedListener();
  renderProducts();
  loadFriends();
}

/* ---------- CREATE POST ---------- */
btnPost.addEventListener('click', async ()=>{
  const text = postText.value.trim();
  const file = postImageInput.files[0];
  if(!text && !file){ alert('Write something or attach an image'); return; }

  // create a post doc with temporary fields
  const docRef = await addDoc(collection(db, 'posts'), {
    uid: currentUser.uid,
    text,
    image: '',
    likes: [],
    createdAt: serverTimestamp()
  });

  // upload image if provided
  if(file){
    const storageRef = ref(storage, `posts/${docRef.id}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'posts', docRef.id), { image: url });
  }

  postText.value = '';
  postImageInput.value = '';
});

/* ---------- FEED: realtime listener ---------- */
function startFeedListener(){
  // unsubscribe existing? For simplicity we'll just attach; onAuthStateChanged handles page lifecycle
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  onSnapshot(q, async snap => {
    postsContainer.innerHTML = '';
    for(const d of snap.docs){
      const post = d.data();
      const id = d.id;
      // fetch author
      const userDoc = await getDoc(doc(db, 'users', post.uid));
      const author = userDoc.exists() ? userDoc.data() : {name:'Unknown', profilePic:''};
      const postEl = renderPost(id, post, author);
      postsContainer.appendChild(postEl);
    }
  });
}

/* ---------- RENDER A POST ---------- */
function renderPost(id, post, author){
  const el = document.createElement('div');
  el.className = 'card post';
  el.innerHTML = `
    <div class="post-head">
      <img src="${author.profilePic || 'images/default-profile.png'}" class="avatar-sm">
      <div>
        <div><strong>${author.name || 'Unknown'}</strong></div>
        <div class="meta">${post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : ''}</div>
      </div>
    </div>
    <div class="post-body">${escapeHtml(post.text || '')}</div>
    ${post.image ? `<img src="${post.image}" class="post-img">` : ''}
    <div style="margin-top:8px">
      <button class="like-btn">Like (${(post.likes||[]).length})</button>
      <button class="comment-btn">Comment</button>
    </div>
    <div class="comments-list" id="comments-${id}"></div>
    <div class="add-comment-row" id="addcomment-${id}" style="margin-top:8px;display:none">
      <input placeholder="Write a comment..." id="comment-input-${id}">
      <button data-postid="${id}" class="submit-comment">Send</button>
    </div>
  `;

  // like
  el.querySelector('.like-btn').addEventListener('click', async ()=>{
    const pdoc = doc(db, 'posts', id);
    const pSnap = await getDoc(pdoc);
    if(!pSnap.exists()) return;
    const likes = pSnap.data().likes || [];
    if(likes.includes(currentUser.uid)){
      // remove
      const newLikes = likes.filter(u => u !== currentUser.uid);
      await updateDoc(pdoc, { likes: newLikes });
    } else {
      likes.push(currentUser.uid);
      await updateDoc(pdoc, { likes });
    }
  });

  // comment toggle
  el.querySelector('.comment-btn').addEventListener('click', ()=>{
    const row = document.getElementById(`addcomment-${id}`);
    row.style.display = row.style.display === 'none' ? 'flex' : 'none';
  });

  // submit comment
  el.querySelector('.submit-comment').addEventListener('click', async (e)=>{
    const postId = e.target.getAttribute('data-postid');
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    if(!text) return;
    await addDoc(collection(db, 'comments'), {
      postId, uid: currentUser.uid, text, createdAt: serverTimestamp()
    });
    input.value = '';
  });

  // show comments realtime
  const commentsList = el.querySelector(`#comments-${id}`);
  const qC = query(collection(db, 'comments'), where('postId','==',id), orderBy('createdAt','asc'));
  onSnapshot(qC, async snap => {
    commentsList.innerHTML = '';
    for(const cd of snap.docs){
      const c = cd.data();
      const userDoc = await getDoc(doc(db, 'users', c.uid));
      const name = userDoc.exists() ? userDoc.data().name : 'Unknown';
      const div = document.createElement('div');
      div.className = 'comment-card';
      div.innerHTML = `<div><strong>${name}</strong> <span class="meta">${c.createdAt?.toDate? c.createdAt.toDate().toLocaleString() : ''}</span></div><div>${escapeHtml(c.text)}</div>`;
      commentsList.appendChild(div);
    }
  });

  return el;
}

/* ---------- PRODUCTS UI ---------- */
function renderProducts(){
  productsListEl.innerHTML = '';
  products.forEach(p=>{
    const d = document.createElement('div');
    d.style.marginBottom = '12px';
    d.innerHTML = `
      <div style="display:flex;gap:8px;">
        <img src="${p.img}" style="width:78px;height:78px;object-fit:cover;border-radius:6px">
        <div style="flex:1">
          <strong>${p.name}</strong>
          <div style="font-size:13px;color:${'#666'}">${p.desc}</div>
          <div style="margin-top:6px"><strong>${p.price}</strong></div>
          <div style="margin-top:6px">
            <a target="_blank" class="whatsapp-order" href="https://wa.me/2349138938301?text=${encodeURIComponent(`I want to order ${p.name} — Price: ${p.price}`)}">Order via WhatsApp</a>
            <button data-prod="${p.id}" style="margin-left:6px">Save order</button>
          </div>
        </div>
      </div>
    `;
    productsListEl.appendChild(d);

    // save order button saves to Firestore orders collection for admin view
    d.querySelector('button')?.addEventListener('click', async ()=>{
      if(!currentUser){ alert('Please login to save order'); return; }
      await addDoc(collection(db,'orders'), {
        uid: currentUser.uid, productId: p.id, productName: p.name, price: p.price, createdAt: serverTimestamp()
      });
      alert('Order saved (admin can view it). You still need to send via WhatsApp to complete purchase.');
    });
  });
}

/* ---------- FRIENDS ---------- */
async function loadFriends(){
  // list other users with add friend
  friendsListEl.innerHTML = '';
  const usersSnap = await getDocs(collection(db, 'users'));
  usersSnap.forEach(docu=>{
    const u = docu.data();
    const id = docu.id;
    if(id === (currentUser && currentUser.uid)) return;
    const div = document.createElement('div');
    div.style.display = 'flex'; div.style.alignItems='center'; div.style.justifyContent='space-between'; div.style.marginBottom='8px';
    div.innerHTML = `<div style="display:flex;gap:8px;align-items:center"><img src="${u.profilePic || 'images/default-profile.png'}" style="width:40px;height:40px;border-radius:50%"><div>${u.name}</div></div>
      <div><button data-uid="${id}">Add Friend</button> <button data-chat="${id}">Chat</button></div>`;
    friendsListEl.appendChild(div);
    div.querySelector('[data-uid]')?.addEventListener('click', async (e)=>{
      const theirId = e.target.getAttribute('data-uid');
      // add to your friends array and they will see you (simple mutual add)
      const myDoc = doc(db, 'users', currentUser.uid);
      const theirDoc = doc(db, 'users', theirId);
      const mySnap = await getDoc(myDoc);
      const theirSnap = await getDoc(theirDoc);
      const myFriends = mySnap.exists() ? (mySnap.data().friends || []) : [];
      const theirFriends = theirSnap.exists() ? (theirSnap.data().friends || []) : [];
      if(!myFriends.includes(theirId)){
        myFriends.push(theirId);
        await updateDoc(myDoc, { friends: myFriends });
      }
      if(!theirFriends.includes(currentUser.uid)){
        theirFriends.push(currentUser.uid);
        await updateDoc(theirDoc, { friends: theirFriends });
      }
      alert('Friend added!');
      loadFriends();
    });

    div.querySelector('[data-chat]')?.addEventListener('click', (e)=>{
      const partnerId = e.target.getAttribute('data-chat');
      openChatWith(partnerId);
    });
  });
}

/* ---------- PROFILE update (upload image) ---------- */
profileUpload.addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const refPath = `profilePics/${currentUser.uid}`;
  const sRef = ref(storage, refPath);
  await uploadBytes(sRef, file);
  const url = await getDownloadURL(sRef);
  await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url });
  profilePhoto.src = url;
});

profileSave.addEventListener('click', async ()=>{
  await updateDoc(doc(db,'users',currentUser.uid), {
    name: profileNameInput.value || undefined,
    bio: profileBioInput.value || undefined
  });
  alert('Profile saved');
});

/* ---------- LOGOUT ---------- */
btnLogout.addEventListener('click', async ()=>{
  await signOut(auth);
  location.reload();
});

/* ---------- SIMPLE CHAT ---------- */
async function openChatWith(partnerId){
  currentChatPartner = partnerId;
  // get partner name
  const partnerDoc = await getDoc(doc(db, 'users', partnerId));
  const partner = partnerDoc.exists() ? partnerDoc.data() : {name:'Friend'};
  chatHeader.innerText = `Chat with ${partner.name}`;
  openModal(chatModal);

  // messages path: chats/{chatId}/messages where chatId is deterministic: smallerUID_biggerUID
  const chatId = [currentUser.uid, partnerId].sort().join('_');
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  onSnapshot(q, snap => {
    chatMessages.innerHTML = '';
    snap.docs.forEach(d=>{
      const m = d.data();
      const div = document.createElement('div');
      div.className = 'chat-bubble';
      div.style.background = m.uid === currentUser.uid ? '#d1f7d6' : '#eef';
      div.innerHTML = `<div style="font-size:12px;color:#555">${m.text}</div><div style="font-size:11px;color:#999">${m.createdAt?.toDate? m.createdAt.toDate().toLocaleString() : ''}</div>`;
      chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  chatSend.onclick = async ()=>{
    const txt = chatInput.value.trim();
    if(!txt) return;
    await addDoc(messagesRef, { uid: currentUser.uid, text: txt, createdAt: serverTimestamp() });
    chatInput.value = '';
  };
}

/* ---------- UTIL ---------- */
function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

/* ---------- START: initial render ---------- */
renderProducts();
