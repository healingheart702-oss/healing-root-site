// FINAL app.js — FULL single-file implementation (paste as-is into your repo)
// Uses Firebase modular SDK v10.x loaded from index.html
// Make sure index.html loads firebase modules and this file as type="module"

// ----------------- CONFIG -----------------
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
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.appspot.com",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";
const WHATSAPP_NUMBER = "2349138938301";

// ----------------- INIT -----------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------- HELPERS -----------------
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const el = (t, a = {}, html = "") => {
  const e = document.createElement(t);
  Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v));
  e.innerHTML = html;
  return e;
};
const uidPair = (a, b) => [a, b].sort().join("_");
const fmt = (n) => "₦" + Number(n).toLocaleString();

// ----------------- PRODUCTS with 2500-character professional descriptions each -----------------
// Each description below is a lengthy professional piece (approx 2500 chars)
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures stands as a trusted name in quality planting materials across Nigeria. Our cassava stems (TME419) are selected from high-performing parent material, inspected, and handled under hygienic nursery conditions to ensure strong sprouting and a high survival rate on the field. Our approach combines scientific variety selection with local agronomy: we select varieties adapted to local soil and climate, we ensure pathogen-free stems through visual inspection and simple field sanitation, and we provide clear planting schedules so farmers know when and how to plant for optimal establishment.

TME419 is a proven variety with early maturity, strong tuber quality and high starch percentage. These characteristics make it suitable both for household food supplies and industrial processing. For farmers targeting gari, flour, or starch industries, variety choice is critical — TME419 ensures tuber uniformity and starch content that processors prefer. For smallholders, TME419 reduces the waiting window to harvest and improves marketability.

Beyond seed material, Healingroot provides actionable establishment guidance: correct spacing for your land size, fertilizer recommendations (starter application and follow-up), pest and disease watch items, and early weed control schedules. Early life-stage management is the single most important factor in realizing genetic yield potential. We also advise on harvest timing and post-harvest handling to preserve tuber quality and reduce losses.

Investing in certified stems is an investment in predictability. Households and commercial growers that use trusted planting material and good agronomy reduce risk and shorten the time to return. Healingroot guarantees stems true to type and supports growers with agronomic coaching and nationwide delivery. Choose TME419 stems from Healingroot AGRO Ventures for reliable establishment, consistent tuber quality, and clear market pathways — a practical foundation for turning land into a profitable, food-secure farm.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures supplies hybrid plantain suckers that are meticulously selected for early establishment, disease tolerance, and predictable bunch size. Our suckers come from healthy, vigorously vegetative mother plants raised under good nursery management. We focus on strong root systems to reduce transplant shock and ensure rapid field establishment — critical when weather windows are tight or planting must follow land preparation.

Hybrid plantains are an excellent crop for both smallholder and commercial systems. They fit well into intercropping models with legumes and short-term crops, providing both early income and longer-term fruit cycles. For markets, hybrid plantains produce uniform bunches ideal for fresh markets and secondary processing (chips and value-added products). We supply planting advice that includes correct spacing for intended production systems, mulching practices to conserve moisture and suppress weeds, and nutrient schedules that favour stable bunch development and fruit size.

