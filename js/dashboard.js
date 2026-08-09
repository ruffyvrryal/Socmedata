// =============================
// SOCMEDATA DASHBOARD
// FIRESTORE VERSION
// OWNER + COLLABORATOR SUPPORT
// =============================

import {
    getProfiles,
    saveProfile,
    getVaultCollaborator,
    getVaultCollaborators,
    removeVaultCollaborator
} from "./firebase-db.js";

import {
    auth,
    db
} from "./firebase.js";

import {
    doc,
    getDoc
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =============================
// APPLICATION DATA
// =============================

let profiles = [];

let profile = null;

let currentVaultRole = null;

const activeProfileId =
    localStorage.getItem("activeProfileId");


// =============================
// ELEMENTS
// =============================

const vaultTitle =
    document.getElementById("vaultTitle");

const currentVault =
    document.getElementById("currentVault");

const backToVaults =
    document.getElementById("backToVaults");

const searchAccount =
    document.getElementById("searchAccount");

const addAccount =
    document.getElementById("addAccount");

const accountList =
    document.getElementById("accountList");

// =============================
// SHARE VAULT MODAL
// =============================

const shareVaultModal =
    document.getElementById("shareVaultModal");

const closeShareVault =
    document.getElementById("closeShareVault");

const cancelShareVault =
    document.getElementById("cancelShareVault");

const collaboratorList =
    document.getElementById("collaboratorList");

const generateShareVault =
    document.getElementById("generateShareVault");

const shareVaultStatus =
    document.getElementById("shareVaultStatus");

    const shareVaultCollaborators =
    document.getElementById(
        "shareVaultCollaborators"
    );

const collaboratorList =
    document.getElementById(
        "collaboratorList"
    );

const shareVaultLinkContainer =
    document.getElementById(
        "shareVaultLinkContainer"
    );

const shareVaultLink =
    document.getElementById("shareVaultLink");

const copyShareVaultLink =
    document.getElementById("copyShareVaultLink");

const collaboratorList =
    document.getElementById("collaboratorList");

const removeCollaborator =
    document.getElementById("removeCollaborator");
// =============================
// ADD ACCOUNT MODAL
// =============================

const accountModal =
    document.getElementById("accountModal");

const closeAccountModal =
    document.getElementById("closeAccountModal");

const cancelAccount =
    document.getElementById("cancelAccount");

const saveAccount =
    document.getElementById("saveAccount");

const accountName =
    document.getElementById("accountName");

const accountDescription =
    document.getElementById("accountDescription");

const accountIconUpload =
    document.getElementById("accountIconUpload");

const iconPreview =
    document.getElementById("iconPreview");

const iconPreviewBox =
    document.getElementById("iconPreviewBox");

const accountIconURL =
    document.getElementById("accountIconURL");


// =============================
// EDIT ACCOUNT MODAL
// =============================

const editAccountModal =
    document.getElementById("editAccountModal");

const closeEditAccountModal =
    document.getElementById("closeEditAccountModal");

const cancelEditAccount =
    document.getElementById("cancelEditAccount");

const saveEditAccount =
    document.getElementById("saveEditAccount");

const editAccountName =
    document.getElementById("editAccountName");

const editAccountDescription =
    document.getElementById("editAccountDescription");

const editAccountIconUpload =
    document.getElementById("editAccountIconUpload");

const editAccountIconURL =
    document.getElementById("editAccountIconURL");

const editIconPreview =
    document.getElementById("editIconPreview");

const editIconPreviewBox =
    document.getElementById("editIconPreviewBox");


// =============================
// DELETE ACCOUNT MODAL
// =============================

const deleteAccountModal =
    document.getElementById(
        "deleteAccountModal"
    );

const closeDeleteAccountModal =
    document.getElementById(
        "closeDeleteAccountModal"
    );

const cancelDeleteAccount =
    document.getElementById(
        "cancelDeleteAccount"
    );

const confirmDeleteAccount =
    document.getElementById(
        "confirmDeleteAccount"
    );

const deleteAccountText =
    document.getElementById(
        "deleteAccountText"
    );


// =============================
// SELECTED ACCOUNT STATE
// =============================

let selectedEditAccount = null;

let selectedDeleteAccount = null;


// =============================
// CHECK EDITOR PERMISSION
// =============================

function canEditVault() {

    return (
        currentVaultRole === "owner" ||
        currentVaultRole === "editor"
    );

}


// =============================
// CHECK OWNER
// =============================

function isVaultOwner(vault) {

    const user =
        auth.currentUser;

    if (!user) {

        return false;

    }

    return (
        vault.ownerId ===
        user.uid
    );

}


// =============================
// CHECK COLLABORATOR
// =============================

async function isVaultCollaborator(
    vaultId,
    userId
) {

    try {

        const collaborator =
            await getVaultCollaborator(
                vaultId,
                userId
            );

        if (!collaborator) {

            return false;

        }

        return (
            collaborator.role === "editor" ||
            collaborator.role === "owner"
        );

    }

    catch (error) {

        console.error(
            "Collaborator check failed:",
            error
        );

        return false;

    }

}

// =============================
// LOAD VAULT COLLABORATORS
// =============================

async function loadVaultCollaborators() {

    if (!profile) {

        return;

    }


    if (!isVaultOwner(profile)) {

        return;

    }


    if (!collaboratorList) {

        return;

    }


    try {

        collaboratorList.innerHTML =
            "Loading collaborators...";


        const collaborators =
            await getVaultCollaborators(
                profile.id
            );


        collaboratorList.innerHTML =
            "";


        if (
            !collaborators ||
            collaborators.length === 0
        ) {

            collaboratorList.innerHTML =
                "<p>No collaborators yet.</p>";

            if (shareVaultCollaborators) {

                shareVaultCollaborators.style.display =
                    "block";

            }

            return;

        }


        collaborators.forEach(
            collaborator => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "collaborator-item";


                const name =
                    collaborator.displayName ||
                    collaborator.name ||
                    collaborator.email ||
                    collaborator.uid ||
                    "Unknown user";


                const role =
                    collaborator.role ||
                    "editor";


                item.innerHTML = `

                    <div class="collaborator-info">

                        <strong>
                            ${name}
                        </strong>

                        <span>
                            ${role}
                        </span>

                    </div>


                    <button
                        type="button"
                        class="remove-collaborator"
                    >
                        Remove
                    </button>

                `;


                const removeButton =
                    item.querySelector(
                        ".remove-collaborator"
                    );


                if (removeButton) {

                    removeButton.onclick =
                        async function () {

                            const confirmed =
                                confirm(
                                    "Remove " +
                                    name +
                                    " from this Vault?"
                                );


                            if (!confirmed) {

                                return;

                            }


                            removeButton.disabled =
                                true;


                            removeButton.textContent =
                                "Removing...";


                            const success =
                                await removeVaultCollaborator(
                                    profile.id,
                                    collaborator.uid
                                );


                            if (!success) {

                                alert(
                                    "Failed to remove collaborator."
                                );


                                removeButton.disabled =
                                    false;


                                removeButton.textContent =
                                    "Remove";

                                return;

                            }


                            await loadVaultCollaborators();

                        };

                }


                collaboratorList.appendChild(
                    item
                );

            }
        );


        if (shareVaultCollaborators) {

            shareVaultCollaborators.style.display =
                "block";

        }

    }

    catch (error) {

        console.error(
            "Failed to load collaborators:",
            error
        );


        collaboratorList.innerHTML =
            "<p>Unable to load collaborators.</p>";


        if (shareVaultCollaborators) {

            shareVaultCollaborators.style.display =
                "block";

        }

    }

}


