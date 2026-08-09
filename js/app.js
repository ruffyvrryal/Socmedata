// =====================================
// SOCMEDATA VAULT SYSTEM
// FIRESTORE VERSION
// =====================================

import {
    getProfiles,
    saveProfile,
    deleteProfile,
    getVaultCollaborators,
    removeVaultCollaborator
} from "./firebase-db.js";

import {
    auth
} from "./firebase.js";


// =====================================
// APPLICATION DATA
// =====================================

let profiles = [];


// =====================================
// ELEMENTS
// =====================================

const profileList =
    document.getElementById("profileList");

const searchVault =
    document.getElementById("searchVault");


// =====================================
// CREATE VAULT MODAL
// =====================================

const createVaultModal =
    document.getElementById("createVaultModal");

const closeCreateVault =
    document.getElementById("closeCreateVault");

const cancelCreateVault =
    document.getElementById("cancelCreateVault");

const saveCreateVault =
    document.getElementById("saveCreateVault");

const createVaultName =
    document.getElementById("createVaultName");

const createVaultDescription =
    document.getElementById("createVaultDescription");


// =====================================
// EDIT VAULT MODAL
// =====================================

const vaultModal =
    document.getElementById("vaultModal");

const closeVaultModal =
    document.getElementById("closeVaultModal");

const cancelVault =
    document.getElementById("cancelVault");

const saveVault =
    document.getElementById("saveVault");

const deleteVault =
    document.getElementById("deleteVault");

const vaultName =
    document.getElementById("vaultName");

const vaultDescription =
    document.getElementById("vaultDescription");


// =====================================
// DELETE MODAL
// =====================================

const deleteModal =
    document.getElementById("deleteModal");

const closeDeleteModal =
    document.getElementById("closeDeleteModal");

const cancelDelete =
    document.getElementById("cancelDelete");

const confirmDelete =
    document.getElementById("confirmDelete");

let deleteVaultId = null;
let editingVaultId = null;

// =====================================
// SHARE VAULT MODAL
// =====================================

const shareVaultModal =
    document.getElementById(
        "shareVaultModal"
    );

const closeShareVault =
    document.getElementById(
        "closeShareVault"
    );

const cancelShareVault =
    document.getElementById(
        "cancelShareVault"
    );

const generateShareVault =
    document.getElementById(
        "generateShareVault"
    );

const copyShareVaultLink =
    document.getElementById(
        "copyShareVaultLink"
    );

const shareVaultLink =
    document.getElementById(
        "shareVaultLink"
    );

const shareVaultStatus =
    document.getElementById(
        "shareVaultStatus"
    );

const shareVaultLinkContainer =
    document.getElementById(
        "shareVaultLinkContainer"
    );

const shareVaultDescription =
    document.getElementById(
        "shareVaultDescription"
    );

const shareVaultCollaborators =
    document.getElementById(
        "shareVaultCollaborators"
    );

const collaboratorList =
    document.getElementById(
        "collaboratorList"
    );

// Currently selected Vault for sharing
let sharingVault = null;

// =====================================
// LOAD VAULTS FROM FIRESTORE
// =====================================

async function loadProfiles(){

    try{

        console.log(
            "Loading Vaults from Firestore..."
        );

        profiles =
            await getProfiles();

        console.log(
            "Vaults loaded:",
            profiles
        );

        showProfiles();

    }
    catch(error){

        console.error(
            "Failed to load Vaults:",
            error
        );

        alert(
            "Failed to load Vaults from Firebase."
        );

    }

}


// =====================================
// RENDER VAULTS
// =====================================

