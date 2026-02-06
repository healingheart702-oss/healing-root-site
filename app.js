import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, where } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// --- FIREBASE CONFIG (Already using your verified keys) ---
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

// --- GLOBAL STATE ---
let currentUser = null;

// --- VIEW CONTROLLER ---
window.showView = (id) => {
    $$('.view').forEach(v => v.style.display = 'none');
    $(`#${id}-view`).style.display = 'block';
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    // Set active class based on navigation...
};

// --- REAL-TIME FEED & REELS ---
function loadContent() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    
    onSnapshot(q, (snapshot) => {
        const feed = $('#feed-items');
        const reels = $('#reels-container');
        feed.innerHTML = '';
        reels.innerHTML = '';

        snapshot.docs.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const isOwner = post.uid === auth.currentUser.uid;
            const isVideo = post.type === 'video';

            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div class="post-header">
                    <div class="post-info">
                        <img src="${post.userPic || 'images/default_profile.png'}">
                        <b>${post.userName}</b>
                    </div>
                    ${isOwner ? `<div class="post-menu" onclick="toggleDrop('${pid}')">⋮
                        <div id="drop-${pid}" class="dropdown">
                            <button onclick="editPost('${pid}', '${post.text}')">Edit</button>
                            <button onclick="deletePost('${pid}')" style="color:red;">Delete</button>
                        </div>
                    </div>` : ''}
                </div>
                <div style="padding:10px;">${post.text}</div>
                ${isVideo ? 
                    `<video src="${post.content}" class="post-video" controls loop></video>` : 
                    `<img src="${post.content}" class="post-image">`}
                
                <div class="post-actions" style="display:flex; justify-content:space-around; padding:10px;">
                    <span onclick="likePost('${pid}')">👍 ${post.likes?.length || 0}</span>
                    <span onclick="toggleComments('${pid}')">💬 ${post.comments?.length || 0}</span>
                </div>

                <div id="comments-${pid}" style="display:none;" class="comment-section">
                    <div id="comment-list-${pid}"></div>
                    <div style="display:flex; gap:5px; margin-top:10px;">
                        <input type="text" id="input-${pid}" placeholder="Write a comment..." style="flex:1; background:#444; color:white; border:none; padding:8px; border-radius:5px;">
                        <button onclick="submitComment('${pid}')" style="background:var(--hr-green); color:white; border:none; padding:5px 10px; border-radius:5px;">Send</button>
                    </div>
                </div>
            `;

            if (isVideo) reels.appendChild(card.cloneNode(true));
            feed.appendChild(card);
            
            // Render Real-time Comments & Replies
            renderComments(pid, post.comments);
        });
    });
}

// --- REAL-TIME REPLIES ---
window.submitComment = async (pid) => {
    const input = $(`#input-${pid}`);
    if (!input.value) return;

    await updateDoc(doc(db, 'posts', pid), {
        comments: arrayUnion({
            id: Date.now().toString(),
            uid: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Farmer",
            text: input.value,
            replies: []
        })
    });
    input.value = '';
};

// --- REAL-TIME NOTIFICATIONS ---
function setupNotifications() {
    const q = query(collection(db, 'notifications'), where('recipientUID', '==', auth.currentUser.uid), where('read', '==', false));
    onSnapshot(q, (snap) => {
        const count = snap.docs.length;
        if(count > 0) {
            $('#notif-count').innerText = count;
            $('#notif-count').style.display = 'block';
        }
    });
}

// --- POST MANAGEMENT ---
window.deletePost = async (pid) => {
    if(confirm("Delete this post from Healing Root?")) {
        await deleteDoc(doc(db, 'posts', pid));
    }
};

window.editPost = async (pid, oldText) => {
    const newText = prompt("Edit your post:", oldText);
    if(newText) {
        await updateDoc(doc(db, 'posts', pid), { text: newText });
    }
};

// --- PROFILE MANAGEMENT ---
window.updateProfile = async () => {
    const name = $('#edit-name').value;
    const file = $('#edit-pic').files[0];
    // Use your Cloudinary logic here...
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { name: name });
    alert("Profile Updated");
};

onAuthStateChanged(auth, user => {
    if(user) {
        loadContent();
        setupNotifications();
    }
});

window.logout = () => signOut(auth).then(() => location.reload());
