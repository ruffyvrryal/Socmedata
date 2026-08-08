import {
    getProfiles,
    saveProfile,
    deleteProfile
} from "./firebase-db.js";


// =====================================
// SOCMEDATA VAULT SYSTEM
// FIRESTORE VERSION
// =====================================


// =====================================
// APPLICATION DATA
// =====================================

let profiles = [];

let editingVaultId = null;

let deleteVaultId = null;


// =====================================
// DOM ELEMENTS
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

const deleteVaultText =
    document.getElementById("deleteVaultText");


// =====================================
// CREATE VAULT BUTTONS
// =====================================

const addProfile =
    document.getElementById("addProfile");

const toolbarCreateVault =
    document.getElementById("toolbarCreateVault");


// =====================================
// LOAD PROFILES FROM FIRESTORE
// =====================================

async function loadProfiles() {

    try {

        console.log(
            "Loading vaults from Firestore..."
        );


        profiles =
            await getProfiles();


        console.log(
            "Vaults loaded from Firestore:",
            profiles
        );


        showProfiles();

    }

    catch (error) {

        console.error(
            "Failed to load vaults:",
            error
        );


        if (profileList) {

            profileList.innerHTML = `

                <div class="empty-vault-state">

                    <h3>
                        Unable to load vaults
                    </h3>

                    <p>
                        Please check your Firebase connection.
                    </p>

                </div>

            `;

        }

    }

}


// =====================================
// OPEN CREATE VAULT MODAL
// =====================================

function openCreateVaultModal() {

    if (!createVaultModal) {
        return;
    }


    if (createVaultName) {
        createVaultName.value = "";
    }


    if (createVaultDescription) {
        createVaultDescription.value = "";
    }


    createVaultModal.style.display =
        "flex";

}


// =====================================
// CLOSE CREATE VAULT MODAL
// =====================================

function closeCreateVaultModal() {

    if (!createVaultModal) {
        return;
    }


    createVaultModal.style.display =
        "none";

}


// =====================================
// CREATE VAULT BUTTON
// =====================================

if (addProfile) {

    addProfile.onclick =
        openCreateVaultModal;

}


if (toolbarCreateVault) {

    toolbarCreateVault.onclick =
        openCreateVaultModal;

}


// =====================================
// CLOSE CREATE VAULT
// =====================================

if (closeCreateVault) {

    closeCreateVault.onclick =
        closeCreateVaultModal;

}


if (cancelCreateVault) {

    cancelCreateVault.onclick =
        closeCreateVaultModal;

}


// =====================================
// CREATE NEW VAULT
// FIRESTORE
// =====================================

if (saveCreateVault) {

    saveCreateVault.onclick =
        async function () {

        const name =
            createVaultName
                ? createVaultName.value.trim()
                : "";


        const description =
            createVaultDescription
                ? createVaultDescription.value.trim()
                : "";


        // Validate name

        if (name === "") {

            alert(
                "Please enter a vault name."
            );

            return;

        }


        // Create new profile

        const newProfile = {

            id: Date.now(),

            name: name,

            description:
                description || "New profile",

            accounts: [],

            contents: [],

            schedules: [],

            activities: []

        };


        try {

            console.log(
                "Creating vault:",
                newProfile
            );


            // Save to Firestore

            const success =
                await saveProfile(
                    newProfile
                );


            if (!success) {

                alert(
                    "Failed to create vault."
                );

                return;

            }


            // Update local application state

            profiles.push(
                newProfile
            );


            // Refresh vault cards

            showProfiles();


            // Close modal

            closeCreateVaultModal();


            console.log(
                "Vault created successfully."
            );

        }

        catch (error) {

            console.error(
                "Create vault error:",
                error
            );


            alert(
                "Failed to create vault."
            );

        }

    };

}


// =====================================
// CLOSE EDIT VAULT MODAL
// =====================================

function closeEditVaultModal() {

    if (!vaultModal) {
        return;
    }


    vaultModal.style.display =
        "none";


    editingVaultId = null;

}