// =============================
// LOAD ACTIVE VAULT
// =============================

async function loadActiveVault() {

    console.log(
        "Loading active vault..."
    );

    console.log(
        "Active Profile ID:",
        activeProfileId
    );


    // =================================
    // CHECK ACTIVE VAULT
    // =================================

    if (
        activeProfileId === null ||
        activeProfileId === undefined ||
        activeProfileId === ""
    ) {

        console.error(
            "No activeProfileId found."
        );

        alert(
            "No vault selected."
        );

        window.location.href =
            "../index.html";

        return false;

    }


    try {

        const user =
            auth.currentUser;


        if (!user) {

            console.error(
                "No authenticated user."
            );

            return false;

        }


        // =================================
        // LOAD VAULT DIRECTLY
        // =================================

        const vaultRef =
            doc(
                db,
                "profiles",
                String(activeProfileId)
            );


        const vaultSnapshot =
            await getDoc(
                vaultRef
            );


        if (
            !vaultSnapshot.exists()
        ) {

            console.error(
                "Vault does not exist:",
                activeProfileId
            );

            alert(
                "Vault not found."
            );

            window.location.href =
                "../index.html";

            return false;

        }


        const data =
            vaultSnapshot.data();


        // =================================
        // DETERMINE ACCESS ROLE
        // =================================

        if (
            data.ownerId ===
            user.uid
        ) {

            currentVaultRole =
                "owner";

        }

        else {

            const collaborator =
                await getVaultCollaborator(
                    activeProfileId,
                    user.uid
                );


            if (
                collaborator &&
                collaborator.role === "editor"
            ) {

                currentVaultRole =
                    "editor";

            }

            else {

                console.error(
                    "User does not have access to this Vault."
                );

                alert(
                    "You do not have access to this Vault."
                );

                window.location.href =
                    "../index.html";

                return false;

            }

        }


        // =================================
        // BUILD PROFILE OBJECT
        // =================================

        profile = {

            ...data,

            id:
                data.id ??
                vaultSnapshot.id,

            firestoreId:
                vaultSnapshot.id,

            accessRole:
                currentVaultRole

        };


        // =================================
        // MAKE SURE ARRAYS EXIST
        // =================================

        if (
            !Array.isArray(
                profile.accounts
            )
        ) {

            profile.accounts = [];

        }


        if (
            !Array.isArray(
                profile.contents
            )
        ) {

            profile.contents = [];

        }


        if (
            !Array.isArray(
                profile.schedules
            )
        ) {

            profile.schedules = [];

        }


        if (
            !Array.isArray(
                profile.activities
            )
        ) {

            profile.activities = [];

        }


        console.log(
            "Active vault loaded:",
            profile
        );


        console.log(
            "Vault access role:",
            currentVaultRole
        );


        return true;

    }

    catch (error) {

        console.error(
            "Failed to load active vault:",
            error
        );


        // =================================
        // FIRESTORE OFFLINE
        // =================================

        if (
            error &&
            error.code ===
            "unavailable"
        ) {

            alert(
                "Firestore is currently offline. Please check your internet connection and try again."
            );

        }

        else {

            alert(
                "Unable to load vault."
            );

        }


        return false;

    }

}