function showProfiles(){

    if(!profileList)
        return;

    profileList.innerHTML = "";

    let filteredProfiles =
        profiles.filter(profile => {

            if(!searchVault)
                return true;

            const keyword =
                searchVault.value
                .toLowerCase()
                .trim();

            return (
                String(profile.name || "")
                    .toLowerCase()
                    .includes(keyword)
                ||
                String(profile.description || "")
                    .toLowerCase()
                    .includes(keyword)
            );

        });


   filteredProfiles.forEach(
    (profile,index) => {

        const card =
            document.createElement("div");


        card.className =
            "profile-card";


        card.style.animationDelay =
            (index * 0.12) + "s";


        card.innerHTML = `

            <div class="vault-top">

                <div class="vault-icon">
                    📁
                </div>


                <button
                    class="vault-menu"
                    title="Vault options"
                >
                    ⋮
                </button>

            </div>


            <h3>
                ${profile.name || "Unnamed Vault"}
            </h3>


            <p>
                ${profile.description || ""}
            </p>


            <div class="vault-info">

                <span>
                    📱 ${(profile.accounts || []).length}
                    Accounts
                </span>


                <span>
                    📅 ${getTotalContent(profile)}
                    Posts
                </span>

            </div>


            <div class="vault-open">

                <button
                    class="open-vault-btn"
                >
                    Open Vault →
                </button>


                <button
                    class="share-vault-btn"
                >
                    🔗 Share
                </button>

            </div>

        `;


        // =================================
        // GET BUTTONS
        // =================================

        const menuButton =
            card.querySelector(
                ".vault-menu"
            );


        const openButton =
            card.querySelector(
                ".open-vault-btn"
            );


        const shareButton =
            card.querySelector(
                ".share-vault-btn"
            );


        // =================================
        // OPEN VAULT
        // =================================

        openButton.onclick =
            function(event){

                event.stopPropagation();


                openProfile(
                    profile.id
                );

            };


        // =================================
        // SHARE VAULT
        // =================================

        shareButton.onclick =
            function(event){

                event.stopPropagation();


                console.log(
                    "Share Vault clicked:",
                    profile.id
                );


                openShareVaultModal(
                    profile
                );

            };


        // =================================
        // EDIT VAULT
        // =================================

        menuButton.onclick =
            function(event){

                event.stopPropagation();


                editingVaultId =
                    profile.id;


                vaultName.value =
                    profile.name || "";


                vaultDescription.value =
                    profile.description || "";


                vaultModal.style.display =
                    "flex";

            };


        profileList.appendChild(
            card
        );

    }
    );

}


// =====================================
// TOTAL CONTENT
// =====================================

function getTotalContent(profile){

    if(
        Array.isArray(profile.contents)
    ){

        return profile.contents.length;

    }


    let total = 0;


    if(
        Array.isArray(profile.accounts)
    ){

        profile.accounts.forEach(
            account => {

                total +=
                    Array.isArray(
                        account.contents
                    )
                    ?
                    account.contents.length
                    :
                    0;

            }
        );

    }


    return total;

}


// =====================================
// OPEN VAULT
// =====================================

function openProfile(id){

    console.log(
        "Opening Vault:",
        id
    );


    localStorage.setItem(
        "activeProfileId",
        String(id)
    );


    window.location.href =
        "pages/dashboard.html";

}

// =====================================
// LOAD VAULT COLLABORATORS
// =====================================

