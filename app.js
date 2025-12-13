// app.js (module)

// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// ================= CLOUDINARY =================
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

// ================= FIREBASE CONFIG =================
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

// ================= HELPERS =================
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function el(tag, attrs = {}, html = "") {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  e.innerHTML = html;
  return e;
}

// ================= GLOBAL STATE =================
let currentUser = null;
let activeChatWith = null;

// ================= VIEW SWITCH =================
function showView(id) {
  $$(".view").forEach(v => (v.style.display = "none"));
  const view = $("#" + id + "-view");
  if (view) view.style.display = "block";
}

// ================= PRODUCTS =================
const products = [
  {
    name: "Cassava Stems (TME419)",
    price: 1000,
    image: "images/cassava.JPG",
    description: `Our TME419 cassava stems are carefully selected for exceptional disease resistance, high yield, and superior starch content. Each stem is sourced from mature, healthy parent plants, ensuring robust root development and vigorous growth. Ideal for both small-scale and commercial farming, these stems adapt well to diverse soil types and climates. By planting our TME419 stems, farmers can achieve higher productivity, quicker maturity, and better profitability. With consistent quality assurance, these stems are suitable for processing industries and fresh consumption, guaranteeing sustainable agricultural returns. Every batch is treated to prevent pests and diseases, giving your farm a head start in cultivation success.`
  },
  {
    name: "Hybrid Plantain Suckers",
    price: 500,
    image: "images/plantain.JPG",
    description: `Our Hybrid Plantain Suckers are bred for early maturity, uniform growth, and high disease tolerance. They produce consistent bunches and are ideal for both commercial plantations and backyard gardens. Carefully nurtured in optimal conditions, these suckers establish strong root systems for long-term productivity. Perfect for farmers seeking faster returns, they reduce maintenance costs while maximizing yields. Each sucker is inspected for quality and health, ensuring that your plantation thrives from the moment of planting. With these hybrid plantains, you are investing in a reliable, high-performing crop suitable for both fresh markets and processing industries.`
  },
  {
    name: "Hybrid Dwarf Banana",
    price: 500,
    image: "images/giant_banana.JPG",
    description: `The Hybrid Dwarf Banana is designed for quick returns, compact plantation layouts, and easy management. These bananas produce high-quality, uniform fruits that are market-ready within a short growing cycle. Selected for disease resistance and adaptability, they thrive in a variety of soil types and climates. The dwarf nature of the plant allows for close spacing, maximizing land use efficiency without compromising yield. Ideal for small-scale farmers and commercial growers alike, these banana plants are low-maintenance yet highly productive. Each plant is nurtured to ensure strong roots, vigorous growth, and excellent fruit quality, giving you a competitive edge in the banana market.`
  },
  {
    name: "Tenera Oil Palm Seedlings",
    price: 1000,
    image: "images/oilpalm.JPG",
    description: `Our Tenera Oil Palm Seedlings are premium-quality, high-yielding palms raised for strong root systems and exceptional oil production. Each seedling is carefully nurtured from hybrid seeds to ensure uniform growth, early maturity, and disease resistance. Perfect for long-term investment, Tenera palms thrive in tropical climates and diverse soil types, providing sustainable returns for commercial plantations. These seedlings are ideal for farmers looking to establish profitable oil palm estates with consistent fruit bunch production. Every batch is closely monitored for quality assurance, giving your plantation a healthy start and reducing early-stage losses.`
  },
  {
    name: "Hybrid Dwarf Coconut",
    price: 4500,
    image: "images/coconut.JPG",
    description: `Premium Hybrid Dwarf Coconut Seedlings designed for high productivity, adaptability, and compact plantation layouts. These seedlings are selected for fast growth, early fruiting, and disease resistance, making them ideal for smallholdings and commercial farms alike. Each plant is nurtured under optimal conditions to ensure strong root development and resilience against adverse weather. With uniform growth and consistent fruit production, our dwarf coconuts offer farmers a reliable source of income and an efficient use of land. Perfect for fresh consumption, processing, or sale in the local and export markets, these seedlings combine quality with profitability.`
  },
  {
    name: "Hybrid Giant Cocoa",
    price: 500,
    image: "images/giant_cocoa.JPG",
    description: `Our Hybrid Giant Cocoa Seedlings are carefully cultivated to produce vigorous, high-yielding trees with excellent disease resistance. Ideal for both small-scale farmers and commercial estates, these seedlings produce large pods with rich, high-quality cocoa beans. The hybrids are selected for uniform growth, strong root systems, and adaptability to varying soil conditions. With proper management, they offer consistent yields and a sustainable income source. Each seedling is nurtured under controlled conditions, ensuring that your plantation establishes quickly and efficiently. These cocoa seedlings are an investment in quality, longevity, and high returns.`
  },
  {
    name: "Pineapple Seedlings",
    price: 400,
    image: "images/pineapple.JPG",
    description: `Our Pineapple Seedlings are carefully grown to produce sweet, uniform fruits with high resistance to pests and diseases. Ideal for commercial farms and home gardens, these seedlings thrive in diverse soil types and climates. Each plant is nurtured to ensure early fruiting, strong root development, and consistent yields. Perfect for fresh market sales or processing industries, our pineapple seedlings provide a reliable and profitable crop. By selecting these high-quality seedlings, farmers can optimize land usage, reduce crop loss, and enjoy superior fruit quality that meets market demands. Each batch undergoes strict quality checks to ensure maximum productivity.`
  },
  {
    name: "Treated Yam Setts",
    price: 700,
    image: "images/Yamsett.JPG",
    description: `Our Treated Yam Setts are sourced from disease-free, high-yielding tubers to ensure vigorous growth, uniform sprouting, and strong tuber development. Each sett undergoes careful treatment to eliminate pests and diseases, giving farmers a healthy start for their yam plantations. Ideal for both small-scale and commercial farming, these setts produce consistent yields and mature quickly, allowing for reliable harvest schedules. With robust root systems and strong resistance to common yam diseases, they provide a sustainable, high-return investment for any farmer. Perfect for fresh markets, processing, or storage, these treated yam setts maximize productivity and minimize losses.`
  }
];