// =============================
// NAVIGATION
// =============================

if (backToVaults) {

    backToVaults.onclick =
        function () {

            window.location.href =
                "../index.html";

        };

}

// =============================
// OPEN SHARE VAULT MODAL
// =============================

const shareVaultButton =
    document.getElementById("shareVault");

if (shareVaultButton) {

    shareVaultButton.onclick =
        async function () {

            if (!isVaultOwner(profile)) {

                alert(
                    "Only the Vault owner can manage collaborators."
                );

                return;

            }


            if (shareVaultModal) {

                shareVaultModal.style.display =
                    "flex";

            }


            await loadVaultCollaborators();

        };

}

// =============================
// OPEN ADD ACCOUNT MODAL
// =============================

if (addAccount) {

    addAccount.onclick =
        function () {

            if (!canEditVault()) {

                alert(
                    "You do not have permission to edit this Vault."
                );

                return;

            }


            if (iconPreview) {

                iconPreview.src = "";

            }


            if (iconPreviewBox) {

                iconPreviewBox.style.display =
                    "none";

            }


            accountName.value = "";

            accountDescription.value = "";

            accountIconUpload.value = "";

            accountIconURL.value = "";

            accountModal.style.display =
                "flex";

        };

}


// =============================
// CLOSE ADD ACCOUNT MODAL
// =============================

