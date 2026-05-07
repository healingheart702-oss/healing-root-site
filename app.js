import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, deleteDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// ---------------------- CONFIGURATION ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.appspot.com",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let currentUser = null;
let currentProfile = null;
let activeChatId = null;

// ---------------------- VIEW MANAGEMENT ----------------------
window.showView = (viewId) => {
    $$('.view').forEach(v => v.style.display = 'none');
    const target = $(`#${viewId}-view`);
    if (target) target.style.display = 'block';
    
    if (viewId !== 'reels') {
        $$('video').forEach(v => v.pause());
    }

    $$('.nav-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`'${viewId}'`));
    });
};

// ---------------------- AUTH LOGIC ----------------------
let isLoginMode = true;
const authToggle = $('#auth-toggle');
if(authToggle) {
    authToggle.onclick = () => {
        isLoginMode = !isLoginMode;
        $('#auth-name').style.display = isLoginMode ? 'none' : 'block';
        $('#auth-submit-btn').innerText = isLoginMode ? 'Log In' : 'Create Account';
        $('#auth-toggle').innerText = isLoginMode ? "Don't have an account? Join Healing Social" : "Already have an account? Log In";
    };
}

$('#auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#auth-email').value;
    const pass = $('#auth-password').value;
    const name = $('#auth-name').value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, 'users', res.user.uid), {
                uid: res.user.uid,
                name: name || "User",
                bio: "Welcome to my profile!",
                profilePic: 'images/default_profile.png',
                coverPic: 'images/HEALING_ROOT_BANNER.jpg',
                status: 'online',
                followers: [],
                following: []
            });
        }
    } catch (err) { alert(err.message); }
};

onAuthStateChanged(auth, async user => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                currentProfile = snap.data();
                updateProfileUI(currentProfile);
                updateDoc(doc(db, 'users', user.uid), { status: 'online' });
            }
        });
        $('#auth-modal').style.display = 'none';
        $('#main-app').style.display = 'block';
        loadRealtimeFeed();
        loadAvailableUsers();
        loadPeopleDiscovery();
        setupNotifications();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

// ---------------------- SOCIAL UI SYNC ----------------------
function updateProfileUI(profile) {
    const name = profile.name || "User";
    const pic = profile.profilePic || 'images/default_profile.png';
    const cover = profile.coverPic || 'images/HEALING_ROOT_BANNER.jpg';
    const bio = profile.bio || "Healing Social Member";
    
    const fCount = profile.followers ? profile.followers.length : 0;
    const flCount = profile.following ? profile.following.length : 0;

    // Names & Bio
    if($('#display-name-top')) $('#display-name-top').innerText = name;
    if($('#display-name-header')) $('#display-name-header').innerText = name;
    if($('#my-profile-name')) $('#my-profile-name').innerText = name;
    if($('#display-full-name')) $('#display-full-name').innerText = name;
    if($('#display-bio')) $('#display-bio').innerText = bio;
    if($('#display-bio-bold')) $('#display-bio-bold').innerText = bio;
    
    // Stats
    if($('#follower-count')) $('#follower-count').innerHTML = `${fCount} <span style="font-weight:normal;">followers</span>`;
    if($('#following-count')) $('#following-count').innerHTML = `${flCount} <span style="font-weight:normal;">following</span>`;

    // Images
    if($('#profile-pic-preview')) $('#profile-pic-preview').src = pic;
    if($('#cover-pic-preview')) $('#cover-pic-preview').src = cover;
    if($('#my-menu-pic')) $('#my-menu-pic').src = pic;
    if($('#story-my-pic')) $('#story-my-pic').src = pic;
    
    $$('.user-avatar-sync').forEach(img => img.src = pic);
}

// ---------------------- FOLLOW SYSTEM ----------------------
window.toggleFollow = async (targetUid) => {
    if (!currentUser || targetUid === currentUser.uid) return;

    const myDocRef = doc(db, 'users', currentUser.uid);
    const targetDocRef = doc(db, 'users', targetUid);
    const isFollowing = currentProfile.following?.includes(targetUid);

    try {
        if (isFollowing) {
            await updateDoc(myDocRef, { following: arrayRemove(targetUid) });
            await updateDoc(targetDocRef, { followers: arrayRemove(currentUser.uid) });
        } else {
            await updateDoc(myDocRef, { following: arrayUnion(targetUid) });
            await updateDoc(targetDocRef, { followers: arrayUnion(currentUser.uid) });
            
            await addDoc(collection(db, 'notifications'), {
                recipientUID: targetUid,
                senderName: currentProfile.name,
                senderPic: currentProfile.profilePic,
                type: 'follow',
                timestamp: serverTimestamp(),
                read: false
            });
        }
    } catch (err) { console.error("Follow error:", err); }
};

