import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.firebasestorage.app",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const authSection = document.getElementById('auth-section');
const mainContainer = document.getElementById('main-container');

let currentUser = null;

// Products data
const products = [
  { name:"TME 419 Cassava Stems", price:"₦1,000", image:"images/cassava.JPG", desc:"High-yield, disease-resistant cassava variety..." },
  { name:"Hybrid Giant Plantain Sucker", price:"₦500", image:"images/plantain.JPG", desc:"Robust, fast-growing plantain..." },
  { name:"Hybrid Dwarf Banana Sucker", price:"₦500", image:"images/giant_banana.JPG", desc:"Early-fruiting dwarf banana..." },
  { name:"Tenera Oil Palm Seedlings", price:"₦1,000", image:"images/oilpalm.JPG", desc:"Improved oil palm seedlings..." },
  { name:"Hybrid Cocoa Nursery Plant", price:"₦500", image:"images/giant_cocoa.JPG", desc:"High-quality, disease-resistant cocoa..." },
  { name:"Pineapple Sucker", price:"₦400", image:"images/pineapple.JPG", desc:"Premium pineapple suckers..." },
  { name:"Hybrid Dwarf Coconut Seedlings", price:"₦4,500", image:"images/coconut.JPG", desc:"High-yield, disease-resistant coconut seedlings..." },
  { name:"Treated Yam Setts", price:"₦700", image:"images/treated_yam.JPG", desc:"High-quality treated yam setts..." }
];

// Display products
const productsSection = document.getElementById('products-section');
products.forEach(prod=>{
  const card = document.createElement('div'); card.className='card';
  card.innerHTML = `<img src="${prod.image}" alt="${prod.name}"><h3>${prod.name}</h3>
  <p>${prod.desc}</p>
  <p class="price">Price: ${prod.price}</p>
  <a class="order-btn" href="https://wa.me/2349138938301?text=I want to order ${prod.name}" target="_blank">Order via WhatsApp</a>`;
  productsSection.appendChild(card);
});

// Sign-up
signupForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  try {
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    currentUser = cred.user;
    await setDoc(doc(db,'users',currentUser.uid),{name,email,friends:[],profilePic:null});
    showMain();
  } catch(err){ alert(err.message); }
});

// Login
loginForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const cred = await signInWithEmailAndPassword(auth,email,password);
    currentUser = cred.user;
    showMain();
  } catch(err){ alert(err.message); }
});

function showMain(){
  authSection.style.display='none';
  mainContainer.style.display='block';
  loadProfile();
  loadFriends();
}

// Profile
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profilePic = document.getElementById('profile-picture');
const profileUpload = document.getElementById('profile-upload');
document.getElementById('update-profile').addEventListener('click', updateProfile);

async function loadProfile(){
  const docSnap = await getDoc(doc(db,'users',currentUser.uid));
  if(docSnap.exists()){
    const data = docSnap.data();
    profileName.textContent = data.name;
    profileEmail.textContent = data.email;
    if(data.profilePic) profilePic.src = data.profilePic;
  }
}

async function updateProfile(){
  const file = profileUpload.files[0];
  if(file){
    const storageRef = ref(storage, `profilePics/${currentUser.uid}`);
    await uploadBytes(storageRef,file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db,'users',currentUser.uid),{profilePic:url});
    profilePic.src = url;
  }
}

// Friends
const friendsList = document.getElementById('friends-list');
async function loadFriends(){
  friendsList.innerHTML='';
  const usersSnap = await getDocs(collection(db,'users'));
  usersSnap.forEach(docu=>{
    if(docu.id!==currentUser.uid){
      const data = docu.data();
      const fCard = document.createElement('div'); fCard.className='friend-card';
      fCard.innerHTML=`<img src="${data.profilePic || 'images/default-profile.png'}" alt="${data.name}"><p>${data.name}</p>
      <button onclick="addFriend('${docu.id}')">Add</button>`;
      friendsList.appendChild(fCard);
    }
  });
}

async function addFriend(uid){
  await updateDoc(doc(db,'users',currentUser.uid),{friends: arrayUnion(uid)});
  alert('Friend request sent!');
}
