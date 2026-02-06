import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, deleteDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// ---------------------- CONFIGURATION ----------------------
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let currentUser = null;
let currentProfile = null;
let activeChatId = null;

// ---------------------- PRODUCTS (Maintained as requested) ----------------------
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

// ---------------------- VIEW MANAGEMENT ----------------------
window.showView = (viewId) => {
    $$('.view').forEach(v => v.style.display = 'none');
    const target = $(`#${viewId}-view`);
    if (target) target.style.display = 'block';
    
    // Auto-pause videos when leaving Reels
    if (viewId !== 'reels') {
        $$('video').forEach(v => v.pause());
    }

    $$('.nav-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`'${viewId}'`));
    });
};

// ---------------------- AUTH LOGIC ----------------------
let isLoginMode = true;
const authToggle = $('#auth-toggle');
if(authToggle) {
    authToggle.onclick = () => {
        isLoginMode = !isLoginMode;
        $('#auth-name').style.display = isLoginMode ? 'none' : 'block';
        $('#auth-submit-btn').innerText = isLoginMode ? 'Log In' : 'Create Account';
        $('#auth-toggle').innerText = isLoginMode ? "Don't have an account? Create one" : "Already have an account? Log In";
    };
}

$('#auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#auth-email').value;
    const pass = $('#auth-password').value;
    const name = $('#auth-name').value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, 'users', res.user.uid), {
                uid: res.user.uid,
                name: name || "Farmer",
                bio: "Agricultural Specialist",
                profilePic: 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                status: 'online'
            });
        }
    } catch (err) { alert(err.message); }
};

onAuthStateChanged(auth, async user => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                updateProfileUI(currentProfile);
                updateDoc(doc(db, 'users', user.uid), { status: 'online' });
            }
        });
        $('#auth-modal').style.display = 'none';
        $('#main-app').style.display = 'block';
        renderMarketplace();
        loadRealtimeFeed();
        loadAvailableFarmers();
        setupNotifications();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

// ---------------------- SYNCING FB-STYLE UI ----------------------
function updateProfileUI(profile) {
    const name = profile.name || "Farmer";
    const pic = profile.profilePic || 'images/default_profile.png';
    const cover = profile.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    const bio = profile.bio || "Agro Ventures Community";
    
    // Top Bar & Dashboard Name
    if($('#display-name-top')) $('#display-name-top').innerText = name;
    if($('#display-name-header')) $('#display-name-header').innerText = name;
    if($('#my-profile-name')) $('#my-profile-name').innerText = name;
    if($('#display-biz-name')) $('#display-biz-name').innerText = name;
    
    // Bio sections
    if($('#display-bio')) $('#display-bio').innerText = bio;
    if($('#display-bio-bold')) $('#display-bio-bold').innerText = bio;
    
    // Images
    if($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if($('#cover-pic-preview')) $('#cover-pic-preview').src = cover;
    if($('#my-menu-pic')) $('#my-menu-pic').src = pic;
    if($('#story-my-pic')) $('#story-my-pic').src = pic;
    
    // Global Avatar Sync
    $$('.user-avatar-sync').forEach(img => img.src = pic);
}

// ---------------------- PROFILE UPDATES ----------------------
window.uploadNewProfilePic = (input) => {
    const file = input.files[0];
    if (file) uploadToCloudinary(file, 'profilePic');
};

window.uploadCoverPic = (input) => {
    const file = input.files[0];
    if (file) uploadToCloudinary(file, 'coverPic');
};

async function uploadToCloudinary(file, field) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    try {
        const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
        const data = await res.json();
        await updateDoc(doc(db, 'users', currentUser.uid), { [field]: data.secure_url });
        alert("Photo updated!");
    } catch (err) { alert("Upload failed."); }
}

window.editBio = async () => {
    const newBio = prompt("What's your farm's specialty?", currentProfile?.bio || "");
    if (newBio !== null) await updateDoc(doc(db, 'users', currentUser.uid), { bio: newBio });
};

window.editBusinessName = async () => {
    const newName = prompt("Update Business Name:", currentProfile?.name || "");
    if (newName) await updateDoc(doc(db, 'users', currentUser.uid), { name: newName });
};

