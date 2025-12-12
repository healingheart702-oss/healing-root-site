// js/app.js — Complete all-in-one application script
// Paste exactly as-is into js/app.js and include as:
// <script type="module" src="js/app.js"></script>

// ---------------- Firebase modular imports ----------------
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
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  limit
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// ---------------- Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.firebasestorage.app",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

// Cloudinary unsigned settings (client-side safe)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/auto/upload";
const UPLOAD_PRESET = "unsigned_upload";

// Admin UID (you gave earlier)
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// WhatsApp number for orders
const WHATSAPP_NUMBER = "2349138938301";

// ---------------- Init ----------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------- Utilities ----------------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const fmtPrice = (n) => "₦" + Number(n).toLocaleString();
const uidPair = (a, b) => [a, b].sort().join("_");

// ---------------- Products (8 with long descriptions) ----------------
// Using relative image paths: images/<filename> in your repo
const PRODUCTS = [
  {
    id: "cassava_tme419",
    name: "TME 419 Cassava Stems",
    image: "images/cassava.JPG",
    price: 1000,
    description:
`Healing Root AGRO Ventures stands as a leading provider of certified cassava stems in Nigeria. Our TME 419 stems are carefully selected, cut, and handled to give farmers the highest chance of establishment success and maximum starch yields. TME 419 is prized for its early maturity and consistent tuber quality — two attributes that separate successful cassava enterprises from marginal farms. Each bundle we supply is prepared under hygienic conditions to reduce the risk of disease and maximize sprouting.

We understand that farmers need practical guidance as much as healthy planting materials. That is why each purchase includes simple, actionable planting instructions: proper spacing to balance yield and management ease, starter fertilizer recommendations to ensure early vigor, and pest monitoring tips focused on the pests that matter most in local conditions. Farmers planting TME 419 will find the crop matures faster, comes with predictable yields, and offers better suitability for industrial starch or local consumption.

Cassava’s versatility is also a major advantage: it can be processed into flour and starch, used for animal feed, or sold into local markets — giving farmers multiple revenue streams. Our stems are therefore not just an input; they are an investment in reliable production. Whether you are a subsistence farmer seeking food security or a commercial grower targeting industrial buyers, TME 419 stems from Healing Root AGRO Ventures provide the consistent foundation you need.

We take pride in transparent delivery, reliable customer support, and a reputation for supplying quality planting material. Choosing our TME 419 stems means choosing a product supported by agronomy knowledge, quality control, and a focus on long-term farm profitability. We stand ready to guide you from planting to harvest and beyond.`
  },

  {
    id: "giant_banana",
    name: "Hybrid Giant Banana Suckers",
    image: "images/giant_banana.JPG",
    price: 500,
    description:
`Our Hybrid Giant Banana suckers at Healing Root AGRO Ventures are produced with one goal — to give farmers a dependable, high-yielding banana that offers excellent fruit size and flavour while being robust in the field. These suckers are raised in sanitized nursery environments ensuring strong root systems and vigorous early growth when transplanted to the field. Hybrid varieties we supply are selected for pest resistance and fast fruiting, reducing the gap between planting and income.

Banana farming is one of the most accessible forms of commercial horticulture. With proper spacing, fertilization, and basic pest management, hybrid giant banana stands can provide continuous income in a fraction of the time required for many tree crops. We provide planting guidelines tailored to both smallholder and commercial setups, including nutrition schedules that balance vegetative growth and fruit production to maximize bunch size without compromising plant health.

We also emphasise post-harvest handling advice so farmers retain fruit quality from farm to market: proper harvesting stages, careful handling to avoid bruising, and recommended packing techniques for better market prices. Our customers benefit from a package that includes quality suckers, reliable advice, and a pathway to consistent banana production.`
  },

  {
    id: "tenera_oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description:
`Tenera oil palm seedlings from Healing Root AGRO Ventures represent a long-term, wealth-building agricultural asset. The Tenera hybrid is preferred worldwide because it combines early bearing with a high oil-to-bunch ratio — a combination that directly translates into better returns for plantation owners. We raise seedlings under controlled nursery conditions, ensuring healthy root development and reducing transplant shock at field establishment.

Oil palm is not a quick-return crop — it is a generational investment. Proper nursery selection and careful establishment unlock decades of dependable yield. We provide clear spacing recommendations, early nutrition strategies, weed control plans and management timelines that help farmers convert seedlings into a productive stand more reliably. Whether you are putting your first block into production or expanding a mature plantation, quality seedlings matter enormously.

From household use to large industrial demand, palm oil's market is wide and resilient. Tenera seedlings are an asset that matches sustained demand across food, cosmetic, and energy industries. Healing Root AGRO Ventures combines high-quality seedlings with pragmatic guidance so you can start your journey from planting to consistent plantations with confidence. Our service includes follow-up advice and practical tips to keep your palms healthy for the long run.`
  },

  {
    id: "plantain_hybrid",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description:
`Hybrid plantain suckers offered by Healing Root AGRO Ventures are chosen for yield uniformity, disease tolerance, and dependable field performance. Plantain farming offers strong market demand and integrates well into both smallholder and commercial farms due to its predictable cropping cycle and flexibility for intercropping. Our nursery-raised suckers are hardened and managed to ensure a high survival rate after transplanting.

We pair each sale with practical agronomic guidance: optimal spacing depending on your land objective, fertilizer recommendations to improve fruit size and bunch weight, and pest management techniques that reduce production risk. Plantain delivers steady returns with relatively low input costs, making it an attractive crop for farmers seeking consistent income streams.

Healing Root’s plantain package is built to reduce establishment risk and give farmers clear steps to maximize productivity. We support buyers with continued advice after purchase, because high-quality planting material is just the start — good advice turns quality inputs into marketable harvests.`
  },

  {
    id: "coconut_hybrid",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description:
`Our hybrid dwarf coconut seedlings are for farmers and investors who want a manageable, early-fruiting coconut variety with high productivity. Dwarf hybrids reduce the height challenge of tall coconuts while maintaining the benefits of strong fruit yields. Seedlings are raised in a controlled nursery, given balanced nutrition and pest awareness routines to encourage robust early growth and reduce transplant failures.

Coconut is an orchard crop with a long life span and many income avenues — fresh fruit, copra, water, fiber and value-added products. Dwarf hybrids accelerate entry into production because they begin fruiting earlier and are easier to maintain. Healing Root provides planting layouts, early irrigation and mulching advice, and pest/disease prevention measures so that each seedling transitions to field well-established.

Because coconut yields reward patient investment, our seedlings are priced and packaged with guidance that helps growers convert nursery quality into orchard profitability, whether for household income or commercial orchard establishment.`
  },

  {
    id: "giant_cocoa",
    name: "Hybrid Cocoa Nursery Plant",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description:
`Hybrid cocoa seedlings from Healing Root AGRO Ventures are selected for early bearing, disease tolerance and consistent bean quality. Cocoa remains a high-value, export-oriented crop where the right nursery stock is the first critical step toward premium bean yields. Our seedlings are grown to promote healthy canopy development and root systems that support long-term productivity.

We advise on simple shade management, pruning to improve light interception, and pest/disease monitoring that protect early yields. With the right seedlings and disciplined care, cocoa becomes a reliable cash crop that supports families and creates value for processors. Healing Root pairs quality seedlings with results-oriented agronomy advice so your cocoa trees can reach their yield potential and supply processors with quality beans.`
  },

  {
    id: "pineapple",
    name: "Pineapple Suckers (MD2 and selections)",
    image: "images/pineapple.JPG",
    price: 400,
    description:
`Pineapple production is an attractive, fast-return horticulture option. Healing Root AGRO Ventures supplies high-quality pineapple suckers selected for uniformity, fruit sweetness, and marketable appearance. Our nursery ensures disease-free planting materials and early conditioning to reduce establishment failures.

Pineapple can be planted intensively for quick returns or at lower density for larger fruits. We provide planting schedules suitable to both approaches, along with fertility recommendations and disease watchlists. Pineapple’s broad market — fresh consumption, juice, canning and export — creates multiple revenue windows for farmers.

Our supply includes planting guidance, recommended fertilizer regimes and early pest management to ensure quick establishment and consistent yields. Choose our pineapples for reliable, market-ready fruit production.`
  },

  {
    id: "yam_setts",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 500,
    description:
`Treated yam setts from Healing Root AGRO Ventures are selected for high sprouting potential and minimal disease incidence. We process setts from disease-free mother tubers and treat them to reduce rot and improve early establishment. Yam remains a staple crop with strong local demand and good returns when planted using proven setts and recommended agronomy.

We provide guidance on mound/ridge planting systems, staking where needed, and targeted fertilization schemes that promote large tuber development. Treated setts reduce early-stage crop failure and increase the odds of producing market-sized tubers. For both household consumption and market sale, reliable planting material is the key difference between variable and dependable harvests.

Healing Root pairs practical advice with quality materials to ensure farmers convert strong block establishment into reliable yields and consistent income.`
  }
];

