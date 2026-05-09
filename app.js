import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence 
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

window.logout = () => {
    if(confirm("Log out of HEALING?")) {
        signOut(auth).then(() => {
            window.location.reload();
        });
    }
};

window.loginWithGoogle = async () => {
    try {
        await setPersistence(auth, browserLocalPersistence);
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
                friends: [],
                bio: "Healing Social Member",
                phone: "",
                waLink: "",
                state: "",
                country: "",
                location: "Earth"
            });
        }
    } catch (err) { alert("Login Error: " + err.message); }
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
    if(targetUid === currentUser.uid) {
        window.showView('profile');
    } else {
        viewUserProfile(targetUid);
    }
};

window.contactAdmin = () => {
    smartNavigate(ADMIN_UID);
};

// --- 3. FEED & REACTIONS ---
function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
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
    card.style = "background:var(--hr-card); margin-bottom:10px; border-radius:8px;";
    
    const userReact = post.reactions && post.reactions[currentUser.uid] ? post.reactions[currentUser.uid] : "👍 Like";

    card.innerHTML = `
        <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; align-items:center; cursor:pointer;" onclick="smartNavigate('${post.uid}')">
                <img src="${post.userPic}" class="avatar-small">
                <div><b>${post.userName}</b><br><small style="color:var(--hr-secondary);">Just now</small></div>
            </div>
            ${isOwner ? `<i class="fa-solid fa-ellipsis" onclick="postOptionsMenu('${pid}', '${post.text}')" style="cursor:pointer; padding:5px;"></i>` : ''}
        </div>
        <div style="padding:0 12px 12px; white-space: pre-wrap;">${post.text}</div>
        ${post.content ? (post.content.includes('.mp4') || post.content.includes('video') ? 
            `<video src="${post.content}" controls style="width:100%; max-height:400px;"></video>` : 
            `<img src="${post.content}" class="post-media" style="width:100%; max-height:400px; object-fit:cover;">`) : ''}
        
        <div style="padding:8px 12px; display:flex; border-top:1px solid var(--hr-divider); position:relative;">
            <div class="post-action-btn">
                <span id="react-display-${pid}">${userReact}</span>
                <div class="reactions-box">
                    <span onclick="handleReaction('${pid}', '👍')">👍</span>
                    <span onclick="handleReaction('${pid}', '❤️')">❤️</span>
                    <span onclick="handleReaction('${pid}', '😂')">😂</span>
                    <span onclick="handleReaction('${pid}', '😮')">😮</span>
                    <span onclick="handleReaction('${pid}', '😢')">😢</span>
                    <span onclick="handleReaction('${pid}', '😡')">😡</span>
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

// --- 4. REELS (User Videos + Comedy) ---
window.loadReels = () => {
    const container = $('#reels-container');
    if (!container) return;

    // Get videos from user posts first
    const vQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(10));
    onSnapshot(vQuery, snap => {
        container.innerHTML = '';
        
        snap.forEach(d => {
            const p = d.data();
            if(p.content && (p.content.includes('video') || p.content.includes('.mp4'))) {
                container.innerHTML += `
                    <div class="reel-video-container" style="background:#000; height:calc(100vh - 70px); scroll-snap-align: start; position:relative;">
                        <video src="${p.content}" autoplay loop muted style="width:100%; height:100%; object-fit:contain;"></video>
                        <div style="position:absolute; bottom:20px; left:15px; text-shadow:1px 1px 5px #000;"><b>@${p.userName}</b></div>
                    </div>`;
            }
        });

        // Add the YouTube comedy shorts
        const comedyVideos = ['5S0_9W8G28', 'D4X9_qL0G33', '8_X33N_6Y8I']; 
        comedyVideos.forEach(id => {
            container.innerHTML += `
                <div class="reel-video-container" style="background:#000; height:calc(100vh - 70px); scroll-snap-align: start;">
                    <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}" frameborder="0"></iframe>
                </div>`;
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
    alert("Profile Updated!");
};

window.uploadNewProfilePic = async (input) => {
    const url = await uploadToCloudinary(input.files[0]);
    await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url });
};

window.uploadCoverPic = async (input) => {
    const url = await uploadToCloudinary(input.files[0]);
    await updateDoc(doc(db, 'users', currentUser.uid), { coverPic: url });
};

// --- HELPERS ---
function syncUI(p) {
    if ($('#profile-name')) $('#profile-name').innerText = p.name;
    if ($('#menu-user-name')) $('#menu-user-name').innerText = p.name;
    if ($('#p-location')) $('#p-location').innerText = `${p.state || ''}, ${p.country || 'Earth'}`;
    
    const pic = p.profilePic || 'images/default_profile.png';
    $$('.user-avatar-sync').forEach(img => img.src = pic);
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = p.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    
    // Fill edit fields if modal is opened
    if($('#edit-name')) $('#edit-name').value = p.name || '';
    if($('#edit-bio')) $('#edit-bio').value = p.bio || '';
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
window.handleReaction = async (pid, emoji) => {
    await updateDoc(doc(db, 'posts', pid), { [`reactions.${currentUser.uid}`]: emoji });
};
window.toggleComments = (pid) => {
    const s = $(`#comments-${pid}`);
    s.style.display = s.style.display === 'none' ? 'block' : 'none';
};
window.addComment = async (pid) => {
    const i = $(`#input-${pid}`);
    if(!i.value.trim()) return;
    await addDoc(collection(db, 'posts', pid, 'comments'), {
        uid: currentUser.uid, userName: currentProfile.name, userPic: currentProfile.profilePic,
        text: i.value, timestamp: serverTimestamp()
    });
    i.value = '';
};
function loadComments(pid) {
    onSnapshot(query(collection(db, 'posts', pid, 'comments'), orderBy('timestamp', 'asc')), snap => {
        const l = $(`#list-${pid}`); if(!l) return; l.innerHTML = '';
        snap.forEach(d => {
            const c = d.data();
            l.innerHTML += `<div style="margin-bottom:8px; display:flex; gap:8px;">
                <img src="${c.userPic}" style="width:30px; height:30px; border-radius:50%;">
                <div style="background:var(--hr-hover); padding:8px; border-radius:12px; font-size:13px;"><b>${c.userName}</b><br>${c.text}</div>
            </div>`;
        });
    });
}
window.submitPost = async () => {
    const t = $('#post-text').value;
    const f = $('#post-file-input').files[0];
    const url = f ? await uploadToCloudinary(f) : "";
    if(!t && !url) return;
    await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid, userName: currentProfile.name, userPic: currentProfile.profilePic,
        text: t, content: url, reactions: {}, timestamp: serverTimestamp()
    });
    $('#post-text').value = '';
    window.closePostModal();
};
$('#site-refresh-btn').onclick = () => location.reload();
