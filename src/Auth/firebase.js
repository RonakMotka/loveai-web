// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";

// Your web Firebase config (from the JSON you gave)
const firebaseConfig = {
  apiKey: "AIzaSyBnGxp5ErRizhT_frG7lHkanv3bkM8XYiE",
  authDomain: "loveai-e3be0.firebaseapp.com",
  projectId: "loveai-e3be0",
  storageBucket: "loveai-e3be0.appspot.com",
  messagingSenderId: "736402090832",
  appId: "1:736402090832:web:f1467eca01dbfa18bd1a55", // optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const vapidKey = "BEPvvywK-3Z1M4A6ORbppBJTNFcJBe3IiTa5HCxePM8yRKrHaGQhxU4_clTZ8TF1z9_WtRHigHWJx6EV_clE7N8"

const messaging = getMessaging(app)

const requestFCMToken = async () => {
    return Notification.requestPermission()
    .then((permission)=>{
        if(permission === "granted"){
            return getToken(messaging, {vapidKey})
        } else {
            throw new Error("Notification permission not granted!")
        }
    })
    .catch((err)=>{
        console.error("Error getting FCM Token: ", err)
        throw err;
    })
}

export { auth, provider, signInWithPopup, requestFCMToken };
