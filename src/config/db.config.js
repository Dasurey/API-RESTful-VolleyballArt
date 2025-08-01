const { EXTERNAL_PACKAGES } = require('./paths.config.js');
const { config } = require(EXTERNAL_PACKAGES.DOTENV);
config();
const { getFirestore } = require(EXTERNAL_PACKAGES.FIREBASE_FIRESTORE);
const { getAuth } = require(EXTERNAL_PACKAGES.FIREBASE_AUTH);

// Import the functions you need from the SDKs you need
const { initializeApp } = require(EXTERNAL_PACKAGES.FIREBASE_APP);
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

module.exports = {  db, auth  };;