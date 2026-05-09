import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, where, limit, deleteDoc
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

// --- 1. AUTH & PERSISTENCE ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                syncUI(currentProfile);
                loadDiscovery();
                loadNotifications();
            }
        });
        $('#auth-modal').style.display = 'none';
        $('#main-app').style.display = 'block';
        initFeed();
        loadReels(); 
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

// Handle Google Redirect Result (Fixes the "Cancelled Popup" error on iPhone)
getRedirectResult(auth).then(async (result) => {
    if (result && result.user) {
        const user = result.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid, name: user.displayName, email: user.email,
                profilePic: user.photoURL || 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                friends: [], bio: "Healing Social Member", phone: "",
                waLink: "", state: "", country: ""
            });
        }
    }
}).catch((err) => console.error("Redirect Error:", err));

window.loginWithGoogle = async () => {
    try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithRedirect(auth, googleProvider);
    } catch (err) { alert("Login Error: " + err.message); }
};

// --- EMAIL AUTH LOGIC ---
let isSignUpMode = false;
window.toggleAuthMode = () => {
    isSignUpMode = !isSignUpMode;
    $('#auth-name').style.display = isSignUpMode ? 'block' : 'none';
    $('#auth-submit-btn').innerText = isSignUpMode ? 'Create Account' : 'Log In';
    $('#auth-toggle').innerText = isSignUpMode ? 'Have an account? Log In' : 'Create New Account';
};

window.handleEmailAuth = async (e) => {
    e.preventDefault();
    const email = $('#auth-email').value;
    const pass = $('#auth-password').value;
    const name = $('#auth-name').value;

    try {
        if (isSignUpMode) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, 'users', res.user.uid), {
                uid: res.user.uid, name: name, email: email,
                profilePic: 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                friends: [], bio: "Healing Social Member", phone: "",
                waLink: "", state: "", country: ""
            });
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch (err) { alert(err.message); }
};

window.logout = () => {
    if(confirm("Log out of HEALING?")) {
        signOut(auth).then(() => { window.location.reload(); });
    }
};

// --- 2. DISCOVERY & NAVIGATION ---
function loadDiscovery() {
    onSnapshot(query(collection(db, 'users'), limit(20)), snap => {
        const container = $('#discovery-users');
        if(!container) return;
        container.innerHTML = '';
        snap.forEach(d => {
            const u = d.data();
            if(u.uid === currentUser.uid) return;
            const div = document.createElement('div');
            div.style = "min-width:90px; text-align:center; cursor:pointer; padding:5px;";
            div.innerHTML = `
                <img src="${u.profilePic}" style="width:65px; height:65px; border-radius:50%; object-fit:cover; border:2px solid var(--fb-blue);">
                <div style="font-size:12px; color:white; margin-top:5px; font-weight:600;">${u.name.split(' ')[0]}</div>
            `;
            div.onclick = () => smartNavigate(u.uid);
            container.appendChild(div);
        });
    });
}

window.smartNavigate = (targetUid) => {
    if(targetUid === currentUser.uid) window.showView('profile');
    else viewUserProfile(targetUid);
};

window.viewUserProfile = async (uid) => {
    const d = await getDoc(doc(db, 'users', uid));
    if(!d.exists()) return;
    const u = d.data();
    window.showView('user-profile');
    $('#external-profile-content').innerHTML = `
        <div style="text-align:center; padding:30px 15px; background:var(--hr-card);">
            <img src="${u.profilePic}" style="width:110px; height:110px; border-radius:50%; border:3px solid var(--fb-blue); object-fit:cover;">
            <h2 style="margin:10px 0;">${u.name}</h2>
            <p style="color:var(--hr-secondary);">${u.bio || ''}</p>
            <div style="display:flex; gap:10px; margin-top:20px; justify-content:center;">
                <button class="btn-full bg-blue" style="width:140px;" onclick="sendFriendRequest('${uid}')">Add Friend</button>
                <a href="${u.waLink || '#'}" class="btn-full bg-gray" style="width:140px; text-decoration:none; display:flex; align-items:center; justify-content:center;">WhatsApp</a>
            </div>
        </div>`;
};

window.contactAdmin = () => smartNavigate(ADMIN_UID);

// --- 3. FEED & REACTIONS ---
function initFeed() {
    onSnapshot(query(collection(db, 'posts'), orderBy('timestamp', 'desc')), (snapshot) => {
        const container = $('#feed-items');
        if(!container) return;
        container.innerHTML = '';
        snapshot.forEach(docSnap => renderPost(container, docSnap.data(), docSnap.id));
    });
}

