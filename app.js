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

// ================= VIEW SWITCH =================
function showView(id) {
  $$(".view").forEach(v => (v.style.display = "none"));
  const view = $("#" + id + "-view");
  if (view) view.style.display = "block";
}

// ================= PRODUCTS (RESTORED & FIXED) =================
const products = [
  { name: "Cassava Stems (TME419)", price: 1000, image: "images/cassava.JPG", description: "High-yield disease-resistant cassava stems." },
  { name: "Hybrid Plantain Suckers", price: 500, image: "images/plantain.JPG", description: "Early maturing plantain suckers." },
  { name: "Hybrid Dwarf Banana", price: 500, image: "images/giant_banana.JPG", description: "Compact banana variety for quick harvest." },
  { name: "Tenera Oil Palm Seedlings", price: 1000, image: "images/oilpalm.JPG", description: "High oil-yielding palm seedlings." },
  { name: "Hybrid Dwarf Coconut", price: 4500, image: "images/coconut.JPG", description: "Premium dwarf coconut seedlings." },
  { name: "Hybrid Giant Cocoa", price: 500, image: "images/giant_cocoa.JPG", description: "Disease-resistant cocoa seedlings." },
  { name: "Pineapple Seedlings", price: 400, image: "images/pineapple.JPG", description: "Sweet and uniform pineapple seedlings." },
  { name: "Treated Yam Setts", price: 700, image: "images/Yamsett.JPG", description: "Clean treated yam setts for planting." }
];

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
        `https://wa.me/2349138938301?text=${encodeURIComponent(
          `Hello, I want to order ${p.name} for ₦${p.price}`
        )}`,
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
  await signInWithEmailAndPassword(
    auth,
    $("#login-email").value,
    $("#login-password").value
  );
});

$("#logout-btn")?.addEventListener("click", () => signOut(auth));

// ================= AUTH STATE =================
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    showView("feed");
    renderProducts(); // ✅ FIXED
    renderFeed();
    renderNotifications();
    renderFriends();
    renderProfile(user.uid);
  } else {
    showView("feed");
  }
});

// ================= FEED =================
function renderFeed() {
  const feed = $("#feed");
  onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), snap => {
    feed.innerHTML = "";
    snap.forEach(d => {
      const p = d.data();
      const card = el("div", { class: "card post" }, `
        <h3 class="user-link" data-uid="${p.uid}">${p.name}</h3>
        <p>${p.text}</p>
        <button class="like-btn">Like (${p.likes?.length || 0})</button>
      `);

      card.querySelector(".user-link").onclick = () => {
        renderProfile(p.uid);
        showView("profile");
      };

      card.querySelector(".like-btn").onclick = async () => {
        const likes = p.likes || [];
        if (!likes.includes(currentUser.uid)) likes.push(currentUser.uid);
        await updateDoc(doc(db, "posts", d.id), { likes });
      };

      feed.appendChild(card);
    });
  });
}

// ================= PROFILE =================
async function renderProfile(uid) {
  const snap = await getDocs(query(collection(db, "users"), where("__name__", "==", uid)));
  if (snap.empty) return;

  const u = snap.docs[0].data();
  $("#profile-pic").src = u.profilePic || "images/default_profile.png";
  $("#bio").value = u.bio || "";
}

// ================= FRIENDS =================
function renderFriends() {
  getDocs(collection(db, "users")).then(snap => {
    const container = $("#friends");
    container.innerHTML = "";
    snap.forEach(d => {
      if (d.id === currentUser.uid) return;
      const card = el("div", { class: "card" }, `<h4>${d.data().name}</h4>`);
      container.appendChild(card);
    });
  });
}

// ================= NOTIFICATIONS =================
function renderNotifications() {
  if (!currentUser) return;
  onSnapshot(
    query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    ),
    snap => {
      const container = $("#notifications");
      container.innerHTML = "";
      snap.forEach(d => {
        container.appendChild(el("div", {}, d.data().message));
      });
    }
  );
}

// ================= NAV =================
$("#nav-feed")?.addEventListener("click", () => showView("feed"));
$("#nav-products")?.addEventListener("click", () => {
  showView("products");
  renderProducts(); // ✅ ENSURED
});
$("#nav-profile")?.addEventListener("click", () => {
  showView("profile");
  renderProfile(currentUser.uid);
});
$("#nav-notifications")?.addEventListener("click", () => showView("notifications"));
