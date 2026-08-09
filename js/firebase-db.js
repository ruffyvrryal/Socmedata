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
    db,
    auth
} from "./firebase.js";

// =====================================
// CURRENT AUTHENTICATED USER
// =====================================

export function getCurrentUser(){

    return auth.currentUser || null;

}


// =====================================
// GET PROFILES FOR CURRENT USER
// =====================================

export async function getProfiles(){

    try{

        const user = getCurrentUser();

        if(!user){

            console.warn(
                "No authenticated user. Cannot load Vaults."
            );

            return [];

        }

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "profiles"
                )
            );

        const profiles = [];

        snapshot.forEach(
            (docSnapshot) => {

                const data =
                    docSnapshot.data();

                if(
                    data.ownerId === user.uid
                ){

                    profiles.push({

                        ...data,

                        firestoreId:
                            docSnapshot.id

                    });

                }

            }
        );

        console.log(
            "User Vaults loaded:",
            profiles
        );

        return profiles;

    }
    catch(error){

        console.error(
            "Failed to load user Vaults:",
            error
        );

        return [];

    }

}


// =====================================
// GET ONE PROFILE FOR CURRENT USER
// =====================================

export async function getProfile(
    profileId
){

    try{

        const user =
            getCurrentUser();

        if(!user){

            console.warn(
                "No authenticated user. Cannot load Vault."
            );

            return null;

        }

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

        if(
            !snapshot.exists()
        ){

            console.warn(
                "Profile document does not exist:",
                String(profileId)
            );

            return null;

        }

        const data =
            snapshot.data();

        // =================================
        // SECURITY / OWNERSHIP CHECK
        // =================================

        if(
            data.ownerId !== user.uid
        ){

            console.warn(
                "Profile does not belong to current user:",
                String(profileId)
            );

            return null;

        }

        return {

            ...data,

            id:
                data.id ??
                snapshot.id,

            firestoreId:
                snapshot.id

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