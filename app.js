// app.js (module)
// Save this file as app.js in the same folder as index.html and style.css

// ---------------------- FIREBASE MODULES ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// ---------------------- CLOUDINARY ----------------------
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

// ---------------------- FIREBASE CONFIG ----------------------
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

// ---------------------- ADMIN UID ----------------------
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// ---------------------- PRODUCTS ----------------------
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures provides premium Cassava Stems (TME419), carefully selected for high-yield potential and disease resistance. These stems are propagated from certified mother plants and are ideal for both smallholder and commercial farms. With robust growth and uniform sprouting, TME419 ensures optimal tuber size and quantity. Our stems are treated for disease prevention, ensuring healthy roots and enhanced productivity. Whether cultivating for starch, flour, or local markets, these cassava stems are your reliable partner for sustainable agriculture in Nigeria. Each stem is inspected and prepared to provide strong root development and rapid establishment in the field. Farmers will benefit from faster growth cycles and reduced risk of losses due to pests or disease, making this an essential crop input for profitable and sustainable cassava farming.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Our Hybrid Plantain Suckers are selected to provide early maturity, vigorous growth, and uniform bunch sizes. Each sucker undergoes strict quality checks to ensure disease tolerance and high productivity. Ideal for small and large farms, these plantains offer fast returns and consistent yields. Grown under controlled and monitored nursery conditions, the suckers are treated to prevent common diseases and pest infestations. Farmers will experience easy plantation management and higher bunch weight, ensuring profitability. Perfect for local markets, processing, and export purposes, these hybrid suckers maintain their quality and vigor through successive planting cycles. A reliable choice for sustainable plantain cultivation across varied soil types.`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures offers Hybrid Dwarf Banana, optimized for rapid fruiting and ease of management. These bananas are carefully propagated for strong, healthy growth, capable of producing uniform bunches in short cycles. Resistant to common diseases, the plants thrive in diverse soil conditions and respond well to fertilizers. Ideal for smallholder farmers and commercial plantations, they are perfect for consumption, processing, and local sales. Each plant is nurtured from certified seedlings, ensuring consistency, reliability, and superior quality. By investing in these hybrid banana plants, farmers achieve maximum yield potential while reducing risks associated with pests and environmental stress. The plants are robust, easy to maintain, and deliver continuous returns in both short- and long-term cultivation.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera Oil Palm Seedlings from Healingroot AGRO Ventures are your gateway to long-term agricultural profitability. These seedlings are selected for high oil content, disease resistance, and uniform growth. Propagated under controlled nursery conditions, they ensure strong root establishment and rapid development in the field. Ideal for commercial plantations, they produce palms with straight trunks, high bunch yields, and early fruiting. With consistent care, our Tenera seedlings reduce cultivation risks, maximize productivity, and provide a reliable return on investment. Farmers can rely on these seedlings to produce quality oil palm fruits suitable for local processing or export. Each seedling is nurtured to achieve optimal vigor, making them a trusted choice for sustainable and profitable oil palm farming.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures supplies Hybrid Dwarf Coconut Seedlings cultivated for high survival rates and excellent productivity. These seedlings are hardy, adapted to various soils, and designed to bear nuts early. Each plant undergoes rigorous nursery care to prevent disease and ensure uniform growth. Perfect for smallholder farmers and commercial plantations, the hybrid dwarf coconuts are ideal for fresh fruit production, copra processing, and ornamental uses. Farmers benefit from reduced maintenance requirements and faster return on investment. The seedlings are treated and nurtured to promote robust root systems, ensuring long-term success and sustainable yields.`
  },
  {
    id: "giant_cocoa",
    name: "Hybrid Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Our Hybrid Giant Cocoa Seedlings are selected for superior growth, disease resistance, and high yield potential. Each seedling is nurtured under strict nursery protocols to ensure strong root establishment and rapid growth. Suitable for both small and large-scale plantations, these cocoa seedlings provide uniform pods and high-quality beans. Healingroot AGRO Ventures ensures seedlings are free from pests and diseases, maximizing farmer returns. Ideal for local and international markets, these hybrid cocoa seedlings are an investment in sustainable cocoa production. Farmers enjoy faster fruiting, reliable yield, and robust plant health.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Healingroot AGRO Ventures provides premium Pineapple Seedlings that guarantee uniform, sweet fruits with high resistance to pests. Each seedling is raised in a controlled nursery to ensure strong root systems and vigorous growth. Perfect for both small-scale farmers and commercial growers, these seedlings produce consistent, high-quality fruits suitable for local consumption or sale. The plants are treated to reduce disease incidence and maximize yield. By choosing our seedlings, farmers secure productive pineapple cultivation with reduced risk and improved harvest outcomes. Each seedling is a reliable investment in profitable fruit farming.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 700,
    description: `Healingroot AGRO Ventures supplies Treated Yam Setts sourced from high-yielding, disease-free mother tubers. Each sett is carefully prepared to ensure rapid sprouting, strong tuber development, and consistent growth. Ideal for smallholder and commercial farms, the setts are treated for common pests and diseases, guaranteeing healthy plants and increased yields. Farmers benefit from uniform tuber size, early maturity, and reduced risk of crop failure. These treated yam setts are perfect for local consumption, markets, or processing, and provide a reliable input for sustainable yam cultivation with high returns.`
  }
];

