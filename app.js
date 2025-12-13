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
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, serverTimestamp, onSnapshot, arrayUnion
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

// ---------------------- ADMIN ----------------------
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// ---------------------- PRODUCTS ----------------------
const products = [
  { id:"cassava", name:"Cassava Stems (TME419)", image:"images/cassava.JPG", price:1000, description:`Healing Root Agro Ventures provides premium TME419 cassava stems known for high yield, disease resistance, and strong root development. Each stem is nurtured in a controlled nursery to ensure survival rates above 95%, giving farmers a reliable start. Our cassava stems are ideal for commercial farming, guaranteeing tuber quality and consistent income for small and large-scale farmers across Nigeria. Full planting guidance and farm management tips are provided with every purchase.` },
  { id:"plantain", name:"Hybrid Plantain Suckers", image:"images/plantain.JPG", price:500, description:`Our Hybrid Plantain Suckers are carefully selected for vigor, early fruiting, and high production. Raised in hygienic nurseries, these suckers adapt easily to different soil types and climates in Nigeria. With strong resistance to pests and diseases, they provide farmers with dependable growth and fruiting cycles. Each purchase comes with detailed planting and care instructions to ensure optimal yield and long-term plantation success.` },
  { id:"banana", name:"Hybrid Dwarf Banana", image:"images/giant_banana.JPG", price:500, description:`The Hybrid Dwarf Banana from Healing Root Agro Ventures offers early maturation, high fruit quality, and strong resistance to common diseases. Ideal for both backyard gardens and commercial plantations, these banana seedlings ensure consistent yield and minimal maintenance. Raised in controlled nurseries, each seedling is ready for immediate transplantation, helping farmers secure profitable banana production with long-term benefits.` },
  { id:"oilpalm", name:"Tenera Oil Palm Seedlings", image:"images/oilpalm.JPG", price:1000, description:`Healing Root Agro Ventures Tenera Oil Palm Seedlings are top-quality planting materials carefully raised to ensure maximum yield, disease resistance, and early fruiting. Each seedling undergoes rigorous nursery management including proper fertilization, pest control, and root development enhancement. Suitable for commercial plantations, these seedlings guarantee consistent bunch production, high oil content, and longevity of palms. Farmers are provided with full planting guidelines, soil preparation techniques, and maintenance tips to achieve optimal growth, minimize losses, and maximize return on investment. Our seedlings are acclimatized to different soil types and Nigerian climatic conditions, making them ideal for large and small-scale farming. With a focus on sustainable practices, every purchase ensures not only high productivity but also long-term farm profitability. This comprehensive package enables growers to establish healthy plantations, increase oil extraction efficiency, and secure a dependable income from the first harvest to full maturity.` },
  { id:"coconut", name:"Hybrid Dwarf Coconut Seedlings", image:"images/coconut.JPG", price:4500, description:`Our Hybrid Dwarf Coconut Seedlings are fast-growing, high-yielding, and ideal for small to medium-scale farms. Each seedling is carefully raised to ensure healthy root systems, strong stem development, and early fruiting. Farmers benefit from reliable growth, superior nut quality, and high survival rates. Planting instructions and care guidance are included with every purchase for optimal results.` },
  { id:"giant_cocoa", name:"Hybrid Giant Cocoa Seedlings", image:"images/giant_cocoa.JPG", price:500, description:`Healing Root Agro Ventures offers Hybrid Giant Cocoa Seedlings that combine high yield with strong resistance to common diseases. Raised in clean nurseries, these seedlings adapt well to Nigerian soils and climates, giving farmers dependable growth and fruiting cycles. Each purchase comes with expert guidance on planting, maintenance, and pest control to maximize long-term cocoa production.` },
  { id:"pineapple", name:"Pineapple Seedlings", image:"images/pineapple.JPG", price:400, description:`Premium Pineapple Seedlings from Healing Root Agro Ventures are selected for rapid growth, high fruit quality, and uniformity. They are raised in controlled nursery conditions to ensure strong establishment and survival. Ideal for both commercial and backyard planting, these seedlings come with planting and care instructions to guarantee maximum fruit yield and consistent quality.` },
  { id:"yam", name:"Treated Yam Setts", image:"images/Yamsett.JPG", price:700, description:`Our Treated Yam Setts are carefully selected tubers treated for disease resistance and enhanced sprouting. Each sett is ideal for both smallholder and commercial farms, ensuring rapid germination, uniform growth, and high tuber yield. Healing Root Agro Ventures provides full guidance on soil preparation, planting, and maintenance for maximum productivity and profitable harvests.` }
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
modalClose.addEventListener('click', ()=> modal.style.display='none');
modal.addEventListener('click', e => { if(e.target===modal) modal.style.display='none'; });
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

// ---------------------- AUTH & NAV ----------------------
const authModal = $('#auth-modal');
const signupForm = $('#signup-form');
const loginForm = $('#login-form');
const authMessage = $('#auth-message');
const logoutBtn = $('#logout-btn');
const navAdmin = $('#nav-admin');

let currentUser = null;
function showView(id){ $$('.view').forEach(v=>v.style.display='none'); $('#'+id+'-view').style.display='block'; }
function showAuthModal(show){ authModal.style.display = show?'flex':'none'; }
async function getUserName(uid){
  try{
    const docSnap = await getDoc(doc(db,'users',uid));
    if(docSnap.exists()) return docSnap.data().name || 'User';
  }catch(e){ console.error(e); }
  return 'User';
}

// ---------------------- AUTH ACTIONS ----------------------
signupForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent='';
  const name = $('#signup-name').value.trim();
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  if(!name || !email || !password){ authMessage.textContent='Fill all fields'; return; }
  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,'users',cred.user.uid), { name,email,createdAt:serverTimestamp(), friends:[] });
    authMessage.textContent='Account created — signed in';
  }catch(err){ authMessage.textContent = err.message; }
});
loginForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  authMessage.textContent='';
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  try{ await signInWithEmailAndPassword(auth,email,password); }catch(err){ authMessage.textContent=err.message; }
});
logoutBtn?.addEventListener('click', async ()=>{ await signOut(auth); });

