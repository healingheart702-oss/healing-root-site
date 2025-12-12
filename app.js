// app.js — All-in-one (AUTH, PRODUCTS, FEED, PROFILE, FRIENDS, CHAT, ADMIN)
// IMPORTANT: paste this into js/app.js and load as <script type="module" src="js/app.js"></script>

// -------------- Firebase (modular v10) imports --------------
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
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// -------------- CONFIG --------------
const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.firebasestorage.app",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/auto/upload"; // unsigned endpoint is same; preset used below
const UPLOAD_PRESET = "unsigned_upload";

const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";
const WHATSAPP_NUMBER = "2349138938301"; // your WhatsApp number for orders

// -------------- INITIALIZE --------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------- HELPERS --------------
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmt = (n) => "₦" + Number(n).toLocaleString();
const uidPair = (a,b) => [a,b].sort().join("_");

// -------------- PRODUCTS DATA (with long descriptions) --------------
// Prices you gave, and extended long descriptions (marketing / professional).
// NOTE: descriptions are long-form. If your editor shows line breaks oddly, it's normal.
const PRODUCTS = [
  {
    id: "cassava",
    name: "Cassava Stems (TME 419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healing Root AGRO Ventures stands as a trusted name in quality cassava planting materials across Nigeria. We have built our reputation on reliability, clarity and agricultural expertise that helps both smallholder and commercial farmers create lasting income.
    
TME 419 is one of the most widely recommended cassava varieties because of its early maturity, uniform tuber quality and high starch content. We supply well-cut, disease-free stems harvested at the correct physiological age to ensure optimal sprouting and establishment. Every batch is inspected visually for pests and rot before packing, and we provide practical planting guidance to ensure the stems perform in the field.

Why choose our TME 419 stems? Because you get more than cuttings — you get a package of experience. We include clear spacing guidance to maximize yield per plot, starter fertilizer recommendations for vigorous early growth, and simple pest-control advice that reduces the risks of scale and mealybug damage. Smallholder farmers will notice faster returns from a crop that matures earlier; commercial processors will appreciate TME 419’s consistent starch profile.

Common myths around cassava — that it is low-value or excessively risky — are often a result of poor planting material or bad agronomy. With certified stems and the right establishment protocol, cassava becomes one of the most dependable crops on the farm. It supports household food security, supplies processors and provides a steady income stream.

From planting to harvest, Healing Root supports your farm with practical tips and delivery options. Choose TME 419 stems when you want predictable establishment, solid tuber quality, and higher returns. Invest in seedlings that set your farm on a reliable growth path.`
  },

  {
    id: "giant_banana",
    name: "Hybrid Giant Banana Suckers",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `Healing Root AGRO Ventures supplies hybrid giant banana suckers bred for early fruiting, superior fruit quality and robust field performance. Our suckers come from carefully selected mother plants grown under hygienic nursery conditions to ensure high survival and rapid establishment when transplanted.

Banana is a high-value, quick-return crop compared to many perennial systems. Giant hybrids bring larger bunch size and sweet fruit that command good market prices. We provide planting density suggestions, fertiliser schedules, and pest watchlists for nematodes and weevils to help growers maintain productive stands.

Many farmers mistakenly assume banana requires large inputs to be profitable. In reality, with our nursery-raised suckers and practical management advice — mulching, balanced nutrition and simple integrated pest management — banana becomes a stable, high-yielding component of a farmer’s income portfolio. Whether you are establishing a backyard plot or scaling to a commercial block, our Giant Banana suckers make a predictable foundation for production.

We also advise on post-harvest handling to retain fruit quality during transport to markets or processors. Healing Root is committed to supporting growers with quality planting material and the operational advice necessary to convert healthy suckers into steady yields and dependable income.`
  },

  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera oil palm seedlings from Healing Root AGRO Ventures represent a long-term investment in reliable income. The Tenera hybrid is the backbone of commercial oil palm production because it combines early bearing with a high oil-to-bunch ratio — factors that drive profitability for both plantation owners and smallholders.

Our seedlings are raised under controlled nursery conditions to develop robust root systems and strong, healthy shoots ready for field establishment. Each batch is inspected and handled to reduce mechanical damage; we package seedlings for safe delivery and give clear transplanting guidance that improves survival rates.

Oil palm is a generational crop. While it demands patience in the early years, a properly established Tenera block provides returns for decades. We provide practical spacing models, early nutrition schedules, weed and pest control options, and a timeline to expected first yields so investors can plan with confidence.

From industrial demand to household consumption, palm oil remains in high demand — in cooking oils, soaps, cosmetics and industrial applications. By selecting certified Tenera seedlings and following an evidence-based establishment plan, farmers avoid common mistakes that reduce yield and profitability.

Healing Root offers seedlings plus the practical support needed to transition from purchase to productive plantation. We align nursery quality with field success so your Tenera palms begin their yield life with the best possible start.`
  },

  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Hybrid plantain suckers from Healing Root AGRO Ventures are carefully selected for vigor, uniform fruit quality and disease tolerance. Our suckers are cleaned, hardened and raised to ensure strong establishment after transplanting.

Plantain is an excellent choice for growers seeking fast returns from perennial systems. Hybrids combine the benefits of improved bunch uniformity and faster time to first harvest. For farms using intercropping systems, plantain integrates well with legumes and short-duration crops, giving both food and cash flow.

We support every purchase with guidance: planting distances tailored to your market objective (dense planting for faster turnover vs. wider spacing for larger bunches); fertilization schedules to balance vegetative growth and fruit load; and simple pest and disease monitoring methods.

Choosing certified suckers reduces establishment risk. Healing Root pairs quality materials with practical, field-tested advice so you can move from planting to harvest with fewer setbacks and a clear path to profitability.`
  },

  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healing Root AGRO Ventures offers hybrid dwarf coconut seedlings selected for early maturity, manageable height and strong field performance. Dwarf hybrids are popular for their ease of management and early fruiting, making them suitable for both backyard and commercial orchards.

Our seedlings are raised in clean nursery conditions to build solid root systems and reduce transplant shock. We provide care packages that include spacing recommendations, irrigation tips in the early months, and pest management for pests that commonly affect coconut stands.

Coconut is a multi-purpose crop providing fresh fruit, copra, fiber and materials for many value-added products. The longevity and multipurpose nature of coconut plantations mean they are a long-term asset. Proper seedling selection and early management is the key to turning coconut into a high-value, long-lifecycle investment.

Healing Root gives growers both high-quality seedlings and the operational guidance to manage early establishment. For investors and farmers aiming for resilient, long-term returns, hybrid dwarf coconut seedlings deliver early performance and a clear path to orchard productivity.`
  },

  {
    id: "giant_cocoa",
    name: "Hybrid Cocoa Nursery Plant",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Hybrid cocoa seedlings from Healing Root AGRO Ventures are selected for early bearing, disease tolerance and strong pod yield. Cocoa remains a high-value cash crop with a stable global market; success begins with high-quality nursery material.

Our seedlings are prepared for strong root and canopy development. We advise on shade management, pruning schedules and integrated pest management approaches that improve pod set and bean quality. Farmers who adopt improved seedlings and disciplined management achieve higher yields and more consistent bean quality.

Cocoa supports export income and local processing; choosing well-managed seedlings is the first step to meeting processing quality requirements and achieving premium prices. Healing Root delivers seedlings plus the agronomic advice needed to build a sustainable, productive cocoa system.`
  },

  {
    id: "pineapple",
    name: "Pineapple Suckers",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Healing Root AGRO Ventures supplies high-quality pineapple suckers selected for strong germination, uniform fruit and high sweetness. Our seedlings are ideal for both commercial plantings and smallholder plots where rapid turnover and quality fruit are essential.

Pineapple has strong local and export demand. We supply planting guidance tailored to your objective — high-density production for fast returns or lower density for larger fruits. Fertility plans and disease watchlists are provided to reduce common losses from fungal diseases and to maximize fruit quality.

Our nursery practices focus on disease-free starter material and early conditioning to ensure rapid establishment. Choose Healing Root pineapple suckers to secure uniform, market-ready fruit and consistent harvests.`
  },

  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 500,
    description: `Healing Root AGRO Ventures offers high-quality treated yam setts selected from disease-free mother tubers. Treated setts improve early sprouting, reduce rot and increase the likely tuber yield at harvest.

Yam is a staple crop with strong local demand. Our treated setts are paired with planting guidance — ridge or mound spacing, staking methods, and fertilizer guidance — to maximise tuber size and reduce losses.

Using treated setts reduces early-stage failure and improves the uniformity of tuber size — important for both household consumption and market sale. Healing Root supports each sale with practical on-farm advice to turn good planting material into dependable yields and income.`
  }
];

