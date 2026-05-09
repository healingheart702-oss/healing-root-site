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
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02"; // Your specific Admin UID
const ADMIN_EMAIL = "healingheart702@gmail.com"; 

let currentUser = null;
let currentProfile = null;

// --- 1. AUTH & GOOGLE FIX ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                syncUI(currentProfile);
                loadDiscovery();
                loadNotifications();
                loadFriendChats();
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
                location: "Earth"
            });
        }
    } catch (err) { alert("Google Sync Error: " + err.message); }
};

// --- 2. NAVIGATION & DISCOVERY ---
function loadDiscovery() {
    onSnapshot(query(collection(db, 'users'), limit(20)), snap => {
        const container = $('#discovery-users');
        if(!container) return;
        container.innerHTML = '';
        snap.forEach(d => {
            const u = d.data();
            if(u.uid === currentUser.uid) return;
            const div = document.createElement('div');
            div.className = "discovery-card";
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

// --- 3. FEED, REACTIONS & EDITING ---
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
    
    // Check if user reacted
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
        ${post.content ? `<img src="${post.content}" class="post-media" style="width:100%; max-height:400px; object-fit:cover;">` : ''}
        
        <div style="padding:8px 12px; display:flex; border-top:1px solid var(--hr-divider);">
            <div class="post-action-btn" style="position:relative;">
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

window.handleReaction = async (pid, emoji) => {
    const postRef = doc(db, 'posts', pid);
    await updateDoc(postRef, {
        [`reactions.${currentUser.uid}`]: emoji
    });
};

window.postOptionsMenu = (pid, currentText) => {
    const action = confirm("Choose Action:\nOK to EDIT\nCancel to DELETE");
    if(action) {
        const newText = prompt("Edit your post:", currentText);
        if(newText) updateDoc(doc(db, 'posts', pid), { text: newText });
    } else {
        if(confirm("Delete this post permanently?")) deleteDoc(doc(db, 'posts', pid));
    }
};

// --- 4. COMMENTS & REPLIES FIX ---
window.toggleComments = (pid) => {
    const section = $(`#comments-${pid}`);
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
};

window.addComment = async (pid) => {
    const input = $(`#input-${pid}`);
    if(!input.value.trim()) return;
    await addDoc(collection(db, 'posts', pid, 'comments'), {
        uid: currentUser.uid,
        userName: currentProfile.name,
        userPic: currentProfile.profilePic,
        text: input.value,
        timestamp: serverTimestamp()
    });
    input.value = '';
};

function loadComments(pid) {
    onSnapshot(query(collection(db, 'posts', pid, 'comments'), orderBy('timestamp', 'asc')), snap => {
        const list = $(`#list-${pid}`);
        if(!list) return;
        list.innerHTML = '';
        snap.forEach(d => {
            const c = d.data();
            const div = document.createElement('div');
            div.style = "margin-bottom:10px; display:flex; gap:8px;";
            div.innerHTML = `
                <img src="${c.userPic}" style="width:30px; height:30px; border-radius:50%;">
                <div style="flex:1;">
                    <div style="background:var(--hr-hover); padding:8px 12px; border-radius:15px; display:inline-block;">
                        <b style="font-size:12px; cursor:pointer;" onclick="smartNavigate('${c.uid}')">${c.userName}</b><br>${c.text}
                    </div>
                    <div style="font-size:11px; margin-left:10px; margin-top:3px; color:var(--hr-secondary);">
                        <span style="cursor:pointer;" onclick="replyToComment('${pid}', '${d.id}', '${c.userName}')">Reply</span>
                    </div>
                    <div id="replies-${d.id}" style="margin-left:20px; border-left:1px solid var(--hr-divider); padding-left:10px;"></div>
                </div>
            `;
            list.appendChild(div);
            loadReplies(pid, d.id);
        });
    });
}

window.replyToComment = async (pid, cid, name) => {
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
    onSnapshot(query(collection(db, 'posts', pid, 'comments', cid, 'replies'), orderBy('timestamp', 'asc')), snap => {
        const box = $(`#replies-${cid}`);
        if(!box) return;
        box.innerHTML = '';
        snap.forEach(d => {
            const r = d.data();
            box.innerHTML += `<div style="font-size:12px; margin-top:5px; color:var(--hr-text);"><b>${r.userName}</b> ${r.text}</div>`;
        });
    });
}

// --- 5. FRIENDS & ADMIN SYSTEM ---
window.sendFriendRequest = async (targetUid) => {
    await addDoc(collection(db, 'notifications'), {
        to: targetUid,
        from: currentUser.uid,
        fromName: currentProfile.name,
        fromPic: currentProfile.profilePic,
        type: 'friend_request',
        timestamp: serverTimestamp()
    });
    alert("Friend Request Sent!");
};

function loadNotifications() {
    onSnapshot(query(collection(db, 'notifications'), where('to', '==', currentUser.uid)), snap => {
        const list = $('#notifications-list');
        if(!list) return;
        list.innerHTML = '';
        snap.forEach(d => {
            const n = d.data();
            const div = document.createElement('div');
            div.style = "padding:12px; background:var(--hr-card); margin-bottom:8px; display:flex; align-items:center; gap:10px; border-radius:8px;";
            div.innerHTML = `
                <img src="${n.fromPic}" style="width:45px; height:45px; border-radius:50%;">
                <div style="flex:1;"><b>${n.fromName}</b> sent a request</div>
                <button class="bg-blue" style="padding:6px 12px; border-radius:5px; border:none; color:white;" onclick="acceptFriend('${n.from}', '${d.id}')">Confirm</button>
            `;
            list.appendChild(div);
        });
    });
}

window.acceptFriend = async (fUid, nid) => {
    await updateDoc(doc(db, 'users', currentUser.uid), { friends: arrayUnion(fUid) });
    await updateDoc(doc(db, 'users', fUid), { friends: arrayUnion(currentUser.uid) });
    await deleteDoc(doc(db, 'notifications', nid));
    alert("Request Accepted!");
};

window.contactAdmin = () => {
    smartNavigate(ADMIN_UID);
};

// --- 6. REELS FIX (Working Comedy) ---
window.loadReels = () => {
    const container = $('#reels-container');
    if (!container) return;
    const comedyVideos = ['5S0_9W8G28', 'D4X9_qL0G33', '8_X33N_6Y8I', 'm_Wv2P66vXk']; 

    container.innerHTML = comedyVideos.map(id => `
        <div class="reel-video-container" style="background:#000; height:calc(100vh - 130px); scroll-snap-align: start;">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${id}" frameborder="0"></iframe>
        </div>
    `).join('');
};

// --- HELPER FUNCTIONS ---
function syncUI(p) {
    if ($('#profile-name')) $('#profile-name').innerText = p.name;
    const pic = p.profilePic || 'images/default_profile.png';
    $$('.user-avatar-sync').forEach(img => img.src = pic);
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = p.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
}

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
    const d = await res.json();
    return d.secure_url;
}

window.viewUserProfile = async (uid) => {
    const d = await getDoc(doc(db, 'users', uid));
    if(!d.exists()) return;
    const u = d.data();
    window.showView('user-profile');
    $('#external-profile-content').innerHTML = `
        <div style="text-align:center; padding:30px 15px; background:var(--hr-card);">
            <img src="${u.profilePic}" style="width:110px; height:110px; border-radius:50%; border:3px solid var(--fb-blue);">
            <h2 style="margin:10px 0;">${u.name}</h2>
            <p style="color:var(--hr-secondary);">${u.bio || ''}</p>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="btn-full bg-blue" onclick="sendFriendRequest('${uid}')">Add Friend</button>
                <button class="btn-full bg-gray" onclick="alert('Chat active with friends only!')">Message</button>
            </div>
        </div>
    `;
};

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
        reactions: {},
        timestamp: serverTimestamp()
    });
    $('#post-text').value = '';
    window.closePostModal();
};

$('#site-refresh-btn').onclick = () => location.reload();
