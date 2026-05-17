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
const ADMIN_EMAIL = "healingheart702@gmail.com"; // Your Master Admin Email

let currentUser = null;
let currentProfile = null;
let isSignUpMode = false;

// Helper function to calculate real-time human-readable stamps
function formatTimeAgo(timestamp) {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// --- 1. AUTHENTICATION LOGIC ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                syncUI(currentProfile);
                initProfileFeed();
                checkAdminStatus();
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

function checkAdminStatus() {
    if (currentUser.email === ADMIN_EMAIL) {
        if ($('#admin-delete-btn')) $('#admin-delete-btn').style.display = 'block';
    }
}

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
                bio: "New to Healing Social",
                phone: "",
                whatsapp: "",
                location: "Earth"
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
                bio: "Using Healing Social with Google",
                location: "Earth"
            });
        }
    } catch (err) { console.error(err); }
};

window.logout = () => { if(confirm("Logout?")) signOut(auth).then(() => location.reload()); };

// --- 2. UI SYNCING & PROFILE EDITS ---
function syncUI(profile) {
    if ($('#profile-name')) $('#profile-name').innerText = profile.name;
    if ($('#menu-user-name')) $('#menu-user-name').innerText = profile.name;
    if ($('#profile-bio')) $('#profile-bio').innerText = profile.bio || "";
    
    // Pro fields
    if ($('#p-location')) $('#p-location').innerText = `${profile.state || ''}, ${profile.country || 'Earth'}`;
    if ($('#p-phone-link')) {
        $('#p-phone-link').innerText = profile.phone || "Add Phone";
        $('#p-phone-link').href = `tel:${profile.phone}`;
    }
    if ($('#p-wa-link')) {
        $('#p-wa-link').href = profile.whatsapp || "#";
    }

    const pic = profile.profilePic || 'images/default_profile.png';
    $$('.user-avatar-sync').forEach(img => img.src = pic);
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = profile.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
}

window.saveProfileEdits = async () => {
    const data = {
        name: $('#edit-name').value,
        bio: $('#edit-bio').value,
        phone: $('#edit-phone').value,
        whatsapp: $('#edit-wa').value,
        state: $('#edit-state').value,
        country: $('#edit-country').value
    };
    await updateDoc(doc(db, 'users', currentUser.uid), data);
    window.closeEditModal();
};

window.openEditModal = () => {
    $('#edit-modal').style.display = 'flex';
    $('#edit-name').value = currentProfile.name;
    $('#edit-bio').value = currentProfile.bio || "";
    $('#edit-phone').value = currentProfile.phone || "";
    $('#edit-wa').value = currentProfile.whatsapp || "";
    $('#edit-state').value = currentProfile.state || "";
    $('#edit-country').value = currentProfile.country || "";
};

// --- PHOTO EDITING AND CLOUDINARY STORAGE UPDATES ---
window.uploadNewProfilePic = async (input) => {
    const file = input.files[0];
    if (!file) return;
    try {
        const url = await uploadToCloudinary(file);
        await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url });
    } catch (e) { alert("Upload failed: " + e.message); }
};

window.uploadCoverPic = async (input) => {
    const file = input.files[0];
    if (!file) return;
    try {
        const url = await uploadToCloudinary(file);
        await updateDoc(doc(db, 'users', currentUser.uid), { coverPic: url });
    } catch (e) { alert("Upload failed: " + e.message); }
};

// --- 3. REELS (FUNNY COMEDY FOCUS) ---
window.loadReels = () => {
    const container = $('#reels-container');
    if (!container) return;
    
    // Extracted Funny/Comedy Shorts
    const funnyShorts = ['m_Wv2P66vXk', '3_X33N_6Y8I', 'xZ39_pS0G28', 'D4X9_qL0G33']; 

    container.innerHTML = funnyShorts.map(id => `
        <div class="reel-video-container" style="background:#000; height:calc(100vh - 65px); position:relative;">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=0&controls=0&loop=1&playlist=${id}" frameborder="0" allowfullscreen style="height:100%;"></iframe>
            <div style="position:absolute; bottom:80px; left:15px; text-shadow: 2px 2px 4px #000;">
                <b style="font-size:18px;">@FunnyHealing</b>
                <p>Healing Comedy Feed 😂</p>
            </div>
        </div>
    `).join('');
};

// --- 4. FEED, REACTIONS & CLICKABLE PROFILES ---
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
        container.innerHTML = '<h3 style="padding:15px; border-top:1px solid var(--hr-divider);">Your Posts</h3>';
        snap.forEach(d => renderPost(container, d.data(), d.id));
    });
}

