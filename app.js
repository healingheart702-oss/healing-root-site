// ---------------------- DOM helpers ----------------------
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
function el(tag, attrs = {}, innerHTML = '') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,v));
  e.innerHTML = innerHTML;
  return e;
}

// ---------------------- FIREBASE SETUP ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where
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

// ---------------------- CLOUDINARY ----------------------
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

// ---------------------- ADMIN & GLOBAL STATE ----------------------
const ADMIN_UID = "zqq3aNV8HqdkcnvRKosTE40YbIn2"; 
let currentUser = null;
let currentProfile = null; 
let currentChatID = null; 
let unsubscribeMessages = null; 
let confirmationResult = null; // For Phone Auth

// ---------------------- PRODUCTS (FULL LIST) ----------------------
const products = [
  { 
    id:"cassava", 
    name:"Cassava Stems (TME419)", 
    image:"images/cassava.JPG", 
    price:1000, 
    description:`Healing Root Agro Ventures provides premium TME419 cassava stems known for high yield, disease resistance, and strong root development. Each stem is nurtured in a controlled nursery to ensure survival rates above 95%, giving farmers a reliable start. Our cassava stems are ideal for commercial farming, guaranteeing tuber quality and consistent income for small and large-scale farmers across Nigeria. Full planting guidance and farm management tips are provided with every purchase.` 
  },
  { 
    id:"plantain", 
    name:"Hybrid Plantain Suckers", 
    image:"images/plantain.JPG", 
    price:500, 
    description:`Our Hybrid Plantain Suckers are carefully selected for vigor, early fruiting, and high production. Raised in hygienic nurseries, these suckers adapt easily to different soil types and climates in Nigeria. With strong resistance to pests and diseases, they provide farmers with dependable growth and fruiting cycles. Each purchase comes with detailed planting and care instructions to ensure optimal yield and long-term plantation success.` 
  },
  { 
    id:"banana", 
    name:"Hybrid Dwarf Banana", 
    image:"images/giant_banana.JPG", 
    price:500, 
    description:`The Hybrid Dwarf Banana from Healing Root Agro Ventures offers early maturation, high fruit quality, and strong resistance to common diseases. Ideal for both backyard gardens and commercial plantations, these banana seedlings ensure consistent yield and minimal maintenance. Raised in controlled nurseries, each seedling is ready for immediate transplantation, helping farmers secure profitable banana production with long-term benefits.` 
  },
  { 
    id:"oilpalm", 
    name:"Tenera Oil Palm Seedlings", 
    image:"images/oilpalm.JPG", 
    price:1000, 
    description:`Healing Root Agro Ventures Tenera Oil Palm Seedlings are top-quality planting materials carefully raised to ensure maximum yield, disease resistance, and early fruiting. Each seedling undergoes rigorous nursery management including proper fertilization, pest control, and root development enhancement. Suitable for commercial plantations, these seedlings guarantee consistent bunch production, high oil content, and longevity of palms. Farmers are provided with full planting guidelines, soil preparation techniques, and maintenance tips to achieve optimal growth, minimize losses, and maximize return on investment. Our seedlings are acclimatized to different soil types and Nigerian climatic conditions, making them ideal for large and small-scale farming. With a focus on sustainable practices, every purchase ensures not only high productivity but also long-term farm profitability. This comprehensive package enables growers to establish healthy plantations, increase oil extraction efficiency, and secure a dependable income from the first harvest to full maturity.` 
  },
  { 
    id:"coconut", 
    name:"Hybrid Dwarf Coconut Seedlings", 
    image:"images/coconut.JPG", 
    price:4500, 
    description:`Our Hybrid Dwarf Coconut Seedlings are fast-growing, high-yielding, and ideal for small to medium-scale farms. Each seedling is carefully raised to ensure healthy root systems, strong stem development, and early fruiting. Farmers benefit from reliable growth, superior nut quality, and high survival rates. Planting instructions and care guidance are included with every purchase for optimal results.` 
  },
  { 
    id:"giant_cocoa", 
    name:"Hybrid Giant Cocoa Seedlings", 
    image:"images/giant_cocoa.JPG", 
    price:500, 
    description:`Healing Root Agro Ventures offers Hybrid Giant Cocoa Seedlings that combine high yield with strong resistance to common diseases. Raised in clean nurseries, these seedlings adapt well to Nigerian soils and climates, giving farmers dependable growth and fruiting cycles. Each purchase comes with expert guidance on planting, maintenance, and pest control to maximize long-term cocoa production.` 
  },
  { 
    id:"pineapple", 
    name:"Pineapple Seedlings", 
    image:"images/pineapple.JPG", 
    price:400, 
    description:`Premium Pineapple Seedlings from Healing Root Agro Ventures are selected for rapid growth, high fruit quality, and uniformity. They are raised in controlled nursery conditions to ensure strong establishment and survival. Ideal for both commercial and backyard planting, these seedlings come with planting and care instructions to guarantee maximum fruit yield and consistent quality.` 
  },
  { 
    id:"yam", 
    name:"Treated Yam Setts", 
    image:"images/Yamsett.JPG", 
    price:700, 
    description:`Our Treated Yam Setts are carefully selected tubers treated for disease resistance and enhanced sprouting. Each sett is ideal for both smallholder and commercial farms, ensuring rapid germination, uniform growth, and high tuber yield. Healing Root Agro Ventures provides full guidance on soil preparation, planting, and maintenance for maximum productivity and profitable harvests.`
  }
];

