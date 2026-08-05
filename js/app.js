// =============================
// SOCIALFLOW PROFILE SYSTEM
// =============================


// Load profiles from storage
let profiles =
JSON.parse(localStorage.getItem("profiles")) || [

{
    id:1,
    name:"Personal",
    description:"My personal social media accounts",

    accounts:[
        {
            platform:"Instagram",
            username:"@personal"
        },
        {
            platform:"TikTok",
            username:"@personal"
        },
        {
            platform:"YouTube",
            username:"Personal Channel"
        }
    ],

    contents:[],
    schedules:[],
    activities:[]
},


{
    id:2,
    name:"Work",
    description:"My work and brand accounts",

    accounts:[
        {
            platform:"Instagram",
            username:"@brand"
        }
    ],

    contents:[],
    schedules:[],
    activities:[]
}

];



// Save database

function saveProfiles(){

    localStorage.setItem(
        "profiles",
        JSON.stringify(profiles)
    );

}




const profileList =
document.getElementById("profileList");

const searchVault =
document.getElementById("searchVault");

// =============================
// CREATE VAULT MODAL
// =============================


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

// =============================
// VAULT MODAL
// =============================


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

// =============================
// DELETE MODAL
// =============================


const deleteModal =
document.getElementById("deleteModal");


const closeDeleteModal =
document.getElementById("closeDeleteModal");


const cancelDelete =
document.getElementById("cancelDelete");


const confirmDelete =
document.getElementById("confirmDelete");


let deleteVaultId = null;

const vaultName =
document.getElementById("vaultName");


const vaultDescription =
document.getElementById("vaultDescription");

closeVaultModal.onclick=function(){

    vaultModal.style.display="none";

};


cancelVault.onclick=function(event){

    event.stopPropagation();

    vaultModal.style.display="none";

};

let editingVaultId = null;

// =============================
// SAVE VAULT EDIT
// =============================


saveVault.onclick=function(event){

    event.stopPropagation();


    let vault =
    profiles.find(
        p => p.id == editingVaultId
    );


    if(vault){


        vault.name =
        vaultName.value;


        vault.description =
        vaultDescription.value;


        saveProfiles();


        showProfiles();


        vaultModal.style.display =
        "none";


    }


};

// =============================
// DELETE VAULT
// =============================


deleteVault.onclick=function(event){

    event.stopPropagation();


    deleteVaultId = editingVaultId;


    let vault =
    profiles.find(
        p => p.id == editingVaultId
    );


    if(vault){

        document.getElementById("deleteVaultText").innerHTML =

        `
        Are you sure you want to delete 
        <strong>${vault.name}</strong> vault?

        <br><br>

        All accounts, posts, schedules, and analytics inside this vault will be permanently removed.
        `;

    }


    vaultModal.style.display =
    "none";


    deleteModal.style.display =
    "flex";


};

confirmDelete.onclick=function(event){

    event.stopPropagation();


    profiles =
    profiles.filter(
        p => p.id != deleteVaultId
    );


    saveProfiles();


    showProfiles();


    deleteModal.style.display =
    "none";


};

closeDeleteModal.onclick=function(){

    deleteModal.style.display =
    "none";

};


cancelDelete.onclick=function(event){

    event.stopPropagation();

    deleteModal.style.display =
    "none";

};

// Display profiles

function showProfiles(){


if(!profileList) return;


profileList.innerHTML="";

let filteredProfiles = profiles.filter(profile=>{


    if(!searchVault){

        return true;

    }


    let keyword =
    searchVault.value.toLowerCase();



    return (

        profile.name
        .toLowerCase()
        .includes(keyword)

        ||

        profile.description
        .toLowerCase()
        .includes(keyword)

    );


});



filteredProfiles.forEach((profile,index)=>{


const card=document.createElement("div");


card.className="profile-card";


card.style.animationDelay =
(index * 0.12) + "s";


// card.onclick = function(){
//     openProfile(profile.id);
// };



card.innerHTML=`

<div class="vault-top">

    <div class="vault-icon">
        📁
    </div>

   <button class="vault-menu">
    ⋮
</button>

</div>


<h3>
${profile.name}
</h3>


<p>
${profile.description}
</p>


<div class="vault-info">


<span>
📱 ${(profile.accounts || []).length} Accounts
</span>


<span>
📅 ${(profile.contents || []).length} Posts
</span>


</div>



<div class="vault-open">

    <button class="open-vault-btn">
        Open Vault →
    </button>

</div>


`;


// Vault menu button

const menuButton =
card.querySelector(".vault-menu");

const openButton =
card.querySelector(".open-vault-btn");

openButton.onclick = function(event){

    event.stopPropagation();

    openProfile(profile.id);

};


menuButton.onclick=function(event){

    event.stopPropagation();


    editingVaultId =
    profile.id;


    vaultName.value =
    profile.name;


    vaultDescription.value =
    profile.description;


    vaultModal.style.display =
    "flex";

};

profileList.appendChild(card);


});


}





// Open profile

function openProfile(id){


localStorage.setItem(
    "activeProfileId",
    id
);


window.location.href =
"pages/dashboard.html";


}






// Delete profile

function deleteProfile(id){


profiles =
profiles.filter(
profile=>profile.id!==id
);


saveProfiles();

showProfiles();


}






// =============================
// CREATE VAULT
// =============================


const addProfile =
document.getElementById("addProfile");

const toolbarCreateVault =
document.getElementById("toolbarCreateVault");


function openCreateVaultModal(){

    createVaultName.value = "";
    createVaultDescription.value = "";

    createVaultModal.style.display = "flex";

}

if(addProfile){

    addProfile.onclick = openCreateVaultModal;

}

if(toolbarCreateVault){

    toolbarCreateVault.onclick = openCreateVaultModal;

}



saveCreateVault.onclick=function(){


    if(createVaultName.value.trim()===""){

        alert("Please enter vault name");

        return;

    }



    profiles.push({

        id:Date.now(),

        name:createVaultName.value,

        description:
        createVaultDescription.value || "New profile",

        accounts:[],

        contents:[],

        schedules:[],

        activities:[]

    });



    saveProfiles();


    showProfiles();


    createVaultModal.style.display =
    "none";


};



closeCreateVault.onclick=function(){

    createVaultModal.style.display =
    "none";

};



cancelCreateVault.onclick=function(){

    createVaultModal.style.display =
    "none";

};

// =============================
// SEARCH VAULT
// =============================


if(searchVault){


    searchVault.addEventListener(
        "input",
        function(){


            showProfiles();


        }
    );


}

saveProfiles();
showProfiles();