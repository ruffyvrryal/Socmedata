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


    // No active vault ID

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

        // Load vaults from Firestore

        profiles =
            await getProfiles();


        console.log(
            "Vaults loaded:",
            profiles
        );


        // Find selected vault

        profile =
            profiles.find(
                p =>
                    String(p.id) ===
                    String(activeProfileId)
            );


        // Vault does not exist

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


        // Make sure arrays exist

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

// Add Account Modal

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
// EDIT ACCOUNT MODAL ELEMENTS
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


// store account being edited

let selectedEditAccount = null;

// store account being deleted

let selectedDeleteAccount = null;

// =============================
// DELETE MODAL ACTIONS
// =============================


closeDeleteAccountModal.onclick=function(){

    deleteAccountModal.style.display="none";

};



cancelDeleteAccount.onclick=function(){

    deleteAccountModal.style.display="none";

};



confirmDeleteAccount.onclick=function(){


    if(!selectedDeleteAccount)
    return;



    profile.accounts =
    profile.accounts.filter(

        item =>
        item.id !== selectedDeleteAccount.id

    );



    localStorage.setItem(

        "profiles",

        JSON.stringify(profiles)

    );



    deleteAccountModal.style.display="none";



    selectedDeleteAccount=null;



    showAccounts();


};

// =============================
// IMAGE PREVIEW
// =============================


accountIconUpload.onchange=function(){


    let file =
    accountIconUpload.files[0];


    if(!file){

        return;

    }


    let reader =
    new FileReader();


    reader.onload=function(e){


        iconPreview.src =
        e.target.result;


        iconPreviewBox.style.display =
        "flex";


    };


    reader.readAsDataURL(file);


};

accountIconURL.oninput=function(){


    if(accountIconURL.value){


        iconPreview.src =
        accountIconURL.value;


        iconPreviewBox.style.display =
        "flex";


    }


};

const editIconPreview =
document.getElementById("editIconPreview");


const editIconPreviewBox =
document.getElementById("editIconPreviewBox");



editAccountIconUpload.onchange=function(){


let file =
editAccountIconUpload.files[0];


if(!file)
return;


let reader =
new FileReader();


reader.onload=function(e){


editIconPreview.src =
e.target.result;


editIconPreviewBox.style.display="flex";


};


reader.readAsDataURL(file);


};



editAccountIconURL.oninput=function(){


    if(
        editIconPreview &&
        editIconPreviewBox &&
        editAccountIconURL.value
    ){

        editIconPreview.src =
        editAccountIconURL.value;


        editIconPreviewBox.style.display="flex";

    }


};

// =============================
// NAVIGATION
// =============================

backToVaults.onclick=function(){

    window.location.href="../index.html";

};

addAccount.onclick=function(){

    iconPreview.src="";

iconPreviewBox.style.display="none";

    accountName.value="";

    accountDescription.value="";


    accountIconUpload.value="";


    accountIconURL.value="";


    accountModal.style.display="flex";

};

closeAccountModal.onclick=function(){

    accountModal.style.display="none";

};

cancelAccount.onclick=function(){

    accountModal.style.display="none";

};

// =============================
// CLOSE EDIT ACCOUNT MODAL
// =============================


closeEditAccountModal.onclick=function(){

    editAccountModal.style.display="none";


    editIconPreview.src="";

    editIconPreviewBox.style.display="none";

};



cancelEditAccount.onclick=function(){

    editAccountModal.style.display="none";


    editIconPreview.src="";

    editIconPreviewBox.style.display="none";

};

// =============================
// SAVE EDIT ACCOUNT
// =============================


saveEditAccount.onclick=function(){


    if(!selectedEditAccount){

        return;

    }



    if(editAccountName.value.trim()===""){


        alert(
            "Account name cannot be empty."
        );


        return;

    }



    let icon =
    selectedEditAccount.icon || "";



    // If new image uploaded

    if(editAccountIconUpload.files[0]){


        let reader =
        new FileReader();



        reader.onload=function(e){


            updateAccount(
                e.target.result
            );


        };



        reader.readAsDataURL(
            editAccountIconUpload.files[0]
        );



    }else{


        // If URL changed

        icon =
        editAccountIconURL.value;



        updateAccount(icon);


    }


};