if (closeAccountModal) {

    closeAccountModal.onclick =
        function () {

            accountModal.style.display =
                "none";

        };

}


if (cancelAccount) {

    cancelAccount.onclick =
        function () {

            accountModal.style.display =
                "none";

        };

}


// =============================
// IMAGE PREVIEW
// =============================

if (accountIconUpload) {

    accountIconUpload.onchange =
        function () {

            const file =
                accountIconUpload.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    iconPreview.src =
                        event.target.result;

                    iconPreviewBox.style.display =
                        "flex";

                };


            reader.readAsDataURL(file);

        };

}


if (accountIconURL) {

    accountIconURL.oninput =
        function () {

            if (
                accountIconURL.value
            ) {

                iconPreview.src =
                    accountIconURL.value;

                iconPreviewBox.style.display =
                    "flex";

            }

        };

}


// =============================
// EDIT IMAGE PREVIEW
// =============================

if (editAccountIconUpload) {

    editAccountIconUpload.onchange =
        function () {

            const file =
                editAccountIconUpload.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    editIconPreview.src =
                        event.target.result;

                    editIconPreviewBox.style.display =
                        "flex";

                };


            reader.readAsDataURL(file);

        };

}


if (editAccountIconURL) {

    editAccountIconURL.oninput =
        function () {

            if (
                editAccountIconURL.value
            ) {

                editIconPreview.src =
                    editAccountIconURL.value;

                editIconPreviewBox.style.display =
                    "flex";

            }

        };

}


// =============================
// CLOSE EDIT ACCOUNT MODAL
// =============================

if (closeEditAccountModal) {

    closeEditAccountModal.onclick =
        function () {

            closeEditAccount();

        };

}


if (cancelEditAccount) {

    cancelEditAccount.onclick =
        function () {

            closeEditAccount();

        };

}


function closeEditAccount() {

    editAccountModal.style.display =
        "none";


    selectedEditAccount = null;


    if (editAccountIconUpload) {

        editAccountIconUpload.value =
            "";

    }


    if (editAccountIconURL) {

        editAccountIconURL.value =
            "";

    }


    if (editIconPreview) {

        editIconPreview.src =
            "";

    }


    if (editIconPreviewBox) {

        editIconPreviewBox.style.display =
            "none";

    }

}


// =============================
// SAVE NEW ACCOUNT
// =============================

if (saveAccount) {

    saveAccount.onclick =
        async function () {

            if (!canEditVault()) {

                alert(
                    "You do not have permission to edit this Vault."
                );

                return;

            }


            if (
                accountName.value
                    .trim() === ""
            ) {

                alert(
                    "Please enter an account name."
                );

                return;

            }


            if (
                accountIconUpload.files[0]
            ) {

                const reader =
                    new FileReader();


                reader.onload =
                    async function (event) {

                        await createAccount(
                            event.target.result
                        );

                    };


                reader.readAsDataURL(
                    accountIconUpload.files[0]
                );

            }

            else {

                await createAccount(
                    accountIconURL.value.trim()
                );

            }

        };

}


// =============================
// CREATE ACCOUNT
// =============================

async function createAccount(icon) {

    if (!canEditVault()) {

        alert(
            "You do not have permission to edit this Vault."
        );

        return;

    }


    const newAccount = {

        id:
            Date.now(),

        name:
            accountName.value.trim(),

        description:
            accountDescription.value.trim(),

        icon:
            icon || "",

        platforms:
            [],

        contents:
            []

    };


    profile.accounts.push(
        newAccount
    );


    try {

        console.log(
            "Saving account to Firestore:",
            newAccount
        );


        const success =
            await saveProfile(
                profile
            );


        if (!success) {

            profile.accounts =
                profile.accounts.filter(
                    account =>
                        account.id !==
                        newAccount.id
                );


            alert(
                "Failed to save account."
            );

            return;

        }


        accountName.value = "";

        accountDescription.value = "";

        accountIconUpload.value = "";

        accountIconURL.value = "";

        iconPreview.src = "";

        iconPreviewBox.style.display =
            "none";


        accountModal.style.display =
            "none";


        showAccounts();


        console.log(
            "Account saved successfully."
        );

    }

    catch (error) {

        console.error(
            "Create account error:",
            error
        );


        profile.accounts =
            profile.accounts.filter(
                account =>
                    account.id !==
                    newAccount.id
            );


        alert(
            "Failed to save account."
        );

    }

}


