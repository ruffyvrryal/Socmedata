// =====================================
// SOCMEDATA FIRESTORE DATABASE HELPER
// =====================================

// =====================================
// FIREBASE FIRESTORE
// =====================================

import {
    collection,
    collectionGroup,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================
// FIREBASE APP
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
// GET ALL VAULTS USER CAN ACCESS
// =====================================

export async function getProfiles(){

    try{

        const user =
            getCurrentUser();


        if(!user){

            console.warn(
                "No authenticated user. Cannot load Vaults."
            );

            return [];

        }


        const profiles = [];


        // =================================
        // LOAD VAULTS OWNED BY USER
        // =================================

        const ownerQuery =
            query(
                collection(
                    db,
                    "profiles"
                ),
                where(
                    "ownerId",
                    "==",
                    user.uid
                )
            );


        const ownerSnapshot =
            await getDocs(
                ownerQuery
            );


        // =================================
        // ADD OWNER VAULTS
        // =================================

        ownerSnapshot.forEach(
            profileSnapshot => {

                const data =
                    profileSnapshot.data();


                const vaultId =
                    profileSnapshot.id;


                profiles.push({

                    ...data,

                    id:
                        data.id ??
                        vaultId,

                    firestoreId:
                        vaultId,

                    accessRole:
                        "owner"

                });

            }
        );


        // =================================
        // LOAD COLLABORATOR VAULTS
        // =================================

        const collaboratorQuery =
            query(
                collectionGroup(
                    db,
                    "collaborators"
                ),
                where(
                    "uid",
                    "==",
                    user.uid
                )
            );


        const collaboratorSnapshot =
            await getDocs(
                collaboratorQuery
            );


        // =================================
        // BUILD COLLABORATOR VAULT LIST
        // =================================

        const collaboratorProfiles = [];


        for(
            const collaboratorDocument
            of collaboratorSnapshot.docs
        ){

            const collaboratorData =
                collaboratorDocument.data();


            const collaboratorPath =
                collaboratorDocument.ref.path;


            const pathParts =
                collaboratorPath.split("/");


            const vaultId =
                pathParts[1];


            if(!vaultId){

                continue;

            }


            collaboratorProfiles.push({

                vaultId:
                    vaultId,

                role:
                    collaboratorData.role ||
                    "editor"

            });

        }


        // =================================
        // LOAD COLLABORATOR VAULT DOCUMENTS
        // =================================

        for(
            const collaborator
            of collaboratorProfiles
        ){

            const profileRef =
                doc(
                    db,
                    "profiles",
                    String(collaborator.vaultId)
                );


            const profileSnapshot =
                await getDoc(
                    profileRef
                );


            if(
                !profileSnapshot.exists()
            ){

                continue;

            }


            const data =
                profileSnapshot.data();


            // =================================
            // AVOID DUPLICATES
            // =================================

            const alreadyLoaded =
                profiles.some(
                    profile =>
                        String(profile.firestoreId) ===
                        String(profileSnapshot.id)
                );


            if(alreadyLoaded){

                continue;

            }


            // =================================
            // ADD COLLABORATOR VAULT
            // =================================

            profiles.push({

                ...data,

                id:
                    data.id ??
                    profileSnapshot.id,

                firestoreId:
                    profileSnapshot.id,

                accessRole:
                    collaborator.role ||
                    "editor"

            });

        }


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
// GET ONE VAULT
// =====================================
//
// Owners and collaborators can both load
// the Vault.
//

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


        // =================================
        // VAULT REFERENCE
        // =================================

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
                "Vault does not exist:",
                String(profileId)
            );

            return null;

        }


        const data =
            snapshot.data();


        // =================================
        // OWNER CHECK
        // =================================

        const isOwner =
            String(data.ownerId || "") ===
            String(user.uid);


        // =================================
        // COLLABORATOR CHECK
        // =================================

        let collaborator =
            null;


        if(!isOwner){

            try{

                const collaboratorRef =
                    doc(
                        db,
                        "profiles",
                        String(profileId),
                        "collaborators",
                        String(user.uid)
                    );


                const collaboratorSnapshot =
                    await getDoc(
                        collaboratorRef
                    );


                if(
                    collaboratorSnapshot.exists()
                ){

                    collaborator =
                        collaboratorSnapshot.data();

                }

            }
            catch(error){

                console.warn(
                    "Unable to check Vault collaborator:",
                    error
                );

            }

        }


        // =================================
        // ACCESS DENIED
        // =================================

        if(
            !isOwner &&
            !collaborator
        ){

            console.warn(
                "Current user does not have access to Vault:",
                String(profileId)
            );

            return null;

        }


        // =================================
        // RETURN VAULT
        // =================================

        return {

            ...data,

            id:
                data.id ??
                snapshot.id,

            firestoreId:
                snapshot.id,

            accessRole:
                isOwner
                ?
                "owner"
                :
                (
                    collaborator?.role ||
                    "editor"
                )

        };

    }

    catch(error){

        console.error(
            "Error loading Vault:",
            error
        );


        return null;

    }

}


