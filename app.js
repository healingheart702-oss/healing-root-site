// ==========================
// app.js (FINAL FULL FILE)
// ==========================

// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// ==========================
// Firebase Config (UNCHANGED)
// ==========================
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

// ==========================
// GLOBAL STATE
// ==========================
let currentUser = null;
let activeChatUser = null;
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";
// ==========================
// PRODUCTS (FULL DATA)
// ==========================
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot Agro Ventures supplies premium-quality TME419 cassava stems carefully selected from disease-free, high-yielding mother plants. Cassava remains one of the most reliable food and industrial crops in Nigeria, supporting garri processing, flour production, starch extraction, livestock feed, and ethanol industries. The TME419 variety is known for its early maturity, strong vigor, excellent tuber size, and high starch content, making it ideal for both smallholder and commercial-scale farmers.

Our cassava stems are handled under strict nursery and field inspection processes to ensure high sprouting rates and uniform growth. Proper planting material is the foundation of cassava success, and poor-quality stems often result in uneven stands, disease spread, and low yields. By choosing certified stems from Healingroot, farmers significantly reduce establishment risks and improve long-term productivity.

Cassava thrives across diverse soil types when supported with correct spacing, timely fertilizer application, and weed control. We provide guidance on agronomic best practices to help farmers maximize yield per hectare. With rising industrial demand and consistent household consumption, cassava farming remains a dependable source of income and food security. Healingroot Agro Ventures is committed to supporting farmers with quality stems that translate into profitable harvests season after season.`
  },
  {
    id: "banana",
    name: "Giant Banana (Hybrid Dwarf)",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `Our Giant Hybrid Dwarf Banana seedlings are selected for early fruiting, strong stems, and resistance to lodging caused by wind. Banana farming offers quick returns due to its short production cycle and continuous harvest potential. Healingroot Agro Ventures raises these seedlings under controlled conditions to ensure healthy roots and vigorous field establishment.

Bananas have steady demand across markets for fresh consumption, processing into chips, flour, and baby food. The hybrid dwarf variety is easier to manage, requires less staking, and performs well in both sole cropping and intercropping systems. Farmers benefit from uniform bunch sizes and improved fruit quality, increasing market acceptance and profitability.

With proper nutrition, spacing, and pest management, hybrid bananas provide consistent yields year-round. Healingroot supports growers with planting guidance and post-sale advice to ensure sustainable productivity and reliable income generation.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera oil palm seedlings from Healingroot Agro Ventures represent a long-term agricultural investment with high economic potential. Tenera palms are the preferred hybrid in modern plantations due to their superior oil-to-bunch ratio, early fruiting characteristics, and higher yield performance compared to traditional dura types.

Oil palm supports multiple industries including food processing, cosmetics, pharmaceuticals, and biofuels. Establishing a productive plantation depends heavily on the quality of seedlings used. Our seedlings are raised to strong nursery standards, ensuring healthy root development, vigorous growth, and high field survival rates.

We provide guidance on land preparation, spacing, nutrient management, and early weed control to support successful plantation establishment. With proper management, oil palm plantations produce consistent yields for decades, making them suitable for investors, cooperatives, and commercial farmers seeking sustainable long-term returns.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Hybrid plantain suckers from Healingroot Agro Ventures are selected for uniform growth, early maturity, and resistance to common diseases. Plantain is a staple food crop with constant market demand across Nigeria, making it a reliable income source for farmers of all scales.

Our suckers are raised in clean nursery conditions to minimize disease transmission and ensure strong establishment after transplanting. Proper spacing, mulching, and nutrient management significantly improve bunch size and yield consistency.

Plantain integrates well into mixed farming systems and provides early returns while supporting soil conservation. Healingroot supports farmers with technical advice to maximize productivity and profitability throughout the production cycle.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot Agro Ventures supplies high-quality hybrid dwarf coconut seedlings suitable for commercial plantations and homestead farming. Coconut is a versatile perennial crop producing nuts, oil, copra, fiber, and value-added products used in food, cosmetics, and industrial sectors.