// =============================
// SHOW ACCOUNTS
// =============================

function showAccounts() {

    console.log(
        "showAccounts()"
    );


    if (!accountList) {

        return;

    }


    accountList.innerHTML = "";


    if (
        !profile ||
        !Array.isArray(
            profile.accounts
        )
    ) {

        return;

    }


    if (
        profile.accounts.length === 0
    ) {

        accountList.innerHTML = `

            <div class="empty-state">

                <h2>
                    Welcome to your Vault
                </h2>

                <p>

                    This vault doesn't contain
                    any social media accounts yet.

                    <br><br>

                    Create your first account
                    to start organizing your
                    platforms.

                </p>

            </div>

        `;

        return;

    }


    let accounts =
        profile.accounts || [];


    // =================================
    // SEARCH
    // =================================

    if (searchAccount) {

        const keyword =
            searchAccount.value
                .toLowerCase()
                .trim();


        accounts =
            accounts.filter(
                account => {

                    return (
                        account.name || ""
                    )
                    .toLowerCase()
                    .includes(keyword);

                }
            );

    }


    // =================================
    // RENDER ACCOUNTS
    // =================================

    accounts.forEach(
        account => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "account-card";


            card.innerHTML = `

                <div class="account-top">

                    <div class="account-icon">

                        ${
                            account.icon

                            ?

                            `<img
                                src="${account.icon}"
                            >`

                            :

                            "🏢"
                        }

                    </div>


                    <button
                        class="account-menu"
                    >
                        ⋮
                    </button>


                    <div
                        class="account-dropdown"
                    >

                        <button
                            class="edit-account"
                        >
                            ✏️ Edit Account
                        </button>


                        <button
                            class="delete-account"
                        >
                            🗑 Delete Account
                        </button>

                    </div>

                </div>


                <h3>
                    ${account.name || ""}
                </h3>


                <p>
                    ${
                        account.description ||
                        "No description"
                    }
                </p>


                <div class="account-footer">

                    <span class="platform-count">

                        ${
                            (
                                account.platforms ||
                                []
                            ).length
                        }

                        Connected

                    </span>


                    <span class="open-account">

                        Open →

                    </span>

                </div>

            `;


            // =================================
            // OPEN ACCOUNT
            // =================================

            const openButton =
                card.querySelector(
                    ".open-account"
                );


            if (openButton) {

                openButton.onclick =
                    function (event) {

                        event.stopPropagation();


                        console.log(
                            "Opening account:",
                            account
                        );


                        localStorage.setItem(
                            "activeAccountId",
                            String(account.id)
                        );


                        localStorage.setItem(
                            "activeProfileId",
                            String(profile.id)
                        );


                        window.location.href =
                            "account.html";

                    };

            }


            // =================================
            // ACCOUNT MENU
            // =================================

            const menuButton =
                card.querySelector(
                    ".account-menu"
                );


            const dropdown =
                card.querySelector(
                    ".account-dropdown"
                );


            if (
                menuButton &&
                dropdown
            ) {

                menuButton.onclick =
                    function (event) {

                        event.stopPropagation();


                        document
                            .querySelectorAll(
                                ".account-dropdown"
                            )
                            .forEach(
                                menu => {

                                    if (
                                        menu !==
                                        dropdown
                                    ) {

                                        menu.style.display =
                                            "none";

                                    }

                                }
                            );


                        dropdown.style.display =
                            dropdown.style.display ===
                            "flex"

                            ?

                            "none"

                            :

                            "flex";

                    };


                dropdown.onclick =
                    function (event) {

                        event.stopPropagation();

                    };

            }


            // =================================
            // EDIT ACCOUNT
            // =================================

            const editButton =
                card.querySelector(
                    ".edit-account"
                );


            if (editButton) {

                editButton.onclick =
                    function (event) {

                        event.stopPropagation();


                        if (!canEditVault()) {

                            alert(
                                "You do not have permission to edit this Vault."
                            );

                            return;

                        }


                        selectedEditAccount =
                            account;


                        editAccountName.value =
                            account.name || "";


                        editAccountDescription.value =
                            account.description || "";


                        editAccountIconURL.value =
                            account.icon || "";


                        editAccountIconUpload.value =
                            "";


                        if (account.icon) {

                            editIconPreview.src =
                                account.icon;

                            editIconPreviewBox.style.display =
                                "flex";

                        }

                        else {

                            editIconPreview.src =
                                "";

                            editIconPreviewBox.style.display =
                                "none";

                        }


                        editAccountModal.style.display =
                            "flex";

                    };

            }


            // =================================
            // DELETE ACCOUNT
            // =================================

            const deleteButton =
                card.querySelector(
                    ".delete-account"
                );


            if (deleteButton) {

                deleteButton.onclick =
                    function (event) {

                        event.stopPropagation();


                        if (!canEditVault()) {

                            alert(
                                "You do not have permission to edit this Vault."
                            );

                            return;

                        }


                        selectedDeleteAccount =
                            account;


                        if (deleteAccountText) {

                            deleteAccountText.textContent =
                                "Are you sure you want to delete "
                                +
                                account.name
                                +
                                "?";

                        }


                        deleteAccountModal.style.display =
                            "flex";

                    };

            }


            accountList.appendChild(
                card
            );

        }
    );

}


