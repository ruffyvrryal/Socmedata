// =====================================
// SOCMEDATA ACCOUNT DASHBOARD
// =====================================


// =====================================
// LOAD DATABASE
// =====================================

let profiles =
JSON.parse(localStorage.getItem("profiles")) || [];

let activeProfileId =
localStorage.getItem("activeProfileId");

let activeAccountId =
localStorage.getItem("activeAccountId");

// =============================
// EDIT CONTENT MODE
// =============================

let editingContentId = null;

// =============================
// CONTENT DATABASE
// =============================

let contents =
JSON.parse(localStorage.getItem("contents")) || [];


// =====================================
// FIND ACTIVE VAULT
// =====================================

let profile =
profiles.find(
    p => p.id == activeProfileId
);

if(!profile){

    alert("Vault not found.");

    window.location.href="../index.html";

}


// =====================================
// FIND ACTIVE ACCOUNT
// =====================================

let account =
profile.accounts.find(
    a => a.id == activeAccountId
);


if(!account){

    alert("Account not found.");

    window.location.href="dashboard.html";

}


// Make sure account has content database

if(!account.contents){

    account.contents = [];

}




// =====================================
// DATABASE MIGRATION
// =====================================


// Make sure platforms exist

if(!account.platforms){

    account.platforms=[];

}


// Upgrade old platform structure

account.platforms.forEach(platform=>{


    // Create analytics if missing

    if(!platform.analytics){

        platform.analytics={

            views:0,

            followers:
            platform.followers || 0,

            contents:0,

            growth:0

        };

    }



    // Create contents array if missing

    if(!platform.contents){

        platform.contents=[];

    }


});



// Keep account analytics for compatibility
// Later this will be replaced by calculation

if(!account.analytics){

    account.analytics={

        views:0,

        followers:0,

        contents:0,

        growth:0

    };

}


// Save migrated data

localStorage.setItem(

    "profiles",

    JSON.stringify(profiles)

);


// =====================================
// HTML ELEMENTS
// =====================================

const accountTitle =
document.getElementById("accountTitle");

const totalViews =
document.getElementById("totalViews");

const followers =
document.getElementById("followers");

const contentCount =
document.getElementById("contentCount");

const growth =
document.getElementById("growth");

const platformGrid =
document.getElementById("platformGrid");

const connectPlatformBtn =
document.getElementById("connectPlatformBtn");

const platformFilter =
document.getElementById("platformFilter");

let selectedPlatformValue = "all";


// =====================================
// LOAD ACCOUNT NAME
// =====================================

accountTitle.textContent =
account.name;


// =====================================
// LOAD ANALYTICS FROM PLATFORMS
// =====================================

function loadAnalytics(){

    let totalViewsValue = 0;
    let totalFollowersValue = 0;
    let totalContentsValue = 0;
    let totalGrowthValue = 0;

    // Calculate total views from content table
    account.contents.forEach(content=>{

        totalViewsValue += Number(content.views) || 0;

    });

    // Calculate followers & growth from connected platforms
    account.platforms.forEach(platform=>{

        if(platform.analytics){

            totalFollowersValue +=
            Number(platform.analytics.followers) || 0;

            totalGrowthValue +=
            Number(platform.analytics.growth) || 0;

        }

    });

    // Total content
    totalContentsValue = account.contents.length;

    // Update dashboard cards
    totalViews.textContent =
formatNumber(totalViewsValue);

    followers.textContent =
    formatNumber(totalFollowersValue);

    contentCount.textContent =
    totalContentsValue;

    growth.textContent =
        (totalGrowthValue >= 0 ? "+" : "")
        + totalGrowthValue + "%";

}


// =====================================
// SAVE DATABASE
// =====================================

function saveDatabase(){

    localStorage.setItem(

        "profiles",

        JSON.stringify(profiles)

    );

}

// =====================================
// PLATFORM ICON
// =====================================

function getPlatformIcon(platform){


    let logos = {


        Instagram:
        "https://cdn.simpleicons.org/instagram",


        TikTok:
        "https://cdn.simpleicons.org/tiktok",


        Facebook:
        "https://cdn.simpleicons.org/facebook",


        YouTube:
        "https://cdn.simpleicons.org/youtube",


        X:
        "https://cdn.simpleicons.org/x",


        Threads:
        "https://cdn.simpleicons.org/threads"


    };


    return logos[platform]
    ||
    "https://cdn.simpleicons.org/internet";

}

// =====================================
// PLATFORM STYLE CLASS
// =====================================

