// =============================
// SOCMEDATA CONTENT MANAGEMENT
// =============================


// Load profiles

let profiles =
JSON.parse(localStorage.getItem("profiles")) || [];



// Get active profile

let activeProfileId =
localStorage.getItem("activeProfileId");



// Find profile

let profile =
profiles.find(
    p => p.id == activeProfileId
);



console.log(
    "Content Profile:",
    profile
);




// Profile name

const profileName =
document.getElementById("profileName");



if(profileName && profile){

    profileName.textContent =
    profile.name;

}




// Content list

const contentList =
document.getElementById("contentList");

const searchContent =
document.getElementById("searchContent");

const statusFilter =
document.getElementById("statusFilter");

const platformFilter =
document.getElementById("platformFilter");

// =============================
// EDIT MODE
// =============================

let editingIndex = -1;

function showContents(){


if(!contentList || !profile)
return;



contentList.innerHTML="";



if(profile.contents.length === 0){


contentList.innerHTML = `

<p>
No content yet
</p>

`;


return;

}



let filteredContents =
profile.contents.filter(content => {

    const matchesSearch =
    content.title
    .toLowerCase()
    .includes(
        searchContent.value.toLowerCase()
    );

    const matchesStatus =
statusFilter.value === "all" ||
content.status.toLowerCase() === statusFilter.value;

const matchesPlatform =
platformFilter.value === "all" ||
content.platform === platformFilter.value;

return (
    matchesSearch &&
    matchesStatus &&
    matchesPlatform
);

});


filteredContents.forEach((content,index)=>{


let card =
document.createElement("div");



card.className =
"content-card";



card.innerHTML = `

<div class="content-header">

<h3>
🎬 ${content.title}
</h3>

<span class="status ${content.status.toLowerCase()}">
${content.status}
</span>

</div>


<div class="content-info">

<p>
📱 ${content.platform}
</p>

<p>
🎞 ${content.type}
</p>

</div>


<p class="content-date">
📅 ${content.date}
</p>


<div class="content-actions">

<button class="edit-content">
✏ Edit
</button>

<button class="delete-content">
🗑 Delete
</button>

</div>

`;

const editButton =
card.querySelector(".edit-content");

const deleteButton =
card.querySelector(".delete-content");

editButton.onclick = function(){

    editingIndex = index;


    contentModal.style.display =
    "flex";


    modalTitle.textContent =
    "Edit Content";


    saveContent.textContent =
    "Update Content";


    contentTitle.value =
    content.title;


    contentPlatform.value =
    content.platform;


    contentType.value =
    content.type;


    contentStatus.value =
    content.status;


};

deleteButton.onclick = function(){

    let confirmDelete =
    confirm("Delete this content?");

    if(confirmDelete){

        profile.contents.splice(index,1);

        localStorage.setItem(
            "profiles",
            JSON.stringify(profiles)
        );

        showContents();

        console.log(
            "Content Deleted",
            profile.contents
        );

    }

};

contentList.appendChild(card);



});


}




showContents();

// =============================
// ADD CONTENT
// =============================


const addContent =
document.getElementById("addContent");


if(addContent){

addContent.onclick=function(){

    editingIndex = -1;


    modalTitle.textContent =
    "Create Content";


    saveContent.textContent =
    "Create Content";


    contentTitle.value = "";

    contentPlatform.selectedIndex = 0;

    contentType.selectedIndex = 0;

    contentStatus.selectedIndex = 0;


    contentModal.style.display =
    "flex";

};

}

// =============================
// CONTENT MODAL
// =============================

const contentModal =
document.getElementById("contentModal");

const closeModal =
document.getElementById("closeModal");


// Close Button

closeModal.onclick = function(){

    contentModal.style.display = "none";

};


// Click Outside Modal

window.onclick = function(event){

    if(event.target == contentModal){

        contentModal.style.display = "none";

    }

};

const contentPlatform =
document.getElementById("contentPlatform");

const saveContent =
document.getElementById("saveContent");

console.log("Save Button:", saveContent);

const modalTitle =
document.getElementById("modalTitle");


// =============================
// SEARCH CONTENT
// =============================

if(searchContent){

    searchContent.addEventListener(
        "input",
        function(){

            showContents();

        }
    );

}

if(statusFilter){

    statusFilter.addEventListener(
        "change",
        function(){

            showContents();

        }
    );

}

if(platformFilter){

    platformFilter.addEventListener(
        "change",
        function(){

            showContents();

        }
    );

}