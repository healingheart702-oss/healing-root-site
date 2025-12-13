// app.js (paste this entire file into your repo as app.js)
// Uses Firebase modular SDK v10.x (must match the scripts included in index.html)

// --------------- Imports & Initialization ---------------
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

// --------- Configuration (keep your real values) ----------
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

// initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------- Utility helpers -----------------
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const el = (tag, attrs = {}, html = "") => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  e.innerHTML = html;
  return e;
};

function uidPair(a, b) {
  // deterministic pair id for two UIDs (sorted)
  return [a, b].sort().join("_");
}

// ----------------- Product data (long descriptions included) -----------------
// Replace image paths with your GitHub images (images/filename)
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot AGRO Ventures stands as a trusted name in quality crop seedlings across Nigeria. We have built our reputation on reliability, clarity, and genuine agricultural knowledge that helps farmers and investors create lasting income. Our goal is simple: to deliver planting materials that give strong survival rates, high yields, and a clear path to long-term returns. Every cassava stem we supply is nurtured in a clean nursery environment, inspected for disease, and packaged with planting guidance to help you succeed.

TME419 is one of the highest-performing cassava varieties for both food and industrial purposes. It matures early, offers excellent tuber quality and high starch content, and performs well over a variety of soils. For farmers, this translates into earlier harvests, reduced risk of crop loss, and reliable income streams. Because cassava has multiple market pathways — direct consumption, garri, flour, starch, and industrial uses (like ethanol and animal feed) — planting the right variety is a foundational decision for success.

Common myths persist about cassava: some think it requires minimal skill yet yields little. The truth is that improved varieties such as TME419 need proper spacing, timely fertilizer application, pest control and good weeding. With these practices the crop yields improve dramatically. A smallholder who applies best management practices sees both strong food security benefits and consistent market-grade production.

Industrial demand for cassava products continues to grow. Processing plants need reliable tuber quality and volume. Planting certified stems from Healingroot gives farmers access to these higher-value supply chains. Whether you are planting for household food security or scaling to a commercial supply chain, choosing stems from a trusted nursery reduces your establishment risk and increases profitability.

If you’re starting, begin with a manageable area and follow our guidance on spacing, fertilizer regime and early weed control. For those scaling to commercial hectares, we provide logistics and planting schedules to maximize yield and shorten time to first sale. When patience, precision, and good seed material connect, cassava becomes a repeatable source of income that supports families and builds farm value for years. Healingroot AGRO Ventures is committed to supplying stems that help you harvest success, year after year.`
  },
  {
    id: "plantain",
    name: "Hybrid Plantain Suckers",
    image: "images/plantain.JPG",
    price: 500,
    description: `Hybrid plantain suckers supplied by Healingroot AGRO Ventures are selected for their early maturity, disease tolerance, and consistent bunch size. Plantain is a staple fruit with constant consumer demand; choosing improved suckers reduces the time to harvest and increases uniformity of produce which directly improves marketability.

Our hybrid plantains are raised in well-managed pre-nurseries to develop robust root systems and healthy, disease-free crowns. Before dispatch, we inspect each sucker and provide planting advice on spacing, fertilization, weeding, and pest management. Proper establishment is essential to secure early yields and minimize nursery-to-field shock.

Many farmers assume plantain is only profitable over large acreages. That is not true — even small-holder plots using quality suckers deliver good yields and can support household income. Hybrid varieties are especially valuable for intercropping and mixed-farm systems where plantain supports other crops during early stages.

From a market perspective, plantain is versatile: sold fresh, processed into chips, or used in local cooking. The quality uniformity of hybrids makes it easier to meet buyers’ specifications and command higher prices. For investors, plantain offers predictable cash flow with relatively lower input costs compared to other permanent crops.