// ---------------- Authentication & user doc management ----------------
let currentUser = null;

// Helper: safe get element
function el(id) { return document.getElementById(id); }

// Auth functions (login/signup/logout)
async function doSignup(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  // create user doc
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    profilePic: "",
    bio: "",
    createdAt: serverTimestamp(),
    friends: [],
    receivedRequests: [],
    sentRequests: []
  });
  // update auth profile displayName
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
}
async function doLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}
async function doLogout() {
  await signOut(auth);
  currentUser = null;
  // redirect to login page
  if (location.pathname.endsWith("index.html") || location.pathname === "/" ) {
    // already login page
  } else {
    location.href = "index.html";
  }
}

// Attach logout button (if present)
if (el("logoutBtn")) el("logoutBtn").addEventListener("click", async () => {
  await doLogout();
});

// ---------------- Seed products once into Firestore ----------------
async function seedProductsOnce() {
  try {
    const metaRef = doc(db, "meta", "productsSeed");
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) return; // already seeded

    for (const p of PRODUCTS) {
      await setDoc(doc(db, "products", p.id), {
        name: p.name,
        image: p.image,
        price: p.price,
        description: p.description,
        createdAt: serverTimestamp()
      });

      // Also create a system post so product appears in feed
      await addDoc(collection(db, "posts"), {
        system: true,
        productId: p.id,
        name: p.name,
        text: p.description,
        image: p.image,
        price: p.price,
        createdAt: serverTimestamp()
      });
    }
    await setDoc(metaRef, { seeded: true, ts: serverTimestamp() });
    console.log("Products seeded");
  } catch (err) {
    console.error("seedProductsOnce err", err);
  }
}

