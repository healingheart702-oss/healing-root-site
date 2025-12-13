// app.js (module)
// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Cloudinary Config
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

let currentUser = null;

// ---------------------- PRODUCTS ----------------------
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures provides TME419 cassava stems, a high-yielding, disease-resistant variety cultivated in optimal nursery conditions to ensure superior germination, robust root system development, and consistent tuber quality. This variety is specifically selected for Nigeria’s diverse soil profiles, providing farmers with early maturity, high starch content, and adaptability to different climatic conditions. By choosing TME419 stems from Healingroot, you secure planting material that is thoroughly inspected for pests and diseases, packaged with detailed planting guidance, and supported with advisory services on soil preparation, spacing, fertilization, and pest management. Farmers who adopt these certified stems experience a remarkable increase in marketable yield, reduced crop failure risks, and enhanced profitability. The industrial demand for TME419 is substantial, catering to food processing companies, starch industries, and livestock feed producers. Unlike traditional varieties, these stems allow for structured planting schedules that maximize harvest cycles and facilitate long-term investment planning. Additionally, this variety supports sustainable agricultural practices, providing a steady income stream for smallholders and commercial farmers alike. Every cassava stem supplied represents a commitment to quality, productivity, and long-term agricultural success, making TME419 an essential crop for both household food security and commercial agribusiness ventures. Healingroot AGRO Ventures stands by its product with ongoing guidance, ensuring each farmer can optimize yields and establish a reliable source of income. The stems are ideal for intercropping or monoculture systems, providing flexibility in farm management, improving soil structure, and increasing resilience to pest and disease pressure. Farmers are advised on water management, nutrient application schedules, and harvesting techniques to maximize both quality and quantity. Selecting TME419 stems ensures access to high-demand markets and creates a pathway to sustainable profitability. Our approach combines superior planting material, agronomic expertise, and practical support to empower farmers to achieve remarkable results, making cassava cultivation a predictable, profitable, and scalable venture. This product is a cornerstone for generating consistent revenue, ensuring long-term farm success, and fostering agricultural growth across Nigeria.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures delivers high-quality hybrid plantain suckers selected for early maturity, disease resistance, uniformity, and robust root development. These suckers are nurtured in clean nursery environments, ensuring strong establishment and consistent bunch size. Plantain is a staple crop with continual market demand, and the use of certified hybrids significantly reduces time to harvest while improving yield uniformity. Farmers receive detailed guidance on spacing, fertilization, pest management, and irrigation practices to maximize the productive potential of each plant. Hybrid plantain from Healingroot is suitable for both smallholder and commercial systems, allowing integration with intercropping strategies for increased land productivity. Quality suckers guarantee higher survival rates and reduce field losses. Additionally, these hybrids produce uniform fruit suitable for fresh consumption or processing into chips, flour, and other value-added products. Adopting our hybrid plantains ensures access to lucrative markets, stable income, and long-term farm sustainability. The product comes with agronomic advice, including soil preparation, nutrient management, and disease control measures, creating an optimal pathway for consistent and profitable production. Healingroot’s commitment extends beyond supply; we support farmers with best practices to optimize yield, ensure market readiness, and develop sustainable, scalable production systems. Each plant establishes a foundation for continuous income and contributes to building farm resilience, enabling farmers to achieve economic stability while meeting market demand for quality plantains. Our approach merges quality planting material with expert guidance, making hybrid plantains a reliable and profitable crop choice for diverse farming operations across Nigeria.`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures supplies Hybrid Dwarf Banana suckers characterized by rapid growth, early fruiting, compact stature, and strong resilience to environmental stress. This variety is cultivated under optimal nursery conditions, guaranteeing uniformity, vigor, and health. Hybrid Dwarf Bananas are well-suited for smallholder and commercial farmers seeking early and predictable returns, offering consistent fruit quality that meets market standards. Our suckers are accompanied by detailed agronomic guidance on soil preparation, spacing, fertilization, irrigation, and pest management, ensuring optimal field establishment and high productivity. The variety supports intercropping, enhances land utilization, and provides sustainable revenue streams through fresh fruit sales and processed banana products like chips and flour. Farmers using certified suckers experience reduced losses, higher yields, and superior market access. Healingroot provides ongoing advice on disease monitoring, post-harvest handling, and value chain development, ensuring maximum profitability. Each banana sucker represents a robust, long-term investment in food security, family income, and commercial growth. Our commitment includes ensuring that plants are disease-free, vigorous, and ready to establish productive orchards, empowering farmers to achieve consistent, market-ready harvests. The Hybrid Dwarf variety combines quality, adaptability, and reliability, delivering a high-yield, economically viable, and low-risk banana production solution. This comprehensive approach ensures the banana plantation becomes a stable, scalable, and sustainable enterprise with predictable income streams for years to come.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures supplies Tenera Oil Palm seedlings, a hybrid variety optimized for high oil yield, early fruiting, and robust disease tolerance. These seedlings are grown in controlled nursery conditions to ensure uniform growth, strong root systems, and successful field establishment. Tenera is a long-term investment crop, providing consistent income for decades and serving as a cornerstone for sustainable agribusiness. Oil palm is a multi-industry crop used extensively in food, cosmetics, biofuels, and manufacturing, and proper establishment of seedlings is critical for achieving maximum productivity. Our Tenera seedlings come with comprehensive planting guidance, including site preparation, spacing, fertilization, pest and weed management, and irrigation advice to secure early survival and optimal growth. Farmers adopting these seedlings benefit from improved canopy formation, accelerated fruiting cycles, and access to high-demand markets. Healingroot supports investors with structured plantation planning, ensuring that Tenera orchards reach full productive potential with minimal risk. The seedlings are true-to-type, healthy, and prepared for commercial or smallholder plantations. This variety enables farmers to secure predictable income, contribute to industrial supply chains, and establish sustainable agricultural systems. Our advisory services help farmers understand market dynamics, industrial uses, and best practices for maximizing output. Tenera Oil Palm from Healingroot AGRO Ventures represents a reliable investment, combining superior planting material, expert guidance, and long-term financial returns, making it an essential choice for anyone serious about sustainable agriculture in Nigeria.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures delivers Hybrid Dwarf Coconut seedlings designed for high survival rates, vigorous growth, and long-term productivity. Coconut is a multi-use crop, producing nuts, copra, oil, and by-products for food, cosmetics, and industrial uses. Our seedlings are raised in controlled nursery environments to ensure uniform root development, healthy crowns, and adaptability to various soil types. Each batch is carefully inspected for disease and pest resistance, ensuring farmers receive only premium planting material. Hybrid Dwarf Coconut seedlings are ideal for smallholder and commercial plantations, enabling early fruiting and high yield potential. We provide comprehensive guidance on spacing, irrigation, nutrient management, pest control, and long-term maintenance to maximize productivity. This variety supports diverse income streams and is a reliable source of sustainable revenue. By planting our certified seedlings, farmers gain access to a foundation for resilient and profitable coconut production, contributing to household income, industrial supply chains, and agricultural development. Healingroot’s support ensures that every plantation has the knowledge, materials, and expertise to thrive, making coconut cultivation predictable, scalable, and profitable for years.`
  },
  {
    id: "giant_cocoa",
    name: "Hybrid Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures provides Hybrid Giant Cocoa seedlings bred for high yield, disease resistance, and uniformity. Cocoa is a premium cash crop with strong domestic and international demand. Each seedling is nurtured in optimized nursery conditions to develop robust roots, consistent height, and disease tolerance. Farmers receive detailed guidance on planting techniques, shade management, fertilization, pruning, and pest management to achieve early productivity and consistent pod quality. The seedlings are ideal for smallholder and commercial growers seeking reliable marketable beans. Adoption of these seedlings reduces field losses, increases yield predictability, and improves income stability. Our post-sale support includes agronomic advice to help maximize plantation potential, ensure sustainable production, and meet quality standards required by buyers. The Hybrid Giant Cocoa variety from Healingroot represents a long-term, profitable investment in cocoa farming, combining quality material, technical guidance, and market-ready support to enhance agricultural outcomes.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Healingroot AGRO Ventures offers premium Pineapple seedlings cultivated for uniformity, pest resistance, and superior fruit quality. Pineapple is a high-value horticultural crop with a growing demand for fresh and processed products. Our seedlings are raised under controlled conditions to ensure healthy root development, uniform growth, and high-quality fruit production. Farmers receive comprehensive guidance on planting density, soil preparation, irrigation, fertilization, and pest management to achieve predictable harvests. Seedlings are suitable for smallholders and commercial plantations aiming for consistent production and market-ready quality. Adoption of certified seedlings reduces risks of crop failure, increases marketable yield, and enhances profitability. We provide practical advice on post-harvest handling, processing options, and market access, ensuring maximum returns. The product enables farmers to integrate pineapple cultivation into diversified farming systems, improve land productivity, and generate steady income. Healingroot’s support ensures seedlings establish successfully and maintain optimal performance, offering a reliable, sustainable, and profitable horticultural investment.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures supplies Treated Yam Setts carefully selected from disease-free, high-yielding mother tubers to ensure rapid sprouting, strong vegetative growth, and uniform tuber development. Yams are a staple food and cash crop in Nigeria, and quality setts directly impact yield reliability, marketability, and income generation. Each sett is treated to minimize rot and maximize sprouting success, allowing farmers to achieve uniform stands and reduce field establishment losses. We provide guidance on soil preparation, staking, fertilization, irrigation, and timely harvesting to optimize tuber quality and market value. Our treated setts empower smallholder and commercial farmers to achieve predictable yields, improve profitability, and strengthen household food security. Adoption of our certified setts reduces production risks, increases revenue stability, and enables efficient farm planning. Healingroot AGRO Ventures combines superior planting material with practical agronomic support, ensuring farmers maximize the productive potential of their yam fields, access high-demand markets, and generate sustainable income from consistent, high-quality tuber production.`
  }
];

