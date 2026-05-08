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
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02"; // Your Master Admin ID

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
        $('#auth-modal').style.display = 'none';
        $('#main-app').style.display = 'block';
        initFeed();
        loadDiscoveryUsers(); // Home horizontal scroller
        listenToNotifications();
        listenToChats();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
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

// --- 3. DISCOVERY: PEOPLE YOU MAY KNOW (Horizontal Scroller) ---
function loadDiscoveryUsers() {
    const q = query(collection(db, 'users'), limit(20));
    onSnapshot(q, (snap) => {
        const scroller = $('#discovery-scroller');
        if (!scroller) return;
        scroller.innerHTML = `
            <div style="padding:10px 15px; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0; font-size:14px; color:var(--hr-secondary);">People you may know</h3>
                <span style="color:var(--fb-blue); font-size:12px;">See all</span>
            </div>
            <div id="scroller-inner" style="display:flex; overflow-x:auto; gap:12px; padding:0 15px 15px 15px; scrollbar-width: none;"></div>`;
        const inner = $('#scroller-inner');
        snap.forEach(userDoc => {
            const user = userDoc.data();
            if (user.uid === currentUser.uid) return; 
            inner.innerHTML += `
                <div style="background:var(--hr-card); border:1px solid var(--hr-divider); border-radius:10px; min-width:150px; text-align:center; padding:15px;">
                    <img src="${user.profilePic || 'images/default_profile.png'}" style="width:85px; height:85px; border-radius:50%; object-fit:cover; margin-bottom:10px;">
                    <p style="margin:0; font-size:14px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.name}</p>
                    <button onclick="sendFriendRequest('${user.uid}')" class="btn-full bg-blue" style="font-size:12px; padding:6px; margin-top:10px;">Add Friend</button>
                </div>`;
        });
    });
}

// --- 4. REELS (AUTOMATED VIDEO HUB) ---
window.loadReels = () => {
    const container = $('#reels-container');
    const autoVideos = [
        { url: "https://www.w3schools.com/html/mov_bbb.mp4", author: "AgroBot", info: "Perfect planting season! 🌱" },
        { url: "https://www.w3schools.com/html/movie.mp4", author: "ComedyHub", info: "Morning laughs 😂" }
    ];
    container.innerHTML = autoVideos.map(vid => `
        <div class="reel-video-container">
            <video src="${vid.url}" loop muted autoplay style="width:100%; height:100%; object-fit:cover;"></video>
            <div class="reel-actions">
                <div class="circle-icon" style="background:rgba(0,0,0,0.5)"><i class="fa-solid fa-heart"></i></div>
                <div class="circle-icon" style="background:rgba(0,0,0,0.5)"><i class="fa-solid fa-comment"></i></div>
                <div class="circle-icon" style="background:rgba(0,0,0,0.5)"><i class="fa-solid fa-share"></i></div>
            </div>
            <div style="position:absolute; bottom:25px; left:15px; text-shadow: 2px 2px 4px #000;">
                <b style="font-size:18px;">@${vid.author}</b>
                <p style="margin:5px 0 0 0; font-size:15px; color:white;">${vid.info}</p>
            </div>
        </div>
    `).join('');
};

// --- 5. ADMIN & USER POST ACTIONS ---
window.deletePost = async (pid, ownerUid) => {
    const isAdmin = currentUser.uid === ADMIN_UID;
    const isOwner = currentUser.uid === ownerUid;
    if (isAdmin || isOwner) {
        if (confirm(isAdmin ? "ADMIN: Delete this content?" : "Delete your post?")) {
            await deleteDoc(doc(db, 'posts', pid));
        }
    }
};

// --- 6. MESSAGING & NOTIFICATIONS ---
window.sendFriendRequest = async (targetUid) => {
    await addDoc(collection(db, 'notifications'), {
        recipientUID: targetUid,
        senderUID: currentUser.uid,
        senderName: currentProfile.name,
        type: "friend_request",
        timestamp: serverTimestamp()
    });
    alert("Request Sent!");
};

function listenToNotifications() {
    const q = query(collection(db, 'notifications'), where('recipientUID', '==', currentUser.uid));
    onSnapshot(q, snap => {
        const badge = $('#notif-badge');
        badge.style.display = snap.size > 0 ? 'block' : 'none';
        badge.innerText = snap.size;
        const list = $('#notifications-list');
        list.innerHTML = "";
        snap.forEach(d => {
            const n = d.data();
            list.innerHTML += `
                <div class="chat-row" style="border-bottom:1px solid #222;">
                    <img src="images/default_profile.png" class="avatar-small">
                    <div><b>${n.senderName}</b> sent you a friend request.</div>
                </div>`;
        });
    });
}