// =====================================
// SAVE VAULT
// =====================================
//
// Owners and editors can update a Vault.
// Firestore Security Rules remain the final
// authority.
//

export async function saveProfile(
    profile
){

    try{

        const user =
            getCurrentUser();


        if(!user){

            console.error(
                "Cannot save Vault: no authenticated user."
            );

            return false;

        }


        if(
            !profile ||
            profile.id === undefined ||
            profile.id === null
        ){

            console.error(
                "Cannot save Vault: invalid profile."
            );

            return false;

        }


        // =================================
        // CHECK ACCESS
        // =================================

        const existingVault =
            await getProfile(
                profile.id
            );


        if(!existingVault){

            console.error(
                "Cannot save Vault: user does not have access."
            );

            return false;

        }


        // =================================
        // VAULT REFERENCE
        // =================================

        const profileRef =
            doc(
                db,
                "profiles",
                String(profile.id)
            );


        const dataToSave = {

            ...profile,

            id:
                profile.id

        };


        await setDoc(
            profileRef,
            dataToSave
        );


        console.log(
            "Vault saved to Firestore:",
            profile.id
        );


        return true;

    }

    catch(error){

        console.error(
            "Error saving Vault:",
            error
        );


        return false;

    }

}


// =====================================
// DELETE VAULT
// =====================================

export async function deleteProfile(
    profileId
){

    try{

        const user =
            getCurrentUser();


        if(!user){

            return false;

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

            return false;

        }


        const vault =
            snapshot.data();


        // =================================
        // OWNER ONLY
        // =================================

        if(
            String(vault.ownerId || "") !==
            String(user.uid)
        ){

            console.warn(
                "Only the Vault owner can delete the Vault."
            );

            return false;

        }


        await deleteDoc(
            profileRef
        );


        console.log(
            "Vault deleted:",
            profileId
        );


        return true;

    }

    catch(error){

        console.error(
            "Error deleting Vault:",
            error
        );


        return false;

    }

}


// =====================================
// ADD VAULT COLLABORATOR
// =====================================

export async function addVaultCollaborator(
    vaultId,
    userId,
    shareToken,
    role = "editor"
){

    try{

        // =================================
        // CURRENT USER
        // =================================

        const user =
            getCurrentUser();

        if(!user){

            console.warn(
                "No authenticated user."
            );

            return false;

        }


        // =================================
        // USER CAN ONLY REGISTER THEMSELVES
        // =================================

        if(
            String(user.uid) !==
            String(userId)
        ){

            console.warn(
                "A user can only register themselves."
            );

            return false;

        }


        // =================================
        // MAKE SURE USER HAS EMAIL
        // =================================

        const userEmail =
            user.email || "";

        console.log(
            "Collaborator Firebase user:",
            {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            }
        );


        // =================================
        // LOAD VAULT
        // =================================

        const vaultRef =
            doc(
                db,
                "profiles",
                String(vaultId)
            );

        const vaultSnapshot =
            await getDoc(
                vaultRef
            );

        if(
            !vaultSnapshot.exists()
        ){

            console.warn(
                "Vault does not exist:",
                vaultId
            );

            return false;

        }


        const vault =
            vaultSnapshot.data();


        // =================================
        // CHECK SHARING
        // =================================

        if(
            vault.shareEnabled !== true
        ){

            console.warn(
                "Vault sharing is disabled."
            );

            return false;

        }


        // =================================
        // CHECK SHARE TOKEN
        // =================================

        if(
            !vault.shareToken ||
            String(vault.shareToken) !==
            String(shareToken)
        ){

            console.warn(
                "Invalid share token."
            );

            return false;

        }


        // =================================
        // OWNER CHECK
        // =================================

        if(
            String(vault.ownerId || "") ===
            String(user.uid)
        ){

            console.log(
                "User is already the Vault owner."
            );

            return true;

        }


        // =================================
        // COLLABORATOR REFERENCE
        // =================================

        const collaboratorRef =
            doc(
                db,
                "profiles",
                String(vaultId),
                "collaborators",
                String(userId)
            );


        // =================================
        // CHECK EXISTING COLLABORATOR
        // =================================

        const existingSnapshot =
            await getDoc(
                collaboratorRef
            );


        // =================================
        // UPDATE EXISTING COLLABORATOR
        // =================================

        if(
            existingSnapshot.exists()
        ){

            console.log(
                "Collaborator already exists. Updating information..."
            );

            await setDoc(
                collaboratorRef,
                {

                    uid:
                        String(userId),

                    email:
                        userEmail,

                    displayName:
                        user.displayName || "",

                    role:
                        role || "editor",

                    updatedAt:
                        Date.now()

                },
                {
                    merge: true
                }
            );

            console.log(
                "Existing collaborator updated:",
                {
                    uid: userId,
                    email: userEmail
                }
            );

            return true;

        }


        // =================================
        // CREATE NEW COLLABORATOR
        // =================================

        await setDoc(
            collaboratorRef,
            {

                uid:
                    String(userId),

                email:
                    userEmail,

                displayName:
                    user.displayName || "",

                role:
                    role || "editor",

                createdAt:
                    Date.now()

            }
        );


        console.log(
            "Collaborator added:",
            {
                uid: userId,
                email: userEmail
            }
        );


        return true;

    }

    catch(error){

        console.error(
            "Error adding collaborator:",
            error
        );

        return false;

    }

}

