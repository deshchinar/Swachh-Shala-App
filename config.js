import { initializeApp } from 'firebase/app';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
// Chinar's Config
const firebaseConfig = {
 
    apiKey: "AIzaSyDL5H7QgL6s5925dTs0Y60WLD9qvI6FK_4",
   
    authDomain: "swachha-shala.firebaseapp.com",
   
    projectId: "swachha-shala",
   
    storageBucket: "swachha-shala.appspot.com",
   
    messagingSenderId: "1033474050565",
   
    appId: "1:1033474050565:web:1390d199f8422e61052a6c",
   
    measurementId: "G-55D6QZRCFW"
   
  };


//My Config
// const firebaseConfig = {
//   apiKey: "AIzaSyDWsn3Py9y454S4YxSGZj1Zd32K9YGraCU",
//   authDomain: "swachhashala-c8f0f.firebaseapp.com",
//   databaseURL: "https://swachhashala-c8f0f-default-rtdb.firebaseio.com",
//   projectId: "swachhashala-c8f0f",
//   storageBucket: "swachhashala-c8f0f.appspot.com",
//   messagingSenderId: "125254031242",
//   appId: "1:125254031242:web:db9627443bab0d70d51a73",
//   measurementId: "G-EJW9259CP0"
// };

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };

