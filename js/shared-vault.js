// =====================================
// SOCMEDATA SHARED VAULT
// PUBLIC SHARE PAGE
// =====================================

import {
    doc,
    getDoc,
    collection,
    getDocs
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    db,
    auth
} from "../firebase.js";

import {
    addVaultCollaborator
} from "../firebase-db.js";


// =====================================
// GET URL PARAMETERS
// =====================================

const params =
    new URLSearchParams(
        window.location.search
    );


const vaultId =
    params.get("vault");


const shareToken =
    params.get("token");


// =====================================
// PAGE ELEMENTS
// =====================================

const loading =
    document.getElementById(
        "sharedVaultLoading"
    );


const content =
    document.getElementById(
        "sharedVaultContent"
    );


const errorMessage =
    document.getElementById(
        "sharedVaultError"
    );


const vaultName =
    document.getElementById(
        "sharedVaultName"
    );


const vaultDescription =
    document.getElementById(
        "sharedVaultDescription"
    );


const accountList =
    document.getElementById(
        "sharedVaultAccounts"
    );


// =====================================
// SHOW ERROR
// =====================================

function showError(message){

    if(loading){

        loading.style.display =
            "none";

    }


    if(content){

        content.style.display =
            "none";

    }


    if(errorMessage){

        errorMessage.style.display =
            "block";

        errorMessage.textContent =
            message;

    }

}


// =====================================
// SHOW CONTENT
// =====================================

function showContent(){

    if(loading){

        loading.style.display =
            "none";

    }


    if(errorMessage){

        errorMessage.style.display =
            "none";

    }


    if(content){

        content.style.display =
            "block";

    }

}


// =====================================
// LOAD SHARED VAULT
// =====================================

async function loadSharedVault(){

    // =================================
    // CHECK URL
    // =================================

    if(!vaultId){

        showError(
            "Invalid Share Link. No Vault ID was provided."
        );

        return;

    }


    if(!shareToken){

        showError(
            "Invalid Share Link. No Share Token was provided."
        );

        return;

    }


    try{

        console.log(
            "Loading shared Vault:",
            vaultId
        );


        // =================================
        // GET VAULT
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

            showError(
                "This Vault does not exist."
            );

            return;

        }


        const vault =
            vaultSnapshot.data();


        console.log(
            "Shared Vault loaded:",
            vault
        );


        // =================================
        // CHECK SHARING
        // =================================

        if(
            vault.shareEnabled !== true
        ){

            showError(
                "Sharing for this Vault has been disabled."
            );

            return;

        }


        // =================================
        // CHECK TOKEN
        // =================================

        if(
            !vault.shareToken ||
            String(vault.shareToken) !==
            String(shareToken)
        ){

            showError(
                "This Share Link is invalid or has expired."
            );

            return;

        }


        // =================================
        // DISPLAY VAULT NAME
        // =================================

        if(vaultName){

            vaultName.textContent =
                vault.name ||
                "Shared Vault";

        }


        // =================================
        // DISPLAY DESCRIPTION
        // =================================

        if(vaultDescription){

            vaultDescription.textContent =
                vault.description ||
                "";

        }


        // =================================
        // DISPLAY ACCOUNTS
        // =================================

        await loadSharedAccounts(
            vault
        );


        // =================================
        // SHOW PAGE
        // =================================

        showContent();


        // =================================
        // HANDLE AUTHENTICATED USER
        // =================================

        auth.onAuthStateChanged(
            async function(user){

                if(!user){

                    return;

                }


                // =================================
                // OWNER DOES NOT NEED TO JOIN
                // =================================

                if(
                    String(vault.ownerId) ===
                    String(user.uid)
                ){

                    console.log(
                        "Current user is the Vault owner."
                    );

                    return;

                }


                // =================================
                // REGISTER AS COLLABORATOR
                // =================================

                try{

                    const added =
                        await addVaultCollaborator(
                            vaultId,
                            user.uid,
                            shareToken,
                            "editor"
                        );


                    if(added){

                        console.log(
                            "Current user is now a Vault collaborator."
                        );

                    }

                }
                catch(error){

                    console.error(
                        "Failed to register collaborator:",
                        error
                    );

                }

            }
        );

    }

    catch(error){

        console.error(
            "Failed to load shared Vault:",
            error
        );


        showError(
            "Failed to load the shared Vault."
        );

    }

}


// =====================================
// LOAD SHARED ACCOUNTS
// =====================================

async function loadSharedAccounts(vault){

    if(!accountList){

        return;

    }


    accountList.innerHTML =
        "";


    // =================================
    // GET ACCOUNTS
    // =================================

    const accounts =
        Array.isArray(vault.accounts)
        ?
        vault.accounts
        :
        [];


    // =================================
    // NO ACCOUNTS
    // =================================

    if(accounts.length === 0){

        accountList.innerHTML = `

            <div class="shared-empty">

                No accounts in this Vault.

            </div>

        `;

        return;

    }


    // =================================
    // RENDER ACCOUNTS
    // =================================

    accounts.forEach(
        function(account){

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "shared-account";


            const accountName =
                account.name ||
                account.username ||
                account.platform ||
                "Unnamed Account";


            const platform =
                account.platform ||
                "";


            row.innerHTML = `

                <div class="shared-account-info">

                    <strong>
                        ${escapeHTML(
                            accountName
                        )}
                    </strong>

                    ${
                        platform
                        ?
                        `
                        <span>
                            ${escapeHTML(
                                platform
                            )}
                        </span>
                        `
                        :
                        ""
                    }

                </div>

            `;


            accountList.appendChild(
                row
            );

        }
    );

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value){

    return String(value || "")
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
// START
// =====================================

loadSharedVault();