function getPlatformClass(platform){

    switch(platform){

        case "Instagram":
            return "instagram-card";

        case "TikTok":
            return "tiktok-card";

        case "Facebook":
            return "facebook-card";

        case "YouTube":
            return "youtube-card";

        case "X":
            return "x-card";

        case "Threads":
            return "threads-card";

        default:
            return "";

    }

}



// =====================================
// RENDER PLATFORMS
// =====================================

function renderPlatforms(){

    platformGrid.innerHTML="";

   let selectedPlatform =
selectedPlatformValue;

    let list=
    account.platforms;

    if(selectedPlatform!="all"){

        list=list.filter(

            item=>

            item.platform===selectedPlatform

        );

    }

    if(list.length===0){

        platformGrid.innerHTML=`

        <div class="empty-state">

            <h2>

                No Platform Connected

            </h2>

            <p>

                Click <b>Connect Platform</b>
                to add your first platform.

            </p>

        </div>

        `;

        return;

    }



    list.forEach(platform=>{

        platformGrid.innerHTML+=`

<div class="platform-card ${getPlatformClass(platform.platform)}">


    <div class="platform-header">


        <div class="platform-brand">


            <div class="platform-icon">

    <img 
    src="${getPlatformIcon(platform.platform)}">

</div>


            <div>

                <h3>
                    ${platform.platform}
                </h3>

                <p>
                    ${platform.username}
                </p>

            </div>


        </div>



        <button
        class="delete-platform"
        data-id="${platform.id}">

            ✕

        </button>


    </div>




    <div class="platform-stats">


        <div class="stat-box">

            <span>
                Followers
            </span>

            <strong>
            ${formatNumber(
                platform.analytics?.followers || 0
            )}
            </strong>

        </div>



        <div class="stat-box">

            <span>
                Views
            </span>

            <strong>
            ${formatNumber(
                platform.analytics?.views || 0
            )}
            </strong>

        </div>



        <div class="stat-box">

            <span>
                Content
            </span>

            <strong>
            ${platform.analytics?.contents || 0}
            </strong>

        </div>



        <div class="stat-box">

            <span>
                Growth
            </span>

            <strong class="positive-growth">
            +${platform.analytics?.growth || 0}%
            </strong>

        </div>


    </div>



</div>

`;

    });




    // DELETE PLATFORM

    document

    .querySelectorAll(".delete-platform")

    .forEach(button=>{

        button.onclick=function(){

            let id=

            Number(

                this.dataset.id

            );

            account.platforms=

            account.platforms.filter(

                p=>p.id!=id

            );

            saveDatabase();

            renderPlatforms();

        };

    });

}

renderPlatforms();




// =====================================
// FILTER
// =====================================

if(platformFilter){

    platformFilter.onchange=function(){

        renderPlatforms();

    };

}

// =====================================
// CONNECT PLATFORM
// =====================================

// =====================================
// PLATFORM MODAL
// =====================================

const platformModal =
document.getElementById("platformModal");

const closePlatformModal =
document.getElementById("closePlatformModal");

const cancelPlatform =
document.getElementById("cancelPlatform");

const savePlatform =
document.getElementById("savePlatform");

const platformSelect =
document.getElementById("platformSelect");

const platformUsername =
document.getElementById("platformUsername");

const platformFollowers =
document.getElementById("platformFollowers");


// Open Modal

connectPlatformBtn.onclick=function(){

    platformModal.style.display="flex";

};


// Close Modal

closePlatformModal.onclick=function(){

    platformModal.style.display="none";

};

cancelPlatform.onclick=function(){

    platformModal.style.display="none";

};


// Close when clicking outside

window.onclick=function(event){

    if(event.target===platformModal){

        platformModal.style.display="none";

    }

};


// Save Platform

savePlatform.onclick=function(){

    if(platformSelect.value===""){

        alert("Select a platform.");

        return;

    }

    if(platformUsername.value===""){

        alert("Enter username.");

        return;

    }

    account.platforms.push({

    id:Date.now(),

    platform:platformSelect.value,

    username:platformUsername.value,

    followers:Number(
        platformFollowers.value
    ) || 0,


    analytics:{

        views:0,

        followers:
        Number(platformFollowers.value)
        || 0,

        contents:0,

        growth:0

    },


    contents:[]

});

    saveDatabase();

    renderPlatforms();

    updateAnalytics();


    // Reset form

    platformSelect.value="";

    platformUsername.value="";

    platformFollowers.value="";


    platformModal.style.display="none";

};


// =====================================
// UPDATE ANALYTICS
// =====================================

function updateAnalytics(){

    saveDatabase();

    loadAnalytics();

}

    // =====================================
