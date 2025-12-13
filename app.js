// app.js (module)
// IMPORTANT: Save this file as app.js in the same folder as index.html and style.css

// Firebase modules (loaded as ESM from the firebase scripts included in index.html)
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";

// Cloudinary config (unsigned)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

// Your Firebase config — keep the same you gave earlier
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

// admin UID you provided
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// --- PRODUCTS (each description is long and professional) ---
const products = [
  {
    id: "cassava",
    name: "Cassava Stems (TME419)",
    image: "images/cassava.JPG",
    price: 1000,
    description: `Healingroot AGRO ventures stands as a trusted name in quality crop seedlings across Nigeria. We have built our reputation on reliability, clarity, and genuine agricultural knowledge that helps farmers and investors create lasting income. Our goal is simple: to deliver planting materials that give strong survival rates, high yields, and a clear path to long-term returns. Every cassava stem we supply is nurtured in a clean nursery environment, inspected for disease, and packaged with planting guidance to help you succeed.

TME419 is one of the highest-performing cassava varieties for both food and industrial purposes. It matures early, offers excellent tuber quality and high starch content, and performs well over a variety of soils. For farmers, this translates into earlier harvests, reduced risk of crop loss, and reliable income streams. Because cassava has multiple market pathways — direct consumption, garri, flour, starch, and industrial uses (like ethanol and animal feed) — planting the right variety is a foundational decision for success.

Common myths persist about cassava: some think it requires minimal skill yet yields little. The truth is that improved varieties such as TME419 need proper spacing, timely fertilizer application, pest control and good weeding. With these practices the crop yields improve dramatically. A smallholder who applies best management practices sees both strong food security benefits and consistent market-grade production.

Industrial demand for cassava products continues to grow. Processing plants need reliable tuber quality and volume. Planting certified stems from Healingroot gives farmers access to these higher-value supply chains. Whether you are planting for household food security or scaling to a commercial supply chain, choosing stems from a trusted nursery reduces your establishment risk and increases profitability.

If you’re starting, begin with a manageable area and follow our guidance on spacing, fertilizer regime and early weed control. For those scaling to commercial hectares, we provide logistics and planting schedules to maximize yield and shorten time to first sale. When patients, precision, and good seed material connect, cassava becomes a repeatable source of income that supports families and builds farm value for years. Healingroot AGRO Ventures is committed to supplying stems that help you harvest success, year after year.`
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
    description: `Healingroot AGRO Ventures supplies quality coconut seedlings chosen for high survival and productive potential. Coconut is a versatile tree crop producing nuts, copra, oil, and other by-products used in food, cosmetics, and industrial applications. High-quality planting material is essential for establishing a vigorous orchard that will produce for decades.

Our seedlings are raised in clean nursery environments to ensure strong root systems and uniform growth. We recommend proper spacing, early irrigation, and integrated pest management to guarantee early establishment and long-term productivity.

Coconut plantations are resilient income sources that provide diverse revenue streams. Healingroot provides seedlings accompanied by management recommendations that support successful plantation establishment and long-term yield optimization. High-quality seedlings reduce losses in the critical nursery-to-field phase and position growers for strong economic returns.`
  },
  {
    id: "giant_cocoa",
    name: "Hybrid Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 500,
    description: `Healingroot AGRO Ventures supplies high-quality giant cocoa seedlings for reliable cocoa production. Cocoa is a premium cash crop with strong international demand for beans used in chocolate, confectionery, and industrial products. Our seedlings are raised for strong field performance and optimized yields.

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
    description: `Healingroot AGRO Ventures supplies treated yam setts selected from high-yielding, disease-free mother tubers to ensure rapid sprouting and strong tuber development. Yam is an important staple for food security and income in many regions. Quality setts and correct field techniques are important for reliable yields.

Our treated setts are processed to reduce rot and increase sprouting success, giving farmers higher establishment rates and more uniform yields. We advise on staking, fertilizer programs, and harvest timing for peak market quality.

Using treated setts reduces risk and increases predictability of returns. Farmers who adopt proper plant materials and practices gain better marketable tubers and higher income stability. Healingroot AGRO Ventures supports growers with good planting materials and guidance to realize strong farm performance.`
  }
];

// ---------------------- DOM helpers ----------------------
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

// simple element creation helper
function el(tag, attrs = {}, innerHTML = '') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,v));
  e.innerHTML = innerHTML;
  return e;
}

// ---------------------- AUTH UI ----------------------
const authModal = $('#auth-modal');
const signupForm = $('#signup-form');
const loginForm = $('#login-form');
const authMessage = $('#auth-message');
const logoutBtn = $('#logout-btn');
const navAdmin = $('#nav-admin');

let currentUser = null;

// show/hide views
function showView(id){
  $$('.view').forEach(v => v.style.display = 'none');
  const v = $('#'+id+'-view');
  if(v) v.style.display = 'block';
}

function showAuthModal(show){
  authModal.style.display = show ? 'flex' : 'none';
}

// ---------------------- AUTH ACTIONS ----------------------
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  authMessage.textContent = '';
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  if(!name || !email || !password){ authMessage.textContent = 'Fill all fields'; return; }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // create user doc
    await setDoc(doc(db, 'users', cred.user.uid), {
      name, email, createdAt: serverTimestamp()
    });
    authMessage.textContent = 'Account created — signed in';
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  authMessage.textContent = '';
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

logoutBtn?.addEventListener('click', async () => {
  await signOut(auth);
});

// ---------------------- AUTH STATE ----------------------
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if(user){
    // hide modal, show nav
    showAuthModal(false);
    $('#logout-btn').style.display = 'inline-block';
    $('#nav-feed').click(); // show feed
    // show admin nav if admin
    navAdmin.style.display = (user.uid === ADMIN_UID) ? 'inline-block' : 'none';
    // load UI
    await renderAll();
  } else {
    // show modal
    showAuthModal(true);
    $('#logout-btn').style.display = 'none';
    navAdmin.style.display = 'none';
    showView('feed'); // hide content behind modal still
  }
});

// ---------------------- RENDER PRODUCTS & FEED ----------------------
async function renderProducts(){
  const container = $('#product-list');
  container.innerHTML = '';
  products.forEach(p => {
    const card = el('div', { class: 'card product' }, `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
  // order buttons
  $$('.order').forEach(btn => btn.addEventListener('click', (ev) => {
    const name = ev.currentTarget.dataset.name;
    const price = ev.currentTarget.dataset.price;
    const phone = '2349138938301';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.` )}`;
    window.open(url, '_blank');
  }));
  // read more
  $$('.read-more').forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const p = products.find(x=>x.id===id);
    alert(p.name + "\n\n" + p.description);
  }));
}