onAuthStateChanged(auth, async user=>{
  currentUser=user;
  if(user){
    showAuthModal(false);
    $('#logout-btn').style.display='inline-block';
    navAdmin.style.display = (user.uid===ADMIN_UID)?'inline-block':'none';
    $('#nav-feed').click();
    await renderAll();
  }else{
    showAuthModal(true);
    $('#logout-btn').style.display='none';
    navAdmin.style.display='none';
    showView('feed');
  }
});

// ---------------------- WHATSAPP BUTTONS ----------------------
function attachWhatsAppButtons(containerSelector){
  $$(containerSelector + ' .order').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const name = e.currentTarget.dataset.name;
      const price = e.currentTarget.dataset.price;
      const phone = '2349138938301';
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Hello, I want to order ${name} priced at ₦${price}.`)}`,'_blank');
    });
  });
}

// ---------------------- PRODUCTS ----------------------
async function renderProducts(){
  const container = $('#product-list'); container.innerHTML='';
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

// ---------------------- FEED WITH LIKES & COMMENTS ----------------------
async function renderFeed(){
  const feed = $('#feed'); feed.innerHTML='';

  // Add products as posts
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

  const q = query(collection(db,'posts'), orderBy('timestamp','desc'));
  onSnapshot(q, async snapshot=>{
    feed.innerHTML=''; // reset feed
    for(const docSnap of snapshot.docs){
      const post = docSnap.data();
      const ownerName = await getUserName(post.uid);
      const card = el('div',{class:'card post'});
      card.innerHTML = `
        <img src="${post.image || 'images/default_profile.png'}" alt="">
        <h3>${ownerName}</h3>
        <p>${post.text}</p>
        <p>Likes: <span class="like-count">${post.likes?.length||0}</span> 
          <button class="btn like-btn">Like</button>
        </p>
        <div class="comments">
          <h5>Comments:</h5>
          <ul class="comment-list">${(post.comments||[]).map(c=>`<li>${c.name}: ${c.text}</li>`).join('')}</ul>
          <input type="text" placeholder="Comment" class="comment-input">
          <button class="btn comment-btn">Comment</button>
        </div>
      `;
      // Like
      card.querySelector('.like-btn').addEventListener('click', async ()=>{
        await updateDoc(doc(db,'posts',docSnap.id), { likes: arrayUnion(currentUser.uid) });
      });
      // Comment
      card.querySelector('.comment-btn').addEventListener('click', async ()=>{
        const input = card.querySelector('.comment-input');
        const text = input.value.trim();
        if(!text) return;
        await updateDoc(doc(db,'posts',docSnap.id), { comments: arrayUnion({ uid: currentUser.uid, name: await getUserName(currentUser.uid), text }) });
        input.value='';
      });
      feed.appendChild(card);
    }
  });

  attachWhatsAppButtons('#feed');
  attachReadMoreLinks();
}

// ---------------------- CREATE POST ----------------------
$('#post-btn')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in first'); return; }
  const text = $('#post-text').value.trim();
  const file = $('#post-image').files[0];
  let imageUrl = '';
  if(file){
    const fd = new FormData();
    fd.append('file',file);
    fd.append('upload_preset',UPLOAD_PRESET);
    try{
      const res = await fetch(CLOUDINARY_URL,{method:'POST',body:fd});
      const data = await res.json();
      imageUrl = data.secure_url;
    }catch(err){ console.error(err); alert('Image upload failed'); return; }
  }
  await addDoc(collection(db,'posts'),{
    uid: currentUser.uid,
    email: currentUser.email,
    name: currentUser.displayName || '',
    text,
    image: imageUrl,
    timestamp: serverTimestamp(),
    likes: [],
    comments: []
  });
  $('#post-text').value='';
  $('#post-image').value='';
});