saveAccount.onclick=function(){

    if(accountName.value.trim()===""){

        alert("Please enter an account name.");

        return;

    }

    let icon = "";

// if user uploads image
if(accountIconUpload.files[0]){

    let reader = new FileReader();


    reader.onload=function(e){

        icon = e.target.result;


        createAccount(icon);

    };


    reader.readAsDataURL(
        accountIconUpload.files[0]
    );


}else{


    icon = accountIconURL.value;


    createAccount(icon);

}


    localStorage.setItem(

        "profiles",

        JSON.stringify(profiles)

    );

    accountModal.style.display="none";

    showAccounts();

};

// =============================
// SHOW ACCOUNTS
// =============================

function showAccounts(){

    console.log("showAccounts()");

    accountList.innerHTML="";

    if(profile.accounts.length===0){

        accountList.innerHTML=`

        <div class="empty-state">

            <h2>Welcome to your Vault</h2>

            <p>

This vault doesn't contain any social media accounts yet.

<br><br>

Create your first account to start organizing your platforms.

</p>

        </div>

        `;

        return;

    }

    let accounts = profile.accounts || [];

if(searchAccount){

    let keyword =
    searchAccount.value
    .toLowerCase();

    accounts = accounts.filter(account=>{

        return (account.name || "")
    .toLowerCase()
    .includes(keyword);

    });

}

accounts.forEach(account=>{

    const card = document.createElement("div");

    card.className = "account-card";

    card.innerHTML = `

    <div class="account-top">

        <div class="account-icon">

${
account.icon

?

`<img src="${account.icon}">`

:

"🏢"

}

</div>

        <button class="account-menu">
    ⋮
</button>

<div class="account-dropdown">

    <button class="edit-account">
        ✏️ Edit Account
    </button>


    <button class="delete-account">
        🗑 Delete Account
    </button>

</div>


    </div>

    <h3>
        ${account.name}
    </h3>

    <p>
        ${account.description || "No description"}
    </p>

    <div class="account-footer">

        <span class="platform-count">
            ${(account.platforms || []).length} Connected
        </span>

        <span class="open-account">
            Open →
        </span>

    </div>

    `;

    // =============================
    // OPEN ACCOUNT
    // =============================

    const openButton =
card.querySelector(".open-account");


openButton.onclick=function(event){

    console.log("OPEN BUTTON CLICKED");

    console.log(account);


    event.stopPropagation();


    localStorage.setItem(
        "activeAccountId",
        account.id
    );


    window.location.href =
    "account.html";

};

    // =============================
    // MENU BUTTON
    // =============================

    const menuButton =
card.querySelector(".account-menu");


menuButton.onclick=function(event){

    event.stopPropagation();


    const dropdown =
    card.querySelector(".account-dropdown");

    dropdown.onclick=function(event){

    event.stopPropagation();

};

    // close other dropdowns
    document
    .querySelectorAll(".account-dropdown")
    .forEach(menu=>{

        if(menu !== dropdown){

            menu.style.display="none";

        }

    });


    dropdown.style.display =
    dropdown.style.display==="flex"
    ? "none"
    : "flex";

};

// =============================
// EDIT ACCOUNT
// =============================

const editButton =
card.querySelector(".edit-account");


editButton.onclick=function(event){

    event.stopPropagation();


    // save selected account

    selectedEditAccount = account;



    // load account information

    editAccountName.value =
    account.name;


    editAccountDescription.value =
    account.description || "";



    editAccountIconURL.value =
    account.icon || "";



    editAccountIconUpload.value = "";



    // SHOW CURRENT ICON

    if(account.icon){


        editIconPreview.src =
        account.icon;


        editIconPreviewBox.style.display =
        "flex";


    }else{


        editIconPreview.src = "";


        editIconPreviewBox.style.display =
        "none";


    }



    // open modal

    editAccountModal.style.display =
    "flex";


};

// =============================
// DELETE ACCOUNT
// =============================

const deleteButton =
card.querySelector(".delete-account");


deleteButton.onclick=function(event){

    event.stopPropagation();


    // Save account that user wants to delete

    selectedDeleteAccount = account;


    // Change modal text

    deleteAccountText.textContent =
    "Are you sure you want to delete "
    + account.name
    + "?";


    // Open delete modal

    deleteAccountModal.style.display =
    "flex";


};

    accountList.appendChild(card);

});   // end forEach

// =============================
// CLOSE DROPDOWN WHEN CLICK OUTSIDE
// =============================

document.addEventListener("click", function(){

    document
    .querySelectorAll(".account-dropdown")
    .forEach(menu=>{

        menu.style.display="none";

    });

});

}      // <-- CLOSE showAccounts()