// -------------- UI ELEMENTS EXISTENCE (ensure page has these IDs) --------------
/* This code uses these IDs/classes in your HTML:
  - auth: #auth (sign-up inputs/buttons)
  - login: #loginEmail, #loginPassword, #loginBtn
  - signup: #signupName, #signupEmail, #signupPassword, #signupBtn
  - logout: #logoutBtn
  - feed: #feedContainer
  - post area: #postText, #postImage, #postBtn
  - profile modal/page: #profileModal, #profileName, #profilePic, #profileUpload, #profileBio, #saveProfileBtn, #myPosts
  - products page: #productsContainer
  - admin page: #adminUsers, #adminPosts
  - chat area: #friendsChatList, #chatWindow, #chatMessages, #chatInput, #sendChatBtn
If your HTML lists differ, adapt IDs or paste the HTML pages I provided earlier.
*/

// -------------- AUTH FLOW --------------
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const logoutBtnEl = document.getElementById("logoutBtn");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupBtn = document.getElementById("signupBtn");

let currentUser = null;

// Sign up
if (signupBtn) signupBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const name = signupName.value?.trim();
  const email = signupEmail.value?.trim();
  const password = signupPassword.value;
  if (!name || !email || !password) return alert("Fill all signup fields");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // create user doc
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      profilePic: "",
      bio: "",
      createdAt: serverTimestamp(),
      friends: [], // array of uids
      receivedRequests: [], // uids who sent to me
      sentRequests: [] // uids I sent to
    });
    await updateProfile(cred.user, { displayName: name });
    alert("Account created — you are logged in");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

