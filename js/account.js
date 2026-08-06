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

renderContents();


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

        const analytics = calculateAnalytics();

    totalViews.textContent =
    formatNumber(analytics.totalViews);

    followers.textContent =
    formatNumber(analytics.totalFollowers);

    contentCount.textContent =
    analytics.totalContents;

    growth.textContent =
    (analytics.totalGrowth >= 0 ? "+" : "")
    + analytics.totalGrowth + "%";

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

    platformGrid.innerHTML = "";

    let list = account.platforms;

    if(selectedPlatformValue !== "all"){

        list = list.filter(
            item => item.platform === selectedPlatformValue
        );

    }

    if(list.length === 0){

        platformGrid.innerHTML = `
        <div class="empty-state">
            <h2>No Platform Connected</h2>
            <p>
                Click <b>Connect Platform</b> to add your first platform.
            </p>
        </div>
        `;

        return;

    }

    list.forEach(platform=>{

        // =============================
        // Calculate analytics from Content Database
        // =============================

        const analytics = calculateAnalytics();

const platformStats = analytics.platforms[platform.platform] || {

    views: 0,

    contents: 0

};

        platformGrid.innerHTML += `

<div class="platform-card ${getPlatformClass(platform.platform)}">

    <div class="platform-header">

        <div class="platform-brand">

            <div class="platform-icon">
                <img src="${getPlatformIcon(platform.platform)}">
            </div>

            <div>
                <h3>${platform.platform}</h3>
                <p>${platform.username}</p>
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
            <span>Followers</span>
            <strong>
                ${formatNumber(platform.analytics?.followers || 0)}
            </strong>
        </div>

        <div class="stat-box">
            <span>Views</span>
            <strong>
                ${formatNumber(platformStats.views)}
            </strong>
        </div>

        <div class="stat-box">
            <span>Content</span>
            <strong>
                ${platformStats.contents}
            </strong>
        </div>

        <div class="stat-box">
            <span>Growth</span>
            <strong class="positive-growth">
                +${platform.analytics?.growth || 0}%
            </strong>
        </div>

    </div>

</div>

`;

    });

    // =============================
    // Delete Platform
    // =============================

    document
    .querySelectorAll(".delete-platform")
    .forEach(button=>{

        button.onclick = function(){

            const id = Number(this.dataset.id);

            account.platforms = account.platforms.filter(
                p => p.id !== id
            );

            saveDatabase();

            renderPlatforms();

        };

    });

}

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
// ANALYTICS ENGINE
// =====================================

function calculateAnalytics(){

    const analytics = {

        totalViews:0,

        totalContents:0,

        totalFollowers:0,

        totalGrowth:0,

        platforms:{}

    };


    // ============================
    // CONTENT DATABASE
    // ============================

    account.contents.forEach(content=>{

        analytics.totalViews +=
        Number(content.views) || 0;

        analytics.totalContents++;

        if(!analytics.platforms[content.platform]){

            analytics.platforms[content.platform]={

                views:0,

                contents:0

            };

        }

        analytics.platforms[content.platform].views +=
        Number(content.views) || 0;

        analytics.platforms[content.platform].contents++;

    });


    // ============================
    // PLATFORM DATABASE
    // ============================

    account.platforms.forEach(platform=>{

        analytics.totalFollowers +=
        Number(platform.analytics?.followers) || 0;

        analytics.totalGrowth +=
        Number(platform.analytics?.growth) || 0;

    });


    return analytics;

}

// =====================================
// NUMBER FORMATTER
// =====================================

function formatNumber(number){

    return Number(number).toLocaleString("id-ID");

}

    loadAnalytics();

    renderPlatforms();

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

localStorage.setItem(
    "activeAccountTab",
    target
)

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
// RESTORE LAST ACTIVE TAB
// =============================


let savedTab =
localStorage.getItem("activeAccountTab");



tabs.forEach(tab=>{

    tab.classList.remove("active");

});