// ---------------------- HELPERS ----------------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const el = (tag, attrs={}, innerHTML='') => { const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); e.innerHTML=innerHTML; return e; };

// ---------------------- AUTH ----------------------
const authModal = $('#auth-modal');
const signupForm = $('#signup-form');
const loginForm = $('#login-form');
const logoutBtn = $('#logout-btn');
const authMessage = $('#auth-message');
const navAdmin = $('#nav-admin');

function showAuthModal(show){ authModal.style.display = show ? 'flex' : 'none'; }
function showView(id){ $$('.view').forEach(v=>v.style.display='none'); $('#'+id+'-view').style.display='block'; }

// SIGNUP
signupForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent='';
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  if(!name||!email||!password){ authMessage.textContent='Fill all fields'; return; }
  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,'users',cred.user.uid),{name,email,bio:'',profilePic:'images/default_profile.png',friends:[]});
    authMessage.textContent='Account created & signed in';
  }catch(err){ authMessage.textContent=err.message; }
});

// LOGIN
loginForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent='';
  const email=$('#login-email').value.trim();
  const password=$('#login-password').value;
  try{ await signInWithEmailAndPassword(auth,email,password); }catch(err){ authMessage.textContent=err.message; }
});

// LOGOUT
logoutBtn?.addEventListener('click', async ()=>{ await signOut(auth); });

