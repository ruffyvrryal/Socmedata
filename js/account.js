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



    account.platforms.forEach(platform=>{


        if(platform.analytics){


            totalViewsValue +=
            Number(platform.analytics.views) || 0;


            totalFollowersValue +=
            Number(platform.analytics.followers) || 0;


            totalContentsValue +=
            Number(platform.analytics.contents) || 0;


            totalGrowthValue +=
            Number(platform.analytics.growth) || 0;


        }


    });



    totalViews.textContent =
    formatNumber(totalViewsValue);


    followers.textContent =
    formatNumber(totalFollowersValue);


    contentCount.textContent =
    totalContentsValue;


    growth.textContent =
    (totalGrowthValue >= 0 ? "+" : "")
    + totalGrowthValue
    + "%";


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

    switch(platform){

        case "Instagram":
            return "📸";

        case "TikTok":
            return "🎵";

        case "Facebook":
            return "📘";

        case "YouTube":
            return "▶️";

        case "X":
            return "𝕏";

        case "Threads":
            return "🧵";

        default:
            return "🌐";

    }

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

    let selectedPlatform="all";

    if(platformFilter){

        selectedPlatform=
        platformFilter.value;

    }

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

                ${getPlatformIcon(platform.platform)}

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

    if(number >= 1000000){

        return (
            (number / 1000000)
            .toFixed(1)
            + "M"
        );

    }


    if(number >= 1000){

        return (
            (number / 1000)
            .toFixed(1)
            + "K"
        );

    }


    return number;

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

// renderContents();

// renderHashtags();

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

