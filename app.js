// app.js (module)
// IMPORTANT: Save this file as app.js in the same folder as index.html and style.css

// Firebase modules (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp 
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

// Admin UID
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// ---------------------- PRODUCTS ----------------------
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures supplies top-quality cassava stems (TME419) carefully selected for high yield, disease resistance, and rapid growth. These stems are ideal for both smallholder and commercial farmers seeking reliable harvests. Each stem is harvested from healthy, mature mother plants and treated to prevent pests and fungal infections. This variety ensures uniform sprouting and strong tuber development, resulting in superior root quality. Our cassava stems are packaged and transported under optimal conditions to maintain viability. Farmers using TME419 stems can expect consistent growth patterns, high starch content, and robust plant structure. With proper agronomic practices, these stems offer a highly profitable investment in cassava farming. Healingroot AGRO Ventures also provides expert guidance on planting, spacing, fertilization, and post-harvest handling to maximize returns and ensure sustainable farming practices. Our commitment to quality ensures that every batch of stems meets strict standards for health and performance. This variety thrives in a range of soil types and is tolerant to moderate drought, making it suitable for diverse Nigerian climates. By choosing Healingroot AGRO Ventures cassava stems, you guarantee your farm productivity, healthy crops, and peace of mind from planting to harvest. Our ongoing support and agro-consultation services ensure farmers implement best practices, minimizing crop losses and enhancing profitability. Invest in TME419 cassava stems for reliable, consistent, and premium-quality harvests season after season.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures provides hybrid plantain suckers selected for fast growth, early maturity, and high disease tolerance. Each sucker comes from carefully monitored parent plants to ensure uniformity, strength, and healthy root systems. The hybrid plantain is ideal for farmers aiming for consistent bunch sizes and early fruiting, reducing the waiting period to harvest. Every sucker is treated to prevent nematode infestation and fungal diseases. These suckers are robust, resilient to common plantain pests, and adapted to varying soil types, ensuring productivity across Nigerian farmlands. Our hybrid plantain cultivation package includes guidance on proper spacing, soil fertility management, and pest control for optimal yields. Farmers can expect high-quality bunches, excellent taste, and a reliable income stream. By investing in Healingroot AGRO Ventures hybrid plantain suckers, you are ensuring sustainable farm development, healthy crop growth, and efficient fruit production for commercial and domestic use. Each batch is handled under strict quality standards to maintain viability and guarantee performance from planting to harvest. We also provide ongoing agro-consultation support to help farmers achieve the highest return on investment. Our suckers are suitable for mixed cropping systems and can thrive alongside cassava, maize, and other staple crops, providing diversification for your farm. Choose our hybrid plantain suckers to secure fast growth, high productivity, and superior crop quality.`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures’ Hybrid Dwarf Banana is an ideal choice for farmers seeking fast-growing, high-yield, and easy-to-manage banana plants. These dwarf varieties are bred for compact size, strong stem structure, and early fruiting, making them suitable for both backyard farms and commercial plantations. Each plant is propagated from disease-free tissue culture or healthy suckers, ensuring rapid establishment and reduced mortality rates. Our banana plants thrive in varied soil types and are tolerant of moderate climatic stress, ensuring consistent fruit production. With proper agronomic care, farmers can expect uniform bunches with sweet, market-ready fruits. Healingroot AGRO Ventures provides full planting instructions, including spacing, fertilization schedules, irrigation, and pest management, to maximize yields. Each batch of banana plants is carefully selected, treated, and packaged for optimal survival and productivity. By choosing our hybrid dwarf banana plants, you are investing in sustainable, profitable, and low-maintenance banana farming. Our support services include farm setup advice, pest control guidance, and post-harvest handling tips to maintain quality and marketability. Ensure your farm success with Healingroot AGRO Ventures’ dwarf bananas, offering reliability, productivity, and superior fruit quality year after year.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera oil palm seedlings from Healingroot AGRO Ventures are a long-term agricultural investment offering high-quality oil yield. Our seedlings are sourced from top-performing parent palms, ensuring early fruiting, uniform bunches, and excellent oil content. Each seedling is carefully raised to establish strong roots and resistance to common pests and diseases. Farmers can expect consistent vegetative growth, high-quality bunches, and robust trees adapted to Nigerian climates. We provide planting guidance, including spacing, soil fertility management, and irrigation recommendations, for maximum production. With proper care, these seedlings establish quickly and provide returns for years. Healingroot AGRO Ventures ensures all seedlings are treated to prevent fungal infections, pest infestations, and transplant shock. Farmers benefit from ongoing consultation on nutrition, pruning, and harvest techniques to maximize oil extraction and profitability. Investing in our Tenera oil palm seedlings guarantees sustainable cultivation, long-term yield, and strong financial returns.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures provides premium Hybrid Dwarf Coconut seedlings selected for rapid establishment, high survival rate, and early fruit production. Each seedling is carefully raised under controlled nursery conditions to ensure strong root systems and disease resistance. These coconuts are ideal for commercial plantations and homesteads, producing high-quality nuts suitable for consumption or oil extraction. Our dwarf varieties thrive in varied soils and climates, adapting well to Nigerian conditions. Farmers receive detailed guidance on planting, fertilization, irrigation, and pest management to optimize yield and quality. Each batch is treated to prevent fungal and pest issues and packaged to ensure viability. By choosing Healingroot AGRO Ventures’ coconut seedlings, farmers invest in a sustainable, profitable crop with consistent performance, early maturity, and premium fruit quality. We also provide ongoing support to ensure long-term farm success and high-quality production.`
  },
  {
    id: "giant_cocoa",
    name: "Hybrid Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures supplies Hybrid Giant Cocoa seedlings carefully propagated from superior parent plants for maximum yield, disease resistance, and early maturation. These seedlings produce robust trees with high-quality cocoa beans suitable for domestic and international markets. Each seedling is nurtured under optimal nursery conditions, ensuring strong roots and vigorous growth. Farmers are provided with planting guidance, soil management techniques, fertilization schedules, and pest control strategies to ensure a high-performing plantation. By using these seedlings, farmers secure early fruiting, improved bean quality, and sustainable income streams. Ongoing support from Healingroot AGRO Ventures includes advice on pruning, shade management, and harvesting techniques to maximize cocoa production. Our hybrid giant cocoa seedlings guarantee reliability, high yield, and excellent marketability.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Healingroot AGRO Ventures provides high-quality pineapple seedlings that produce uniform, sweet, and market-ready fruits. Each seedling is selected for disease resistance, rapid growth, and high fruit yield. Our seedlings thrive in diverse soils and climates, making them ideal for smallholder and commercial farmers. Farmers receive guidance on proper spacing, soil fertility, irrigation, and pest management to ensure maximum production and quality. Each batch is treated to prevent common pests and fungal infections and packaged to maintain viability. By choosing our pineapple seedlings, farmers invest in sustainable, high-yield, and profitable crop production with reliable fruit quality and minimal management challenges. Healingroot AGRO Ventures also offers ongoing farm support and advice to optimize growth, harvesting, and post-harvest handling.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 700,
    description: `Healingroot AGRO Ventures supplies treated yam setts sourced from high-yielding, disease-free mother tubers. Each sett is selected for rapid sprouting, strong vine growth, and robust tuber development. Our yam setts are treated with fungicides to prevent rot and enhance survival rates, ensuring a high establishment percentage. Farmers are provided with detailed guidance on planting depth, spacing, staking, irrigation, and nutrient management to maximize yield and tuber quality. The treated yam setts are ideal for small-scale and commercial farmers seeking reliable and high-performing crops. With proper care, farmers can expect uniform growth, large tuber size, and early harvest. Healingroot AGRO Ventures supports sustainable yam production by offering expert advice on pest management, fertilization, and post-harvest handling, ensuring profitability and crop consistency season after season. Investing in our treated yam setts ensures healthy, productive, and marketable yam crops for your farm.`
  }
];