// ---------------------- MODAL ----------------------
const modal = $('#read-more-modal');
const modalTitle = $('#read-more-title');
const modalText = $('#read-more-text');
const modalClose = $('#read-more-close');
function openReadMore(title, text){
  modalTitle.textContent = title;
  modalText.textContent = text;
  modal.style.display = 'flex';
}
if(modalClose) modalClose.addEventListener('click', ()=> modal.style.display='none');
modal?.addEventListener('click', e => { if(e.target===modal) modal.style.display='none'; });

function attachReadMoreLinks(){
  $$('.read-more, .read-more-prod').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const id = a.dataset.id;
      const p = products.find(x => x.id === id);
      if(p) openReadMore(p.name, p.description);
    });
  });
}

// ---------------------- AUTH VIEW HELPERS ----------------------
const authModal = $('#auth-modal');
const signupForm = $('#signup-form');
const loginForm = $('#login-form');
const authMessage = $('#auth-message');
const logoutBtn = $('#logout-btn');
const navAdmin = $('#nav-admin');

function showView(id){ $$('.view').forEach(v=>v.style.display='none'); $('#'+id+'-view').style.display='block'; }
function showAuthModal(show){ if(authModal) authModal.style.display = show?'flex':'none'; }

const userProfileCache = {};
async function getUserProfile(uid){
  if(userProfileCache[uid]) return userProfileCache[uid];
  try{
    const docSnap = await getDoc(doc(db,'users',uid));
    if(docSnap.exists()) {
      const profile = docSnap.data();
      userProfileCache[uid] = profile;
      return profile;
    }
  }catch(e){ console.error("Error fetching user profile:", e); }
  return { name: 'User', email: 'N/A', profilePicUrl: 'images/default_profile.png' };
}
async function getUserName(uid){
  const profile = await getUserProfile(uid);
  return profile.name || (profile.email ? profile.email.split('@')[0] : 'User');
}

// ---------------------- NOTIFICATION HELPER ----------------------
async function createNotification(recipientUID, type, sourceID, senderUID, senderName) {
    if (recipientUID === senderUID) return; 
    await addDoc(collection(db, 'notifications'), {
        recipientUID, type, sourceID, senderUID, senderName, read: false, timestamp: serverTimestamp()
    });
}

// ---------------------- AUTH ACTIONS (EMAIL, GOOGLE, PHONE) ----------------------

// Signup
signupForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await syncUserProfile(cred.user, name);
  }catch(err){ authMessage.textContent = err.message; }
});

// Login
loginForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  try{ await signInWithEmailAndPassword(auth,email,password); }catch(err){ authMessage.textContent=err.message; }
});