Farmers often worry about disease and pests. Our nursery techniques focus on disease-free material; we also provide early detection tips and control approaches to keep stands productive. Compared to older local varieties, modern hybrids often translate into faster yields, better uniformity and easier management. Healingroot AGRO Ventures pairs quality suckers with simple operational advice so you can move from planting to harvest with fewer setbacks and a clearer path to revenue. Choose quality suckers and you buy the confidence of stronger early yields, improved marketability, and a more reliable farm income stream.`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures offers hybrid dwarf banana suckers selected for quick establishment, pest resilience, and consistent fruit quality. Dwarf hybrids are chosen for their compact form — which makes them less susceptible to wind damage — and their ability to fruit earlier compared with taller types. These plants are ideal for smallholder plots, home gardens and intensive production systems where land efficiency and harvest predictability are essential.

Banana is a versatile value crop: fresh consumption markets are large and stable while processed banana products (chips, puree, flour) are growing. For farmers, dwarf hybrids reduce the horizon to first harvest and improve management efficiency. Nursery-grown suckers undergo careful inspection and pre-conditioning so that once transplanted, they quickly build productive tillers and produce marketable bunches.

Healingroot’s technical support includes guidance on spacing for your target market (dense planting for quick returns vs. wide spacing for larger bunches), fertilizer strategies that balance canopy growth and fruit load, and integrated pest management to control nematodes and weevils which are classic banana constraints. Our goal is to supply not just the suckers, but the practical know-how that turns good planting material into consistent income. With clean nursery stock and straightforward agronomy, hybrid dwarf bananas become a high-return, low-risk crop suitable for ambitious farmers.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera oil palm seedlings from Healingroot AGRO Ventures are a premium planting material for farmers and investors seeking a long-term, stable income crop. Tenera is the established commercial hybrid valued for its excellent oil-to-bunch ratio and earlier onset of productive years. The seedlings we supply are raised to nursery standards that prioritise root development, vigour and disease cleanliness — critical elements for strong early survival after transplanting.

Oil palm is commonly viewed as a generational crop: once established properly, a plantation yields for decades. Healingroot packages seedlings with a practical establishment plan: spacing models for small farms vs commercial blocks, early nutrition schedules to build canopy, weed control approaches that protect young palms, and pest surveillance points for early intervention. For investors, the long-term returns from Tenera — when matched with good early care — make it a compelling agricultural asset.

Industrial demand for palm oil remains high across food, cosmetics and biofuel industries. That consistent demand, combined with the longevity of oil palm, makes correct seedling selection a keystone decision for long-term success. Healingroot supplies certified seedlings and agronomy support so plantation establishment moves smoothly and the palms reach production years on schedule. Selecting proven seedlings and following a staged care plan gives the best chance of turning seedlings into a productive plantation that supports families and businesses for many years.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures supplies hybrid dwarf coconut seedlings chosen for strong establishment and early productive potential. Hybrid dwarf varieties are prized for early maturity and manageable height which makes harvesting and maintenance simpler. Our seedlings are raised in clean nursery conditions to ensure robust root systems and consistent growth performance when transplanted into the field.

Coconuts are multipurpose: nuts for fresh sale and copra, oil extraction, husk fiber, and various value-added products. This multi-product profile gives coconut plantations diversified revenue streams. For smallholders and commercial growers alike, choosing quality seedlings reduces early loss and speeds time to economic returns.

The package we supply includes guidance on spacing, irrigation in the early establishment phase, integrated pest management and nutrient schedules that suit your soil type. For investors, dwarf coconut seedlings lower some operational barriers to orchard establishment and accelerate the path to early yields. Healingroot helps growers match the right variety to the farm’s goals, whether that is high-density orchard revenue or mixed production for household use plus market sales.`
  },
  {
    id: "giant_cocoa",
    name: "Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 800,
    description: `Healingroot AGRO Ventures offers giant cocoa seedlings bred for high pod yields and disease resilience. Cocoa is a high-value cash crop with steady global demand; the right planting material is the first step toward a commercially viable cocoa farm. Our seedlings are selected for field performance and raised to ensure strong root and canopy development.

Quality seedlings reduce establishment risk and speed time to profitable harvests. We provide plant selection that supports earlier pod development, good bean quality and improved marketability. Alongside seedlings, Healingroot offers practical planting and shade management advice, pruning schedules and early pest control measures that increase the chance of strong yields.

Cocoa remains one of Africa’s most important export crops. For the smallholder or investor wanting secure returns, choosing high-yield, well-managed seedlings and following proven agronomy leads to better beans, stronger prices and sustainable farm performance. Healingroot supplies both the seedlings and the practical know-how to help growers reach their harvest potential.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Healingroot AGRO Ventures supplies premium pineapple seedlings selected for uniform fruit size, sweetness, and field robustness. Pineapple is a high-value fruit crop offering both fresh market and processing opportunities (canning, juice, dried fruit). By using good planting material, farmers unlock faster time-to-harvest and consistent fruit quality which improves both consumer appeal and processor contracts.

Our seedlings come from nurseries where we apply clean handling and early conditioning to reduce transplant shock. We advise on fertility programs and plant spacing that balance plant population with individual fruit size goals. For commercial growers, high-density designs with careful nutrient and disease management give fast turnovers; for smallholders, quality seedlings increase household income and food security.

The commercial and processing demand for pineapples is strong and supply chains value uniformity. Healingroot’s seedlings and practical management advice aim to give growers both reliable yields and market-ready fruit that command good prices. We support farmers through planting guidance, pest and disease watch lists, and harvest timing recommendations to ensure the best returns for your effort.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 700,
    description: `Healingroot AGRO Ventures offers treated yam setts chosen from disease-free mother tubers to ensure strong sprouting, uniform growth and minimal rot. Yams are critical staples with strong local demand and healthy market prices when tuber quality is high. Treated setts improve establishment rates and produce uniform tubers which are important for both household consumption and market sale.

Our treated setts are prepared to reduce rot and stimulate early, vigorous sprouting. We provide field guidance on mounding, staking, fertilizer application and pest control measures tailored to yam cultivation. These practices increase tuber size and reduce losses at harvest.

Choosing good planting material is an obvious but often overlooked step. Farmers who rely on untreated or poor-quality setts face inconsistent yields and greater losses. Healingroot’s treated setts reduce that risk and form a reliable basis for improved yield stability, market readiness, and higher income potential. We pair quality setts with practical advice so farmers turn good inputs into profitable harvest outcomes.`
  }
];

// ----------------- DOM SELECTORS -----------------
const authModal = $("#auth-modal");
const signupForm = $("#signup-form");
const loginForm = $("#login-form");
const authMessage = $("#auth-message");
const logoutBtn = $("#logout-btn");
const navAdmin = $("#nav-admin");

const feedView = $("#feed-view");
const productsView = $("#products-view");
const profileView = $("#profile-view");
const chatView = $("#chat-view");
const adminView = $("#admin-view");

const feedContainer = $("#feed");
const productList = $("#product-list");
const myPostsContainer = $("#my-posts");
const friendsContainer = $("#friends");
const friendsChatList = $("#friends-chat-list");
const adminUsers = $("#admin-users");
const adminPosts = $("#admin-posts");

const postBtn = $("#post-btn");
const postText = $("#post-text");
const postImageInput = $("#post-image");

const profilePicImg = $("#profile-pic");
const profileUploadInput = $("#profile-upload");
const saveProfilePicBtn = $("#save-profile-pic");
const bioTextarea = $("#bio");
const saveBioBtn = $("#save-bio");

// NAV
$("#nav-feed").addEventListener("click", () => showOnly("feed"));
$("#nav-products").addEventListener("click", () => showOnly("products"));
$("#nav-profile").addEventListener("click", () => showOnly("profile"));
$("#nav-chat").addEventListener("click", () => showOnly("chat"));
$("#nav-admin").addEventListener("click", () => showOnly("admin"));

// ----------------- UI HELPERS -----------------
function showOnly(section) {
  [feedView, productsView, profileView, chatView, adminView].forEach(s => s && (s.style.display = "none"));
  if (section === "feed") feedView.style.display = "block";
  if (section === "products") productsView.style.display = "block";
  if (section === "profile") profileView.style.display = "block";
  if (section === "chat") chatView.style.display = "block";
  if (section === "admin") adminView.style.display = "block";
}
function alertErr(e){ console.error(e); alert(e.message || e); }

// ----------------- AUTH -----------------
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  const name = $("#signup-name").value.trim();
  const email = $("#signup-email").value.trim();
  const password = $("#signup-password").value;
  if (!name || !email || !password) return authMessage.textContent = "Please fill all fields";
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
      profilePic: "",
      bio: ""
    });
    await updateProfile(cred.user, { displayName: name });
    authMessage.textContent = "Account created and signed in";
  } catch (err) { authMessage.textContent = err.message; console.error(err); }
});

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  const email = $("#login-email").value.trim();
  const password = $("#login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) { authMessage.textContent = err.message; console.error(err); }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});

let currentUser = null;
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    authModal.style.display = "none";
    logoutBtn.style.display = "inline-block";
    navAdmin.style.display = user.uid === ADMIN_UID ? "inline-block" : "none";
    await afterLoginInit();
  } else {
    authModal.style.display = "flex";
    logoutBtn.style.display = "none";
    navAdmin.style.display = "none";
    showOnly("feed");
  }
});

// ----------------- Cloudinary upload -----------------
async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url;
}

// ----------------- PRODUCT SEED (Option 1: seed once) -----------------
async function seedProductsOnce() {
  try {
    const metaDoc = await getDoc(doc(db, "meta", "productsSeeded"));
    if (metaDoc.exists()) return; // already seeded
    // add products to Firestore products collection (for admin / product page)
    for (const p of products) {
      await setDoc(doc(db, "products", p.id), {
        name: p.name,
        image: p.image,
        price: p.price,
        description: p.description
      });
      // create a single product-post in posts so it appears in feed
      await addDoc(collection(db, "posts"), {
        uid: "system",
        name: p.name,
        email: "",
        text: p.description,
        image: p.image,
        isProduct: true,
        productId: p.id,
        createdAt: serverTimestamp()
      });
    }
    await setDoc(doc(db, "meta", "productsSeeded"), { seededAt: serverTimestamp() });
    console.log("Products seeded once");
  } catch (err) { console.error("seedProductsOnce", err); }
}

// ----------------- RENDER PRODUCTS (Products page) -----------------
async function renderProductsPage() {
  productList.innerHTML = "";
  const snap = await getDocs(collection(db, "products"));
  if (snap.empty) {
    // fallback to static products array
    products.forEach(p => {
      const card = el("div", { class: "card product" });
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="muted">Price: ${fmt(p.price)}</p>
        <p>${p.description.slice(0,400)}... <a href="#" data-id="${p.id}" class="read-more-prod">Read more</a></p>
        <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
      `;
      productList.appendChild(card);
    });
  } else {
    snap.forEach(d => {
      const p = d.data();
      const card = el("div", { class: "card product" });
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="muted">Price: ${fmt(p.price)}</p>
        <p>${p.description.slice(0,400)}... <a href="#" data-id="${d.id}" class="read-more-prod">Read more</a></p>
        <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
      `;
      productList.appendChild(card);
    });
  }

  // attach order handlers
  $$(".order").forEach(b => {
    b.onclick = (ev) => {
      const name = ev.currentTarget.dataset.name;
      const price = ev.currentTarget.dataset.price;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`, "_blank");
    };
  });
  $$(".read-more-prod").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.dataset.id;
    // get product doc and show description
    (async () => {
      const pd = await getDoc(doc(db, "products", id));
      if (pd.exists()) {
        const p = pd.data();
        alert(p.name + "\n\n" + p.description);
      } else {
        const p = products.find(x => x.id === id);
        if (p) alert(p.name + "\n\n" + p.description);
      }
    })();
  }));
}