// Login
if (loginBtn) loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = loginEmail.value?.trim();
  const password = loginPassword.value;
  if (!email || !password) return alert("Fill login fields");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // redirect or update UI handled by onAuthStateChanged below
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

if (logoutBtnEl) logoutBtnEl.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "index.html"; // send back to login
});

// Auth listener
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    // logged in
    console.log("Logged in:", user.uid, user.email);
    // seed products once (only when someone first logs in and meta doc not set)
    await seedProductsOnce();
    // initialize UI pieces
    initAfterLogin();
  } else {
    console.log("Logged out");
    // show login page — your HTML should handle it
  }
});

// -------------- SEED PRODUCTS ONCE (prevents duplicates) --------------
async function seedProductsOnce() {
  try {
    const metaRef = doc(db, "meta", "seed");
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) return; // already seeded

    // create product docs and product-posts in posts collection
    for (const p of PRODUCTS) {
      await setDoc(doc(db, "products", p.id), {
        name: p.name,
        image: p.image,
        price: p.price,
        description: p.description,
        createdAt: serverTimestamp()
      });

      // create a single system post representing the product (so it appears in feed)
      await addDoc(collection(db, "posts"), {
        system: true,
        productId: p.id,
        name: p.name,
        text: p.description,
        image: p.image, // points to static GitHub images path in your repo
        price: p.price,
        createdAt: serverTimestamp()
      });
    }

    await setDoc(metaRef, { productsSeeded: true, ts: serverTimestamp() });
    console.log("Products seeded");
  } catch (err) {
    console.error("seedProductsOnce error", err);
  }
}

// -------------- INIT AFTER LOGIN --------------
async function initAfterLogin() {
  // Render product page & feed & profile & friends & admin
  await renderProductsPage();
  startFeedListener();
  await renderProfile(currentUser.uid);
  await renderFriendsUI();
  await renderAdminUIIfAdmin();
  // attach other listeners if any
}

// -------------- RENDER PRODUCTS PAGE --------------
async function renderProductsPage() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  container.innerHTML = ""; // clear
  // prefer Firestore products collection
  try {
    const snap = await getDocs(collection(db, "products"));
    if (!snap.empty) {
      snap.forEach(d => {
        const p = d.data();
        container.appendChild(productCardFromData({ id: d.id, ...p }));
      });
      return;
    }
  } catch (err) {
    console.warn("products collection read failed", err);
  }

  // fallback to static PRODUCTS
  for (const p of PRODUCTS) {
    container.appendChild(productCardFromData({ id: p.id, ...p }));
  }
}