function listenToChats() {
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
    onSnapshot(q, snap => {
        const list = $('#chat-list');
        list.innerHTML = "";
        snap.forEach(d => {
            list.innerHTML += `
                <div class="chat-row">
                    <img src="images/default_profile.png" class="avatar-small">
                    <div><b>Active Connection</b><br><small style="color:var(--hr-green);">Online</small></div>
                </div>`;
        });
    });
}

// --- 7. THE FEED ENGINE (WITH LIKES/COMMENTS) ---
function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#feed-items');
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const hasLiked = post.likes && post.likes.includes(currentUser.uid);
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
                    ${(isAdmin || isOwner) ? `<i class="fa-solid fa-ellipsis" onclick="deletePost('${pid}', '${post.uid}')" style="cursor:pointer; color:var(--hr-secondary);"></i>` : ''}
                </div>
                <div style="padding:0 12px 12px;">${post.text}</div>
                ${post.content ? `<img src="${post.content}" style="width:100%; max-height:450px; object-fit:cover;">` : ''}
                
                <div style="padding:10px 12px; font-size:13px; color:var(--hr-secondary); display:flex; justify-content:space-between;">
                    <span>👍 ${post.likeCount || 0}</span>
                    <span>${(post.comments || []).length} Comments</span>
                </div>

                <div style="padding:5px; border-top:1px solid #333; display:flex;">
                    <button onclick="likePost('${pid}')" style="flex:1; background:transparent; border:none; color:${hasLiked ? 'var(--fb-blue)' : 'white'}; cursor:pointer; font-weight:bold; padding:10px;">
                        <i class="fa-regular fa-thumbs-up"></i> Like
                    </button>
                    <button onclick="$('#c-${pid}').focus()" style="flex:1; background:transparent; border:none; color:white; cursor:pointer; font-weight:bold;">
                        <i class="fa-regular fa-comment"></i> Comment
                    </button>
                </div>

                <div style="padding:10px; background:rgba(255,255,255,0.03);">
                    <div id="comments-${pid}">
                        ${(post.comments || []).map(c => `
                            <div style="margin-bottom:10px;">
                                <div style="display:inline-block; background:var(--hr-hover); padding:8px 12px; border-radius:15px; font-size:13px;">
                                    <b>${c.userName}</b><br>${c.text}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display:flex; gap:8px; margin-top:5px;">
                        <input id="c-${pid}" type="text" placeholder="Write a comment..." style="flex:1; background:var(--hr-hover); border:none; color:white; padding:8px 15px; border-radius:20px; outline:none;">
                        <button onclick="submitComment('${pid}')" class="bg-blue" style="border:none; color:white; padding:5px 12px; border-radius:15px; cursor:pointer;">Send</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

// --- 8. SUBMISSION HELPERS ---
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
        likes: [],
        likeCount: 0,
        timestamp: serverTimestamp(),
        comments: []
    });
    $('#post-text').value = '';
    window.closePostModal();
};

window.likePost = async (pid) => {
    const postRef = doc(db, 'posts', pid);
    const snap = await getDoc(postRef);
    const data = snap.data();
    if (data.likes && data.likes.includes(currentUser.uid)) {
        await updateDoc(postRef, { likes: arrayRemove(currentUser.uid), likeCount: increment(-1) });
    } else {
        await updateDoc(postRef, { likes: arrayUnion(currentUser.uid), likeCount: increment(1) });
    }
};

window.submitComment = async (pid) => {
    const input = $(`#c-${pid}`);
    if (!input.value.trim()) return;
    await updateDoc(doc(db, 'posts', pid), {
        comments: arrayUnion({
            uid: currentUser.uid,
            userName: currentProfile.name,
            text: input.value,
            timestamp: Date.now()
        })
    });
    input.value = '';
};

// --- AUTH UI HANDLERS ---
window.toggleAuthMode = () => {
    isSignUpMode = !isSignUpMode;
    $('#auth-name').style.display = isSignUpMode ? 'block' : 'none';
    $('#auth-submit-btn').innerText = isSignUpMode ? 'Create Account' : 'Log In';
    $('#auth-toggle').innerText = isSignUpMode ? 'Switch to ' + (isSignUpMode ? 'Log In' : 'Sign Up');
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
                bio: "Hello, I am new here!"
            });
        } else { await signInWithEmailAndPassword(auth, email, password); }
    } catch (err) { alert(err.message); }
};

window.logout = () => signOut(auth).then(() => location.reload());

// --- NAV OVERRIDE ---
const originalShowView = window.showView;
window.showView = (v) => {
    originalShowView(v);
    if(v === 'reels') loadReels();
};
