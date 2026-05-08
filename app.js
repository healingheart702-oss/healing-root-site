import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, where, limit 
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
    if ($('#my-profile-name')) $('#my-profile-name').innerText = profile.name;
}

// --- 3. PROFILE EDITING (INSTANT UPDATES) ---
window.editProfileName = async () => {
    const newName = prompt("Enter your full name:", currentProfile.name);
    if (newName) {
        await updateDoc(doc(db, 'users', currentUser.uid), { name: newName });
        // After updating name, we must also update posts to show the new name
        alert("Name updated successfully!");
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
            if (user.uid === currentUser.uid) return; // Hide self

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

// --- 5. FEED & REAL-TIME COMMENTS ---
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
        comments: []
    });
    
    $('#post-text').value = '';
    $('#post-file-input').value = '';
    window.closePostModal();
};

function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#feed-items');
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div style="padding:12px; display:flex; gap:10px; align-items:center;">
                    <img src="${post.userPic || 'images/default_profile.png'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <div><b>${post.userName}</b></div>
                </div>
                <div style="padding:0 12px 12px;">${post.text}</div>
                ${post.content ? `<img src="${post.content}" style="width:100%">` : ''}
                <div style="padding:10px; border-top:1px solid #333; display:flex; gap:15px; font-size:14px;">
                    <span style="cursor:pointer">👍 Like</span>
                    <span style="cursor:pointer" onclick="$('#c-${pid}').focus()">💬 Comment</span>
                </div>
                <div style="padding:10px; background:#1a1a1a;">
                    <div id="comments-${pid}">${(post.comments || []).map(c => `<div style="font-size:12px; margin-bottom:4px;"><b style="color:#2e7d32">${c.userName}</b> ${c.text}</div>`).join('')}</div>
                    <div style="display:flex; gap:5px; margin-top:8px;">
                        <input id="c-${pid}" type="text" placeholder="Write a comment..." style="flex:1; background:#333; border:none; color:white; padding:8px; border-radius:15px; font-size:12px;">
                        <button onclick="submitComment('${pid}')" class="btn-green" style="padding:5px 10px; font-size:10px;">Post</button>
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