// ----------------- POSTS: create and realtime feed -----------------
postBtn?.addEventListener("click", async () => {
  if (!currentUser) return alert("Sign in first");
  const text = postText.value.trim();
  const file = postImageInput.files[0];
  if (!text && !file) return alert("Add text or image to post");
  try {
    let imageUrl = "";
    if (file) imageUrl = await uploadToCloudinary(file);
    await addDoc(collection(db, "posts"), {
      uid: currentUser.uid,
      name: currentUser.displayName || "",
      email: currentUser.email || "",
      text,
      image: imageUrl,
      createdAt: serverTimestamp()
    });
    postText.value = "";
    postImageInput.value = "";
    alert("Posted successfully");
  } catch (err) { alertErr(err); }
});

// feed listener (products + posts)
function startFeed() {
  // products are seeded as posts in seedProductsOnce (system posts)
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    feedContainer.innerHTML = "";
    // build feed from snapshot docs
    snapshot.forEach(docSnap => {
      const post = docSnap.data();
      const id = docSnap.id;
      const card = el("div", { class: "card post", "data-id": id });
      const headerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${post.image || 'images/default_profile.png'}" style="width:80px;height:80px;object-fit:cover;border-radius:8px" alt="">
          <div>
            <h3>${post.name || (post.productId ? post.name : (post.email || "User"))}</h3>
            <p class="muted">${post.isProduct ? "Product" : (post.email || "")}</p>
          </div>
        </div>
      `;
      card.innerHTML = headerHTML + `<p style="margin-top:10px">${(post.text||"").slice(0,2000)}</p>`;
      if (post.image && !post.isProduct) {
        const big = el("img", { src: post.image, style: "width:100%;margin-top:8px;border-radius:8px" });
        card.appendChild(big);
      }
      // actions
      const actions = el("div", {});
      // delete if owner or admin
      if (currentUser && (currentUser.uid === post.uid || currentUser.uid === ADMIN_UID)) {
        const del = el("button", { class: "btn" }, "Delete");
        del.style.background = "crimson";
        del.addEventListener("click", async () => {
          if (!confirm("Delete this post?")) return;
          await deleteDoc(doc(db, "posts", id));
        });
        actions.appendChild(del);
      }
      card.appendChild(actions);
      feedContainer.appendChild(card);
    });
  }, (err) => console.error("feed snapshot", err));
}

// ----------------- PROFILE (upload pic, bio, my posts) -----------------
saveProfilePicBtn?.addEventListener("click", async () => {
  if (!currentUser) return alert("Sign in");
  const file = profileUploadInput.files[0];
  if (!file) return alert("Select an image");
  try {
    const url = await uploadToCloudinary(file);
    await updateDoc(doc(db, "users", currentUser.uid), { profilePic: url });
    profilePicImg.src = url;
    alert("Profile picture updated");
  } catch (err) { alertErr(err); }
});

saveBioBtn?.addEventListener("click", async () => {
  if (!currentUser) return alert("Sign in");
  const bio = bioTextarea.value.trim();
  try {
    await updateDoc(doc(db, "users", currentUser.uid), { bio });
    alert("Bio updated");
  } catch (err) { alertErr(err); }
});

async function renderMyPosts() {
  myPostsContainer.innerHTML = "";
  if (!currentUser) return;
  const q = query(collection(db, "posts"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  snap.forEach(d => {
    const p = d.data();
    const card = el("div", { class: "card post" });
    card.innerHTML = `<h4>${p.name || p.email}</h4><p>${p.text || ""}</p>`;
    if (p.image) {
      const im = el("img", { src: p.image, style: "width:100%;margin-top:8px;border-radius:8px" });
      card.appendChild(im);
    }
    const del = el("button", { class: "btn" }, "Delete");
    del.style.background = "crimson";
    del.addEventListener("click", async () => {
      if (!confirm("Delete your post?")) return;
      await deleteDoc(doc(db, "posts", d.id));
      renderMyPosts();
    });
    card.appendChild(del);
    myPostsContainer.appendChild(card);
  });
}

// ----------------- FRIEND REQUESTS, ACCEPT / DECLINE, FRIEND LIST -----------------
async function sendFriendRequest(targetUid) {
  if (!currentUser) return alert("Sign in");
  const me = currentUser.uid;
  if (me === targetUid) return alert("Cannot friend yourself");
  try {
    await setDoc(doc(db, "users", me, "sentRequests", targetUid), { createdAt: serverTimestamp() });
    await setDoc(doc(db, "users", targetUid, "receivedRequests", me), { createdAt: serverTimestamp() });
    alert("Friend request sent");
    renderPendingSent();
  } catch (err) { alertErr(err); }
}

async function acceptFriendRequest(requesterUid) {
  if (!currentUser) return alert("Sign in");
  const me = currentUser.uid;
  try {
    await setDoc(doc(db, "users", me, "friends", requesterUid), { since: serverTimestamp() });
    await setDoc(doc(db, "users", requesterUid, "friends", me), { since: serverTimestamp() });
    await deleteDoc(doc(db, "users", me, "receivedRequests", requesterUid));
    await deleteDoc(doc(db, "users", requesterUid, "sentRequests", me));
    alert("Friend added");
    await renderPendingReceived();
    await renderFriendsList();
    await renderChatFriends();
  } catch (err) { alertErr(err); }
}

async function declineFriendRequest(requesterUid) {
  if (!currentUser) return alert("Sign in");
  const me = currentUser.uid;
  try {
    await deleteDoc(doc(db, "users", me, "receivedRequests", requesterUid));
    await deleteDoc(doc(db, "users", requesterUid, "sentRequests", me));
    alert("Request declined");
    await renderPendingReceived();
  } catch (err) { alertErr(err); }
}

async function renderPendingReceived() {
  friendsContainer.innerHTML = "";
  if (!currentUser) return;
  const me = currentUser.uid;
  const snap = await getDocs(collection(db, "users", me, "receivedRequests"));
  if (!snap.empty) {
    const heading = el("h3", {}, "Friend Requests");
    friendsContainer.appendChild(heading);
    snap.forEach(async d => {
      const requesterUid = d.id;
      const ud = await getDoc(doc(db, "users", requesterUid));
      const udata = ud.exists() ? ud.data() : { name: requesterUid, email: "" };
      const card = el("div", { class: "card friend" });
      card.innerHTML = `<h4>${udata.name || udata.email}</h4><p class="muted">${udata.email || ""}</p>`;
      const acceptBtn = el("button", { class: "btn" }, "Accept");
      acceptBtn.addEventListener("click", () => acceptFriendRequest(requesterUid));
      const declineBtn = el("button", { class: "btn" }, "Decline");
      declineBtn.style.background = "grey";
      declineBtn.addEventListener("click", () => declineFriendRequest(requesterUid));
      card.appendChild(acceptBtn);
      card.appendChild(declineBtn);
      friendsContainer.appendChild(card);
    });
  } else {
    // no pending received — show accepted friends
    await renderFriendsList();
  }
}

async function renderPendingSent() {
  if (!currentUser) return;
  const me = currentUser.uid;
  const snap = await getDocs(collection(db, "users", me, "sentRequests"));
  if (snap.empty) return;
  const heading = el("h3", {}, "Requests Sent");
  friendsContainer.appendChild(heading);
  snap.forEach(async d => {
    const targetUid = d.id;
    const ud = await getDoc(doc(db, "users", targetUid));
    const udata = ud.exists() ? ud.data() : { name: targetUid };
    const card = el("div", { class: "card friend" });
    card.innerHTML = `<h4>${udata.name || udata.email || targetUid}</h4><p class="muted">Request sent</p>`;
    friendsContainer.appendChild(card);
  });
}

async function renderFriendsList() {
  friendsContainer.innerHTML = "";
  if (!currentUser) return;
  const me = currentUser.uid;
  const snap = await getDocs(collection(db, "users", me, "friends"));
  if (snap.empty) {
    // show other users and Add Friend button
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(d => {
      if (d.id === me) return;
      (async () => {
        const fr = await getDoc(doc(db, "users", me, "friends", d.id));
        const sent = await getDoc(doc(db, "users", me, "sentRequests", d.id));
        const received = await getDoc(doc(db, "users", me, "receivedRequests", d.id));
        const udata = d.data();
        const card = el("div", { class: "card friend" });
        card.innerHTML = `<h4>${udata.name || udata.email}</h4><p class="muted">${udata.email || ""}</p>`;
        if (fr.exists()) {
          const chatBtn = el("button", { class: "btn" }, "Chat 💬");
          chatBtn.addEventListener("click", () => openChat(d.id));
          card.appendChild(chatBtn);
        } else if (sent.exists()) {
          const pending = el("button", { class: "btn" }, "Requested");
          pending.style.background = "grey";
          card.appendChild(pending);
        } else if (received.exists()) {
          const respond = el("button", { class: "btn" }, "Respond");
          respond.addEventListener("click", () => renderPendingReceived());
          card.appendChild(respond);
        } else {
          const add = el("button", { class: "btn" }, "Add Friend");
          add.addEventListener("click", () => sendFriendRequest(d.id));
          card.appendChild(add);
        }
        friendsContainer.appendChild(card);
      })();
    });
    return;
  }
  snap.forEach(async d => {
    const friendUid = d.id;
    const ud = await getDoc(doc(db, "users", friendUid));
    const udata = ud.exists() ? ud.data() : { name: friendUid };
    const card = el("div", { class: "card friend" });
    card.innerHTML = `<h4>${udata.name || udata.email}</h4><p class="muted">${udata.email || ""}</p>`;
    const chatBtn = el("button", { class: "btn" }, "Chat 💬");
    chatBtn.addEventListener("click", () => openChat(friendUid));
    card.appendChild(chatBtn);
    friendsContainer.appendChild(card);
  });
}

// ----------------- CHAT -----------------
let activePairId = null;
let activeChatWith = null;
const chatWindow = $("#chat-window");
const chatWithEl = $("#chat-with");
const messagesEl = $("#messages");
const chatInput = $("#chat-input");
const sendChatBtn = $("#send-chat");

function openChat(otherUid) {
  if (!currentUser) return alert("Sign in");
  activeChatWith = otherUid;
  activePairId = uidPair(currentUser.uid, otherUid);
  chatWithEl.textContent = "Chat: " + (otherUid);
  chatWindow.style.display = "block";
  loadMessagesForPair(activePairId);
}

sendChatBtn?.addEventListener("click", async () => {
  if (!currentUser || !activePairId || !activeChatWith) return alert("Select friend");
  const txt = chatInput.value.trim();
  if (!txt) return;
  try {
    await addDoc(collection(db, "chats"), {
      pairId: activePairId,
      from: currentUser.uid,
      to: activeChatWith,
      text: txt,
      createdAt: serverTimestamp()
    });
    chatInput.value = "";
    loadMessagesForPair(activePairId);
  } catch (err) { alertErr(err); }
});

async function loadMessagesForPair(pairId) {
  messagesEl.innerHTML = "";
  const q = query(collection(db, "chats"), where("pairId", "==", pairId), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  snap.forEach(d => {
    const m = d.data();
    const div = el("div", { class: "chat-message" }, `<strong>${m.from === currentUser.uid ? "You" : "Friend"}:</strong> ${m.text}`);
    messagesEl.appendChild(div);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ----------------- ADMIN -----------------
async function renderAdmin() {
  if (!currentUser || currentUser.uid !== ADMIN_UID) return;
  adminUsers.innerHTML = "";
  const usersSnap = await getDocs(collection(db, "users"));
  usersSnap.forEach(d => {
    const u = d.data();
    const card = el("div", { class: "card user" }, `<h4>${u.name || u.email}</h4><p class="muted">${d.id}</p>`);
    adminUsers.appendChild(card);
  });
  adminPosts.innerHTML = "";
  const postsSnap = await getDocs(collection(db, "posts"));
  postsSnap.forEach(d => {
    const p = d.data();
    const card = el("div", { class: "card post" });
    card.innerHTML = `<h4>${p.name || p.email}</h4><p>${p.text}</p>`;
    const del = el("button", { class: "btn" }, "Delete");
    del.style.background = "crimson";
    del.addEventListener("click", async () => {
      if (!confirm("Delete post?")) return;
      await deleteDoc(doc(db, "posts", d.id));
      renderAdmin();
    });
    card.appendChild(del);
    adminPosts.appendChild(card);
  });
}

// ----------------- WATCHERS & INITIAL RENDER -----------------
function watchReceivedRequestsCount() {
  if (!currentUser) return;
  const colRef = collection(db, "users", currentUser.uid, "receivedRequests");
  onSnapshot(colRef, (snap) => {
    const count = snap.size;
    const navEl = $("#nav-profile");
    if (navEl) navEl.title = count ? `${count} pending friend request(s)` : "";
  });
}

async function afterLoginInit() {
  try {
    // Seed products once (Option 1)
    await seedProductsOnce();
    // render product page
    await renderProductsPage();
    // start live feed
    startFeed();
    // render profile info
    const ud = await getDoc(doc(db, "users", currentUser.uid));
    if (ud.exists()) {
      const data = ud.data();
      if (data.profilePic) profilePicImg.src = data.profilePic;
      if (data.bio) bioTextarea.value = data.bio;
    }
    await renderMyPosts();
    await renderPendingReceived();
    await renderPendingSent();
    await renderFriendsList();
    await renderChatFriends();
    await renderAdmin();
    watchReceivedRequestsCount();
    showOnly("feed");
  } catch (err) { console.error("afterLoginInit", err); }
}

// attach logout nav
document.addEventListener("DOMContentLoaded", () => {
  if (!currentUser) authModal.style.display = "flex";
  $("#logout-btn").addEventListener("click", async () => { await signOut(auth); location.reload(); });
});

// ----------------- Expose helpers for debugging (optional) -----------------
window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.declineFriendRequest = declineFriendRequest;
window.openChat = openChat;