tabContents.forEach(content=>{

    content.classList.remove("active");

});



let activeTab =
document.querySelector(
`[data-tab="${savedTab || "dashboard"}"]`
);



let activeContent =
document.getElementById(
savedTab || "dashboard"
);



if(activeTab){

    activeTab.classList.add("active");

}


if(activeContent){

    activeContent.classList.add("active");

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

    contentType:
    document.getElementById("contentType").value,


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
contentStatus.value


};



if(editingContentId !== null){

    const index = account.contents.findIndex(
        item => item.id === editingContentId
    );

    if(index !== -1){

        account.contents[index] = {

            ...account.contents[index],

            ...content,

            id: editingContentId

        };

    }

    editingContentId = null;

}else{

    account.contents.push(content);

}

saveDatabase();

renderContents();

loadAnalytics();

renderPlatforms();


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

    const sortedContents =
[...account.contents].sort((a,b)=>{

    return new Date(a.date) - new Date(b.date);

});


sortedContents.forEach((content,index)=>{

        table.innerHTML += `

<tr>

<td>
${index + 1}
</td>


<td>
${content.date || "-"}
</td>


<td>
${content.caption || "-"}
</td>


<td>
${content.hashtag || "-"}
</td>


<td>
${content.platform || "-"}
</td>


<td>

<span class="status-badge ${(content.status || "Published").toLowerCase()}">

${
content.status === "Published"
? "🟢"
: content.status === "Scheduled"
? "🔵"
: content.status === "Draft"
? "🟠"
: "🟣"
}

${content.status || "Published"}

</span>

</td>


<td>

${formatNumber(content.views || 0)}

</td>


<td>

${formatNumber(
(
Number(content.likes)||0
)
+
(
Number(content.comments)||0
)
+
(
Number(content.shares)||0
)
+
(
Number(content.saved)||0
)
)}

</td>


<td>

<div class="content-actions">

<button class="edit-content" data-id="${content.id}">
Edit
</button>


<button class="delete-content" data-id="${content.id}">
Delete
</button>


</div>

</td>


</tr>

`;

    });

// =============================
// EDIT BUTTON
// =============================

