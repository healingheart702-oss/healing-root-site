// js/profile.js
import { auth, db } from './firebase.js';
import { CLOUDINARY } from './cloudinary.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { doc, setDoc, getDoc, collection, addDoc, query, onSnapshot, where } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const profilePic = document.getElementById('profile-picture');
const uploadProfile = document.getElementById('upload-profile');
const saveProfileBtn = document.getElementById('save-profile-pic');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const bioEl = document.getElementById('user-bio');
const saveBio = document.getElementById('save-bio');
const userPosts = document.getElementById('user-posts');
const friendsList = document.getElementById('friends-list');

let currentUser = null;
let uploadedProfileUrl = null;

async function uploadToCloudinary(file, folder='healingroot/profiles'){
  const url = CLOUDINARY.uploadUrl(CLOUDINARY.cloudName);
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.unsignedPreset);
  fd.append('folder', folder);
  const res = await fetch(url, { method:'POST', body: fd });
  const json = await res.json();
  return json.secure_url;
}

onAuthStateChanged(auth, async user=>{
  if(!user) return location.href='index.html';
  currentUser = user;
  userNameEl.textContent = user.displayName || user.email.split('@')[0];
  userEmailEl.textContent = user.email;

  // load user doc
  const uref = doc(db,'users',user.uid);
  const uSnap = await getDoc(uref);
  if(uSnap.exists()){
    const d = uSnap.data();
    if(d.photoURL) profilePic.src = d.photoURL;
    if(d.bio) bioEl.value = d.bio;
  } else {
    await setDoc(uref, { name: user.displayName || '', email: user.email });
  }

  // user posts
  const pq = query(collection(db,'posts'), where('userUid','==', user.uid));
  onSnapshot(pq, snap=>{
    userPosts.innerHTML = '';
    snap.forEach(s=>{
      const p = s.data();
      const div = document.createElement('div'); div.className='post-card';
      div.innerHTML = `<p>${p.text||''}</p>${p.imageUrl?`<img src="${p.imageUrl}" style="max-width:200px">`:''}`;
      userPosts.appendChild(div);
    });
  });

  // friends & requests - show all users and friend state
  const usersQ = collection(db,'users');
  onSnapshot(usersQ, snap=>{
    friendsList.innerHTML = '';
    snap.forEach(u=>{
      if(u.id === user.uid) return;
      const data = u.data();
      const li = document.createElement('div');
      li.className = 'row';
      const name = data.name || u.id;
      // check friendship
      // friend doc path: users/{currentUid}/friends/{otherUid}
      const btn = document.createElement('button');
      btn.textContent = 'Add';
      btn.dataset.id = u.id;
      btn.className = 'add-friend';
      // request & friend state handled via Firestore lists
      // We'll query whether friend exists
      getDoc(doc(db,'users',currentUser.uid,'friends',u.id)).then(fsnap=>{
        if(fsnap.exists()){
          btn.textContent = 'Chat 💬';
          btn.className = 'chat-friend';
        } else {
          // check if incoming request exists
          getDoc(doc(db,'friend_requests', `${u.id}_${currentUser.uid}`)).then(rsnap=>{
            if(rsnap.exists()){
              btn.textContent = 'Accept';
              btn.className = 'accept-friend';
            } else {
              getDoc(doc(db,'friend_requests', `${currentUser.uid}_${u.id}`)).then(r2=>{
                if(r2.exists()) btn.textContent = 'Requested';
              });
            }
          });
        }
      });
      li.innerHTML = `<span>${name}</span>`;
      li.appendChild(btn);
      friendsList.appendChild(li);
    });
  });
});

uploadProfile?.addEventListener('change', async ()=>{
  const f = uploadProfile.files[0];
  if(!f) return;
  uploadedProfileUrl = await uploadToCloudinary(f,'healingroot/profiles');
  profilePic.src = uploadedProfileUrl;
});

saveProfileBtn?.addEventListener('click', async ()=>{
  if(!uploadedProfileUrl) return alert('Choose an image first');
  await setDoc(doc(db,'users',currentUser.uid), { photoURL: uploadedProfileUrl }, { merge:true });
  alert('Profile picture saved');
});

// save bio
saveBio?.addEventListener('click', async ()=>{
  const b = bioEl.value.trim();
  await setDoc(doc(db,'users',currentUser.uid), { bio: b }, { merge:true });
  alert('Bio saved');
});

// friend actions delegation
document.addEventListener('click', async (e)=>{
  if(e.target.matches('.add-friend')){
    const other = e.target.dataset.id;
    await setDoc(doc(db,'friend_requests', `${auth.currentUser.uid}_${other}`), { from: auth.currentUser.uid, to: other, createdAt: new Date() });
    e.target.textContent = 'Requested';
  } else if(e.target.matches('.accept-friend')){
    const other = e.target.dataset.id;
    // accept: create friend docs in both users' subcollections
    await setDoc(doc(db,'users',currentUser.uid,'friends', other), { id: other, addedAt: new Date() });
    await setDoc(doc(db,'users',other,'friends', currentUser.uid), { id: currentUser.uid, addedAt: new Date() });
    // remove request documents with keys other_currentUser or currentUser_other
    await deleteDoc(doc(db,'friend_requests', `${other}_${currentUser.uid}`));
    alert('Friend added');
  } else if(e.target.matches('.chat-friend')){
    const friendId = e.target.dataset.id;
    // navigate to chat and preselect friend via localStorage
    localStorage.setItem('chatWith', friendId);
    window.location.href='chat.html';
  }
});