// ---------------------- PROFILE ----------------------
$('#save-profile-pic')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in'); return; }
  const file = $('#profile-upload').files[0];
  if(!file){ alert('Choose file'); return; }
  const fd = new FormData();
  fd.append('file',file);
  fd.append('upload_preset',UPLOAD_PRESET);
  try{
    const res = await fetch(CLOUDINARY_URL,{method:'POST',body:fd});
    const data = await res.json();
    const url = data.secure_url;
    await updateDoc(doc(db,'users',currentUser.uid), { profilePic:url });
    $('#profile-pic').src=url;
    alert('Profile picture saved');
  }catch(err){ console.error(err); alert('Upload failed'); }
});
$('#save-bio')?.addEventListener('click', async ()=>{
  if(!currentUser) return alert('Sign in');
  const bio = $('#bio').value.trim();
  await updateDoc(doc(db,'users',currentUser.uid), { bio });
  alert('Bio saved');
});

// ---------------------- FRIENDS & CHAT ----------------------
async function renderFriends(){
  const container = $('#friends'); container.innerHTML='';
  const snap = await getDocs(collection(db,'users'));
  for(const d of snap.docs){
    if(d.id === currentUser.uid) continue;
    const u = d.data();
    const card = el('div',{class:'card friend'});
    const userName = await getUserName(d.id);
    card.innerHTML = `<h4>${userName}</h4><p class="muted">${u.email||''}</p>`;
    const btn = el('button', {}, 'Add Friend'); btn.className='btn';
    btn.addEventListener('click', async ()=>{
      // Add friend to both users
      await updateDoc(doc(db,'users',currentUser.uid), { friends: arrayUnion(d.id) });
      await updateDoc(doc(db,'users',d.id), { friends: arrayUnion(currentUser.uid) });
      alert(`${userName} added as friend`);
      renderChats();
    });
    card.appendChild(btn);
    container.appendChild(card);
  }
}

