// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyALltClsta1B7tK9gxy0f5EZUWwdywJh6Q",
    authDomain: "bypass-me.firebaseapp.com",
    projectId: "bypass-me",
    storageBucket: "bypass-me.appspot.com",
    messagingSenderId: "1050837582471",
    appId: "1:1050837582471:web:c901834621b2f71decae22"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Function to check if the user has already visited the site
function hasVisited() {
    const user = firebase.auth().currentUser;
    return !!user;
}

// Function to sign in anonymously and check if the user has visited before
function checkAndSignIn() {
    firebase.auth().signInAnonymously()
        .then(() => {
            if (hasVisited()) {
                alert("You've already visited this website.");
                document.getElementById("viewButton").disabled = true;
            } else {
                // User hasn't visited before, store their visit in Firestore
                db.collection("VisitedUsers").add({
                    uid: firebase.auth().currentUser.uid
                })
                .then(() => console.log("Document written successfully!"))
                .catch((error) => console.error("Error writing document: ", error));
            }
        })
        .catch((error) => {
            console.error("Error signing in:", error);
        });
}

// Initialize the page
window.onload = function() {
    document.getElementById("viewButton").addEventListener("click", checkAndSignIn);
};