Our seedlings are selected for early bearing, strong root systems, and high survival rates. Proper orchard establishment, spacing, and early care are critical to long-term productivity. Coconut palms offer decades of harvest once established, making them an excellent long-term investment.

We provide agronomic guidance to help farmers reduce establishment losses and optimize yield potential.`
  },
  {
    id: "cocoa",
    name: "Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Giant cocoa seedlings from Healingroot Agro Ventures are produced from improved planting material to ensure strong establishment and consistent pod production. Cocoa remains a premium export crop with strong global demand driven by the chocolate and confectionery industries.

Our seedlings are raised under nursery conditions that promote healthy growth and disease resistance. Proper shade management, pruning, and nutrition are essential for sustained yields and bean quality.

Healingroot supports cocoa farmers with quality seedlings and practical agronomic advice to improve productivity and income stability over time.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Healingroot Agro Ventures supplies premium pineapple seedlings selected for uniform growth, sweetness, and market appeal. Pineapple is a high-value horticultural crop with strong demand for fresh consumption and processing into juice, canned products, and concentrates.

Our seedlings are suitable for smallholders and commercial producers seeking quick returns. With proper planting density, fertilization, and pest management, pineapples deliver predictable yields and attractive profits.

We provide technical guidance to help farmers maximize fruit quality and market value.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 500,
    description: `Healingroot Agro Ventures supplies treated yam setts selected from healthy, high-yielding mother tubers. Yam is a culturally and economically important staple crop, providing food security and income for millions of households.

Our setts are treated to reduce rot and improve sprouting success, resulting in uniform stands and better tuber development. Proper staking, weed control, and nutrient management further enhance yields.

By using treated planting materials, farmers reduce production risks and improve overall farm performance and profitability.`
  }
];
// ==========================
// CLOUDINARY (UNCHANGED)
// ==========================
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

// ==========================
// HELPERS
// ==========================
const $ = (id) => document.getElementById(id);
const show = (id) => document.querySelectorAll(".view").forEach(v => v.style.display = "none") || ($(id).style.display = "block");

// ==========================
// AUTH
// ==========================
$("signup-form")?.addEventListener("submit", async e => {
  e.preventDefault();
  const name = $("signup-name").value.trim();
  const email = $("signup-email").value.trim();
  const pass = $("signup-password").value;

  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    profilePic: "",
    bio: "",
    createdAt: serverTimestamp()
  });
});

$("login-form")?.addEventListener("submit", async e => {
  e.preventDefault();
  await signInWithEmailAndPassword(auth, $("login-email").value, $("login-password").value);
});

$("logout-btn")?.addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});

// ==========================
// AUTH STATE
// ==========================
onAuthStateChanged(auth, async user => {
  currentUser = user;
  if (!user) {
    $("auth-modal").style.display = "flex";
    return;
  }

  $("auth-modal").style.display = "none";
  $("logout-btn").style.display = "inline-block";
  show("feed-view");

  loadUserProfile();
  renderFeed();
  renderFriends();
  listenNotifications();
});

// ==========================
// USER PROFILE
// ==========================
async function loadUserProfile() {
  const snap = await getDoc(doc(db, "users", currentUser.uid));
  if (!snap.exists()) return;
  const u = snap.data();
  $("profile-name").textContent = u.name;
  $("profile-email").textContent = u.email;
  $("profile-pic").src = u.profilePic || "images/default_profile.png";
  $("bio").value = u.bio || "";
}

$("save-bio")?.addEventListener("click", async () => {
  await updateDoc(doc(db, "users", currentUser.uid), { bio: $("bio").value });
});

$("save-profile-pic")?.addEventListener("click", async () => {
  const file = $("profile-upload").files[0];
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
  const data = await res.json();
  await updateDoc(doc(db, "users", currentUser.uid), { profilePic: data.secure_url });
  $("profile-pic").src = data.secure_url;
});

// ==========================
// FEED (PRODUCTS + POSTS)
// ==========================
function renderFeed() {
  const feed = $("feed");
  feed.innerHTML = "";

  // PRODUCTS AS POSTS
  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "card post";
    div.innerHTML = `
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <strong>₦${p.price}</strong>
      <button onclick="order('${p.name}',${p.price})">Order via WhatsApp</button>
    `;
    feed.appendChild(div);
  });

  // USER POSTS (REALTIME)
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  onSnapshot(q, snap => {
    snap.forEach(d => renderPost(d.id, d.data()));
  });
}

function renderPost(id, p) {
  const div = document.createElement("div");
  div.className = "card post";
  div.innerHTML = `
    <img src="${p.image || 'images/default_profile.png'}">
    <h4 class="user-link" data-uid="${p.uid}">${p.name}</h4>
    <p>${p.text}</p>
    <button onclick="likePost('${id}')">❤️ Like</button>
    <button onclick="commentPost('${id}')">💬 Comment</button>
  `;
  $("feed").appendChild(div);
}

// ==========================
// LIKE & COMMENT (SUBCOLLECTIONS)
// ==========================
window.likePost = async (postId) => {
  await setDoc(doc(db, "posts", postId, "likes", currentUser.uid), {
    uid: currentUser.uid,
    time: serverTimestamp()
  });
};

window.commentPost = async (postId) => {
  const text = prompt("Comment:");
  if (!text) return;
  await addDoc(collection(db, "posts", postId, "comments"), {
    uid: currentUser.uid,
    text,
    time: serverTimestamp()
  });
};

// ==========================
// FRIEND REQUESTS
// ==========================
async function renderFriends() {
  const list = $("friends");
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(d => {
    if (d.id === currentUser.uid) return;
    const u = d.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${u.name}</strong>
      <button onclick="sendRequest('${d.id}')">Add</button>
    `;
    list.appendChild(div);
  });
}

