// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.firebasestorage.app",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----- Elements -----
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginSubmit = document.getElementById('login-submit');
const signupSubmit = document.getElementById('signup-submit');
const logoutBtn = document.getElementById('logout-btn');

// Sections
const authSection = document.getElementById('auth-section');
const feedSection = document.getElementById('feed-section');
const profileSection = document.getElementById('profile-section');
const productsSection = document.getElementById('products-section');
const chatSection = document.getElementById('chat-section');

// ----- AUTH -----
loginBtn.addEventListener('click', () => {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
});
signupBtn.addEventListener('click', () => {
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
});

signupSubmit.addEventListener('click', async () => {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const pass = document.getElementById('signup-password').value;
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    name,
    email,
    bio: '',
    profilePic: 'default_profile.png',
    friends: [],
    friendRequests: [],
  });
});

loginSubmit.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;
  await signInWithEmailAndPassword(auth, email, pass);
});

logoutBtn.addEventListener('click', async () => { await signOut(auth); });

// ----- AUTH STATE -----
onAuthStateChanged(auth, user => {
  if (user) {
    authSection.style.display = 'none';
    feedSection.style.display = 'block';
    profileSection.style.display = 'block';
    productsSection.style.display = 'block';
    chatSection.style.display = 'block';
    document.getElementById('nav-auth').style.display = 'none';
    document.getElementById('nav-logout').style.display = 'block';
    loadFeed();
    loadProfile();
    loadProducts();
    loadFriends();
    loadNotifications();
  } else {
    authSection.style.display = 'block';
    feedSection.style.display = 'none';
    profileSection.style.display = 'none';
    productsSection.style.display = 'none';
    chatSection.style.display = 'none';
    document.getElementById('nav-auth').style.display = 'block';
    document.getElementById('nav-logout').style.display = 'none';
  }
});

// ----- PRODUCTS -----
const products = [
  { name: 'Cassava', price: 1000, img: 'cassava.JPG', desc: `healingroot AGRO ventures stands as a trusted name in quality crop seedlings across Nigeria. We have built our reputation on reliability, clarity, and genuine agricultural knowledge that helps farmers and investors create lasting income. Our goal is simple: to deliver seedlings that give strong survival rate, high yield, and a clear path to long-term returns. Every seedling we raise is nurtured in a clean nursery environment, inspected carefully, and supplied with full guidance for establishment and expansion. Cassava is a staple crop essential for food security and income generation in Nigeria. Our cassava seedlings are carefully selected for vigor, disease resistance, and yield potential. Farmers planting our cassava can expect reliable growth, consistent tuber quality, and excellent market demand. We also provide ongoing support and guidance for best farming practices to maximize both survival and profitability. Investing in high-quality cassava seedlings ensures a productive farm with consistent returns.` },
  { name: 'Giant Banana', price: 500, img: 'giant_banana.JPG', desc: `healingroot AGRO ventures ensures premium Giant Banana seedlings across Nigeria. These seedlings are nurtured to achieve high yield, strong resilience, and superior fruit quality. Our goal is to provide farmers and investors with a crop that offers reliable income and long-term agricultural value. Each seedling is inspected to meet stringent quality standards, ensuring vigorous growth and disease resistance. By planting Giant Banana seedlings from Healingroot AGRO ventures, you invest in a sustainable crop with strong market demand, excellent nutritional value, and predictable returns. Guidance is provided for farm setup, planting, and ongoing management to ensure each plantation thrives.` },
  { name: 'Tenera Oil Palm', price: 1000, img: 'oilpalm.JPG', desc: `Tenera Oil Palm is a high-value crop supplied by Healingroot AGRO ventures, designed for modern plantations seeking sustainable and profitable agricultural ventures. Our seedlings are true to type, high-yielding, and resilient, supporting long-term returns. The crop adapts well to various soil types and climates in Nigeria, with strong fruiting cycles and exceptional oil content. We provide full guidance on establishment, maintenance, and management, ensuring investors achieve maximum yield. Tenera Oil Palm is a generational wealth crop, capable of producing annual income for decades when properly managed, and it forms a cornerstone for food production, industry, and renewable energy solutions.` },
  { name: 'Plantain', price: 500, img: 'plantain.JPG', desc: `Healingroot AGRO ventures provides top-quality Plantain seedlings for reliable yield and nutritional value. Our seedlings are cultivated in controlled nurseries to ensure strong growth and disease resistance. Plantain is a staple crop, in high demand for both domestic consumption and commercial distribution. Our guidance includes proper spacing, fertilization, and harvesting techniques to maximize output. Investing in our Plantain seedlings ensures consistent production and a sustainable source of income for farmers across Nigeria.` },
  { name: 'Coconut', price: 4500, img: 'coconut.JPG', desc: `Healingroot AGRO ventures offers premium Coconut seedlings for high-yield, long-term agricultural investment. Each seedling is carefully nurtured to ensure optimal growth and fruit production. Coconut is a versatile crop, widely used for oil, water, and industrial purposes. Our farm provides seedlings with strong survival rates, resistance to common pests and diseases, and excellent growth performance. Guidance is provided for soil preparation, planting, and long-term maintenance, ensuring a successful coconut plantation that supports continuous income and industrial supply chains.` },
  { name: 'Giant Cocoa', price: 500, img: 'giant_cocoa.JPG', desc: `Healingroot AGRO ventures supplies high-quality Giant Cocoa seedlings suitable for commercial and smallholder farming. Our seedlings are disease-resistant and grown to produce high yields of cocoa beans with excellent flavor and quality. Cocoa is a high-demand cash crop, and our seedlings ensure early maturation, vigorous growth, and strong market potential. We provide support for plantation establishment, maintenance, and harvesting to maximize returns and sustainable production.` },
  { name: 'Pineapple', price: 400, img: 'pineapple.JPG', desc: `Healingroot AGRO ventures offers robust Pineapple seedlings, delivering high yield, excellent fruit quality, and reliable market demand. Each seedling is carefully selected for vigor, resilience, and adaptability. Our guidance covers planting, fertilization, and harvesting to ensure maximum output. Pineapple is a profitable crop, ideal for smallholders and commercial farms, providing both nutritional and economic benefits.` },
  { name: 'Yam Setts', price: 500, img: 'Yamsett.JPG', desc: `Healingroot AGRO ventures provides top-grade Yam Setts for consistent tuber production and strong market demand. Our setts are selected for size, health, and vigor, ensuring rapid establishment and high yield potential. Yam is a staple crop with year-round demand, and our seedlings are supplied with full guidance on planting, staking, fertilization, and harvesting to ensure reliable production and profitability.` }
];

function loadProducts() {
  const container = document.getElementById('products-container');
  container.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.classList.add('product-item');
    div.innerHTML = `
      <h3>${p.name}</h3>
      <img src="${p.img}" alt="${p.name}" class="product-img">
      <p>${p.desc}</p>
      <p>₦${p.price}</p>
      <a href="https://wa.me/2349138938301?text=I%20want%20to%20order%20${encodeURIComponent(p.name)}" target="_blank" class="order-btn">Order via WhatsApp</a>
    `;
    container.appendChild(div);
  });
}

// ----- FEED, PROFILE, FRIENDS, CHAT, NOTIFICATIONS -----
// Implement full feed system with posts, Cloudinary image upload, friend requests, chat between accepted friends, and notifications handling