function renderChats(){
  const container = $('#chat-list'); container.innerHTML='';
  if(!currentUser) return;
  const userRef = doc(db,'users',currentUser.uid);
  getDoc(userRef).then(async docSnap=>{
    if(!docSnap.exists()) return;
    const friends = docSnap.data().friends || [];
    for(const uid of friends){
      const name = await getUserName(uid);
      const card = el('div',{class:'card chat-user'},`${name}`);
      card.addEventListener('click', ()=> openChat(uid));
      container.appendChild(card);
    }
  });
}

function openChat(uid){
  activeChatWith = uid;
  $('#chat-window').style.display = 'block';
  $('#chat-with').textContent = 'Chat: ' + uid;
  if(unsubscribeChats) unsubscribeChats();
  const messagesContainer = $('#messages'); messagesContainer.innerHTML='';
  const q = query(collection(db,'chats'), orderBy('timestamp'));
  unsubscribeChats = onSnapshot(q, snapshot=>{
    messagesContainer.innerHTML='';
    snapshot.docs.forEach(docSnap=>{
      const m = docSnap.data();
      if(!([m.from,m.to].includes(currentUser.uid) && [m.from,m.to].includes(uid))) return;
      const fromName = (m.from===currentUser.uid)?'You':'Friend';
      messagesContainer.appendChild(el('div',{}, `<strong>${fromName}:</strong> ${m.text}`));
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}
$('#send-chat')?.addEventListener('click', async ()=>{
  if(!currentUser || !activeChatWith) return alert('Select friend');
  const msg = $('#chat-input').value.trim();
  if(!msg) return;
  await addDoc(collection(db,'chats'), { from:currentUser.uid, to:activeChatWith, text:msg, timestamp:serverTimestamp() });
  $('#chat-input').value='';
});

// ---------------------- ADMIN ----------------------
async function renderAdmin(){
  if(!currentUser || currentUser.uid!==ADMIN_UID) return;
  $('#admin-view').style.display='block';
  const usersContainer = $('#admin-users'); usersContainer.innerHTML='';
  const usnap = await getDocs(collection(db,'users'));
  for(const d of usnap.docs){
    const u = d.data();
    const card = el('div',{class:'card user'}, `<h4>${u.name||u.email}</h4><p>${d.id}</p>`);
    usersContainer.appendChild(card);
  }
  const postsContainer = $('#admin-posts'); postsContainer.innerHTML='';
  const psnap = await getDocs(collection(db,'posts'));
  for(const docSnap of psnap.docs){
    const p = docSnap.data();
    const card = el('div',{class:'card post'});
    card.innerHTML = `<h4>${p.name||p.email}</h4><p>${p.text}</p>`;
    const del = el('button',{class:'btn'},'Delete'); del.style.background='crimson';
    del.addEventListener('click', async ()=>{
      await deleteDoc(doc(db,'posts',docSnap.id));
      renderAdmin();
    });
    card.appendChild(del);
    postsContainer.appendChild(card);
  }
}

// ---------------------- NAV ----------------------
$('#nav-feed').addEventListener('click', ()=> showView('feed'));
$('#nav-products').addEventListener('click', ()=> showView('products'));
$('#nav-profile').addEventListener('click', ()=> showView('profile'));
$('#nav-chat').addEventListener('click', ()=> showView('chat'));
$('#nav-admin').addEventListener('click', ()=> showView('admin'));

// ---------------------- RENDER ALL ----------------------
async function renderAll(){
  await renderProducts();
  await renderFeed();
  if(currentUser){
    const udoc = await getDoc(doc(db,'users',currentUser.uid));
    if(udoc.exists()){
      const data = udoc.data();
      if(data.profilePic) $('#profile-pic').src=data.profilePic;
      if(data.bio) $('#bio').value=data.bio;
    }
    renderFriends();
    renderChats();
    renderAdmin();
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  showView('feed');
});
