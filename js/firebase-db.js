// =====================================
// SOCMEDATA FIRESTORE DATABASE HELPER
// =====================================

// Firebase Firestore
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================
// IMPORT FIRESTORE DATABASE
// =====================================

import {
    db
} from "./firebase.js";


// =====================================
// PROFILE FUNCTIONS
// =====================================


// GET ALL PROFILES
export async function getProfiles(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "profiles"
                )
            );

        const profiles = [];

        snapshot.forEach(
            document => {

                profiles.push({

                    id:
                        document.id,

                    ...document.data()

                });

            }
        );

        return profiles;

    }
    catch(error){

        console.error(
            "Error loading profiles:",
            error
        );

        return [];

    }

}



// =====================================
// GET ONE PROFILE
// =====================================

export async function getProfile(
    profileId
){

    try{

        const profileRef =
            doc(
                db,
                "profiles",
                String(profileId)
            );


        const snapshot =
            await getDoc(
                profileRef
            );


        if(!snapshot.exists()){

            return null;

        }


        return {

            id:
                snapshot.id,

            ...snapshot.data()

        };

    }
    catch(error){

        console.error(
            "Error loading profile:",
            error
        );

        return null;

    }

}



// =====================================
// SAVE PROFILE
// =====================================

export async function saveProfile(
    profile
){

    try{

        const profileRef =
            doc(
                db,
                "profiles",
                String(profile.id)
            );


        await setDoc(
            profileRef,
            profile
        );


        console.log(
            "Profile saved to Firestore:",
            profile.id
        );


        return true;

    }
    catch(error){

        console.error(
            "Error saving profile:",
            error
        );

        return false;

    }

}



// =====================================
// DELETE PROFILE
// =====================================

export async function deleteProfile(
    profileId
){

    try{

        await deleteDoc(

            doc(
                db,
                "profiles",
                String(profileId)
            )

        );


        console.log(
            "Profile deleted from Firestore:",
            profileId
        );


        return true;

    }
    catch(error){

        console.error(
            "Error deleting profile:",
            error
        );

        return false;

    }

}



// =====================================
// TEST HELPER
// =====================================

export async function testDatabase(){

    const profiles =
        await getProfiles();


    console.log(
        "Firestore profiles:",
        profiles
    );


    return profiles;

}

// =====================================
// MIGRATE LOCALSTORAGE → FIRESTORE
// =====================================

async function migrateLocalStorageToFirestore(){

    try{

        // Get existing LocalStorage data
        const storedProfiles =
            JSON.parse(
                localStorage.getItem("profiles")
            ) || [];


        if(storedProfiles.length === 0){

            console.log(
                "No LocalStorage profiles found."
            );

            return;

        }


        console.log(
            "Starting migration..."
        );


        console.log(
            "Profiles to migrate:",
            storedProfiles
        );


        // ---------------------------------
        // MIGRATE EACH VAULT
        // ---------------------------------

        for(const profile of storedProfiles){

            await setDoc(
                doc(
                    db,
                    "profiles",
                    String(profile.id)
                ),
                profile
            );


            console.log(
                "Vault migrated:",
                profile.name
            );

        }


        console.log(
            "================================="
        );

        console.log(
            "MIGRATION SUCCESSFUL"
        );

        console.log(
            "Vaults migrated:",
            storedProfiles.length
        );

        console.log(
            "================================="
        );


    }catch(error){

        console.error(
            "Migration failed:",
            error
        );

    }

}

window.migrateLocalStorageToFirestore =
    migrateLocalStorageToFirestore;


    // =====================================
// LOAD PROFILES FROM FIRESTORE
// =====================================

async function loadProfilesFromFirestore(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "profiles"
                )
            );


        const firestoreProfiles =
            snapshot.docs.map(
                doc => doc.data()
            );


        console.log(
            "Profiles loaded from Firestore:",
            firestoreProfiles
        );


        console.log(
            "Firestore profile count:",
            firestoreProfiles.length
        );


        return firestoreProfiles;


    }catch(error){

        console.error(
            "Failed to load profiles from Firestore:",
            error
        );

        return [];

    }

}


// Make available from Console

window.loadProfilesFromFirestore =
    loadProfilesFromFirestore;
    
testDatabase();