// =============================
// SEARCH
// =============================

if (searchAccount) {

    searchAccount.addEventListener(
        "input",
        showAccounts
    );

}


// =============================
// SAVE EDITED ACCOUNT
// =============================

if (saveEditAccount) {

    saveEditAccount.onclick =
        async function () {

            if (!canEditVault()) {

                alert(
                    "You do not have permission to edit this Vault."
                );

                return;

            }


            if (!selectedEditAccount) {

                return;

            }


            if (
                editAccountName.value
                    .trim() === ""
            ) {

                alert(
                    "Account name cannot be empty."
                );

                return;

            }


            if (
                editAccountIconUpload.files[0]
            ) {

                const reader =
                    new FileReader();


                reader.onload =
                    async function (event) {

                        await updateAccount(
                            event.target.result
                        );

                    };


                reader.readAsDataURL(
                    editAccountIconUpload.files[0]
                );

            }

            else {

                await updateAccount(
                    editAccountIconURL.value.trim()
                );

            }

        };

}


// =============================
// UPDATE ACCOUNT
// =============================

async function updateAccount(icon) {

    if (!canEditVault()) {

        alert(
            "You do not have permission to edit this Vault."
        );

        return;

    }


    if (!selectedEditAccount) {

        return;

    }


    const oldAccount = {

        name:
            selectedEditAccount.name,

        description:
            selectedEditAccount.description,

        icon:
            selectedEditAccount.icon

    };


    selectedEditAccount.name =
        editAccountName.value.trim();


    selectedEditAccount.description =
        editAccountDescription.value.trim();


    selectedEditAccount.icon =
        icon || "";


    try {

        console.log(
            "Updating account in Firestore:",
            selectedEditAccount
        );


        const success =
            await saveProfile(
                profile
            );


        if (!success) {

            selectedEditAccount.name =
                oldAccount.name;

            selectedEditAccount.description =
                oldAccount.description;

            selectedEditAccount.icon =
                oldAccount.icon;


            alert(
                "Failed to update account."
            );

            return;

        }


        closeEditAccount();

        showAccounts();


        console.log(
            "Account updated successfully."
        );

    }

    catch (error) {

        console.error(
            "Update account error:",
            error
        );


        selectedEditAccount.name =
            oldAccount.name;

        selectedEditAccount.description =
            oldAccount.description;

        selectedEditAccount.icon =
            oldAccount.icon;


        alert(
            "Failed to update account."
        );

    }

}


// =============================
// DELETE ACCOUNT
// =============================

