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
    description: `Healingroot AGRO Ventures provides top-quality cassava stems (TME419) selected from healthy mother plants. These stems ensure rapid sprouting, high yield, and strong resistance to cassava mosaic virus. Ideal for both small-scale and commercial farmers, they guarantee sustainable production and profitable returns. With proper care and planting, these stems will develop into robust cassava plants capable of producing abundant tubers while maintaining soil fertility. Our cassava stems are sourced and handled with utmost care to deliver optimal performance in Nigerian farms, supporting food security and economic growth.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Our Hybrid Plantain Suckers are bred for early maturity, high yield, and disease tolerance. Each sucker is carefully selected to ensure uniform growth, consistent bunch size, and strong resistance to pests and diseases. Ideal for commercial plantations or backyard farms, these plantains provide reliable and sustainable income. Healingroot AGRO Ventures ensures that each plant is healthy, vigorous, and capable of producing quality fruits with minimal maintenance, empowering farmers to achieve both efficiency and profitability.`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `The Hybrid Dwarf Banana is designed for high productivity with minimal space. Each plant is selected for disease resistance, fast growth, and optimal fruit quality. Perfect for small-scale farmers, homesteads, and commercial plantations, these bananas yield sweet, market-ready fruits within a short period. Healingroot AGRO Ventures ensures that every banana sucker is nurtured for robust growth, sustainable yields, and consistent returns, providing farmers with a reliable source of nutrition and income.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera oil palm seedlings from Healingroot AGRO Ventures are a long-term agricultural investment. Carefully raised from hybrid seeds, these seedlings are resilient to common diseases, thrive in various soil types, and establish quickly when planted. Ideal for commercial plantations or smallholder farms, they promise high oil yield and sustainable productivity. Each seedling is monitored to ensure quality, vigor, and proper development, giving farmers a reliable start for productive oil palm cultivation.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures provides premium Hybrid Dwarf Coconut Seedlings known for their high survival rate, early fruiting, and manageable height. Perfect for small to medium-scale plantations, these seedlings deliver consistent yields of high-quality coconuts. Each plant is carefully nurtured to ensure strong root development, resilience to local pests and diseases, and optimal growth conditions, giving farmers a productive and profitable coconut cultivation experience.`
  },
  {
    id: "giant_cocoa",
    name: "Hybrid Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Our Hybrid Giant Cocoa Seedlings are specially bred for maximum yield, disease resistance, and robust growth. Each seedling is selected from superior parent trees to guarantee quality beans and high productivity. Ideal for commercial farms or home gardens, these cocoa plants develop strong trunks, healthy foliage, and consistent fruiting cycles. Healingroot AGRO Ventures ensures that all seedlings are healthy and ready for successful cultivation, providing farmers with a dependable source of cocoa income.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Premium Pineapple Seedlings from Healingroot AGRO Ventures are carefully cultivated to produce uniform, sweet, and high-quality fruits. Resistant to common pests and diseases, these seedlings are perfect for commercial plantations or backyard gardens. Each plant is nurtured for rapid establishment, vigorous growth, and long-term productivity, helping farmers achieve profitable pineapple farming with minimal effort.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 700,
    description: `Healingroot AGRO Ventures provides treated yam setts selected from disease-free, high-yielding tubers. These setts ensure quick sprouting, strong tuber development, and high productivity. Suitable for both smallholder farmers and commercial cultivation, they are ideal for producing uniform, high-quality yams. Each sett is carefully prepared to maximize yield, resist pests and diseases, and support sustainable yam farming practices.`
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
    renderNotifications();
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
      <p>${p.description} </p>
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

  // Post creation UI
  const createPost = el('div',{class:'card'}, `
    <h3>Create Post</h3>
    <textarea id="post-text" placeholder="Write something..."></textarea>
    <input id="post-image" type="file" accept="image/*">
    <button id="post-btn" class="btn">Post</button>
  `);
  feed.appendChild(createPost);

  // Post button
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

    const postRef = await addDoc(collection(db,'posts'), {
      uid: currentUser.uid,
      email: currentUser.email,
      name: currentUser.displayName||'',
      text,
      image:imageUrl,
      likes:0,
      timestamp:serverTimestamp()
    });

    $('#post-text').value=''; $('#post-image').value='';
  });

  // Display posts in real time
  const postsRef = collection(db,'posts');
  onSnapshot(query(postsRef, orderBy('timestamp','desc')), snap=>{
    // Remove previous post cards but keep createPost
    feed.innerHTML=''; feed.appendChild(createPost);

    snap.forEach(docSnap=>{
      const post = docSnap.data();
      const card = el('div',{class:'card post'});
      card.innerHTML = `
        <h4>${post.name||'User'}</h4>
        <p>${post.text}</p>
        ${post.image?`<img src="${post.image}" style="max-width:100%;">`:''}
        <p class="muted">by ${post.email||'user'}</p>
        <div class="likes"><span class="like-count">${post.likes||0}</span> Likes <button class="like-btn btn small">Like</button></div>
        <div class="comments" data-post-id="${docSnap.id}"></div>
        <input class="comment-input" placeholder="Comment..."><button class="comment-btn btn small">Comment</button>
      `;
      // delete button
      if(currentUser && (currentUser.uid===post.uid || currentUser.uid===ADMIN_UID)){
        const del = el('button',{class:'btn'},'Delete'); del.style.background='crimson';
        del.addEventListener('click', async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); alert('Deleted'); });
        card.appendChild(del);
      }
      feed.appendChild(card);

      // Like button
      card.querySelector('.like-btn')?.addEventListener('click', async ()=>{
        const postDocRef = doc(db,'posts',docSnap.id);
        const postSnap = await getDoc(postDocRef);
        const currentLikes = postSnap.data()?.likes || 0;
        await updateDoc(postDocRef,{likes:currentLikes+1});

        // notification
        if(post.uid!==currentUser.uid){
          await addDoc(collection(db,'notifications'),{
            userId:post.uid,
            text:`${currentUser.displayName||currentUser.email} liked your post`,
            timestamp:serverTimestamp(),
            type:'like',
            read:false
          });
        }
      });

      // Comment button
      const commentBtn = card.querySelector('.comment-btn');
      commentBtn?.addEventListener('click', async ()=>{
        const input = card.querySelector('.comment-input');
        const text = input.value.trim(); if(!text) return;
        await addDoc(collection(db,'comments'),{
          postId:docSnap.id,
          uid:currentUser.uid,
          name:currentUser.displayName||'',
          text,
          timestamp:serverTimestamp()
        });

        // notification
        if(post.uid!==currentUser.uid){
          await addDoc(collection(db,'notifications'),{
            userId:post.uid,
            text:`${currentUser.displayName||currentUser.email} commented on your post`,
            timestamp:serverTimestamp(),
            type:'comment',
            read:false
          });
        }

        input.value='';
      });

      // render existing comments
      const commentsDiv = card.querySelector('.comments');
      const commentsQuery = query(collection(db,'comments'), where('postId','==',docSnap.id), orderBy('timestamp','asc'));
      onSnapshot(commentsQuery, snapC=>{
        commentsDiv.innerHTML='';
        snapC.forEach(c=>{
          const cData = c.data();
          const div = el('div',{},`<strong>${cData.name}:</strong> ${cData.text}`);
          commentsDiv.appendChild(div);
        });
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
      await addDoc(collection(db,'notifications'),{
        userId:d.id,
        text:`${currentUser.displayName||currentUser.email} sent you a friend request`,
        timestamp:serverTimestamp(),
        type:'friendRequest',
        read:false
      });
      alert('Friend request sent');
    });
    card.appendChild(btn); container.appendChild(card);
  });
}

// ---------------------- NOTIFICATIONS ----------------------
async function renderNotifications(){
  const container = $('#notifications'); if(!container) return;
  container.innerHTML='';
  const notifRef = collection(db,'notifications');
  onSnapshot(query(notifRef, where('userId','==',currentUser.uid), orderBy('timestamp','desc')), snap=>{
    container.innerHTML='';
    snap.forEach(docSnap=>{
      const n = docSnap.data();
      const card = el('div',{class:'card notification'}, `${n.text} <span class="muted">${n.timestamp?.toDate?.()?.toLocaleString()||''}</span>`);
      container.appendChild(card);
    });
  });
}

// ---------------------- NAV ----------------------
$('#nav-feed').addEventListener('click', ()=>showView('feed'));
$('#nav-products').addEventListener('click', ()=>showView('products'));
$('#nav-profile').addEventListener('click', ()=>{ showView('profile'); renderFriends(); });
$('#nav-chat').addEventListener('click', ()=>{}); // Add chat later
$('#nav-admin').addEventListener('click', ()=>{}); // Add admin later

// ---------------------- INITIAL RENDER ----------------------
async function renderAll(){ renderProducts(); renderFeed(); renderNotifications(); }