async function loadVaultCollaborators(vaultId){

    if(!collaboratorList){

        return;

    }


    collaboratorList.innerHTML =
        "Loading collaborators...";


    try{

        const user =
            auth.currentUser;


        if(!user){

            collaboratorList.innerHTML =
                "You must be signed in.";

            return;

        }


        // =================================
        // LOAD COLLABORATORS FROM FIRESTORE
        // =================================

        const collaborators =
            await getVaultCollaborators(
                vaultId
            );


        // =================================
        // NO COLLABORATORS
        // =================================

        if(
            !Array.isArray(collaborators) ||
            collaborators.length === 0
        ){

            collaboratorList.innerHTML =
                "No collaborators yet.";

            return;

        }


        // =================================
        // RENDER COLLABORATORS
        // =================================

        collaboratorList.innerHTML = "";


        collaborators.forEach(
            collaborator => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "collaborator-row";


                row.innerHTML = `

                    <div class="collaborator-info">

                        <strong>
    ${
        collaborator.email ||
        collaborator.displayName ||
        "Unknown collaborator"
    }
</strong>

                        <span>
                            ${collaborator.role || "editor"}
                        </span>

                    </div>


                    <button
                        type="button"
                        class="remove-collaborator"
                        data-user-id="${collaborator.uid}"
                    >
                        Remove
                    </button>

                `;


                const removeButton =
                    row.querySelector(
                        ".remove-collaborator"
                    );


                if(removeButton){

                    removeButton.onclick =
                        async function(){

                            const userId =
                                removeButton.dataset.userId;


                            if(!userId){

                                return;

                            }


                            const confirmed =
                                confirm(
                                    "Remove this collaborator from the Vault?"
                                );


                            if(!confirmed){

                                return;

                            }


                            const success =
                                await removeVaultCollaborator(
                                    vaultId,
                                    userId
                                );


                            if(!success){

                                alert(
                                    "Failed to remove collaborator."
                                );

                                return;

                            }


                            // Reload the list
                            await loadVaultCollaborators(
                                vaultId
                            );

                        };

                }


                collaboratorList.appendChild(
                    row
                );

            }
        );

    }

    catch(error){

        console.error(
            "Failed to load collaborators:",
            error
        );


        collaboratorList.innerHTML =
            "Failed to load collaborators.";

    }

}

// =====================================
// OPEN SHARE VAULT MODAL
// =====================================

function openShareVaultModal(profile){

    console.log(
        "Opening Share Vault modal:",
        profile
    );


    sharingVault =
        profile;


    if(shareVaultDescription){

        shareVaultDescription.textContent =
            `Create a shareable link for "${profile.name || "this Vault"}".`;

    }


    // =================================
    // CURRENT SHARE STATUS
    // =================================

    if(
        profile.shareEnabled &&
        profile.shareToken
    ){

        if(shareVaultStatus){

            shareVaultStatus.textContent =
                "Sharing is enabled for this Vault.";

        }


        if(shareVaultLinkContainer){

            shareVaultLinkContainer.style.display =
                "block";

        }


        if(shareVaultLink){

            shareVaultLink.value =
                createShareVaultURL(
                    profile
                );

        }

    }
    else{

        if(shareVaultStatus){

            shareVaultStatus.textContent =
                "Sharing is currently disabled.";

        }


        if(shareVaultLinkContainer){

            shareVaultLinkContainer.style.display =
                "none";

        }

    }


        if(shareVaultModal){

        shareVaultModal.style.display =
            "flex";

    }


    // =================================
    // LOAD COLLABORATORS
    // =================================

    if(
        shareVaultCollaborators &&
        collaboratorList
    ){

        shareVaultCollaborators.style.display =
            "block";


        loadVaultCollaborators(
            profile.id
        );

    }

}

// =====================================
// GENERATE / ENABLE SHARE VAULT
// =====================================

if(generateShareVault){

    generateShareVault.onclick =
        async function(){

            // =================================
            // CHECK SELECTED VAULT
            // =================================

            if(!sharingVault){

                alert(
                    "No Vault selected."
                );

                return;

            }


            // =================================
            // CHECK AUTHENTICATION
            // =================================

            const user =
                auth.currentUser;

            if(!user){

                alert(
                    "You must be signed in to share a Vault."
                );

                return;

            }


            // =================================
            // CHECK VAULT OWNER
            // =================================

            if(
                sharingVault.ownerId !==
                user.uid
            ){

                alert(
                    "Only the Vault owner can create a share link."
                );

                return;

            }


            // =================================
            // GENERATE TOKEN
            // =================================

            const token =
                generateShareToken();


            // =================================
            // SAVE SHARE SETTINGS
            // =================================

            sharingVault.shareEnabled =
                true;

            sharingVault.shareToken =
                token;


            try{

                console.log(
                    "Enabling Vault sharing:",
                    sharingVault.id
                );


                // =================================
                // SAVE TO FIRESTORE
                // =================================

                const success =
                    await saveProfile(
                        sharingVault
                    );


                if(!success){

                    alert(
                        "Failed to enable Vault sharing."
                    );

                    return;

                }


                // =================================
                // CREATE SHARE URL
                // =================================

                const shareURL =
                    createShareVaultURL(
                        sharingVault
                    );


                // =================================
                // UPDATE MODAL
                // =================================

                if(shareVaultStatus){

                    shareVaultStatus.textContent =
                        "Sharing is enabled for this Vault.";

                }


                if(shareVaultLinkContainer){

                    shareVaultLinkContainer.style.display =
                        "block";

                }


                if(shareVaultLink){

                    shareVaultLink.value =
                        shareURL;

                }


                console.log(
                    "Vault sharing enabled successfully:",
                    shareURL
                );

            }

            catch(error){

                console.error(
                    "Generate share link error:",
                    error
                );


                // =================================
                // ROLLBACK
                // =================================

                sharingVault.shareEnabled =
                    false;

                sharingVault.shareToken =
                    null;


                alert(
                    "Failed to generate share link."
                );

            }

        };

}