// =============================
// SEARCH
// =============================

if(searchAccount){

    searchAccount.addEventListener(
        "input",
        showAccounts
    );

}

// =============================
// INITIAL LOAD
// =============================

async function initializeDashboard() {

    const loaded =
        await loadActiveVault();


    if (!loaded) {

        return;

    }


    // Set vault information

    vaultTitle.textContent =
        profile.name;

    currentVault.textContent =
        profile.name;


    // Render accounts

    showAccounts();

}


initializeDashboard();

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
            icon,

        platforms: []

    };


    // Add account to active vault

    profile.accounts.push(
        newAccount
    );


    try {

        console.log(
            "Saving account to Firestore:",
            newAccount
        );


        // Save updated vault

        const success =
            await saveProfile(profile);


        if (!success) {

            // Roll back if Firestore failed

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


        // Close modal

        accountModal.style.display =
            "none";


        // Clear form

        accountName.value = "";

        accountDescription.value = "";

        accountIconUpload.value = "";

        accountIconURL.value = "";

        iconPreview.src = "";

        iconPreviewBox.style.display =
            "none";


        // Refresh account list

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


        // Roll back local change

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
// UPDATE ACCOUNT
// =============================


function updateAccount(icon){



    selectedEditAccount.name =
    editAccountName.value;



    selectedEditAccount.description =
    editAccountDescription.value;



    selectedEditAccount.icon =
    icon;



    // =============================
// DELETE ACCOUNT
// FIRESTORE
// =============================

confirmDeleteAccount.onclick = async function () {

    if (!selectedDeleteAccount) {

        return;

    }


    const deletedAccountId =
        selectedDeleteAccount.id;


    // Remove account locally first

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


        // Save updated vault

        const success =
            await saveProfile(profile);


        if (!success) {

            alert(
                "Failed to delete account."
            );

            return;

        }


        // Close modal

        deleteAccountModal.style.display =
            "none";


        // Clear selected account

        selectedDeleteAccount =
            null;


        // Refresh account list

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


        alert(
            "Failed to delete account."
        );

    }

};



    editAccountModal.style.display =
    "none";



    selectedEditAccount = null;

editAccountIconUpload.value="";

editAccountIconURL.value="";

editIconPreview.src="";

editIconPreviewBox.style.display="none";

    showAccounts();


}

window.onclick=function(event){


    if(event.target === accountModal){

        accountModal.style.display="none";

    }


    if(event.target === editAccountModal){

        editAccountModal.style.display="none";

    }


    if(event.target === deleteAccountModal){

        deleteAccountModal.style.display="none";

    }


};

// =============================
// DELETE ACCOUNT CONFIRMATION
// =============================


closeDeleteAccountModal.onclick=function(){

    deleteAccountModal.style.display =
    "none";

};



cancelDeleteAccount.onclick=function(){

    deleteAccountModal.style.display =
    "none";

};



confirmDeleteAccount.onclick=function(){


    if(!selectedDeleteAccount){

        return;

    }



    profile.accounts =
    profile.accounts.filter(

        item =>
        item.id !== selectedDeleteAccount.id

    );



    localStorage.setItem(

        "profiles",

        JSON.stringify(profiles)

    );



    deleteAccountModal.style.display =
    "none";



    selectedDeleteAccount = null;



    showAccounts();


};

console.log("Back Button:", backToVaults);