// ---------------------- DOM Helpers ----------------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function el(tag, attrs = {}, html=''){ const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); e.innerHTML=html; return e; }

// ---------------------- AUTH ----------------------
let currentUser = null;
const authModal = $('#auth-modal');
const authMessage = $('#auth-message');
const navAdmin = $('#nav-admin');

function showView(id){ $$('.view').forEach(v=>v.style.display='none'); $('#'+id+'-view').style.display='block'; }
function showAuthModal(show){ authModal.style.display = show ? 'flex':'none'; }

// ---------------------- AUTH EVENTS ----------------------
$('#signup-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent='';
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  if(!name||!email||!password){ authMessage.textContent='Fill all fields'; return; }
  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,'users',cred.user.uid), {name,email,createdAt:serverTimestamp()});
    authMessage.textContent='Account created — signed in';
  }catch(err){ authMessage.textContent=err.message; }
});

$('#login-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent='';
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
    renderNotifications();
  }else{
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
      <div class="likes"><span class="like-count">0</span> Likes <button class="like-btn btn small">Like</button></div>
      <div class="comments"></div>
      <input class="comment-input" placeholder="Comment..."><button class="comment-btn btn small">Comment</button>
    `);
    feed.appendChild(card);
  });

  // real-time posts from Firestore
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
        <div class="likes"><span class="like-count">${post.likes||0}</span> Likes <button class="like-btn btn small">Like</button></div>
        <div class="comments"></div>
        <input class="comment-input" placeholder="Comment..."><button class="comment-btn btn small">Comment</button>
      `;
      // delete button
      if(currentUser && (currentUser.uid===post.uid || currentUser.uid===ADMIN_UID)){
        const del = el('button',{class:'btn'},'Delete');
        del.style.background='crimson';
        del.addEventListener('click', async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); alert('Post deleted'); });
        card.appendChild(del);
      }
      feed.appendChild(card);
    });

    // add like & comment events
    $$('.like-btn').forEach(btn=>{
      btn.onclick=async e=>{
        const postCard = e.currentTarget.closest('.post');
        const name = postCard.querySelector('h3').textContent;
        const postDoc = await getDocs(query(collection(db,'posts'), where('name','==',name)));
        postDoc.forEach(async d=>{
          const likes = d.data().likes||0;
          await updateDoc(doc(db,'posts',d.id),{likes:likes+1});
          await addDoc(collection(db,'notifications'),{
            to:d.data().uid, from:currentUser.uid, type:'like', postName:name, timestamp:serverTimestamp()
          });
        });
      };
    });

    $$('.comment-btn').forEach(btn=>{
      btn.onclick=async e=>{
        const postCard = e.currentTarget.closest('.post');
        const input = postCard.querySelector('.comment-input');
        const text = input.value.trim();
        if(!text) return;
        const name = postCard.querySelector('h3').textContent;
        const postDoc = await getDocs(query(collection(db,'posts'), where('name','==',name)));
        postDoc.forEach(async d=>{
          const comments = d.data().comments||[];
          comments.push({uid:currentUser.uid,text});
          await updateDoc(doc(db,'posts',d.id),{comments});
          await addDoc(collection(db,'notifications'),{
            to:d.data().uid, from:currentUser.uid, type:'comment', postName:name, text, timestamp:serverTimestamp()
          });
        });
        input.value='';
      };
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
    name:currentUser.displayName||currentUser.email,
    text,
    image: imageUrl,
    timestamp: serverTimestamp(),
    likes:0,
    comments:[]
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
      await addDoc(collection(db,'notifications'),{to:d.id,from:currentUser.uid,type:'friend_request',timestamp:serverTimestamp()});
      alert('Friend request sent');
    });
    card.appendChild(btn); container.appendChild(card);
  });
}

