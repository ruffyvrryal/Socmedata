// =============================
// SOCMEDATA DASHBOARD
// FIRESTORE VERSION
// =============================

import {
    getProfiles,
    saveProfile
} from "./firebase-db.js";


// =============================
// APPLICATION DATA
// =============================

let profiles = [];

let profile = null;

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
    // NO ACTIVE VAULT
    // =================================

    if (
        activeProfileId === null ||
        activeProfileId === undefined
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

        // =================================
        // LOAD FROM FIRESTORE
        // =================================

        profiles =
            await getProfiles();


        console.log(
            "Vaults loaded:",
            profiles
        );


        // =================================
        // FIND ACTIVE VAULT
        // =================================

        profile =
            profiles.find(
                p =>
                    String(p.id) ===
                    String(activeProfileId)
            );


        if (!profile) {

            console.error(
                "Active vault not found:",
                activeProfileId
            );

            alert(
                "Vault not found."
            );

            window.location.href =
                "../index.html";

            return false;

        }


        // =================================
        // MAKE SURE DATA ARRAYS EXIST
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
            "Active vault:",
            profile
        );


        return true;

    }

    catch (error) {

        console.error(
            "Failed to load vault:",
            error
        );

        alert(
            "Unable to load vault."
        );

        window.location.href =
            "../index.html";

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
// OPEN ADD ACCOUNT MODAL
// =============================

if (addAccount) {

    addAccount.onclick =
        function () {

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
                editIconPreview &&
                editIconPreviewBox &&
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

            if (
                accountName.value
                    .trim() === ""
            ) {

                alert(
                    "Please enter an account name."
                );

                return;

            }


            // =================================
            // HANDLE IMAGE UPLOAD
            // =================================

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
// FIRESTORE
// =============================

async function createAccount(icon) {

    const newAccount = {

        id: Date.now(),

        name:
            accountName.value.trim(),

        description:
            accountDescription.value.trim(),

        icon:
            icon || "",

        platforms: [],

        contents: []

    };


    // =================================
    // ADD LOCALLY
    // =================================

    profile.accounts.push(
        newAccount
    );


    try {

        console.log(
            "Saving account to Firestore:",
            newAccount
        );


        // =================================
        // SAVE ENTIRE VAULT
        // =================================

        const success =
            await saveProfile(profile);


        if (!success) {

            // Roll back
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


        // =================================
        // CLEAR FORM
        // =================================

        accountName.value = "";

        accountDescription.value = "";

        accountIconUpload.value = "";

        accountIconURL.value = "";

        iconPreview.src = "";

        iconPreviewBox.style.display =
            "none";


        // =================================
        // CLOSE MODAL
        // =================================

        accountModal.style.display =
            "none";


        // =================================
        // REFRESH
        // =================================

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


        // Roll back
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


    accountList.innerHTML = "";


    // =================================
    // NO ACCOUNTS
    // =================================

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


            openButton.onclick =
                function (event) {

                    event.stopPropagation();


                    console.log(
                        "Opening account:",
                        account
                    );


                    // =================================
                    // SAVE ACTIVE ACCOUNT ID
                    // =================================

                    localStorage.setItem(
                        "activeAccountId",
                        String(account.id)
                    );


                    // =================================
                    // SAVE ACTIVE VAULT ID AGAIN
                    // =================================

                    localStorage.setItem(
                        "activeProfileId",
                        String(profile.id)
                    );


                    window.location.href =
                        "account.html";

                };


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


            // =================================
            // EDIT ACCOUNT
            // =================================

            const editButton =
                card.querySelector(
                    ".edit-account"
                );


            editButton.onclick =
                function (event) {

                    event.stopPropagation();


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


            // =================================
            // DELETE ACCOUNT
            // =================================

            const deleteButton =
                card.querySelector(
                    ".delete-account"
                );


            deleteButton.onclick =
                function (event) {

                    event.stopPropagation();


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


            // =================================
            // HANDLE NEW IMAGE
            // =================================

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
// FIRESTORE
// =============================

async function updateAccount(icon) {

    if (!selectedEditAccount) {

        return;

    }


    // =================================
    // SAVE ORIGINAL VALUES
    // =================================

    const oldAccount = {
        name:
            selectedEditAccount.name,

        description:
            selectedEditAccount.description,

        icon:
            selectedEditAccount.icon
    };


    // =================================
    // UPDATE ACCOUNT
    // =================================

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


        // =================================
        // SAVE VAULT
        // =================================

        const success =
            await saveProfile(profile);


        if (!success) {

            // Roll back
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


        // =================================
        // CLOSE MODAL
        // =================================

        closeEditAccount();


        // =================================
        // REFRESH
        // =================================

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


        // Roll back
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
// FIRESTORE
// =============================

if (confirmDeleteAccount) {

    confirmDeleteAccount.onclick =
        async function () {

            if (!selectedDeleteAccount) {

                return;

            }


            const deletedAccount =
                selectedDeleteAccount;


            const deletedAccountId =
                deletedAccount.id;


            // =================================
            // SAVE ORIGINAL ARRAY
            // =================================

            const originalAccounts =
                [...profile.accounts];


            // =================================
            // REMOVE LOCALLY
            // =================================

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


                // =================================
                // SAVE UPDATED VAULT
                // =================================

                const success =
                    await saveProfile(
                        profile
                    );


                if (!success) {

                    // Restore
                    profile.accounts =
                        originalAccounts;


                    alert(
                        "Failed to delete account."
                    );

                    return;

                }


                // =================================
                // CLOSE MODAL
                // =================================

                deleteAccountModal.style.display =
                    "none";


                selectedDeleteAccount =
                    null;


                // =================================
                // REFRESH
                // =================================

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


                // Restore
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
// CLOSE MODALS WHEN CLICKING OUTSIDE
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

    const loaded =
        await loadActiveVault();


    if (!loaded) {

        return;

    }


    // =================================
    // VAULT INFORMATION
    // =================================

    if (vaultTitle) {

        vaultTitle.textContent =
            profile.name;

    }


    if (currentVault) {

        currentVault.textContent =
            profile.name;

    }


    // =================================
    // RENDER ACCOUNTS
    // =================================

    showAccounts();

}


initializeDashboard();


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