function renderPost(container, post, pid) {
    const isOwner = currentUser.uid === post.uid;
    const card = document.createElement('div');
    card.className = 'post-card';
    const userReact = post.reactions && post.reactions[currentUser.uid] ? post.reactions[currentUser.uid] : "👍 Like";

    card.innerHTML = `
        <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; align-items:center; cursor:pointer;" onclick="smartNavigate('${post.uid}')">
                <img src="${post.userPic}" class="avatar-small">
                <div><b>${post.userName}</b><br><small style="color:var(--hr-secondary);">Just now</small></div>
            </div>
            ${isOwner ? `<i class="fa-solid fa-ellipsis" onclick="deleteDoc(doc(db, 'posts', '${pid}'))" style="cursor:pointer; padding:5px;"></i>` : ''}
        </div>
        <div style="padding:0 12px 12px; white-space: pre-wrap;">${post.text}</div>
        ${post.content ? (post.content.includes('video') ? 
            `<video src="${post.content}" controls style="width:100%; max-height:400px;"></video>` : 
            `<img src="${post.content}" class="post-media" style="width:100%; max-height:400px; object-fit:cover;">`) : ''}
        
        <div style="padding:8px 12px; display:flex; border-top:1px solid var(--hr-divider); position:relative;">
            <div class="post-action-btn">
                <span>${userReact}</span>
                <div class="reactions-box">
                    <span onclick="handleReaction('${pid}', '👍')">👍</span>
                    <span onclick="handleReaction('${pid}', '❤️')">❤️</span>
                    <span onclick="handleReaction('${pid}', '😂')">😂</span>
                </div>
            </div>
            <div class="post-action-btn" onclick="toggleComments('${pid}')"><i class="fa-regular fa-comment"></i> Comment</div>
        </div>
        <div id="comments-${pid}" class="comment-section" style="display:none; padding:10px;">
            <div id="list-${pid}"></div>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <input id="input-${pid}" placeholder="Write a comment..." style="flex:1; background:var(--hr-hover); border:none; padding:10px; border-radius:20px; color:white;">
                <button onclick="addComment('${pid}')" style="color:var(--fb-blue); border:none; background:none; font-weight:bold;">Post</button>
            </div>
        </div>
    `;
    container.appendChild(card);
    loadComments(pid);
}

// --- 4. REELS ---
window.loadReels = () => {
    const container = $('#reels-container');
    if (!container) return;
    onSnapshot(query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(15)), snap => {
        container.innerHTML = '';
        snap.forEach(d => {
            const p = d.data();
            if(p.content && p.content.includes('video')) {
                container.innerHTML += `
                    <div class="reel-video-container" style="background:#000; height:calc(100vh - 70px); scroll-snap-align: start; position:relative;">
                        <video src="${p.content}" autoplay loop muted style="width:100%; height:100%; object-fit:contain;"></video>
                        <div style="position:absolute; bottom:20px; left:15px; text-shadow:1px 1px 5px #000;"><b>@${p.userName}</b></div>
                    </div>`;
            }
        });
    });
};

// --- 5. PROFILE EDITING ---
window.saveProfileEdits = async () => {
    const up = {
        name: $('#edit-name').value,
        bio: $('#edit-bio').value,
        phone: $('#edit-phone').value,
        waLink: $('#edit-wa').value,
        state: $('#edit-state').value,
        country: $('#edit-country').value
    };
    await updateDoc(doc(db, 'users', currentUser.uid), up);
    window.closeEditModal();
};

// --- HELPERS ---
function syncUI(p) {
    if ($('#profile-name')) $('#profile-name').innerText = p.name;
    if ($('#menu-user-name')) $('#menu-user-name').innerText = p.name;
    if ($('#p-location')) $('#p-location').innerText = `${p.state || ''}, ${p.country || 'Earth'}`;
    if ($('#p-phone')) $('#p-phone').innerText = p.phone || 'Add Phone';
    if ($('#profile-bio')) $('#profile-bio').innerText = p.bio || '';
    
    const pic = p.profilePic || 'images/default_profile.png';
    $$('.user-avatar-sync').forEach(img => img.src = pic);
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = p.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    
    if($('#edit-name')) $('#edit-name').value = p.name || '';
    if($('#edit-bio')) $('#edit-bio').value = p.bio || '';
    if($('#edit-phone')) $('#edit-phone').value = p.phone || '';
    if($('#edit-wa')) $('#edit-wa').value = p.waLink || '';
    if($('#edit-state')) $('#edit-state').value = p.state || '';
    if($('#edit-country')) $('#edit-country').value = p.country || '';
}

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
    const d = await res.json();
    return d.secure_url;
}

// --- BOILERPLATE FUNCTIONS ---
window.handleReaction = async (pid, emoji) => { await updateDoc(doc(db, 'posts', pid), { [`reactions.${currentUser.uid}`]: emoji }); };
window.toggleComments = (pid) => { const s = $(`#comments-${pid}`); s.style.display = s.style.display === 'none' ? 'block' : 'none'; };
window.addComment = async (pid) => {
    const i = $(`#input-${pid}`); if(!i.value.trim()) return;
    await addDoc(collection(db, 'posts', pid, 'comments'), { uid: currentUser.uid, userName: currentProfile.name, userPic: currentProfile.profilePic, text: i.value, timestamp: serverTimestamp() });
    i.value = '';
};
function loadComments(pid) {
    onSnapshot(query(collection(db, 'posts', pid, 'comments'), orderBy('timestamp', 'asc')), snap => {
        const l = $(`#list-${pid}`); if(!l) return; l.innerHTML = '';
        snap.forEach(d => { const c = d.data(); l.innerHTML += `<div style="margin-bottom:8px; display:flex; gap:8px;"><img src="${c.userPic}" style="width:30px; height:30px; border-radius:50%;"><div style="background:var(--hr-hover); padding:8px; border-radius:12px; font-size:13px;"><b>${c.userName}</b><br>${c.text}</div></div>`; });
    });
}
window.submitPost = async () => {
    const t = $('#post-text').value; const f = $('#post-file-input').files[0];
    const url = f ? await uploadToCloudinary(f) : "";
    if(!t && !url) return;
    await addDoc(collection(db, 'posts'), { uid: currentUser.uid, userName: currentProfile.name, userPic: currentProfile.profilePic, text: t, content: url, reactions: {}, timestamp: serverTimestamp() });
    $('#post-text').value = ''; window.closePostModal();
};
window.uploadNewProfilePic = async (input) => { const url = await uploadToCloudinary(input.files[0]); await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url }); };
window.uploadCoverPic = async (input) => { const url = await uploadToCloudinary(input.files[0]); await updateDoc(doc(db, 'users', currentUser.uid), { coverPic: url }); };
$('#site-refresh-btn').onclick = () => location.reload();