async function renderFeed(){
  const feed = $('#feed');
  feed.innerHTML = '';
  // products first as posts
  products.forEach(p => {
    const card = el('div', { class: 'card post' }, `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,350)}... <a href="#" data-id="${p.id}" class="read-more-prod">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    feed.appendChild(card);
  });

  // then user posts from Firestore collection 'posts' ordered by timestamp desc
  try {
    const q = query(collection(db, 'posts'), orderBy('timestamp','desc'));
    const snap = await getDocs(q);
    snap.forEach(docSnap => {
      const post = docSnap.data();
      const card = el('div', { class: 'card post' });
      const ownerName = post.name || 'User';
      card.innerHTML = `
        <img src="${post.image || 'images/default_profile.png'}" alt="">
        <h3>${ownerName}</h3>
        <p>${post.text}</p>
        <p class="muted">by ${post.email || 'user'}</p>
      `;
      // actions: delete if owner or admin, comment placeholder
      if(currentUser && (currentUser.uid === post.uid || currentUser.uid === ADMIN_UID)){
        const del = el('button', { class:'btn' }, 'Delete');
        del.style.background='crimson';
        del.addEventListener('click', async ()=> {
          await deleteDoc(doc(db, 'posts', docSnap.id));
          alert('Post deleted');
          renderFeed();
        });
        card.appendChild(del);
      }
      feed.appendChild(card);
    });
  } catch(err){
    console.error('Error loading posts', err);
  }

  // attach order and read more handlers as above
  $$('.order').forEach(btn => btn.addEventListener('click', (ev) => {
    const name = ev.currentTarget.dataset.name;
    const price = ev.currentTarget.dataset.price;
    const phone = '2349138938301';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.` )}`;
    window.open(url, '_blank');
  }));
  $$('.read-more-prod').forEach(a => a.addEventListener('click',(e)=>{
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const p = products.find(x=>x.id===id);
    alert(p.name + "\n\n" + p.description);
  }));
}

// ---------------------- CREATE POST (upload to Cloudinary then add Firestore) ----------------------
$('#post-btn')?.addEventListener('click', async () => {
  if(!currentUser){ alert('Sign in first'); return; }
  const text = $('#post-text').value.trim();
  const file = $('#post-image').files[0];
  let imageUrl = '';
  if(file){
    // upload to Cloudinary
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    try {
      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
      const data = await res.json();
      imageUrl = data.secure_url;
    } catch(err){ console.error('Cloud upload failed',err); alert('Image upload failed'); return; }
  }
  // create post doc
  await addDoc(collection(db, 'posts'), {
    uid: currentUser.uid,
    email: currentUser.email,
    name: currentUser.displayName || '',
    text,
    image: imageUrl,
    timestamp: serverTimestamp()
  });
  $('#post-text').value = '';
  $('#post-image').value = '';
  alert('Posted!');
  renderFeed();
});

// ---------------------- PROFILE: upload profile pic ----------------------
$('#save-profile-pic')?.addEventListener('click', async () => {
  if(!currentUser) { alert('Sign in'); return; }
  const file = $('#profile-upload').files[0];
  if(!file){ alert('Choose file'); return; }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  try {
    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
    const data = await res.json();
    const url = data.secure_url;
    await setDoc(doc(db, 'users', currentUser.uid), { profilePic: url, email: currentUser.email, name: currentUser.displayName || '' }, { merge: true});
    $('#profile-pic').src = url;
    alert('Profile picture saved');
  } catch(err){
    console.error(err); alert('Upload failed');
  }
});

// save bio
$('#save-bio')?.addEventListener('click', async () => {
  if(!currentUser) return alert('Sign in');
  const bio = $('#bio').value.trim();
  await setDoc(doc(db,'users', currentUser.uid), { bio }, { merge: true});
  alert('Bio saved');
});

// ---------------------- FRIENDS & CHAT (basic) ----------------------
async function renderFriends(){
  const container = $('#friends');
  container.innerHTML = '';
  // list of all users except current
  const snap = await getDocs(collection(db,'users'));
  snap.forEach(d => {
    const u = d.data();
    if(d.id === currentUser.uid) return;
    const card = el('div', { class:'card friend' });
    card.innerHTML = `<h4>${u.name || u.email}</h4><p class="muted">${u.email||''}</p>`;
    const btn = el('button', {}, 'Add Friend');
    btn.className = 'btn';
    btn.addEventListener('click', async ()=>{
      // create friend request
      await addDoc(collection(db,'friendRequests'), { from: currentUser.uid, to: d.id, status: 'pending', createdAt: serverTimestamp() });
      alert('Friend request sent');
    });
    card.appendChild(btn);
    container.appendChild(card);
  });
}

// basic chat list (show pending accepted friends)
async function renderChatFriends(){
  const c = $('#friends-chat-list');
  c.innerHTML = '';
  // friends collection: store docs with {uids: [a,b], accepted:true}
  const snap = await getDocs(collection(db,'friends'));
  snap.forEach(d => {
    const fr = d.data();
    if(fr.uids && fr.uids.includes(currentUser.uid)){
      const other = fr.uids.find(id => id !== currentUser.uid);
      const card = el('div',{class:'card friend'}, `<h4>Friend</h4>`);
      const chatBtn = el('button', {}, 'Open Chat');
      chatBtn.className='btn';
      chatBtn.addEventListener('click', ()=> openChat(other));
      card.appendChild(chatBtn);
      c.appendChild(card);
    }
  });
}

// accept friend requests: very simple manual UI — admin or user must view Firestore console to accept for now
// For production we'd build accept buttons — kept minimal due to complexity on iPhone editing

// open chat with user
let activeChatWith = null;
function openChat(uid){
  activeChatWith = uid;
  $('#chat-window').style.display = 'block';
  $('#chat-with').textContent = 'Chat: ' + uid;
  loadMessages(uid);
}

// send message
$('#send-chat')?.addEventListener('click', async ()=>{
  if(!currentUser || !activeChatWith) return alert('Select friend');
  const msg = $('#chat-input').value.trim();
  if(!msg) return;
  await addDoc(collection(db,'chats'), { from: currentUser.uid, to: activeChatWith, text: msg, timestamp: serverTimestamp() });
  $('#chat-input').value = '';
  loadMessages(activeChatWith);
});

async function loadMessages(uid){
  $('#messages').innerHTML = '';
  const q = query(collection(db,'chats'), where('from','in',[currentUser.uid, uid])); // simple
  const snap = await getDocs(q);
  snap.forEach(d=>{
    const m = d.data();
    const div = el('div',{}, `<strong>${m.from===currentUser.uid ? 'You' : 'Friend'}:</strong> ${m.text}`);
    $('#messages').appendChild(div);
  });
}

// ---------------------- ADMIN: list users & posts ----------------------
async function renderAdmin(){
  if(!currentUser || currentUser.uid !== ADMIN_UID) return;
  $('#admin-view').style.display = 'block';
  const usersContainer = $('#admin-users');
  usersContainer.innerHTML = '';
  const usnap = await getDocs(collection(db,'users'));
  usnap.forEach(d=>{
    const u = d.data();
    const card = el('div',{class:'card user'}, `<h4>${u.name||u.email}</h4><p>${d.id}</p>`);
    usersContainer.appendChild(card);
  });

  const postsContainer = $('#admin-posts');
  postsContainer.innerHTML = '';
  const psnap = await getDocs(collection(db,'posts'));
  psnap.forEach(async docSnap=>{
    const p = docSnap.data();
    const card = el('div',{class:'card post'});
    card.innerHTML = `<h4>${p.name||p.email}</h4><p>${p.text}</p>`;
    const del = el('button', { class:'btn' }, 'Delete');
    del.style.background='crimson';
    del.addEventListener('click', async ()=>{
      await deleteDoc(doc(db,'posts', docSnap.id));
      alert('Deleted');
      renderAdmin();
    });
    card.appendChild(del);
    postsContainer.appendChild(card);
  });
}

// ---------------------- NAV & STARTUP ----------------------
$('#nav-feed').addEventListener('click', ()=> { showView('feed'); showView('feed'); });
$('#nav-products').addEventListener('click', ()=> { showView('products'); });
$('#nav-profile').addEventListener('click', ()=> { showView('profile'); });
$('#nav-chat').addEventListener('click', ()=> { showView('chat'); });
$('#nav-admin').addEventListener('click', ()=> { showView('admin'); });

async function renderAll(){
  await renderProducts();
  await renderFeed();
  if(currentUser){
    // load profile info
    const udoc = await getDoc(doc(db,'users', currentUser.uid));
    if(udoc.exists()){
      const data = udoc.data();
      if(data.profilePic) $('#profile-pic').src = data.profilePic;
      if(data.bio) $('#bio').value = data.bio;
    }
    renderFriends();
    renderChatFriends();
    renderAdmin();
  }
}

// initial render when loaded (if already signed in)
document.addEventListener('DOMContentLoaded', async ()=>{
  // attach login nav default
  showView('feed');
  // attach logout
  $('#logout-btn').addEventListener('click', async ()=> { await signOut(auth); location.reload(); });
});
