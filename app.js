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

// --- INITIALIZATION ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const CLOUDINARY_PRESET = "unsigned_upload"; 
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02"; 

let currentUser = null;
let currentProfile = null;
let isSignUpMode = false;

// --- 1. AUTHENTICATION LOGIC ---
onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                syncUI(currentProfile);
                initProfileFeed(); // Load your posts on your profile
            }
        });
        $('#auth-modal').style.display = 'none';
        $('#main-app').style.display = 'block';
        initFeed();
        loadDiscoveryUsers();
        listenToNotifications();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

window.toggleAuthMode = () => {
    isSignUpMode = !isSignUpMode;
    $('#auth-name').style.display = isSignUpMode ? 'block' : 'none';
    $('#auth-submit-btn').innerText = isSignUpMode ? 'Create Account' : 'Log In';
    $('#auth-toggle').innerText = isSignUpMode ? 'Already have an account? Log In' : 'Create New Account';
};

$('#auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#auth-email').value;
    const password = $('#auth-password').value;
    const name = $('#auth-name').value;

    try {
        if (isSignUpMode) {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', cred.user.uid), {
                uid: cred.user.uid,
                name: name,
                email: email,
                profilePic: 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                bio: "New to Healing Social"
            });
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (err) { alert(err.message); }
};

window.loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                profilePic: user.photoURL || 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                bio: "Using Healing Social with Google"
            });
        }
    } catch (err) { alert("Google Sign-In failed."); }
};

window.logout = () => {
    if(confirm("Are you sure you want to log out?")) {
        signOut(auth).then(() => location.reload());
    }
};

// --- 2. UI SYNCING ---
function syncUI(profile) {
    const pic = profile.profilePic || 'images/default_profile.png';
    const cover = profile.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    
    $$('.user-avatar-sync').forEach(img => img.src = pic);
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = cover;
    if ($('#profile-name')) $('#profile-name').innerText = profile.name;
    if ($('#menu-user-name')) $('#menu-user-name').innerText = profile.name;
    if ($('#profile-bio')) $('#profile-bio').innerText = profile.bio || "";
}

// --- 3. REELS (YOUTUBE AUTOMATED) ---
window.loadReels = () => {
    const container = $('#reels-container');
    if (!container) return;
    
    // Add any YouTube video IDs here to automate the feed
    const videoIDs = ['dQw4w9WgXcQ', '3752533', '4462615']; 

    container.innerHTML = videoIDs.map(id => `
        <div class="reel-video-container" style="background:#000; height:calc(100vh - 65px); overflow:hidden;">
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&rel=0" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                style="height:100%; width:100%; pointer-events: none;">
            </iframe>
            <div style="position:absolute; bottom:30px; left:15px; z-index:10; text-shadow: 2px 2px 4px #000;">
                <b style="font-size:18px; color:white;">@HealingRootAgro</b>
                <p style="color:white; margin-top:5px;">Professional Agro Insights 🌿</p>
            </div>
        </div>
    `).join('');
};

// --- 4. FEED & PROFILE POSTS ---
function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#feed-items');
        if(!container) return;
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            renderPostCard(container, post, docSnap.id);
        });
    });
}

function initProfileFeed() {
    const q = query(collection(db, 'posts'), where('uid', '==', currentUser.uid), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snap) => {
        const container = $('#user-own-posts');
        if (!container) return;
        container.innerHTML = '<h3 style="padding:15px; border-bottom:1px solid #333;">Your Posts</h3>';
        snap.forEach(docSnap => {
            renderPostCard(container, docSnap.data(), docSnap.id);
        });
    });
}

function renderPostCard(container, post, pid) {
    const isAdmin = currentUser.uid === ADMIN_UID;
    const isOwner = currentUser.uid === post.uid;
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
        <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; align-items:center;">
                <img src="${post.userPic || 'images/default_profile.png'}" class="avatar-small">
                <b>${post.userName}</b>
            </div>
            ${(isAdmin || isOwner) ? `<i class="fa-solid fa-trash" onclick="deletePost('${pid}')" style="color:var(--hr-secondary); cursor:pointer;"></i>` : ''}
        </div>
        <div style="padding:0 12px 12px;">${post.text}</div>
        ${post.content ? `<img src="${post.content}" style="width:100%; max-height:400px; object-fit:cover;">` : ''}
    `;
    container.appendChild(card);
}

// --- 5. ACTIONS ---
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
        timestamp: serverTimestamp()
    });
    $('#post-text').value = '';
    window.closePostModal();
};

window.deletePost = async (pid) => {
    if (confirm("Delete this post?")) await deleteDoc(doc(db, 'posts', pid));
};

// --- 6. HELPERS (Cloudinary, Discovery, Notifications) ---
async function uploadToCloudinary(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
    const data = await res.json();
    return data.secure_url;
}

function loadDiscoveryUsers() {
    const q = query(collection(db, 'users'), limit(10));
    onSnapshot(q, snap => {
        const scroller = $('#discovery-scroller');
        if (!scroller) return;
        scroller.innerHTML = `<div style="display:flex; overflow-x:auto; gap:10px; padding:15px; scrollbar-width:none;"></div>`;
        const inner = scroller.firstChild;
        snap.forEach(d => {
            const u = d.data();
            if (u.uid === currentUser.uid) return;
            inner.innerHTML += `
                <div style="background:var(--hr-card); border:1px solid var(--hr-divider); border-radius:10px; min-width:120px; text-align:center; padding:10px;">
                    <img src="${u.profilePic}" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">
                    <p style="font-size:12px; margin:5px 0;">${u.name}</p>
                </div>`;
        });
    });
}

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