// AUTH STATE
onAuthStateChanged(auth, async user=>{
  currentUser=user;
  if(user){
    showAuthModal(false);
    $('#logout-btn').style.display='inline-block';
    navAdmin.style.display=(user.uid===ADMIN_UID)?'inline-block':'none';
    await renderAll();
    showView('feed');
  }else{
    showAuthModal(true);
    $('#logout-btn').style.display='none';
    navAdmin.style.display='none';
    showView('feed');
  }
});

// ---------------------- PRODUCTS ----------------------
async function renderProducts(){
  const container = $('#product-list');
  container.innerHTML='';
  products.forEach(p=>{
    const card = el('div',{class:'card product'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
  $$('.order').forEach(btn=>btn.addEventListener('click',e=>{
    const name=e.currentTarget.dataset.name;
    const price=e.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}`)}`,'_blank');
  }));
  $$('.read-more').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();
    const p=products.find(x=>x.id===a.dataset.id);
    alert(p.name+'\n\n'+p.description);
  }));
}

// ---------------------- FEED ----------------------
async function renderFeed(){
  const feed = $('#feed');
  feed.innerHTML='';
  products.forEach(p=>{
    const card=el('div',{class:'card post'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more-prod">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    feed.appendChild(card);
  });
  try{
    const q=query(collection(db,'posts'),orderBy('timestamp','desc'));
    const snap=await getDocs(q);
    snap.forEach(docSnap=>{
      const post=docSnap.data();
      const card=el('div',{class:'card post'});
      card.innerHTML=`
        <img src="${post.image||'images/default_profile.png'}" alt="">
        <h3>${post.name||'User'}</h3>
        <p>${post.text}</p>
      `;
      if(currentUser && (currentUser.uid===post.uid||currentUser.uid===ADMIN_UID)){
        const del=el('button',{class:'btn'},'Delete');
        del.style.background='crimson';
        del.addEventListener('click',async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); renderFeed(); });
        card.appendChild(del);
      }
      feed.appendChild(card);
    });
  }catch(err){ console.error(err); }
  $$('.order').forEach(btn=>btn.addEventListener('click',e=>{
    const name=e.currentTarget.dataset.name;
    const price=e.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}`)}`,'_blank');
  }));
  $$('.read-more-prod').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();
    const p=products.find(x=>x.id===a.dataset.id);
    alert(p.name+'\n\n'+p.description);
  }));
}