// ---------------------- DOM HELPERS ----------------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function el(tag, attrs = {}, html=''){ const e = document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); e.innerHTML=html; return e; }

// ---------------------- AUTH ----------------------
let currentUser = null;
const authModal = $('#auth-modal');
const authMessage = $('#auth-message');
const navAdmin = $('#nav-admin');
const notificationsPanel = document.createElement('div');
notificationsPanel.id = 'notifications-panel';
notificationsPanel.style.position = 'fixed';
notificationsPanel.style.top = '70px';
notificationsPanel.style.right = '10px';
notificationsPanel.style.width = '300px';
notificationsPanel.style.maxHeight = '400px';
notificationsPanel.style.overflowY = 'auto';
notificationsPanel.style.background = '#fff';
notificationsPanel.style.border = '1px solid #ccc';
notificationsPanel.style.zIndex = '999';
notificationsPanel.style.padding = '10px';
notificationsPanel.style.display = 'none';
document.body.appendChild(notificationsPanel);

function showView(id){ $$('.view').forEach(v=>v.style.display='none'); const view = $('#'+id+'-view'); if(view) view.style.display='block'; }
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

$('#logout-btn')?.addEventListener('click', async ()=>{ await signOut(auth); });

// ---------------------- AUTH STATE ----------------------
onAuthStateChanged(auth, async user=>{
  currentUser = user;
  if(user){
    showAuthModal(false);
    $('#logout-btn').style.display='inline-block';
    navAdmin.style.display=(user.uid===ADMIN_UID)?'inline-block':'none';
    $('#nav-feed').click();
    await renderAll();
    listenNotifications();
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
  products.forEach(p=>{
    const card = el('div',{class:'card post'}, `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description}</p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    feed.appendChild(card);
  });

  const postsRef = collection(db,'posts');
  onSnapshot(query(postsRef, orderBy('timestamp','desc')), snap=>{
    feed.innerHTML='';
    products.forEach(p=>{
      const card = el('div',{class:'card post'}, `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
        <p>${p.description}</p>
        <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
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
      `;
      if(currentUser && (currentUser.uid===post.uid || currentUser.uid===ADMIN_UID)){
        const del = el('button',{class:'btn'},'Delete'); del.style.background='crimson';
        del.addEventListener('click', async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); alert('Post deleted'); });
        card.appendChild(del);
      }
      feed.appendChild(card);
    });
  });
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
      await addNotification(d.id, `${currentUser.displayName||currentUser.email} sent you a friend request`);
      alert('Friend request sent');
    });
    card.appendChild(btn); container.appendChild(card);
  });
}

// ---------------------- CHAT ----------------------
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
  await addNotification(activeChatWith, `${currentUser.displayName||currentUser.email} sent you a message`);
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

// ---------------------- NOTIFICATIONS ----------------------
async function addNotification(uid, text){
  await addDoc(collection(db,'notifications'), {uid, text, read:false, timestamp:serverTimestamp()});
}

function listenNotifications(){
  const q = query(collection(db,'notifications'), where('uid','==',currentUser.uid), orderBy('timestamp','desc'));
  onSnapshot(q, snap=>{
    notificationsPanel.innerHTML='';
    snap.forEach(d=>{
      const n = d.data();
      const div = el('div',{},`📢 ${n.text}`);
      notificationsPanel.appendChild(div);
    });
    notificationsPanel.style.display='block';
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