// ---------------- Real-time Feed ----------------
let feedUnsub = null;
function startFeedListener() {
  const feedContainer = el("feedContainer");
  if (!feedContainer) return;
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  if (feedUnsub) feedUnsub();
  feedUnsub = onSnapshot(q, (snap) => {
    feedContainer.innerHTML = "";
    snap.forEach(docSnap => {
      const data = { id: docSnap.id, ...docSnap.data() };
      feedContainer.appendChild(makePostCard(data));
    });
  }, (err) => console.error("feed onSnapshot", err));
}

// Create post card element (clickable username/profile)
function makePostCard(post) {
  const card = document.createElement("div");
  card.className = "card post-card";

  // Header: avatar + name (clickable)
  const avatarUrl = post.profilePic || "images/default_profile.png";
  const userUid = post.uid || "";
  const header = document.createElement("div");
  header.className = "post-header";
  header.innerHTML = `
    <img src="${avatarUrl}" class="post-avatar" style="width:64px;height:64px;border-radius:8px;object-fit:cover;cursor:pointer" data-uid="${userUid}" />
    <div class="post-header-meta">
      <strong class="post-username" data-uid="${userUid}" style="cursor:pointer">${post.name || (post.system ? "Healing Root AGRO" : (post.email || "User"))}</strong>
      <div class="post-meta">${post.system ? "Product" : (post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : "")}</div>
    </div>
  `;
  card.appendChild(header);

  // Body: text, truncated if long
  const body = document.createElement("div");
  body.className = "post-body";
  const textEl = document.createElement("p");
  textEl.style.whiteSpace = "pre-wrap";
  textEl.textContent = post.text || "";
  body.appendChild(textEl);
  // If very long, add "read more"
  if ((post.text || "").length > 800) {
    const readMoreBtn = document.createElement("button");
    readMoreBtn.textContent = "Read more";
    readMoreBtn.addEventListener("click", () => alert(post.text));
    body.appendChild(readMoreBtn);
  }
  if (post.image) {
    const img = document.createElement("img");
    img.src = post.image;
    img.style.width = "100%";
    img.style.maxHeight = "320px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    img.style.marginTop = "8px";
    body.appendChild(img);
  }
  card.appendChild(body);

  // Footer: price/order if product, actions (comment, friend/chat, delete)
  const footer = document.createElement("div");
  footer.className = "post-footer";
  footer.style.display = "flex";
  footer.style.gap = "8px";
  footer.style.marginTop = "10px";

  if (post.productId || post.price) {
    const priceDiv = document.createElement("div");
    priceDiv.innerHTML = `<strong style="color:#0A5A0A">${fmtPrice(post.price || post.price)}</strong>`;
    footer.appendChild(priceDiv);

    const orderBtn = document.createElement("button");
    orderBtn.textContent = "Order via WhatsApp";
    orderBtn.addEventListener("click", () => {
      const msg = `Hello, I want to order ${post.name || "product"} priced at ${fmtPrice(post.price || post.price)}.`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    });
    footer.appendChild(orderBtn);
  }

  // Comment button
  const commentBtn = document.createElement("button");
  commentBtn.textContent = "Comment";
  commentBtn.addEventListener("click", async () => {
    if (!currentUser) return alert("Login to comment");
    const c = prompt("Write your comment:");
    if (!c) return;
    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email,
        text: c,
        createdAt: serverTimestamp()
      });
      // create notification to post owner
      if (post.uid && post.uid !== currentUser.uid) {
        await addNotification(post.uid, `${currentUser.displayName || currentUser.email} commented on your post`);
      }
      alert("Comment posted");
    } catch (err) {
      console.error("comment err", err);
      alert("Unable to comment");
    }
  });
  footer.appendChild(commentBtn);

  // Friend/Chat/Add Friend logic for posts by users (not system)
  if (post.uid && currentUser && post.uid !== currentUser.uid) {
    const relationBtn = document.createElement("button");
    relationBtn.textContent = "Loading...";
    updateRelationButton(relationBtn, post.uid);
    footer.appendChild(relationBtn);
  }

  // Delete (owner or admin)
  if (currentUser && (currentUser.uid === post.uid || currentUser.uid === ADMIN_UID)) {
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.style.background = "#d9534f"; del.style.color = "#fff";
    del.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      try {
        await deleteDoc(doc(db, "posts", post.id));
        alert("Post deleted");
      } catch (err) {
        console.error("delete post", err);
        alert("Could not delete");
      }
    });
    footer.appendChild(del);
  }

  card.appendChild(footer);

  // Make username & avatar clickable to profile
  card.querySelectorAll("[data-uid]").forEach(elm => {
    const targetUid = elm.dataset.uid;
    if (!targetUid) return;
    elm.addEventListener("click", () => openUserProfile(targetUid));
  });

  return card;
}