// =====================================
// CREATE SHARE VAULT URL
// =====================================

function createShareVaultURL(profile){

    const baseURL =
        window.location.origin +
        window.location.pathname
            .replace(
                /\/[^/]*$/,
                "/"
            );


    return (
        baseURL +
        "pages/shared-vault.html" +
        "?vault=" +
        encodeURIComponent(
            profile.id
        ) +
        "&token=" +
        encodeURIComponent(
            profile.shareToken
        )
    );

}

// =====================================
// GENERATE SHARE TOKEN
// =====================================

function generateShareToken(){

    const randomPart =
        crypto.randomUUID();

    const timePart =
        Date.now().toString(36);

    return (
        timePart +
        "-" +
        randomPart
    );

} 

// =====================================
// CREATE VAULT MODAL
// =====================================

const addProfile =
    document.getElementById(
        "addProfile"
    );

const toolbarCreateVault =
    document.getElementById(
        "toolbarCreateVault"
    );


function openCreateVaultModal(){

    if(createVaultName)
        createVaultName.value = "";

    if(createVaultDescription)
        createVaultDescription.value = "";

    createVaultModal.style.display =
        "flex";

}


if(addProfile){

    addProfile.onclick =
        openCreateVaultModal;

}


if(toolbarCreateVault){

    toolbarCreateVault.onclick =
        openCreateVaultModal;

}


// =====================================
// CREATE VAULT
// =====================================

saveCreateVault.onclick =
    async function(){

        const name =
            createVaultName.value
            .trim();

        const description =
            createVaultDescription.value
            .trim();


        if(!name){

            alert(
                "Please enter vault name."
            );

            return;

        }


        const newProfile = {

    id: Date.now(),

    name: name,

    description:
        description ||
        "New profile",

    // =================================
    // VAULT OWNER
    // =================================

    ownerId:
        auth.currentUser.uid,

    // =================================
    // VAULT COLLABORATORS
    // =================================

    collaborators: [],

    // =================================
    // VAULT SHARING
    // =================================

    shareEnabled: false,

    shareToken: null,

    // =================================
    // VAULT DATA
    // =================================

    accounts: [],

    contents: [],

    schedules: [],

    activities: []

};


        try{

            console.log(
                "Creating Vault:",
                newProfile
            );


            const success =
                await saveProfile(
                    newProfile
                );


            if(!success){

                alert(
                    "Failed to save Vault to Firebase."
                );

                return;

            }


            profiles.push(
                newProfile
            );


            createVaultModal.style.display =
                "none";


            showProfiles();


            console.log(
                "Vault created successfully."
            );

        }
        catch(error){

            console.error(
                "Create Vault error:",
                error
            );

            alert(
                "Failed to create Vault."
            );

        }

    };


// =====================================
// EDIT VAULT
// =====================================

