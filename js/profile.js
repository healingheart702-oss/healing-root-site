// js/profile.js
import { auth, db } from './firebase.js';
import { CLOUDINARY } from './cloudinary.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { doc, setDoc, getDoc, collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const profilePic = document.getElementById('profile-picture');
const uploadProfile = document.getElementById('upload-profile');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const friendsList = document.getElementById('friends-list');
const userPosts = document.getElementById('user-posts');

onAuthStateChanged(auth, async user=>{
  if(!user) return location.href='index.html';
  userEmailEl.textContent = user.email;
  userNameEl.textContent = user.displayName || user.email.split('@')[0];
  // load user doc or create
  const uDocRef = doc(db,'users',user.uid);
  const uSnap = await getDoc(uDocRef);
  if(!uSnap.exists()){
    await setDoc(uDocRef, { name: user.displayName || user.email.split('@')[0], email: user.email });
  } else {
    const d = uSnap.data();
    if(d.photoURL) profilePic.src = d.photoURL;
    if(d.bio) document.getElementById('user-bio').textContent = d.bio;
  }

  // friends listing (simple)
  const usersQ = query(collection(db,'users'));
  onSnapshot(usersQ, snap=>{
    friendsList.innerHTML='';
    snap.forEach(s=>{
      if(s.id === user.uid) return;
      const li = document.createElement('li');
      li.innerHTML = `${s.data().name || s.id} <button class="add-friend" data-id="${s.id}">Add</button>`;
      friendsList.appendChild(li);
    });
  });

  // user posts
  onSnapshot(query(collection(db,'posts')), snap=>{
    userPosts.innerHTML='';
    snap.forEach(docSnap=>{
      const p = docSnap.data();
      if(p.userUid !== user.uid) return;
      const div = document.createElement('div');
      div.className='post-card';
      div.innerHTML = `<p>${p.text}</p>${p.imageUrl?`<img src="${p.imageUrl}" style="max-width:200px">`:''}`;
      userPosts.appendChild(div);
    });
  });
});

// upload helper
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

uploadProfile?.addEventListener('change', async ()=>{
  const file = uploadProfile.files[0];
  if(!file) return;
  const user = auth.currentUser;
  const url = await uploadToCloudinary(file,'healingroot/profiles');
  profilePic.src = url;
  await setDoc(doc(db,'users',user.uid), { photoURL: url }, { merge:true });
});

// event delegation to add friend (simple add to subcollection)
document.addEventListener('click', async (e)=>{
  if(e.target.matches('.add-friend')){
    const friendId = e.target.dataset.id;
    const user = auth.currentUser;
    if(!user) return;
    const fRef = doc(db,'users',user.uid,'friends', friendId);
    await setDoc(fRef, { id: friendId, addedAt: new Date() });
    e.target.textContent = 'Added';
  }
});