// Relation button: shows Add Friend / Requested / Respond / Chat depending
async function updateRelationButton(btnEl, targetUid) {
  if (!currentUser) { btnEl.textContent = "Login"; btnEl.disabled = true; return; }
  try {
    const meSnap = await getDoc(doc(db, "users", currentUser.uid));
    const me = meSnap.exists() ? meSnap.data() : {};
    const friends = me.friends || [];
    const sent = me.sentRequests || [];
    const received = me.receivedRequests || [];

    if (friends.includes(targetUid)) {
      btnEl.textContent = "Chat 💬";
      btnEl.onclick = () => openChatWith(targetUid);
    } else if (sent.includes(targetUid)) {
      btnEl.textContent = "Requested";
      btnEl.disabled = true;
    } else if (received.includes(targetUid)) {
      btnEl.textContent = "Respond";
      btnEl.onclick = () => openUserProfile(targetUid);
    } else {
      btnEl.textContent = "Add Friend";
      btnEl.onclick = () => sendFriendRequest(targetUid);
    }
  } catch (err) {
    console.error("updateRelationButton", err);
    btnEl.textContent = "Error";
  }
}

// ---------------- Create Post (text + image upload via Cloudinary unsigned) ----------------
async function createPostFromUI() {
  if (!currentUser) return alert("Login to post");
  const textEl = el("postText");
  const imgEl = el("postImage");
  const text = textEl?.value?.trim() || "";
  const file = imgEl?.files?.[0] || null;
  if (!text && !file) return alert("Add text or image to post");

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
      console.error("cloud upload err", err);
      alert("Image upload failed");
      return;
    }
  }
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email,
      email: currentUser.email,
      profilePic: currentUser.photoURL || "",
      text,
      image: imageUrl,
      createdAt: serverTimestamp()
    });
    // notify followers / admin? For simplicity notify admin that new post created
    await addNotification(ADMIN_UID, `New post by ${currentUser.displayName || currentUser.email}`);
    if (textEl) textEl.value = "";
    if (imgEl) imgEl.value = "";
    alert("Post created");
  } catch (err) {
    console.error("createPost err", err);
    alert("Could not create post");
  }
}
if (el("postBtn")) el("postBtn").addEventListener("click", createPostFromUI);

// ---------------- Comments list & show comments (optional) ----------------
// Not central here but comments are stored in subcollection posts/{postId}/comments

