import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, query, orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Your verified config
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

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// --- VIEW CONTROLLER ---
window.showView = (id) => {
    $$('.view').forEach(v => v.style.display = 'none');
    const target = $('#' + id + '-view');
    if (target) target.style.display = 'block';
    
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    // Set active icon based on click
};

// --- AUTH LISTENER ---
onAuthStateChanged(auth, user => {
    if (user) {
        $('#auth-modal').style.display = 'none';
        $('#main-app').style.display = 'block';
        loadFeed();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

$('#login-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, $('#login-email').value, $('#login-password').value);
    } catch (err) { alert("Login failed"); }
};

$('#logout-btn').onclick = () => signOut(auth);

// --- REAL-TIME FEED ENGINE ---
function loadFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    
    onSnapshot(q, (snapshot) => {
        const container = $('#feed-items');
        container.innerHTML = '';
        
        // 1. Add "People You May Know" section after 1st post
        let postCount = 0;

        snapshot.docs.forEach(docSnap => {
            const post = docSnap.data();
            const postId = docSnap.id;
            const isLiked = post.likes?.includes(auth.currentUser.uid);
            
            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div class="post-header">
                    <img src="images/default_profile.png">
                    <div>
                        <div style="font-weight:bold;">${post.userName || 'Farmer'}</div>
                        <div style="font-size:12px; color:var(--fb-secondary);">3h • 🌍</div>
                    </div>
                </div>
                <div style="padding:0 12px 12px 12px;">${post.text}</div>
                ${post.image ? `<img src="${post.image}" class="post-image">` : ''}
                
                <div style="padding:10px 12px; display:flex; justify-content:space-between; font-size:13px; color:var(--fb-secondary);">
                    <span>👍 ${post.likes?.length || 0}</span>
                    <span>${post.comments?.length || 0} comments • 2 shares</span>
                </div>
                
                <div class="post-actions">
                    <div class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${postId}', ${isLiked})">👍 Like</div>
                    <div class="action-btn" onclick="openComments('${postId}')">💬 Comment</div>
                    <div class="action-btn">↪️ Share</div>
                </div>
            `;
            container.appendChild(card);
            
            // Add PYMK after the first post like in your screenshot
            if (postCount === 0) {
                const pymk = document.createElement('div');
                pymk.className = 'pymk-section';
                pymk.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <b>People you may know</b>
                        <span>...</span>
                    </div>
                    <div class="pymk-list">
                        <div class="pymk-card">
                            <img src="images/coconut.JPG">
                            <b>Issa Bella</b>
                            <button class="add-btn">Add Friend</button>
                        </div>
                        <div class="pymk-card">
                            <img src="images/oilpalm.JPG">
                            <b>Omonike Hammed</b>
                            <button class="add-btn">Add Friend</button>
                        </div>
                    </div>
                `;
                container.appendChild(pymk);
            }
            postCount++;
        });
    });
}

// --- LIKE & COMMENT HELPERS ---
window.toggleLike = async (postId, currentlyLiked) => {
    const ref = doc(db, 'posts', postId);
    await updateDoc(ref, {
        likes: currentlyLiked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
    });
};
