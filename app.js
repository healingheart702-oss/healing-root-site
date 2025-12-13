// app.js — Healingroot Agro Ventures Full Client Logic

// ---------------------- FIREBASE & CLOUDINARY ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Cloudinary unsigned upload config
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
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function el(tag, attrs = {}, innerHTML='') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
  e.innerHTML = innerHTML;
  return e;
}

// ---------------------- PRODUCTS ----------------------
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures stands as Nigeria's trusted source for superior cassava seedlings. Our TME419 variety is meticulously cultivated for high survival, early maturity, and premium starch content. Every stem is nurtured under controlled nursery conditions, ensuring disease-free, vigorous planting material. Farmers gain practical guidance on spacing, fertilization, pest control, and harvest timing to maximize yield. Industrial demand spans flour, garri, starch, ethanol, and animal feed. Starting with recommended planting densities, smallholders and commercial investors alike can establish predictable, long-term income streams. Our stems provide both food security and scalable marketable produce. Beyond supply, we deliver expert agronomy support to optimize crop cycles and enhance profitability. By choosing Healingroot, you secure reliable, repeatable results that build farm value year after year, with clear pathways for both household and commercial scale operations. This variety transforms potential land into productive acreage, unlocking continuous returns and empowering farmers with sustainable practices and robust market-ready cassava production.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Our Hybrid Plantain Suckers are designed to accelerate maturity and improve yield consistency for both smallholders and commercial plantations. Raised in well-managed nurseries, these suckers boast robust root systems, disease resistance, and uniform crown development. Healingroot AGRO Ventures provides step-by-step guidance on spacing, fertilization, mulching, and pest control to maximize harvest predictability. Plantain serves as a staple and cash crop, with versatile markets including fresh sales, chips, and processed products. Properly established suckers deliver reliable early income, reduce crop failure risk, and improve intercropping opportunities. Our focus is on quality, consistency, and post-sale support to ensure your plantation thrives, turning investment into sustained, market-ready production, while strengthening food security and generating profitable returns across multiple growing seasons.`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `The Hybrid Dwarf Banana from Healingroot AGRO Ventures ensures early fruiting, reduced wind damage, and uniformity of bunch size for market appeal. Our nursery selection prioritizes vigorous, disease-free plants ready for field establishment. Bananas are high-turnover crops with consistent demand in urban and rural markets, offering rapid return on investment when managed with proper fertilization, spacing, and pest control. Processed products like chips and flour create additional income streams. Our post-sale agronomic support ensures plantations reach full production potential, enabling farmers to expand operations gradually while maintaining consistent yield quality, transforming quality suckers into reliable, sustainable revenue for households and commercial ventures alike.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera Oil Palm seedlings represent a long-term wealth-building investment, favored for their high oil-to-bunch ratio and early productive maturity. Healingroot AGRO Ventures raises each seedling in optimal nursery conditions, ensuring robustness, early vigour, and survival in field conditions. Plantation guidance includes land preparation, spacing, fertilizer management, and pest control. Oil palm supports multiple industries, from food processing to biofuels and cosmetics. Properly managed plantations yield consistent long-term income, safeguarding generational wealth. Seedlings are supplied true-to-type and accompanied by practical agronomic guidance to maximize returns. The crop’s longevity, market stability, and industrial demand provide a reliable, renewable source of income for decades, supporting both small-scale farmers and commercial investors seeking resilient agricultural assets.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures supplies Hybrid Dwarf Coconut seedlings cultivated for high survival, vigorous growth, and early productivity. Coconut is versatile, providing food, oil, fiber, and industrial raw materials. Our seedlings are nursery-raised to ensure strong root development and uniform growth. With expert guidance on spacing, irrigation, and pest management, growers can establish productive orchards. Coconut plantations provide multiple revenue streams and long-term returns. We ensure seedlings reach your farm in prime condition, reducing establishment loss, and delivering consistent yield potential. Each seedling comes with practical cultivation advice for maximizing long-term profitability and sustainable income generation.`
  },
  {
    id: "giant_cocoa",
    name: "Hybrid Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Our Hybrid Giant Cocoa Seedlings are selected for high-yield potential and resistance to common diseases. Cocoa is a premium cash crop, essential for chocolate and confectionery markets globally. Healingroot AGRO Ventures ensures seedlings have strong root systems and uniformity to improve field performance. Farmers receive comprehensive guidance on planting, shade management, pruning, and pest control. These seedlings are designed to deliver early, quality pods, improve marketable bean consistency, and increase profitability. Post-sale agronomy support ensures farmers achieve full harvest potential and sustain productive plantations over the long term.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Premium Pineapple Seedlings from Healingroot AGRO Ventures guarantee uniform fruit, sweetness, and pest resilience. Pineapple is high-value horticulture with multiple market avenues, including fresh consumption and processing. Our seedlings are raised for strong field establishment and early maturity. We provide detailed guidance on planting density, nutrition, irrigation, and pest control to optimize yield quality and quantity. Growers benefit from predictable harvest cycles, enhanced market access, and strong income potential. Each seedling is backed by expert advice to ensure maximum commercial and household returns.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures supplies treated yam setts carefully selected for high sprouting rate, uniform growth, and disease-free establishment. Yam is a critical staple crop and cash source. Our setts are processed to reduce rot and encourage rapid growth. Farmers are advised on staking, fertilization, and harvest timing to optimize tuber quality and quantity. Using our treated setts reduces risk, increases predictability, and improves profitability. Each purchase is coupled with practical guidance, helping growers maximize field performance and sustain income across multiple seasons.`
  }
];