// Google Login
$('#google-login-btn')?.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await syncUserProfile(result.user);
    } catch (err) { alert("Google Login Failed: " + err.message); }
});

// Phone Login Step 1
$('#send-code-btn')?.addEventListener('click', async () => {
    const phoneNum = $('#phone-number').value.trim();
    if(!phoneNum.startsWith('+')) return alert("Enter full number with country code (e.g. +234)");
    const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
    try {
        confirmationResult = await signInWithPhoneNumber(auth, phoneNum, appVerifier);
        $('#phone-auth-step-1').style.display = 'none';
        $('#phone-auth-step-2').style.display = 'block';
    } catch (err) { alert("SMS Failed: " + err.message); }
});

// Phone Login Step 2
$('#verify-code-btn')?.addEventListener('click', async () => {
    const code = $('#verification-code').value.trim();
    try {
        const result = await confirmationResult.confirm(code);
        await syncUserProfile(result.user);
    } catch (err) { alert("Invalid Code: " + err.message); }
});

async function syncUserProfile(user, customName = null) {
    const docRef = doc(db, 'users', user.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
        await setDoc(docRef, {
            name: customName || user.displayName || "Farmer",
            email: user.email || user.phoneNumber,
            friends: [],
            pendingRequests: [],
            isAdmin: (user.uid === ADMIN_UID),
            createdAt: serverTimestamp()
        });
    }
}

logoutBtn?.addEventListener('click', async ()=>{ await signOut(auth); location.reload(); });

onAuthStateChanged(auth, async user=>{
  currentUser=user;
  if(user){
    const profileSnap = await getDoc(doc(db, 'users', user.uid));
    currentProfile = profileSnap.exists() ? profileSnap.data() : null;
    if(!currentProfile) await syncUserProfile(user);

    showAuthModal(false);
    $('#logout-btn').style.display='inline-block';
    navAdmin.style.display = (user.uid===ADMIN_UID)?'inline-block':'none';
    
    await renderAll(); 
    loadSocialFeed(); 
    setupFriendshipListener(user.uid); 
    setupNotificationListener(user.uid); 
  }else{
    showAuthModal(true);
  }
});

