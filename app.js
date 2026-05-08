import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where, limit, increment 
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

// --- CLOUDINARY CONFIG ---
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const CLOUDINARY_PRESET = "unsigned_upload"; 

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
    } catch (err) {
        console.error("Cloudinary Error:", err);
        return null;
    }
}

// --- 2. AUTH & ACCOUNT SETUP ---
onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user;
        // Real-time listener for current user's profile
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                syncUI(currentProfile);
            }
        });
        $('#auth-modal').style.display = 'none';
        $('#main-app').style.display = 'block';
        initFeed();
        loadDiscovery();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

function syncUI(profile) {
    const pic = profile.profilePic || 'images/default_profile.png';
    const cover = profile.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    
    // Sync all avatars across the site
    $$('.user-avatar-sync').forEach(img => img.src = pic);
    if ($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if ($('#cover-pic-preview')) $('#cover-pic-preview').src = cover;
    
    // Sync names and bio
    if ($('#display-name-header')) $('#display-name-header').innerText = profile.name;
    if ($('#display-bio')) $('#display-bio').innerText = profile.bio || "No bio set.";
}

// --- 3. PROFILE EDITING (INSTANT UPDATES) ---
window.editProfileName = async () => {
    const newName = prompt("Enter your full name:", currentProfile.name);
    if (newName) {
        await updateDoc(doc(db, 'users', currentUser.uid), { name: newName });
    }
};

window.editBio = async () => {
    const newBio = prompt("What's your bio?", currentProfile.bio);
    if (newBio !== null) {
        await updateDoc(doc(db, 'users', currentUser.uid), { bio: newBio });
    }
};

window.uploadNewProfilePic = async (input) => {
    const url = await uploadToCloudinary(input.files[0]);
    if (url) {
        await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url });
    }
};

window.uploadCoverPic = async (input) => {
    const url = await uploadToCloudinary(input.files[0]);
    if (url) {
        await updateDoc(doc(db, 'users', currentUser.uid), { coverPic: url });
    }
};

// --- 4. DISCOVERY: SHOW ALL USERS ---
function loadDiscovery() {
    const q = query(collection(db, 'users'), limit(50));
    onSnapshot(q, (snap) => {
        const list = $('#people-list');
        if (!list) return;
        list.innerHTML = '';
        snap.forEach(userDoc => {
            const user = userDoc.data();
            if (user.uid === currentUser.uid) return; 

            const div = document.createElement('div');
            div.className = 'user-row';
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${user.profilePic || 'images/default_profile.png'}" style="width:45px; height:45px; border-radius:50%; object-fit:cover;">
                    <b>${user.name}</b>
                </div>
                <button class="btn-green" style="padding:5px 12px; font-size:12px;">Add Friend</button>
            `;
            list.appendChild(div);
        });
    });
}

// --- 5. FEED, LIKES & REPLIES ---
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
    $('#post-file-input').value = '';
    window.closePostModal();
};

window.likePost = async (pid) => {
    const postRef = doc(db, 'posts', pid);
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();
    
    if (postData.likes && postData.likes.includes(currentUser.uid)) {
        await updateDoc(postRef, {
            likes: arrayRemove(currentUser.uid),
            likeCount: increment(-1)
        });
    } else {
        await updateDoc(postRef, {
            likes: arrayUnion(currentUser.uid),
            likeCount: increment(1)
        });
    }
};

function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#feed-items');
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const hasLiked = post.likes && post.likes.includes(currentUser.uid);
            
            const card = document.createElement('div');
            card.className = 'post-card';
            card.style.cssText = "background:var(--hr-card); margin-bottom:10px; border-bottom:1px solid var(--hr-divider);";
            
            card.innerHTML = `
                <div style="padding:12px; display:flex; gap:10px; align-items:center;">
                    <img src="${post.userPic || 'images/default_profile.png'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <div><b>${post.userName}</b></div>
                </div>
                <div style="padding:0 12px 12px;">${post.text}</div>
                ${post.content ? `<img src="${post.content}" style="width:100%; max-height:400px; object-fit:cover;">` : ''}
                
                <div style="padding:10px 12px; font-size:13px; color:var(--hr-secondary); display:flex; justify-content:space-between;">
                    <span>👍 ${post.likeCount || 0} Likes</span>
                    <span>${(post.comments || []).length} Comments</span>
                </div>

                <div style="padding:8px; border-top:1px solid #333; border-bottom:1px solid #333; display:flex; gap:5px;">
                    <button onclick="likePost('${pid}')" style="flex:1; background:transparent; border:none; color:${hasLiked ? 'var(--hr-green)' : 'white'}; cursor:pointer; font-weight:bold; padding:8px;">
                        ${hasLiked ? 'Liked' : '👍 Like'}
                    </button>
                    <button onclick="$('#c-${pid}').focus()" style="flex:1; background:transparent; border:none; color:white; cursor:pointer; font-weight:bold;">💬 Comment</button>
                </div>

                <div style="padding:10px; background:#161616;">
                    <div id="comments-${pid}">
                        ${(post.comments || []).map(c => `
                            <div style="margin-bottom:8px; display:flex; gap:8px;">
                                <div style="background:#333; padding:8px 12px; border-radius:15px; font-size:13px;">
                                    <b style="color:var(--hr-green); font-size:11px;">${c.userName}</b><br>${c.text}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display:flex; gap:5px; margin-top:10px;">
                        <input id="c-${pid}" type="text" placeholder="Write a comment..." style="flex:1; background:#222; border:1px solid #444; color:white; padding:8px 15px; border-radius:20px; font-size:13px; outline:none;">
                        <button onclick="submitComment('${pid}')" class="btn-green" style="padding:5px 15px; font-size:12px; width:auto; border-radius:15px;">Post</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

window.submitComment = async (pid) => {
    const input = $(`#c-${pid}`);
    if (!input.value.trim()) return;
    await updateDoc(doc(db, 'posts', pid), {
        comments: arrayUnion({
            userName: currentProfile.name,
            text: input.value,
            timestamp: Date.now()
        })
    });
    input.value = '';
};

// --- AUTH UI TOGGLE ---
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
    const fullName = $('#auth-name').value;
    try {
        if (isSignUpMode) {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', cred.user.uid), {
                uid: cred.user.uid,
                name: fullName,
                email: email,
                profilePic: 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                bio: "Welcome to my profile!",
                friends: []
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
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                profilePic: user.photoURL || 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                bio: "Joined via Google!",
                friends: []
            });
        }
    } catch (err) { alert(err.message); }
};

window.logout = () => signOut(auth).then(() => location.reload());
