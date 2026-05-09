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
const ADMIN_EMAIL = "healingheart702@gmail.com"; 

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
                checkAdminStatus();
                loadDiscovery(); // NEW: Load suggested people
                loadNotifications(); // NEW: Check for friend requests
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
                friends: [],
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
                friends: [],
                location: "Earth"
            });
        }
    } catch (err) { alert("Google Login Error: " + err.message); }
};

window.logout = () => { if(confirm("Logout?")) signOut(auth).then(() => location.reload()); };

// --- 2. PROFILE & MEDIA FIXES ---
async function handleMediaUpload(file, field) {
    const url = await uploadToCloudinary(file);
    if(url) {
        await updateDoc(doc(db, 'users', currentUser.uid), { [field]: url });
        alert("Photo updated successfully!");
    }
}

window.uploadNewProfilePic = (input) => {
    if(input.files[0]) handleMediaUpload(input.files[0], 'profilePic');
};

window.uploadCoverPic = (input) => {
    if(input.files[0]) handleMediaUpload(input.files[0], 'coverPic');
};

function syncUI(profile) {
    if ($('#profile-name')) $('#profile-name').innerText = profile.name;
    if ($('#profile-bio')) $('#profile-bio').innerText = profile.bio || "";
    
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

// --- 3. DISCOVERY & FRIENDS SYSTEM ---
function loadDiscovery() {
    const q = query(collection(db, 'users'), limit(15));
    onSnapshot(q, snap => {
        const container = $('#discovery-users');
        if(!container) return;
        container.innerHTML = '';
        snap.forEach(d => {
            const u = d.data();
            if(u.uid === currentUser.uid) return;
            const div = document.createElement('div');
            div.style = "min-width:80px; text-align:center; cursor:pointer;";
            div.innerHTML = `
                <img src="${u.profilePic}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--fb-blue);">
                <div style="font-size:11px; margin-top:5px; white-space:nowrap; overflow:hidden;">${u.name.split(' ')[0]}</div>
            `;
            div.onclick = () => viewUserProfile(u.uid);
            container.appendChild(div);
        });
    });
}

window.sendFriendRequest = async (targetUid) => {
    await addDoc(collection(db, 'notifications'), {
        to: targetUid,
        from: currentUser.uid,
        fromName: currentProfile.name,
        fromPic: currentProfile.profilePic,
        type: 'friend_request',
        timestamp: serverTimestamp()
    });
    alert("Request Sent!");
};

function loadNotifications() {
    const q = query(collection(db, 'notifications'), where('to', '==', currentUser.uid), orderBy('timestamp', 'desc'));
    onSnapshot(q, snap => {
        const list = $('#notifications-list');
        if(!list) return;
        list.innerHTML = '';
        snap.forEach(d => {
            const n = d.data();
            list.innerHTML += `
                <div style="padding:15px; background:var(--hr-card); margin-bottom:5px; display:flex; align-items:center; gap:10px;">
                    <img src="${n.fromPic}" style="width:40px; height:40px; border-radius:50%;">
                    <div style="flex:1;"><b>${n.fromName}</b> sent a friend request.</div>
                    <button class="bg-blue" style="padding:5px 10px; border-radius:5px; color:white; border:none;" onclick="acceptFriend('${n.from}', '${d.id}')">Accept</button>
                </div>
            `;
        });
    });
}

window.acceptFriend = async (friendUid, notifId) => {
    await updateDoc(doc(db, 'users', currentUser.uid), { friends: arrayUnion(friendUid) });
    await updateDoc(doc(db, 'users', friendUid), { friends: arrayUnion(currentUser.uid) });
    await deleteDoc(doc(db, 'notifications', notifId));
    alert("Friend Added!");
};

// --- 4. ADMIN CONTACT ---
window.contactAdmin = () => {
    // Finds the admin in users collection to start chat
    viewUserProfile('gKwgPDNJgsdcApIJch6NM9bKmf02'); 
};

// --- 5. REELS FIX ---
window.loadReels = () => {
    const container = $('#reels-container');
    if (!container) return;
    const funnyShorts = ['m_Wv2P66vXk', '3_X33N_6Y8I', 'xZ39_pS0G28', 'D4X9_qL0G33']; 

    container.innerHTML = funnyShorts.map(id => `
        <div class="reel-video-container" style="background:#000; height:calc(100vh - 130px); position:relative; scroll-snap-align: start;">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=0&controls=0&loop=1&playlist=${id}" frameborder="0" allowfullscreen></iframe>
        </div>
    `).join('');
};

// --- 6. FEED & POST LOGIC (STAYED THE SAME) ---
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
    
    card.innerHTML = `
        <div style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; align-items:center; cursor:pointer;" onclick="viewUserProfile('${post.uid}')">
                <img src="${post.userPic}" class="avatar-small">
                <div>
                    <b>${post.userName}</b><br>
                    <small style="color:var(--hr-secondary);">Just now</small>
                </div>
            </div>
            ${(isAdmin || isOwner) ? `<i class="fa-solid fa-ellipsis" onclick="showPostMenu('${pid}', ${isOwner})" style="cursor:pointer; color:gray;"></i>` : ''}
        </div>
        <div style="padding:0 12px 12px;">${post.text}</div>
        ${post.content ? `<img src="${post.content}" class="post-media">` : ''}
        
        <div style="padding:5px 12px; border-top:1px solid var(--hr-divider); display:flex;">
            <div class="post-action-btn">👍 Like</div>
            <div class="post-action-btn" onclick="toggleComments('${pid}')"><i class="fa-regular fa-comment"></i> Comment</div>
        </div>
        <div id="comments-${pid}" class="comment-section" style="display:none;">
            <div id="list-${pid}"></div>
            <div style="display:flex; gap:10px; padding-top:10px;">
                <input id="input-${pid}" placeholder="Write a comment..." style="flex:1; background:var(--hr-hover); border:none; padding:10px; border-radius:20px; color:white;">
                <button onclick="addComment('${pid}')" style="background:none; border:none; color:var(--fb-blue); font-weight:bold;">Post</button>
            </div>
        </div>
    `;
    container.appendChild(card);
}

window.viewUserProfile = async (targetUid) => {
    const userDoc = await getDoc(doc(db, 'users', targetUid));
    if(!userDoc.exists()) return;
    const u = userDoc.data();
    window.showView('user-profile');
    $('#external-profile-content').innerHTML = `
        <div style="text-align:center; padding:20px;">
            <img src="${u.profilePic}" style="width:120px; height:120px; border-radius:50%; border:3px solid var(--fb-blue);">
            <h2>${u.name}</h2>
            <p>${u.bio || ''}</p>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="btn-full bg-blue" style="width:auto; padding:10px 30px;" onclick="sendFriendRequest('${targetUid}')">Add Friend</button>
                <button class="btn-full bg-gray" style="width:auto; padding:10px 30px;" onclick="alert('Chat coming soon')">Message</button>
            </div>
        </div>
        <div id="external-posts"></div>
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
        timestamp: serverTimestamp()
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