// ---------------------- WHATSAPP ----------------------
function attachWhatsAppButtons(containerSelector){
  $$(containerSelector + ' .order').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const name = e.currentTarget.dataset.name;
      const price = e.currentTarget.dataset.price;
      window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`,'_blank');
    });
  });
}

// ---------------------- PRODUCTS RENDERING ----------------------
async function renderProducts(){
  const container = $('#product-list'); if(!container) return;
  container.innerHTML='';
  products.forEach(p=>{
    const card = el('div',{class:'card product'},`
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
      <p>${p.description.slice(0,150)}... <a href="#" data-id="${p.id}" class="read-more">Read more</a></p>
      <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
    `);
    container.appendChild(card);
  });
  attachWhatsAppButtons('#product-list');
  attachReadMoreLinks();
}

// ---------------------- SOCIAL FEED ----------------------
function loadSocialFeed(){
    const feed = $('#feed'); if(!feed) return;
    const q = query(collection(db,'posts'), orderBy('timestamp','desc'));

    onSnapshot(q, async snapshot=>{
        feed.innerHTML='';
        products.forEach(p=>{
            const card = el('div',{class:'card post'},`
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p class="muted">Price: ₦${p.price.toLocaleString()}</p>
                <p>${p.description.slice(0,150)}... <a href="#" data-id="${p.id}" class="read-more-prod">Read more</a></p>
                <button class="btn order" data-name="${p.name}" data-price="${p.price}">Order via WhatsApp</button>
            `);
            feed.appendChild(card);
        });

        for(const docSnap of snapshot.docs){
            const post = docSnap.data();
            const ownerName = await getUserName(post.uid);
            const card = el('div',{class:'card post'});
            const isLiked = currentUser && post.likes && post.likes.includes(currentUser.uid);

            card.innerHTML = `
                <img src="${post.image || 'images/default_profile.png'}" alt="">
                <h3>${ownerName}</h3>
                <p>${post.text}</p>
                <p>Likes: <span class="like-count">${post.likes?.length||0}</span> 
                    <button class="btn like-btn" style="background-color: ${isLiked ? '#28a745' : '#007bff'};">${isLiked ? 'Liked' : 'Like'}</button>
                </p>
                <div class="comments">
                    <h5>Comments:</h5>
                    <ul class="comment-list">${(post.comments||[]).map(c=>`<li><strong>${c.name||'User'}:</strong> ${c.text}</li>`).join('')}</ul>
                    <input type="text" placeholder="Comment" class="comment-input">
                    <button class="btn comment-btn">Comment</button>
                </div>
            `;
            
            card.querySelector('.like-btn').onclick = async ()=>{
                const action = isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid);
                await updateDoc(doc(db,'posts',docSnap.id), { likes: action });
                if (!isLiked) await createNotification(post.uid, 'like', docSnap.id, currentUser.uid, currentProfile.name);
            };
            
            card.querySelector('.comment-btn').onclick = async ()=>{
                const input = card.querySelector('.comment-input');
                if(!input.value.trim()) return;
                await updateDoc(doc(db,'posts',docSnap.id), { 
                    comments: arrayUnion({ uid: currentUser.uid, name: currentProfile.name, text: input.value.trim(), timestamp: Date.now() }) 
                });
                await createNotification(post.uid, 'comment', docSnap.id, currentUser.uid, currentProfile.name);
                input.value='';
            };
            feed.appendChild(card);
        }
        attachWhatsAppButtons('#feed');
        attachReadMoreLinks();
    });
}

// ---------------------- CREATE POST ----------------------
$('#post-btn')?.addEventListener('click', async ()=>{
  const text = $('#post-text').value.trim();
  const file = $('#post-image').files[0];
  let imageUrl = '';
  if(file){
    const fd = new FormData(); fd.append('file',file); fd.append('upload_preset',UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_URL,{method:'POST',body:fd});
    const data = await res.json(); imageUrl = data.secure_url;
  }
  await addDoc(collection(db,'posts'),{
    uid: currentUser.uid, text, image: imageUrl, timestamp: serverTimestamp(), likes: [], comments: []
  });
  $('#post-text').value='';
});

// ---------------------- PROFILE ----------------------
$('#save-profile-pic')?.addEventListener('click', async ()=>{
  const file = $('#profile-upload').files[0];
  const fd = new FormData(); fd.append('file',file); fd.append('upload_preset',UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_URL,{method:'POST',body:fd});
  const data = await res.json();
  await updateDoc(doc(db,'users',currentUser.uid), { profilePic: data.secure_url });
  alert('Saved');
});

// ---------------------- FRIENDSHIP & CHAT (FIXED) ----------------------
async function sendFriendRequest(e) {
    const recipientUID = e.currentTarget.dataset.uid;
    await updateDoc(doc(db, "users", recipientUID), { pendingRequests: arrayUnion(currentUser.uid) });
    await createNotification(recipientUID, 'friend_request', currentUser.uid, currentUser.uid, currentProfile.name);
    alert("Sent");
}

async function handleFriendRequest(action, senderUID) {
    const senderRef = doc(db, "users", senderUID);
    const myRef = doc(db, "users", currentUser.uid);
    if (action === 'accept') {
        await updateDoc(myRef, { pendingRequests: arrayRemove(senderUID), friends: arrayUnion(senderUID) });
        await updateDoc(senderRef, { friends: arrayUnion(currentUser.uid) });
    } else {
        await updateDoc(myRef, { pendingRequests: arrayRemove(senderUID) });
    }
}

function setupFriendshipListener(uid) {
    onSnapshot(doc(db, "users", uid), (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            renderFriends(data.friends || []);
            renderFriendRequests(data.pendingRequests || []);
        }
    });
    renderAllUsersForFriendSearch();
}

async function renderAllUsersForFriendSearch(){
    const container = $('#friends'); if(!container) return;
    container.innerHTML = '<h4>Find Farmers</h4>';
    const snap = await getDocs(collection(db,'users'));
    snap.forEach(d => {
        if(d.id === currentUser.uid) return;
        const u = d.data();
        const card = el('div',{class:'card'}, `<p>${u.name}</p>`);
        const btn = el('button', { 'data-uid': d.id, class:'btn btn-sm' }, 'Add Friend');
        btn.onclick = sendFriendRequest;
        card.appendChild(btn);
        container.appendChild(card);
    });
}

function renderFriends(friendUids) {
    const container = $('#chat-list'); if(!container) return;
    container.innerHTML = '';
    friendUids.forEach(async uid => {
        const friend = await getUserProfile(uid);
        const div = el('div', { class: 'card' }, `${friend.name} <button class="btn btn-sm" data-uid="${uid}">Chat</button>`);
        div.querySelector('button').onclick = () => startChat(uid);
        container.appendChild(div);
    });
}

function renderFriendRequests(requestUids) {
    const container = $('#friend-requests'); if(!container) return;
    container.innerHTML = '';
    requestUids.forEach(async uid => {
        const sender = await getUserProfile(uid);
        const div = el('div', { class: 'card' }, `${sender.name} sent request.`);
        const acc = el('button', { class: 'btn btn-sm' }, 'Accept');
        acc.onclick = () => handleFriendRequest('accept', uid);
        div.appendChild(acc);
        container.appendChild(div);
    });
}

async function startChat(friendUID) {
    const participants = [currentUser.uid, friendUID].sort();
    currentChatID = participants.join('_');
    $('#chat-window').style.display = 'block';
    
    if (unsubscribeMessages) unsubscribeMessages();
    const q = query(collection(db, "chats", currentChatID, "messages"), orderBy("timestamp", "asc"));
    unsubscribeMessages = onSnapshot(q, (snap) => {
        const msgDiv = $('#messages'); msgDiv.innerHTML = '';
        snap.forEach(d => {
            const m = d.data();
            const side = m.senderUID === currentUser.uid ? 'mine' : 'theirs';
            msgDiv.appendChild(el('div', {class: `message-bubble ${side}`}, m.text));
        });
    });
}

$('#send-chat')?.addEventListener('click', async () => {
    const text = $('#chat-input').value.trim();
    if(!text || !currentChatID) return;
    await addDoc(collection(db, "chats", currentChatID, "messages"), {
        senderUID: currentUser.uid, text, timestamp: serverTimestamp()
    });
    $('#chat-input').value = '';
});

// ---------------------- NOTIFICATION LISTENER ----------------------
function setupNotificationListener(uid) { 
    const counter = $('#notification-counter');
    const q = query(collection(db, "notifications"), where("recipientUID", "==", uid), where("read", "==", false));
    onSnapshot(q, (snap) => {
        if(counter) {
            counter.textContent = snap.docs.length || '';
            counter.style.display = snap.docs.length > 0 ? 'block' : 'none';
        }
    });
}

// ---------------------- ADMIN ----------------------
async function renderAdmin(){
  if(currentUser?.uid !== ADMIN_UID) return;
  const postsContainer = $('#admin-posts'); postsContainer.innerHTML='';
  const psnap = await getDocs(collection(db,'posts'));
  psnap.forEach(d => {
    const p = d.data();
    const card = el('div',{class:'card'}, `<p>${p.text}</p>`);
    const del = el('button',{class:'btn'},'Delete');
    del.onclick = async () => { await deleteDoc(doc(db,'posts',d.id)); renderAdmin(); };
    card.appendChild(del);
    postsContainer.appendChild(card);
  });
}

// ---------------------- NAV ----------------------
$('#nav-feed').onclick = () => { showView('feed'); loadSocialFeed(); };
$('#nav-products').onclick = () => showView('products');
$('#nav-profile').onclick = () => showView('profile');
$('#nav-chat').onclick = () => showView('chat');
$('#nav-admin').onclick = () => { showView('admin'); renderAdmin(); };

async function renderAll(){
  await renderProducts();
  if(currentUser){
    const udoc = await getDoc(doc(db,'users',currentUser.uid));
    if(udoc.exists()){
      const data = udoc.data();
      if(data.profilePic) $('#profile-pic').src=data.profilePic;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => { showView('feed'); renderProducts(); });
