// =====================================
// SOCMEDATA ACCOUNT DASHBOARD
// PART 1
// DATABASE + ANALYTICS CORE
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


// =====================================
// EDIT MODE
// =====================================

let editingContentId = null;


// =====================================
// FIND ACTIVE PROFILE
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
// DATABASE CHECK
// =====================================

if(!account.contents){

    account.contents = [];

}


if(!account.platforms){

    account.platforms = [];

}

// =====================================
// IMPRESSION + REACH MIGRATION
// =====================================

account.contents.forEach(content => {

    // Old "views" become "impressions"
    if(
        content.impressions === undefined ||
        content.impressions === null
    ){

        content.impressions =
            Number(content.views) || 0;

    }


    // New metric
    if(
        content.reach === undefined ||
        content.reach === null
    ){

        content.reach = 0;

    }


    // Subject
    if(
        content.subject === undefined ||
        content.subject === null ||
        content.subject.trim() === ""
    ){

        content.subject = "Unassigned";

    }

});

// =====================================
// PLATFORM MIGRATION
// =====================================

account.platforms.forEach(platform => {

    // Create analytics object if missing
    if(!platform.analytics){

        platform.analytics = {};

    }


    // -------------------------------------
    // MIGRATE OLD VIEWS → IMPRESSIONS
    // -------------------------------------

    if(
        platform.analytics.impressions === undefined ||
        platform.analytics.impressions === null
    ){

        platform.analytics.impressions =
            Number(platform.analytics.views) || 0;

    }


    // -------------------------------------
    // REACH
    // -------------------------------------

    if(
        platform.analytics.reach === undefined ||
        platform.analytics.reach === null
    ){

        platform.analytics.reach = 0;

    }


    // -------------------------------------
    // FOLLOWERS
    // -------------------------------------

    platform.analytics.followers =
        Number(platform.followers) || 0;


    // -------------------------------------
    // CONTENT COUNT
    // -------------------------------------

    if(
        platform.analytics.contents === undefined ||
        platform.analytics.contents === null
    ){

        platform.analytics.contents = 0;

    }


    // -------------------------------------
    // GROWTH
    // -------------------------------------

    if(
        platform.analytics.growth === undefined ||
        platform.analytics.growth === null
    ){

        platform.analytics.growth = 0;

    }


    // -------------------------------------
    // PLATFORM CONTENT ARRAY
    // -------------------------------------

    if(!platform.contents){

        platform.contents = [];

    }

});



// =====================================
// ACCOUNT ANALYTICS
// =====================================

if(!account.analytics){

    account.analytics={

    impressions:0,

    reach:0,

    followers:0,

    contents:0,

    growth:0

};

}



// SAVE MIGRATION

localStorage.setItem(

    "profiles",

    JSON.stringify(profiles)

);




// =====================================
// ELEMENTS
// =====================================

const accountTitle =
document.getElementById("accountTitle");


const totalImpressions =
document.getElementById("totalImpressions");


const contentCount =
document.getElementById("contentCount");


const growth =
document.getElementById("growth");


const platformGrid =
document.getElementById("platformGrid");

const addContent =
    document.getElementById(
        "addContentBtn"
    );



let selectedPlatformValue = "all";

// =====================================
// ACCOUNT CENTER PLATFORM DROPDOWN
// =====================================

const platformFilterDropdown =
    document.getElementById("platformFilter");

const selectedPlatform =
    document.getElementById("selectedPlatform");

const platformOptions =
    document.querySelectorAll(
        "#platformFilter .custom-option"
    );


if(platformFilterDropdown){

    const trigger =
        platformFilterDropdown.querySelector(
            ".custom-select-trigger"
        );


    // OPEN / CLOSE DROPDOWN

    if(trigger){

        trigger.onclick = function(event){

            event.stopPropagation();

            platformFilterDropdown.classList.toggle(
                "open"
            );

        };

    }


    // SELECT PLATFORM

    platformOptions.forEach(option => {

        option.onclick = function(event){

            event.stopPropagation();


            selectedPlatformValue =
                this.dataset.value;


            // Update displayed text

            if(selectedPlatform){

                selectedPlatform.textContent =
                    this.textContent.trim();

            }


            // Active option

            platformOptions.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            this.classList.add("active");


            // Close dropdown

            platformFilterDropdown.classList.remove(
                "open"
            );


            // Refresh platform cards

            renderPlatforms();

        };

    });


    // CLOSE WHEN CLICKING OUTSIDE

    document.addEventListener(
        "click",
        function(){

            platformFilterDropdown.classList.remove(
                "open"
            );

        }
    );

}


// =====================================
// ACCOUNT NAME
// =====================================

