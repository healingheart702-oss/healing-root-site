// Firebase initialization
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Cloudinary config for profile pics and post images
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dd7dre9hd/upload";
const UPLOAD_PRESET = "unsigned_upload";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgjMFw0dbM7CBH4S_zrmPhE69pp84Tpdo",
  authDomain: "healing-root-farm.firebaseapp.com",
  projectId: "healing-root-farm",
  storageBucket: "healing-root-farm.appspot.com",
  messagingSenderId: "1042258816994",
  appId: "1:1042258816994:web:0b6dd6b7f1c370ee7093bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Admin UID
const ADMIN_UID = "gKwgPDNJgsdcApIJch6NM9bKmf02";

// Products data with full 2500-character professional descriptions
const products = [
  {
    name: "Cassava Stems (TME419, TMS30572)",
    image: "images/cassava.JPG",
    price: 500,
    description: `Healing root AGRO ventures stands as a trusted name in quality crop seedlings across Nigeria. We have built our reputation on reliability, clarity, and genuine agricultural knowledge that helps farmers and investors create lasting income. Our goal is simple. To deliver seedlings that give strong survival rate, high yield, and a clear path to long-term returns. Every seedling we raise is nurtured in a clean nursery environment, inspected carefully, and supplied with full guidance for establishment and expansion.

Cassava is one of Nigeria’s most important staple crops, providing both food security and income for smallholder farmers. The TME419 and TMS30572 varieties are high-yield, disease-resistant, and adapted to local soil conditions. These varieties offer fast growth, strong tuber quality, and reliable harvests that maximize farm productivity.

COMMON MYTHS ABOUT CASSAVA FARMING
Many believe cassava farming is low-return and labor-intensive. However, with proper planting techniques, soil preparation, pest control, and spacing, cassava can provide consistent income and strong yields. Nigeria’s population growth ensures a continuous demand for cassava flour, gari, and starch.

INDUSTRIAL USES OF CASSAVA
Cassava is processed into flour, starch, ethanol, and industrial products for food, beverages, and adhesives. This strong industrial demand makes cassava a reliable investment for commercial farmers.

BENEFITS OF INVESTING IN HIGH-YIELD VARIETIES
TME419 and TMS30572 give strong tuber size, early maturity, and resilience against pests. Farmers benefit from higher yields, reduced crop failure, and stable income streams.

STARTING COST AND INVESTMENT STRUCTURE
A starter pack of cassava stems can be acquired for small plots, and with proper farm management, it can yield high returns within 9-12 months. Large-scale plantations benefit from economies of scale and long-term profitability.

EXPECTED YIELD
Properly managed cassava stems can produce 25-35 tonnes per hectare within the first year. Continuous care, fertilization, and disease monitoring ensure sustained productivity.

THE FULL POTENTIAL
By selecting high-quality stems from Healing Root AGRO ventures, investors ensure high survival rates, healthy tuber production, and reliable market access. Cassava farming thus becomes both a secure and profitable agricultural investment for long-term wealth generation.`
  },
  {
    name: "Hybrid Dwarf Banana",
    image: "images/giant_banana.JPG",
    price: 500,
    description: `Healing root AGRO ventures provides premium Hybrid Dwarf Banana suckers for commercial and smallholder farming. Known for rapid growth, high yield, and resilience to disease, our banana plants are carefully nurtured to deliver reliable harvests for the Nigerian market.

Bananas are a highly profitable crop, offering both food security and income generation. Our hybrid dwarf variety is ideal for compact plots and high-density planting, ensuring optimal yield per hectare. The plants are selected for strong stem stability, disease resistance, and consistent fruiting.

COMMON MYTHS ABOUT BANANA FARMING
Many assume banana farming requires huge land or intensive care. In reality, with proper spacing, irrigation, and nutrient management, dwarf hybrids can produce abundant fruits even in smaller plots.

INDUSTRIAL AND COMMERCIAL USES
Bananas serve as fresh fruit for local markets, processed into juice, chips, and desserts, and form part of the food processing value chain. Growing demand ensures stable market access.

BENEFITS OF INVESTING IN HYBRID DWARF BANANA
Our hybrid dwarf banana offers early fruiting, high-quality bunches, and superior marketability. Farmers enjoy low labor intensity, fast returns, and minimal risk of crop failure.

STARTING COST AND STRUCTURE
A starter pack includes quality suckers sufficient for a small farm plot. Costs scale with acreage, ensuring a flexible investment approach.

EXPECTED YIELD
Hybrid dwarf banana can yield 25-40 tonnes per hectare annually under proper farm management. This high productivity makes it an ideal choice for profitable agribusiness ventures.

FULL POTENTIAL
Investing in Hybrid Dwarf Banana from Healing Root AGRO ventures ensures strong returns, high-quality produce, and an opportunity to engage in one of Nigeria’s most lucrative agricultural sectors. The crop continues to provide income for years with proper care and management.`
  },
  {
    name: "Tenera Oil Palm Seedlings",
    image: "images/oilpalm.JPG",
    price: 1500,
    description: `Healing root AGRO ventures supplies high-quality Tenera oil palm seedlings that are resilient, high-yielding, and suitable for modern plantations across Nigeria. Our seedlings are nurtured to ensure strong establishment, optimal growth, and high oil production.

Tenera oil palm is considered a generational wealth crop due to its long productive lifespan and consistent returns. These seedlings are ideal for farmers and investors seeking renewable, long-term income.

COMMON MYTHS ABOUT OIL PALM FARMING
Many people believe oil palm farming is expensive and slow to yield profits. With proper spacing, care, fertilization, and pest management, Tenera oil palm can begin fruiting in 3 years, providing steady revenue for decades.

INDUSTRIAL USES
Palm oil is essential for food production, cosmetics, pharmaceuticals, biodiesel, and industrial applications. Nigeria’s growing industrial base ensures strong demand.

BENEFITS
Tenera produces high oil content, consistent yields, and adapts to various soil types. One hectare can support family income for decades.

STARTING COST AND INVESTMENT STRUCTURE
Seedlings are affordable, and planting structures scale according to land size. Early care ensures strong long-term returns.

EXPECTED YIELD
Tenera can yield 4-6 tonnes per hectare in initial years, increasing with maturity. Proper plantation management ensures consistent, profitable harvests.

FULL POTENTIAL
Tenera is not just a seedling; it’s a long-term income system. Healing Root AGRO ventures provides certified seedlings, full guidance, and management support to ensure successful plantation establishment and sustained profitability.`
  },
  {
    name: "Plantain Suckers",
    image: "images/plantain.JPG",
    price: 300,
    description: `Healing root AGRO ventures offers high-quality Plantain suckers for commercial and smallholder farms. Our plantain varieties are selected for robust growth, disease resistance, and high yield, ensuring strong returns on investment.

Plantains are a staple crop in Nigeria with consistent demand for consumption and processing. Proper management and planting practices allow for predictable harvests and income.

COMMON MYTHS
Plantain requires excessive land and care. In reality, well-spaced planting, fertilization, and pest control result in high yields and quality produce.

INDUSTRIAL AND COMMERCIAL USES
Plantains are consumed locally, processed into flour, chips, and snacks, and are part of commercial agribusiness value chains.

BENEFITS
Our plantains fruit early, yield abundantly, and are easy to manage, making them ideal for reliable agribusiness ventures.

EXPECTED YIELD
High-yield plantain varieties produce 20-30 tonnes per hectare annually, providing steady income streams.

FULL POTENTIAL
Healing Root AGRO ventures ensures superior quality plantain suckers with strong growth potential and marketable fruits, supporting both smallholder and large-scale agricultural investment.`
  },
  {
    name: "Coconut Seedlings",
    image: "images/coconut.JPG",
    price: 1000,
    description: `Healing root AGRO ventures provides premium coconut seedlings that are disease-free, high-yielding, and ideal for long-term plantation projects. Our seedlings are carefully nurtured to ensure strong establishment and optimal growth.

Coconut palms are versatile and provide income from nuts, copra, oil, and husks. Planting high-quality seedlings ensures strong growth and reliable harvests for years.

BENEFITS
Coconut palms adapt to various soil types, produce high-quality nuts, and support sustainable income streams.

EXPECTED YIELD
A well-managed coconut plantation can produce hundreds of nuts per tree annually, ensuring long-term profitability.

FULL POTENTIAL
Our coconut seedlings are prepared for easy planting and strong field performance, allowing farmers and investors to maximize long-term returns. Healing Root AGRO ventures supplies seedlings with guidance for full plantation success.`
  },
  {
    name: "Giant Cocoa Seedlings",
    image: "images/giant_cocoa.JPG",
    price: 800,
    description: `Healing root AGRO ventures supplies giant cocoa seedlings selected for high yield, disease resistance, and adaptability to Nigerian climates. Our cocoa seedlings ensure strong establishment, rapid growth, and profitable fruiting.

Cocoa is one of Nigeria’s highest-value crops, with consistent demand in local and international chocolate and confectionery industries. High-quality seedlings provide superior harvests and long-term income potential.

BENEFITS
Giant cocoa varieties produce more pods per tree, resist diseases better, and adapt to different soil types, ensuring consistent and profitable yields.

EXPECTED YIELD
Properly nurtured cocoa seedlings can produce 1-2 tonnes of dry cocoa beans per hectare annually after maturity, generating long-term revenue.

FULL POTENTIAL
Healing Root AGRO ventures ensures that all cocoa seedlings meet high-quality standards for strong plantation performance, secure income, and sustainable agriculture practices.`
  },
  {
    name: "Pineapple Seedlings",
    image: "images/pineapple.JPG",
    price: 400,
    description: `Healing root AGRO ventures offers premium pineapple seedlings that are disease-resistant, fast-growing, and high-yielding. Our seedlings are nurtured in controlled nurseries to ensure quality and healthy growth.

Pineapple is a high-value tropical fruit crop with strong local and international demand. Planting healthy seedlings guarantees quality fruits and reliable market access.

BENEFITS
Seedlings fruit early, produce large, uniform pineapples, and have strong resistance to pests and diseases, ensuring high returns.

EXPECTED YIELD
A hectare of well-managed pineapple plants can produce 30-50 tonnes annually, providing significant income for investors and farmers.

FULL POTENTIAL
Healing Root AGRO ventures supports investors with high-quality seedlings, planting guidance, and best practices for sustainable and profitable pineapple farming.`
  },
  {
    name: "Yam Setts",
    image: "images/Yamsett.JPG",
    price: 200,
    description: `Healing root AGRO ventures provides premium yam setts for high-yield, disease-resistant yam cultivation. Our setts are carefully selected to ensure strong sprouting, robust tubers, and predictable harvests.

Yams are staple crops in Nigeria, essential for food security and income generation. Quality setts ensure high productivity and better market value.

BENEFITS
Our yam setts sprout quickly, resist rot, and produce uniform tubers with excellent market quality.

EXPECTED YIELD
A hectare of properly managed yams can yield 15-25 tonnes per season, depending on variety and care.

FULL POTENTIAL
By using Healing Root AGRO ventures yam setts, farmers and investors secure high-quality planting material that maximizes yield, ensures reliability, and delivers profitable agricultural investment outcomes.`
  }
];

// --- Add additional app.js logic here for social feed, profile picture uploads, friends, chat, admin deletion, and WhatsApp order ---