// NUMBER FORMATTER
// =====================================

function formatNumber(number){

    return Number(number).toLocaleString("id-ID");

}

    loadAnalytics();

updateAnalytics();


// =====================================
// AUTO SAVE
// =====================================

window.addEventListener(

    "beforeunload",

    function(){

        saveDatabase();

    }

);

function goBack(){

    window.history.back();

}

// =============================
// ACCOUNT TABS
// =============================


const tabs =
document.querySelectorAll(".account-tab");


const tabContents =
document.querySelectorAll(".tab-content");



tabs.forEach(tab=>{


    tab.onclick=function(){


        let target =
        tab.dataset.tab;



        tabs.forEach(btn=>{

            btn.classList.remove("active");

        });



        tabContents.forEach(content=>{

            content.classList.remove("active");

        });



        tab.classList.add("active");


        document
        .getElementById(target)
        .classList.add("active");


    };


});



// =============================
// DEFAULT TAB ON LOAD
// =============================


tabs.forEach(tab=>{

    tab.classList.remove("active");

});


tabContents.forEach(content=>{

    content.classList.remove("active");

});


const defaultTab =
document.querySelector(
'[data-tab="dashboard"]'
);


if(defaultTab){

    defaultTab.classList.add("active");

}


const dashboardContent =
document.getElementById("dashboard");


if(dashboardContent){

    dashboardContent.classList.add("active");

}

// =====================================
// CUSTOM PLATFORM FILTER
// =====================================

const customFilter =
document.getElementById("platformFilter");

const trigger =
customFilter.querySelector(".custom-select-trigger");

trigger.onclick = function(){

    customFilter.classList.toggle("open");

};

const selectedText =
document.getElementById("selectedPlatform");

const options =
customFilter.querySelectorAll(".custom-option");


options.forEach(option=>{

    option.onclick=function(){

        // Remove previous active
        options.forEach(item=>
            item.classList.remove("active")
        );

        // Activate current
        option.classList.add("active");

        // Change displayed text
        selectedText.textContent =
        option.textContent;

        // Save selected value
        selectedPlatformValue =
        option.dataset.value;

        renderPlatforms();

        // Close dropdown
        customFilter.classList.remove("open");

        console.log(selectedPlatformValue);

    };

});

// =====================================
// LOGO BUTTON SYSTEM
// =====================================


const logoButton =
document.getElementById("logoButton");


const logoModal =
document.getElementById("logoModal");


const closeLogoModal =
document.getElementById("closeLogoModal");


const cancelLogo =
document.getElementById("cancelLogo");


const saveLogo =
document.getElementById("saveLogo");


const logoUrl =
document.getElementById("logoUrl");



// LOAD SAVED LOGO

// LOAD ACCOUNT SPECIFIC LOGO

if(account.logoButtonImage){

    logoButton.innerHTML =
    `
    <img src="${account.logoButtonImage}">
    `;

}



// OPEN MODAL

logoButton.onclick=function(){

    logoModal.style.display="flex";

};



// CLOSE

closeLogoModal.onclick=function(){

    logoModal.style.display="none";

};


cancelLogo.onclick=function(){

    logoModal.style.display="none";

};



// SAVE LOGO

saveLogo.onclick=function(){


    let url =
    logoUrl.value.trim();



    if(url===""){

        alert("Please enter image URL");

        return;

    }



    account.logoButtonImage = url;

saveDatabase();


    logoButton.innerHTML =
    `
    <img src="${url}">
    `;


    logoModal.style.display="none";


};


// =============================
// CLOSE CONTENT MODAL
// =============================


const cancelContentBtn =
document.getElementById("cancelContent");


if(cancelContentBtn){


cancelContentBtn.onclick=function(){


    document
    .getElementById("contentModal")
    .style.display="none";


};


}

const closeContentModal =
document.getElementById("closeContentModal");


const contentStatus =
document.getElementById("contentStatus");


const saveContent =
document.getElementById("saveContent");



if(saveContent){


saveContent.onclick=function(){




console.log("Saving content");


let content = {


    id: Date.now(),


    accountId: activeAccountId,


    thumbnail:"",


    date:
    document.getElementById("contentDate").value,


    caption:
    document.getElementById("contentCaption").value,


    hashtag:
    document.getElementById("contentHashtag").value,


    views:
    Number(
        document.getElementById("contentViews").value
    ) || 0,


    likes:
    Number(
        document.getElementById("contentLikes").value
    ) || 0,


    comments:
    Number(
        document.getElementById("contentComments").value
    ) || 0,


    shares:
    Number(
        document.getElementById("contentShares").value
    ) || 0,


    saved:
    Number(
        document.getElementById("contentSaved").value
    ) || 0,


    platform:
    document.getElementById("contentPlatform").value,


    status:
    "Published"


};



account.contents.push(content);


saveDatabase();


renderContents();


loadAnalytics();


document
.getElementById("contentModal")
.style.display="none";


showToast(
    "Content created successfully!",
    "success"
);



console.log(
    "CONTENT SAVED",
    content
);


};

closeContentModal.onclick=function(){


    document
    .getElementById("contentModal")
    .style.display="none";


};


}