// ---------------------- NOTIFICATIONS ----------------------
async function renderNotifications(){
  if(!currentUser) return;
  const container = $('#notifications'); container.innerHTML='';
  const snap = await getDocs(query(collection(db,'notifications'),where('to','==',currentUser.uid),orderBy('timestamp','desc')));
  snap.forEach(d=>{
    const n = d.data();
    let text='';
    if(n.type==='like') text=`${n.from} liked your post: ${n.postName}`;
    else if(n.type==='comment') text=`${n.from} commented on your post: ${n.postName} - "${n.text}"`;
    else if(n.type==='friend_request') text=`${n.from} sent you a friend request`;
    else if(n.type==='order') text=`${n.from} wants to order ${n.postName} priced at ₦${n.price}`;
    container.appendChild(el('div',{},text));
  });
}

// ---------------------- NAV ----------------------
$('#nav-feed').addEventListener('click', ()=>showView('feed'));
$('#nav-products').addEventListener('click', ()=>showView('products'));
$('#nav-profile').addEventListener('click', ()=>{ showView('profile'); renderFriends(); });
$('#nav-chat').addEventListener('click', ()=>{ showView('chat'); });
$('#nav-admin').addEventListener('click', ()=>{ showView('admin'); });

// ---------------------- INITIAL RENDER ----------------------
async function renderAll(){ renderProducts(); renderFeed(); renderNotifications(); }