if (closeVaultModal) {

    closeVaultModal.onclick =
        closeEditVaultModal;

}


if (cancelVault) {

    cancelVault.onclick =
        function (event) {

            event.stopPropagation();

            closeEditVaultModal();

        };

}


// =====================================
// SAVE VAULT EDIT
// FIRESTORE
// =====================================

if (saveVault) {

    saveVault.onclick =
        async function (event) {

        event.stopPropagation();


        // Find selected vault

        const vault =
            profiles.find(
                profile =>
                    String(profile.id) ===
                    String(editingVaultId)
            );


        if (!vault) {

            console.error(
                "Vault not found:",
                editingVaultId
            );

            return;

        }


        // Get updated values

        const newName =
            vaultName
                ? vaultName.value.trim()
                : "";


        const newDescription =
            vaultDescription
                ? vaultDescription.value.trim()
                : "";


        // Validate name

        if (newName === "") {

            alert(
                "Vault name cannot be empty."
            );

            return;

        }


        // Update local object

        vault.name =
            newName;


        vault.description =
            newDescription || "New profile";


        try {

            console.log(
                "Saving vault:",
                vault
            );


            // Save updated profile

            const success =
                await saveProfile(
                    vault
                );


            if (!success) {

                alert(
                    "Failed to save vault."
                );

                return;

            }


            // Refresh interface

            showProfiles();


            // Close modal

            closeEditVaultModal();


            console.log(
                "Vault updated successfully."
            );

        }

        catch (error) {

            console.error(
                "Edit vault error:",
                error
            );


            alert(
                "Failed to save vault."
            );

        }

    };

}


// =====================================
// OPEN DELETE CONFIRMATION
// =====================================

if (deleteVault) {

    deleteVault.onclick =
        function (event) {

        event.stopPropagation();


        // Remember selected vault

        deleteVaultId =
            editingVaultId;


        // Find vault

        const vault =
            profiles.find(
                profile =>
                    String(profile.id) ===
                    String(deleteVaultId)
            );


        if (!vault) {

            console.error(
                "Vault not found:",
                deleteVaultId
            );

            return;

        }


        // Update confirmation text

        if (deleteVaultText) {

            deleteVaultText.innerHTML = `

                Are you sure you want to delete
                <strong>${vault.name}</strong> vault?

                <br><br>

                All accounts, posts, schedules,
                and analytics inside this vault
                will be permanently removed.

            `;

        }


        // Close edit modal

        if (vaultModal) {

            vaultModal.style.display =
                "none";

        }


        // Open delete modal

        if (deleteModal) {

            deleteModal.style.display =
                "flex";

        }

    };

}


// =====================================
// CONFIRM DELETE
// FIRESTORE
// =====================================

if (confirmDelete) {

    confirmDelete.onclick =
        async function (event) {

        event.stopPropagation();


        if (
            deleteVaultId === null ||
            deleteVaultId === undefined
        ) {

            console.error(
                "No vault selected for deletion."
            );

            return;

        }


        try {

            console.log(
                "Deleting vault:",
                deleteVaultId
            );


            // Delete from Firestore

            const success =
                await deleteProfile(
                    deleteVaultId
                );


            if (!success) {

                alert(
                    "Failed to delete vault."
                );

                return;

            }


            // Remove from local state

            profiles =
                profiles.filter(
                    profile =>
                        String(profile.id) !==
                        String(deleteVaultId)
                );


            // Refresh vault list

            showProfiles();


            // Close delete modal

            if (deleteModal) {

                deleteModal.style.display =
                    "none";

            }


            console.log(
                "Vault deleted successfully."
            );


            // Clear selected vault

            deleteVaultId =
                null;


            editingVaultId =
                null;

        }

        catch (error) {

            console.error(
                "Delete vault error:",
                error
            );


            alert(
                "Failed to delete vault."
            );

        }

    };

}


// =====================================
// CLOSE DELETE MODAL
// =====================================

function closeDeleteConfirmation() {

    if (deleteModal) {

        deleteModal.style.display =
            "none";

    }


    deleteVaultId =
        null;

}


