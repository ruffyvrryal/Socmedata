import {
    auth
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// =====================================
// LOGIN ELEMENTS
// =====================================

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


// =====================================
// REGISTER ELEMENTS
// =====================================

const registerForm =
    document.getElementById(
        "registerForm"
    );

const registerName =
    document.getElementById(
        "registerName"
    );

const registerEmail =
    document.getElementById(
        "registerEmail"
    );

const registerPassword =
    document.getElementById(
        "registerPassword"
    );

const registerMessage =
    document.getElementById(
        "registerMessage"
    );


// =====================================
// LOGIN
// =====================================

if(loginForm){

    loginForm.addEventListener(
        "submit",
        async function(event){

            event.preventDefault();

            loginMessage.textContent =
                "Logging in...";

            try{

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        loginEmail.value.trim(),
                        loginPassword.value
                    );

                console.log(
                    "Login successful:",
                    userCredential.user
                );

                loginMessage.textContent =
                    "Login successful.";

                window.location.href =
                    "../index.html";

            }

            catch(error){

                console.error(
                    "Login failed:",
                    error
                );

                loginMessage.textContent =
                    error.message;

            }

        }
    );

}


// =====================================
// REGISTER
// =====================================

if(registerForm){

    registerForm.addEventListener(
        "submit",
        async function(event){

            event.preventDefault();

            registerMessage.textContent =
                "Creating account...";

            try{

                const userCredential =
    await createUserWithEmailAndPassword(
        auth,
        registerEmail.value.trim(),
        registerPassword.value
    );

await updateProfile(
    userCredential.user,
    {
        displayName:
            registerName.value.trim()
    }
);

                console.log(
                    "Registration successful:",
                    userCredential.user
                );

                registerMessage.textContent =
                    "Account created successfully.";

            }

            catch(error){

                console.error(
                    "Registration failed:",
                    error
                );

                registerMessage.textContent =
                    error.message;

            }

        }
    );

    // =====================================
// AUTHENTICATION STATE
// =====================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "Authenticated user:",
                user.uid
            );

            console.log(
                "Authenticated email:",
                user.email
            );

        } else {

            console.log(
                "No authenticated user."
            );

        }

    }
);

}