// =====================================
// GET VAULT COLLABORATOR
// =====================================

export async function getVaultCollaborator(
    vaultId,
    userId
){

    try{

        const user =
            getCurrentUser();


        if(!user){

            return null;

        }


        // =================================
        // USER CAN ONLY CHECK THEIR OWN
        // COLLABORATOR RECORD
        // =================================

        if(
            String(user.uid) !==
            String(userId)
        ){

            console.warn(
                "Cannot check another user's collaborator record."
            );

            return null;

        }


        const collaboratorRef =
            doc(
                db,
                "profiles",
                String(vaultId),
                "collaborators",
                String(userId)
            );


        const snapshot =
            await getDoc(
                collaboratorRef
            );


        if(
            !snapshot.exists()
        ){

            return null;

        }


        return {

            ...snapshot.data(),

            uid:
                String(userId)

        };

    }

    catch(error){

        console.error(
            "Error loading collaborator:",
            error
        );


        return null;

    }

}


// =====================================
// REMOVE VAULT COLLABORATOR
// =====================================

export async function removeVaultCollaborator(
    vaultId,
    userId
){

    try{

        const user =
            getCurrentUser();


        if(!user){

            return false;

        }


        // =================================
        // LOAD VAULT
        // =================================

        const vaultRef =
            doc(
                db,
                "profiles",
                String(vaultId)
            );


        const vaultSnapshot =
            await getDoc(
                vaultRef
            );


        if(
            !vaultSnapshot.exists()
        ){

            return false;

        }


        const vault =
            vaultSnapshot.data();


        // =================================
        // OWNER ONLY
        // =================================

        if(
            String(vault.ownerId || "") !==
            String(user.uid)
        ){

            console.warn(
                "Only the Vault owner can remove collaborators."
            );

            return false;

        }


        // =================================
        // COLLABORATOR REFERENCE
        // =================================

        const collaboratorRef =
            doc(
                db,
                "profiles",
                String(vaultId),
                "collaborators",
                String(userId)
            );


        await deleteDoc(
            collaboratorRef
        );


        console.log(
            "Collaborator removed:",
            userId
        );


        return true;

    }

    catch(error){

        console.error(
            "Error removing collaborator:",
            error
        );


        return false;

    }

}


// =====================================
// CREATE SHARE INVITATION
// =====================================

export async function createShareInvitation(
    profileId
){

    try{

        const user =
            getCurrentUser();


        if(!user){

            console.warn(
                "No authenticated user."
            );

            return null;

        }


        // =================================
        // LOAD VAULT
        // =================================

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

            console.error(
                "Vault does not exist:",
                profileId
            );

            return null;

        }


        const profile =
            snapshot.data();


        // =================================
        // OWNER ONLY
        // =================================

        if(
            String(profile.ownerId || "") !==
            String(user.uid)
        ){

            console.error(
                "Only the Vault owner can create invitations."
            );

            return null;

        }


        // =================================
        // GENERATE RANDOM TOKEN
        // =================================

        const randomValues =
            new Uint8Array(32);


        crypto.getRandomValues(
            randomValues
        );


        const token =
            Array.from(
                randomValues
            )
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");


        // =================================
        // ENABLE SHARING
        // =================================

        await updateDoc(
            profileRef,
            {

                shareEnabled:
                    true,

                shareToken:
                    token

            }
        );


        console.log(
            "Vault sharing enabled."
        );


        // =================================
        // RETURN INVITATION
        // =================================

        return {

            id:
                `${Date.now()}_${token.slice(0, 12)}`,

            vaultId:
                String(profileId),

            ownerId:
                user.uid,

            role:
                "editor",

            token:
                token,

            status:
                "pending",

            createdAt:
                Date.now()

        };

    }

    catch(error){

        console.error(
            "Failed to create share invitation:",
            error
        );


        return null;

    }

}


