
const firebaseConfig = {
  apiKey: "AIzaSyCcTSVy78aEXeNfJwkWkWsM6QyMkCc7vwg",
  authDomain: "cpjsi1.firebaseapp.com",
  projectId: "cpjsi1",
  storageBucket: "cpjsi1.firebasestorage.app",
  messagingSenderId: "174697284382",
  appId: "1:174697284382:web:5ddd35929fbf9b27bb3f0f",
  measurementId: "G-867JZ2ERVF"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


console.log(firebase.app().name);