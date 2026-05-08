import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where, limit, increment, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.appspot.com",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

// --- SETTINGS & ADMIN ---
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const CLOUDINARY_PRESET = "unsigned_upload"; 
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let currentUser = null;
let currentProfile = null;
let isSignUpMode = false;

// --- 1. CLOUDINARY UPLOAD HELPER ---
async function uploadToCloudinary(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    try {
        const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
        const data = await res.json();
        return data.secure_url;
    } catch (err) { return null; }
}

// --- 2. AUTH & ACCOUNT SETUP ---
onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                syncUI(currentProfile);
            }
        });
        if($('#auth-modal')) $('#auth-modal').style.display = 'none';
        if($('#main-app')) $('#main-app').style.display = 'block';
        initFeed();
        loadDiscoveryUsers();
        listenToNotifications();
    } else {
        if($('#auth-modal')) $('#auth-modal').style.display = 'flex';
        if($('#main-app')) $('#main-app').style.display = 'none';
    }
});

function syncUI(profile) {
    const pic = profile.profilePic || 'images/default_profile.png';
    const cover = profile.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    
    $$('.user-avatar-sync').forEach(img => img.src = pic);
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = cover;
    if ($('#profile-name')) $('#profile-name').innerText = profile.name;
    if ($('#menu-user-name')) $('#menu-user-name').innerText = profile.name;
    if ($('#profile-bio')) $('#profile-bio').innerText = profile.bio || "No bio set.";
}

// --- 3. PROFILE EDITING LOGIC ---
window.editProfile = async () => {
    const newName = prompt("Change Display Name:", currentProfile.name);
    const newBio = prompt("Change Bio:", currentProfile.bio || "");
    
    if (newName || newBio) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
            name: newName || currentProfile.name,
            bio: newBio || currentProfile.bio
        });
    }
};

window.uploadNewProfilePic = async (input) => {
    const file = input.files[0];
    const url = await uploadToCloudinary(file);
    if (url) {
        await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url });
        alert("Profile picture updated!");
    }
};

window.uploadCoverPic = async (input) => {
    const file = input.files[0];
    const url = await uploadToCloudinary(file);
    if (url) {
        await updateDoc(doc(db, 'users', currentUser.uid), { coverPic: url });
        alert("Cover photo updated!");
    }
};

// --- 4. REELS (HIGH-QUALITY AGRO CONTENT) ---
window.loadReels = () => {
    const container = $('#reels-container');
    if (!container) return;
    
    const agroVideos = [
        { url: "https://v1.pexels.com/video-files/3752533/3752533-uhd_1440_2560_25fps.mp4", author: "AgroTrends", info: "Innovative Cassava Planting 🌿" },
        { url: "https://v1.pexels.com/video-files/2853795/2853795-uhd_1440_2732_30fps.mp4", author: "HealingRoot", info: "Nurturing the soil." },
        { url: "https://v1.pexels.com/video-files/4462615/4462615-uhd_1440_2560_25fps.mp4", author: "FarmLife", info: "Harvest Season is here!" }
    ];

    container.innerHTML = agroVideos.map(vid => `
        <div class="reel-video-container">
            <video src="${vid.url}" loop muted autoplay playsinline style="width:100%; height:100%; object-fit:cover;"></video>
            <div class="reel-actions">
                <div class="circle-icon" style="background:rgba(0,0,0,0.5)"><i class="fa-solid fa-heart"></i></div>
                <div class="circle-icon" style="background:rgba(0,0,0,0.5)"><i class="fa-solid fa-comment"></i></div>
            </div>
            <div style="position:absolute; bottom:25px; left:15px; text-shadow: 2px 2px 4px #000; z-index:10;">
                <b style="font-size:18px;">@${vid.author}</b>
                <p style="margin:5px 0 0 0; font-size:15px; color:white;">${vid.info}</p>
            </div>
        </div>
    `).join('');
};

// --- 5. DISCOVERY & FEED ---
function loadDiscoveryUsers() {
    const q = query(collection(db, 'users'), limit(15));
    onSnapshot(q, (snap) => {
        const scroller = $('#discovery-scroller');
        if (!scroller) return;
        scroller.innerHTML = `<div id="scroller-inner" style="display:flex; overflow-x:auto; gap:12px; padding:15px; scrollbar-width: none;"></div>`;
        const inner = $('#scroller-inner');
        snap.forEach(userDoc => {
            const user = userDoc.data();
            if (user.uid === currentUser.uid) return; 
            inner.innerHTML += `
                <div style="background:var(--hr-card); border:1px solid var(--hr-divider); border-radius:10px; min-width:140px; text-align:center; padding:15px;">
                    <img src="${user.profilePic || 'images/default_profile.png'}" style="width:70px; height:70px; border-radius:50%; object-fit:cover;">
                    <p style="margin:10px 0; font-size:13px; font-weight:bold;">${user.name}</p>
                    <button onclick="sendFriendRequest('${user.uid}')" class="btn-full bg-blue" style="font-size:11px; padding:5px;">Add Friend</button>
                </div>`;
        });
    });
}

function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#feed-items');
        if(!container) return;
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const isOwnerOrAdmin = currentUser.uid === post.uid || currentUser.uid === ADMIN_UID;
            
            const card = document.createElement('div');
            card.className = 'post-card';
            card.style.background = 'var(--hr-card)';
            card.style.marginBottom = '10px';
            card.innerHTML = `
                <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <img src="${post.userPic || 'images/default_profile.png'}" class="avatar-small">
                        <b>${post.userName}</b>
                    </div>
                    ${isOwnerOrAdmin ? `<i class="fa-solid fa-trash" onclick="deletePost('${pid}', '${post.uid}')" style="cursor:pointer; color:var(--hr-secondary); font-size:14px;"></i>` : ''}
                </div>
                <div style="padding:0 12px 12px;">${post.text}</div>
                ${post.content ? `<img src="${post.content}" style="width:100%; max-height:400px; object-fit:cover;">` : ''}
                <div style="padding:10px 12px; border-top:1px solid var(--hr-divider); display:flex; gap:20px;">
                    <span onclick="likePost('${pid}')" style="cursor:pointer;"><i class="fa-regular fa-thumbs-up"></i> ${post.likeCount || 0}</span>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

// --- 6. ACTIONS ---
window.submitPost = async () => {
    const text = $('#post-text').value;
    const file = $('#post-file-input').files[0];
    let fileUrl = file ? await uploadToCloudinary(file) : "";
    if (!text.trim() && !fileUrl) return;

    await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        userName: currentProfile.name,
        userPic: currentProfile.profilePic,
        text: text,
        content: fileUrl,
        likeCount: 0,
        timestamp: serverTimestamp()
    });
    $('#post-text').value = '';
    window.closePostModal();
};

window.deletePost = async (pid, ownerUid) => {
    if (confirm("Delete this post?")) {
        await deleteDoc(doc(db, 'posts', pid));
    }
};

window.logout = () => {
    if(confirm("Logout?")) {
        signOut(auth).then(() => location.reload());
    }
};

function listenToNotifications() {
    const q = query(collection(db, 'notifications'), where('recipientUID', '==', currentUser.uid));
    onSnapshot(q, snap => {
        const badge = $('#notif-badge');
        if(badge) {
            badge.style.display = snap.size > 0 ? 'block' : 'none';
            badge.innerText = snap.size;
        }
    });
}