if (confirmDeleteAccount) {

    confirmDeleteAccount.onclick =
        async function () {

            if (!canEditVault()) {

                alert(
                    "You do not have permission to edit this Vault."
                );

                return;

            }


            if (!selectedDeleteAccount) {

                return;

            }


            const deletedAccount =
                selectedDeleteAccount;


            const deletedAccountId =
                deletedAccount.id;


            const originalAccounts =
                [...profile.accounts];


            profile.accounts =
                profile.accounts.filter(
                    account =>
                        account.id !==
                        deletedAccountId
                );


            try {

                console.log(
                    "Deleting account from Firestore:",
                    deletedAccountId
                );


                const success =
                    await saveProfile(
                        profile
                    );


                if (!success) {

                    profile.accounts =
                        originalAccounts;


                    alert(
                        "Failed to delete account."
                    );

                    return;

                }


                deleteAccountModal.style.display =
                    "none";


                selectedDeleteAccount =
                    null;


                showAccounts();


                console.log(
                    "Account deleted successfully."
                );

            }

            catch (error) {

                console.error(
                    "Delete account error:",
                    error
                );


                profile.accounts =
                    originalAccounts;


                alert(
                    "Failed to delete account."
                );

            }

        };

}


// =============================
// DELETE MODAL CLOSE
// =============================

if (closeDeleteAccountModal) {

    closeDeleteAccountModal.onclick =
        function () {

            deleteAccountModal.style.display =
                "none";

            selectedDeleteAccount =
                null;

        };

}


if (cancelDeleteAccount) {

    cancelDeleteAccount.onclick =
        function () {

            deleteAccountModal.style.display =
                "none";

            selectedDeleteAccount =
                null;

        };

}

// =============================
// SHARE VAULT MODAL CLOSE
// =============================

if (closeShareVault) {

    closeShareVault.onclick =
        function () {

            shareVaultModal.style.display =
                "none";

        };

}


if (cancelShareVault) {

    cancelShareVault.onclick =
        function () {

            shareVaultModal.style.display =
                "none";

        };

}

<div
    id="shareVaultCollaborators"
    class="share-vault-collaborators"
    style="display:none;"
>

    <label>
        Collaborators
    </label>

    <div id="collaboratorList">
    </div>

</div>

// =============================
// GENERATE SHARE VAULT LINK
// =============================

if (generateShareVault) {

    generateShareVault.onclick =
        async function () {

            if (!isVaultOwner(profile)) {

                alert(
                    "Only the Vault owner can create a share link."
                );

                return;

            }


            if (!profile) {

                alert(
                    "Vault data is not loaded."
                );

                return;

            }


            try {

                const shareToken =
                    `${profile.id}-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 10)}`;


                profile.shareToken =
                    shareToken;


                const success =
                    await saveProfile(
                        profile
                    );


                if (!success) {

                    alert(
                        "Failed to create share link."
                    );

                    return;

                }


                const shareLink =
                    `${window.location.origin}/share-vault.html?token=${encodeURIComponent(
                        shareToken
                    )}`;


                if (shareVaultLink) {

                    shareVaultLink.value =
                        shareLink;

                }


                if (shareVaultLinkContainer) {

                    shareVaultLinkContainer.style.display =
                        "block";

                }


                if (shareVaultStatus) {

                    shareVaultStatus.textContent =
                        "Sharing is enabled.";

                }


                generateShareVault.textContent =
                    "🔄 Regenerate Share Link";


                console.log(
                    "Share Vault link created:",
                    shareLink
                );

            }

            catch (error) {

                console.error(
                    "Generate Share Vault link error:",
                    error
                );


                alert(
                    "Failed to create share link."
                );

            }

        };

}

// =============================
// COPY SHARE VAULT LINK
// =============================