Healingroot AGRO Ventures not only supplies the planting material but also coaching on field practices that protect your investment: correct spacing, mulching, fertilizer timing, and efficient water management. These practices ensure suckers become productive stands that deliver steady income for seasons to come.`
  },
  {
    id: "banana",
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `The Hybrid Dwarf Banana offered by Healingroot AGRO Ventures is tailored for farmers who want fast returns and ease of management. Dwarf varieties are prized because they fruit earlier and are less vulnerable to wind damage compared to tall types. Our banana suckers are selected for uniformity, vigor, and fruit quality that meets market expectations.

Bananas are a high-turnover fruit crop with consistent demand across urban and rural markets. Smallholders often see a rapid return on investment when the crop is managed properly: timely fertilization, clean planting material, and disease surveillance are critical. Our nursery process reduces disease incidence and primes the plants for immediate establishment in the field.

Economic uses of banana go beyond fresh sales: processed bananas, chips, and banana flour have emerging markets. When scaled, bananas can be a small agribusiness in themselves. The Hybrid Dwarf works well in mixed cropping systems, increasing land productivity per hectare.

Healingroot provides planting recommendations, spacing guides, and a post-sale support path to ensure your plantation reaches full productive potential. Investing in quality suckers leads to reliable harvest cycles, improved market access, and the ability to scale operations year by year.`
  },
  {
    id: "oilpalm",
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1000,
    description: `Tenera oil palm seedlings from Healingroot AGRO Ventures are a long-term agricultural investment. Tenera is the hybrid type favoured on modern plantations for its higher oil to bunch ratio and earlier productive years. These seedlings are raised to nursery standards that favour establishment, early vigour, and eventual high-yield performance.

Oil palm is a generational crop; a well-managed plantation gives returns for decades. It is used extensively by the food, cosmetic, and biofuel industries. Plantation establishment requires careful land preparation, early fertilization, and good planting materials; supply of robust seedlings is the first critical step.

Our seedlings come with technical guidance on spacing, weed control, nutrition, and pest management. For investors, we offer planting advice and logistics support to ensure early survival and steady canopy development — the foundation of future harvests.

When managed correctly, Tenera plantations quickly move into regular fruiting cycles; the crop’s value grows with maturity. Healingroot AGRO Ventures supplies seedlings that are true-to-type and backed with practical agronomy to maximise your long-term return on investment.`
  },
  {
    id: "coconut",
    name: "Hybrid Dwarf Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 4500,
    description: `Healingroot AGRO Ventures supplies premium coconut seedlings that are disease-free, high-yielding, and ideal for long-term plantation projects. Our seedlings are carefully nurtured to ensure strong establishment and optimal growth.

Coconut palms are versatile and provide income from nuts, copra, oil, and husks. Planting high-quality seedlings ensures strong growth and reliable harvests for years.

Our seedlings are raised in clean nursery environments to ensure strong root systems and uniform growth. We recommend proper spacing, early irrigation, and integrated pest management to guarantee early establishment and long-term productivity.

Coconut plantations are resilient income sources that provide diverse revenue streams. Healingroot provides seedlings accompanied by management recommendations that support successful plantation establishment and long-term yield optimization. High-quality seedlings reduce losses in the critical nursery-to-field phase and position growers for strong economic returns.`
  },
  {
    id: "giant_cocoa",
    name: "Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 800,
    description: `Healingroot AGRO Ventures supplies giant cocoa seedlings selected for high yield, disease resistance, and adaptability to Nigerian climates. Our cocoa seedlings ensure strong establishment, rapid growth, and profitable fruiting.

Cocoa is one of Nigeria’s highest-value crops, with consistent demand in local and international chocolate and confectionery industries. High-quality seedlings provide superior harvests and long-term income potential.

Using proven planting material reduces the risks associated with disease and poor establishment. We provide best-practice guidance for planting, shade management, and pruning to support early productivity and consistent pod quality.

