// ======================= FIREBASE =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, increment, arrayUnion
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

let currentUser = null;

// ======================= PRODUCTS =======================
const products = [
{
  id:"oilpalm",
  name:"Tenera Oil Palm Seedlings",
  price:1000,
  image:"images/oilpalm.JPG",
  description:`Tenera oil palm seedlings supplied by Healing Root Agro Ventures are carefully selected to guarantee high productivity, early maturity, and long-term profitability. Oil palm is one of the most valuable perennial crops in Africa and globally, serving food, cosmetic, pharmaceutical, and biofuel industries. Choosing the right seedling determines plantation success for over 25 years.

Our Tenera seedlings are raised in a controlled nursery environment using proven agronomic practices. Each seedling develops strong root systems, thick stems, and healthy leaves that enhance field establishment. Tenera palms are known for their superior oil-to-bunch ratio compared to Dura types, meaning higher oil yield per hectare and better returns on investment.

We support farmers with planting guidance covering land preparation, spacing, fertilization, weed control, and pest management. Early care ensures rapid canopy formation and earlier fruiting. Oil palm requires patience, but once it matures, it provides consistent income annually.

Whether you are a smallholder or commercial investor, Healing Root Agro Ventures ensures you start with certified seedlings that reduce risk and increase long-term yield.`
},
{
  id:"cassava",
  name:"Cassava Stems (TME419)",
  price:1000,
  image:"images/cassava.JPG",
  description:`Cassava is a strategic food and industrial crop, and TME419 remains one of the most reliable varieties for Nigerian farmers. Healing Root Agro Ventures supplies disease-free cassava stems with high survival rates, early maturity, and excellent starch content suitable for garri, flour, fufu, starch, and industrial processing.

Our stems are sourced from healthy mother plants and cut to recommended lengths to ensure rapid sprouting. TME419 performs well across diverse soil conditions and shows strong resistance to common cassava diseases. With proper spacing and fertilizer application, farmers can achieve high yields within a short period.

We provide cultivation advice to help farmers maximize output while reducing losses. From land preparation to harvest timing, our cassava stems offer both food security and income sustainability.`
},
{
  id:"banana",
  name:"Hybrid Dwarf Banana",
  price:500,
  image:"images/giant_banana.JPG",
  description:`Hybrid dwarf banana suckers from Healing Root Agro Ventures are ideal for farmers seeking fast returns and easy management. The dwarf nature reduces wind damage while allowing early fruiting and uniform bunch size.

Banana remains one of the most consumed fruits worldwide. Our suckers are selected for vigor, disease resistance, and fruit quality. Proper fertilization and irrigation can result in multiple harvest cycles annually.

Hybrid dwarf bananas fit well into small and large-scale farms, offering reliable income with relatively low production cost.`
},
{
  id:"plantain",
  name:"Hybrid Plantain Suckers",
  price:500,
  image:"images/plantain.JPG",
  description:`Plantain is a staple crop with consistent market demand. Healing Root Agro Ventures supplies hybrid plantain suckers bred for early maturity, strong disease resistance, and large bunch sizes.

Our suckers are nursery-raised to ensure healthy root development and smooth field establishment. With correct spacing and nutrient management, farmers enjoy steady yields and strong market prices.

Hybrid plantain is suitable for intercropping and commercial plantations alike.`
},
{
  id:"coconut",
  name:"Hybrid Dwarf Coconut",
  price:4500,
  image:"images/coconut.JPG",
  description:`Coconut is a long-term investment crop with multiple income streams. Healing Root Agro Ventures provides hybrid dwarf coconut seedlings that mature earlier and yield consistently.

Coconut products include oil, water, copra, fiber, and by-products for cosmetics and industry. Our seedlings are grown for high survival and long productive lifespan.

With proper spacing and early care, coconut plantations deliver stable returns for decades.`
},
{
  id:"cocoa",
  name:"Hybrid Giant Cocoa",
  price:500,
  image:"images/giant_cocoa.JPG",
  description:`Hybrid giant cocoa seedlings from Healing Root Agro Ventures are selected for pod size, bean quality, and disease tolerance. Cocoa remains a premium export crop with strong global demand.

Our seedlings are suited for smallholders and estate farms. With proper shade management and pruning, cocoa delivers long-term income stability.

We support growers with best practices to achieve export-quality beans.`
},
{
  id:"pineapple",
  name:"Pineapple Seedlings",
  price:400,
  image:"images/pineapple.JPG",
  description:`Pineapple is a fast-growing, high-value fruit crop. Healing Root Agro Ventures supplies uniform pineapple seedlings with excellent sweetness and market appeal.

Pineapple matures quickly and fits both local and export markets. With proper fertilization and spacing, farmers enjoy high returns within a short period.

Our seedlings ensure uniform harvest and quality produce.`
},
{
  id:"yam",
  name:"Treated Yam Setts",
  price:500,
  image:"images/Yamsett.JPG",
  description:`Yam is a staple crop with high cultural and economic value. Healing Root Agro Ventures provides treated yam setts to improve sprouting success and reduce rot.

Our setts are selected from healthy tubers and treated against diseases. Proper staking and nutrient management ensure large tubers and good market prices.

Quality planting material guarantees reliable harvests and improved income.`
}
];

// ======================= AUTH =======================
onAuthStateChanged(auth, user => {
  currentUser = user;
  if(user){
    loadFeed();
    loadProducts();
    listenNotifications();
  }
});

// ======================= PRODUCTS =======================
function loadProducts(){
  const box = document.getElementById("products-container");
  box.innerHTML="";
  products.forEach(p=>{
    box.innerHTML += `
      <div class="product-card">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <strong>₦${p.price}</strong>
        <a target="_blank" href="https://wa.me/2349138938301?text=I want to order ${p.name}">
          Order via WhatsApp
        </a>
      </div>`;
  });
}

// ======================= FEED (REAL TIME) =======================
function loadFeed(){
  const feed = document.getElementById("feed");
  onSnapshot(
    query(collection(db,"posts"), orderBy("createdAt","desc")),
    snap=>{
      feed.innerHTML="";
      snap.forEach(docSnap=>{
        const d = docSnap.data();
        feed.innerHTML += `
        <div class="post">
          <img src="${d.profilePic || 'images/default.png'}">
          <h4>${d.name}</h4>
          <p>${d.text}</p>
          <button onclick="likePost('${docSnap.id}')">❤️ ${d.likes||0}</button>
        </div>`;
      });
    }
  );
}

// ======================= LIKE =======================
window.likePost = async id=>{
  const ref = doc(db,"posts",id);
  await updateDoc(ref,{likes:increment(1)});
  notify("Your post got a like");
};

// ======================= NOTIFICATIONS =======================
function notify(text){
  if(!currentUser) return;
  addDoc(collection(db,"notifications"),{
    uid:currentUser.uid,
    text,
    createdAt:serverTimestamp(),
    read:false
  });
}

function listenNotifications(){
  onSnapshot(
    query(collection(db,"notifications"),where("uid","==",currentUser.uid)),
    snap=>{
      const box=document.getElementById("notifications");
      box.innerHTML="";
      snap.forEach(n=>{
        box.innerHTML+=`<p>📢 ${n.data().text}</p>`;
      });
    }
  );
}
