import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where, limit 
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

// --- 2. AUTH TOGGLE LOGIC ---
window.toggleAuthMode = () => {
    isSignUpMode = !isSignUpMode;
    const nameInput = $('#auth-name');
    const submitBtn = $('#auth-submit-btn');
    const toggleLink = $('#auth-toggle');

    if (isSignUpMode) {
        nameInput.style.display = 'block';
        nameInput.required = true;
        submitBtn.innerText = 'Create Account';
        toggleLink.innerText = 'Already have an account? Log In';
    } else {
        nameInput.style.display = 'none';
        nameInput.required = false;
        submitBtn.innerText = 'Log In';
        toggleLink.innerText = "Don't have an account? Join Healing Social";
    }
};

// --- 3. LOGIN & SIGNUP HANDLING ---
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
                bio: "New to Healing Social!",
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
                bio: "Just joined Healing Social!",
                friends: []
            });
        }
    } catch (err) { alert("Google Auth Failed: " + err.message); }
};

// --- 4. AUTH OBSERVER ---
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
        loadDiscovery();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

// --- 5. UI SYNC ---
function syncUI(profile) {
    $$('.user-avatar-sync').forEach(img => img.src = profile.profilePic);
    $('#story-my-pic').src = profile.profilePic;
    $('#my-menu-pic').src = profile.profilePic;
    $('#my-profile-name').innerText = profile.name;
    $('#display-name-header').innerText = profile.name;
    $('#display-name-top').innerText = profile.name;
    $('#display-bio').innerText = profile.bio;
    $('#profile-pic-preview').src = profile.profilePic;
    $('#cover-pic-preview').src = profile.coverPic;
}

// --- 6. DISCOVERY (No Self-Friending) ---
function loadDiscovery() {
    const q = query(collection(db, 'users'), limit(50));
    onSnapshot(q, (snap) => {
        const list = $('#people-list');
        list.innerHTML = '';
        snap.forEach(userDoc => {
            const user = userDoc.data();
            if (user.uid === currentUser.uid) return; // Hide self

            const div = document.createElement('div');
            div.className = 'user-row';
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${user.profilePic}" style="width:45px; height:45px; border-radius:50%; object-fit:cover;">
                    <b>${user.name}</b>
                </div>
                <button class="btn-green" style="padding:5px 12px; font-size:12px;" onclick="sendFriendRequest('${user.uid}', '${user.name}')">Add Friend</button>
            `;
            list.appendChild(div);
        });
    });
}

// --- 7. PROFILE EDITS (Cloudinary) ---
window.uploadNewProfilePic = async (input) => {
    const file = input.files[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    if(url) await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url });
};

window.uploadCoverPic = async (input) => {
    const file = input.files[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    if(url) await updateDoc(doc(db, 'users', currentUser.uid), { coverPic: url });
};

window.editBio = async () => {
    const newBio = prompt("Enter your bio:", currentProfile.bio);
    if (newBio !== null) await updateDoc(doc(db, 'users', currentUser.uid), { bio: newBio });
};

// --- 8. FEED & POSTING ---
window.submitPost = async () => {
    const text = $('#post-text').value;
    const file = $('#post-file-input').files[0];
    let fileUrl = "";

    if (!text.trim() && !file) return;

    if (file) fileUrl = await uploadToCloudinary(file);

    await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        userName: currentProfile.name,
        userPic: currentProfile.profilePic,
        text: text,
        content: fileUrl,
        timestamp: serverTimestamp()
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
        snapshot.docs.forEach(docSnap => {
            const post = docSnap.data();
            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div style="padding:12px; display:flex; gap:10px; align-items:center;">
                    <img src="${post.userPic}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <div><b>${post.userName}</b></div>
                </div>
                <div style="padding:0 12px 12px;">${post.text}</div>
                ${post.content ? `<img src="${post.content}" style="width:100%">` : ''}`;
            container.appendChild(card);
        });
    });
}

window.showView = (viewName) => {
    $$('.view').forEach(v => v.style.display = 'none');
    $$('.nav-item').forEach(i => i.classList.remove('active'));
    if($(`#${viewName}-view`)) $(`#${viewName}-view`).style.display = 'block';
};

window.logout = () => signOut(auth).then(() => location.reload());