document.querySelectorAll(".edit-content").forEach(button => {

    button.onclick = function(){

        const id = Number(this.dataset.id);

        const content = account.contents.find(
            item => item.id === id
        );

        if(!content) return;

        editingContentId = id;

        document.getElementById("contentDate").value =
            content.date || "";

        document.getElementById("contentCaption").value =
            content.caption || "";

        document.getElementById("contentHashtag").value =
            content.hashtag || "";

        document.getElementById("contentType").value =
            content.contentType || "";

        document.getElementById("contentViews").value =
            content.views || 0;

        document.getElementById("contentLikes").value =
            content.likes || 0;

        document.getElementById("contentComments").value =
            content.comments || 0;

        document.getElementById("contentShares").value =
            content.shares || 0;

        document.getElementById("contentSaved").value =
            content.saved || 0;

        document.getElementById("contentPlatform").value =
            content.platform || "";

        document.getElementById("contentStatus").value =
            content.status || "Published";

        document.getElementById("contentModalTitle").textContent =
            "Edit Content";

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

loadEngagement();

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

function goBack(){

    window.location.href = "dashboard.html";

}

const backButton =
document.getElementById("backButton");


backButton.onclick=function(){

    window.location.href="dashboard.html";

};

// ============================
// ENGAGEMENT ANALYTICS
// ============================

function loadEngagement(){

    console.log("ENGAGEMENT FUNCTION RUNNING");


    let contents =
    account.contents || [];


    console.log("CONTENT DATA:", contents);



    let totalLikes = 0;

    let totalComments = 0;

    let totalShares = 0;

    let totalSaved = 0;

    let totalViews = 0;

    let contentTypeCount = {};

    let platformEngagement = {};



// =============================
// TOP CONTENT VARIABLES
// =============================

let topContent = null;

let topContentEngagement = 0;




    contents.forEach(content=>{


        totalLikes += Number(content.likes) || 0;

        totalComments += Number(content.comments) || 0;

        totalShares += Number(content.shares) || 0;

        totalSaved += Number(content.saved) || 0;

        totalViews += Number(content.views) || 0;

// COUNT CONTENT TYPES

let type = content.contentType || "Uncategorized";


if(!contentTypeCount[type]){

    contentTypeCount[type] = 0;

}


contentTypeCount[type]++;

        let platform = content.platform;



        if(!platformEngagement[platform]){

            platformEngagement[platform] = 0;

        }



        let contentEngagement =

(Number(content.likes) || 0)

+

(Number(content.comments) || 0)

+

(Number(content.shares) || 0)

+

(Number(content.saved) || 0);



platformEngagement[platform] += contentEngagement;

if(contentEngagement > topContentEngagement){

    topContentEngagement = contentEngagement;

    topContent = content;

}

});


    let totalEngagement =

        totalLikes

        +

        totalComments

        +

        totalShares

        +

        totalSaved;



    let engagementRate = 0;


    if(totalViews > 0){

        engagementRate =

        ((totalEngagement / totalViews) * 100)

        .toFixed(1);

    }



    let bestPlatform = "-";

    let highestEngagement = 0;



    Object.keys(platformEngagement)
    .forEach(platform=>{


        if(platformEngagement[platform] > highestEngagement){


            highestEngagement =
            platformEngagement[platform];


            bestPlatform =
            platform;


        }


    });



    console.log(
        "TOTAL ENGAGEMENT:",
        totalEngagement
    );


    const totalEngagementEl =
document.getElementById("totalEngagement");

const engagementRateEl =
document.getElementById("engagementRate");

const bestPlatformEl =
document.getElementById("bestPlatform");

const totalLikesEl =
document.getElementById("totalLikes");

const totalCommentsEl =
document.getElementById("totalComments");

const totalSharesEl =
document.getElementById("totalShares");

const totalSavedEl =
document.getElementById("totalSaved");


if(totalEngagementEl)
totalEngagementEl.textContent =
totalEngagement.toLocaleString();


if(engagementRateEl)
engagementRateEl.textContent =
engagementRate + "%";


if(bestPlatformEl)
bestPlatformEl.textContent =
bestPlatform;


if(totalLikesEl)
totalLikesEl.textContent =
totalLikes.toLocaleString();


if(totalCommentsEl)
totalCommentsEl.textContent =
totalComments.toLocaleString();


if(totalSharesEl)
totalSharesEl.textContent =
totalShares.toLocaleString();


if(totalSavedEl)
totalSavedEl.textContent =
totalSaved.toLocaleString();

// =============================
// DISPLAY TOP CONTENT
// =============================


const topContentResult =
document.getElementById("topContentResult");


if(topContentResult){


    if(topContent){


        topContentResult.innerHTML = `

        <div class="top-content-item">


            <p class="top-content-caption">
${topContent.caption || "Untitled"}
</p>


            <p>
            Platform:
            ${topContent.platform}
            </p>


            <p>
            👁 Views:
            ${formatNumber(topContent.views)}
            </p>


            <p>
            🔥 Engagement:
            ${formatNumber(topContentEngagement)}
            </p>


        </div>

        `;


    }else{


        topContentResult.innerHTML =
        "No content data yet.";


    }


}

// =============================
// DISPLAY CONTENT TYPES
// =============================

const contentTypeResult =
document.getElementById("contentTypeResult");


if(contentTypeResult){


    let html = "";


    Object.keys(contentTypeCount)
    .forEach(type=>{


        html += `

        <div class="content-type-item">

            <span>
            ${type}
            </span>

            <strong>
            ${contentTypeCount[type]} posts
            </strong>

        </div>

        `;


    });


    if(html === ""){

        html = "No content type data yet.";

    }


    contentTypeResult.innerHTML = html;


}

}

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