For both smallholders and commercial growers, quality seedlings translate to better beans and improved market prices. Healingroot supports its seedlings with post-sale agronomy guidance to help farmers reach the best harvest potential.`
  },
  {
    id: "pineapple",
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Premium pineapple seedlings from Healingroot AGRO Ventures deliver uniform, sweet fruits with strong resistance to common pests. Pineapple is a high-value horticultural crop; proper planting material and farm practices yield attractive returns.

Our seedlings are ideal for commercial growers and smallholders who want predictable fruit quality and shorter time-to-harvest. We provide recommendations on variety selection, planting density, fertilization, and pest control to maximize harvest quality and quantity.

Pineapple products are consumed fresh and processed into canned fruit, juices, and value-added goods. For growers, this creates multiple market channels and income opportunities. Healingroot provides seedlings and practical guidance to help farmers tap into these markets profitably.`
  },
  {
    id: "yam",
    name: "Treated Yam Setts",
    image: "images/Yamsett.JPG",
    price: 700,
    description: `Healingroot AGRO Ventures supplies treated yam setts selected from high-quality mother tubers to ensure rapid sprouting and strong tuber development. Yam is a staple crop in Nigeria, providing both food security and income for smallholder farmers. Quality setts and correct field techniques are essential for predictable yields.

Our treated setts are processed to reduce rot and increase sprouting success, giving farmers higher establishment rates and more uniform yields. We advise on staking, fertilizer programs, and harvest timing to ensure market quality.

By using treated setts and adopting good agronomic practices, growers can optimize tuber size and marketability, improving profitability and long-term farm resilience. Healingroot AGRO Ventures provides planting materials and technical guidance designed to help farmers succeed.`
  }
];

// ---------------- INITIAL UI SELECTORS ----------------
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

// nav links
$("#nav-feed").addEventListener("click", () => showOnly("feed"));
$("#nav-products").addEventListener("click", () => showOnly("products"));
$("#nav-profile").addEventListener("click", () => showOnly("profile"));
$("#nav-chat").addEventListener("click", () => showOnly("chat"));
$("#nav-admin").addEventListener("click", () => showOnly("admin"));

// ---------------------- Helpers -----------------------
function showOnly(section) {
  // hide all views
  [feedView, productsView, profileView, chatView, adminView].forEach(s => (s.style.display = "none"));
  // show specific
  if (section === "feed") feedView.style.display = "block";
  if (section === "products") productsView.style.display = "block";
  if (section === "profile") profileView.style.display = "block";
  if (section === "chat") chatView.style.display = "block";
  if (section === "admin") adminView.style.display = "block";
}

function formatCurrency(n) {
  return "₦" + Number(n).toLocaleString();
}

// --------------- AUTH: Signup / Login / State ---------------
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  const name = $("#signup-name").value.trim();
  const email = $("#signup-email").value.trim();
  const password = $("#signup-password").value;
  if (!name || !email || !password) return (authMessage.textContent = "Please fill all fields");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // create minimal user doc
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
      profilePic: "",
      bio: ""
    });
    // set displayName on Firebase Auth (optional)
    await updateProfile(cred.user, { displayName: name });
    authMessage.textContent = "Account created — signed in";
  } catch (err) {
    console.error(err);
    authMessage.textContent = err.message;
  }
});

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  const email = $("#login-email").value.trim();
  const password = $("#login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});

// ------------------ Auth State Observer -------------------
let currentUser = null;
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    // hide modal
    authModal.style.display = "none";
    logoutBtn.style.display = "inline-block";
    // show admin nav if admin
    navAdmin.style.display = user.uid === ADMIN_UID ? "inline-block" : "none";
    // render content
    await initialRenderForUser();
  } else {
    // show modal
    authModal.style.display = "flex";
    logoutBtn.style.display = "none";
    navAdmin.style.display = "none";
    showOnly("feed"); // keep content hidden behind modal
  }
});

// ------------- Cloudinary Upload Helper -------------
async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url;
}