if (closeDeleteModal) {

    closeDeleteModal.onclick =
        closeDeleteConfirmation;

}


if (cancelDelete) {

    cancelDelete.onclick =
        function (event) {

            event.stopPropagation();

            closeDeleteConfirmation();

        };

}


// =====================================
// DISPLAY VAULTS
// =====================================

function showProfiles() {

    if (!profileList) {

        return;

    }


    // Clear existing cards

    profileList.innerHTML =
        "";


    // Search keyword

    const keyword =
        searchVault
            ? searchVault.value
                .trim()
                .toLowerCase()
            : "";


    // Filter vaults

    const filteredProfiles =
        profiles.filter(
            profile => {

                const name =
                    String(
                        profile.name || ""
                    ).toLowerCase();


                const description =
                    String(
                        profile.description || ""
                    ).toLowerCase();


                return (
                    name.includes(keyword) ||
                    description.includes(keyword)
                );

            }
        );


    // =================================
    // EMPTY STATE
    // =================================

    if (filteredProfiles.length === 0) {

        profileList.innerHTML = `

            <div class="empty-vault-state">

                <h3>
                    No vaults found
                </h3>

                <p>
                    Create a new vault to get started.
                </p>

            </div>

        `;

        return;

    }


    // =================================
    // CREATE VAULT CARDS
    // =================================

    filteredProfiles.forEach(
        function (profile, index) {

        const card =
            document.createElement("div");


        card.className =
            "profile-card";


        card.style.animationDelay =
            (index * 0.12) + "s";


        // Safe arrays

        const accounts =
            Array.isArray(
                profile.accounts
            )
                ? profile.accounts
                : [];


        const contents =
            Array.isArray(
                profile.contents
            )
                ? profile.contents
                : [];


        // =================================
        // CARD HTML
        // =================================

        card.innerHTML = `

            <div class="vault-top">

                <div class="vault-icon">
                    📁
                </div>

                <button
                    class="vault-menu"
                    type="button"
                    aria-label="Vault options">

                    ⋮

                </button>

            </div>


            <h3>
                ${escapeHTML(
                    profile.name ||
                    "Unnamed Vault"
                )}
            </h3>


            <p>
                ${escapeHTML(
                    profile.description ||
                    ""
                )}
            </p>


            <div class="vault-info">

                <span>
                    📱 ${accounts.length} Accounts
                </span>


                <span>
                    📅 ${contents.length} Posts
                </span>

            </div>


            <div class="vault-open">

                <button
                    class="open-vault-btn"
                    type="button">

                    Open Vault →

                </button>

            </div>

        `;


        // =================================
        // MENU BUTTON
        // =================================

        const menuButton =
            card.querySelector(
                ".vault-menu"
            );


        if (menuButton) {

            menuButton.onclick =
                function (event) {

                event.stopPropagation();


                editingVaultId =
                    profile.id;


                if (vaultName) {

                    vaultName.value =
                        profile.name || "";

                }


                if (vaultDescription) {

                    vaultDescription.value =
                        profile.description || "";

                }


                if (vaultModal) {

                    vaultModal.style.display =
                        "flex";

                }

            };

        }


        // =================================
        // OPEN VAULT BUTTON
        // =================================

        const openButton =
            card.querySelector(
                ".open-vault-btn"
            );


        if (openButton) {

            openButton.onclick =
                function (event) {

                event.stopPropagation();


                openProfile(
                    profile.id
                );

            };

        }


        // Add card

        profileList.appendChild(
            card
        );

    });

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================
// OPEN VAULT
// =====================================

function openProfile(id) {

    // Store active vault

    localStorage.setItem(
        "activeProfileId",
        String(id)
    );


    // Open dashboard

    window.location.href =
        "pages/dashboard.html";

}


// =====================================
// SEARCH VAULT
// =====================================

if (searchVault) {

    searchVault.addEventListener(
        "input",
        function () {

            showProfiles();

        }
    );

}


// =====================================
// START APPLICATION
// =====================================

loadProfiles();