// ---------------------- FB STYLE FEED & REELS ----------------------
function loadRealtimeFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const feed = $('#feed-items');
        const reels = $('#reels-container');
        if (!feed || !reels) return;
        
        feed.innerHTML = '';
        reels.innerHTML = '';

        snapshot.docs.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const reactions = post.reactions || {};
            const counts = Object.values(reactions).length;

            const postHtml = `
                <div class="post-card">
                    <div style="display:flex; gap:10px; padding:12px; align-items:center;">
                        <img src="${post.userPic || 'images/default_profile.png'}" style="width:38px; height:38px; border-radius:50%; border:1px solid var(--hr-divider);">
                        <div>
                            <div style="font-weight:bold; font-size:14px;">${post.userName}</div>
                            <div style="font-size:11px; color:var(--hr-secondary);">Just now • 🌍</div>
                        </div>
                    </div>
                    <div style="padding:0 12px 12px 12px; font-size:15px; line-height:1.4;">${post.text}</div>
                    
                    ${post.content ? (post.type === 'video' ? 
                        `<video src="${post.content}" controls style="width:100%; background:#000;"></video>` : 
                        `<img src="${post.content}" style="width:100%; max-height:450px; object-fit:cover;">`) : ''}
                    
                    <div class="reaction-bar" style="padding: 10px 15px; border-bottom: 1px solid var(--hr-divider);">
                        <div id="picker-${pid}" class="reaction-picker">
                            <span onclick="addReaction('${pid}', '👍')">👍</span>
                            <span onclick="addReaction('${pid}', '❤️')">❤️</span>
                            <span onclick="addReaction('${pid}', '😮')">😮</span>
                            <span onclick="addReaction('${pid}', '🔥')">🔥</span>
                        </div>
                        <div style="display:flex; gap:20px;">
                            <div onclick="showReactions('${pid}')" style="cursor:pointer; font-size:13px; color:var(--hr-secondary); font-weight:bold;">
                                ${reactions[currentUser.uid] || '👍'} Like
                            </div>
                            <div onclick="$('#comm-input-${pid}').focus()" style="cursor:pointer; font-size:13px; color:var(--hr-secondary); font-weight:bold;">
                                💬 Comment
                            </div>
                        </div>
                        <div style="font-size:12px; color:var(--hr-secondary); margin-left:auto;">
                            ${counts > 0 ? '❤️ ' + counts : ''}
                        </div>
                    </div>

                    <div style="padding:10px;">
                        <div id="comments-${pid}">${renderComments(pid, post.comments || [])}</div>
                        <div style="display:flex; gap:8px; margin-top:10px; align-items:center;">
                            <img src="${currentProfile.profilePic}" style="width:30px; height:30px; border-radius:50%;">
                            <input type="text" id="comm-input-${pid}" placeholder="Write a comment..." 
                                style="flex:1; background:#3a3b3c; border:none; color:white; padding:8px 15px; border-radius:20px; font-size:13px;">
                            <button onclick="submitComment('${pid}')" style="background:none; border:none; color:var(--hr-green); font-weight:bold;">Post</button>
                        </div>
                    </div>
                </div>`;

            // Sort Videos into Reels and everything else into Feed
            if (post.type === 'video') {
                reels.innerHTML += postHtml;
            } else {
                feed.innerHTML += postHtml;
            }
        });
    });
}

// ---------------------- POST SUBMISSION ----------------------
window.submitPost = async () => {
    const text = $('#post-text').value;
    const fileInput = $('#post-file-input');
    const file = fileInput.files[0];
    
    if (!text && !file) return;
    
    // Close modal immediately for UX
    window.closePostModal();

    let fileUrl = '';
    let fileType = 'text';

    if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
        const data = await res.json();
        fileUrl = data.secure_url;
        fileType = file.type.includes('video') ? 'video' : 'image';
    }

    await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        userName: currentProfile?.name || "Farmer",
        userPic: currentProfile?.profilePic || "",
        text: text,
        content: fileUrl,
        type: fileType,
        timestamp: serverTimestamp(),
        reactions: {},
        comments: []
    });

    $('#post-text').value = '';
    fileInput.value = '';
};

// ---------------------- MARKETPLACE & CHAT ----------------------
function renderMarketplace() {
    const container = $('#market-list');
    if (!container) return;
    container.innerHTML = products.map(p => `
        <div class="card product" style="background: var(--hr-card); border-radius: 8px; overflow: hidden; border:1px solid var(--hr-divider);">
            <img src="${p.image}" style="width:100%; height:140px; object-fit:cover;">
            <div style="padding:10px;">
                <b style="color:var(--hr-green); font-size:14px; display:block; margin-bottom:5px;">${p.name}</b>
                <div style="font-size:13px; margin-bottom:10px;">₦${p.price.toLocaleString()}</div>
                <button onclick="window.open('https://wa.me/2349138938301?text=Order: ${p.name}')" 
                        style="width:100%; background:var(--hr-green); color:white; border:none; padding:8px; border-radius:5px; font-weight:bold; font-size:12px;">
                    Order on WhatsApp
                </button>
            </div>
        </div>
    `).join('');
}

