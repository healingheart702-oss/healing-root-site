// ---------------------- DOM helpers ----------------------
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
function el(tag, attrs = {}, innerHTML = '') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,v));
  e.innerHTML = innerHTML;
  return e;
}

// ---------------------- FIREBASE SETUP ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

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

// ---------------------- CLOUDINARY ----------------------
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

// ---------------------- ADMIN & GLOBAL STATE ----------------------
const ADMIN_UID = "zqq3aNV8HqdkcnvRKosTE40YbIn2"; 
let currentUser = null;
let currentProfile = null; 

// ---------------------- PRODUCTS (FULL LIST) ----------------------
const products = [
  { id:"cassava", name:"Cassava Stems (TME419)", image:"images/cassava.JPG", price:1000, description:`Healing Root Agro Ventures provides premium TME419 cassava stems known for high yield, disease resistance, and strong root development. Each stem is nurtured in a controlled nursery to ensure survival rates above 95%, giving farmers a reliable start. Our cassava stems are ideal for commercial farming, guaranteeing tuber quality and consistent income for small and large-scale farmers across Nigeria. Full planting guidance and farm management tips are provided with every purchase.` },
  { id:"plantain", name:"Hybrid Plantain Suckers", image:"images/plantain.JPG", price:500, description:`Our Hybrid Plantain Suckers are carefully selected for vigor, early fruiting, and high production. Raised in hygienic nurseries, these suckers adapt easily to different soil types and climates in Nigeria. With strong resistance to pests and diseases, they provide farmers with dependable growth and fruiting cycles. Each purchase comes with detailed planting and care instructions to ensure optimal yield and long-term plantation success.` },
  { id:"banana", name:"Hybrid Dwarf Banana", image:"images/giant_banana.JPG", price:500, description:`The Hybrid Dwarf Banana from Healing Root Agro Ventures offers early maturation, high fruit quality, and strong resistance to common diseases. Ideal for both backyard gardens and commercial plantations, these banana seedlings ensure consistent yield and minimal maintenance. Raised in controlled nurseries, each seedling is ready for immediate transplantation, helping farmers secure profitable banana production with long-term benefits.` },
  { id:"oilpalm", name:"Tenera Oil Palm Seedlings", image:"images/oilpalm.JPG", price:1000, description:`Healing Root Agro Ventures Tenera Oil Palm Seedlings are top-quality planting materials carefully raised to ensure maximum yield, disease resistance, and early fruiting. Each seedling undergoes rigorous nursery management including proper fertilization, pest control, and root development enhancement. Suitable for commercial plantations, these seedlings guarantee consistent bunch production, high oil content, and longevity of palms. Farmers are provided with full planting guidelines, soil preparation techniques, and maintenance tips to achieve optimal growth, minimize losses, and maximize return on investment. Our seedlings are acclimatized to different soil types and Nigerian climatic conditions, making them ideal for large and small-scale farming. With a focus on sustainable practices, every purchase ensures not only high productivity but also long-term farm profitability. This comprehensive package enables growers to establish healthy plantations, increase oil extraction efficiency, and secure a dependable income from the first harvest to full maturity.` },
  { id:"coconut", name:"Hybrid Dwarf Coconut Seedlings", image:"images/coconut.JPG", price:4500, description:`Our Hybrid Dwarf Coconut Seedlings are fast-growing, high-yielding, and ideal for small to medium-scale farms. Each seedling is carefully raised to ensure healthy root systems, strong stem development, and early fruiting. Farmers benefit from reliable growth, superior nut quality, and high survival rates. Planting instructions and care guidance are included with every purchase for optimal results.` },
  { id:"giant_cocoa", name:"Hybrid Giant Cocoa Seedlings", image:"images/giant_cocoa.JPG", price:500, description:`Healing Root Agro Ventures offers Hybrid Giant Cocoa Seedlings that combine high yield with strong resistance to common diseases. Raised in clean nurseries, these seedlings adapt well to Nigerian soils and climates, giving farmers dependable growth and fruiting cycles. Each purchase comes with expert guidance on planting, maintenance, and pest control to maximize long-term cocoa production.` },
  { id:"pineapple", name:"Pineapple Seedlings", image:"images/pineapple.JPG", price:400, description:`Premium Pineapple Seedlings from Healing Root Agro Ventures are selected for rapid growth, high fruit quality, and uniformity. They are raised in controlled nursery conditions to ensure strong establishment and survival. Ideal for both commercial and backyard planting, these seedlings come with planting and care instructions to guarantee maximum fruit yield and consistent quality.` },
  { id:"yam", name:"Treated Yam Setts", image:"images/Yamsett.JPG", price:700, description:`Our Treated Yam Setts are carefully selected tubers treated for disease resistance and enhanced sprouting. Each sett is ideal for both smallholder and commercial farms, ensuring rapid germination, uniform growth, and high tuber yield. Healing Root Agro Ventures provides full guidance on soil preparation, planting, and maintenance for maximum productivity and profitable harvests.` }
];