function loadPeopleDiscovery() {
    onSnapshot(collection(db, 'users'), (snapshot) => {
        const list = $('#people-list');
        if (!list) return;
        list.innerHTML = '';
        snapshot.docs.forEach(docSnap => {
            const user = docSnap.data();
            if (user.uid !== currentUser.uid) {
                const isFollowing = user.followers?.includes(currentUser.uid);
                list.innerHTML += `
                    <div class="user-row">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${user.profilePic}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">
                            <div>
                                <div style="font-weight:bold;">${user.name}</div>
                                <div style="font-size:12px; color:var(--hr-secondary);">${user.followers?.length || 0} followers</div>
                            </div>
                        </div>
                        <button onclick="toggleFollow('${user.uid}')" class="${isFollowing ? 'fb-btn-secondary' : 'btn-green'}" style="padding:6px 15px; font-size:13px;">
                            ${isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                `;
            }
        });
    });
}

// ---------------------- PROFILE UPDATES ----------------------
window.uploadNewProfilePic = (input) => {
    const file = input.files[0];
    if (file) uploadToCloudinary(file, 'profilePic');
};

window.uploadCoverPic = (input) => {
    const file = input.files[0];
    if (file) uploadToCloudinary(file, 'coverPic');
};

async function uploadToCloudinary(file, field) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    try {
        const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
        const data = await res.json();
        await updateDoc(doc(db, 'users', currentUser.uid), { [field]: data.secure_url });
        alert("Updated successfully!");
    } catch (err) { alert("Upload failed."); }
}

window.editBio = async () => {
    const newBio = prompt("Write something about yourself:", currentProfile?.bio || "");
    if (newBio !== null) await updateDoc(doc(db, 'users', currentUser.uid), { bio: newBio });
};

window.editProfileName = async () => {
    const newName = prompt("Enter your full name:", currentProfile?.name || "");
    if (newName) await updateDoc(doc(db, 'users', currentUser.uid), { name: newName });
};

// ---------------------- FEED & POSTS ----------------------
function loadRealtimeFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        const feed = $('#feed-items');
        const reels = $('#reels-container');
        if (!feed || !reels) return;
        
        feed.innerHTML = '';
        reels.innerHTML = '';

        snapshot.docs.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const reactions = post.reactions || {};
            const counts = Object.values(reactions).length;

            const postHtml = `
                <div class="post-card">
                    <div style="display:flex; gap:10px; padding:12px; align-items:center;">
                        <img src="${post.userPic || 'images/default_profile.png'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                        <div>
                            <div style="font-weight:bold; font-size:14px;">${post.userName}</div>
                            <div style="font-size:11px; color:var(--hr-secondary);">Just now • 🌍</div>
                        </div>
                    </div>
                    <div style="padding:0 12px 12px 12px; font-size:16px;">${post.text}</div>
                    ${post.content ? (post.type === 'video' ? 
                        `<video src="${post.content}" controls></video>` : 
                        `<img src="${post.content}" style="width:100%; max-height:500px; object-fit:cover;">`) : ''}
                    
                    <div class="reaction-bar" style="padding:10px 15px; border-top:1px solid var(--hr-divider); display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; gap:15px;">
                            <div onclick="addReaction('${pid}', '👍')" style="cursor:pointer; font-weight:bold; font-size:13px; color:var(--hr-secondary);">👍 Like</div>
                            <div onclick="$('#comm-input-${pid}').focus()" style="cursor:pointer; font-weight:bold; font-size:13px; color:var(--hr-secondary);">💬 Comment</div>
                        </div>
                        <div style="font-size:12px; color:var(--hr-secondary);">${counts > 0 ? '❤️ ' + counts : ''}</div>
                    </div>

                    <div style="padding:10px; background:#1c1e21;">
                        <div id="comments-${pid}">${renderComments(post.comments || [])}</div>
                        <div style="display:flex; gap:8px; margin-top:10px;">
                            <input type="text" id="comm-input-${pid}" placeholder="Write a comment..." 
                                style="flex:1; background:#3a3b3c; border:none; color:white; padding:8px 12px; border-radius:20px; font-size:13px;">
                            <button onclick="submitComment('${pid}')" style="background:none; border:none; color:var(--hr-green); font-weight:bold;">Post</button>
                        </div>
                    </div>
                </div>`;

            if (post.type === 'video') reels.innerHTML += postHtml;
            else feed.innerHTML += postHtml;
        });
    });
}