function renderPost(container, post, pid) {
    const isAdmin = currentUser.email === ADMIN_EMAIL;
    const isOwner = currentUser.uid === post.uid;
    const card = document.createElement('div');
    card.className = 'post-card';
    card.style.background = 'var(--hr-card)';
    card.style.marginBottom = '10px';
    
    // Calculate real-time human readable time stamp
    const timeDisplay = formatTimeAgo(post.timestamp);
    
    card.innerHTML = `
        <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; align-items:center; cursor:pointer;" onclick="viewUserProfile('${post.uid}')">
                <img src="${post.userPic}" class="avatar-small">
                <div>
                    <b>${post.userName}</b><br>
                    <small style="color:var(--hr-secondary);">${timeDisplay}</small>
                </div>
            </div>
            ${(isAdmin || isOwner) ? `<i class="fa-solid fa-ellipsis" onclick="showPostMenu('${pid}', ${isOwner})" style="cursor:pointer; color:gray;"></i>` : ''}
        </div>
        <div style="padding:0 12px 12px;">${post.text}</div>
        ${post.content ? `<img src="${post.content}" class="post-media">` : ''}
        
        <div style="padding:5px 12px; display:flex; gap:10px; color:var(--hr-secondary); font-size:13px;">
            <span>${post.reactionCount || 0} Reactions</span> • <span style="cursor:pointer;" onclick="toggleComments('${pid}')">Comments</span>
        </div>

        <div style="padding:5px 12px; border-top:1px solid var(--hr-divider); display:flex;">
            <div class="post-action-btn">
                <span id="my-react-display-${pid}">👍 Like</span>
                <div class="reactions-box">
                    <span onclick="react('${pid}', '👍')">👍</span>
                    <span onclick="react('${pid}', '❤️')">❤️</span>
                    <span onclick="react('${pid}', '🥰')">🥰</span>
                    <span onclick="react('${pid}', '😂')">😂</span>
                    <span onclick="react('${pid}', '😮')">😮</span>
                    <span onclick="react('${pid}', '😢')">😢</span>
                    <span onclick="react('${pid}', '😡')">😡</span>
                </div>
            </div>
            <div class="post-action-btn" onclick="toggleComments('${pid}')"><i class="fa-regular fa-comment"></i> Comment</div>
        </div>
        <div id="comments-${pid}" class="comment-section" style="display:none;">
            <div id="list-${pid}"></div>
            <div style="display:flex; gap:10px; padding-top:10px; align-items:center;">
                <img class="user-avatar-sync" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                <input id="input-${pid}" placeholder="Write a comment..." style="flex:1; background:var(--hr-hover); border:none; padding:10px; border-radius:20px; color:white; outline:none;">
                <button onclick="addComment('${pid}')" style="background:none; border:none; color:var(--fb-blue); font-weight:bold; cursor:pointer;">Post</button>
            </div>
        </div>
    `;
    container.appendChild(card);
    loadComments(pid);

    // Dynamic UI listener to check if current logged-in user already left a specific reaction on this post
    if (currentUser) {
        onSnapshot(doc(db, 'posts', pid, 'reactions', currentUser.uid), (snap) => {
            const displayBtn = $(`#my-react-display-${pid}`);
            if (displayBtn) {
                if (snap.exists()) {
                    displayBtn.innerText = `${snap.data().type}`;
                    displayBtn.style.color = 'var(--fb-blue)';
                } else {
                    displayBtn.innerText = '👍 Like';
                    displayBtn.style.color = 'var(--hr-secondary)';
                }
            }
        });
    }
}

// --- 5. COMMENT & REPLY LOGIC ---
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
            const commId = d.id;
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.gap = '8px';
            div.style.marginBottom = '12px';
            div.style.alignItems = 'flex-start';
            
            const commentTimeDisplay = formatTimeAgo(c.timestamp);
            
            div.innerHTML = `
                <img src="${c.userPic || 'images/default_profile.png'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; margin-top:2px;">
                <div style="flex:1;">
                    <div class="comment-bubble">
                        <span style="font-weight:700; font-size:13px; color:white; cursor:pointer;" onclick="viewUserProfile('${c.uid}')">${c.userName}</span>
                        <span style="font-size:14px; color:var(--hr-text); margin-top:2px; white-space:pre-wrap;">${c.text}</span>
                    </div>
                    <div class="comment-meta-actions">
                        <span>${commentTimeDisplay}</span>
                        <span onclick="alert('Liked comment!')">Like</span>
                        <span onclick="replyTo('${pid}', '${commId}', '${c.userName}')">Reply</span>
                    </div>
                    <div id="replies-${commId}" class="reply-line" style="display:none;"></div>
                </div>`;
            list.appendChild(div);
            loadReplies(pid, commId);
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
        if(snap.empty) {
            box.style.display = 'none';
            return;
        }
        box.style.display = 'block';
        box.innerHTML = '';
        snap.forEach(d => {
            const r = d.data();
            box.innerHTML += `<div style="font-size:13px; margin-top:6px; background:var(--hr-hover); padding:6px 10px; border-radius:14px; display:inline-block; max-width:90%;"><b style="cursor:pointer;" onclick="viewUserProfile('${r.uid}')">${r.userName}</b> ${r.text}</div>`;
        });
    });
}

