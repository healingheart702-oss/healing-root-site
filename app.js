import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// --- YOUR FIREBASE CONFIG ---
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

// --- SELECTORS ---
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let currentUser = null;
let currentProfile = null;

// --- 1. GOOGLE LOGIN LOGIC ---
window.loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);

        // If it's a first-time login, create the profile
        if (!snap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                profilePic: user.photoURL || 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                bio: "Just joined Healing Social!",
                status: 'online',
                followers: [],
                following: []
            });
        }
    } catch (err) {
        console.error(err);
        alert("Google Login Failed. Check your Firebase console settings.");
    }
};

// --- 2. AUTH OBSERVER (REAL-TIME PROFILE SYNC) ---
onAuthStateChanged(auth, async user => {
    if (user) {
        currentUser = user;
        // Listen for profile changes (Name, Bio, Pictures)
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

// --- 3. UI SYNC (PROFESSIONAL FEEL) ---
function syncUI(profile) {
    // Update all avatars on the page
    $$('.user-avatar-sync').forEach(img => img.src = profile.profilePic);
    $('#story-my-pic').src = profile.profilePic;
    $('#my-menu-pic').src = profile.profilePic;
    
    // Update profile view
    $('#my-profile-name').innerText = profile.name;
    $('#display-name-header').innerText = profile.name;
    $('#display-name-top').innerText = profile.name;
    $('#display-bio').innerText = profile.bio;
    $('#profile-pic-preview').src = profile.profilePic;
    $('#cover-pic-preview').src = profile.coverPic;
    $('#follower-count').innerHTML = `<b>${profile.followers?.length || 0}</b> followers`;
    $('#following-count').innerHTML = `<b>${profile.following?.length || 0}</b> following`;
}

// --- 4. REAL-TIME FEED & COMMENTS ---
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
                    <div><b>${post.userName}</b><br><small style="color:gray">Just now</small></div>
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
                        <input type="text" id="cinput-${pid}" class="composer-input" placeholder="Write a comment...">
                        <button onclick="postComment('${pid}')" class="btn-green" style="padding:5px 15px;">Post</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

function renderComments(comments) {
    return comments.map(c => `
        <div style="font-size:13px; margin-bottom:5px;">
            <b style="color:var(--hr-green)">${c.userName}</b> ${c.text}
        </div>
    `).join('');
}

// --- 5. ACTIONS ---
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
    $(`#${viewName}-view`).style.display = 'block';
};

window.logout = () => signOut(auth).then(() => location.reload());