// ---------------------- GLOBAL HELPERS FOR HTML ----------------------
window.showView = function(viewId) {
    $$('.view').forEach(v => v.style.display = 'none');
    const target = $('#' + viewId + '-view');
    if (target) target.style.display = 'block';

    // Update Bottom Nav UI
    $$('.nav-item').forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('onclick')?.includes(`'${viewId}'`)) {
            item.classList.add('active');
        }
    });
};

window.openReadMore = function(title, text) {
  $('#read-more-title').textContent = title;
  $('#read-more-text').textContent = text;
  $('#read-more-modal').style.display = 'flex';
};

// ---------------------- AUTH ACTIONS ----------------------
$('#login-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  try { 
      await signInWithEmailAndPassword(auth, email, password);
  } catch (err) { alert(err.message); }
});

// Logout Fix
document.getElementById('logout-trigger').onclick = async () => {
    await signOut(auth);
    location.reload();
};

onAuthStateChanged(auth, async user => {
  currentUser = user;
  if (user) {
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    currentProfile = docSnap.exists() ? docSnap.data() : null;
    
    // UI Setup
    $('#auth-modal').style.display = 'none';
    $('#main-app').style.display = 'block';
    
    // Sync Profile Info to UI
    if (currentProfile) {
        $('#user-name-display').innerText = currentProfile.name;
        $('#menu-name').innerText = currentProfile.name;
        if(currentProfile.profilePic) {
            $('#profile-pic-display').src = currentProfile.profilePic;
            $('#menu-avatar').src = currentProfile.profilePic;
        }
    }

    renderProducts();
    loadSocialFeed();
  } else {
    $('#auth-modal').style.display = 'flex';
    $('#main-app').style.display = 'none';
  }
});

// ---------------------- RENDERING ----------------------
function renderProducts() {
  const container = $('#product-list');
  if (!container) return;
  container.innerHTML = '';
  products.forEach(p => {
    const card = el('div', { class: 'card product' }, `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p><b>Price: ₦${p.price.toLocaleString()}</b></p>
      <p>${p.description.slice(0, 100)}... <span style="color:#28a745; cursor:pointer; font-weight:bold;" onclick="window.openReadMore('${p.name}', '${p.description}')">Read more</span></p>
      <button class="login-btn" style="padding:10px; font-size:14px;" onclick="window.open('https://wa.me/2349138938301?text=Hello, I want to order ${p.name}')">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
}

function loadSocialFeed() {
  const feed = $('#feed-items');
  if (!feed) return;
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));

  onSnapshot(q, async snapshot => {
    feed.innerHTML = '';
    // Inject Products into top of Feed
    products.forEach(p => {
        const prodHtml = el('div', { class: 'card product' }, `
          <img src="${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p><b>Price: ₦${p.price.toLocaleString()}</b></p>
          <p>${p.description.slice(0, 100)}... <span style="color:#28a745; cursor:pointer; font-weight:bold;" onclick="window.openReadMore('${p.name}', '${p.description}')">Read more</span></p>
          <button class="login-btn" style="padding:10px; font-size:14px;" onclick="window.open('https://wa.me/2349138938301?text=Hello, I want to order ${p.name}')">Order via WhatsApp</button>
        `);
        feed.appendChild(prodHtml);
    });

    // Load User Posts
    snapshot.docs.forEach(docSnap => {
      const post = docSnap.data();
      const card = el('div', { class: 'card post' }, `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <img src="images/default_profile.png" style="width:35px; height:35px; border-radius:50%;">
            <b style="font-size:14px;">Farmer</b>
        </div>
        <p>${post.text}</p>
        ${post.image ? `<img src="${post.image}">` : ''}
      `);
      feed.appendChild(card);
    });
  });
}

// ---------------------- PROFILE UPDATE ----------------------
$('#save-profile')?.addEventListener('click', async () => {
    const name = $('#edit-name').value.trim();
    const bio = $('#edit-bio').value.trim();
    const file = $('#pic-upload').files[0];
    let updates = {};

    if(name) updates.name = name;
    if(bio) updates.bio = bio;

    if(file) {
        const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
        const data = await res.json();
        updates.profilePic = data.secure_url;
    }

    await updateDoc(doc(db, 'users', currentUser.uid), updates);
    alert("Healing Root Profile Updated!");
});

// Exporting to satisfy index.html import
export { auth, db, products };