saveVault.onclick =
    async function(event){

        event.stopPropagation();


        const vault =
            profiles.find(
                profile =>
                    String(profile.id) ===
                    String(editingVaultId)
            );


        if(!vault)
            return;


        const oldName =
            vault.name;

        const oldDescription =
            vault.description;


        vault.name =
            vaultName.value.trim();

        vault.description =
            vaultDescription.value.trim();


        try{

            const success =
                await saveProfile(
                    vault
                );


            if(!success){

                vault.name =
                    oldName;

                vault.description =
                    oldDescription;

                alert(
                    "Failed to update Vault."
                );

                return;

            }


            vaultModal.style.display =
                "none";


            showProfiles();


            console.log(
                "Vault updated successfully."
            );

        }
        catch(error){

            console.error(
                "Update Vault error:",
                error
            );

            alert(
                "Failed to update Vault."
            );

        }

    };


// =====================================
// DELETE VAULT
// =====================================

deleteVault.onclick =
    function(event){

        event.stopPropagation();


        deleteVaultId =
            editingVaultId;


        const vault =
            profiles.find(
                profile =>
                    String(profile.id) ===
                    String(deleteVaultId)
            );


        if(vault){

            document.getElementById(
                "deleteVaultText"
            ).innerHTML = `

                Are you sure you want to delete
                <strong>${vault.name}</strong> vault?

                <br><br>

                All accounts, posts, schedules,
                and analytics inside this vault
                will be permanently removed.

            `;

        }


        vaultModal.style.display =
            "none";

        deleteModal.style.display =
            "flex";

    };


// =====================================
// CONFIRM DELETE VAULT
// =====================================

confirmDelete.onclick =
    async function(event){

        event.stopPropagation();


        const vault =
            profiles.find(
                profile =>
                    String(profile.id) ===
                    String(deleteVaultId)
            );


        if(!vault)
            return;


        try{

            console.log(
                "Deleting Vault:",
                vault.id
            );


            const success =
                await deleteProfile(
                    vault.id
                );


            if(!success){

                alert(
                    "Failed to delete Vault from Firebase."
                );

                return;

            }


            profiles =
                profiles.filter(
                    profile =>
                        String(profile.id) !==
                        String(deleteVaultId)
                );


            deleteModal.style.display =
                "none";


            showProfiles();


            console.log(
                "Vault deleted successfully."
            );

        }
        catch(error){

            console.error(
                "Delete Vault error:",
                error
            );

            alert(
                "Failed to delete Vault."
            );

        }

    };


// =====================================
// CLOSE CREATE MODAL
// =====================================

if(closeCreateVault){

    closeCreateVault.onclick =
        function(){

            createVaultModal.style.display =
                "none";

        };

}

// =====================================
// CLOSE SHARE VAULT MODAL
// =====================================

if(closeShareVault){

    closeShareVault.onclick =
        function(){

            shareVaultModal.style.display =
                "none";

            sharingVault = null;

        };

}


if(cancelShareVault){

    cancelShareVault.onclick =
        function(){

            shareVaultModal.style.display =
                "none";

            sharingVault = null;

        };

}

// =====================================
// CREATE SHARE LINK
// =====================================