// ---------------------- AUTH ----------------------
let currentUser = null;
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if(user){
    $('#logout-btn').style.display='inline-block';
    renderAll();
  } else {
    $('#logout-btn').style.display='none';
  }
});

$('#signup-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,'users',cred.user.uid),{name,email,bio:'',profilePic:'default_profile.png',friends:[],createdAt:serverTimestamp()});
    alert('Account created');
  }catch(err){ alert(err.message); }
});

$('#login-form')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  try{ await signInWithEmailAndPassword(auth,email,password); }catch(err){ alert(err.message);}
});

$('#logout-btn')?.addEventListener('click', async ()=>{await signOut(auth); location.reload();});

// ---------------------- RENDER PRODUCTS ----------------------
async function renderProducts(){
  const container = $('#product-list'); container.innerHTML='';
  products.forEach(p=>{
    const card = el('div',{class:'card product'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
  $$('.order').forEach(btn=>btn.addEventListener('click', e=>{
    const name=e.currentTarget.dataset.name;
    const price=e.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=I want to order ${name} priced at ₦${price}`,'_blank');
  }));
  $$('.read-more').forEach(a=>a.addEventListener('click', e=>{
    e.preventDefault(); const id=e.currentTarget.dataset.id;
    const p=products.find(x=>x.id===id); alert(p.name+'\n\n'+p.description);
  }));
}

// ---------------------- RENDER FEED ----------------------
async function renderFeed(){
  const feed=$('#feed'); feed.innerHTML='';
  products.forEach(p=>{
    const card=el('div',{class:'card post'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more-feed">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    feed.appendChild(card);
  });
  $$('.read-more-feed').forEach(a=>a.addEventListener('click', e=>{
    e.preventDefault(); const id=e.currentTarget.dataset.id;
    const p=products.find(x=>x.id===id); alert(p.name+'\n\n'+p.description);
  }));
  $$('.order').forEach(btn=>btn.addEventListener('click', e=>{
    const name=e.currentTarget.dataset.name;
    const price=e.currentTarget.dataset.price;
    window.open(`https://wa.me/2349138938301?text=I want to order ${name} priced at ₦${price}`,'_blank');
  }));
  // Load posts from Firestore
  const q=query(collection(db,'posts'),orderBy('timestamp','desc'));
  const snap = await getDocs(q);
  snap.forEach(docSnap=>{
    const post = docSnap.data();
    const card = el('div',{class:'card post'});
    card.innerHTML=`<h3>${post.name||post.email}</h3><p>${post.text}</p>`;
    if(currentUser && (currentUser.uid===post.uid||currentUser.uid===ADMIN_UID)){
      const del=el('button',{class:'btn'},'Delete'); del.style.background='crimson';
      del.addEventListener('click', async ()=>{await deleteDoc(doc(db,'posts',docSnap.id)); alert('Deleted'); renderFeed();});
      card.appendChild(del);
    }
    feed.appendChild(card);
  });
}

// ---------------------- FRIEND REQUESTS ----------------------
async function renderFriends(){
  const container=$('#friends'); container.innerHTML='';
  const snap = await getDocs(collection(db,'users'));
  snap.forEach(d=>{
    if(d.id===currentUser.uid) return;
    const u=d.data();
    const card=el('div',{class:'card friend'},`<h4>${u.name}</h4>`);
    const btn=el('button',{},'Add Friend'); btn.className='btn';
    btn.addEventListener('click', async ()=>{await addDoc(collection(db,'friendRequests'),{from:currentUser.uid,to:d.id,status:'pending',createdAt:serverTimestamp()}); alert('Friend request sent');});
    card.appendChild(btn); container.appendChild(card);
  });
}

// Chat, profile, notifications, admin logic can be added similarly

// ---------------------- INITIAL RENDER ----------------------
document.addEventListener('DOMContentLoaded', async ()=>{
  await renderProducts();
  await renderFeed();
  if(currentUser){ renderFriends(); }
});