if(accountTitle){

    accountTitle.textContent =
    account.name;

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
// NUMBER FORMAT
// =====================================

function formatNumber(number){

    return Number(number)
    .toLocaleString("id-ID");

}


// =====================================
// SUBJECT NAME NORMALIZER
// =====================================

function normalizeSubjectName(subject){

    return String(subject || "")
        .trim()
        .replace(/\s+/g, " ");

}


function renderSubjectTable(){

    const tableBody =
        document.getElementById("subjectTableBody");

    if(!tableBody)
        return;

    const subjects = {};

    // =====================================
    // GROUP CONTENT BY SUBJECT
    // =====================================

    account.contents.forEach(content => {

        const subject =
            normalizeSubjectName(content.subject);

        if(!subject)
            return;

        if(!subjects[subject]){

            subjects[subject] = {

                posts: 0,
                impressions: 0,
                reach: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                saves: 0,
                engagement: 0

            };

        }

        const data = subjects[subject];

        data.posts++;

        data.impressions +=
            Number(content.impressions) || 0;

        data.reach +=
            Number(content.reach) || 0;

        data.likes +=
            Number(content.likes) || 0;

        data.comments +=
            Number(content.comments) || 0;

        data.shares +=
            Number(content.shares) || 0;

        data.saves +=
            Number(content.saved) || 0;

        data.engagement =
            data.likes +
            data.comments +
            data.shares +
            data.saves;

    });


    // =====================================
    // SORT BY ENGAGEMENT
    // =====================================

    const sortedSubjects =
        Object.entries(subjects)
        .sort(
            (a,b) =>
                b[1].engagement -
                a[1].engagement
        );


    // =====================================
    // SUBJECT SUMMARY
    // =====================================

    let totalSubjects =
        sortedSubjects.length;

    let subjectContentCount = 0;

    let subjectImpressions = 0;

    let subjectReach = 0;


    sortedSubjects.forEach(
        ([subject, data]) => {

            subjectContentCount +=
                data.posts;

            subjectImpressions +=
                data.impressions;

            subjectReach +=
                data.reach;

        }
    );


    // =====================================
    // UPDATE SUMMARY CARDS
    // =====================================

    const totalSubjectsElement =
        document.getElementById("totalSubjects");

    const subjectContentElement =
        document.getElementById("subjectContentCount");

    const subjectImpressionsElement =
        document.getElementById("subjectImpressions");

    const subjectReachElement =
        document.getElementById("subjectReach");


    if(totalSubjectsElement){

        totalSubjectsElement.textContent =
            formatNumber(totalSubjects);

    }


    if(subjectContentElement){

        subjectContentElement.textContent =
            formatNumber(subjectContentCount);

    }


    if(subjectImpressionsElement){

        subjectImpressionsElement.textContent =
            formatNumber(subjectImpressions);

    }


    if(subjectReachElement){

        subjectReachElement.textContent =
            formatNumber(subjectReach);

    }


    // =====================================
    // EMPTY STATE
    // =====================================

    if(sortedSubjects.length === 0){

        tableBody.innerHTML = `

            <tr>

                <td colspan="10">

                    No subject data available.

                </td>

            </tr>

        `;

        return;

    }


    // =====================================
    // RENDER SUBJECT ROWS
    // =====================================

    tableBody.innerHTML =

        sortedSubjects.map(
            ([subject, data]) => {

                const rate =
                    data.impressions > 0
                    ?
                    (
                        data.engagement /
                        data.impressions *
                        100
                    ).toFixed(1)
                    :
                    "0.0";


                return `

                <tr>

                    <td>
                        ${subject}
                    </td>

                    <td>
                        ${data.posts}
                    </td>

                    <td>
                        ${formatNumber(
                            data.impressions
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            data.reach
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            data.likes
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            data.comments
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            data.shares
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            data.saves
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            data.engagement
                        )}
                    </td>

                    <td>
                        ${rate}%
                    </td>

                </tr>

                `;

            }
        ).join("");

}

// =====================================
// CONTENT BY SUBJECT TABLE
// =====================================

function renderSubjectContentTable(){

    const tableBody =
        document.getElementById(
            "subjectContentTableBody"
        );

    if(!tableBody)
        return;


    const contents =
        (account.contents || [])
        .filter(content => {

            return (
                content.subject &&
                content.subject.trim() !== ""
            );

        })
        .sort(
            (a,b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    // =====================================
    // EMPTY STATE
    // =====================================

    if(contents.length === 0){

        tableBody.innerHTML = `

            <tr>

                <td colspan="7">

                    No subject content available.

                </td>

            </tr>

        `;

        return;

    }


    // =====================================
    // RENDER CONTENT
    // =====================================

    tableBody.innerHTML =

        contents.map(content => {

            const engagement =

                (Number(content.likes) || 0) +

                (Number(content.comments) || 0) +

                (Number(content.shares) || 0) +

                (Number(content.saved) || 0);


            const subject =
                normalizeSubjectName(
                    content.subject
                );


            return `

                <tr>

                    <td>
                        ${content.date || "-"}
                    </td>

                    <td>
                        ${subject || "-"}
                    </td>

                    <td>
                        ${content.platform || "-"}
                    </td>

                    <td>
                        ${content.caption || "-"}
                    </td>

                    <td>
                        ${formatNumber(
                            content.impressions || 0
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            content.reach || 0
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            engagement
                        )}
                    </td>

                </tr>

            `;

        }).join("");

}

// =====================================
// CALCULATE ANALYTICS
// =====================================

function calculateAnalytics(){

    let analytics = {

        totalImpressions: 0,

        totalReach: 0,

        totalContents: 0,

        totalGrowth: 0,

        totalFollowers: 0,

        platforms: {}

    };


    const now = new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();


    const previousMonth =
        currentMonth === 0
        ? 11
        : currentMonth - 1;

    const previousYear =
        currentMonth === 0
        ? currentYear - 1
        : currentYear;


    // =====================================
    // CONTENT ANALYTICS
    // =====================================

    account.contents.forEach(content=>{

        const impressions =
            Number(content.impressions) || 0;

        const reach =
            Number(content.reach) || 0;


        analytics.totalImpressions +=
            impressions;


        analytics.totalReach +=
            reach;


        analytics.totalContents++;


        // =====================================
        // PLATFORM
        // =====================================

        const platform =
            content.platform || "Unknown";


        if(!analytics.platforms[platform]){

            analytics.platforms[platform] = {

                impressions: 0,

                reach: 0,

                contents: 0,

                currentImpressions: 0,

                previousImpressions: 0,

                growth: 0

            };

        }


        analytics.platforms[platform].impressions +=
            impressions;


        analytics.platforms[platform].reach +=
            reach;


        analytics.platforms[platform].contents++;


        // =====================================
        // CURRENT / PREVIOUS MONTH
        // =====================================

        if(content.date){

            const date =
                new Date(content.date);


            const month =
                date.getMonth();


            const year =
                date.getFullYear();


            if(
                month === currentMonth &&
                year === currentYear
            ){

                analytics.platforms[platform]
                    .currentImpressions += impressions;

            }


            if(
                month === previousMonth &&
                year === previousYear
            ){

                analytics.platforms[platform]
                    .previousImpressions += impressions;

            }

        }

    });


    // =====================================
    // PLATFORM GROWTH
    // =====================================

    Object.keys(analytics.platforms)
    .forEach(platform=>{

        const data =
            analytics.platforms[platform];


        data.growth =
            calculateGrowth(
                data.currentImpressions,
                data.previousImpressions
            );

    });


    // =====================================
    // ACCOUNT FOLLOWERS + GROWTH
    // =====================================

    let totalCurrentImpressions = 0;

    let totalPreviousImpressions = 0;


    account.platforms.forEach(platform=>{

        analytics.totalFollowers +=
            Number(platform.followers) || 0;


        const platformData =
            analytics.platforms[platform.platform];


        if(platformData){

            totalCurrentImpressions +=
                platformData.currentImpressions;


            totalPreviousImpressions +=
                platformData.previousImpressions;

        }

    });


    // =====================================
    // TOTAL ACCOUNT GROWTH
    // =====================================

    analytics.totalGrowth =
        calculateGrowth(
            totalCurrentImpressions,
            totalPreviousImpressions
        );


    return analytics;

}





// =====================================
// LOAD ANALYTICS
// =====================================

function loadAnalytics(){


    let analytics =
    calculateAnalytics();

account.analytics.impressions =
    analytics.totalImpressions;

account.analytics.reach =
    analytics.totalReach;

account.analytics.contents =
    analytics.totalContents;

account.analytics.followers =
    analytics.totalFollowers;

account.analytics.growth =
    analytics.totalGrowth;

    if(totalImpressions){

    totalImpressions.textContent =
        formatNumber(
            analytics.totalImpressions
        );

}

const followers =
    document.getElementById("followers");

if(followers){

    followers.textContent =
        formatNumber(
            analytics.totalFollowers
        );

}

    if(contentCount){

        contentCount.textContent =
        analytics.totalContents;

    }



    if(growth){

    const growthValue =
        Number(analytics.totalGrowth) || 0;

    growth.textContent =
        (
            growthValue >= 0
            ? "+"
            : ""
        )
        +
        growthValue.toFixed(1)
        +
        "%";

}


}




// =====================================
// PLATFORM ICON
// =====================================

function getPlatformIcon(platform){


    const logos={


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
// PLATFORM CLASS
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
// PART 2
// PLATFORM SYSTEM + CONTENT MODAL
// =====================================


// =====================================
// RENDER PLATFORMS
// =====================================

function renderPlatforms(){


    if(!platformGrid)
        return;


    platformGrid.innerHTML = "";


    let platforms =
    account.platforms;



    if(selectedPlatformValue !== "all"){


        platforms =
        platforms.filter(platform=>
            platform.platform === selectedPlatformValue
        );


    }



    if(platforms.length === 0){


        platformGrid.innerHTML = `

        <div class="empty-state">

            <h2>No Platform Connected</h2>

            <p>
                Click Connect Platform to add your first platform.
            </p>

        </div>

        `;


        return;


    }




    let analytics =
    calculateAnalytics();



    platforms.forEach(platform=>{


        let stats =
    analytics.platforms[platform.platform]
    ||
    {
        impressions:0,
        reach:0,
        contents:0
    };



        platformGrid.innerHTML += `


<div class="platform-card ${getPlatformClass(platform.platform)}">


    <div class="platform-header">


        <div class="platform-brand">


            <div class="platform-icon">

                <img src="${getPlatformIcon(platform.platform)}">

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
        Impressions
    </span>

    <strong>

        ${formatNumber(stats.impressions)}

    </strong>

</div>

<div class="stat-box">

    <span>
        Reach
    </span>

    <strong>

        ${formatNumber(stats.reach)}

    </strong>

</div>





        <div class="stat-box">


            <span>
                Content
            </span>


            <strong>

            ${stats.contents}

            </strong>


        </div>





        <div class="stat-box">


            <span>
                Growth
            </span>


            <strong class="positive-growth">

    ${
        Number(platform.analytics?.growth || 0) >= 0
        ? "+"
        : ""
    }${Number(
        platform.analytics?.growth || 0
    ).toFixed(1)}%

</strong>


        </div>


    </div>


</div>


`;



    });





    document
    .querySelectorAll(".delete-platform")
    .forEach(button=>{


        button.onclick=function(){


            let id =
            Number(this.dataset.id);



            account.platforms =
            account.platforms.filter(
                platform =>
                platform.id !== id
            );



            saveDatabase();

syncPlatformAnalytics();

renderPlatforms();

loadAnalytics();


        };


    });



}


// =====================================
// SYNC PLATFORM ANALYTICS
// =====================================

function syncPlatformAnalytics(){

    const analytics =
        calculateAnalytics();


    account.platforms.forEach(platform=>{

        const stats =
            analytics.platforms[platform.platform]
            ||
            {
                impressions: 0,
                reach: 0,
                contents: 0,
                growth: 0
            };


        if(!platform.analytics){

            platform.analytics = {};

        }


        platform.analytics.impressions =
            stats.impressions;


        platform.analytics.reach =
            stats.reach;


        platform.analytics.contents =
            stats.contents;


        platform.analytics.followers =
            Number(platform.followers) || 0;


        platform.analytics.growth =
            Number(stats.growth) || 0;

    });


    saveDatabase();

}


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


const connectPlatformBtn =
document.getElementById(
    "connectPlatformBtn"
);


if(connectPlatformBtn){


connectPlatformBtn.onclick=function(){


    platformModal.style.display="flex";


};


}





if(closePlatformModal){


closePlatformModal.onclick=function(){


    platformModal.style.display="none";


};


}





if(cancelPlatform){


cancelPlatform.onclick=function(){


    platformModal.style.display="none";


};


}






// =====================================
// SAVE PLATFORM
// =====================================


if(savePlatform){


savePlatform.onclick=function(){



    if(platformSelect.value===""){


        alert("Select platform.");

        return;

    }



    if(platformUsername.value===""){


        alert("Enter username.");

        return;

    }





    account.platforms.push({



        id:Date.now(),



        platform:
        platformSelect.value,



        username:
        platformUsername.value,



        followers:
        Number(platformFollowers.value)||0,



        analytics:{

    impressions:0,

    reach:0,

    followers:
        Number(platformFollowers.value) || 0,

    contents:0,

    growth:0

},

contents:[]



    });





    saveDatabase();

syncPlatformAnalytics();

renderPlatforms();

loadAnalytics();





    platformSelect.value="";

    platformUsername.value="";

    platformFollowers.value="";



    platformModal.style.display="none";



};



}




// =====================================
// CONTENT MODAL ELEMENTS
// =====================================


const contentModal =
document.getElementById("contentModal");


const closeContentModal =
document.getElementById("closeContentModal");


const cancelContentBtn =
document.getElementById("cancelContent");


const saveContent =
document.getElementById("saveContent");

// =====================================
// ADD CONTENT BUTTON
// =====================================

if(addContent){

    addContent.onclick=function(){

        // Reset edit mode
        editingContentId = null;


        // Reset modal title

        const title =
        document.getElementById(
            "contentModalTitle"
        );

        if(title){

            title.textContent =
            "Add Content";

        }


        // Reset form

        const form =
        contentModal?.querySelector("form");

        if(form){

            form.reset();

        }


        // Reset individual fields

        const date =
        document.getElementById("contentDate");

        const caption =
        document.getElementById("contentCaption");

        const hashtag =
        document.getElementById("contentHashtag");

        const type =
        document.getElementById("contentType");

        const impressions =
        document.getElementById("contentImpressions");

        const reach =
        document.getElementById("contentReach");

        const likes =
        document.getElementById("contentLikes");

        const comments =
        document.getElementById("contentComments");

        const shares =
        document.getElementById("contentShares");

        const saved =
        document.getElementById("contentSaved");

        const platform =
        document.getElementById("contentPlatform");

        const status =
        document.getElementById("contentStatus");


        if(date)
            date.value = "";


        if(caption)
            caption.value = "";


        if(hashtag)
            hashtag.value = "";


        if(type)
    type.value = "";

const subject =
    document.getElementById(
        "contentSubject"
    );

if(subject)
    subject.value = "";

if(impressions)
    impressions.value = 0;


        if(reach)
            reach.value = 0;


        if(likes)
            likes.value = 0;


        if(comments)
            comments.value = 0;


        if(shares)
            shares.value = 0;


        if(saved)
            saved.value = 0;


        if(platform)
            platform.value = "";


        if(status)
            status.value = "Published";


        // Open modal

        if(contentModal){

            contentModal.style.display =
            "flex";

        }

    };

}

const contentStatus =
document.getElementById("contentStatus");





// =====================================
// CLOSE CONTENT MODAL
// =====================================


if(cancelContentBtn){


cancelContentBtn.onclick=function(){


    contentModal.style.display="none";


};


}



if(closeContentModal){


closeContentModal.onclick=function(){


    contentModal.style.display="none";


};


}





// =====================================
// SAVE CONTENT
// =====================================


if(saveContent){

    saveContent.onclick=function(){

        try{

            const date =
                document.getElementById("contentDate");

            const caption =
                document.getElementById("contentCaption");

            const hashtag =
                document.getElementById("contentHashtag");

            const contentType =
    document.getElementById("contentType");

const subject =
    document.getElementById("contentSubject");

            const impressions =
                document.getElementById("contentImpressions");

            const reach =
                document.getElementById("contentReach");

            const likes =
                document.getElementById("contentLikes");

            const comments =
                document.getElementById("contentComments");

            const shares =
                document.getElementById("contentShares");

            const saved =
                document.getElementById("contentSaved");

            const platform =
                document.getElementById("contentPlatform");

            const status =
                document.getElementById("contentStatus");


            // =====================================
            // CHECK REQUIRED ELEMENTS
            // =====================================

            const missing = [];

            if(!date) missing.push("contentDate");
            if(!caption) missing.push("contentCaption");
            if(!hashtag) missing.push("contentHashtag");
            if(!contentType) missing.push("contentType");
if(!subject) missing.push("contentSubject");
if(!impressions) missing.push("contentImpressions");
if(!reach) missing.push("contentReach");
if(!likes) missing.push("contentLikes");
if(!comments) missing.push("contentComments");
            if(!shares) missing.push("contentShares");
            if(!saved) missing.push("contentSaved");
            if(!platform) missing.push("contentPlatform");
            if(!status) missing.push("contentStatus");


            if(missing.length > 0){

                console.error(
                    "Missing content form elements:",
                    missing
                );

                alert(
                    "Content form error.\n\nMissing:\n" +
                    missing.join("\n")
                );

                return;

            }


            // =====================================
            // CREATE CONTENT
            // =====================================

            const content = {

                id:
                    editingContentId !== null
                    ?
                    editingContentId
                    :
                    Date.now(),

                accountId:
                    activeAccountId,

                date:
                    date.value,

                caption:
                    caption.value.trim(),

                hashtag:
                    hashtag.value.trim(),

                contentType:
    contentType.value,

subject:
    document.getElementById("contentSubject").value.trim(),

impressions:
    Number(impressions.value) || 0,

                reach:
                    Number(reach.value) || 0,

                likes:
                    Number(likes.value) || 0,

                comments:
                    Number(comments.value) || 0,

                shares:
                    Number(shares.value) || 0,

                saved:
                    Number(saved.value) || 0,

                platform:
                    platform.value,

                status:
                    status.value || "Published"

            };


            // =====================================
            // VALIDATION
            // =====================================

            if(!content.date){

                alert("Please select a content date.");

                return;

            }


            if(!content.platform){

                alert("Please select a platform.");

                return;

            }


            // =====================================
            // EDIT EXISTING CONTENT
            // =====================================

            if(editingContentId !== null){

                const index =
                    account.contents.findIndex(
                        item =>
                        item.id === editingContentId
                    );


                if(index !== -1){

                    account.contents[index] = content;

                }

            }


            // =====================================
            // ADD NEW CONTENT
            // =====================================

            else{

                account.contents.push(content);

            }


            // =====================================
            // SAVE DATABASE
            // =====================================

            saveDatabase();


            // =====================================
            // REFRESH UI
            // =====================================

            renderContents();

loadAnalytics();

renderSubjectTable();

renderSubjectContentTable();

renderPlatforms();

loadEngagement();

renderHashtags();

renderPlatformComparison();

renderMonthlyReport();

renderWeeklyReport();


            // =====================================
            // RESET EDIT MODE
            // =====================================

            editingContentId = null;


            // =====================================
            // CLOSE MODAL
            // =====================================

            if(contentModal){

                contentModal.style.display =
                    "none";

            }


            // =====================================
            // RESET TITLE
            // =====================================

            const title =
                document.getElementById(
                    "contentModalTitle"
                );

            if(title){

                title.textContent =
                    "Add Content";

            }


            // =====================================
            // SUCCESS
            // =====================================

            showToast(
                "Content saved successfully!",
                "success"
            );


            console.log(
                "Content saved:",
                content
            );

        }

        catch(error){

            console.error(
                "SAVE CONTENT ERROR:",
                error
            );

            alert(
                "Unable to save content.\n\n" +
                error.message
            );

        }

    };

}

// =====================================
// PART 3
// CONTENT TABLE + DELETE SYSTEM
// + TABS + TOAST
// =====================================


// =====================================
// RENDER CONTENT TABLE
// =====================================

function renderContents(){


    const table =
    document.getElementById("contentTableBody");



    if(!table)
        return;



    table.innerHTML = "";



    let sortedContents =
    [...account.contents].sort(
        (a,b)=>
        new Date(a.date)-new Date(b.date)
    );




    sortedContents.forEach((content,index)=>{


        let engagement =

        (Number(content.likes)||0)

        +

        (Number(content.comments)||0)

        +

        (Number(content.shares)||0)

        +

        (Number(content.saved)||0);




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

<span class="status-badge ${
(content.status || "Published")
.toLowerCase()
}">


${
content.status === "Published"
?
"🟢"
:
content.status === "Scheduled"
?
"🔵"
:
content.status === "Draft"
?
"🟠"
:
"🟣"
}


${content.status || "Published"}


</span>


</td>





<td>
    ${formatNumber(content.impressions || 0)}
</td>

<td>
    ${formatNumber(content.reach || 0)}
</td>

<td>
    ${formatNumber(engagement)}
</td>





<td>


<div class="content-actions">


<button
class="edit-content"
data-id="${content.id}">

Edit

</button>



<button
class="delete-content"
data-id="${content.id}">

Delete

</button>


</div>


</td>



</tr>


`;



    });





    // =================================
    // EDIT BUTTON
    // =================================


    document
    .querySelectorAll(".edit-content")
    .forEach(button=>{


        button.onclick=function(){


            let id =
            Number(this.dataset.id);



            let content =
            account.contents.find(
                item =>
                item.id === id
            );



            if(!content)
                return;




            editingContentId=id;




            document.getElementById("contentDate").value =
            content.date || "";



            document.getElementById("contentCaption").value =
            content.caption || "";



            document.getElementById("contentHashtag").value =
            content.hashtag || "";



            document.getElementById("contentType").value =
content.contentType || "";

document.getElementById("contentSubject").value =
content.subject || "";

const impressionsField =
document.getElementById(
    "contentImpressions"
);

if(impressionsField){

    impressionsField.value =
    content.impressions || 0;

}

const reachField =
document.getElementById(
    "contentReach"
);

if(reachField){

    reachField.value =
    content.reach || 0;

}



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



            let title =
            document.getElementById("contentModalTitle");



            if(title){

                title.textContent =
                "Edit Content";

            }



            contentModal.style.display="flex";



        };


    });





    // =================================
    // DELETE BUTTON
    // =================================


    let deleteContentId=null;



    const deleteModal =
    document.getElementById("deleteModal");



    const cancelDelete =
    document.getElementById("cancelDelete");



    const confirmDelete =
    document.getElementById("confirmDelete");





    document
    .querySelectorAll(".delete-content")
    .forEach(button=>{


        button.onclick=function(){


            deleteContentId =
            Number(this.dataset.id);



            if(deleteModal){

                deleteModal.style.display="flex";

            }


        };


    });






    if(cancelDelete){


        cancelDelete.onclick=function(){


            deleteContentId=null;


            deleteModal.style.display="none";


        };


    }






    if(confirmDelete){


        confirmDelete.onclick=function(){



            if(deleteContentId===null)
                return;



            account.contents =
            account.contents.filter(

                item =>
                item.id !== deleteContentId

            );



            saveDatabase();



            renderContents();

loadAnalytics();

renderSubjectTable();

renderSubjectContentTable();

renderPlatforms();




            if(typeof loadEngagement==="function")
                loadEngagement();



            if(typeof renderHashtags==="function")
                renderHashtags();



            if(deleteModal){

                deleteModal.style.display="none";

            }



            deleteContentId=null;



            showToast(
                "Content deleted successfully!",
                "success"
            );


        };


    }



}








// =====================================
// TOAST SYSTEM
// =====================================


function showToast(
message,
type="success"
){



    const toast =
    document.getElementById("toast");



    if(!toast)
        return;



    const icon =
    toast.querySelector(".toast-icon");



    const text =
    toast.querySelector(".toast-message");



    if(text){

        text.textContent =
        message;

    }





    if(icon){


        if(type==="success"){

            icon.innerHTML="✓";

        }


        else if(type==="error"){

            icon.innerHTML="✕";

        }


        else{

            icon.innerHTML="!";

        }


    }





    toast.classList.add("show");



    clearTimeout(toast.timer);



    toast.timer =
    setTimeout(()=>{


        toast.classList.remove("show");


    },3000);



}







// =====================================
// ACCOUNT TABS
// =====================================


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
        );



        tabs.forEach(btn=>{

            btn.classList.remove("active");

        });



        tabContents.forEach(content=>{

            content.classList.remove("active");

        });




        tab.classList.add("active");



        let section =
        document.getElementById(target);



        if(section){

            section.classList.add("active");

        }


    };


});






// =====================================
// RESTORE LAST TAB
// =====================================


let savedTab =
localStorage.getItem(
"activeAccountTab"
);



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
// PART 4
// ENGAGEMENT + HASHTAG + PLATFORM ANALYTICS
// =====================================


// =====================================
// PLATFORM COMPARISON
// =====================================

function renderPlatformComparison(){


    const result =
    document.getElementById(
        "platformComparisonResult"
    );



    if(!result)
        return;



    let platforms = {};



    account.contents.forEach(content=>{


        let platform =
        content.platform || "Unknown";



        if(!platforms[platform]){


            platforms[platform]={
    impressions:0,
    reach:0,
    likes:0,
    comments:0,
    shares:0,
    saved:0
};


        }




        platforms[platform].impressions +=
    Number(content.impressions) || 0;

platforms[platform].reach +=
    Number(content.reach) || 0;



        platforms[platform].likes +=
        Number(content.likes)||0;



        platforms[platform].comments +=
        Number(content.comments)||0;



        platforms[platform].shares +=
        Number(content.shares)||0;



        platforms[platform].saved +=
        Number(content.saved)||0;



    });




    let html="";




    Object.keys(platforms)
    .forEach(platform=>{


        let data =
        platforms[platform];



        let engagement =

        data.likes

        +

        data.comments

        +

        data.shares

        +

        data.saved;




        let rate = 0;

if(data.impressions > 0){

    rate =
    (
        engagement /
        data.impressions *
        100
    ).toFixed(1);

}


        html += `


<div class="platform-performance-item">


<div class="platform-performance-header">


<span>

${platform}

</span>



<strong>

${rate}%

</strong>



</div>



<div class="performance-bar">


<span style="width:${rate}%"></span>


</div>



</div>


`;



    });




    if(html===""){


        html =
        "No platform data yet.";


    }




    result.innerHTML =
    html;



}









// =====================================
// HASHTAG ANALYTICS
// =====================================

function renderHashtags(){

    const hashtagList =
        document.getElementById(
            "hashtagList"
        );


    const hashtagSummary =
        document.getElementById(
            "hashtagSummary"
        );


    if(!hashtagList)
        return;


    let hashtags = {};



    account.contents.forEach(content=>{

        if(!content.hashtag)
            return;


        let tags =
            content.hashtag.split(/\s+/);


        tags.forEach(tag=>{

            tag =
                tag.replace(/^#/,"")
                .trim();


            if(tag === "")
                return;


            let key =
                tag.toLowerCase();


            if(!hashtags[key]){

                hashtags[key] = {

                    name:
                        tag.charAt(0).toUpperCase()
                        +
                        tag.slice(1).toLowerCase(),

                    used: 0,

                    impressions: 0,

                    reach: 0,

                    likes: 0,

                    comments: 0,

                    shares: 0,

                    saved: 0

                };

            }


            hashtags[key].used++;


            hashtags[key].impressions +=
    Number(content.impressions) || 0;

hashtags[key].reach +=
    Number(content.reach) || 0;

            hashtags[key].likes +=
                Number(content.likes) || 0;


            hashtags[key].comments +=
                Number(content.comments) || 0;


            hashtags[key].shares +=
                Number(content.shares) || 0;


            hashtags[key].saved +=
                Number(content.saved) || 0;

        });

    });


    let html = "";


    let totalUsage = 0;

    let totalReach = 0;

    let bestHashtag = "-";


    let highestImpressions = 0;


    Object.values(hashtags)

    .sort(
        (a,b) =>
            b.impressions - a.impressions
    )

    .forEach(tag=>{


        totalUsage +=
            tag.used;


        if(
            tag.impressions >
            highestImpressions
        ){

            highestImpressions =
                tag.impressions;

            bestHashtag =
                "#" + tag.name;

        }


        let engagement =

            tag.likes +
            tag.comments +
            tag.shares +
            tag.saved;


        let rate = 0;


        if(tag.impressions > 0){

            rate =
                (
                    engagement /
                    tag.impressions *
                    100
                ).toFixed(1);

        }


        html += `

        <tr>

            <td class="hashtag-name">
                #${tag.name}
            </td>


            <td>
                ${tag.used}
            </td>


            <td>
                ${formatNumber(tag.impressions)}
            </td>

            <td>
                ${formatNumber(tag.reach)}
            </td>


            <td>
                ${formatNumber(tag.likes)}
            </td>


            <td>
                ${formatNumber(tag.comments)}
            </td>


            <td>
                ${formatNumber(tag.shares)}
            </td>


            <td>
                ${formatNumber(tag.saved)}
            </td>


            <td>
                ${rate}%
            </td>

        </tr>

        `;

    });


    if(html === ""){

        html = `

        <tr>

            <td colspan="9">
    No hashtag data yet.
</td>

        </tr>

        `;

    }


    hashtagList.innerHTML =
        html;


    // =====================================
    // HASHTAG SUMMARY
    // =====================================

    if(hashtagSummary){

    hashtagSummary.innerHTML = `

    <div class="hashtag-card">

        <span>
            Total Hashtags
        </span>

        <h2>
            ${Object.keys(hashtags).length}
        </h2>

    </div>


    <div class="hashtag-card">

        <span>
            Total Usage
        </span>

        <h2>
            ${totalUsage}
        </h2>

    </div>


    <div class="hashtag-card">

        <span>
            Best Hashtag
        </span>

        <h2>
            ${bestHashtag}
        </h2>

    </div>


    <div class="hashtag-card">

        <span>
            Most Impressions
        </span>

        <h2>
            ${formatNumber(highestImpressions)}
        </h2>

    </div>

    `;

}

}








// =====================================
// ENGAGEMENT ANALYTICS
// =====================================

function loadEngagement(){



    const contents =
    account.contents || [];



    let likes=0;

    let comments=0;

    let shares=0;

    let saved=0;

    let impressions = 0;

let reach = 0;



    let contentTypes={};

    let platformEngagement={};



    let topContent=null;

    let topScore=-1;





    contents.forEach(content=>{



        likes +=
        Number(content.likes)||0;



        comments +=
        Number(content.comments)||0;



        shares +=
        Number(content.shares)||0;



        saved +=
        Number(content.saved)||0;



        impressions +=
    Number(content.impressions) || 0;

    reach +=
    Number(content.reach) || 0;






        let type =
        content.contentType ||
        "Uncategorized";



        contentTypes[type] =
        (contentTypes[type]||0)+1;





        let platform =
        content.platform ||
        "Unknown";



        let engagement =

        (Number(content.likes)||0)

        +

        (Number(content.comments)||0)

        +

        (Number(content.shares)||0)

        +

        (Number(content.saved)||0);





        platformEngagement[platform] =
        (platformEngagement[platform]||0)
        +
        engagement;






        let score =
    Number(content.impressions || 0) > 0
    ?
    (
        engagement /
        Number(content.impressions) *
        100
    )
    :
    0;


if(score > topScore){

    topScore = score;

    topContent = content;

}




    });





    let totalEngagement =
    likes+
    comments+
    shares+
    saved;




    let rate = "0.0";

if(Number(impressions) > 0){

    rate = (
        Number(totalEngagement) /
        Number(impressions) *
        100
    ).toFixed(1);

}






    let bestPlatform = "-";

let highest = 0;


Object.keys(platformEngagement).forEach(platform=>{

    let value = Number(platformEngagement[platform]) || 0;


    if(value > highest){

        highest = value;

        bestPlatform = platform;

    }

});




    let elements={


        totalEngagement:
        totalEngagement,

        totalReach:
        reach,

        engagementRate:
        rate+"%",


        bestPlatform:
        bestPlatform,


        totalLikes:
        likes,


        totalComments:
        comments,


        totalShares:
        shares,


        totalSaved:
        saved


    };





    Object.keys(elements)
.forEach(id=>{


    let el =
    document.getElementById(id);



    if(el){


        if(
            id === "engagementRate" ||
            id === "bestPlatform"
        ){

            el.textContent =
            elements[id];


        }

        else{


            el.textContent =
            Number(elements[id])
            .toLocaleString();


        }


    }



});





    const topResult =
    document.getElementById(
        "topContentResult"
    );


    if(topResult){



        if(topContent){


            topResult.innerHTML=`


<div class="top-content-item">


<p class="top-content-caption">

${topContent.caption || "Untitled"}

</p>


<p>

Platform:
${topContent.platform}

</p>


<p>

👁 Impressions:
${formatNumber(topContent.impressions)}

</p>


<p>

🔥 Engagement:
${formatNumber(
(Number(topContent.likes)||0)
+
(Number(topContent.comments)||0)
+
(Number(topContent.shares)||0)
+
(Number(topContent.saved)||0)
)}

</p>



</div>


`;


        }

        else{

    topResult.innerHTML = `

        <div class="top-content-empty">

            <div class="top-content-empty-icon">
                📊
            </div>

            <h3>
                No Content Yet
            </h3>

            <p>
                Add content to see your top performing post.
            </p>

        </div>

    `;

}

    }






    const typeResult =
    document.getElementById(
        "contentTypeResult"
    );



    if(typeResult){


        let html="";



        Object.keys(contentTypes)
        .forEach(type=>{


            html += `


<div class="content-type-item">


<span>

${type}

</span>


<strong>

${contentTypes[type]} posts

</strong>


</div>


`;


        });



        typeResult.innerHTML =
        html || "No content type data yet.";


    }





}

// =====================================
// PART 5
// MONTHLY + WEEKLY REPORT
// FILTERS
// LOGO
// STARTUP
// =====================================



// =====================================
// GROWTH CALCULATOR
// =====================================

function calculateGrowth(current, previous){


    if(previous===0){


        return current===0
        ?
        0
        :
        100;


    }



    return (
        (current-previous)
        /
        previous
        *
        100
    );


}





function growthIndicator(value){


    if(value>0){


        return `

<small class="monthly-growth growth-up">

↑ ${value.toFixed(1)}% from last month

</small>

`;

    }


    if(value<0){


        return `

<small class="monthly-growth growth-down">

↓ ${Math.abs(value).toFixed(1)}% from last month

</small>

`;

    }



    return `

<small class="monthly-growth growth-neutral">

— 0% from last month

</small>

`;

}





// =====================================
// MONTHLY REPORT
// =====================================

function renderMonthlyReport(){


const summary =
document.getElementById(
"monthlySummary"
);


if(!summary)
return;



const monthFilter =
document.getElementById(
"monthlyFilter"
);


const yearFilter =
document.getElementById(
"monthlyYearFilter"
);



const now =
new Date();



const month =
monthFilter
?
Number(monthFilter.value)
:
now.getMonth();



const year =
yearFilter
?
Number(yearFilter.value)
:
now.getFullYear();





let impressions = 0;

let reach = 0;

let posts = 0;

let engagement = 0;



account.contents.forEach(content=>{


if(!content.date)
return;



let date =
    new Date(content.date + "T00:00:00");



if(
date.getMonth()===month
&&
date.getFullYear()===year
){


posts++;


impressions +=
Number(content.impressions)||0;

reach +=
Number(content.reach)||0;



engagement +=

(Number(content.likes)||0)

+

(Number(content.comments)||0)

+

(Number(content.shares)||0)

+

(Number(content.saved)||0);



}



});


    let rate =
impressions > 0
?
(
    engagement / impressions * 100
).toFixed(1)
:
0;


    summary.innerHTML = `


<div class="monthly-card">

    <div class="monthly-card-icon">
        👁
    </div>

    <div class="monthly-card-info">

        <span>
            Impressions
        </span>

        <h2>
            ${formatNumber(impressions)}
        </h2>

    </div>

</div>


<div class="monthly-card">

    <div class="monthly-card-icon">
        👥
    </div>

    <div class="monthly-card-info">

        <span>
            Reach
        </span>

        <h2>
            ${formatNumber(reach)}
        </h2>

    </div>

</div>


<div class="monthly-card">

    <div class="monthly-card-icon">
        📝
    </div>

    <div class="monthly-card-info">

        <span>
            Posts
        </span>

        <h2>
            ${posts}
        </h2>

    </div>

</div>


<div class="monthly-card">

    <div class="monthly-card-icon">
        🔥
    </div>

    <div class="monthly-card-info">

        <span>
            Engagement
        </span>

        <h2>
            ${formatNumber(engagement)}
        </h2>

    </div>

</div>


<div class="monthly-card">

    <div class="monthly-card-icon">
        📊
    </div>

    <div class="monthly-card-info">

        <span>
            Rate
        </span>

        <h2>
            ${rate}%
        </h2>

    </div>

</div>


`;

renderMonthlyPlatformReport();

renderMonthlyTopContent(month, year);

renderMonthlyContentTable(month, year);


}



// =====================================
// MONTHLY PLATFORM REPORT
// =====================================

function renderMonthlyPlatformReport(){


    const platformBox =
    document.getElementById(
        "monthlyPlatforms"
    );


    const bestBox =
    document.getElementById(
        "monthlyBestPlatform"
    );



    if(!platformBox)
        return;



    let platforms = {};



    const monthFilter =
    document.getElementById(
        "monthlyFilter"
    );


    const yearFilter =
    document.getElementById(
        "monthlyYearFilter"
    );



    const selectedMonth =
    monthFilter
    ?
    Number(monthFilter.value)
    :
    new Date().getMonth();



    const selectedYear =
    yearFilter
    ?
    Number(yearFilter.value)
    :
    new Date().getFullYear();





    account.contents.forEach(content=>{



        if(!content.date)
            return;



        let date =
    new Date(content.date + "T00:00:00");




        if(
            date.getMonth() !== selectedMonth ||
            date.getFullYear() !== selectedYear
        ){

            return;

        }





        let platform =
        content.platform || "Unknown";




        if(!platforms[platform]){

    platforms[platform]={

        impressions:0,

        reach:0,

        engagement:0,

        posts:0

    };

}





        platforms[platform].impressions +=
Number(content.impressions) || 0;

platforms[platform].reach +=
Number(content.reach) || 0;




        platforms[platform].engagement +=

        (Number(content.likes)||0)

        +

        (Number(content.comments)||0)

        +

        (Number(content.shares)||0)

        +

        (Number(content.saved)||0);




        platforms[platform].posts++;




    });






    let html = "";



    let bestPlatform = "-";

let highestEngagement = -1;





    Object.keys(platforms)

    .forEach(platform=>{



        let data =
        platforms[platform];





        if(
            data.engagement >
            highestEngagement
        ){

            highestEngagement =
            data.engagement;


            bestPlatform =
            platform;


        }





        html += `


<div class="platform-performance-item">


    <div class="platform-performance-header">


        <span>
            ${platform}
        </span>


        <strong>
    ${formatNumber(data.impressions)}
    impressions
</strong>


    </div>



    <div class="platform-performance-detail">

    <span>
        ${data.posts} posts
    </span>

    <span>
        ${formatNumber(data.impressions)}
        impressions
    </span>

    <span>
        ${formatNumber(data.reach)}
        reach
    </span>

    <span>
        ${formatNumber(data.engagement)}
        engagement
    </span>

</div>



</div>


`;



    });






    if(html === ""){


        html =
        "No platform data this month.";


    }




    platformBox.innerHTML =
    html;





    if(bestBox){

    if(bestPlatform !== "-"){

        bestBox.innerHTML = `

        <div class="monthly-best-platform">

            <div class="monthly-best-platform-glow"></div>

            <div class="monthly-best-platform-top">

                <div class="monthly-best-platform-trophy">
                    🏆
                </div>

                <span class="monthly-best-platform-badge">
                    #1 PERFORMER
                </span>

            </div>


            <div class="monthly-best-platform-main">

                <span class="monthly-best-platform-label">
                    BEST PLATFORM THIS MONTH
                </span>

                <h2>
                    ${bestPlatform}
                </h2>

                <p>
                    Leading your social media performance
                </p>

            </div>


            <div class="monthly-best-platform-bottom">

                <div class="monthly-best-platform-stat">

                    <span>
                        Engagement
                    </span>

                    <strong>
                        ${formatNumber(highestEngagement)}
                    </strong>

                </div>


                <div class="monthly-best-platform-divider"></div>


                <div class="monthly-best-platform-stat">

                    <span>
                        Performance
                    </span>

                    <strong>
                        TOP
                    </strong>

                </div>

            </div>

        </div>

        `;

    }

    else{

        bestBox.innerHTML = `

        <div class="monthly-best-platform-empty">

            <div class="monthly-empty-icon">
                🏆
            </div>

            <h3>
                No Winner Yet
            </h3>

            <p>
                Add content this month to see your best platform.
            </p>

        </div>

        `;

       }

}

}

// =====================================
// WEEKLY REPORT
// =====================================

function renderWeeklyReport(){

    const monthSelect =
        document.getElementById("weeklyMonthFilter");

    const weekSelect =
        document.getElementById("weeklyFilter");


    if(!monthSelect || !weekSelect){

        console.log("Weekly filters not found.");

        return;

    }


    const selectedMonth =
        Number(monthSelect.value);

    const selectedWeek =
        Number(weekSelect.value);


    if(
        Number.isNaN(selectedMonth) ||
        Number.isNaN(selectedWeek)
    ){

        console.log("Invalid weekly filter.");

        return;

    }


    // =====================================
// YEAR
// =====================================

const yearSelect =
    document.getElementById(
        "weeklyYearFilter"
    );

const selectedYear =
    yearSelect && yearSelect.value
    ?
    Number(yearSelect.value)
    :
    new Date().getFullYear();


    // =====================================
    // WEEK RANGE
    // =====================================

    const startDay =
        (selectedWeek * 7) + 1;


    const lastDayOfMonth =
        new Date(
            selectedYear,
            selectedMonth + 1,
            0
        ).getDate();


    const endDay =
        Math.min(
            startDay + 6,
            lastDayOfMonth
        );


    const startDate =
        new Date(
            selectedYear,
            selectedMonth,
            startDay,
            0,
            0,
            0,
            0
        );


    const endDate =
        new Date(
            selectedYear,
            selectedMonth,
            endDay,
            23,
            59,
            59,
            999
        );


    console.log(
        "Weekly range:",
        startDate,
        endDate
    );


    // =====================================
    // FILTER ACCOUNT CONTENT
    // =====================================

    const weeklyContents =
        (account.contents || []).filter(content=>{

            if(!content.date)
                return false;


            const contentDate =
                new Date(content.date + "T00:00:00");


            return (
                contentDate >= startDate &&
                contentDate <= endDate
            );

        });


    console.log(
        "WEEKLY CONTENTS:",
        weeklyContents
    );


    // =====================================
    // CALCULATE SUMMARY
    // =====================================

    let weeklyPosts = 0;

    let weeklyImpressions = 0;

    let weeklyReach = 0;

    let weeklyLikes = 0;

    let weeklyComments = 0;

    let weeklyShares = 0;

    let weeklySaved = 0;


    weeklyContents.forEach(content=>{

        weeklyPosts++;


        weeklyImpressions +=
    Number(content.impressions) || 0;

weeklyReach +=
    Number(content.reach) || 0;


        weeklyLikes +=
            Number(content.likes) || 0;


        weeklyComments +=
            Number(content.comments) || 0;


        weeklyShares +=
            Number(content.shares) || 0;


        weeklySaved +=
            Number(content.saved) || 0;

    });


    const weeklyEngagement =
        weeklyLikes +
        weeklyComments +
        weeklyShares +
        weeklySaved;


    const weeklyRate =
    weeklyImpressions > 0
    ?
    (
        weeklyEngagement /
        weeklyImpressions *
        100
    ).toFixed(1)
    :
    "0.0";


    // =====================================
    // WEEKLY SUMMARY
    // =====================================

    const summary =
        document.getElementById(
            "weeklySummary"
        );


    if(summary){

        summary.innerHTML = `

        <div class="monthly-card">

    <div class="monthly-card-icon">
        👁
    </div>

    <div class="monthly-card-info">

        <span>
            Impressions
        </span>

        <h2>
            ${formatNumber(weeklyImpressions)}
        </h2>

    </div>

</div>


<div class="monthly-card">

    <div class="monthly-card-icon">
        👥
    </div>

    <div class="monthly-card-info">

        <span>
            Reach
        </span>

        <h2>
            ${formatNumber(weeklyReach)}
        </h2>

    </div>

</div>


        <div class="monthly-card">

            <div class="monthly-card-icon">
                📝
            </div>

            <div class="monthly-card-info">

                <span>
                    Posts
                </span>

                <h2>
                    ${weeklyPosts}
                </h2>

            </div>

        </div>


        <div class="monthly-card">

            <div class="monthly-card-icon">
                🔥
            </div>

            <div class="monthly-card-info">

                <span>
                    Engagement
                </span>

                <h2>
                    ${formatNumber(weeklyEngagement)}
                </h2>

            </div>

        </div>


        <div class="monthly-card">

            <div class="monthly-card-icon">
                📊
            </div>

            <div class="monthly-card-info">

                <span>
                    Rate
                </span>

                <h2>
                    ${weeklyRate}%
                </h2>

            </div>

        </div>

        `;

    }


    // =====================================
    // DATE RANGE
    // =====================================

    const dateRange =
        document.getElementById(
            "weeklyDateRange"
        );


    if(dateRange){

        dateRange.textContent =

            `${startDate.toLocaleDateString(
                "en-US",
                {
                    month:"short",
                    day:"numeric"
                }
            )} – ${endDate.toLocaleDateString(
                "en-US",
                {
                    month:"short",
                    day:"numeric",
                    year:"numeric"
                }
            )}`;

    }


    // =====================================
    // PLATFORM PERFORMANCE
    // =====================================

    renderWeeklyPlatformReport(
        weeklyContents
    );


    // =====================================
    // BEST PLATFORM
    // =====================================

    renderWeeklyBestPlatform(
        weeklyContents
    );


    // =====================================
    // TOP CONTENT
    // =====================================

    renderWeeklyTopContent(
        weeklyContents
    );


    // =====================================
    // CONTENT TABLE
    // =====================================

    renderWeeklyContentTable(
        weeklyContents
    );

}



// =====================================
// WEEKLY PLATFORM REPORT
// =====================================

function renderWeeklyPlatformReport(
    weeklyContents
){

    const box =
        document.getElementById(
            "weeklyPlatforms"
        );


    if(!box)
        return;


    const platforms = {};


    weeklyContents.forEach(content=>{

        const platform =
            content.platform || "Unknown";


        if(!platforms[platform]){

            platforms[platform] = {

    impressions:0,

    reach:0,

    engagement:0,

    posts:0

};

        }


        platforms[platform].impressions +=
    Number(content.impressions) || 0;

platforms[platform].reach +=
    Number(content.reach) || 0;


        platforms[platform].engagement +=

            (Number(content.likes) || 0) +

            (Number(content.comments) || 0) +

            (Number(content.shares) || 0) +

            (Number(content.saved) || 0);


        platforms[platform].posts++;

    });


    let html = "";


    Object.keys(platforms).forEach(platform=>{

        const data =
            platforms[platform];


        html += `

        <div class="platform-performance-item">

            <div class="platform-performance-header">

                <span>
                    ${platform}
                </span>

                <strong>
    ${formatNumber(data.impressions)}
    impressions
</strong>

            </div>


            <div class="platform-performance-detail">

    <span>
        ${data.posts} posts
    </span>

    <span>
        ${formatNumber(data.impressions)}
        impressions
    </span>

    <span>
        ${formatNumber(data.reach)}
        reach
    </span>

    <span>
        ${formatNumber(data.engagement)}
        engagement
    </span>

</div>

        </div>

        `;

    });


    if(html === ""){

        html =
            "No platform data this week.";

    }


    box.innerHTML =
        html;

}


// =====================================
// WEEKLY BEST PLATFORM
// PREMIUM DESIGN
// =====================================

function renderWeeklyBestPlatform(
    weeklyContents
){

    const box =
        document.getElementById(
            "weeklyBestPlatform"
        );


    if(!box)
        return;


    const platforms = {};


    // =====================================
    // CALCULATE PLATFORM PERFORMANCE
    // =====================================

    weeklyContents.forEach(content=>{

        const platform =
            content.platform || "Unknown";


        if(!platforms[platform]){

            platforms[platform] = {

    impressions: 0,

    reach: 0,

    engagement: 0,

    posts: 0

};

        }


        platforms[platform].impressions +=
    Number(content.impressions) || 0;

platforms[platform].reach +=
    Number(content.reach) || 0;


        platforms[platform].engagement +=

            (Number(content.likes) || 0) +

            (Number(content.comments) || 0) +

            (Number(content.shares) || 0) +

            (Number(content.saved) || 0);


        platforms[platform].posts++;

    });


    // =====================================
    // FIND BEST PLATFORM
    // =====================================

    let bestPlatform = null;


    Object.keys(platforms).forEach(platform=>{

        if(
            !bestPlatform ||

            platforms[platform].engagement >
            platforms[bestPlatform].engagement
        ){

            bestPlatform =
                platform;

        }

    });


    // =====================================
    // NO DATA
    // =====================================

    if(!bestPlatform){

        box.innerHTML = `

        <div class="weekly-best-empty">

            <div class="weekly-best-empty-icon">
                🏆
            </div>

            <h3>
                No platform data yet
            </h3>

            <p>
                Publish content during this week
                to see your best platform.
            </p>

        </div>

        `;

        return;

    }


    // =====================================
    // BEST PLATFORM DATA
    // =====================================

    const data =
        platforms[bestPlatform];


    const engagementRate =
    data.impressions > 0
    ?
    (
        data.engagement /
        data.impressions *
        100
    ).toFixed(1)
    :
    "0.0";


    // =====================================
    // PLATFORM ICON
    // =====================================

    const icon =
        getPlatformIcon(bestPlatform);


    // =====================================
    // PLATFORM CLASS
    // =====================================

    const platformClass =
        getPlatformClass(bestPlatform);


    // =====================================
    // RENDER PREMIUM CARD
    // =====================================

    box.innerHTML = `

    <div class="
        weekly-best-platform-card
        ${platformClass}
    ">


        <div class="weekly-best-top">


            <div class="weekly-best-badge">

                🏆

                <span>
                    BEST PLATFORM
                </span>

            </div>


            <div class="weekly-best-rank">

                #1

            </div>


        </div>



        <div class="weekly-best-main">


            <div class="weekly-best-icon">

                <img
                    src="${icon}"
                    alt="${bestPlatform}"
                >

            </div>


            <div class="weekly-best-platform-name">

                <span>
                    This Week's Winner
                </span>

                <h2>
                    ${bestPlatform}
                </h2>

            </div>


        </div>



        <div class="weekly-best-stats">


            <div class="weekly-best-stat">

    <span>
        Impressions
    </span>

    <strong>
        ${formatNumber(data.impressions)}
    </strong>

</div>

<div class="weekly-best-stat">

    <span>
        Reach
    </span>

    <strong>
        ${formatNumber(data.reach)}
    </strong>

</div>


            <div class="weekly-best-stat">

                <span>
                    Engagement
                </span>

                <strong>
                    ${formatNumber(data.engagement)}
                </strong>

            </div>


            <div class="weekly-best-stat">

                <span>
                    Posts
                </span>

                <strong>
                    ${data.posts}
                </strong>

            </div>


            <div class="weekly-best-stat">

                <span>
                    Rate
                </span>

                <strong>
                    ${engagementRate}%
                </strong>

            </div>


        </div>



        <div class="weekly-best-footer">

            <span>
                🏆 Highest engagement this week
            </span>

        </div>


    </div>

    `;

}



// =====================================
// WEEKLY TOP CONTENT
// =====================================

function renderWeeklyTopContent(
    weeklyContents
){

    const box =
        document.getElementById(
            "weeklyTopContent"
        );


    if(!box)
        return;


    if(weeklyContents.length === 0){

    box.innerHTML = `

        <div class="top-content-empty">

            <div class="top-content-empty-icon">
                📊
            </div>

            <h3>
                No Content This Week
            </h3>

            <p>
                Add content to see your top performing post.
            </p>

        </div>

    `;

    return;

}


    const sorted =
        [...weeklyContents].sort(
            (a,b)=>{

                const engagementA =

                    (Number(a.likes) || 0) +

                    (Number(a.comments) || 0) +

                    (Number(a.shares) || 0) +

                    (Number(a.saved) || 0);


                const engagementB =

                    (Number(b.likes) || 0) +

                    (Number(b.comments) || 0) +

                    (Number(b.shares) || 0) +

                    (Number(b.saved) || 0);


                const rateA =

    Number(a.impressions) > 0

    ?

    (
        engagementA /
        Number(a.impressions) *
        100
    )

    :

    0;


const rateB =

    Number(b.impressions) > 0

    ?

    (
        engagementB /
        Number(b.impressions) *
        100
    )

    :

    0;


return rateB - rateA;

            }
        );


    const top =
        sorted[0];


    const engagement =

        (Number(top.likes) || 0) +

        (Number(top.comments) || 0) +

        (Number(top.shares) || 0) +

        (Number(top.saved) || 0);


    box.innerHTML = `

    <div class="top-monthly-item">

        <h3>
            ${top.caption || "Untitled Content"}
        </h3>

        <p>
            Platform:
            ${top.platform || "-"}
        </p>

        <p>
    👁 ${formatNumber(top.impressions || 0)}
    impressions
</p>

<p>
    👥 ${formatNumber(top.reach || 0)}
    reach
</p>

        <p>
            🔥 ${formatNumber(engagement)}
            engagement
        </p>

    </div>

    `;

}



// =====================================
// MONTHLY TOP CONTENT
// =====================================

function renderMonthlyTopContent(month, year){

    const box =
        document.getElementById(
            "monthlyTopContent"
        );

    if(!box)
        return;


    let contents =
        account.contents.filter(content=>{

            if(!content.date)
                return false;

            let date =
                new Date(content.date);

            return (
                date.getMonth() === month &&
                date.getFullYear() === year
            );

        });


    if(contents.length === 0){

    box.innerHTML = `

        <div class="top-content-empty">

            <div class="top-content-empty-icon">
                📊
            </div>

            <h3>
                No Content This Month
            </h3>

            <p>
                Add content to see your top performing post.
            </p>

        </div>

    `;

    return;

}


    // =====================================
    // CALCULATE TOP CONTENT SCORE
    // =====================================

    contents.sort((a,b)=>{

        const engagementA =

            (Number(a.likes) || 0) +

            (Number(a.comments) || 0) +

            (Number(a.shares) || 0) +

            (Number(a.saved) || 0);


        const engagementB =

            (Number(b.likes) || 0) +

            (Number(b.comments) || 0) +

            (Number(b.shares) || 0) +

            (Number(b.saved) || 0);


        const rateA =

    Number(a.impressions) > 0

    ?

    (
        engagementA /
        Number(a.impressions) *
        100
    )

    :

    0;


const rateB =

    Number(b.impressions) > 0

    ?

    (
        engagementB /
        Number(b.impressions) *
        100
    )

    :

    0;


return rateB - rateA;

    });


    const top =
        contents[0];


    const engagement =

        (Number(top.likes) || 0) +

        (Number(top.comments) || 0) +

        (Number(top.shares) || 0) +

        (Number(top.saved) || 0);


    box.innerHTML = `

    <div class="top-monthly-item">

        <h3>
            ${top.caption || "Untitled Content"}
        </h3>


        <p>
            Platform:
            ${top.platform || "-"}
        </p>


        <p>
            👁 ${formatNumber(top.impressions || 0)}
            impressions
        </p>


        <p>
            👥 ${formatNumber(top.reach || 0)}
            reach
        </p>


        <p>
            🔥 ${formatNumber(engagement)}
            engagement
        </p>

    </div>

    `;

}


// =====================================
// MONTHLY CONTENT TABLE
// =====================================

function renderMonthlyContentTable(month, year){

    const table =
        document.getElementById(
            "monthlyContentTable"
        );

    if(!table)
        return;


    const contents =
        (account.contents || []).filter(content => {

            if(!content.date)
                return false;


            const date =
                new Date(
                    content.date + "T00:00:00"
                );


            return (
                date.getMonth() === month &&
                date.getFullYear() === year
            );

        });


    if(contents.length === 0){

        table.innerHTML = `

            <tr>

                <td colspan="6">
                    No content data this month.
                </td>

            </tr>

        `;

        return;

    }


    let html = "";


    contents.forEach(content => {

        const engagement =

            (Number(content.likes) || 0) +
            (Number(content.comments) || 0) +
            (Number(content.shares) || 0) +
            (Number(content.saved) || 0);


        html += `

            <tr>

                <td>
                    ${content.date || "-"}
                </td>

                <td>
                    ${content.platform || "-"}
                </td>

                <td>
                    ${content.caption || "-"}
                </td>

                <td>
                    ${formatNumber(
                        Number(content.impressions) || 0
                    )}
                </td>

                <td>
                    ${formatNumber(
                        Number(content.reach) || 0
                    )}
                </td>

                <td>
                    ${formatNumber(engagement)}
                </td>

            </tr>

        `;

    });


    table.innerHTML =
        html;

}


// =====================================
// WEEKLY CONTENT TABLE
// =====================================

function renderWeeklyContentTable(weeklyContents){

    const table =
        document.getElementById(
            "weeklyContentTable"
        );

    if(!table)
        return;


    if(
        !weeklyContents ||
        weeklyContents.length === 0
    ){

        table.innerHTML = `

            <tr>

                <td colspan="6">
                    No content data this week.
                </td>

            </tr>

        `;

        return;

    }


    let html = "";


    weeklyContents.forEach(content => {

        const engagement =

            (Number(content.likes) || 0) +
            (Number(content.comments) || 0) +
            (Number(content.shares) || 0) +
            (Number(content.saved) || 0);


        html += `

            <tr>

                <td>
                    ${content.date || "-"}
                </td>

                <td>
                    ${content.platform || "-"}
                </td>

                <td>
                    ${content.caption || "-"}
                </td>

                <td>
                    ${formatNumber(
                        Number(content.impressions) || 0
                    )}
                </td>

                <td>
                    ${formatNumber(
                        Number(content.reach) || 0
                    )}
                </td>

                <td>
                    ${formatNumber(engagement)}
                </td>

            </tr>

        `;

    });


    table.innerHTML =
        html;

}


// =====================================
// BUILD WEEKLY YEAR FILTER
// =====================================

function buildWeeklyYearFilter(){

    const year =
        document.getElementById(
            "weeklyYearFilter"
        );

    if(!year)
        return;

    const current =
        new Date().getFullYear();

    year.innerHTML = "";

    for(
        let y = current - 5;
        y <= current + 1;
        y++
    ){

        year.innerHTML += `

        <option value="${y}">
            ${y}
        </option>

        `;

    }

    year.value = current;

}


// =====================================
// BUILD MONTH FILTER
// =====================================

function buildMonthlyFilters(){


const month =
document.getElementById(
"monthlyFilter"
);



const year =
document.getElementById(
"monthlyYearFilter"
);



if(!month || !year)
return;



const months=[

"January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December"

];



month.innerHTML="";



months.forEach((m,i)=>{


month.innerHTML+=`

<option value="${i}">

${m}

</option>

`;

});



month.value =
new Date().getMonth();



year.innerHTML="";



let current =
new Date().getFullYear();



for(
let y=current-5;
y<=current+1;
y++
){


year.innerHTML+=`

<option value="${y}">

${y}

</option>

`;

}



year.value=current;



}






// =====================================
// LOGO BUTTON
// =====================================

const logoButton =
document.getElementById(
"logoButton"
);


const logoModal =
document.getElementById(
"logoModal"
);


const saveLogo =
document.getElementById(
"saveLogo"
);


const logoUrl =
document.getElementById(
"logoUrl"
);



if(account.logoButtonImage && logoButton){


logoButton.innerHTML=`

<img src="${account.logoButtonImage}">

`;

}



if(logoButton){


logoButton.onclick=function(){


logoModal.style.display="flex";


};


}



if(saveLogo){


saveLogo.onclick=function(){


let url =
logoUrl.value.trim();



if(url==="")
return;



account.logoButtonImage=url;



saveDatabase();



logoButton.innerHTML=`

<img src="${url}">

`;



logoModal.style.display="none";



};



}



// =====================================
// BACK TO ACCOUNT VAULT
// =====================================

const backButton =
    document.getElementById("backButton");

if(backButton){

    backButton.onclick = function(){

        window.location.href =
            "dashboard.html";

    };

}

// =====================================
// AUTO SAVE
// =====================================

window.addEventListener(

"beforeunload",

()=>{

saveDatabase();

}

);






// =====================================
// FINAL LOAD
// =====================================


syncPlatformAnalytics();

renderContents();

loadAnalytics();

renderSubjectTable();

renderSubjectContentTable();

renderPlatforms();

loadEngagement();

renderHashtags();

renderPlatformComparison();

buildMonthlyFilters();

buildWeeklyYearFilter();

const weeklyMonthFilter =
    document.getElementById("weeklyMonthFilter");

if(weeklyMonthFilter){

    weeklyMonthFilter.value =
        new Date().getMonth();

}

document
.getElementById("monthlyFilter")
?.addEventListener("change", renderMonthlyReport);

document
.getElementById("monthlyYearFilter")
?.addEventListener("change", renderMonthlyReport);


document
.getElementById("weeklyMonthFilter")
?.addEventListener("change", renderWeeklyReport);

document
.getElementById("weeklyFilter")
?.addEventListener("change", renderWeeklyReport);

document
.getElementById("weeklyYearFilter")
?.addEventListener("change", renderWeeklyReport);

renderMonthlyReport();

if(
    document.getElementById("weeklyFilter") &&
    document.getElementById("weeklyMonthFilter")
){

    renderWeeklyReport();

}




// GLOBAL ACCESS

window.account =
account;


window.profile =
profile;
