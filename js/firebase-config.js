// firebase-config.js
// Initialize Firebase (loaded once)
const firebaseConfig = {
  apiKey: "AIzaSyCS98TwN_CqGLuS1a600P76La7I7t6kJqU",
  authDomain: "facilitymanagement-47470.firebaseapp.com",
  projectId: "facilitymanagement-47470",
  storageBucket: "facilitymanagement-47470.firebasestorage.app",
  messagingSenderId: "638809761503",
  appId: "1:638809761503:web:1a15443eeeee2414aaab6a"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized");
} else {
  console.log("⚡ Firebase already initialized");
}

window.db = firebase.firestore();
window.auth = firebase.auth();