function productCardFromData(p) {
  const card = document.createElement("div");
  card.className = "card product-card";
  card.innerHTML = `
    <img src="${p.image}" alt="${p.name}" style="width:100%;height:220px;object-fit:cover;border-radius:8px" />
    <h3 style="margin:10px 0">${p.name}</h3>
    <p style="font-weight:700;color:#0A5A0A">${fmt(p.price)}</p>
    <p style="max-height:120px;overflow:hidden">${p.description}</p>
    <div style="margin-top:10px;display:flex;gap:8px">
      <button class="btn-order">Order via WhatsApp</button>
      <button class="btn-view" data-id="${p.id}">View</button>
    </div>
  `;
  card.querySelector(".btn-order").addEventListener("click", () => {
    const msg = `Hello, I want to order ${p.name} priced at ${fmt(p.price)}.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  });
  card.querySelector(".btn-view").addEventListener("click", () => openProductPage(p.id));
  return card;
}

function openProductPage(productId) {
  // Simple modal or navigate to product detail page; for simplicity alert for now
  (async () => {
    const pd = await getDoc(doc(db, "products", productId));
    let p = pd.exists() ? pd.data() : PRODUCTS.find(x => x.id === productId);
    if (!p) return alert("Product not found");
    // show full details - in UI you should create a modal; here we use confirm to direct to WhatsApp
    const ok = confirm(`${p.name}\n\nPrice: ${fmt(p.price)}\n\nShow full description?`);
    if (ok) alert(p.description);
  })();
}

// -------------- FEED (posts & product posts) --------------
let feedUnsubscribe = null;
function startFeedListener() {
  const feedContainer = document.getElementById("feedContainer");
  if (!feedContainer) return;
  // listen to posts ordered by createdAt desc
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  if (feedUnsubscribe) feedUnsubscribe();
  feedUnsubscribe = onSnapshot(q, (snap) => {
    feedContainer.innerHTML = "";
    snap.forEach(docSnap => {
      const post = docSnap.data();
      const id = docSnap.id;
      feedContainer.appendChild(postCardFromData({ id, ...post }));
    });
  }, (err) => console.error("feed onSnapshot", err));
}

function postCardFromData(post) {
  const card = document.createElement("div");
  card.className = "card post-card";
  // clickable user area (avatar + name) — opens user profile
  const avatar = post.profilePic || "images/default_profile.png";
  const name = post.name || (post.system ? "Healing Root" : post.email || "User");
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.gap = "12px";
  header.style.alignItems = "center";
  header.innerHTML = `<img src="${avatar}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;cursor:pointer" data-uid="${post.uid || ''}" class="post-avatar"/>
                      <div>
                        <strong style="cursor:pointer" class="post-username" data-uid="${post.uid||''}">${name}</strong>
                        <div style="color:#666;font-size:12px">${post.system ? "Product" : (new Date((post.createdAt && post.createdAt.toDate) ? post.createdAt.toDate() : Date.now())).toLocaleString()}</div>
                      </div>`;
  card.appendChild(header);

  // main text
  const txt = document.createElement("p");
  txt.style.whiteSpace = "pre-wrap";
  txt.textContent = post.text || (post.productId ? post.text : "");
  card.appendChild(txt);

  // image (if any)
  if (post.image) {
    const img = document.createElement("img");
    img.src = post.image;
    img.style.width = "100%";
    img.style.height = "300px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    img.style.marginTop = "8px";
    card.appendChild(img);
  }

  // product price & order if product
  if (post.productId) {
    const priceEl = document.createElement("div");
    priceEl.style.marginTop = "8px";
    priceEl.innerHTML = `<strong style="color:#0A5A0A">${fmt(post.price || post.price)}</strong>
                         <button style="margin-left:10px" class="btn-order-prod">Order via WhatsApp</button>`;
    priceEl.querySelector(".btn-order-prod").addEventListener("click", () => {
      const msg = `Hello, I want to order ${post.name} priced at ${fmt(post.price || post.price)}.`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    });
    card.appendChild(priceEl);
  }

  // actions (delete if owner or admin), comment button (simple)
  const actions = document.createElement("div");
  actions.style.marginTop = "8px";
  actions.style.display = "flex";
  actions.style.gap = "8px";

  // Delete button (owner or admin)
  if (currentUser && (currentUser.uid === post.uid || currentUser.uid === ADMIN_UID)) {
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.background = "crimson";
    delBtn.style.color = "white";
    delBtn.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      try {
        await deleteDoc(doc(db, "posts", post.id || post._id || ""));
        alert("Deleted");
      } catch (err) {
        console.error("delete post error", err);
        alert("Unable to delete");
      }
    });
    actions.appendChild(delBtn);
  }

  // Add Friend / Chat depending on relation (show buttons only for non-system posts with uid)
  if (post.uid && currentUser && post.uid !== currentUser.uid) {
    const btn = document.createElement("button");
    // we need to check friendship status
    (async () => {
      const meRef = doc(db, "users", currentUser.uid);
      const meSnap = await getDoc(meRef);
      const meData = meSnap.exists() ? meSnap.data() : {};
      const friends = meData.friends || [];
      const sent = meData.sentRequests || [];
      const received = meData.receivedRequests || [];

      if (friends.includes(post.uid)) {
        btn.textContent = "Chat 💬";
        btn.addEventListener("click", () => openChatWith(post.uid));
      } else if (sent.includes(post.uid)) {
        btn.textContent = "Requested";
        btn.disabled = true;
      } else if (received.includes(post.uid)) {
        btn.textContent = "Respond";
        btn.addEventListener("click", () => openUserProfile(post.uid));
      } else {
        btn.textContent = "Add Friend";
        btn.addEventListener("click", () => sendFriendRequest(post.uid));
      }
    })();
    actions.appendChild(btn);
  }

  // Comment UI — minimal: open prompt to add comment saved under posts/<postId>/comments
  const commentBtn = document.createElement("button");
  commentBtn.textContent = "Comment";
  commentBtn.addEventListener("click", async () => {
    if (!currentUser) return alert("Login to comment");
    const comment = prompt("Write comment:");
    if (!comment) return;
    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email,
        text: comment,
        createdAt: serverTimestamp()
      });
      alert("Comment posted");
    } catch (err) {
      console.error("comment error", err);
      alert("Cannot comment");
    }
  });
  actions.appendChild(commentBtn);

  card.appendChild(actions);

  // clickable avatar & name to open profile
  card.querySelectorAll(".post-avatar, .post-username").forEach(elm => {
    elm.addEventListener("click", () => {
      const targetUid = elm.dataset.uid;
      if (!targetUid) return;
      openUserProfile(targetUid);
    });
  });

  return card;
}

// -------------- CREATE POST (text + image via Cloudinary) --------------
const postBtnEl = document.getElementById("postBtn");
if (postBtnEl) postBtnEl.addEventListener("click", async () => {
  if (!currentUser) return alert("Login first");
  const textEl = document.getElementById("postText");
  const fileEl = document.getElementById("postImage");
  const text = textEl?.value?.trim() || "";
  const file = fileEl?.files?.[0] || null;
  if (!text && !file) return alert("Add text or image");

  let imageUrl = "";
  if (file) {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: form });
      const data = await res.json();
      imageUrl = data.secure_url;
    } catch (err) {
      console.error("cloudinary upload error", err);
      alert("Image upload failed");
      return;
    }
  }

  try {
    await addDoc(collection(db, "posts"), {
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email,
      email: currentUser.email,
      profilePic: (currentUser.photoURL || ""),
      text,
      image: imageUrl,
      createdAt: serverTimestamp()
    });
    if (textEl) textEl.value = "";
    if (fileEl) fileEl.value = "";
    alert("Posted");
  } catch (err) {
    console.error("create post error", err);
    alert("Unable to post");
  }
});

// -------------- PROFILE view / edit --------------
async function renderProfile(uid) {
  const profileNameEl = document.getElementById("profileName");
  const profilePicEl = document.getElementById("profilePic");
  const profileBioEl = document.getElementById("profileBio");
  const myPostsEl = document.getElementById("myPosts");

  if (!uid) return;

  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    const data = userSnap.exists() ? userSnap.data() : null;
    if (data) {
      if (profileNameEl) profileNameEl.textContent = data.name || data.email || "";
      if (profilePicEl) profilePicEl.src = data.profilePic || "images/default_profile.png";
      if (profileBioEl) profileBioEl.value = data.bio || "";
    }

    // my posts
    if (myPostsEl) {
      myPostsEl.innerHTML = "";
      const q = query(collection(db, "posts"), where("uid", "==", uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      snap.forEach(d => {
        const p = d.data();
        const node = document.createElement("div");
        node.className = "card";
        node.innerHTML = `<h4>${p.name||p.email}</h4><p>${p.text||""}</p>`;
        if (p.image) node.appendChild(Object.assign(document.createElement("img"), { src: p.image, style: "width:100%;height:180px;object-fit:cover;border-radius:8px" }));
        // delete button if owner
        if (currentUser && currentUser.uid === uid) {
          const del = document.createElement("button");
          del.textContent = "Delete";
          del.style.background = "crimson";
          del.addEventListener("click", async () => {
            if (!confirm("Delete this post?")) return;
            await deleteDoc(doc(db, "posts", d.id));
            renderProfile(uid);
          });
          node.appendChild(del);
        }
        myPostsEl.appendChild(node);
      });
    }
  } catch (err) {
    console.error("renderProfile", err);
  }
}

// Save profile picture (upload to Cloudinary)
const saveProfileBtn = document.getElementById("saveProfileBtn");
if (saveProfileBtn) saveProfileBtn.addEventListener("click", async () => {
  if (!currentUser) return alert("Login");
  const fileEl = document.getElementById("profileUpload");
  const bioEl = document.getElementById("profileBio");
  const file = fileEl?.files?.[0];
  let url = "";
  if (file) {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: form });
      const data = await res.json();
      url = data.secure_url;
    } catch (err) {
      console.error("cloudinary profile upload", err);
      alert("Upload failed");
      return;
    }
  }
  try {
    await updateDoc(doc(db, "users", currentUser.uid), {
      profilePic: url || undefined,
      bio: bioEl?.value || undefined
    });
    // update auth profile photoURL if you want visible in auth
    if (url) await updateProfile(currentUser, { photoURL: url });
    alert("Profile updated");
    renderProfile(currentUser.uid);
  } catch (err) {
    console.error("saveProfile error", err);
    alert("Cannot save profile");
  }
});

// -------------- FRIENDS (send, accept, decline) --------------
async function sendFriendRequest(targetUid) {
  if (!currentUser) return alert("Login to send friend request");
  if (targetUid === currentUser.uid) return alert("Cannot add yourself");
  try {
    // update current user's sentRequests and target user's receivedRequests atomically (best-effort)
    const meRef = doc(db, "users", currentUser.uid);
    const targetRef = doc(db, "users", targetUid);
    const meSnap = await getDoc(meRef);
    const targetSnap = await getDoc(targetRef);
    const meData = meSnap.exists() ? meSnap.data() : {};
    const targetData = targetSnap.exists() ? targetSnap.data() : {};

    const meSent = new Set(meData.sentRequests || []);
    const targetReceived = new Set(targetData.receivedRequests || []);

    if (meSent.has(targetUid)) return alert("Request already sent");
    if ((meData.friends || []).includes(targetUid)) return alert("Already friends");

    meSent.add(targetUid);
    targetReceived.add(currentUser.uid);

    await updateDoc(meRef, { sentRequests: Array.from(meSent) });
    await updateDoc(targetRef, { receivedRequests: Array.from(targetReceived) });
    alert("Friend request sent");
    // refresh friend UI
    renderFriendsUI();
  } catch (err) {
    console.error("sendFriendRequest", err);
    alert("Unable to send request");
  }
}

async function acceptFriendRequest(fromUid) {
  if (!currentUser) return alert("Login");
  try {
    const meRef = doc(db, "users", currentUser.uid);
    const fromRef = doc(db, "users", fromUid);
    const meSnap = await getDoc(meRef);
    const fromSnap = await getDoc(fromRef);
    const meData = meSnap.exists() ? meSnap.data() : {};
    const fromData = fromSnap.exists() ? fromSnap.data() : {};

    const meReceived = new Set(meData.receivedRequests || []);
    const meFriends = new Set(meData.friends || []);
    const fromSent = new Set(fromData.sentRequests || []);
    const fromFriends = new Set(fromData.friends || []);

    if (!meReceived.has(fromUid)) return alert("No such request");

    meReceived.delete(fromUid);
    fromSent.delete(currentUser.uid);

    meFriends.add(fromUid);
    fromFriends.add(currentUser.uid);

    await updateDoc(meRef, { receivedRequests: Array.from(meReceived), friends: Array.from(meFriends) });
    await updateDoc(fromRef, { sentRequests: Array.from(fromSent), friends: Array.from(fromFriends) });
    alert("Friend added");
    renderFriendsUI();
  } catch (err) {
    console.error("acceptFriendRequest", err);
    alert("Unable to accept");
  }
}

async function declineFriendRequest(fromUid) {
  if (!currentUser) return alert("Login");
  try {
    const meRef = doc(db, "users", currentUser.uid);
    const fromRef = doc(db, "users", fromUid);
    const meSnap = await getDoc(meRef);
    const fromSnap = await getDoc(fromRef);
    const meData = meSnap.exists() ? meSnap.data() : {};
    const fromData = fromSnap.exists() ? fromSnap.data() : {};

    const meReceived = new Set(meData.receivedRequests || []);
    const fromSent = new Set(fromData.sentRequests || []);

    meReceived.delete(fromUid);
    fromSent.delete(currentUser.uid);

    await updateDoc(meRef, { receivedRequests: Array.from(meReceived) });
    await updateDoc(fromRef, { sentRequests: Array.from(fromSent) });
    alert("Request declined");
    renderFriendsUI();
  } catch (err) {
    console.error("declineFriendRequest", err);
    alert("Unable to decline");
  }
}

// Render friends UI parts: pending received, sent, friends list
async function renderFriendsUI() {
  const requestsContainer = document.getElementById("requestsList");
  const friendsContainer = document.getElementById("friendsList");
  const chatFriendsList = document.getElementById("friendsChatList");

  if (!currentUser) return;
  // fetch me
  const meSnap = await getDoc(doc(db, "users", currentUser.uid));
  const meData = meSnap.exists() ? meSnap.data() : { receivedRequests: [], sentRequests: [], friends: [] };

  // Received requests
  if (requestsContainer) {
    requestsContainer.innerHTML = "";
    for (const uid of meData.receivedRequests || []) {
      const uSnap = await getDoc(doc(db, "users", uid));
      const u = uSnap.exists() ? uSnap.data() : { name: uid, email: "" };
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<strong>${u.name || u.email}</strong><div style="display:flex;gap:6px;margin-top:6px">
                          <button class="btn-accept">Accept</button>
                          <button class="btn-decline">Decline</button>
                        </div>`;
      card.querySelector(".btn-accept").addEventListener("click", () => acceptFriendRequest(uid));
      card.querySelector(".btn-decline").addEventListener("click", () => declineFriendRequest(uid));
      requestsContainer.appendChild(card);
    }
  }

  // Friends list (accepted)
  if (friendsContainer) {
    friendsContainer.innerHTML = "";
    for (const uid of meData.friends || []) {
      const uSnap = await getDoc(doc(db, "users", uid));
      const u = uSnap.exists() ? uSnap.data() : { name: uid };
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<strong>${u.name || u.email}</strong><div style="margin-top:6px"><button class="btn-chat">Chat 💬</button></div>`;
      card.querySelector(".btn-chat").addEventListener("click", () => openChatWith(uid));
      friendsContainer.appendChild(card);
    }
  }

  // Chat friends list (same)
  if (chatFriendsList) {
    chatFriendsList.innerHTML = "";
    for (const uid of meData.friends || []) {
      const uSnap = await getDoc(doc(db, "users", uid));
      const u = uSnap.exists() ? uSnap.data() : { name: uid };
      const li = document.createElement("div");
      li.className = "card";
      li.innerHTML = `<strong>${u.name || u.email}</strong><button class="btn-open-chat" style="margin-left:8px">Open</button>`;
      li.querySelector(".btn-open-chat").addEventListener("click", () => openChatWith(uid));
      chatFriendsList.appendChild(li);
    }
  }
}

// -------------- OPEN USER PROFILE (from feed click) --------------
function openUserProfile(uid) {
  // Ideally navigate to profile.html?uid=UID
  // We'll open a modal or go to profile page and display the user info
  // For simplicity, try to open profile page with query param
  window.location.href = `profile.html?uid=${uid}`;
}

// -------------- CHAT (between accepted friends) --------------
let chatPairId = null;
function openChatWith(otherUid) {
  if (!currentUser) return alert("Login");
  // check they are friends
  (async () => {
    const meSnap = await getDoc(doc(db, "users", currentUser.uid));
    const meData = meSnap.exists() ? meSnap.data() : {};
    if (!meData.friends || !meData.friends.includes(otherUid)) return alert("You must be friends to chat");
    chatPairId = uidPair(currentUser.uid, otherUid);
    // show chat UI
    window.location.href = `chat.html?pair=${chatPairId}&with=${otherUid}`;
  })();
}

// On chat.html load: call loadChat(pairId)
async function loadChat(pairId, otherUid) {
  const messagesEl = document.getElementById("chatMessages");
  const inputEl = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendChatBtn");
  if (!pairId || !messagesEl) return;
  messagesEl.innerHTML = "";

  // listener for messages where pairId equals this
  const q = query(collection(db, "chats"), where("pairId", "==", pairId), orderBy("createdAt", "asc"));
  onSnapshot(q, (snap) => {
    messagesEl.innerHTML = "";
    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement("div");
      div.className = (m.from === currentUser.uid) ? "chat-msg me" : "chat-msg them";
      div.textContent = `${m.text}`;
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });

  if (sendBtn) sendBtn.onclick = async () => {
    const txt = inputEl.value?.trim();
    if (!txt) return;
    await addDoc(collection(db, "chats"), {
      pairId,
      from: currentUser.uid,
      to: otherUid,
      text: txt,
      createdAt: serverTimestamp()
    });
    inputEl.value = "";
  };
}

// -------------- ADMIN UI --------------
async function renderAdminUIIfAdmin() {
  if (!currentUser) return;
  if (currentUser.uid !== ADMIN_UID) return;
  const adminUsersEl = document.getElementById("adminUsers");
  const adminPostsEl = document.getElementById("adminPosts");
  if (adminUsersEl) {
    adminUsersEl.innerHTML = "";
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(d => {
      const u = d.data();
      const node = document.createElement("div");
      node.className = "card";
      node.innerHTML = `<strong>${u.name || u.email}</strong><div style="color:#666">${d.id}</div>`;
      adminUsersEl.appendChild(node);
    });
  }
  if (adminPostsEl) {
    adminPostsEl.innerHTML = "";
    const postsSnap = await getDocs(collection(db, "posts"));
    postsSnap.forEach(d => {
      const p = d.data();
      const node = document.createElement("div");
      node.className = "card";
      node.innerHTML = `<strong>${p.name || p.email}</strong><p>${p.text || ""}</p>`;
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.style.background = "crimson";
      del.addEventListener("click", async () => {
        if (!confirm("Delete this post?")) return;
        await deleteDoc(doc(db, "posts", d.id));
        renderAdminUIIfAdmin();
      });
      node.appendChild(del);
      adminPostsEl.appendChild(node);
    });
  }
}

// -------------- UTILS --------------
function fmt(n){ return "₦" + Number(n).toLocaleString(); }

// -------------- FINAL NOTES --------------
/*
  1) This file assumes your HTML pages include elements with IDs referenced above.
  2) Product images: put them in images/ folder in your repo (GitHub pages) with exact names used above.
  3) Cloudinary: unsigned preset 'unsigned_upload' must be created in your Cloudinary dashboard.
  4) Firestore rules: use the secure rules I previously gave you (users/posts/products/chats).
  5) To show a user's profile page, open profile.html?uid=<uid> and use URLSearchParams to load that profile's details (getDoc users/<uid>).
  6) If your HTML uses different IDs, either rename the elements or update IDs here.
  7) For performance & security improvements later, move some logic to server side or Cloud Functions if needed.
*/

console.log("app.js loaded — all-in-one script");
