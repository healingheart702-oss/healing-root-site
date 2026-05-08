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
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                syncUI(currentProfile);
                initProfileFeed();
            }
        });
        $('#auth-modal').style.display = 'none';
        $('#main-app').style.display = 'block';
        initFeed();
        loadDiscoveryUsers();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

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
                bio: "Agro-enthusiast"
            });
        }
    } catch (err) { console.error(err); }
};

window.logout = () => { if(confirm("Logout?")) signOut(auth).then(() => location.reload()); };

// --- 2. UI SYNCING ---
function syncUI(profile) {
    if ($('#profile-name')) $('#profile-name').innerText = profile.name;
    if ($('#menu-user-name')) $('#menu-user-name').innerText = profile.name;
    if ($('#profile-bio')) $('#profile-bio').innerText = profile.bio || "";
    const pic = profile.profilePic || 'images/default_profile.png';
    $$('.user-avatar-sync').forEach(img => img.src = pic);
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = profile.coverPic || '';
}

window.editProfile = async () => {
    const n = prompt("New Name:", currentProfile.name);
    const b = prompt("New Bio:", currentProfile.bio);
    if(n) await updateDoc(doc(db, 'users', currentUser.uid), { name: n, bio: b });
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

function initProfileFeed() {
    const q = query(collection(db, 'posts'), where('uid', '==', currentUser.uid), orderBy('timestamp', 'desc'));
    onSnapshot(q, snap => {
        const container = $('#user-own-posts');
        if(!container) return;
        container.innerHTML = '<h3 style="padding:15px;">My Timeline</h3>';
        snap.forEach(d => renderPost(container, d.data(), d.id));
    });
}

function renderPost(container, post, pid) {
    const isAdmin = currentUser.uid === ADMIN_UID;
    const isOwner = currentUser.uid === post.uid;
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
        <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; align-items:center;">
                <img src="${post.userPic}" class="avatar-small">
                <b>${post.userName}</b>
            </div>
            ${(isAdmin || isOwner) ? `<i class="fa-solid fa-trash" onclick="deletePost('${pid}')" style="cursor:pointer; color:gray;"></i>` : ''}
        </div>
        <div style="padding:0 12px 12px;">${post.text}</div>
        ${post.content ? `<img src="${post.content}" style="width:100%;">` : ''}
        
        <div style="padding:10px 12px; border-top:1px solid var(--hr-divider); display:flex; gap:15px; position:relative;">
            <div class="post-action-btn" style="position:relative; cursor:pointer;">
                <span><i class="fa-regular fa-thumbs-up"></i> ${post.reactionType || 'Like'}</span>
                <div class="reactions-box">
                    <span onclick="react('${pid}', '👍')">👍</span>
                    <span onclick="react('${pid}', '❤️')">❤️</span>
                    <span onclick="react('${pid}', '😂')">😂</span>
                    <span onclick="react('${pid}', '😮')">😮</span>
                    <span onclick="react('${pid}', '😢')">😢</span>
                    <span onclick="react('${pid}', '😡')">😡</span>
                </div>
            </div>
            <span onclick="toggleComments('${pid}')" style="cursor:pointer;"><i class="fa-regular fa-comment"></i> Comment</span>
        </div>
        <div id="comments-${pid}" class="comment-section" style="display:none;">
            <div id="list-${pid}"></div>
            <div style="display:flex; gap:5px; margin-top:10px;">
                <input id="input-${pid}" placeholder="Write a comment..." style="flex:1; background:var(--hr-hover); border:none; padding:8px; border-radius:15px; color:white;">
                <button onclick="addComment('${pid}')" style="background:none; border:none; color:var(--fb-blue); font-weight:bold;">Post</button>
            </div>
        </div>
    `;
    container.appendChild(card);
    loadComments(pid);
}

// --- 4. REACTIONS & COMMENTS LOGIC ---
window.react = async (pid, emoji) => {
    await updateDoc(doc(db, 'posts', pid), { reactionType: emoji });
};

window.toggleComments = (pid) => {
    const el = $(`#comments-${pid}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.addComment = async (pid) => {
    const text = $(`#input-${pid}`).value;
    if(!text) return;
    await addDoc(collection(db, 'posts', pid, 'comments'), {
        uid: currentUser.uid,
        userName: currentProfile.name,
        userPic: currentProfile.profilePic,
        text: text,
        timestamp: serverTimestamp()
    });
    $(`#input-${pid}`).value = '';
};

function loadComments(pid) {
    const q = query(collection(db, 'posts', pid, 'comments'), orderBy('timestamp', 'asc'));
    onSnapshot(q, snap => {
        const list = $(`#list-${pid}`);
        if(!list) return;
        list.innerHTML = '';
        snap.forEach(d => {
            const c = d.data();
            list.innerHTML += `
                <div style="margin-bottom:8px;">
                    <div style="display:flex; gap:8px;">
                        <img src="${c.userPic}" style="width:30px; height:30px; border-radius:50%;">
                        <div style="background:var(--hr-hover); padding:8px; border-radius:12px; font-size:13px;">
                            <b>${c.userName}</b><br>${c.text}
                        </div>
                    </div>
                    <div style="margin-left:45px; font-size:11px; color:var(--hr-secondary); margin-top:2px;">
                        <span onclick="replyTo('${pid}', '${d.id}', '${c.userName}')" style="cursor:pointer; font-weight:bold;">Reply</span>
                    </div>
                    <div id="replies-${d.id}" style="margin-left:40px; margin-top:5px;"></div>
                </div>`;
            loadReplies(pid, d.id);
        });
    });
}

window.replyTo = async (pid, cid, name) => {
    const txt = prompt(`Reply to ${name}:`);
    if(!txt) return;
    await addDoc(collection(db, 'posts', pid, 'comments', cid, 'replies'), {
        uid: currentUser.uid,
        userName: currentProfile.name,
        text: txt,
        timestamp: serverTimestamp()
    });
};

function loadReplies(pid, cid) {
    const q = query(collection(db, 'posts', pid, 'comments', cid, 'replies'), orderBy('timestamp', 'asc'));
    onSnapshot(q, snap => {
        const box = $(`#replies-${cid}`);
        if(!box) return;
        box.innerHTML = '';
        snap.forEach(d => {
            const r = d.data();
            box.innerHTML += `<div style="font-size:12px; margin-bottom:4px;"><b>${r.userName}</b> ${r.text}</div>`;
        });
    });
}

// --- 5. POSTING & HELPERS ---
window.submitPost = async () => {
    const t = $('#post-text').value;
    const f = $('#post-file-input').files[0];
    const url = f ? await uploadToCloudinary(f) : "";
    if(!t && !url) return;
    await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        userName: currentProfile.name,
        userPic: currentProfile.profilePic,
        text: t,
        content: url,
        timestamp: serverTimestamp(),
        reactionType: 'Like'
    });
    $('#post-text').value = '';
    window.closePostModal();
};

window.deletePost = async (pid) => { if(confirm("Delete?")) await deleteDoc(doc(db, 'posts', pid)); };

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
    const d = await res.json();
    return d.secure_url;
}

function loadDiscoveryUsers() {
    const q = query(collection(db, 'users'), limit(8));
    onSnapshot(q, snap => {
        const scroller = $('#discovery-scroller');
        if(!scroller) return;
        scroller.innerHTML = '<div style="display:flex; overflow-x:auto; gap:10px; padding:10px;"></div>';
        const inner = scroller.firstChild;
        snap.forEach(d => {
            const u = d.data();
            if(u.uid === currentUser.uid) return;
            inner.innerHTML += `
                <div style="min-width:100px; text-align:center; background:var(--hr-card); padding:10px; border-radius:10px; border:1px solid var(--hr-divider);">
                    <img src="${u.profilePic}" style="width:50px; height:50px; border-radius:50%;">
                    <div style="font-size:11px; margin-top:5px; font-weight:bold;">${u.name.split(' ')[0]}</div>
                </div>`;
        });
    });
}