// =====================================
// DISABLE VAULT SHARING
// =====================================

export async function disableVaultSharing(
    vaultId
){

    try{

        const user =
            getCurrentUser();


        if(!user){

            return false;

        }


        const vaultRef =
            doc(
                db,
                "profiles",
                String(vaultId)
            );


        const snapshot =
            await getDoc(
                vaultRef
            );


        if(
            !snapshot.exists()
        ){

            return false;

        }


        const vault =
            snapshot.data();


        // =================================
        // OWNER ONLY
        // =================================

        if(
            String(vault.ownerId || "") !==
            String(user.uid)
        ){

            console.warn(
                "Only the Vault owner can disable sharing."
            );

            return false;

        }


        await updateDoc(
            vaultRef,
            {

                shareEnabled:
                    false

            }
        );


        console.log(
            "Vault sharing disabled:",
            vaultId
        );


        return true;

    }

    catch(error){

        console.error(
            "Failed to disable Vault sharing:",
            error
        );


        return false;

    }

}


// =====================================
// GET ALL COLLABORATORS
// =====================================

export async function getVaultCollaborators(vaultId){

    try{

        const user =
            getCurrentUser();

        if(!user){
            return [];
        }

        // =================================
        // LOAD VAULT
        // =================================

        const vaultSnapshot =
            await getDoc(
                doc(
                    db,
                    "profiles",
                    String(vaultId)
                )
            );

        if(!vaultSnapshot.exists()){
            return [];
        }

        const vault =
            vaultSnapshot.data();

        // =================================
        // OWNER ONLY
        // =================================

        if(
            String(vault.ownerId || "") !==
            String(user.uid)
        ){

            console.warn(
                "Only the Vault owner can view collaborators."
            );

            return [];

        }

        // =================================
        // LOAD COLLABORATORS
        // =================================

        const collaboratorsSnapshot =
            await getDocs(
                collection(
                    db,
                    "profiles",
                    String(vaultId),
                    "collaborators"
                )
            );

        const collaborators = [];

        // =================================
        // BUILD COLLABORATOR LIST
        // =================================

        collaboratorsSnapshot.forEach(
            collaboratorSnapshot => {

                const data =
                    collaboratorSnapshot.data();

                collaborators.push({

                    ...data,

                    uid:
                        data.uid ||
                        collaboratorSnapshot.id,

                    email:
                        data.email ||
                        "",

                    role:
                        data.role ||
                        "editor"

                });

            }
        );

        console.log(
            "Collaborators loaded:",
            collaborators
        );

        return collaborators;

    }

    catch(error){

        console.error(
            "Error loading collaborators:",
            error
        );

        return [];

    }

}


// =====================================
// UPDATE COLLABORATOR ROLE
// =====================================

export async function updateVaultCollaboratorRole(
    vaultId,
    userId,
    role
){

    try{

        const user =
            getCurrentUser();


        if(!user){

            return false;

        }


        // =================================
        // VERIFY OWNER
        // =================================

        const vaultSnapshot =
            await getDoc(
                doc(
                    db,
                    "profiles",
                    String(vaultId)
                )
            );


        if(
            !vaultSnapshot.exists()
        ){

            return false;

        }


        const vault =
            vaultSnapshot.data();


        if(
            String(vault.ownerId || "") !==
            String(user.uid)
        ){

            console.warn(
                "Only the Vault owner can change collaborator roles."
            );

            return false;

        }


        // =================================
        // ONLY EDITOR CURRENTLY SUPPORTED
        // =================================

        if(
            role !== "editor"
        ){

            console.warn(
                "Invalid collaborator role:",
                role
            );

            return false;

        }


        // =================================
        // UPDATE COLLABORATOR
        // =================================

        const collaboratorRef =
            doc(
                db,
                "profiles",
                String(vaultId),
                "collaborators",
                String(userId)
            );


        await setDoc(
    collaboratorRef,
    {

        uid:
            String(userId),

        email:
            user.email || "",

        displayName:
            user.displayName || "",

        role:
            role || "editor",

        createdAt:
            Date.now()

    }
);


        console.log(
            "Collaborator role updated:",
            userId,
            role
        );


        return true;

    }

    catch(error){

        console.error(
            "Error updating collaborator role:",
            error
        );


        return false;

    }

}