// ================= RENDER PRODUCTS =================
function renderProducts() {
  const container = $("#product-list");
  if (!container) return;
  container.innerHTML = "";

  products.forEach(p => {
    const card = el("div", { class: "card product" }, `
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <p class="muted">₦${p.price.toLocaleString()}</p>
      <p>${p.description}</p>
      <button class="btn">Order via WhatsApp</button>
    `);

    card.querySelector("button").onclick = () => {
      window.open(
        `https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${p.name} for ₦${p.price}`)}`,
        "_blank"
      );
    };

    container.appendChild(card);
  });
}

// ================= AUTH =================
$("#signup-form")?.addEventListener("submit", async e => {
  e.preventDefault();
  const name = $("#signup-name").value.trim();
  const email = $("#signup-email").value.trim();
  const password = $("#signup-password").value;

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    createdAt: serverTimestamp()
  });
});

$("#login-form")?.addEventListener("submit", async e => {
  e.preventDefault();
  await signInWithEmailAndPassword(auth, $("#login-email").value, $("#login-password").value);
});

$("#logout-btn")?.addEventListener("click", () => signOut(auth));

// ================= AUTH STATE =================
onAuthStateChanged(auth, async user => {
  currentUser = user;
  if (user) {
    showView("feed");
    renderProducts();
    await renderFeed();
    renderNotifications();
    renderFriends();
    renderProfile(user.uid);
  } else {
    showView("feed");
  }
});

// ================= FEED =================
async function renderFeed() {
  const feed = $("#feed");
  const postsRef = collection(db, "posts");
  onSnapshot(query(postsRef, orderBy("timestamp", "desc")), snap => {
    feed.innerHTML = "";
    snap.forEach(docSnap => {
      const post = docSnap.data();
      const card = el("div", { class: "card post" });
      card.innerHTML = `
        <h3 class="user-link" data-uid="${post.uid}">${post.name}</h3>
        <p>${post.text}</p>
        <div class="likes">
          <span class="like-count">${post.likes?.length || 0}</span> Likes 
          <button class="like-btn btn small">Like</button>
        </div>
        <div class="comments"></div>
        <input class="comment-input" placeholder="Comment..."><button class="comment-btn btn small">Comment</button>
      `;

      card.querySelector(".user-link")?.addEventListener("click", async () => {
        await renderProfile(post.uid);
        showView("profile");
        openChat(post.uid, post.name);
      });

      card.querySelector(".like-btn")?.addEventListener("click", async () => {
        const likes = post.likes || [];
        if (!likes.includes(currentUser.uid)) likes.push(currentUser.uid);
        await updateDoc(doc(db, "posts", docSnap.id), { likes });
        await addDoc(collection(db, "notifications"), { userId: post.uid, type: "like", fromName: currentUser.displayName || currentUser.email, message: "liked your post", read: false, timestamp: serverTimestamp() });
      });

      card.querySelector(".comment-btn")?.addEventListener("click", async () => {
        const input = card.querySelector(".comment-input");
        const text = input.value.trim();
        if (!text) return;
        const comment = { uid: currentUser.uid, name: currentUser.displayName || currentUser.email, text, timestamp: serverTimestamp() };
        const comments = post.comments || [];
        comments.push(comment);
        await updateDoc(doc(db, "posts", docSnap.id), { comments });
        await addDoc(collection(db, "notifications"), { userId: post.uid, type: "comment", fromName: currentUser.displayName || currentUser.email, message: "commented on your post", read: false, timestamp: serverTimestamp() });
        input.value = "";
      });

      feed.appendChild(card);
    });
  });
}

// ================= PROFILE =================
async function renderProfile(uid) {
  const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", uid)));
  if (userDoc.empty) return;
  const u = userDoc.docs[0].data();

  $("#profile-pic").src = u.profilePic || "images/default_profile.png";
  $("#bio").value = u.bio || "";

  $("#bio")?.addEventListener("blur", async () => {
    await setDoc(doc(db, "users", uid), { bio: $("#bio").value }, { merge: true });
  });
}

// ================= FRIENDS =================
async function renderFriends() {
  const snap = await getDocs(collection(db, "users"));
  const container = $("#friends");
  container.innerHTML = "";
  snap.forEach(d => {
    if (d.id === currentUser.uid) return;
    const card = el("div", { class: "card friend" }, `<h4>${d.data().name || d.data().email}</h4>`);
    const btn = el("button", {}, "Add Friend");
    btn.className = "btn";
    btn.addEventListener("click", async () => {
      await addDoc(collection(db, "friendRequests"), { from: currentUser.uid, to: d.id, status: "pending", createdAt: serverTimestamp() });
      await addDoc(collection(db, "notifications"), { userId: d.id, type: "friendRequest", fromName: currentUser.displayName || currentUser.email, message: "sent you a friend request", read: false, timestamp: serverTimestamp() });
      alert("Friend request sent");
      renderFriends(); // refresh list
    });
    card.appendChild(btn);
    container.appendChild(card);
  });
}

// ================= NOTIFICATIONS =================
function renderNotifications() {
  if (!currentUser) return;
  onSnapshot(query(collection(db, "notifications"), where("userId", "==", currentUser.uid), orderBy("timestamp", "desc")), snap => {
    const container = $("#notifications");
    container.innerHTML = "";
    snap.forEach(d => {
      const n = d.data();
      container.appendChild(el("div", {}, `<strong>${n.fromName || "User"}</strong> ${n.message}`));
    });
  });
}

// ================= CHAT =================
function openChat(uid, name) {
  activeChatWith = uid;
  $("#chat-window").style.display = "block";
  $("#chat-with").textContent = "Chat with " + name;
  loadMessages(uid);
}

$("#send-chat")?.addEventListener("click", async () => {
  if (!currentUser || !activeChatWith) return alert("Select friend");
  const msg = $("#chat-input").value.trim();
  if (!msg) return;
  await addDoc(collection(db, "chats"), { from: currentUser.uid, to: activeChatWith, participants: [currentUser.uid, activeChatWith], text: msg, timestamp: serverTimestamp() });
  $("#chat-input").value = "";
  loadMessages(activeChatWith);
});

async function loadMessages(uid) {
  const messagesEl = $("#messages");
  const q = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid), orderBy("timestamp", "asc"));
  onSnapshot(q, snap => {
    messagesEl.innerHTML = "";
    snap.forEach(docSnap => {
      const m = docSnap.data();
      if (m.participants.includes(uid)) {
        const div = el("div", {}, `<strong>${m.from === currentUser.uid ? "You" : "Friend"}:</strong> ${m.text}`);
        messagesEl.appendChild(div);
      }
    });
  });
}

// ================= NAV =================
$("#nav-feed")?.addEventListener("click", () => showView("feed"));
$("#nav-products")?.addEventListener("click", () => { showView("products"); renderProducts(); });
$("#nav-profile")?.addEventListener("click", () => { showView("profile"); renderFriends(); renderProfile(currentUser.uid); });
$("#nav-notifications")?.addEventListener("click", () => showView("notifications"));