// ---------------- PRODUCTS ----------------
function renderStaticProducts() {
  productList.innerHTML = "";
  products.forEach(p => {
    const card = el("div", { class: "card product" });
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ${formatCurrency(p.price)}</p>
      <p>${p.description.slice(0, 400)}... <a href="#" data-id="${p.id}" class="read-more-prod">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `;
    productList.appendChild(card);
  });

  // buttons
  $$(".order").forEach(b => b.addEventListener("click", (ev) => {
    const name = ev.currentTarget.dataset.name;
    const price = ev.currentTarget.dataset.price;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`;
    window.open(url, "_blank");
  }));
  $$(".read-more-prod").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.dataset.id;
    const p = products.find(x => x.id === id);
    alert(p.name + "\n\n" + p.description);
  }));
}

// ---------------- POSTS (create + realtime feed) ----------------
postBtn?.addEventListener("click", async () => {
  if (!currentUser) return alert("Sign in first");
  const text = postText.value.trim();
  const file = postImageInput.files[0];
  let imageUrl = "";
  try {
    if (file) {
      imageUrl = await uploadToCloudinary(file);
    }
    // save post doc
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
    alert("Post created");
  } catch (err) {
    console.error("Create post failed", err);
    alert("Post failed: " + err.message);
  }
});

// realtime feed listener (products + posts)
function startFeedListener() {
  // First render static products (they're not in Firestore)
  renderStaticProducts();

  // Listen to posts collection
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    // Clear user posts area in feed (keep product cards already present)
    // We'll build a fragment and append after products
    const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Remove previous dynamic post cards
    // We'll rebuild the product area + posts combined in feedContainer
    feedContainer.innerHTML = ""; // clear feed and rebuild (products + posts)
    // add products (as feed items)
    products.forEach(p => {
      const c = el("div", { class: "card post" });
      c.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="muted">Price: ${formatCurrency(p.price)}</p>
        <p>${p.description.slice(0, 400)}... <a href="#" data-id="${p.id}" class="read-more-prod-f">Read more</a></p>
        <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
      `;
      feedContainer.appendChild(c);
    });

    // add posts from Firestore
    posts.forEach(post => {
      const card = el("div", { class: "card post", "data-id": post.id });
      card.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${post.image || 'images/default_profile.png'}" style="width:100%;max-width:100px;border-radius:8px" alt="">
          <div>
            <h3>${post.name || post.email}</h3>
            <p class="muted">${new Date(post.createdAt?.toDate?.() || Date.now()).toLocaleString()}</p>
          </div>
        </div>
        <p style="margin-top:10px">${post.text || ""}</p>
      `;
      // image displayed bigger below if exists
      if (post.image) {
        // show image larger
        const img = el("img", { src: post.image, style: "width:100%;margin-top:8px;border-radius:8px" });
        card.appendChild(img);
      }
      // action buttons (delete if owner or admin)
      const actions = el("div", {}, "");
      if (currentUser && (currentUser.uid === post.uid || currentUser.uid === ADMIN_UID)) {
        const del = el("button", { class: "btn" }, "Delete");
        del.style.background = "crimson";
        del.addEventListener("click", async () => {
          if (!confirm("Delete this post?")) return;
          try {
            await deleteDoc(doc(db, "posts", post.id));
            alert("Deleted");
          } catch (err) {
            console.error("Delete failed", err);
            alert("Delete failed: " + err.message);
          }
        });
        actions.appendChild(del);
      }
      card.appendChild(actions);
      feedContainer.appendChild(card);
    });

    // rewire order/read-more buttons
    $$(".order").forEach(b => {
      b.onclick = (ev) => {
        const name = ev.currentTarget.dataset.name;
        const price = ev.currentTarget.dataset.price;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`;
        window.open(url, "_blank");
      };
    });
    $$(".read-more-prod-f").forEach(a => a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.dataset.id;
      const p = products.find(x => x.id === id);
      alert(p.name + "\n\n" + p.description);
    }));
  }, (err) => console.error("Feed snapshot error", err));
}

// ---------------- PROFILE (upload pic, save bio, show user's posts) ----------------
saveProfilePicBtn?.addEventListener("click", async () => {
  if (!currentUser) return alert("Sign in");
  const file = profileUploadInput.files[0];
  if (!file) return alert("Choose a picture");
  try {
    const url = await uploadToCloudinary(file);
    await updateDoc(doc(db, "users", currentUser.uid), { profilePic: url });
    profilePicImg.src = url;
    alert("Profile picture saved");
  } catch (err) {
    console.error(err);
    alert("Upload failed: " + err.message);
  }
});

saveBioBtn?.addEventListener("click", async () => {
  if (!currentUser) return alert("Sign in");
  const bio = bioTextarea.value.trim();
  try {
    await updateDoc(doc(db, "users", currentUser.uid), { bio });
    alert("Bio saved");
  } catch (err) {
    console.error(err);
    alert("Save bio failed");
  }
});

// render user's posts
async function renderMyPosts() {
  myPostsContainer.innerHTML = "";
  if (!currentUser) return;
  const q = query(collection(db, "posts"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  snap.forEach(d => {
    const p = d.data();
    const card = el("div", { class: "card post" });
    card.innerHTML = `<h4>${p.name||p.email}</h4><p>${p.text}</p>`;
    if (p.image) {
      const im = el("img", { src: p.image, style: "width:100%;margin-top:8px;border-radius:8px" });
      card.appendChild(im);
    }
    // delete button
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

// ---------------- FRIEND REQUESTS (send / receive / accept / decline) ----------------

// send a friend request
async function sendFriendRequest(targetUid) {
  if (!currentUser) return alert("Sign in");
  const sender = currentUser.uid;
  if (sender === targetUid) return alert("Cannot friend yourself");
  try {
    // write to sender's sentRequests subcollection and target's receivedRequests subcollection
    await setDoc(doc(db, "users", sender, "sentRequests", targetUid), { createdAt: serverTimestamp() });
    await setDoc(doc(db, "users", targetUid, "receivedRequests", sender), { createdAt: serverTimestamp() });
    alert("Friend request sent");
    await renderPendingSent(); // update UI
  } catch (err) {
    console.error("sendFriendRequest", err);
    alert("Failed to send request: " + err.message);
  }
}

// accept a request
async function acceptFriendRequest(requesterUid) {
  if (!currentUser) return alert("Sign in");
  const me = currentUser.uid;
  try {
    // add into friends subcollections both sides
    await setDoc(doc(db, "users", me, "friends", requesterUid), { since: serverTimestamp() });
    await setDoc(doc(db, "users", requesterUid, "friends", me), { since: serverTimestamp() });
    // remove request docs
    await deleteDoc(doc(db, "users", me, "receivedRequests", requesterUid));
    await deleteDoc(doc(db, "users", requesterUid, "sentRequests", me));
    alert("Friend request accepted");
    await renderPendingReceived();
    await renderFriendsList();
    await renderChatFriends();
  } catch (err) {
    console.error("acceptFriendRequest", err);
    alert("Accept failed: " + err.message);
  }
}

// decline
async function declineFriendRequest(requesterUid) {
  if (!currentUser) return alert("Sign in");
  const me = currentUser.uid;
  try {
    await deleteDoc(doc(db, "users", me, "receivedRequests", requesterUid));
    await deleteDoc(doc(db, "users", requesterUid, "sentRequests", me));
    alert("Request declined");
    await renderPendingReceived();
  } catch (err) {
    console.error("declineFriendRequest", err);
    alert("Decline failed: " + err.message);
  }
}

// render pending received requests (show accept/decline)
async function renderPendingReceived() {
  const containerId = "#friends"; // We'll reuse friends area for requests section
  const container = friendsContainer;
  // create a heading for clarity
  // fetch receivedRequests subcollection
  container.innerHTML = "";
  if (!currentUser) return;
  const me = currentUser.uid;
  const snap = await getDocs(collection(db, "users", me, "receivedRequests"));
  if (snap.empty) {
    // no received requests, keep empty and show accepted friends below
    await renderFriendsList(); // show accepted friends instead
    return;
  }
  // show received requests
  const heading = el("h3", {}, "Friend Requests");
  container.appendChild(heading);
  snap.forEach(async d => {
    const requesterUid = d.id;
    // fetch requester user doc
    const ud = await getDoc(doc(db, "users", requesterUid));
    const udata = ud.exists() ? ud.data() : { name: requesterUid, email: "" };
    const card = el("div", { class: "card friend" });
    card.innerHTML = `<h4>${udata.name || udata.email || requesterUid}</h4><p class="muted">${udata.email || ""}</p>`;
    const acceptBtn = el("button", { class: "btn" }, "Accept");
    acceptBtn.addEventListener("click", () => acceptFriendRequest(requesterUid));
    const declineBtn = el("button", { class: "btn" }, "Decline");
    declineBtn.style.background = "grey";
    declineBtn.addEventListener("click", () => declineFriendRequest(requesterUid));
    card.appendChild(acceptBtn);
    card.appendChild(declineBtn);
    container.appendChild(card);
  });
}

// render pending sent requests (for display optionally)
async function renderPendingSent() {
  if (!currentUser) return;
  const me = currentUser.uid;
  // keep a small area below friends to show sent requests
  // we'll fetch and show as "Requests Sent"
  const sentSnap = await getDocs(collection(db, "users", me, "sentRequests"));
  // append into friendsContainer
  const heading = el("h3", {}, "Requests Sent");
  // remove any previous "Requests Sent" section
  // keep simple: append after friends list
  if (sentSnap.empty) {
    return;
  }
  sentSnap.forEach(async d => {
    const targetUid = d.id;
    const ud = await getDoc(doc(db, "users", targetUid));
    const udata = ud.exists() ? ud.data() : { name: targetUid };
    const card = el("div", { class: "card friend" });
    card.innerHTML = `<h4>${udata.name || udata.email || targetUid}</h4><p class="muted">${udata.email || ""}</p><p class="muted">Request sent</p>`;
    friendsContainer.appendChild(card);
  });
}

// render accepted friends list
async function renderFriendsList() {
  friendsContainer.innerHTML = "";
  if (!currentUser) return;
  const me = currentUser.uid;
  const snap = await getDocs(collection(db, "users", me, "friends"));
  if (snap.empty) {
    // nothing to show, show other users with Add friend button
    // Show all other users for adding friend (but only if no request exists)
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(async d => {
      if (d.id === me) return;
      // check if already friends
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
    });
    return;
  }
  // list accepted friends
  snap.forEach(async d => {
    const friendUid = d.id;
    const ud = await getDoc(doc(db, "users", friendUid));
    const udata = ud.exists() ? ud.data() : { name: friendUid, email: "" };
    const card = el("div", { class: "card friend" });
    card.innerHTML = `<h4>${udata.name || udata.email}</h4><p class="muted">${udata.email || ""}</p>`;
    const chatBtn = el("button", { class: "btn" }, "Chat 💬");
    chatBtn.addEventListener("click", () => openChat(friendUid));
    card.appendChild(chatBtn);
    friendsContainer.appendChild(card);
  });
}

// render chat friends list (accepted friends)
async function renderChatFriends() {
  friendsChatList.innerHTML = "";
  if (!currentUser) return;
  const me = currentUser.uid;
  const snap = await getDocs(collection(db, "users", me, "friends"));
  snap.forEach(async d => {
    const friendUid = d.id;
    const ud = await getDoc(doc(db, "users", friendUid));
    const udata = ud.exists() ? ud.data() : { name: friendUid };
    const card = el("div", { class: "card friend" }, `<h4>${udata.name || friendUid}</h4>`);
    const chatBtn = el("button", { class: "btn" }, "Open Chat");
    chatBtn.addEventListener("click", () => openChat(friendUid));
    card.appendChild(chatBtn);
    friendsChatList.appendChild(card);
  });
}

// ----------------- CHAT (pairId based) -----------------
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
  chatWithEl.textContent = "Chat with " + otherUid;
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
  } catch (err) {
    console.error("send message", err);
    alert("Send failed");
  }
});

async function loadMessagesForPair(pairId) {
  messagesEl.innerHTML = "";
  const q = query(collection(db, "chats"), where("pairId", "==", pairId), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  snap.forEach(d => {
    const m = d.data();
    const msgDiv = el("div", { class: "chat-message" }, `<strong>${m.from === currentUser.uid ? "You" : "Friend"}:</strong> ${m.text}`);
    messagesEl.appendChild(msgDiv);
  });
  // keep scroll to bottom
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ---------------- ADMIN PANEL ----------------
async function renderAdminPanel() {
  if (!currentUser || currentUser.uid !== ADMIN_UID) return;
  // users
  adminUsers.innerHTML = "";
  const usersSnap = await getDocs(collection(db, "users"));
  usersSnap.forEach(d => {
    const u = d.data();
    const card = el("div", { class: "card user" }, `<h4>${u.name || u.email}</h4><p class="muted">${d.id}</p>`);
    adminUsers.appendChild(card);
  });

  // posts
  adminPosts.innerHTML = "";
  const postsSnap = await getDocs(collection(db, "posts"));
  postsSnap.forEach(d => {
    const p = d.data();
    const card = el("div", { class: "card post" });
    card.innerHTML = `<h4>${p.name || p.email}</h4><p>${p.text}</p>`;
    const del = el("button", { class: "btn" }, "Delete");
    del.style.background = "crimson";
    del.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      await deleteDoc(doc(db, "posts", d.id));
      renderAdminPanel();
    });
    card.appendChild(del);
    adminPosts.appendChild(card);
  });
}

// ------------------ Realtime watchers for friend requests count ----------------
function watchReceivedRequestsCount() {
  if (!currentUser) return;
  const me = currentUser.uid;
  const colRef = collection(db, "users", me, "receivedRequests");
  onSnapshot(colRef, (snap) => {
    const count = snap.size;
    // show small badge on nav (we didn't include a badge span earlier; simple alert-like)
    const navEl = $("#nav-profile");
    if (navEl) {
      navEl.title = count ? `${count} pending friend request(s)` : "";
    }
  });
}

// ------------------ Initial render after login ----------------
async function initialRenderForUser() {
  // show feed by default
  showOnly("feed");
  // render static products
  renderStaticProducts();
  // start feed listener
  startFeedListener();

  // load profile data
  const uDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (uDoc.exists()) {
    const udata = uDoc.data();
    if (udata.profilePic) profilePicImg.src = udata.profilePic;
    if (udata.bio) bioTextarea.value = udata.bio;
  }

  // render my posts
  renderMyPosts();

  // friends and requests
  await renderPendingReceived(); // this populates friendsContainer either with requests or friends
  await renderPendingSent();
  await renderFriendsList();
  await renderChatFriends();

  // admin panel
  renderAdminPanel();

  // watchers
  watchReceivedRequestsCount();
}

// ------------------ On load (attach simple nav & handlers) ------------------
document.addEventListener("DOMContentLoaded", () => {
  // nav links already wired earlier
  // ensure auth modal is visible until sign in
  if (!currentUser) authModal.style.display = "flex";
  // attach quick click-to-switch views for mobile
  $("#nav-feed").addEventListener("click", () => showOnly("feed"));
  $("#nav-products").addEventListener("click", () => showOnly("products"));
  $("#nav-profile").addEventListener("click", () => showOnly("profile"));
  $("#nav-chat").addEventListener("click", () => showOnly("chat"));
  $("#nav-admin").addEventListener("click", () => showOnly("admin"));
});

// ------------------ Expose small helpers to window (optional for debug) ---------------
window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.declineFriendRequest = declineFriendRequest;
window.openChat = openChat;
