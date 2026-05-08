import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, updateDoc, getDoc, query, orderBy, 
  serverTimestamp, onSnapshot, arrayUnion, arrayRemove, where, limit 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js";

// --- INITIALIZATION ---
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
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let currentUser = null;
let currentProfile = null;
let isSignUpMode = false;

// --- 1. AUTH & ACCOUNT CREATION ---
window.toggleAuthMode = () => {
    isSignUpMode = !isSignUpMode;
    $('#auth-name').style.display = isSignUpMode ? 'block' : 'none';
    $('#auth-submit-btn').innerText = isSignUpMode ? 'Create Account' : 'Log In';
    $('#auth-toggle').innerText = isSignUpMode ? 'Already have an account? Log In' : "Don't have an account? Join Healing Social";
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
                bio: "New to Healing Social!",
                friends: [],
                status: 'online'
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
                friends: [],
                status: 'online'
            });
        }
    } catch (err) { alert("Google Auth Failed: " + err.message); }
};

// --- 2. AUTH OBSERVER ---
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
        initNotifications();
    } else {
        $('#auth-modal').style.display = 'flex';
        $('#main-app').style.display = 'none';
    }
});

// --- 3. PROFILE & IMAGE UPLOADS ---
window.uploadNewProfilePic = async (input) => {
    const file = input.files[0];
    if (!file) return;
    try {
        const storageRef = ref(storage, `profiles/${currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url });
        alert("Profile picture updated!");
    } catch (err) { alert("Upload failed: " + err.message); }
};

window.uploadCoverPic = async (input) => {
    const file = input.files[0];
    if (!file) return;
    try {
        const storageRef = ref(storage, `covers/${currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'users', currentUser.uid), { coverPic: url });
        alert("Cover updated!");
    } catch (err) { alert("Upload failed: " + err.message); }
};

window.editBio = async () => {
    const newBio = prompt("Enter your new bio:", currentProfile.bio);
    if (newBio !== null) {
        await updateDoc(doc(db, 'users', currentUser.uid), { bio: newBio });
    }
};

// --- 4. SOCIAL DISCOVERY & FRIENDS ---
function loadDiscovery() {
    const q = query(collection(db, 'users'), limit(20));
    onSnapshot(q, (snap) => {
        const list = $('#people-list');
        list.innerHTML = '';
        snap.forEach(userDoc => {
            const user = userDoc.data();
            if (user.uid === currentUser.uid) return;
            const isFriend = currentProfile.friends?.includes(user.uid);
            
            const div = document.createElement('div');
            div.className = 'user-row';
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${user.profilePic}" style="width:45px; height:45px; border-radius:50%;">
                    <b>${user.name}</b>
                </div>
                <button class="btn-green" onclick="sendFriendRequest('${user.uid}', '${user.name}')" ${isFriend ? 'disabled' : ''}>
                    ${isFriend ? 'Friends' : 'Add Friend'}
                </button>
            `;
            list.appendChild(div);
        });
    });
}

window.sendFriendRequest = async (targetUid, targetName) => {
    await addDoc(collection(db, 'notifications'), {
        to: targetUid,
        from: currentUser.uid,
        fromName: currentProfile.name,
        fromPic: currentProfile.profilePic,
        type: 'friend_request',
        status: 'pending',
        timestamp: serverTimestamp()
    });
    alert(`Request sent to ${targetName}`);
};

function initNotifications() {
    const q = query(collection(db, 'notifications'), where('to', '==', currentUser.uid), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snap) => {
        $('#notif-count').innerText = snap.size;
        $('#notif-count').style.display = snap.size > 0 ? 'block' : 'none';
        
        const list = $('#notifications-list');
        list.innerHTML = '';
        snap.forEach(docSnap => {
            const n = docSnap.data();
            const nid = docSnap.id;
            const div = document.createElement('div');
            div.className = 'notif-card';
            div.innerHTML = `
                <img src="${n.fromPic}" style="width:40px; height:40px; border-radius:50%;">
                <div style="flex:1; font-size:14px;"><b>${n.fromName}</b> sent a friend request.</div>
                <button class="btn-green" style="padding:5px 10px;" onclick="acceptFriend('${nid}', '${n.from}')">Accept</button>
            `;
            list.appendChild(div);
        });
    });
}

window.acceptFriend = async (notifId, peerUid) => {
    await updateDoc(doc(db, 'users', currentUser.uid), { friends: arrayUnion(peerUid) });
    await updateDoc(doc(db, 'users', peerUid), { friends: arrayUnion(currentUser.uid) });
    await setDoc(doc(db, 'notifications', notifId), { status: 'accepted' }, { merge: true });
    alert("Friend Request Accepted!");
};

// --- 5. UI & FEED ---
function syncUI(profile) {
    $$('.user-avatar-sync').forEach(img => img.src = profile.profilePic);
    $('#profile-pic-preview').src = profile.profilePic;
    $('#cover-pic-preview').src = profile.coverPic;
    $('#display-name-header').innerText = profile.name;
    $('#display-bio').innerText = profile.bio;
}

function initFeed() {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snap) => {
        const container = $('#feed-items');
        container.innerHTML = '';
        snap.forEach(docSnap => {
            const post = docSnap.data();
            const pid = docSnap.id;
            const div = document.createElement('div');
            div.className = 'post-card';
            div.innerHTML = `
                <div style="padding:12px; display:flex; gap:10px; align-items:center;">
                    <img src="${post.userPic}" style="width:40px; height:40px; border-radius:50%;">
                    <div><b>${post.userName}</b></div>
                </div>
                <div style="padding:0 12px 12px;">${post.text}</div>
                ${post.content ? `<img src="${post.content}" style="width:100%">` : ''}
            `;
            container.appendChild(div);
        });
    });
}

window.submitPost = async () => {
    const text = $('#post-text').value;
    const file = $('#post-file-input').files[0];
    let fileUrl = "";

    if (file) {
        const refLink = ref(storage, `posts/${Date.now()}`);
        await uploadBytes(refLink, file);
        fileUrl = await getDownloadURL(refLink);
    }

    await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        userName: currentProfile.name,
        userPic: currentProfile.profilePic,
        text: text,
        content: fileUrl,
        timestamp: serverTimestamp()
    });
    $('#post-text').value = '';
    window.closePostModal();
};

window.logout = () => signOut(auth).then(() => location.reload());
