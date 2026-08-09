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
// GET ALL PROFILES
// =====================================

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
                String(
                    profileId
                )
            );


        const snapshot =
            await getDoc(
                profileRef
            );


        if(
            !snapshot.exists()
        ){

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

        if(
            !profile ||
            profile.id === undefined ||
            profile.id === null
        ){

            console.error(
                "Cannot save profile: invalid profile."
            );


            return false;

        }


        const profileRef =
            doc(
                db,
                "profiles",
                String(
                    profile.id
                )
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
                String(
                    profileId
                )
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