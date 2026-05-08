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
const googleProvider = new GoogleAuthProvider();

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
        listenToChats();
    } else {
        if($('#auth-modal')) $('#auth-modal').style.display = 'flex';
        if($('#main-app')) $('#main-app').style.display = 'none';
    }
});

// FIXED: This now matches the IDs in your screenshots to stop the "Loading" bug
function syncUI(profile) {
    const pic = profile.profilePic || 'images/default_profile.png';
    const cover = profile.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    const name = profile.name || "User";

    $$('.user-avatar-sync').forEach(img => img.src = pic);
    
    // Sync Name & Bio across Menu and Profile tabs
    if ($('#profile-name')) $('#profile-name').innerText = name;
    if ($('#menu-user-name')) $('#menu-user-name').innerText = name;
    if ($('#profile-bio')) $('#profile-bio').innerText = profile.bio || "No bio set.";
    
    // Sync Images
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = cover;
}

// --- 3. DISCOVERY: PEOPLE YOU MAY KNOW ---
function loadDiscoveryUsers() {
    const q = query(collection(db, 'users'), limit(20));
    onSnapshot(q, (snap) => {
        const scroller = $('#discovery-scroller');
        if (!scroller) return;
        scroller.innerHTML = `
            <div style="padding:10px 15px; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0; font-size:14px; color:var(--hr-secondary);">People you may know</h3>
            </div>
            <div id="scroller-inner" style="display:flex; overflow-x:auto; gap:12px; padding:0 15px 15px 15px; scrollbar-width: none;"></div>`;
        const inner = $('#scroller-inner');
        snap.forEach(userDoc => {
            const user = userDoc.data();
            if (user.uid === currentUser.uid) return; 
            inner.innerHTML += `
                <div style="background:var(--hr-card); border:1px solid var(--hr-divider); border-radius:10px; min-width:150px; text-align:center; padding:15px;">
                    <img src="${user.profilePic || 'images/default_profile.png'}" style="width:80px; height:80px; border-radius:50%; object-fit:cover;">
                    <p style="margin:10px 0; font-size:14px; font-weight:bold; overflow:hidden; text-overflow:ellipsis;">${user.name}</p>
                    <button onclick="sendFriendRequest('${user.uid}')" class="btn-full bg-blue" style="font-size:12px; padding:6px;">Add Friend</button>
                </div>`;
        });
    });
}

// --- 4. REELS (FIXED: Direct MP4 Links for lively playback) ---
window.loadReels = () => {
    const container = $('#reels-container');
    if (!container) return;

    const autoVideos = [
        { url: "https://v1.pexels.com/video-files/3752533/3752533-uhd_1440_2560_25fps.mp4", author: "AgroTrends" },
        { url: "https://v1.pexels.com/video-files/2853795/2853795-uhd_1440_2732_30fps.mp4", author: "HealingRoot" },
        { url: "https://v1.pexels.com/video-files/4462615/4462615-uhd_1440_2560_25fps.mp4", author: "FarmLife" }
    ];

    container.innerHTML = autoVideos.map(vid => `
        <div class="reel-video-container" style="height:100vh; position:relative; background:#000;">
            <video src="${vid.url}" loop muted autoplay playsinline style="width:100%; height:100%; object-fit:cover;"></video>
            <div class="reel-actions">
                <div class="circle-icon"><i class="fa-solid fa-heart"></i></div>
                <div class="circle-icon"><i class="fa-solid fa-comment"></i></div>
            </div>
            <div style="position:absolute; bottom:100px; left:20px; color:white; z-index:5;">
                <b style="font-size:18px;">@${vid.author}</b>
                <p>Developing Agriculture in Nigeria 🇳🇬</p>
            </div>
        </div>
    `).join('');
};

// --- 5. PROFILE EDITING (BIO, NAME, PHOTOS) ---
window.editProfileField = async (field) => {
    const currentVal = field === 'name' ? currentProfile.name : currentProfile.bio;
    const newVal = prompt(`Enter new ${field}:`, currentVal);
    if (newVal !== null) {
        await updateDoc(doc(db, 'users', currentUser.uid), { [field]: newVal });
    }
};

window.uploadPhoto = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const url = await uploadToCloudinary(file);
        if (url) {
            const updateKey = type === 'profile' ? 'profilePic' : 'coverPic';
            await updateDoc(doc(db, 'users', currentUser.uid), { [updateKey]: url });
            alert(`${type} picture updated!`);
        }
    };
    input.click();
};

// --- 6. ADMIN & FEED ---
window.deletePost = async (pid, ownerUid) => {
    if (currentUser.uid === ADMIN_UID || currentUser.uid === ownerUid) {
        if (confirm("Delete this content?")) await deleteDoc(doc(db, 'posts', pid));
    }
};

function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#feed-items');
        if (!container) return;
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            container.innerHTML += `
                <div class="post-card">
                    <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; gap:10px; align-items:center;">
                            <img src="${post.userPic}" class="avatar-small">
                            <b>${post.userName}</b>
                        </div>
                        ${(currentUser.uid === ADMIN_UID || currentUser.uid === post.uid) ? `<i class="fa-solid fa-ellipsis" onclick="deletePost('${pid}', '${post.uid}')"></i>` : ''}
                    </div>
                    <div style="padding:0 12px 12px;">${post.text}</div>
                    ${post.content ? `<img src="${post.content}" style="width:100%;">` : ''}
                </div>`;
        });
    });
}

// --- 7. NAVIGATION & LOGOUT ---
window.showView = (v) => {
    $$('.view-section').forEach(s => s.style.display = 'none');
    const target = $(`#view-${v}`);
    if (target) target.style.display = 'block';
    if (v === 'reels') loadReels();
};

window.logout = () => {
    if(confirm("Are you sure you want to log out?")) {
        signOut(auth).then(() => location.reload());
    }
};

// --- RE-USE YOUR EXISTING SUBMISSION LOGIC ---
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
        timestamp: serverTimestamp(),
        likeCount: 0,
        comments: []
    });
    $('#post-text').value = '';
    window.closePostModal();
};

// AUTH UI HANDLERS
window.toggleAuthMode = () => {
    isSignUpMode = !isSignUpMode;
    $('#auth-name').style.display = isSignUpMode ? 'block' : 'none';
    $('#auth-submit-btn').innerText = isSignUpMode ? 'Create Account' : 'Log In';
};

$('#auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#auth-email').value, password = $('#auth-password').value, name = $('#auth-name').value;
    try {
        if (isSignUpMode) {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', cred.user.uid), {
                uid: cred.user.uid, name: name, email,
                profilePic: 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                bio: "Welcome to my profile!"
            });
        } else { await signInWithEmailAndPassword(auth, email, password); }
    } catch (err) { alert(err.message); }
};