// ---------------- Friend Request functions ----------------
async function sendFriendRequest(targetUid) {
  if (!currentUser) return alert("Login to send request");
  if (targetUid === currentUser.uid) return alert("Cannot add yourself");
  try {
    const meRef = doc(db, "users", currentUser.uid);
    const targetRef = doc(db, "users", targetUid);
    const [meSnap, targetSnap] = await Promise.all([getDoc(meRef), getDoc(targetRef)]);
    const me = meSnap.exists() ? meSnap.data() : {};
    const target = targetSnap.exists() ? targetSnap.data() : {};
    const meSent = new Set(me.sentRequests || []);
    const targetReceived = new Set(target.receivedRequests || []);
    if (meSent.has(targetUid)) return alert("Request already sent");
    if ((me.friends || []).includes(targetUid)) return alert("Already friends");

    meSent.add(targetUid);
    targetReceived.add(currentUser.uid);

    await updateDoc(meRef, { sentRequests: Array.from(meSent) });
    await updateDoc(targetRef, { receivedRequests: Array.from(targetReceived) });

    // notification to target
    await addNotification(targetUid, `${me.name || me.email || "Someone"} sent you a friend request`);

    alert("Friend request sent");
    // refresh feed items to update relation buttons
    startFeedListener();
  } catch (err) {
    console.error("sendFriendRequest", err);
    alert("Could not send friend request");
  }
}