if (copyShareVaultLink) {

    copyShareVaultLink.onclick =
        async function () {

            if (
                !shareVaultLink ||
                !shareVaultLink.value
            ) {

                alert(
                    "There is no share link to copy."
                );

                return;

            }


            try {

                await navigator.clipboard.writeText(
                    shareVaultLink.value
                );


                const originalText =
                    copyShareVaultLink.textContent;


                copyShareVaultLink.textContent =
                    "✅ Link Copied!";


                setTimeout(
                    function () {

                        copyShareVaultLink.textContent =
                            originalText;

                    },
                    2000
                );


                console.log(
                    "Share Vault link copied."
                );

            }

            catch (error) {

                console.error(
                    "Copy share link error:",
                    error
                );


                // Fallback for browsers
                shareVaultLink.select();

                shareVaultLink.setSelectionRange(
                    0,
                    99999
                );


                alert(
                    "Please press Ctrl+C to copy the link."
                );

            }

        };

}

async function loadCollaborators() {

    if (!profile) {

        return;

    }

    if (!isVaultOwner(profile)) {

        return;

    }

    if (!collaboratorList) {

        return;

    }

    try {

        const vaultRef =
            doc(
                db,
                "profiles",
                String(profile.id)
            );

        const vaultSnapshot =
            await getDoc(
                vaultRef
            );

        if (!vaultSnapshot.exists()) {

            return;

        }

        const vaultData =
            vaultSnapshot.data();

        const collaborators =
            vaultData.collaborators || {};

        collaboratorList.innerHTML = "";

        const collaboratorEntries =
            Object.entries(
                collaborators
            );

        if (
            collaboratorEntries.length === 0
        ) {

            collaboratorList.innerHTML = `
                <p>
                    No collaborators yet.
                </p>
            `;

            return;

        }

        collaboratorEntries.forEach(
            ([userId, collaborator]) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "collaborator-item";

                item.innerHTML = `

                    <div class="collaborator-info">

                        <strong>
                            ${
                                collaborator.email ||
                                userId
                            }
                        </strong>

                        <span>
                            ${
                                collaborator.role ||
                                "editor"
                            }
                        </span>

                    </div>

                    <button
                        type="button"
                        class="remove-collaborator"
                        data-user-id="${userId}"
                    >
                        Remove
                    </button>

                `;

                collaboratorList.appendChild(
                    item
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Failed to load collaborators:",
            error
        );

        collaboratorList.innerHTML = `
            <p>
                Failed to load collaborators.
            </p>
        `;

    }

}

// =============================
// CLOSE MODALS OUTSIDE
// =============================

window.onclick =
    function (event) {

        if (
            event.target ===
            accountModal
        ) {

            accountModal.style.display =
                "none";

        }


        if (
            event.target ===
            editAccountModal
        ) {

            closeEditAccount();

        }


        if (
            event.target ===
            deleteAccountModal
        ) {

            deleteAccountModal.style.display =
                "none";

            selectedDeleteAccount =
                null;

        }

    };


// =============================
// CLOSE DROPDOWNS
// =============================

document.addEventListener(
    "click",
    function () {

        document
            .querySelectorAll(
                ".account-dropdown"
            )
            .forEach(
                menu => {

                    menu.style.display =
                        "none";

                }
            );

    }
);


// =============================
// INITIALIZE DASHBOARD
// =============================

async function initializeDashboard() {

    console.log(
        "Initializing dashboard..."
    );


    const loaded =
        await loadActiveVault();


    if (!loaded) {

        return;

    }


    // =================================
    // VAULT TITLE
    // =================================

    if (vaultTitle) {

        vaultTitle.textContent =
            profile.name ||
            "Unnamed Vault";

    }


    if (currentVault) {

        currentVault.textContent =
            profile.name ||
            "Unnamed Vault";

    }


    // =================================
    // SHOW ROLE
    // =================================

    console.log(
        "Current Vault role:",
        currentVaultRole
    );


    // =================================
    // RENDER ACCOUNTS
    // =================================

    showAccounts();

}


// =============================
// AUTHENTICATION
// =============================

auth.onAuthStateChanged(
    async (user) => {

        if (!user) {

            console.log(
                "Dashboard: No authenticated user."
            );

            return;

        }


        console.log(
            "Dashboard: Authentication ready."
        );


        await initializeDashboard();

    }
);


// =============================
// DEBUG
// =============================

console.log(
    "Dashboard Firestore version loaded."
);

console.log(
    "Active Profile ID:",
    activeProfileId
);