window.addReaction = async (pid, emoji) => {
    const postRef = doc(db, 'posts', pid);
    const snap = await getDoc(postRef);
    const reactions = snap.data().reactions || {};
    reactions[currentUser.uid] = emoji;
    await updateDoc(postRef, { reactions });
    $(`#picker-${pid}`).style.display = 'none';
};

window.submitComment = async (pid) => {
    const input = $(`#comm-input-${pid}`);
    if (!input.value.trim()) return;

    const newComment = {
        id: Math.random().toString(36).substr(2, 9),
        uid: currentUser.uid,
        userName: currentProfile.name,
        text: input.value,
        timestamp: Date.now()
    };

    await updateDoc(doc(db, 'posts', pid), { 
        comments: arrayUnion(newComment) 
    });
    input.value = '';
};

function renderComments(pid, comments) {
    return comments.map(c => `
        <div style="background:#3a3b3c; border-radius:12px; padding:8px 12px; margin-bottom:5px; display:inline-block; max-width:90%;">
            <b style="font-size:12px; color:var(--hr-green);">${c.userName}</b>
            <div style="font-size:13px;">${c.text}</div>
        </div>
    `).join('');
}

function loadAvailableFarmers() {
    onSnapshot(collection(db, 'users'), (snapshot) => {
        const list = $('#available-farmers');
        if (!list) return;
        list.innerHTML = '';
        snapshot.docs.forEach(docSnap => {
            const user = docSnap.data();
            if (user.uid !== currentUser.uid) {
                const isOnline = user.status === 'online';
                const item = document.createElement('div');
                item.className = 'biz-item';
                item.onclick = () => startChat(user.uid, user.name);
                item.innerHTML = `
                    <div style="position: relative;">
                        <img src="${user.profilePic || 'images/default_profile.png'}" style="width:45px; height:45px; border-radius:50%; object-fit:cover;">
                        <div style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: ${isOnline ? '#4caf50' : '#757575'}; border: 2px solid var(--hr-bg);"></div>
                    </div>
                    <div style="flex:1;">
                        <b>${user.name}</b><br>
                        <small style="color:${isOnline ? 'var(--hr-green)' : '#777'}">${isOnline ? 'Online' : 'Offline'}</small>
                    </div>`;
                list.appendChild(item);
            }
        });
    });
}

window.startChat = (targetUid, targetName) => {
    activeChatId = [currentUser.uid, targetUid].sort().join('_');
    $('#chatting-with-name').innerText = targetName;
    $('#active-chat-window').style.display = 'flex';
    loadMessages();
};

window.closeChat = () => $('#active-chat-window').style.display = 'none';

window.sendMessage = async () => {
    const text = $('#chat-input').value.trim();
    if (!text || !activeChatId) return;
    await addDoc(collection(db, 'chats', activeChatId, 'messages'), {
        senderId: currentUser.uid,
        text: text,
        timestamp: serverTimestamp()
    });
    $('#chat-input').value = '';
};

function loadMessages() {
    const q = query(collection(db, 'chats', activeChatId, 'messages'), orderBy('timestamp', 'asc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#chat-messages');
        container.innerHTML = '';
        snapshot.docs.forEach(docSnap => {
            const msg = docSnap.data();
            const isMe = msg.senderId === currentUser.uid;
            const msgDiv = document.createElement('div');
            msgDiv.style = `align-self: ${isMe ? 'flex-end' : 'flex-start'}; background: ${isMe ? 'var(--hr-green)' : '#333'}; padding: 10px; border-radius: 12px; max-width: 80%; color: white; margin-bottom: 5px;`;
            msgDiv.innerHTML = msg.text;
            container.appendChild(msgDiv);
        });
        container.scrollTop = container.scrollHeight;
    });
}

function setupNotifications() {
    const q = query(collection(db, 'notifications'), where('recipientUID', '==', currentUser?.uid), where('read', '==', false));
    onSnapshot(q, snap => {
        const badge = $('#notif-count');
        if (badge) {
            badge.innerText = snap.docs.length;
            badge.style.display = snap.docs.length > 0 ? 'block' : 'none';
        }
    });
}

window.logout = async () => {
    if (currentUser) await updateDoc(doc(db, 'users', currentUser.uid), { status: 'offline' });
    signOut(auth).then(() => location.reload());
};