async function acceptFriendRequest(fromUid) {
  if (!currentUser) return alert("Login");
  try {
    const meRef = doc(db, "users", currentUser.uid);
    const fromRef = doc(db, "users", fromUid);
    const [meSnap, fromSnap] = await Promise.all([getDoc(meRef), getDoc(fromRef)]);
    const me = meSnap.exists() ? meSnap.data() : {};
    const from = fromSnap.exists() ? fromSnap.data() : {};

    const meReceived = new Set(me.receivedRequests || []);
    const meFriends = new Set(me.friends || []);
    const fromSent = new Set(from.sentRequests || []);
    const fromFriends = new Set(from.friends || []);

    if (!meReceived.has(fromUid)) return alert("No request to accept");

    meReceived.delete(fromUid);
    fromSent.delete(currentUser.uid);
    meFriends.add(fromUid);
    fromFriends.add(currentUser.uid);

    await updateDoc(meRef, { receivedRequests: Array.from(meReceived), friends: Array.from(meFriends) });
    await updateDoc(fromRef, { sentRequests: Array.from(fromSent), friends: Array.from(fromFriends) });

    // notification to requester
    await addNotification(fromUid, `${me.name || me.email} accepted your friend request`);

    alert("Friend added");
    renderFriendsUI();
    startFeedListener();
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
    const [meSnap, fromSnap] = await Promise.all([getDoc(meRef), getDoc(fromRef)]);
    const me = meSnap.exists() ? meSnap.data() : {};
    const from = fromSnap.exists() ? fromSnap.data() : {};

    const meReceived = new Set(me.receivedRequests || []);
    const fromSent = new Set(from.sentRequests || []);

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

// ---------------- Render friends UI (requests and accepted) ----------------
async function renderFriendsUI() {
  if (!currentUser) return;
  const requestsEl = el("requestsList");
  const friendsEl = el("friendsList");
  const chatListEl = el("friendsChatList");
  if (requestsEl) requestsEl.innerHTML = "";
  if (friendsEl) friendsEl.innerHTML = "";
  if (chatListEl) chatListEl.innerHTML = "";

  const meSnap = await getDoc(doc(db, "users", currentUser.uid));
  const me = meSnap.exists() ? meSnap.data() : { receivedRequests: [], friends: [] };

  // show received requests
  for (const uid of me.receivedRequests || []) {
    const userSnap = await getDoc(doc(db, "users", uid));
    const u = userSnap.exists() ? userSnap.data() : { name: uid };
    if (requestsEl) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<strong>${u.name || u.email}</strong><div style="margin-top:6px"><button class="accept">Accept</button> <button class="decline">Decline</button></div>`;
      card.querySelector(".accept").addEventListener("click", () => acceptFriendRequest(uid));
      card.querySelector(".decline").addEventListener("click", () => declineFriendRequest(uid));
      requestsEl.appendChild(card);
    }
  }

  // show friends
  for (const uid of me.friends || []) {
    const userSnap = await getDoc(doc(db, "users", uid));
    const u = userSnap.exists() ? userSnap.data() : { name: uid };
    if (friendsEl) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<strong>${u.name || u.email}</strong><div style="margin-top:6px"><button class="viewProfile">View</button> <button class="chatBtn">Chat</button></div>`;
      card.querySelector(".viewProfile").addEventListener("click", () => openUserProfile(uid));
      card.querySelector(".chatBtn").addEventListener("click", () => openChatWith(uid));
      friendsEl.appendChild(card);
    }
    if (chatListEl) {
      const li = document.createElement("div");
      li.className = "card";
      li.innerHTML = `<strong>${u.name || u.email}</strong><button class="openChat">Open</button>`;
      li.querySelector(".openChat").addEventListener("click", () => openChatWith(uid));
      chatListEl.appendChild(li);
    }
  }
}

// ---------------- Notifications ----------------
// structure: collection "notifications" documents with fields: toUid, fromUid, text, read (bool), createdAt
async function addNotification(toUid, text) {
  try {
    await addDoc(collection(db, "notifications"), {
      toUid,
      fromUid: currentUser ? currentUser.uid : null,
      text,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error("addNotification", err);
  }
}

// Listen for notifications for current user and render badge & list
let notifUnsub = null;
function startNotificationsListener() {
  if (!currentUser) return;
  const q = query(collection(db, "notifications"), where("toUid", "==", currentUser.uid), orderBy("createdAt", "desc"));
  if (notifUnsub) notifUnsub();
  notifUnsub = onSnapshot(q, (snap) => {
    const listEl = el("notificationsList");
    const badgeEl = el("notifBadge");
    if (listEl) listEl.innerHTML = "";
    let unread = 0;
    snap.forEach(d => {
      const n = d.data();
      const node = document.createElement("div");
      node.className = "card";
      node.innerHTML = `<div>${n.text}</div><div style="font-size:12px;color:#666">${n.createdAt ? new Date(n.createdAt.toDate()).toLocaleString() : ""}</div>`;
      if (!n.read) { unread++; node.style.background = "#eef"; }
      // Clicking a notification marks it read
      node.addEventListener("click", async () => {
        await updateDoc(doc(db, "notifications", d.id), { read: true });
      });
      if (listEl) listEl.appendChild(node);
    });
    if (badgeEl) badgeEl.textContent = unread > 0 ? unread : "";
  }, (err) => console.error("notif listener", err));
}

// ---------------- Search (users, products, posts) ----------------
async function globalSearch(queryText) {
  const qtxt = (queryText || "").trim().toLowerCase();
  const results = { users: [], products: [], posts: [] };
  if (!qtxt) return results;

  // Search users by name/email (simple approach: fetch all users and filter — can be optimized with index or search service)
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(d => {
      const u = d.data();
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      if (name.includes(qtxt) || email.includes(qtxt)) results.users.push({ id: d.id, ...u });
    });
  } catch (err) {
    console.error("search users", err);
  }

  // Search products
  try {
    const productsSnap = await getDocs(collection(db, "products"));
    productsSnap.forEach(d => {
      const p = d.data();
      if ((p.name || "").toLowerCase().includes(qtxt) || (p.description || "").toLowerCase().includes(qtxt)) {
        results.products.push({ id: d.id, ...p });
      }
    });
  } catch (err) {
    console.error("search products", err);
  }

  // Search posts by text
  try {
    const postsSnap = await getDocs(query(collection(db, "posts"), limit(200)));
    postsSnap.forEach(d => {
      const p = d.data();
      if ((p.text || "").toLowerCase().includes(qtxt)) {
        results.posts.push({ id: d.id, ...p });
      }
    });
  } catch (err) {
    console.error("search posts", err);
  }

  return results;
}
if (el("searchBtn")) el("searchBtn").addEventListener("click", async () => {
  const qv = el("searchInput").value || "";
  const r = await globalSearch(qv);
  // render results in #searchResults
  const out = el("searchResults");
  if (!out) return;
  out.innerHTML = "<h3>Users</h3>";
  r.users.forEach(u => { const n = document.createElement("div"); n.className="card"; n.innerHTML = `<strong>${u.name||u.email}</strong><div>${u.email||""}</div>`; n.addEventListener("click", () => openUserProfile(u.id)); out.appendChild(n); });
  out.innerHTML += "<h3>Products</h3>";
  r.products.forEach(p => { out.appendChild(productCardFromData(p)); });
  out.innerHTML += "<h3>Posts</h3>";
  r.posts.forEach(p => { out.appendChild(makePostCard(p)); });
});

// helper product card for search results (reused)
function productCardFromData(p) {
  const card = document.createElement("div");
  card.className = "card product-card";
  card.innerHTML = `
    <img src="${p.image}" style="width:100%;height:200px;object-fit:cover;border-radius:8px" />
    <h3>${p.name}</h3>
    <p style="font-weight:700;color:#0A5A0A">${fmtPrice(p.price)}</p>
    <p style="max-height:120px;overflow:hidden">${p.description}</p>
    <div style="display:flex;gap:6px;margin-top:8px">
      <button class="orderBtn">Order via WhatsApp</button>
      <button class="viewBtn">View</button>
    </div>
  `;
  card.querySelector(".orderBtn").addEventListener("click", () => {
    const msg = `Hello, I want to order ${p.name} priced at ${fmtPrice(p.price)}.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  });
  card.querySelector(".viewBtn").addEventListener("click", () => openProductPage(p.id));
  return card;
}

// open product details (navigates to products.html?productId=...)
function openProductPage(productId) {
  window.location.href = `products.html?productId=${productId}`;
}

// ---------------- Open user profile (navigates to profile page with ?uid=) ----------------
function openUserProfile(uid) {
  window.location.href = `profile.html?uid=${uid}`;
}

// On profile.html load, read ?uid= and render that user's profile
async function loadProfilePage() {
  const params = new URLSearchParams(location.search);
  const uid = params.get("uid") || (currentUser && currentUser.uid);
  if (!uid) return;
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) return;
  const u = userSnap.data();
  // populate elements (#profileName, #profilePic, #profileBio, #myPosts)
  if (el("profileName")) el("profileName").textContent = u.name || u.email;
  if (el("profilePic")) el("profilePic").src = u.profilePic || "images/default_profile.png";
  if (el("profileBio")) el("profileBio").value = u.bio || "";

  // show Add Friend / Respond / Chat depending on relationship
  if (currentUser && uid !== currentUser.uid) {
    const btn = el("profileActionBtn");
    if (!btn) return;
    const meSnap = await getDoc(doc(db, "users", currentUser.uid));
    const me = meSnap.exists() ? meSnap.data() : {};
    const friends = me.friends || [];
    const sent = me.sentRequests || [];
    const received = me.receivedRequests || [];
    if (friends.includes(uid)) {
      btn.textContent = "Chat 💬";
      btn.onclick = () => openChatWith(uid);
    } else if (sent.includes(uid)) {
      btn.textContent = "Requested";
      btn.disabled = true;
    } else if (received.includes(uid)) {
      btn.textContent = "Respond";
      btn.onclick = () => renderFriendsUI(); // user can accept in own page
    } else {
      btn.textContent = "Add Friend";
      btn.onclick = () => sendFriendRequest(uid);
    }
  }
  // load user's posts into #myPosts
  const postsEl = el("myPosts");
  if (postsEl) {
    postsEl.innerHTML = "";
    const q = query(collection(db, "posts"), where("uid", "==", uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    snap.forEach(d => postsEl.appendChild(makePostCard({ id: d.id, ...d.data() })));
  }
}

// ---------------- Chat functions ----------------
// Chat documents stored in collection "chats" with pairId field; messages contain from, to, text, createdAt
async function openChatWith(otherUid) {
  if (!currentUser) return alert("Login");
  // check they are friends
  const meSnap = await getDoc(doc(db, "users", currentUser.uid));
  const me = meSnap.exists() ? meSnap.data() : {};
  if (!me.friends || !me.friends.includes(otherUid)) return alert("You must be friends to chat");
  // open chat page: chat.html?with=OTHERUID
  window.location.href = `chat.html?with=${otherUid}`;
}

async function loadChatPage() {
  const params = new URLSearchParams(location.search);
  const otherUid = params.get("with");
  if (!otherUid || !currentUser) return;
  const pairId = uidPair(currentUser.uid, otherUid);
  const msgsEl = el("chatMessages");
  if (!msgsEl) return;
  msgsEl.innerHTML = "";
  const q = query(collection(db, "chats"), where("pairId", "==", pairId), orderBy("createdAt", "asc"));
  onSnapshot(q, (snap) => {
    msgsEl.innerHTML = "";
    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement("div");
      div.className = m.from === currentUser.uid ? "chat-msg me" : "chat-msg them";
      div.textContent = m.text;
      msgsEl.appendChild(div);
    });
    msgsEl.scrollTop = msgsEl.scrollHeight;
  });
  // send button
  if (el("sendChatBtn")) {
    el("sendChatBtn").onclick = async () => {
      const txt = el("chatInput").value?.trim();
      if (!txt) return;
      await addDoc(collection(db, "chats"), { pairId, from: currentUser.uid, to: otherUid, text: txt, createdAt: serverTimestamp() });
      el("chatInput").value = "";
      // optionally notify recipient
      await addNotification(otherUid, `${currentUser.displayName || currentUser.email} sent you a message`);
    };
  }
}

// ---------------- Admin UI rendering (users + posts) ----------------
async function renderAdminUI() {
  if (!currentUser || currentUser.uid !== ADMIN_UID) return;
  const usersEl = el("adminUsers");
  const postsEl = el("adminPosts");
  if (usersEl) {
    usersEl.innerHTML = "";
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(d => {
      const u = d.data();
      const node = document.createElement("div");
      node.className = "card";
      node.innerHTML = `<strong>${u.name || u.email}</strong><div style="font-size:12px;color:#666">${d.id}</div>`;
      usersEl.appendChild(node);
    });
  }
  if (postsEl) {
    postsEl.innerHTML = "";
    const postsSnap = await getDocs(collection(db, "posts"));
    postsSnap.forEach(d => {
      const p = d.data();
      const node = document.createElement("div");
      node.className = "card";
      node.innerHTML = `<strong>${p.name || p.email}</strong><p>${(p.text||"").slice(0,200)}</p>`;
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.style.background = "#d9534f"; del.style.color = "#fff";
      del.addEventListener("click", async () => {
        if (!confirm("Delete this post?")) return;
        await deleteDoc(doc(db, "posts", d.id));
        renderAdminUI();
      });
      node.appendChild(del);
      postsEl.appendChild(node);
    });
  }
}

// ---------------- Firestore rules note ----------------
// Use the Firestore rules I previously generated (users/posts/products/chats). Ensure notifications allow create for system and read for target users only.
// (I already gave a full rules set earlier — paste into Firestore rules console)

// ---------------- Auth state listener — bootstrapping UI ----------------
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    console.log("User logged in:", user.uid, user.email);
    // ensure user doc exists (in case account created in console)
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || user.email,
        email: user.email,
        profilePic: user.photoURL || "",
        bio: "",
        createdAt: serverTimestamp(),
        friends: [], receivedRequests: [], sentRequests: []
      });
    }
    // seed products if needed
    await seedProductsOnce();
    // start listeners and render
    startFeedListener();
    startNotificationsListener();
    renderFriendsUI();
    renderProductsList(); // for products page
    renderAdminUI();
    // if we are on profile page, load profile page
    if (location.pathname.endsWith("profile.html")) loadProfilePage();
    if (location.pathname.endsWith("chat.html")) loadChatPage();
    // show logout button if exists
    if (el("logoutBtn")) el("logoutBtn").style.display = "inline-block";
  } else {
    console.log("User signed out");
    // hide user-only UI (you can handle via showing login page)
    if (el("logoutBtn")) el("logoutBtn").style.display = "none";
  }
});

// ---------------- Render products list for products.html ----------------
async function renderProductsList() {
  const container = el("productsContainer");
  if (!container) return;
  container.innerHTML = "";
  try {
    const snap = await getDocs(collection(db, "products"));
    if (!snap.empty) {
      snap.forEach(d => container.appendChild(productCardFromData({ id: d.id, ...d.data() })));
      return;
    }
  } catch (err) {
    console.warn("read products failed, using local list", err);
  }
  // fallback to local PRODUCTS const
  for (const p of PRODUCTS) container.appendChild(productCardFromData(p));
}

// ---------------- Helper: productCardFromData (same as earlier) ----------------
function productCardFromData(p) {
  const card = document.createElement("div");
  card.className = "card product-card";
  card.innerHTML = `
    <img src="${p.image}" style="width:100%;height:220px;object-fit:cover;border-radius:8px" />
    <h3>${p.name}</h3>
    <p style="font-weight:700;color:#0A5A0A">${fmtPrice(p.price)}</p>
    <p style="max-height:120px;overflow:hidden">${p.description}</p>
    <div style="margin-top:8px;display:flex;gap:8px">
      <button class="orderBtn">Order via WhatsApp</button>
      <button class="viewBtn">View</button>
    </div>
  `;
  card.querySelector(".orderBtn").addEventListener("click", () => {
    const msg = `Hello, I want to order ${p.name} priced at ${fmtPrice(p.price)}.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  });
  card.querySelector(".viewBtn").addEventListener("click", () => openProductPage(p.id || p.id));
  return card;
}

// ---------------- FINISH: small utility to expose some functions for HTML pages ----------------
window._healingRoot = {
  doSignup,
  doLogin,
  doLogout,
  openUserProfile,
  openProductPage,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  openChatWith,
  createPostFromUI,
  globalSearch,
  renderProductsList,
  renderProfilePage: loadProfilePage,
  renderAdminUI
};

// ---------------- END ----------------
console.log("app.js loaded — full social farming script");