// ---------------------- PROFILE ----------------------
$('#save-profile-pic')?.addEventListener('click',async ()=>{
  if(!currentUser)return alert('Sign in');
  const file=$('#profile-upload').files[0];
  if(!file)return alert('Choose file');
  const fd=new FormData();
  fd.append('file',file);
  fd.append('upload_preset',UPLOAD_PRESET);
  try{
    const res=await fetch(CLOUDINARY_URL,{method:'POST',body:fd});
    const data=await res.json();
    const url=data.secure_url;
    await setDoc(doc(db,'users',currentUser.uid),{profilePic:url},{merge:true});
    $('#profile-pic').src=url;
    alert('Saved');
  }catch(err){ console.error(err); alert('Upload failed'); }
});

$('#save-bio')?.addEventListener('click',async ()=>{
  if(!currentUser)return alert('Sign in');
  const bio=$('#bio').value.trim();
  await setDoc(doc(db,'users',currentUser.uid),{bio},{merge:true});
  alert('Bio saved');
});

// ---------------------- FRIENDS ----------------------
async function renderFriends(){
  const container=$('#friends');
  container.innerHTML='';
  const snap=await getDocs(collection(db,'users'));
  snap.forEach(d=>{
    if(d.id===currentUser.uid)return;
    const u=d.data();
    const card=el('div',{class:'card friend'},`<h4>${u.name||u.email}</h4>`);
    const btn=el('button',{class:'btn'},'Add Friend');
    btn.addEventListener('click',async ()=>{
      await addDoc(collection(db,'friendRequests'),{from:currentUser.uid,to:d.id,status:'pending',timestamp:serverTimestamp()});
      alert('Request sent');
    });
    card.appendChild(btn);
    container.appendChild(card);
  });
}

// ---------------------- CHAT ----------------------
let activeChatWith=null;
function openChat(uid){
  activeChatWith=uid;
  $('#chat-window').style.display='block';
  $('#chat-with').textContent='Chat: '+uid;
  loadMessages(uid);
}

$('#send-chat')?.addEventListener('click',async ()=>{
  if(!currentUser||!activeChatWith)return alert('Select friend');
  const msg=$('#chat-input').value.trim();
  if(!msg)return;
  await addDoc(collection(db,'chats'),{from:currentUser.uid,to:activeChatWith,text:msg,timestamp:serverTimestamp()});
  $('#chat-input').value='';
  loadMessages(activeChatWith);
});

async function loadMessages(uid){
  $('#messages').innerHTML='';
  const snap=await getDocs(collection(db,'chats'));
  snap.forEach(d=>{
    const m=d.data();
    if((m.from===currentUser.uid && m.to===uid)||(m.from===uid && m.to===currentUser.uid)){
      const div=el('div',{},`<strong>${m.from===currentUser.uid?'You':'Friend'}:</strong> ${m.text}`);
      $('#messages').appendChild(div);
    }
  });
}

// ---------------------- ADMIN ----------------------
async function renderAdmin(){
  if(!currentUser||currentUser.uid!==ADMIN_UID)return;
  $('#admin-view').style.display='block';
  const usersContainer=$('#admin-users');
  usersContainer.innerHTML='';
  const usnap=await getDocs(collection(db,'users'));
  usnap.forEach(d=>{
    const u=d.data();
    const card=el('div',{class:'card user'},`<h4>${u.name||u.email}</h4><p>${d.id}</p>`);
    usersContainer.appendChild(card);
  });
  const postsContainer=$('#admin-posts');
  postsContainer.innerHTML='';
  const psnap=await getDocs(collection(db,'posts'));
  psnap.forEach(docSnap=>{
    const p=docSnap.data();
    const card=el('div',{class:'card post'},`<h4>${p.name||p.email}</h4><p>${p.text}</p>`);
    const del=el('button',{class:'btn'},'Delete');
    del.style.background='crimson';
    del.addEventListener('click',async ()=>{ await deleteDoc(doc(db,'posts',docSnap.id)); renderAdmin(); });
    card.appendChild(del);
    postsContainer.appendChild(card);
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
    const udoc=await getDoc(doc(db,'users',currentUser.uid));
    if(udoc.exists()){
      const data=udoc.data();
      $('#profile-pic').src=data.profilePic||'images/default_profile.png';
      $('#bio').value=data.bio||'';
    }
    renderFriends();
    renderAdmin();
  }
}

// INITIAL
document.addEventListener('DOMContentLoaded',()=>{ showView('feed'); });
