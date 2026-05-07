import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where 
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

let currentUser = null;
let currentProfile = null;
let isSignUpMode = false;

// --- 1. AUTH TOGGLE LOGIC ---
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

// --- 2. LOGIN & SIGNUP HANDLING ---
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
                followers: [],
                following: []
            });
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (err) {
        alert(err.message);
    }
};

// --- 3. GOOGLE LOGIN ---
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
                followers: [],
                following: []
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
    $('#follower-count').innerHTML = `<b>${profile.followers?.length || 0}</b> followers`;
    $('#following-count').innerHTML = `<b>${profile.following?.length || 0}</b> following`;
}

// --- 6. REAL-TIME FEED ---
function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#feed-items');
        container.innerHTML = '';
        snapshot.docs.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div style="padding:12px; display:flex; gap:10px; align-items:center;">
                    <img src="${post.userPic}" style="width:40px; height:40px; border-radius:50%;">
                    <div><b>${post.userName}</b><br><small style="color:gray">Real-time</small></div>
                </div>
                <div style="padding:0 12px 12px;">${post.text}</div>
                ${post.content ? `<img src="${post.content}" style="width:100%">` : ''}
                <div style="padding:10px; border-top:1px solid var(--hr-divider); display:flex; gap:15px;">
                    <span style="cursor:pointer" onclick="handleLike('${pid}')">👍 Like</span>
                    <span style="cursor:pointer" onclick="document.getElementById('cinput-${pid}').focus()">💬 Comment</span>
                </div>
                <div style="background:#1a1a1a; padding:10px;">
                    <div id="comment-list-${pid}">${renderComments(post.comments || [])}</div>
                    <div style="display:flex; gap:5px; margin-top:10px;">
                        <input type="text" id="cinput-${pid}" class="composer-input" placeholder="Write a comment..." style="height:35px; font-size:12px;">
                        <button onclick="postComment('${pid}')" class="btn-green" style="padding:0 15px; height:35px; border-radius:18px;">Post</button>
                    </div>
                </div>`;
            container.appendChild(card);
        });
    });
}

function renderComments(comments) {
    return comments.map(c => `
        <div style="font-size:13px; margin-bottom:5px;">
            <b style="color:var(--hr-green)">${c.userName}</b> ${c.text}
        </div>`).join('');
}

// --- 7. ACTIONS ---
window.postComment = async (pid) => {
    const input = $(`#cinput-${pid}`);
    if(!input.value.trim()) return;
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

window.showView = (viewName) => {
    $$('.view').forEach(v => v.style.display = 'none');
    $$('.nav-item').forEach(i => i.classList.remove('active'));
    if($(`#${viewName}-view`)) $(`#${viewName}-view`).style.display = 'block';
};

window.logout = () => signOut(auth).then(() => location.reload());