// --- 6. ACTIONS & ADMIN TOOLS ---
window.react = async (pid, emoji) => {
    if (!currentUser) return;
    const reactDocRef = doc(db, 'posts', pid, 'reactions', currentUser.uid);
    const reactSnap = await getDoc(reactDocRef);

    if (reactSnap.exists()) {
        const currentReactionType = reactSnap.data().type;
        if (currentReactionType === emoji) {
            // User clicked the exact same reaction icon: remove it entirely
            await deleteDoc(reactDocRef);
            await updateDoc(doc(db, 'posts', pid), {
                reactionCount: increment(-1)
            });
        } else {
            // User changed to a completely different reaction element: swap it out without increasing count
            await setDoc(reactDocRef, { type: emoji, timestamp: serverTimestamp() });
        }
    } else {
        // First time reacting to this post: write single entry and safely increment overall metric
        await setDoc(reactDocRef, { type: emoji, timestamp: serverTimestamp() });
        await updateDoc(doc(db, 'posts', pid), { 
            reactionCount: increment(1) 
        });
    }
};

window.viewUserProfile = async (targetUid) => {
    if (currentUser && targetUid === currentUser.uid) {
        showView('profile');
        return;
    }
    const userDoc = await getDoc(doc(db, 'users', targetUid));
    if(!userDoc.exists()) return;
    const u = userDoc.data();
    showView('user-profile');
    
    const bannerImg = u.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    const profileImg = u.profilePic || 'images/default_profile.png';
    
    $('#external-profile-content').innerHTML = `
        <div style="background:var(--hr-card); padding-bottom:15px;">
            <div style="height:180px; background:#333; position:relative;">
                <img src="${bannerImg}" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" onclick="openMediaLightbox(this.src)">
            </div>
            <div style="margin-top:-50px; padding:0 15px;">
                <img src="${profileImg}" style="width:110px; height:110px; border-radius:50%; border:4px solid black; object-fit: cover; cursor:pointer;" onclick="openMediaLightbox(this.src)">
                <h2 style="margin:10px 0 5px 0;">${u.name}</h2>
                <p style="color:var(--hr-secondary); margin:0;临">${u.bio || 'No bio yet'}</p>
            </div>
            <div class="profile-info-grid" style="margin-top:10px;">
                <div class="info-item"><i class="fa-solid fa-location-dot"></i> <span>${u.state || ''}, ${u.country || 'Earth'}</span></div>
                ${u.phone ? `<div class="info-item"><i class="fa-solid fa-phone"></i> <a href="tel:${u.phone}" style="color:var(--fb-blue); text-decoration:none;">${u.phone}</a></div>` : ''}
                ${u.whatsapp ? `<div class="info-item"><i class="fa-brands fa-whatsapp"></i> <a href="${u.whatsapp}" target="_blank" style="color:#25d366; text-decoration:none;">WhatsApp Chat</a></div>` : ''}
            </div>
            <div style="padding: 0 15px; display:flex; gap:10px; margin-top:15px;">
                <button class="btn-full bg-blue" style="margin:0;">Add Friend</button>
                <button class="btn-full bg-gray" style="margin:0;">Message</button>
            </div>
        </div>
        <div id="external-posts"></div>
    `;
    const q = query(collection(db, 'posts'), where('uid', '==', targetUid), orderBy('timestamp', 'desc'));
    onSnapshot(q, s => {
        const targetContainer = $('#external-posts');
        if (!targetContainer) return;
        targetContainer.innerHTML = '';
        s.forEach(d => renderPost(targetContainer, d.data(), d.id));
    });
};

window.showPostMenu = async (pid, isOwner) => {
    const choice = confirm(isOwner ? "Edit or Delete your post?" : "Admin: Delete this post?");
    if (choice) {
        if(confirm("Confirm deletion?")) await deleteDoc(doc(db, 'posts', pid));
    }
};

window.adminManageUsers = async () => {
    const uidToDelete = prompt("Enter the User ID to delete account:");
    if(uidToDelete && confirm("Permanently delete this user account?")) {
        await deleteDoc(doc(db, 'users', uidToDelete));
        alert("User removed from database.");
    }
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
        timestamp: serverTimestamp(),
        reactionCount: 0
    });
    $('#post-text').value = '';
    window.closePostModal();
};

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
    const d = await res.json();
    return d.secure_url;
}

$('#site-refresh-btn').onclick = () => location.reload();
window.toggleComments = (pid) => {
    const el = $(`#comments-${pid}`);
    if(el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};