window.sendRequest = async (to) => {
  await addDoc(collection(db, "friendRequests"), {
    from: currentUser.uid,
    to,
    status: "pending",
    time: serverTimestamp()
  });
};

// ==========================
// ACCEPT FRIEND → CHAT ENABLE
// ==========================
async function listenNotifications() {
  const q = query(collection(db, "friendRequests"), where("to", "==", currentUser.uid));
  onSnapshot(q, snap => {
    snap.forEach(d => {
      if (d.data().status === "pending") {
        if (confirm("Friend request received. Accept?")) {
          acceptFriend(d.id, d.data().from);
        }
      }
    });
  });
}

async function acceptFriend(reqId, otherUid) {
  await updateDoc(doc(db, "friendRequests", reqId), { status: "accepted" });
  await addDoc(collection(db, "friends"), {
    users: [currentUser.uid, otherUid],
    time: serverTimestamp()
  });
}

// ==========================
// CHAT (ONLY ACCEPTED FRIENDS)
// ==========================
window.openChat = async (uid) => {
  activeChatUser = uid;
  show("chat-view");
  loadMessages();
};

function loadMessages() {
  const q = query(
    collection(db, "chats"),
    where("users", "array-contains", currentUser.uid),
    orderBy("time")
  );
  onSnapshot(q, snap => {
    $("messages").innerHTML = "";
    snap.forEach(d => {
      const m = d.data();
      if (!m.users.includes(activeChatUser)) return;
      $("messages").innerHTML += `<p>${m.text}</p>`;
    });
  });
}

$("send-chat")?.addEventListener("click", async () => {
  const text = $("chat-input").value;
  await addDoc(collection(db, "chats"), {
    users: [currentUser.uid, activeChatUser],
    from: currentUser.uid,
    text,
    time: serverTimestamp()
  });
  $("chat-input").value = "";
});

// ==========================
// WHATSAPP ORDER
// ==========================
window.order = (name, price) => {
  window.open(`https://wa.me/2349138938301?text=I want to order ${name} ₦${price}`);
};
