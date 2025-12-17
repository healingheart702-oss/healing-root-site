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

// ---------------------- ADMIN ----------------------
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// ---------------------- PRODUCTS ----------------------
const products = [
  { id:"cassava", name:"Cassava Stems (TME419)", image:"images/cassava.JPG", price:1000, description:"Healing Root Agro Ventures provides premium TME419 cassava stems known for high yield..." },
  { id:"plantain", name:"Hybrid Plantain Suckers", image:"images/plantain.JPG", price:500, description:"Our Hybrid Plantain Suckers are carefully selected for vigor, early fruiting..." },
  { id:"banana", name:"Hybrid Dwarf Banana", image:"images/giant_banana.JPG", price:500, description:"The Hybrid Dwarf Banana from Healing Root Agro Ventures offers early maturation..." },
  { id:"oilpalm", name:"Tenera Oil Palm Seedlings", image:"images/oilpalm.JPG", price:1000, description:"Healing Root Agro Ventures Tenera Oil Palm Seedlings are top-quality planting materials..." },
  { id:"coconut", name:"Hybrid Dwarf Coconut Seedlings", image:"images/coconut.JPG", price:4500, description:"Our Hybrid Dwarf Coconut Seedlings are fast-growing, high-yielding..." },
  { id:"giant_cocoa", name:"Hybrid Giant Cocoa Seedlings", image:"images/giant_cocoa.JPG", price:500, description:"Healing Root Agro Ventures offers Hybrid Giant Cocoa Seedlings that combine high yield..." },
  { id:"pineapple", name:"Pineapple Seedlings", image:"images/pineapple.JPG", price:400, description:"Premium Pineapple Seedlings from Healing Root Agro Ventures are selected for rapid growth..." },
  { id:"yam", name:"Treated Yam Setts", image:"images/Yamsett.JPG", price:700, description:"Our Treated Yam Setts are carefully selected tubers treated for disease resistance..." }
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

// ---------------------- AUTH & NAV & GLOBAL STATE ----------------------
const authModal = $('#auth-modal');
const signupForm = $('#signup-form');
const loginForm = $('#login-form');
const authMessage = $('#auth-message');
const logoutBtn = $('#logout-btn');
const navAdmin = $('#nav-admin');

let currentUser = null;
let currentProfile = null; 
let currentChatID = null; 
let unsubscribeMessages = null; 

function showView(id){ $$('.view').forEach(v=>v.style.display='none'); $('#'+id+'-view').style.display='block'; }
function showAuthModal(show){ authModal.style.display = show?'flex':'none'; }

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

// ---------------------- NOTIFICATION HELPER FUNCTION (NEW) ----------------------

async function createNotification(recipientUID, type, sourceID, senderUID, senderName) {
    // Prevent sending a notification to yourself (e.g., liking your own post)
    if (recipientUID === senderUID) return; 

    // Find the recipient's profile to ensure they exist
    const recipientProfile = await getUserProfile(recipientUID);
    if (!recipientProfile.email || recipientProfile.email === 'N/A') {
        console.warn(`Attempted to send notification to non-existent user: ${recipientUID}`);
        return;
    }
    
    await addDoc(collection(db, 'notifications'), {
        recipientUID: recipientUID,
        type: type, // 'like', 'comment', or 'friend_request'
        sourceID: sourceID, // The postId or senderUID
        senderUID: senderUID,
        senderName: senderName,
        read: false,
        timestamp: serverTimestamp()
    });
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
    await setDoc(doc(db,'users',cred.user.uid), { name, email, createdAt:serverTimestamp(), friends:[], pendingRequests: [] }); 
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
    const profileSnap = await getDoc(doc(db, 'users', user.uid));
    currentProfile = profileSnap.exists() ? profileSnap.data() : null;

    if (!currentProfile) {
      console.error("User profile missing in Firestore!");
      await signOut(auth); 
      showAuthModal(true);
      return;
    }

    showAuthModal(false);
    $('#logout-btn').style.display='inline-block';
    navAdmin.style.display = (user.uid===ADMIN_UID)?'inline-block':'none';
    $('#nav-feed').click();
    
    await renderAll(); 
    loadSocialFeed(); 
    setupFriendshipListener(user.uid); 
    setupNotificationListener(user.uid); 

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

// ---------------------- FEED (Enhanced Real-Time Listener) ----------------------
function loadSocialFeed(){
    const feed = $('#feed'); 
    const q = query(collection(db,'posts'), orderBy('timestamp','desc'));

    onSnapshot(q, async snapshot=>{
        feed.innerHTML='';
        // Re-render the initial products list at the top of the feed view if desired
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

        // Loop through Firestore posts
        for(const docSnap of snapshot.docs){
            const post = docSnap.data();
            const ownerName = await getUserName(post.uid);
            const card = el('div',{class:'card post'});
            const isLiked = currentUser && post.likes && post.likes.includes(currentUser.uid);

            card.innerHTML = `
                <img src="${post.image || (await getUserProfile(post.uid)).profilePic || 'images/default_profile.png'}" alt="">
                <h3>${ownerName}</h3>
                <p>${post.text}</p>
                <p>Likes: <span class="like-count">${post.likes?.length||0}</span> 
                    <button class="btn like-btn" data-liked="${isLiked ? 'true' : 'false'}" style="background-color: ${isLiked ? '#28a745' : '#007bff'};">${isLiked ? 'Liked' : 'Like'}</button>
                </p>
                <div class="comments">
                    <h5>Comments:</h5>
                    <ul class="comment-list">${(post.comments||[]).map(c=>`<li><strong>${c.name||'User'}:</strong> ${c.text}</li>`).join('')}</ul>
                    <input type="text" placeholder="Comment" class="comment-input">
                    <button class="btn comment-btn">Comment</button>
                </div>
            `;
            
            // 1. Like/Unlike Listener (UPGRADED for Notifications)
            card.querySelector('.like-btn').addEventListener('click', async ()=>{
                if (!currentUser) return alert('Please sign in to like posts.');
                const isCurrentlyLiked = post.likes && post.likes.includes(currentUser.uid);
                const updateAction = isCurrentlyLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid);
                
                await updateDoc(doc(db,'posts',docSnap.id), { likes: updateAction });
                
                // 🔔 NOTIFICATION LOGIC: Only notify on a new like (not an unlike)
                if (!isCurrentlyLiked) {
                    await createNotification(
                        post.uid,                 // Recipient: Post owner
                        'like',                   // Type
                        docSnap.id,               // Source: Post ID
                        currentUser.uid,          // Sender UID
                        currentProfile.name       // Sender Name
                    );
                }
            });
            
            // 2. Comment Listener (UPGRADED for Notifications)
            card.querySelector('.comment-btn').addEventListener('click', async ()=>{
                if (!currentUser) return alert('Please sign in to comment.');
                const input = card.querySelector('.comment-input');
                const text = input.value.trim();
                if(!text) return;

                await updateDoc(doc(db,'posts',docSnap.id), { 
                    comments: arrayUnion({ 
                        uid: currentUser.uid, 
                        name: currentProfile.name,
                        text, 
                        timestamp: new Date().getTime() 
                    }) 
                });
                input.value='';

                // 🔔 NOTIFICATION LOGIC
                await createNotification(
                    post.uid,                 // Recipient: Post owner
                    'comment',                // Type
                    docSnap.id,               // Source: Post ID
                    currentUser.uid,          // Sender UID
                    currentProfile.name       // Sender Name
                );
            });
            feed.appendChild(card);
        }

        attachWhatsAppButtons('#feed');
        attachReadMoreLinks();
    });
}

// ---------------------- CREATE POST ----------------------
$('#post-btn')?.addEventListener('click', async ()=>{
  if(!currentUser){ alert('Sign in first'); return; }
  const text = $('#post-text').value.trim();
  const file = $('#post-image').files[0];
  let imageUrl = '';
  let authorPfp = currentProfile.profilePic || 'images/default_profile.png'; 

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
    name: currentProfile.name || '',
    authorPfp: authorPfp, 
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
    currentProfile.profilePic = url;
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

// ---------------------- FRIENDSHIP & CHAT ----------------------
const friendsListContainer = $('#friends'); 
const chatListContainer = $('#chat-list'); 
const friendRequestsContainer = $('#friend-requests'); 

// Send Friend Request (UPGRADED for Notifications)
async function sendFriendRequest(e) {
    const recipientUID = e.currentTarget.dataset.uid;

    if (currentProfile.friends.includes(recipientUID) || (currentProfile.pendingRequests && currentProfile.pendingRequests.includes(recipientUID))) {
        alert("Already friends or request already sent.");
        return;
    }

    try {
        // 1. Update recipient's user document
        await updateDoc(doc(db, "users", recipientUID), {
            pendingRequests: arrayUnion(currentUser.uid) 
        });

        // 2. 🔔 NOTIFICATION LOGIC
        await createNotification(
            recipientUID,             // Recipient: The user being requested
            'friend_request',         // Type
            currentUser.uid,          // Source: Sender UID
            currentUser.uid,          // Sender UID
            currentProfile.name       // Sender Name
        );
        
        alert("Friend request sent!");
    } catch (error) {
        console.error("Error sending request:", error);
        alert("Failed to send request.");
    }
}

function handleFriendRequest(action) {
    return async (e) => {
        const senderUID = e.currentTarget.dataset.senderUid;
        const senderRef = doc(db, "users", senderUID);
        const recipientRef = doc(db, "users", currentUser.uid);

        if (action === 'accept') {
            await updateDoc(recipientRef, { pendingRequests: arrayRemove(senderUID) });
            await updateDoc(recipientRef, { friends: arrayUnion(senderUID) });
            await updateDoc(senderRef, { friends: arrayUnion(currentUser.uid) });
            alert(`You are now friends!`);
        } else if (action === 'reject') {
            await updateDoc(recipientRef, { pendingRequests: arrayRemove(senderUID) });
            alert(`Request rejected.`);
        }
    }
}

async function renderFriends(friendUids) {
    chatListContainer.innerHTML = '';
    if (friendUids.length === 0) {
        chatListContainer.innerHTML = '<p>No friends yet. Search below to add someone.</p>';
        return;
    }

    const friendProfiles = await Promise.all(
        friendUids.map(uid => getUserProfile(uid))
    );

    friendProfiles.forEach(friend => {
        const card = el('div', { class: 'card chat-user' }, `
            <img src="${friend.profilePic || 'images/default_profile.png'}" style="width:30px; height:30px; border-radius:50%; margin-right:10px;">
            ${friend.name || friend.email.split('@')[0]}
            <button class="btn btn-sm" data-uid="${friend.uid}" style="margin-left:auto;">Chat</button>
        `);
        card.querySelector('button').addEventListener('click', startChat);
        chatListContainer.appendChild(card);
    });
}

async function renderFriendRequests(requestUids) {
    if (friendRequestsContainer) friendRequestsContainer.innerHTML = ''; 
    else { console.warn("Missing HTML element: #friend-requests"); return; }
    
    if (!requestUids || requestUids.length === 0) {
        friendRequestsContainer.innerHTML = '<p>No pending requests.</p>';
        return;
    }

    const senderProfiles = await Promise.all(
        requestUids.map(uid => getUserProfile(uid))
    );

    senderProfiles.forEach(sender => {
        const div = el('div', { class: 'card request-item' }, `
            <span>${sender.name || sender.email.split('@')[0]} sent a request.</span>
        `);
        const acceptBtn = el('button', { 'data-sender-uid': sender.uid, class: 'btn btn-sm' }, 'Accept');
        const rejectBtn = el('button', { 'data-sender-uid': sender.uid, class: 'btn btn-sm', style: 'background-color:crimson' }, 'Reject');
        
        acceptBtn.addEventListener('click', handleFriendRequest('accept'));
        rejectBtn.addEventListener('click', handleFriendRequest('reject'));
        
        div.appendChild(acceptBtn);
        div.appendChild(rejectBtn);
        friendRequestsContainer.appendChild(div);
    });
}

function setupFriendshipListener(uid) {
    onSnapshot(doc(db, "users", uid), (docSnap) => {
        if (docSnap.exists()) {
            const user = docSnap.data();
            currentProfile = user; 
            renderFriends(user.friends || []);
            renderFriendRequests(user.pendingRequests || []);
        }
    });

    renderAllUsersForFriendSearch();
}

async function renderAllUsersForFriendSearch(){
    friendsListContainer.innerHTML = '<h4>Find Users</h4>';
    const snap = await getDocs(collection(db,'users'));
    for(const d of snap.docs){
        if(d.id === currentUser.uid) continue;
        const u = d.data();
        const card = el('div',{class:'card friend-search-item'}, `
            <p><strong>${u.name || u.email.split('@')[0]}</strong></p>
        `);
        const btn = el('button', { 'data-uid': d.id }, 'Send Request'); btn.className='btn btn-sm';
        btn.addEventListener('click', sendFriendRequest);
        card.appendChild(btn);
        friendsListContainer.appendChild(card);
    }
}

async function startChat(e) {
    const friendUID = e.currentTarget.dataset.uid;
    const participants = [currentUser.uid, friendUID].sort();
    const chatID = participants.join('_');
    currentChatID = chatID;
    
    const friendProfile = await getUserProfile(friendUID);
    $('#chat-window').style.display = 'block';
    $('#chat-with').textContent = `💬 Chat with ${friendProfile.name || friendProfile.email.split('@')[0]}`;
    
    await setDoc(doc(db, "chats", chatID), { 
        participants: participants, 
        lastMessageAt: serverTimestamp() 
    }, { merge: true });

    setupMessageListener(chatID, friendUID);
}

function setupMessageListener(chatID, friendUID) {
    if (unsubscribeMessages) unsubscribeMessages(); 

    const messagesContainer = $('#messages'); 
    messagesContainer.innerHTML=''; 
    
    const q = query(collection(db, "chats", chatID, "messages"), orderBy("timestamp", "asc"));
    
    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.docs.forEach(docSnap => {
            const message = docSnap.data();
            const isMe = message.senderUID === currentUser.uid;
            const fromName = isMe ? 'You' : (message.senderName || 'Friend');
            
            const messageDiv = el('div', { class: `message-bubble ${isMe ? 'mine' : 'theirs'}` }, 
                `<strong>${fromName}:</strong> ${message.text}`
            );
            messagesContainer.appendChild(messageDiv);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

$('#send-chat')?.addEventListener('click', async ()=>{
  if(!currentUser || !currentChatID) return alert('Select a friend to chat with.');
  const msg = $('#chat-input').value.trim();
  if(!msg) return;

  await addDoc(collection(db, "chats", currentChatID, "messages"), {
        senderUID: currentUser.uid,
        senderName: currentProfile.name || currentProfile.email.split('@')[0],
        text: msg,
        timestamp: serverTimestamp()
    });
    
  await updateDoc(doc(db, "chats", currentChatID), {
      lastMessageText: msg,
      lastMessageAt: serverTimestamp()
  });

  $('#chat-input').value='';
});

// ---------------------- NOTIFICATION LISTENER ----------------------
function setupNotificationListener(uid) { 
    const notificationCounter = $('#notification-counter');
    if (!notificationCounter) {
        console.warn("Missing HTML element: #notification-counter");
        return;
    }

    const q = query(collection(db, "notifications"), where("recipientUID", "==", uid), where("read", "==", false));

    onSnapshot(q, (snapshot) => {
        let unreadCount = snapshot.docs.length;
        notificationCounter.textContent = unreadCount > 0 ? unreadCount : '';
        notificationCounter.style.display = unreadCount > 0 ? 'block' : 'none';
    });
}

// ---------------------- ADMIN ----------------------
async function renderAdmin(){
  if(!currentUser || currentUser.uid !== ADMIN_UID) return;
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
$('#nav-feed').addEventListener('click', ()=> { showView('feed'); loadSocialFeed(); });
$('#nav-products').addEventListener('click', ()=> showView('products'));
$('#nav-profile').addEventListener('click', ()=> showView('profile'));
$('#nav-chat').addEventListener('click', ()=> showView('chat'));
$('#nav-admin').addEventListener('click', ()=> showView('admin'));

// ---------------------- RENDER ALL ----------------------
async function renderAll(){
  await renderProducts();
  if(currentUser){
    const udoc = await getDoc(doc(db,'users',currentUser.uid));
    if(udoc.exists()){
      const data = udoc.data();
      if(data.profilePic) $('#profile-pic').src=data.profilePic;
      if(data.bio) $('#bio').value=data.bio;
    }
    renderAdmin();
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  showView('feed');
  renderProducts(); 
});