if(generateShareVault){

    generateShareVault.onclick =
        async function(){

            if(!sharingVault){

                alert(
                    "No Vault selected."
                );

                return;

            }


            // =================================
            // MAKE SURE USER IS AUTHENTICATED
            // =================================

            const user =
                auth.currentUser;


            if(!user){

                alert(
                    "You must be logged in to share a Vault."
                );

                return;

            }


            // =================================
            // MAKE SURE CURRENT USER OWNS VAULT
            // =================================

            if(
                sharingVault.ownerId !==
                user.uid
            ){

                alert(
                    "Only the Vault owner can create a share link."
                );

                return;

            }


            // =================================
            // CREATE TOKEN
            // =================================

            const shareToken =
                generateShareToken();


            // =================================
            // SAVE ORIGINAL VALUES
            // =================================

            const oldShareEnabled =
                sharingVault.shareEnabled;

            const oldShareToken =
                sharingVault.shareToken;


            // =================================
            // UPDATE VAULT
            // =================================

            sharingVault.shareEnabled =
                true;

            sharingVault.shareToken =
                shareToken;


            try{

                console.log(
                    "Creating Share Link for Vault:",
                    sharingVault.id
                );


                // =================================
                // SAVE TO FIRESTORE
                // =================================

                const success =
                    await saveProfile(
                        sharingVault
                    );


                if(!success){

                    sharingVault.shareEnabled =
                        oldShareEnabled;

                    sharingVault.shareToken =
                        oldShareToken;


                    alert(
                        "Failed to create Share Link."
                    );

                    return;

                }


                // =================================
                // CREATE URL
                // =================================

                const shareURL =
                    createShareVaultURL(
                        sharingVault
                    );


                // =================================
                // SHOW LINK
                // =================================

                if(shareVaultStatus){

                    shareVaultStatus.textContent =
                        "Sharing is enabled for this Vault.";

                }


                if(shareVaultLinkContainer){

                    shareVaultLinkContainer.style.display =
                        "block";

                }


                if(shareVaultLink){

                    shareVaultLink.value =
                        shareURL;

                }


                // =================================
                // UPDATE LOCAL VAULT
                // =================================

                const index =
                    profiles.findIndex(
                        profile =>
                            String(profile.id) ===
                            String(sharingVault.id)
                    );


                if(index !== -1){

                    profiles[index] =
                        sharingVault;

                }


                showProfiles();


                console.log(
                    "Share Link created successfully:",
                    shareURL
                );

            }
            catch(error){

                console.error(
                    "Create Share Link error:",
                    error
                );


                sharingVault.shareEnabled =
                    oldShareEnabled;

                sharingVault.shareToken =
                    oldShareToken;


                alert(
                    "Failed to create Share Link."
                );

            }

        };

}

// =====================================
// COPY SHARE LINK
// =====================================

if(copyShareVaultLink){

    copyShareVaultLink.onclick =
        async function(){

            if(
                !shareVaultLink ||
                !shareVaultLink.value
            ){

                alert(
                    "There is no Share Link to copy."
                );

                return;

            }


            try{

                await navigator.clipboard.writeText(
                    shareVaultLink.value
                );


                copyShareVaultLink.textContent =
                    "✓ Link Copied";


                setTimeout(
                    function(){

                        copyShareVaultLink.textContent =
                            "📋 Copy Link";

                    },
                    2000
                );


            }
            catch(error){

                console.error(
                    "Copy Share Link error:",
                    error
                );


                // =================================
                // FALLBACK
                // =================================

                shareVaultLink.select();

                shareVaultLink.setSelectionRange(
                    0,
                    99999
                );


                alert(
                    "Please press Ctrl+C to copy the selected link."
                );

            }

        };

}

if(cancelCreateVault){

    cancelCreateVault.onclick =
        function(){

            createVaultModal.style.display =
                "none";

        };

}


// =====================================
// CLOSE EDIT MODAL
// =====================================

if(closeVaultModal){

    closeVaultModal.onclick =
        function(){

            vaultModal.style.display =
                "none";

        };

}


if(cancelVault){

    cancelVault.onclick =
        function(){

            vaultModal.style.display =
                "none";

        };

}


// =====================================
// CLOSE DELETE MODAL
// =====================================

if(closeDeleteModal){

    closeDeleteModal.onclick =
        function(){

            deleteModal.style.display =
                "none";

        };

}


if(cancelDelete){

    cancelDelete.onclick =
        function(){

            deleteModal.style.display =
                "none";

        };

}


// =====================================
// SEARCH
// =====================================

if(searchVault){

    searchVault.addEventListener(
        "input",
        showProfiles
    );

}


// =====================================
// INITIALIZE
// =====================================

auth.onAuthStateChanged(
    (user) => {

        if(user){

            console.log(
                "Authentication ready. Loading Vaults..."
            );

            loadProfiles();

        }else{

            console.log(
                "No authenticated user."
            );

        }

    }
);