window.submitPost = async () => {
    const text = $('#post-text').value;
    const file = $('#post-file-input').files[0];
    if (!text && !file) return;
    
    window.closePostModal();

    let fileUrl = '';
    let fileType = 'text';

    if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
        const data = await res.json();
        fileUrl = data.secure_url;
        fileType = file.type.includes('video') ? 'video' : 'image';
    }

    await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        userName: currentProfile.name,
        userPic: currentProfile.profilePic,
        text: text,
        content: fileUrl,
        type: fileType,
        timestamp: serverTimestamp(),
        reactions: {},
        comments: []
    });

    $('#post-text').value = '';
    $('#post-file-input').value = '';
};

// ---------------------- INTERACTIONS ----------------------
window.addReaction = async (pid, emoji) => {
    const postRef = doc(db, 'posts', pid);
    const snap = await getDoc(postRef);
    const reactions = snap.data().reactions || {};
    reactions[currentUser.uid] = emoji;
    await updateDoc(postRef, { reactions });
};

window.submitComment = async (pid) => {
    const input = $(`#comm-input-${pid}`);
    if (!input.value.trim()) return;

    const newComment = {
        id: Math.random().toString(36).substr(2, 9),
        uid: currentUser.uid,
        userName: currentProfile.name,
        text: input.value,
        timestamp: Date.now()
    };

    await updateDoc(doc(db, 'posts', pid), { comments: arrayUnion(newComment) });
    input.value = '';
};

function renderComments(comments) {
    return comments.slice(-3).map(c => `
        <div style="margin-bottom:6px; font-size:13px;">
            <b style="color:var(--hr-green);">${c.userName}</b> ${c.text}
        </div>
    `).join('');
}

// ---------------------- CHAT ENGINE ----------------------
function loadAvailableUsers() {
    onSnapshot(collection(db, 'users'), (snapshot) => {
        const list = $('#available-users');
        if (!list) return;
        list.innerHTML = '';
        snapshot.docs.forEach(docSnap => {
            const user = docSnap.data();
            if (user.uid !== currentUser.uid) {
                const isOnline = user.status === 'online';
                list.innerHTML += `
                    <div class="user-row" onclick="startChat('${user.uid}', '${user.name}')">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="position:relative;">
                                <img src="${user.profilePic}" style="width:45px; height:45px; border-radius:50%; object-fit:cover;">
                                <div style="position:absolute; bottom:2px; right:2px; width:10px; height:10px; border-radius:50%; background:${isOnline ? '#4caf50' : '#757575'}; border:2px solid black;"></div>
                            </div>
                            <b>${user.name}</b>
                        </div>
                        <span style="color:var(--hr-secondary); font-size:12px;">${isOnline ? 'Online' : 'Offline'}</span>
                    </div>`;
            }
        });
    });
}

window.startChat = (targetUid, targetName) => {
    activeChatId = [currentUser.uid, targetUid].sort().join('_');
    $('#chatting-with-name').innerText = targetName;
    $('#active-chat-window').style.display = 'flex';
    loadMessages();
};

window.closeChat = () => $('#active-chat-window').style.display = 'none';

window.sendMessage = async () => {
    const text = $('#chat-input').value.trim();
    if (!text || !activeChatId) return;
    await addDoc(collection(db, 'chats', activeChatId, 'messages'), {
        senderId: currentUser.uid,
        text: text,
        timestamp: serverTimestamp()
    });
    $('#chat-input').value = '';
};

function loadMessages() {
    const q = query(collection(db, 'chats', activeChatId, 'messages'), orderBy('timestamp', 'asc'));
    onSnapshot(q, (snapshot) => {
        const container = $('#chat-messages');
        container.innerHTML = '';
        snapshot.docs.forEach(docSnap => {
            const msg = docSnap.data();
            const isMe = msg.senderId === currentUser.uid;
            const msgDiv = document.createElement('div');
            msgDiv.style = `align-self:${isMe ? 'flex-end' : 'flex-start'}; background:${isMe ? 'var(--hr-green)' : '#333'}; padding:10px 15px; border-radius:18px; max-width:75%; color:white; margin-bottom:4px; font-size:14px;`;
            msgDiv.innerText = msg.text;
            container.appendChild(msgDiv);
        });
        container.scrollTop = container.scrollHeight;
    });
}

function setupNotifications() {
    const q = query(collection(db, 'notifications'), where('recipientUID', '==', currentUser?.uid), where('read', '==', false));
    onSnapshot(q, snap => {
        const badge = $('#notif-count');
        if (badge) {
            badge.innerText = snap.docs.length;
            badge.style.display = snap.docs.length > 0 ? 'block' : 'none';
        }
    });
}

window.logout = async () => {
    if (currentUser) await updateDoc(doc(db, 'users', currentUser.uid), { status: 'offline' });
    signOut(auth).then(() => location.reload());
};
