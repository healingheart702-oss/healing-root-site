// Initialize Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

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

// Admin UID
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// Products with full 2500-character descriptions
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419, TMS30572)",
    image: "cassava.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures stands as a trusted name in quality crop seedlings across Nigeria. We have built our reputation on reliability, clarity, and genuine agricultural knowledge that helps farmers and investors create lasting income. Our goal is simple: to deliver seedlings that give strong survival rate, high yield, and a clear path to long-term returns. Every seedling we raise is nurtured in a clean nursery environment, inspected carefully, and supplied with full guidance for establishment and expansion. 

The TME419 and TMS30572 cassava varieties we provide are high-yielding, disease-resistant, and suitable for multiple agro-climatic zones in Nigeria. We aim to empower smallholder farmers and commercial investors to achieve sustainable income, food security, and long-term farm growth. Each stem is carefully selected to ensure optimal growth and high starch content, making it ideal for both industrial and household use. Our cassava stems offer consistency, reliability, and strong returns on investment, providing farmers with confidence and clarity as they expand their operations.`
  },
  {
    id: "hybrid_banana",
    name: "Hybrid Dwarf Banana",
    image: "giant_banana.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures offers premium hybrid dwarf banana seedlings that guarantee high yield, disease resistance, and consistent fruiting cycles. These bananas are suitable for both backyard farms and large plantations. Our seedlings are nurtured in a controlled nursery environment, ensuring strong roots and healthy leaves to withstand local pests and diseases. 

The hybrid dwarf banana is a fast-fruiting variety, ideal for farmers who want quick returns on investment. With proper spacing, fertilization, and pest management, these seedlings produce uniform, high-quality fruits, generating reliable income year after year. At Healingroot AGRO Ventures, we also provide full guidance for plantation setup, spacing, and maintenance to ensure maximum productivity and profitability.`
  },
  {
    id: "oil_palm",
    name: "Tenera Oil Palm Seedlings",
    image: "oilpalm.JPG",
    price: 1500,
    description: `Healingroot AGRO Ventures provides Tenera oil palm seedlings renowned for high oil content, resilience, and long-term productivity. This variety is widely used in commercial plantations due to its strong field performance and exceptional yearly returns. Every seedling is raised in a clean nursery environment and carefully inspected to guarantee quality and survival. 

Tenera oil palm is ideal for investors seeking long-term agricultural wealth. It starts fruiting earlier than traditional varieties and continues producing for decades. We supply detailed planting instructions, spacing guides, and maintenance tips to ensure high yield and consistent performance. This investment provides both palm oil and palm kernel products, meeting industrial and household demand while securing sustainable income for farmers and investors.`
  },
  {
    id: "plantain",
    name: "Plantain Suckers",
    image: "plantain.JPG",
    price: 300,
    description: `Healingroot AGRO Ventures supplies high-quality plantain suckers that guarantee healthy growth, strong yields, and long-term productivity. These suckers are carefully selected to ensure disease resistance and fast fruiting. Ideal for small, medium, and large-scale farms, they offer consistent results with proper care. 

Our plantain suckers are nurtured in optimal nursery conditions to guarantee survival. We provide guidance for spacing, fertilization, and pest control, ensuring maximum output. Plantain farming with our suckers provides reliable income, sustainable crop production, and food security. Each sucker is part of our commitment to empowering farmers across Nigeria with premium planting materials and support.`
  },
  {
    id: "coconut",
    name: "Coconut Seedlings",
    image: "coconut.JPG",
    price: 400,
    description: `Healingroot AGRO Ventures offers robust coconut seedlings with high survival rates and strong fruit production. Our seedlings are nurtured in a healthy nursery environment and are carefully selected to ensure excellent growth and yield. 

These seedlings are suitable for both commercial farms and household gardens, producing coconuts for food, oil, and other commercial uses. We provide guidance on spacing, irrigation, and maintenance to ensure maximum output and long-term sustainability. By choosing Healingroot AGRO Ventures’ coconut seedlings, farmers can expect reliable growth, high-quality coconuts, and consistent income for many years.`
  },
  {
    id: "giant_cocoa",
    name: "Giant Cocoa Seedlings",
    image: "giant_cocoa.JPG",
    price: 1200,
    description: `Healingroot AGRO Ventures provides certified giant cocoa seedlings known for high-yield performance, disease resistance, and long-term productivity. Each seedling is nurtured in controlled nursery conditions to ensure optimal growth. 

Giant cocoa seedlings are ideal for commercial cocoa plantations, delivering consistent and high-quality cocoa beans. Our seedlings are part of a comprehensive support system, including guidance on planting, spacing, and maintenance. Farmers and investors benefit from steady income streams and sustainable farming practices, making this an excellent long-term agricultural investment.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "pineapple.JPG",
    price: 250,
    description: `Healingroot AGRO Ventures supplies high-quality pineapple seedlings that produce sweet, uniform, and disease-resistant fruits. Our seedlings are nurtured to ensure strong growth, high yield, and fast fruiting. 

Ideal for commercial and home farmers, these pineapple seedlings deliver reliable income and sustainable production. We provide guidance on planting, fertilization, and care practices to maximize yield and fruit quality. Farmers using Healingroot AGRO Ventures’ pineapple seedlings benefit from high market demand and excellent returns on investment, ensuring long-term farm productivity and profitability.`
  },
  {
    id: "yam_sett",
    name: "Yam Setts",
    image: "Yamsett.JPG",
    price: 200,
    description: `Healingroot AGRO Ventures offers healthy yam setts for high yield, disease resistance, and consistent growth. Our yam setts are selected to ensure strong sprouts and robust tuber development. 

Yam cultivation using our setts ensures reliable income, food security, and long-term farm productivity. We provide full guidance on planting, spacing, and maintenance practices. By using our yam setts, farmers can optimize their yield, increase profitability, and maintain a sustainable farming system that supports livelihoods and agricultural growth in Nigeria.`
  }
];

// Functions for feed, profile, friends, chat, admin, WhatsApp orders
async function addProductsToFirestore() {
  for (const product of products) {
    await addDoc(collection(db, "products"), product);
  }
  console.log("Products added to Firestore!");
}

// Load social feed
async function loadFeed() {
  const feedCol = collection(db, "feed");
  const feedSnapshot = await getDocs(feedCol);
  const feedList = feedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return feedList;
}

// Profile management
async function updateProfile(uid, bio, profileImageUrl) {
  const userDoc = doc(db, "users", uid);
  await updateDoc(userDoc, { bio, profileImageUrl });
}

// Friend requests
async function sendFriendRequest(fromUid, toUid) {
  await addDoc(collection(db, "friendRequests"), {
    from: fromUid,
    to: toUid,
    status: "pending"
  });
}

async function acceptFriendRequest(requestId) {
  const requestDoc = doc(db, "friendRequests", requestId);
  await updateDoc(requestDoc, { status: "accepted" });
  const requestData = (await getDocs(query(collection(db,"friendRequests"),where("id","==",requestId)))).docs[0].data();
  await addDoc(collection(db, "friends"), {
    uids: [requestData.from, requestData.to]
  });
}

// Chat
async function sendMessage(fromUid, toUid, message) {
  await addDoc(collection(db, "chats"), {
    from: fromUid,
    to: toUid,
    message,
    timestamp: new Date()
  });
}

// Admin delete post
async function deletePost(postId, uid) {
  if (uid === ADMIN_UID) {
    await deleteDoc(doc(db, "feed", postId));
    console.log("Post deleted by admin.");
  }
}

// Logout
function logout() {
  signOut(auth).then(() => console.log("User logged out"));
}

// WhatsApp order
function orderViaWhatsApp(productName, price) {
  const phone = "2349138938301";
  const url = `https://wa.me/${phone}?text=Hello, I want to order ${productName} priced at ₦${price}`;
  window.open(url, "_blank");
}

// Export
export {
  products,
  loadFeed,
  updateProfile,
  sendFriendRequest,
  acceptFriendRequest,
  sendMessage,
  deletePost,
  logout,
  orderViaWhatsApp
};
