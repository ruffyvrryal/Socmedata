// =====================================
// SOCMEDATA VAULT SYSTEM
// FIRESTORE VERSION
// =====================================

import {
    getProfiles,
    saveProfile,
    deleteProfile,
    getCurrentUser
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

                    <button class="vault-menu">
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

                    <button class="open-vault-btn">
                        Open Vault →
                    </button>

                </div>

            `;


            const menuButton =
                card.querySelector(
                    ".vault-menu"
                );

            const openButton =
                card.querySelector(
                    ".open-vault-btn"
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


            profileList.appendChild(card);

        });

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
    accounts: [],
    contents: [],
    schedules: [],
    activities: [],
    ownerId: getCurrentUser()?.uid || null
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