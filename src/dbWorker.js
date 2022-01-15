const { parentPort } = require('worker_threads');
const { initializeApp } = require("firebase/app");
const { collection, addDoc, getFirestore, doc, setDoc } = require("firebase/firestore");
//firebase credentials
const firebaseConfig = {
    apiKey: "AIzaSyCLC1nAD3AR-mIKBG5oaMs00Khy53k77Ro",
    authDomain: "vietlott-e17f6.firebaseapp.com",
    projectId: "vietlott-e17f6",
    storageBucket: "vietlott-e17f6.appspot.com",
    messagingSenderId: "590261053169",
    appId: "1:590261053169:web:55668fbf37165e3a02eb50"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

// recieve crawled data from main thread
parentPort.once("message", async (message) => {
    console.log("Recieved data from mainWorker...");
    await setDoc(doc(db, "Vietlott645", message.id + ''), message);
    // .then(() => {
    //     // send data back to main thread if operation was successful
        
    // })
    // .catch((err) => console.log(err));
    parentPort.postMessage("Data saved successfully");
    // const docRef = await addDoc(collection(db, "Vietlott645"), message).then(() => {
    //     // send data back to main thread if operation was successful
    //     parentPort.postMessage("Data saved successfully");
    // })
    // .catch((err) => console.log(err));
});