// =====================================
// RENDER CONTENT TABLE
// =====================================

function renderContents(){

    const table =
    document.getElementById("contentTableBody");

    if(!table) return;

    table.innerHTML = "";

    account.contents.forEach((content, index)=>{

        table.innerHTML += `

<tr>

    <td>${index + 1}</td>

    <td>
        ${
            content.thumbnail
            ? `<img src="${content.thumbnail}" class="content-thumbnail">`
            : "-"
        }
    </td>

    <td>${content.date || "-"}</td>

    <td>${content.caption || "-"}</td>

    <td>${content.hashtag || "-"}</td>

    <td>${content.views || 0}</td>

    <td>${content.platform || "-"}</td>

    <td>
        <button class="edit-content" data-id="${content.id}">
            Edit
        </button>

        <button class="delete-content" data-id="${content.id}">
            Delete
        </button>
    </td>

</tr>

`;

    });

// =============================
// EDIT BUTTON
// =============================

document.querySelectorAll(".edit-content").forEach(button => {

    button.onclick = function(){

        let id = Number(this.dataset.id);

        let content = account.contents.find(
            item => item.id == id
        );

        if(!content) return;

        editingContentId = id;

        document.getElementById("contentDate").value =
        content.date || "";

        document.getElementById("contentCaption").value =
        content.caption || "";

        document.getElementById("contentHashtag").value =
        content.hashtag || "";

        document.getElementById("contentPlatform").value =
        content.platform || "";

        document.getElementById("contentModal").style.display =
        "flex";

    };

});

// =============================
// DELETE CONTENT SYSTEM
// =============================

let deleteContentId = null;


const deleteModal =
document.getElementById("deleteModal");

console.log(
    "Delete Modal:",
    deleteModal
);


const cancelDelete =
document.getElementById("cancelDelete");


const confirmDelete =
document.getElementById("confirmDelete");



document.querySelectorAll(".delete-content")
.forEach(button=>{

    console.log(
        "DELETE BUTTON CONNECTED",
        button
    );


    button.onclick=function(){

    console.log(
        "Opening delete modal",
        this.dataset.id
    );


    deleteContentId =
    Number(this.dataset.id);


    deleteModal.style.display =
    "flex";


    console.log(
        "Modal style:",
        deleteModal.style.display
    );

};


});



// CANCEL DELETE

cancelDelete.onclick=function(){


    deleteModal.style.display =
    "none";


    deleteContentId = null;


};



// CONFIRM DELETE

confirmDelete.onclick=function(){


    if(deleteContentId === null){

        return;

    }



    account.contents =
    account.contents.filter(

        item =>
        item.id != deleteContentId

    );



    saveDatabase();


    renderContents();



    deleteModal.style.display =
    "none";


    deleteContentId = null;



    showToast(
        "Content deleted successfully!",
        "success"
    );


};

}

renderContents();

function deleteContent(index){

    account.contents.splice(index,1);

    saveDatabase();

    renderContents();

}



renderContents();

// renderContents();

// renderHashtags();

// =====================================
// TOAST NOTIFICATION
// =====================================

function showToast(message, type = "success"){

    const toast =
    document.getElementById("toast");

    const icon =
    toast.querySelector(".toast-icon");

    const text =
    toast.querySelector(".toast-message");

    text.textContent = message;

    if(type === "success"){

        icon.innerHTML = "✓";
        icon.style.background = "#22c55e";

    }

    else if(type === "error"){

        icon.innerHTML = "✕";
        icon.style.background = "#ef4444";

    }

    else if(type === "warning"){

        icon.innerHTML = "!";
        icon.style.background = "#f59e0b";

    }

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(function(){

        toast.classList.remove("show");

    },3000);

}

window.account = account;
window.profile = profile;

window.goBack = function(){

    window.history.back();

};


// =====================================
// READY FOR FUTURE FEATURES
// =====================================

// Content
// Calendar
// Engagement
// Monthly Report
// Weekly Report
// AI Insights
// Notifications
// Export

