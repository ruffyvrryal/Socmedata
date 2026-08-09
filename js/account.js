// =====================================
// SOCMEDATA ACCOUNT DASHBOARD
// PART 1 OF 3
// FIREBASE + ACCOUNT + ANALYTICS
// + PLATFORM SYSTEM + CONTENT MODAL
// =====================================


// =====================================
// FIRESTORE DATABASE
// =====================================

import {
    getProfile,
    saveProfile
} from "./firebase-db.js";

import {
    auth
} from "./firebase.js";


// =====================================
// ACTIVE IDS
// =====================================

let activeProfileId =
    localStorage.getItem("activeProfileId");

let activeAccountId =
    localStorage.getItem("activeAccountId");


// =====================================
// ACTIVE DATA
// =====================================

let activeProfile = null;

let account = null;


// =====================================
// EDIT MODE
// =====================================

let editingContentId = null;


// =====================================
// PLATFORM FILTER
// =====================================

let selectedPlatformValue = "all";


// =====================================
// FIRESTORE SAVE QUEUE
// =====================================
// Firestore is the source of truth.
// Saves are queued so rapid changes do not
// overwrite one another.

let saveQueue = Promise.resolve();

function saveDatabase(){

    if(!activeProfile || !activeProfileId){

        console.warn(
            "Firestore save skipped: no active profile."
        );

        return Promise.resolve(false);
    }


    saveQueue =
        saveQueue.then(
            async () => {

                try{

                    await saveProfile(
                        activeProfile
                    );

                    console.log(
                        "Socmedata data saved to Firestore."
                    );

                    return true;

                }

                catch(error){

                    console.error(
                        "Firestore save failed:",
                        error
                    );

                    showToast(
                        "Unable to save data to Firebase.",
                        "error"
                    );

                    return false;
                }

            }
        );


    return saveQueue;
}


// =====================================
// ELEMENTS
// =====================================

const accountTitle =
    document.getElementById(
        "accountTitle"
    );

const totalImpressions =
    document.getElementById(
        "totalImpressions"
    );

const contentCount =
    document.getElementById(
        "contentCount"
    );

const growth =
    document.getElementById(
        "growth"
    );

const platformGrid =
    document.getElementById(
        "platformGrid"
    );

const addContent =
    document.getElementById(
        "addContentBtn"
    );


// =====================================
// PLATFORM FILTER ELEMENTS
// =====================================

const platformFilterDropdown =
    document.getElementById(
        "platformFilter"
    );

const selectedPlatform =
    document.getElementById(
        "selectedPlatform"
    );

const platformOptions =
    document.querySelectorAll(
        "#platformFilter .custom-option"
    );


// =====================================
// NUMBER FORMAT
// =====================================

function formatNumber(
    number
){

    const value =
        Number(number);

    return (
        Number.isFinite(value)
            ? value
            : 0
    ).toLocaleString(
        "id-ID"
    );

}


// =====================================
// NORMALIZE SUBJECT
// =====================================

function normalizeSubjectName(
    subject
){

    return String(
        subject || ""
    )
    .trim()
    .replace(
        /\s+/g,
        " "
    );

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHtml(
    value
){

    return String(
        value ?? ""
    )
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
// NORMALIZE ACCOUNT DATA
// =====================================

function normalizeAccountData(){

    if(!account){

        return;
    }


    if(
        !Array.isArray(
            account.contents
        )
    ){

        account.contents = [];
    }


    if(
        !Array.isArray(
            account.platforms
        )
    ){

        account.platforms = [];
    }


    if(
        !account.analytics ||
        typeof account.analytics !== "object"
    ){

        account.analytics = {};
    }


    // =================================
    // NORMALIZE CONTENT
    // =================================

    account.contents =
        account.contents.map(
            content => {

                return {

                    ...content,

                    id:
                        content.id ??
                        Date.now(),

                    accountId:
                        content.accountId ??
                        activeAccountId,

                    date:
                        content.date ?? "",

                    caption:
                        content.caption ?? "",

                    hashtag:
                        content.hashtag ?? "",

                    contentType:
                        content.contentType ?? "",

                    subject:
                        content.subject ?? "",

                    impressions:
                        Number(
                            content.impressions
                        ) || 0,

                    reach:
                        Number(
                            content.reach
                        ) || 0,

                    likes:
                        Number(
                            content.likes
                        ) || 0,

                    comments:
                        Number(
                            content.comments
                        ) || 0,

                    shares:
                        Number(
                            content.shares
                        ) || 0,

                    saved:
                        Number(
                            content.saved
                        ) || 0,

                    platform:
                        content.platform ?? "",

                    status:
                        content.status ||
                        "Published"

                };

            }
        );


    // =================================
    // NORMALIZE PLATFORMS
    // =================================

    account.platforms =
        account.platforms.map(
            platform => {

                const followers =
                    Number(
                        platform.followers
                    ) || 0;


                return {

                    ...platform,

                    id:
                        platform.id ??
                        Date.now(),

                    platform:
                        platform.platform ||
                        platform.name ||
                        "",

                    name:
                        platform.name ||
                        platform.platform ||
                        "",

                    username:
                        platform.username ||
                        "",

                    followers,

                    analytics:
                        platform.analytics &&
                        typeof platform.analytics === "object"

                            ?

                            platform.analytics

                            :

                            {

                                impressions: 0,

                                reach: 0,

                                followers,

                                contents: 0,

                                growth: 0

                            }

                };

            }
        );

}


// =====================================
// LOAD ACTIVE PROFILE
// =====================================

async function loadActiveProfile(){

    try{

        console.log(
            "Loading active vault from Firestore..."
        );


        // =================================
        // CHECK PROFILE ID
        // =================================

        if(!activeProfileId){

            alert(
                "No vault selected."
            );

            window.location.href =
                "../index.html";

            return;
        }


        // =================================
        // LOAD PROFILE
        // =================================

        activeProfile =
            await getProfile(
                activeProfileId
            );


        if(!activeProfile){

            alert(
                "Vault not found in Firestore."
            );

            window.location.href =
                "../index.html";

            return;
        }


        console.log(
            "Active vault loaded:",
            activeProfile
        );


        // =================================
        // ENSURE ACCOUNTS ARRAY
        // =================================

        if(
            !Array.isArray(
                activeProfile.accounts
            )
        ){

            activeProfile.accounts = [];
        }


        // =================================
        // FIND ACTIVE ACCOUNT
        // =================================

        account =
            activeProfile.accounts.find(
                item =>
                    String(item.id) ===
                    String(activeAccountId)
            );


        if(!account){

            alert(
                "Account not found."
            );

            window.location.href =
                "dashboard.html";

            return;
        }


        // =================================
        // NORMALIZE ACCOUNT
        // =================================

        normalizeAccountData();


        // =================================
        // UPDATE ACCOUNT NAME
        // =================================

        if(accountTitle){

            accountTitle.textContent =
                account.name ||
                "Account Name";

        }


        // =================================
        // START ACCOUNT PAGE
        // =================================

        initializeAccountPage();


        console.log(
            "Socmedata account page initialized."
        );

    }

    catch(error){

        console.error(
            "Failed to load account from Firestore:",
            error
        );

        alert(
            "Failed to load account data."
        );

    }

}


// =====================================
// PLATFORM FILTER
// =====================================

function initializePlatformFilter(){

    if(!platformFilterDropdown){

        return;
    }


    const trigger =
        platformFilterDropdown.querySelector(
            ".custom-select-trigger"
        );


    // =================================
    // OPEN DROPDOWN
    // =================================

    if(trigger){

        trigger.onclick =
            function(event){

                event.stopPropagation();

                platformFilterDropdown
                    .classList.toggle(
                        "open"
                    );

            };

    }


    // =================================
    // SELECT PLATFORM
    // =================================

    platformOptions.forEach(
        option => {

            option.onclick =
                function(event){

                    event.stopPropagation();


                    selectedPlatformValue =
                        this.dataset.value ||
                        "all";


                    if(selectedPlatform){

                        selectedPlatform.textContent =
                            this.textContent.trim();

                    }


                    platformOptions.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    platformFilterDropdown
                        .classList.remove(
                            "open"
                        );


                    renderPlatforms();

                };

        }
    );


    // =================================
    // CLOSE OUTSIDE
    // =================================

    document.addEventListener(
        "click",
        function(){

            platformFilterDropdown
                .classList.remove(
                    "open"
                );

        }
    );

}


// =====================================
// SUBJECT TABLE
// =====================================

function renderSubjectTable(){

    const tableBody =
        document.getElementById(
            "subjectTableBody"
        );


    if(!tableBody){

        return;
    }


    const subjects = {};


    const contents =
        Array.isArray(
            account?.contents
        )

        ?

        account.contents

        :

        [];


    // =================================
    // GROUP BY SUBJECT
    // =================================

    contents.forEach(
        content => {

            const subject =
                normalizeSubjectName(
                    content.subject
                );


            if(!subject){

                return;
            }


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


            const data =
                subjects[subject];


            data.posts++;


            data.impressions +=
                Number(
                    content.impressions
                ) || 0;


            data.reach +=
                Number(
                    content.reach
                ) || 0;


            data.likes +=
                Number(
                    content.likes
                ) || 0;


            data.comments +=
                Number(
                    content.comments
                ) || 0;


            data.shares +=
                Number(
                    content.shares
                ) || 0;


            data.saves +=
                Number(
                    content.saved
                ) || 0;


            data.engagement =
                data.likes +
                data.comments +
                data.shares +
                data.saves;

        }
    );


    // =================================
    // SORT BY ENGAGEMENT
    // =================================

    const sortedSubjects =
        Object.entries(
            subjects
        )
        .sort(
            (a,b) =>
                b[1].engagement -
                a[1].engagement
        );


    // =================================
    // SUBJECT SUMMARY
    // =================================

    const totalSubjects =
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


    // =================================
    // SUMMARY ELEMENTS
    // =================================

    const totalSubjectsElement =
        document.getElementById(
            "totalSubjects"
        );

    const subjectContentElement =
        document.getElementById(
            "subjectContentCount"
        );

    const subjectImpressionsElement =
        document.getElementById(
            "subjectImpressions"
        );

    const subjectReachElement =
        document.getElementById(
            "subjectReach"
        );


    if(totalSubjectsElement){

        totalSubjectsElement.textContent =
            formatNumber(
                totalSubjects
            );

    }


    if(subjectContentElement){

        subjectContentElement.textContent =
            formatNumber(
                subjectContentCount
            );

    }


    if(subjectImpressionsElement){

        subjectImpressionsElement.textContent =
            formatNumber(
                subjectImpressions
            );

    }


    if(subjectReachElement){

        subjectReachElement.textContent =
            formatNumber(
                subjectReach
            );

    }


    // =================================
    // EMPTY STATE
    // =================================

    if(
        sortedSubjects.length === 0
    ){

        tableBody.innerHTML = `

            <tr>

                <td colspan="10">

                    No subject data available.

                </td>

            </tr>

        `;

        return;
    }


    // =================================
    // RENDER ROWS
    // =================================

    tableBody.innerHTML =

        sortedSubjects
        .map(
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
                            ${escapeHtml(subject)}
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
        )
        .join("");

}


// =====================================
// CONTENT BY SUBJECT TABLE
// =====================================

function renderSubjectContentTable(){

    const tableBody =
        document.getElementById(
            "subjectContentTableBody"
        );


    if(!tableBody){

        return;
    }


    const contents =
        (
            Array.isArray(
                account?.contents
            )

            ?

            account.contents

            :

            []
        )
        .filter(
    content =>
        String(
            content.subject || ""
        ).trim() !== ""
)
        .sort(
            (a,b) =>
                new Date(b.date) -
                new Date(a.date)
        );


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


    tableBody.innerHTML =

        contents
        .map(
            content => {

                const engagement =
                    (
                        Number(
                            content.likes
                        ) || 0
                    )
                    +
                    (
                        Number(
                            content.comments
                        ) || 0
                    )
                    +
                    (
                        Number(
                            content.shares
                        ) || 0
                    )
                    +
                    (
                        Number(
                            content.saved
                        ) || 0
                    );


                const subject =
                    normalizeSubjectName(
                        content.subject
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                                content.date ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                subject ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.platform ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.caption ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                content.impressions ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                content.reach ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                engagement
                            )}
                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// =====================================
// CALCULATE ANALYTICS
// =====================================

function calculateAnalytics(){

    const analytics = {

        totalImpressions: 0,

        totalReach: 0,

        totalContents: 0,

        totalGrowth: 0,

        totalFollowers: 0,

        platforms: {}

    };


    if(!account){

        return analytics;
    }


    const contents =
        Array.isArray(
            account.contents
        )

        ?

        account.contents

        :

        [];


    const platforms =
        Array.isArray(
            account.platforms
        )

        ?

        account.platforms

        :

        [];


    const now =
        new Date();


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


    // =================================
    // CONTENT ANALYTICS
    // =================================

    contents.forEach(
        content => {

            const impressions =
                Number(
                    content.impressions
                ) || 0;


            const reach =
                Number(
                    content.reach
                ) || 0;


            analytics.totalImpressions +=
                impressions;


            analytics.totalReach +=
                reach;


            analytics.totalContents++;


            const platform =
                String(
                    content.platform ||
                    "Unknown"
                );


            if(
                !analytics.platforms[
                    platform
                ]
            ){

                analytics.platforms[
                    platform
                ] = {

                    impressions: 0,

                    reach: 0,

                    contents: 0,

                    currentImpressions: 0,

                    previousImpressions: 0,

                    growth: 0

                };

            }


            const stats =
                analytics.platforms[
                    platform
                ];


            stats.impressions +=
                impressions;


            stats.reach +=
                reach;


            stats.contents++;


            // =========================
            // MONTHLY IMPRESSIONS
            // =========================

            if(content.date){

                const date =
                    new Date(
                        content.date
                    );


                if(
                    !Number.isNaN(
                        date.getTime()
                    )
                ){

                    const month =
                        date.getMonth();

                    const year =
                        date.getFullYear();


                    if(
                        month ===
                            currentMonth
                        &&
                        year ===
                            currentYear
                    ){

                        stats.currentImpressions +=
                            impressions;

                    }


                    if(
                        month ===
                            previousMonth
                        &&
                        year ===
                            previousYear
                    ){

                        stats.previousImpressions +=
                            impressions;

                    }

                }

            }

        }
    );


    // =================================
    // PLATFORM FOLLOWERS
    // =================================

    let totalCurrentImpressions = 0;

    let totalPreviousImpressions = 0;


    platforms.forEach(
        platform => {

            const followers =
                Number(
                    platform.followers
                ) || 0;


            analytics.totalFollowers +=
                followers;


            const platformName =
                String(
                    platform.platform ||
                    platform.name ||
                    ""
                );


            const platformData =
                analytics.platforms[
                    platformName
                ];


            if(platformData){

                totalCurrentImpressions +=
                    platformData.currentImpressions;


                totalPreviousImpressions +=
                    platformData.previousImpressions;

            }

        }
    );


    // =================================
    // PLATFORM GROWTH
    // =================================

    Object.keys(
        analytics.platforms
    )
    .forEach(
        platformName => {

            const data =
                analytics.platforms[
                    platformName
                ];


            data.growth =
                calculateGrowth(
                    data.currentImpressions,
                    data.previousImpressions
                );

        }
    );


    // =================================
    // ACCOUNT GROWTH
    // =================================

    analytics.totalGrowth =
        calculateGrowth(
            totalCurrentImpressions,
            totalPreviousImpressions
        );


    return analytics;

}


// =====================================
// CALCULATE GROWTH
// =====================================

function calculateGrowth(
    current,
    previous
){

    current =
        Number(current) || 0;


    previous =
        Number(previous) || 0;


    if(previous === 0){

        return current > 0
            ? 100
            : 0;
    }


    return (
        (
            current -
            previous
        )
        /
        previous
    ) * 100;

}


// =====================================
// LOAD ANALYTICS
// =====================================

function loadAnalytics(){

    if(!account){

        return;
    }


    if(
        !account.analytics ||
        typeof account.analytics !== "object"
    ){

        account.analytics = {};
    }


    const analytics =
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


    // =================================
    // IMPRESSIONS
    // =================================

    if(totalImpressions){

        totalImpressions.textContent =
            formatNumber(
                analytics.totalImpressions
            );

    }


    // =================================
    // FOLLOWERS
    // =================================

    const followers =
        document.getElementById(
            "followers"
        );


    if(followers){

        followers.textContent =
            formatNumber(
                analytics.totalFollowers
            );

    }


    // =================================
    // CONTENT COUNT
    // =================================

    if(contentCount){

        contentCount.textContent =
            formatNumber(
                analytics.totalContents
            );

    }


    // =================================
    // GROWTH
    // =================================

    if(growth){

        const growthValue =
            Number(
                analytics.totalGrowth
            ) || 0;


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

function getPlatformIcon(
    platform
){

    const logos = {

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


    return (
        logos[platform] ||
        "https://cdn.simpleicons.org/internet"
    );

}


// =====================================
// PLATFORM CLASS
// =====================================

function getPlatformClass(
    platform
){

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

    if(!platformGrid){

        return;
    }


    platformGrid.innerHTML = "";


    let platforms =
        Array.isArray(
            account?.platforms
        )

        ?

        account.platforms

        :

        [];


    // =================================
    // APPLY FILTER
    // =================================

    if(
        selectedPlatformValue !== "all"
    ){

        platforms =
            platforms.filter(
                platform =>

                    String(
                        platform.platform ||
                        platform.name ||
                        ""
                    ) ===
                    selectedPlatformValue
            );

    }


    // =================================
    // EMPTY STATE
    // =================================

    if(platforms.length === 0){

        platformGrid.innerHTML = `

            <div class="empty-state">

                <h2>
                    No Platform Connected
                </h2>

                <p>
                    Click Connect Platform to add your first platform.
                </p>

            </div>

        `;

        return;
    }


    const analytics =
        calculateAnalytics();


    // =================================
    // RENDER PLATFORM CARDS
    // =================================

    platforms.forEach(
        platform => {

            const platformName =
                String(
                    platform.platform ||
                    platform.name ||
                    ""
                );


            const stats =
                analytics.platforms[
                    platformName
                ]

                ||

                {

                    impressions: 0,

                    reach: 0,

                    contents: 0,

                    growth: 0

                };


            const followers =
                Number(
                    platform.followers
                ) || 0;


            const platformGrowth =
                Number(
                    stats.growth
                ) || 0;


            platformGrid.innerHTML += `

                <div
                    class="platform-card ${getPlatformClass(
                        platformName
                    )}"
                >

                    <div class="platform-header">

                        <div class="platform-brand">

                            <div class="platform-icon">

                                <img
                                    src="${getPlatformIcon(
                                        platformName
                                    )}"
                                    alt="${platformName}"
                                >

                            </div>

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        platformName
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        platform.username ||
                                        ""
                                    )}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            class="delete-platform"
                            data-id="${String(
                                platform.id
                            )}"
                            aria-label="Delete platform"
                        >
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
                                    followers
                                )}
                            </strong>

                        </div>


                        <div class="stat-box">

                            <span>
                                Impressions
                            </span>

                            <strong>
                                ${formatNumber(
                                    stats.impressions
                                )}
                            </strong>

                        </div>


                        <div class="stat-box">

                            <span>
                                Reach
                            </span>

                            <strong>
                                ${formatNumber(
                                    stats.reach
                                )}
                            </strong>

                        </div>


                        <div class="stat-box">

                            <span>
                                Content
                            </span>

                            <strong>
                                ${formatNumber(
                                    stats.contents
                                )}
                            </strong>

                        </div>


                        <div class="stat-box">

                            <span>
                                Growth
                            </span>

                            <strong
                                class="${
                                    platformGrowth >= 0
                                        ? "positive-growth"
                                        : "negative-growth"
                                }"
                            >

                                ${
                                    platformGrowth >= 0
                                        ? "+"
                                        : ""
                                }${platformGrowth.toFixed(1)}%

                            </strong>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    // =================================
    // DELETE PLATFORM
    // =================================

    document
        .querySelectorAll(
            ".delete-platform"
        )
        .forEach(
            button => {

                button.onclick =
                    function(){

                        const id =
                            String(
                                this.dataset.id
                            );


                        account.platforms =
                            account.platforms.filter(
                                platform =>
                                    String(
                                        platform.id
                                    ) !== id
                            );


                        syncPlatformAnalytics(
                            false
                        );


                        saveDatabase();


                        renderPlatforms();

                        loadAnalytics();

                    };

            }
        );

}


// =====================================
// SYNC PLATFORM ANALYTICS
// =====================================

function syncPlatformAnalytics(
    save = true
){

    if(!account){

        return;
    }


    const analytics =
        calculateAnalytics();


    if(
        !Array.isArray(
            account.platforms
        )
    ){

        account.platforms = [];
    }


    account.platforms.forEach(
        platform => {

            const platformName =
                String(
                    platform.platform ||
                    platform.name ||
                    ""
                );


            const stats =
                analytics.platforms[
                    platformName
                ]

                ||

                {

                    impressions: 0,

                    reach: 0,

                    contents: 0,

                    growth: 0

                };


            if(
                !platform.analytics ||
                typeof platform.analytics !== "object"
            ){

                platform.analytics = {};
            }


            platform.analytics.impressions =
                Number(
                    stats.impressions
                ) || 0;


            platform.analytics.reach =
                Number(
                    stats.reach
                ) || 0;


            platform.analytics.contents =
                Number(
                    stats.contents
                ) || 0;


            platform.analytics.followers =
                Number(
                    platform.followers
                ) || 0;


            platform.analytics.growth =
                Number(
                    stats.growth
                ) || 0;

        }
    );


    if(save){

        saveDatabase();

    }

}


// =====================================
// PLATFORM MODAL
// =====================================

const platformModal =
    document.getElementById(
        "platformModal"
    );

const closePlatformModal =
    document.getElementById(
        "closePlatformModal"
    );

const cancelPlatform =
    document.getElementById(
        "cancelPlatform"
    );

const savePlatform =
    document.getElementById(
        "savePlatform"
    );

const platformSelect =
    document.getElementById(
        "platformSelect"
    );

const platformUsername =
    document.getElementById(
        "platformUsername"
    );

const platformFollowers =
    document.getElementById(
        "platformFollowers"
    );

const connectPlatformBtn =
    document.getElementById(
        "connectPlatformBtn"
    );


// =====================================
// OPEN PLATFORM MODAL
// =====================================

if(connectPlatformBtn){

    connectPlatformBtn.onclick =
        function(){

            if(platformModal){

                platformModal.style.display =
                    "flex";

            }

        };

}


// =====================================
// CLOSE PLATFORM MODAL
// =====================================

if(closePlatformModal){

    closePlatformModal.onclick =
        function(){

            if(platformModal){

                platformModal.style.display =
                    "none";

            }

        };

}


if(cancelPlatform){

    cancelPlatform.onclick =
        function(){

            if(platformModal){

                platformModal.style.display =
                    "none";

            }

        };

}


// =====================================
// SAVE PLATFORM
// =====================================

if(savePlatform){

    savePlatform.onclick =
        function(){

            if(!account){

                return;
            }


            const platformName =
                platformSelect?.value ||
                "";


            const username =
                platformUsername?.value
                ?.trim() ||
                "";


            const followers =
                Number(
                    platformFollowers?.value
                ) || 0;


            // =========================
            // VALIDATION
            // =========================

            if(!platformName){

                alert(
                    "Select platform."
                );

                return;
            }


            if(!username){

                alert(
                    "Enter username."
                );

                return;
            }


            // =========================
            // CREATE PLATFORM
            // =========================

            const platform = {

                id:
                    Date.now(),

                platform:
                    platformName,

                username,

                followers,

                analytics: {

                    impressions: 0,

                    reach: 0,

                    followers,

                    contents: 0,

                    growth: 0

                },

                contents: []

            };


            account.platforms.push(
                platform
            );


            // =========================
            // UPDATE ANALYTICS
            // =========================

            syncPlatformAnalytics(
                false
            );


            // =========================
            // SAVE
            // =========================

            saveDatabase();


            // =========================
            // REFRESH UI
            // =========================

            renderPlatforms();

            loadAnalytics();


            // =========================
            // RESET FORM
            // =========================

            if(platformSelect){

                platformSelect.value = "";

            }


            if(platformUsername){

                platformUsername.value = "";

            }


            if(platformFollowers){

                platformFollowers.value = "";

            }


            // =========================
            // CLOSE MODAL
            // =========================

            if(platformModal){

                platformModal.style.display =
                    "none";

            }


            showToast(
                "Platform connected successfully!",
                "success"
            );

        };

}


// =====================================
// CONTENT MODAL ELEMENTS
// =====================================

const contentModal =
    document.getElementById(
        "contentModal"
    );

const closeContentModal =
    document.getElementById(
        "closeContentModal"
    );

const cancelContentBtn =
    document.getElementById(
        "cancelContent"
    );

const saveContent =
    document.getElementById(
        "saveContent"
    );


// =====================================
// CONTENT FORM HELPERS
// =====================================

function resetContentForm(){

    const fields = {

        date:
            document.getElementById(
                "contentDate"
            ),

        caption:
            document.getElementById(
                "contentCaption"
            ),

        hashtag:
            document.getElementById(
                "contentHashtag"
            ),

        type:
            document.getElementById(
                "contentType"
            ),

        subject:
            document.getElementById(
                "contentSubject"
            ),

        impressions:
            document.getElementById(
                "contentImpressions"
            ),

        reach:
            document.getElementById(
                "contentReach"
            ),

        likes:
            document.getElementById(
                "contentLikes"
            ),

        comments:
            document.getElementById(
                "contentComments"
            ),

        shares:
            document.getElementById(
                "contentShares"
            ),

        saved:
            document.getElementById(
                "contentSaved"
            ),

        platform:
            document.getElementById(
                "contentPlatform"
            ),

        status:
            document.getElementById(
                "contentStatus"
            )

    };


    Object.values(fields)
        .forEach(
            field => {

                if(!field){

                    return;
                }


                if(
                    field.tagName === "SELECT"
                ){

                    field.value = "";

                    return;
                }


                field.value = "";

            }
        );


    if(fields.impressions){

        fields.impressions.value =
            0;

    }


    if(fields.reach){

        fields.reach.value =
            0;

    }


    if(fields.likes){

        fields.likes.value =
            0;

    }


    if(fields.comments){

        fields.comments.value =
            0;

    }


    if(fields.shares){

        fields.shares.value =
            0;

    }


    if(fields.saved){

        fields.saved.value =
            0;

    }


    if(fields.status){

        fields.status.value =
            "Published";

    }

}


// =====================================
// ADD CONTENT
// =====================================

if(addContent){

    addContent.onclick =
        function(){

            editingContentId =
                null;


            resetContentForm();


            const title =
                document.getElementById(
                    "contentModalTitle"
                );


            if(title){

                title.textContent =
                    "Add Content";

            }


            if(contentModal){

                contentModal.style.display =
                    "flex";

            }

        };

}


// =====================================
// CLOSE CONTENT MODAL
// =====================================

if(cancelContentBtn){

    cancelContentBtn.onclick =
        function(){

            editingContentId =
                null;


            if(contentModal){

                contentModal.style.display =
                    "none";

            }

        };

}


if(closeContentModal){

    closeContentModal.onclick =
        function(){

            editingContentId =
                null;


            if(contentModal){

                contentModal.style.display =
                    "none";

            }

        };

}


// =====================================
// SAVE CONTENT
// =====================================

if(saveContent){

    saveContent.onclick =
        function(){

            try{

                if(!account){

                    return;
                }


                // =========================
                // FORM ELEMENTS
                // =========================

                const date =
                    document.getElementById(
                        "contentDate"
                    );

                const caption =
                    document.getElementById(
                        "contentCaption"
                    );

                const hashtag =
                    document.getElementById(
                        "contentHashtag"
                    );

                const contentType =
                    document.getElementById(
                        "contentType"
                    );

                const subject =
                    document.getElementById(
                        "contentSubject"
                    );

                const impressions =
                    document.getElementById(
                        "contentImpressions"
                    );

                const reach =
                    document.getElementById(
                        "contentReach"
                    );

                const likes =
                    document.getElementById(
                        "contentLikes"
                    );

                const comments =
                    document.getElementById(
                        "contentComments"
                    );

                const shares =
                    document.getElementById(
                        "contentShares"
                    );

                const saved =
                    document.getElementById(
                        "contentSaved"
                    );

                const platform =
                    document.getElementById(
                        "contentPlatform"
                    );

                const status =
                    document.getElementById(
                        "contentStatus"
                    );


                // =========================
                // REQUIRED ELEMENT CHECK
                // =========================

                const fields = {

                    contentDate:
                        date,

                    contentCaption:
                        caption,

                    contentHashtag:
                        hashtag,

                    contentType:
                        contentType,

                    contentSubject:
                        subject,

                    contentImpressions:
                        impressions,

                    contentReach:
                        reach,

                    contentLikes:
                        likes,

                    contentComments:
                        comments,

                    contentShares:
                        shares,

                    contentSaved:
                        saved,

                    contentPlatform:
                        platform,

                    contentStatus:
                        status

                };


                const missing =
                    Object.entries(fields)
                    .filter(
                        ([, element]) =>
                            !element
                    )
                    .map(
                        ([name]) =>
                            name
                    );


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


                // =========================
                // BUILD CONTENT
                // =========================

                const content = {

                    id:
                        editingContentId !== null
                            ? editingContentId
                            : Date.now(),

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
                        subject.value.trim(),

                    impressions:
                        Number(
                            impressions.value
                        ) || 0,

                    reach:
                        Number(
                            reach.value
                        ) || 0,

                    likes:
                        Number(
                            likes.value
                        ) || 0,

                    comments:
                        Number(
                            comments.value
                        ) || 0,

                    shares:
                        Number(
                            shares.value
                        ) || 0,

                    saved:
                        Number(
                            saved.value
                        ) || 0,

                    platform:
                        platform.value,

                    status:
                        status.value ||
                        "Published"

                };


                // =========================
                // VALIDATION
                // =========================

                if(!content.date){

                    alert(
                        "Please select a content date."
                    );

                    return;
                }


                if(!content.platform){

                    alert(
                        "Please select a platform."
                    );

                    return;
                }


                // =========================
                // EDIT EXISTING CONTENT
                // =========================

                if(
                    editingContentId !== null
                ){

                    const index =
                        account.contents.findIndex(
                            item =>
                                String(item.id) ===
                                String(
                                    editingContentId
                                )
                        );


                    if(index === -1){

                        alert(
                            "The content you are trying to edit could not be found."
                        );

                        return;
                    }


                    account.contents[index] =
                        content;

                }


                // =========================
                // ADD NEW CONTENT
                // =========================

                else{

                    account.contents.push(
                        content
                    );

                }


                // =========================
                // SYNC ANALYTICS
                // =========================

                syncPlatformAnalytics(
                    false
                );


                // =========================
                // SAVE FIRESTORE
                // =========================

                saveDatabase();


                // =========================
                // REFRESH UI
                // =========================

                renderContents();

                loadAnalytics();

                renderSubjectTable();

                renderSubjectContentTable();

                renderPlatforms();

                if(
                    typeof loadEngagement ===
                    "function"
                ){

                    loadEngagement();

                }

                if(
                    typeof renderHashtags ===
                    "function"
                ){

                    renderHashtags();

                }

                if(
                    typeof renderPlatformComparison ===
                    "function"
                ){

                    renderPlatformComparison();

                }

                if(
                    typeof renderMonthlyReport ===
                    "function"
                ){

                    renderMonthlyReport();

                }

                if(
                    typeof renderWeeklyReport ===
                    "function"
                ){

                    renderWeeklyReport();

                }


                // =========================
                // RESET EDIT MODE
                // =========================

                editingContentId =
                    null;


                // =========================
                // CLOSE MODAL
                // =========================

                if(contentModal){

                    contentModal.style.display =
                        "none";

                }


                // =========================
                // RESET TITLE
                // =========================

                const title =
                    document.getElementById(
                        "contentModalTitle"
                    );


                if(title){

                    title.textContent =
                        "Add Content";

                }


                // =========================
                // SUCCESS
                // =========================

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
// INITIALIZE ACCOUNT PAGE
// =====================================

function initializeAccountPage(){

    if(!account){

        console.warn(
            "Account page initialization skipped: no account."
        );

        return;
    }


    // =================================
    // ENSURE DATA STRUCTURE
    // =================================

    normalizeAccountData();


    // =================================
    // RENDER BASIC ACCOUNT DATA
    // =================================

    renderContents();

    renderPlatforms();

    loadAnalytics();

    renderSubjectTable();

    renderSubjectContentTable();


    // =================================
    // OTHER ACCOUNT MODULES
    // =================================

    if(
        typeof renderPlatformComparison ===
        "function"
    ){

        renderPlatformComparison();

    }


    if(
        typeof renderHashtags ===
        "function"
    ){

        renderHashtags();

    }


    if(
        typeof loadEngagement ===
        "function"
    ){

        loadEngagement();

    }


    if(
        typeof renderMonthlyReport ===
        "function"
    ){

        renderMonthlyReport();

    }


    if(
        typeof renderWeeklyReport ===
        "function"
    ){

        renderWeeklyReport();

    }


    if(
        typeof buildWeeklyYearFilter ===
        "function"
    ){

        buildWeeklyYearFilter();

    }


    if(
        typeof buildMonthlyFilters ===
        "function"
    ){

        buildMonthlyFilters();

    }


    // =================================
    // SYNC STORED ANALYTICS
    // =================================

    syncPlatformAnalytics(
        false
    );


    console.log(
        "Socmedata account page initialized."
    );

}


// =====================================
// START
// =====================================

auth.onAuthStateChanged(
    (user) => {

        if (user) {

            console.log(
                "Account: Authentication ready."
            );

            loadActiveProfile();

        } else {

            console.log(
                "Account: No authenticated user."
            );

        }

    }
);


// =====================================
// END OF PART 1
// =====================================
// PART 2 WILL CONTINUE WITH:
// CONTENT TABLE + DELETE SYSTEM
// TABS + PLATFORM COMPARISON
// HASHTAGS + ENGAGEMENT
// =====================================

// =====================================
// SOCMEDATA ACCOUNT DASHBOARD
// PART 2 OF 3
// CONTENT TABLE + DELETE
// TABS + PLATFORM COMPARISON
// HASHTAG ANALYTICS + ENGAGEMENT
// =====================================


// =====================================
// RENDER CONTENT TABLE
// =====================================

function renderContents(){

    const table =
        document.getElementById(
            "contentTableBody"
        );


    if(!table){

        return;
    }


    const contents =
        Array.isArray(
            account?.contents
        )

        ?

        [...account.contents]

        :

        [];


    // =================================
    // SORT BY DATE
    // =================================

    contents.sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.date || 0
                ).getTime();

            const dateB =
                new Date(
                    b.date || 0
                ).getTime();


            return dateA - dateB;

        }
    );


    // =================================
    // EMPTY STATE
    // =================================

    if(contents.length === 0){

        table.innerHTML = `

            <tr>

                <td colspan="9">

                    No content available.

                </td>

            </tr>

        `;

        return;
    }


    // =================================
    // BUILD TABLE
    // =================================

    table.innerHTML =

        contents
        .map(
            (content, index) => {

                const engagement =

                    (
                        Number(
                            content.likes
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.comments
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.shares
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.saved
                        ) || 0
                    );


                const status =
                    content.status ||
                    "Published";


                let statusIcon =
                    "🟣";


                if(
                    status ===
                    "Published"
                ){

                    statusIcon =
                        "🟢";

                }

                else if(
                    status ===
                    "Scheduled"
                ){

                    statusIcon =
                        "🔵";

                }

                else if(
                    status ===
                    "Draft"
                ){

                    statusIcon =
                        "🟠";

                }


                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.date ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.caption ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.hashtag ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.platform ||
                                "-"
                            )}
                        </td>

                        <td>

                            <span
                                class="status-badge ${escapeHtml(
                                    status.toLowerCase()
                                )}"
                            >

                                ${statusIcon}

                                ${escapeHtml(
                                    status
                                )}

                            </span>

                        </td>

                        <td>
                            ${formatNumber(
                                content.impressions ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                content.reach ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                engagement
                            )}
                        </td>

                        <td>

                            <div class="content-actions">

                                <button
                                    type="button"
                                    class="edit-content"
                                    data-id="${String(
                                        content.id
                                    )}"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    class="delete-content"
                                    data-id="${String(
                                        content.id
                                    )}"
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    // =================================
    // EDIT BUTTONS
    // =================================

    document
        .querySelectorAll(
            ".edit-content"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(){

                        const id =
                            String(
                                this.dataset.id
                            );


                        const content =
                            account.contents.find(
                                item =>
                                    String(
                                        item.id
                                    ) === id
                            );


                        if(!content){

                            console.warn(
                                "Content not found:",
                                id
                            );

                            return;
                        }


                        editingContentId =
                            content.id;


                        // =====================
                        // DATE
                        // =====================

                        const date =
                            document.getElementById(
                                "contentDate"
                            );

                        if(date){

                            date.value =
                                content.date ||
                                "";

                        }


                        // =====================
                        // CAPTION
                        // =====================

                        const caption =
                            document.getElementById(
                                "contentCaption"
                            );

                        if(caption){

                            caption.value =
                                content.caption ||
                                "";

                        }


                        // =====================
                        // HASHTAG
                        // =====================

                        const hashtag =
                            document.getElementById(
                                "contentHashtag"
                            );

                        if(hashtag){

                            hashtag.value =
                                content.hashtag ||
                                "";

                        }


                        // =====================
                        // TYPE
                        // =====================

                        const type =
                            document.getElementById(
                                "contentType"
                            );

                        if(type){

                            type.value =
                                content.contentType ||
                                "";

                        }


                        // =====================
                        // SUBJECT
                        // =====================

                        const subject =
                            document.getElementById(
                                "contentSubject"
                            );

                        if(subject){

                            subject.value =
                                content.subject ||
                                "";

                        }


                        // =====================
                        // IMPRESSIONS
                        // =====================

                        const impressions =
                            document.getElementById(
                                "contentImpressions"
                            );

                        if(impressions){

                            impressions.value =
                                Number(
                                    content.impressions
                                ) || 0;

                        }


                        // =====================
                        // REACH
                        // =====================

                        const reach =
                            document.getElementById(
                                "contentReach"
                            );

                        if(reach){

                            reach.value =
                                Number(
                                    content.reach
                                ) || 0;

                        }


                        // =====================
                        // LIKES
                        // =====================

                        const likes =
                            document.getElementById(
                                "contentLikes"
                            );

                        if(likes){

                            likes.value =
                                Number(
                                    content.likes
                                ) || 0;

                        }


                        // =====================
                        // COMMENTS
                        // =====================

                        const comments =
                            document.getElementById(
                                "contentComments"
                            );

                        if(comments){

                            comments.value =
                                Number(
                                    content.comments
                                ) || 0;

                        }


                        // =====================
                        // SHARES
                        // =====================

                        const shares =
                            document.getElementById(
                                "contentShares"
                            );

                        if(shares){

                            shares.value =
                                Number(
                                    content.shares
                                ) || 0;

                        }


                        // =====================
                        // SAVED
                        // =====================

                        const saved =
                            document.getElementById(
                                "contentSaved"
                            );

                        if(saved){

                            saved.value =
                                Number(
                                    content.saved
                                ) || 0;

                        }


                        // =====================
                        // PLATFORM
                        // =====================

                        const platform =
                            document.getElementById(
                                "contentPlatform"
                            );

                        if(platform){

                            platform.value =
                                content.platform ||
                                "";

                        }


                        // =====================
                        // STATUS
                        // =====================

                        const status =
                            document.getElementById(
                                "contentStatus"
                            );

                        if(status){

                            status.value =
                                content.status ||
                                "Published";

                        }


                        // =====================
                        // MODAL TITLE
                        // =====================

                        const title =
                            document.getElementById(
                                "contentModalTitle"
                            );

                        if(title){

                            title.textContent =
                                "Edit Content";

                        }


                        // =====================
                        // OPEN MODAL
                        // =====================

                        if(contentModal){

                            contentModal.style.display =
                                "flex";

                        }

                    }
                );

            }
        );


    // =================================
    // DELETE BUTTONS
    // =================================

    document
        .querySelectorAll(
            ".delete-content"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(){

                        const id =
                            String(
                                this.dataset.id
                            );


                        openDeleteModal(
                            id
                        );

                    }
                );

            }
        );

}


// =====================================
// DELETE STATE
// =====================================

let deleteContentId = null;


// =====================================
// DELETE MODAL
// =====================================

const deleteModal =
    document.getElementById(
        "deleteModal"
    );

const cancelDelete =
    document.getElementById(
        "cancelDelete"
    );

const confirmDelete =
    document.getElementById(
        "confirmDelete"
    );


// =====================================
// OPEN DELETE MODAL
// =====================================

function openDeleteModal(
    id
){

    deleteContentId =
        String(id);


    if(deleteModal){

        deleteModal.style.display =
            "flex";

    }

}


// =====================================
// CLOSE DELETE MODAL
// =====================================

function closeDeleteModal(){

    deleteContentId =
        null;


    if(deleteModal){

        deleteModal.style.display =
            "none";

    }

}


// =====================================
// CANCEL DELETE
// =====================================

if(cancelDelete){

    cancelDelete.addEventListener(
        "click",
        closeDeleteModal
    );

}


// =====================================
// CONFIRM DELETE
// =====================================

if(confirmDelete){

    confirmDelete.addEventListener(
        "click",
        async function(){

            if(
                deleteContentId ===
                null
            ){

                return;
            }


            const id =
                String(
                    deleteContentId
                );


            // =========================
            // REMOVE CONTENT
            // =========================

            account.contents =
                account.contents.filter(
                    item =>
                        String(
                            item.id
                        ) !== id
                );


            // =========================
            // RESET DELETE STATE
            // =========================

            closeDeleteModal();


            // =========================
            // REFRESH ANALYTICS
            // =========================

            syncPlatformAnalytics(
                false
            );


            loadAnalytics();

            renderContents();

            renderSubjectTable();

            renderSubjectContentTable();

            renderPlatforms();

            renderPlatformComparison();

            renderHashtags();

            loadEngagement();

            renderMonthlyReport();

            renderWeeklyReport();


            // =========================
            // SAVE FIRESTORE
            // =========================

            await saveDatabase();


            showToast(
                "Content deleted successfully!",
                "success"
            );

        }
    );

}


// =====================================
// TOAST SYSTEM
// =====================================

function showToast(
    message,
    type = "success"
){

    const toast =
        document.getElementById(
            "toast"
        );


    if(!toast){

        console.warn(
            "Toast element not found."
        );

        return;
    }


    const icon =
        toast.querySelector(
            ".toast-icon"
        );


    const text =
        toast.querySelector(
            ".toast-message"
        );


    if(text){

        text.textContent =
            message;

    }


    if(icon){

        if(
            type ===
            "success"
        ){

            icon.textContent =
                "✓";

        }

        else if(
            type ===
            "error"
        ){

            icon.textContent =
                "✕";

        }

        else{

            icon.textContent =
                "!";

        }

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


// =====================================
// ACCOUNT TABS
// =====================================

const tabs =
    document.querySelectorAll(
        ".account-tab"
    );

const tabContents =
    document.querySelectorAll(
        ".tab-content"
    );


// =====================================
// ACTIVATE TAB
// =====================================

function activateAccountTab(
    target
){

    if(!target){

        target =
            "dashboard";

    }


    // =========================
    // REMOVE ACTIVE STATES
    // =========================

    tabs.forEach(
        tab => {

            tab.classList.remove(
                "active"
            );

        }
    );


    tabContents.forEach(
        content => {

            content.classList.remove(
                "active"
            );

        }
    );


    // =========================
    // ACTIVATE BUTTON
    // =========================

    const activeTab =
        document.querySelector(
            `[data-tab="${CSS.escape(
                target
            )}"]`
        );


    if(activeTab){

        activeTab.classList.add(
            "active"
        );

    }


    // =========================
    // ACTIVATE CONTENT
    // =========================

    const activeContent =
        document.getElementById(
            target
        );


    if(activeContent){

        activeContent.classList.add(
            "active"
        );

    }


    // =========================
    // SAVE TAB
    // =========================

    localStorage.setItem(
        "activeAccountTab",
        target
    );

}


// =====================================
// TAB CLICK EVENTS
// =====================================

tabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            function(){

                activateAccountTab(
                    this.dataset.tab
                );

            }
        );

    }
);


// =====================================
// RESTORE LAST TAB
// =====================================

const savedTab =
    localStorage.getItem(
        "activeAccountTab"
    );


activateAccountTab(
    savedTab ||
    "dashboard"
);


// =====================================
// PLATFORM COMPARISON
// =====================================

function renderPlatformComparison(){

    const result =
        document.getElementById(
            "platformComparisonResult"
        );


    if(!result){

        return;
    }


    const platforms = {};


    const contents =
        Array.isArray(
            account?.contents
        )

        ?

        account.contents

        :

        [];


    // =================================
    // GROUP CONTENT BY PLATFORM
    // =================================

    contents.forEach(
        content => {

            const platform =
                String(
                    content.platform ||
                    "Unknown"
                );


            if(!platforms[platform]){

                platforms[platform] = {

                    impressions: 0,

                    reach: 0,

                    likes: 0,

                    comments: 0,

                    shares: 0,

                    saved: 0

                };

            }


            const data =
                platforms[platform];


            data.impressions +=
                Number(
                    content.impressions
                ) || 0;


            data.reach +=
                Number(
                    content.reach
                ) || 0;


            data.likes +=
                Number(
                    content.likes
                ) || 0;


            data.comments +=
                Number(
                    content.comments
                ) || 0;


            data.shares +=
                Number(
                    content.shares
                ) || 0;


            data.saved +=
                Number(
                    content.saved
                ) || 0;

        }
    );


    // =================================
    // EMPTY STATE
    // =================================

    if(
        Object.keys(
            platforms
        ).length === 0
    ){

        result.innerHTML =
            "No platform data yet.";

        return;
    }


    // =================================
    // BUILD RESULT
    // =================================

    let html = "";


    Object.entries(
        platforms
    )
    .forEach(
        ([platform, data]) => {

            const engagement =

                data.likes +

                data.comments +

                data.shares +

                data.saved;


            const rate =

                data.impressions > 0

                    ?

                    (
                        engagement /
                        data.impressions *
                        100
                    ).toFixed(1)

                    :

                    "0.0";


            html += `

                <div
                    class="platform-performance-item"
                >

                    <div
                        class="platform-performance-header"
                    >

                        <span>
                            ${escapeHtml(
                                platform
                            )}
                        </span>

                        <strong>
                            ${rate}%
                        </strong>

                    </div>


                    <div
                        class="performance-bar"
                    >

                        <span
                            style="width:${Math.min(
                                Number(rate),
                                100
                            )}%"
                        ></span>

                    </div>

                </div>

            `;

        }
    );


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


    if(!hashtagList){

        return;
    }


    const hashtags = {};


    const contents =
        Array.isArray(
            account?.contents
        )

        ?

        account.contents

        :

        [];


    // =================================
    // COLLECT HASHTAGS
    // =================================

    contents.forEach(
        content => {

            const rawHashtag =
                String(
                    content.hashtag ||
                    ""
                ).trim();


            if(!rawHashtag){

                return;
            }


            const tags =
                rawHashtag.split(
                    /\s+/
                );


            tags.forEach(
                rawTag => {

                    const cleaned =
                        rawTag
                            .replace(
                                /^#/,
                                ""
                            )
                            .trim();


                    if(!cleaned){

                        return;
                    }


                    const key =
                        cleaned.toLowerCase();


                    if(!hashtags[key]){

                        hashtags[key] = {

                            name:
                                cleaned,

                            used: 0,

                            impressions: 0,

                            reach: 0,

                            likes: 0,

                            comments: 0,

                            shares: 0,

                            saved: 0

                        };

                    }


                    const data =
                        hashtags[key];


                    data.used++;


                    data.impressions +=
                        Number(
                            content.impressions
                        ) || 0;


                    data.reach +=
                        Number(
                            content.reach
                        ) || 0;


                    data.likes +=
                        Number(
                            content.likes
                        ) || 0;


                    data.comments +=
                        Number(
                            content.comments
                        ) || 0;


                    data.shares +=
                        Number(
                            content.shares
                        ) || 0;


                    data.saved +=
                        Number(
                            content.saved
                        ) || 0;

                }
            );

        }
    );


    // =================================
    // SORT
    // =================================

    const sorted =
        Object.values(
            hashtags
        )
        .sort(
            (a, b) =>
                b.impressions -
                a.impressions
        );


    // =================================
    // SUMMARY VALUES
    // =================================

    let totalUsage = 0;

    let bestHashtag = "-";

    let highestImpressions = 0;


    sorted.forEach(
        tag => {

            totalUsage +=
                tag.used;


            if(
                tag.impressions >
                highestImpressions
            ){

                highestImpressions =
                    tag.impressions;

                bestHashtag =
                    "#" +
                    tag.name;

            }

        }
    );


    // =================================
    // TABLE
    // =================================

    if(sorted.length === 0){

        hashtagList.innerHTML = `

            <tr>

                <td colspan="9">
                    No hashtag data yet.
                </td>

            </tr>

        `;

    }

    else{

        hashtagList.innerHTML =

            sorted
            .map(
                tag => {

                    const engagement =

                        tag.likes +

                        tag.comments +

                        tag.shares +

                        tag.saved;


                    const rate =

                        tag.impressions > 0

                            ?

                            (
                                engagement /
                                tag.impressions *
                                100
                            ).toFixed(1)

                            :

                            "0.0";


                    return `

                        <tr>

                            <td
                                class="hashtag-name"
                            >
                                #${escapeHtml(
                                    tag.name
                                )}
                            </td>

                            <td>
                                ${tag.used}
                            </td>

                            <td>
                                ${formatNumber(
                                    tag.impressions
                                )}
                            </td>

                            <td>
                                ${formatNumber(
                                    tag.reach
                                )}
                            </td>

                            <td>
                                ${formatNumber(
                                    tag.likes
                                )}
                            </td>

                            <td>
                                ${formatNumber(
                                    tag.comments
                                )}
                            </td>

                            <td>
                                ${formatNumber(
                                    tag.shares
                                )}
                            </td>

                            <td>
                                ${formatNumber(
                                    tag.saved
                                )}
                            </td>

                            <td>
                                ${rate}%
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

    }


    // =================================
    // SUMMARY
    // =================================

    if(hashtagSummary){

        hashtagSummary.innerHTML = `

            <div class="hashtag-card">

                <span>
                    Total Hashtags
                </span>

                <h2>
                    ${Object.keys(
                        hashtags
                    ).length}
                </h2>

            </div>


            <div class="hashtag-card">

                <span>
                    Total Usage
                </span>

                <h2>
                    ${formatNumber(
                        totalUsage
                    )}
                </h2>

            </div>


            <div class="hashtag-card">

                <span>
                    Best Hashtag
                </span>

                <h2>
                    ${escapeHtml(
                        bestHashtag
                    )}
                </h2>

            </div>


            <div class="hashtag-card">

                <span>
                    Most Impressions
                </span>

                <h2>
                    ${formatNumber(
                        highestImpressions
                    )}
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
        Array.isArray(
            account?.contents
        )

        ?

        account.contents

        :

        [];


    let likes = 0;

    let comments = 0;

    let shares = 0;

    let saved = 0;

    let impressions = 0;

    let reach = 0;


    const contentTypes = {};

    const platformEngagement = {};


    let topContent = null;

    let topScore = -1;


    // =================================
    // CALCULATE
    // =================================

    contents.forEach(
        content => {

            const contentLikes =
                Number(
                    content.likes
                ) || 0;


            const contentComments =
                Number(
                    content.comments
                ) || 0;


            const contentShares =
                Number(
                    content.shares
                ) || 0;


            const contentSaved =
                Number(
                    content.saved
                ) || 0;


            const contentImpressions =
                Number(
                    content.impressions
                ) || 0;


            likes +=
                contentLikes;


            comments +=
                contentComments;


            shares +=
                contentShares;


            saved +=
                contentSaved;


            impressions +=
                contentImpressions;


            reach +=
                Number(
                    content.reach
                ) || 0;


            // =========================
            // CONTENT TYPE
            // =========================

            const type =
                content.contentType ||
                "Uncategorized";


            contentTypes[type] =
                (
                    contentTypes[type] ||
                    0
                ) + 1;


            // =========================
            // PLATFORM
            // =========================

            const platform =
                content.platform ||
                "Unknown";


            const engagement =

                contentLikes +

                contentComments +

                contentShares +

                contentSaved;


            platformEngagement[
                platform
            ] =

                (
                    platformEngagement[
                        platform
                    ] || 0
                )

                +

                engagement;


            // =========================
            // TOP CONTENT
            // =========================

            const score =

                contentImpressions > 0

                    ?

                    (
                        engagement /
                        contentImpressions *
                        100
                    )

                    :

                    0;


            if(
                score >
                topScore
            ){

                topScore =
                    score;

                topContent =
                    content;

            }

        }
    );


    // =================================
    // TOTAL ENGAGEMENT
    // =================================

    const totalEngagement =

        likes +
        comments +
        shares +
        saved;


    // =================================
    // ENGAGEMENT RATE
    // =================================

    const rate =

        impressions > 0

            ?

            (
                totalEngagement /
                impressions *
                100
            ).toFixed(1)

            :

            "0.0";


    // =================================
    // BEST PLATFORM
    // =================================

    let bestPlatform = "-";

    let highest = 0;


    Object.entries(
        platformEngagement
    )
    .forEach(
        ([platform, value]) => {

            const number =
                Number(value) || 0;


            if(
                number >
                highest
            ){

                highest =
                    number;

                bestPlatform =
                    platform;

            }

        }
    );


    // =================================
    // UPDATE SUMMARY ELEMENTS
    // =================================

    const values = {

        totalEngagement,

        totalReach:
            reach,

        engagementRate:
            `${rate}%`,

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


    Object.entries(
        values
    )
    .forEach(
        ([id, value]) => {

            const element =
                document.getElementById(
                    id
                );


            if(!element){

                return;
            }


            if(
                id ===
                "engagementRate"
                ||
                id ===
                "bestPlatform"
            ){

                element.textContent =
                    value;

            }

            else{

                element.textContent =
                    formatNumber(
                        value
                    );

            }

        }
    );


    // =================================
    // TOP CONTENT
    // =================================

    const topResult =
        document.getElementById(
            "topContentResult"
        );


    if(!topResult){

        return;
    }


    if(!topContent){

        topResult.innerHTML = `

            <div class="top-content-empty">

                <div
                    class="top-content-empty-icon"
                >
                    📊
                </div>

                <h3>
                    No Content Yet
                </h3>

                <p>
                    Add content to see your
                    top performing post.
                </p>

            </div>

        `;

    }

    else{

        const topEngagement =

            (
                Number(
                    topContent.likes
                ) || 0
            )

            +

            (
                Number(
                    topContent.comments
                ) || 0
            )

            +

            (
                Number(
                    topContent.shares
                ) || 0
            )

            +

            (
                Number(
                    topContent.saved
                ) || 0
            );


        topResult.innerHTML = `

            <div class="top-content-item">

                <p
                    class="top-content-caption"
                >
                    ${escapeHtml(
                        topContent.caption ||
                        "Untitled"
                    )}
                </p>

                <p>
                    Platform:
                    ${escapeHtml(
                        topContent.platform ||
                        "-"
                    )}
                </p>

                <p>
                    👁 Impressions:
                    ${formatNumber(
                        topContent.impressions ||
                        0
                    )}
                </p>

                <p>
                    🔥 Engagement:
                    ${formatNumber(
                        topEngagement
                    )}
                </p>

            </div>

        `;

    }


    // =================================
    // CONTENT TYPE BREAKDOWN
    // =================================

    const typeResult =
        document.getElementById(
            "contentTypeResult"
        );


    if(typeResult){

        const typeEntries =
            Object.entries(
                contentTypes
            );


        if(typeEntries.length === 0){

            typeResult.innerHTML =
                "No content type data yet.";

        }

        else{

            typeResult.innerHTML =

                typeEntries
                .map(
                    ([type, count]) => `

                        <div
                            class="content-type-item"
                        >

                            <span>
                                ${escapeHtml(
                                    type
                                )}
                            </span>

                            <strong>
                                ${formatNumber(
                                    count
                                )}
                                posts
                            </strong>

                        </div>

                    `
                )
                .join("");

        }

    }

}

// =====================================
// SOCMEDATA ACCOUNT DASHBOARD
// PART 3 OF 3
// MONTHLY + WEEKLY REPORTS
// FILTERS + LOGO + NAVIGATION
// FINAL STARTUP
// =====================================


// =====================================
// GROWTH INDICATOR
// =====================================

function growthIndicator(
    value
){

    const number =
        Number(value) || 0;


    if(number > 0){

        return `

            <small
                class="monthly-growth growth-up"
            >

                ↑ ${number.toFixed(1)}%
                from last month

            </small>

        `;

    }


    if(number < 0){

        return `

            <small
                class="monthly-growth growth-down"
            >

                ↓ ${Math.abs(
                    number
                ).toFixed(1)}%
                from last month

            </small>

        `;

    }


    return `

        <small
            class="monthly-growth growth-neutral"
        >

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


    if(!summary){

        return;
    }


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
        monthFilter &&
        monthFilter.value !== ""

            ?

            Number(
                monthFilter.value
            )

            :

            now.getMonth();


    const year =
        yearFilter &&
        yearFilter.value !== ""

            ?

            Number(
                yearFilter.value
            )

            :

            now.getFullYear();


    let impressions = 0;

    let reach = 0;

    let posts = 0;

    let engagement = 0;


    const contents =
        Array.isArray(
            account?.contents
        )

        ?

        account.contents

        :

        [];


    contents.forEach(
        content => {

            if(!content.date){

                return;
            }


            const date =
                new Date(
                    content.date +
                    "T00:00:00"
                );


            if(
                Number.isNaN(
                    date.getTime()
                )
            ){

                return;
            }


            if(
                date.getMonth() !==
                    month
                ||
                date.getFullYear() !==
                    year
            ){

                return;
            }


            posts++;


            impressions +=
                Number(
                    content.impressions
                ) || 0;


            reach +=
                Number(
                    content.reach
                ) || 0;


            engagement +=

                (
                    Number(
                        content.likes
                    ) || 0
                )

                +

                (
                    Number(
                        content.comments
                    ) || 0
                )

                +

                (
                    Number(
                        content.shares
                    ) || 0
                )

                +

                (
                    Number(
                        content.saved
                    ) || 0
                );

        }
    );


    const rate =
        impressions > 0

            ?

            (
                engagement /
                impressions *
                100
            ).toFixed(1)

            :

            "0.0";


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
                    ${formatNumber(
                        impressions
                    )}
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
                    ${formatNumber(
                        reach
                    )}
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
                    ${formatNumber(
                        posts
                    )}
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
                    ${formatNumber(
                        engagement
                    )}
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

    renderMonthlyTopContent(
        month,
        year
    );

    renderMonthlyContentTable(
        month,
        year
    );

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


    if(!platformBox){

        return;
    }


    const monthFilter =
        document.getElementById(
            "monthlyFilter"
        );


    const yearFilter =
        document.getElementById(
            "monthlyYearFilter"
        );


    const selectedMonth =
        monthFilter &&
        monthFilter.value !== ""

            ?

            Number(
                monthFilter.value
            )

            :

            new Date().getMonth();


    const selectedYear =
        yearFilter &&
        yearFilter.value !== ""

            ?

            Number(
                yearFilter.value
            )

            :

            new Date().getFullYear();


    const platforms = {};


    const contents =
        Array.isArray(
            account?.contents
        )

        ?

        account.contents

        :

        [];


    contents.forEach(
        content => {

            if(!content.date){

                return;
            }


            const date =
                new Date(
                    content.date +
                    "T00:00:00"
                );


            if(
                Number.isNaN(
                    date.getTime()
                )
            ){

                return;
            }


            if(
                date.getMonth() !==
                    selectedMonth
                ||
                date.getFullYear() !==
                    selectedYear
            ){

                return;
            }


            const platform =
                String(
                    content.platform ||
                    "Unknown"
                );


            if(!platforms[platform]){

                platforms[platform] = {

                    impressions: 0,

                    reach: 0,

                    engagement: 0,

                    posts: 0

                };

            }


            const data =
                platforms[platform];


            data.impressions +=
                Number(
                    content.impressions
                ) || 0;


            data.reach +=
                Number(
                    content.reach
                ) || 0;


            data.engagement +=

                (
                    Number(
                        content.likes
                    ) || 0
                )

                +

                (
                    Number(
                        content.comments
                    ) || 0
                )

                +

                (
                    Number(
                        content.shares
                    ) || 0
                )

                +

                (
                    Number(
                        content.saved
                    ) || 0
                );


            data.posts++;

        }
    );


    let html = "";

    let bestPlatform = "-";

    let highestEngagement = -1;


    Object.entries(
        platforms
    )
    .forEach(
        ([platform, data]) => {

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

                <div
                    class="platform-performance-item"
                >

                    <div
                        class="platform-performance-header"
                    >

                        <span>
                            ${escapeHtml(
                                platform
                            )}
                        </span>

                        <strong>
                            ${formatNumber(
                                data.impressions
                            )}
                            impressions
                        </strong>

                    </div>


                    <div
                        class="platform-performance-detail"
                    >

                        <span>
                            ${data.posts}
                            posts
                        </span>

                        <span>
                            ${formatNumber(
                                data.impressions
                            )}
                            impressions
                        </span>

                        <span>
                            ${formatNumber(
                                data.reach
                            )}
                            reach
                        </span>

                        <span>
                            ${formatNumber(
                                data.engagement
                            )}
                            engagement
                        </span>

                    </div>

                </div>

            `;

        }
    );


    if(html === ""){

        html =
            "No platform data this month.";

    }


    platformBox.innerHTML =
        html;


    // =================================
    // BEST PLATFORM
    // =================================

    if(!bestBox){

        return;
    }


    if(
        bestPlatform !== "-"
    ){

        bestBox.innerHTML = `

            <div
                class="monthly-best-platform"
            >

                <div
                    class="monthly-best-platform-glow"
                ></div>


                <div
                    class="monthly-best-platform-top"
                >

                    <div
                        class="monthly-best-platform-trophy"
                    >
                        🏆
                    </div>

                    <span
                        class="monthly-best-platform-badge"
                    >
                        #1 PERFORMER
                    </span>

                </div>


                <div
                    class="monthly-best-platform-main"
                >

                    <span
                        class="monthly-best-platform-label"
                    >
                        BEST PLATFORM THIS MONTH
                    </span>

                    <h2>
                        ${escapeHtml(
                            bestPlatform
                        )}
                    </h2>

                    <p>
                        Leading your social media performance
                    </p>

                </div>


                <div
                    class="monthly-best-platform-bottom"
                >

                    <div
                        class="monthly-best-platform-stat"
                    >

                        <span>
                            Engagement
                        </span>

                        <strong>
                            ${formatNumber(
                                highestEngagement
                            )}
                        </strong>

                    </div>


                    <div
                        class="monthly-best-platform-divider"
                    ></div>


                    <div
                        class="monthly-best-platform-stat"
                    >

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

            <div
                class="monthly-best-platform-empty"
            >

                <div
                    class="monthly-empty-icon"
                >
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


// =====================================
// WEEKLY REPORT
// =====================================

function renderWeeklyReport(){

    const monthSelect =
        document.getElementById(
            "weeklyMonthFilter"
        );


    const weekSelect =
        document.getElementById(
            "weeklyFilter"
        );


    if(
        !monthSelect ||
        !weekSelect
    ){

        return;
    }


    const selectedMonth =
        Number(
            monthSelect.value
        );


    const selectedWeek =
        Number(
            weekSelect.value
        );


    if(
        Number.isNaN(
            selectedMonth
        )
        ||
        Number.isNaN(
            selectedWeek
        )
    ){

        return;
    }


    const yearSelect =
        document.getElementById(
            "weeklyYearFilter"
        );


    const selectedYear =
        yearSelect &&
        yearSelect.value

            ?

            Number(
                yearSelect.value
            )

            :

            new Date().getFullYear();


    // =================================
    // WEEK RANGE
    // =================================

    const startDay =
        (
            selectedWeek *
            7
        ) + 1;


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


    // =================================
    // FILTER CONTENT
    // =================================

    const weeklyContents =
        (
            Array.isArray(
                account?.contents
            )

            ?

            account.contents

            :

            []
        )
        .filter(
            content => {

                if(!content.date){

                    return false;
                }


                const contentDate =
                    new Date(
                        content.date +
                        "T00:00:00"
                    );


                return (
                    contentDate >=
                        startDate
                    &&
                    contentDate <=
                        endDate
                );

            }
        );


    // =================================
    // SUMMARY
    // =================================

    let weeklyPosts = 0;

    let weeklyImpressions = 0;

    let weeklyReach = 0;

    let weeklyLikes = 0;

    let weeklyComments = 0;

    let weeklyShares = 0;

    let weeklySaved = 0;


    weeklyContents.forEach(
        content => {

            weeklyPosts++;


            weeklyImpressions +=
                Number(
                    content.impressions
                ) || 0;


            weeklyReach +=
                Number(
                    content.reach
                ) || 0;


            weeklyLikes +=
                Number(
                    content.likes
                ) || 0;


            weeklyComments +=
                Number(
                    content.comments
                ) || 0;


            weeklyShares +=
                Number(
                    content.shares
                ) || 0;


            weeklySaved +=
                Number(
                    content.saved
                ) || 0;

        }
    );


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


    // =================================
    // SUMMARY UI
    // =================================

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
                        ${formatNumber(
                            weeklyImpressions
                        )}
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
                        ${formatNumber(
                            weeklyReach
                        )}
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
                        ${formatNumber(
                            weeklyPosts
                        )}
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
                        ${formatNumber(
                            weeklyEngagement
                        )}
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


    // =================================
    // DATE RANGE
    // =================================

    const dateRange =
        document.getElementById(
            "weeklyDateRange"
        );


    if(dateRange){

        dateRange.textContent =

            `${startDate.toLocaleDateString(
                "en-US",
                {
                    month:
                        "short",

                    day:
                        "numeric"
                }
            )} – ${endDate.toLocaleDateString(
                "en-US",
                {
                    month:
                        "short",

                    day:
                        "numeric",

                    year:
                        "numeric"
                }
            )}`;

    }


    // =================================
    // SUB REPORTS
    // =================================

    renderWeeklyPlatformReport(
        weeklyContents
    );


    renderWeeklyBestPlatform(
        weeklyContents
    );


    renderWeeklyTopContent(
        weeklyContents
    );


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


    if(!box){

        return;
    }


    const platforms = {};


    weeklyContents.forEach(
        content => {

            const platform =
                String(
                    content.platform ||
                    "Unknown"
                );


            if(!platforms[platform]){

                platforms[platform] = {

                    impressions: 0,

                    reach: 0,

                    engagement: 0,

                    posts: 0

                };

            }


            const data =
                platforms[platform];


            data.impressions +=
                Number(
                    content.impressions
                ) || 0;


            data.reach +=
                Number(
                    content.reach
                ) || 0;


            data.engagement +=

                (
                    Number(
                        content.likes
                    ) || 0
                )

                +

                (
                    Number(
                        content.comments
                    ) || 0
                )

                +

                (
                    Number(
                        content.shares
                    ) || 0
                )

                +

                (
                    Number(
                        content.saved
                    ) || 0
                );


            data.posts++;

        }
    );


    let html = "";


    Object.entries(
        platforms
    )
    .forEach(
        ([platform, data]) => {

            html += `

                <div
                    class="platform-performance-item"
                >

                    <div
                        class="platform-performance-header"
                    >

                        <span>
                            ${escapeHtml(
                                platform
                            )}
                        </span>

                        <strong>
                            ${formatNumber(
                                data.impressions
                            )}
                            impressions
                        </strong>

                    </div>


                    <div
                        class="platform-performance-detail"
                    >

                        <span>
                            ${data.posts}
                            posts
                        </span>

                        <span>
                            ${formatNumber(
                                data.impressions
                            )}
                            impressions
                        </span>

                        <span>
                            ${formatNumber(
                                data.reach
                            )}
                            reach
                        </span>

                        <span>
                            ${formatNumber(
                                data.engagement
                            )}
                            engagement
                        </span>

                    </div>

                </div>

            `;

        }
    );


    if(html === ""){

        html =
            "No platform data this week.";

    }


    box.innerHTML =
        html;

}


// =====================================
// WEEKLY BEST PLATFORM
// =====================================

function renderWeeklyBestPlatform(
    weeklyContents
){

    const box =
        document.getElementById(
            "weeklyBestPlatform"
        );


    if(!box){

        return;
    }


    const platforms = {};


    weeklyContents.forEach(
        content => {

            const platform =
                String(
                    content.platform ||
                    "Unknown"
                );


            if(!platforms[platform]){

                platforms[platform] = {

                    impressions: 0,

                    reach: 0,

                    engagement: 0,

                    posts: 0

                };

            }


            const data =
                platforms[platform];


            data.impressions +=
                Number(
                    content.impressions
                ) || 0;


            data.reach +=
                Number(
                    content.reach
                ) || 0;


            data.engagement +=

                (
                    Number(
                        content.likes
                    ) || 0
                )

                +

                (
                    Number(
                        content.comments
                    ) || 0
                )

                +

                (
                    Number(
                        content.shares
                    ) || 0
                )

                +

                (
                    Number(
                        content.saved
                    ) || 0
                );


            data.posts++;

        }
    );


    let bestPlatform =
        null;


    Object.keys(
        platforms
    )
    .forEach(
        platform => {

            if(
                !bestPlatform
                ||
                platforms[platform]
                    .engagement
                    >
                platforms[bestPlatform]
                    .engagement
            ){

                bestPlatform =
                    platform;

            }

        }
    );


    if(!bestPlatform){

        box.innerHTML = `

            <div
                class="weekly-best-empty"
            >

                <div
                    class="weekly-best-empty-icon"
                >
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


    const icon =
        getPlatformIcon(
            bestPlatform
        );


    const platformClass =
        getPlatformClass(
            bestPlatform
        );


    box.innerHTML = `

        <div
            class="
                weekly-best-platform-card
                ${platformClass}
            "
        >

            <div class="weekly-best-top">

                <div
                    class="weekly-best-badge"
                >

                    🏆

                    <span>
                        BEST PLATFORM
                    </span>

                </div>


                <div
                    class="weekly-best-rank"
                >
                    #1
                </div>

            </div>


            <div class="weekly-best-main">

                <div
                    class="weekly-best-icon"
                >

                    <img
                        src="${icon}"
                        alt="${escapeHtml(
                            bestPlatform
                        )}"
                    >

                </div>


                <div
                    class="weekly-best-platform-name"
                >

                    <span>
                        This Week's Winner
                    </span>

                    <h2>
                        ${escapeHtml(
                            bestPlatform
                        )}
                    </h2>

                </div>

            </div>


            <div class="weekly-best-stats">

                <div
                    class="weekly-best-stat"
                >

                    <span>
                        Impressions
                    </span>

                    <strong>
                        ${formatNumber(
                            data.impressions
                        )}
                    </strong>

                </div>


                <div
                    class="weekly-best-stat"
                >

                    <span>
                        Reach
                    </span>

                    <strong>
                        ${formatNumber(
                            data.reach
                        )}
                    </strong>

                </div>


                <div
                    class="weekly-best-stat"
                >

                    <span>
                        Engagement
                    </span>

                    <strong>
                        ${formatNumber(
                            data.engagement
                        )}
                    </strong>

                </div>


                <div
                    class="weekly-best-stat"
                >

                    <span>
                        Posts
                    </span>

                    <strong>
                        ${data.posts}
                    </strong>

                </div>


                <div
                    class="weekly-best-stat"
                >

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


    if(!box){

        return;
    }


    if(
        !weeklyContents ||
        weeklyContents.length === 0
    ){

        box.innerHTML = `

            <div
                class="top-content-empty"
            >

                <div
                    class="top-content-empty-icon"
                >
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
        [...weeklyContents]
        .sort(
            (a, b) => {

                const engagementA =

                    (
                        Number(
                            a.likes
                        ) || 0
                    )

                    +

                    (
                        Number(
                            a.comments
                        ) || 0
                    )

                    +

                    (
                        Number(
                            a.shares
                        ) || 0
                    )

                    +

                    (
                        Number(
                            a.saved
                        ) || 0
                    );


                const engagementB =

                    (
                        Number(
                            b.likes
                        ) || 0
                    )

                    +

                    (
                        Number(
                            b.comments
                        ) || 0
                    )

                    +

                    (
                        Number(
                            b.shares
                        ) || 0
                    )

                    +

                    (
                        Number(
                            b.saved
                        ) || 0
                    );


                const rateA =

                    Number(
                        a.impressions
                    ) > 0

                        ?

                        (
                            engagementA /
                            Number(
                                a.impressions
                            ) *
                            100
                        )

                        :

                        0;


                const rateB =

                    Number(
                        b.impressions
                    ) > 0

                        ?

                        (
                            engagementB /
                            Number(
                                b.impressions
                            ) *
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

        (
            Number(
                top.likes
            ) || 0
        )

        +

        (
            Number(
                top.comments
            ) || 0
        )

        +

        (
            Number(
                top.shares
            ) || 0
        )

        +

        (
            Number(
                top.saved
            ) || 0
        );


    box.innerHTML = `

        <div
            class="top-monthly-item"
        >

            <h3>
                ${escapeHtml(
                    top.caption ||
                    "Untitled Content"
                )}
            </h3>

            <p>
                Platform:
                ${escapeHtml(
                    top.platform ||
                    "-"
                )}
            </p>

            <p>
                👁 ${formatNumber(
                    top.impressions ||
                    0
                )}
                impressions
            </p>

            <p>
                👥 ${formatNumber(
                    top.reach ||
                    0
                )}
                reach
            </p>

            <p>
                🔥 ${formatNumber(
                    engagement
                )}
                engagement
            </p>

        </div>

    `;

}


// =====================================
// MONTHLY TOP CONTENT
// =====================================

function renderMonthlyTopContent(
    month,
    year
){

    const box =
        document.getElementById(
            "monthlyTopContent"
        );


    if(!box){

        return;
    }


    const contents =
        (
            Array.isArray(
                account?.contents
            )

            ?

            account.contents

            :

            []
        )
        .filter(
            content => {

                if(!content.date){

                    return false;
                }


                const date =
                    new Date(
                        content.date +
                        "T00:00:00"
                    );


                return (
                    date.getMonth() ===
                        month
                    &&
                    date.getFullYear() ===
                        year
                );

            }
        );


    if(contents.length === 0){

        box.innerHTML = `

            <div
                class="top-content-empty"
            >

                <div
                    class="top-content-empty-icon"
                >
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


    contents.sort(
        (a, b) => {

            const engagementA =

                (
                    Number(
                        a.likes
                    ) || 0
                )

                +

                (
                    Number(
                        a.comments
                    ) || 0
                )

                +

                (
                    Number(
                        a.shares
                    ) || 0
                )

                +

                (
                    Number(
                        a.saved
                    ) || 0
                );


            const engagementB =

                (
                    Number(
                        b.likes
                    ) || 0
                )

                +

                (
                    Number(
                        b.comments
                    ) || 0
                )

                +

                (
                    Number(
                        b.shares
                    ) || 0
                )

                +

                (
                    Number(
                        b.saved
                    ) || 0
                );


            const rateA =

                Number(
                    a.impressions
                ) > 0

                    ?

                    (
                        engagementA /
                        Number(
                            a.impressions
                        ) *
                        100
                    )

                    :

                    0;


            const rateB =

                Number(
                    b.impressions
                ) > 0

                    ?

                    (
                        engagementB /
                        Number(
                            b.impressions
                        ) *
                        100
                    )

                    :

                    0;


            return rateB - rateA;

        }
    );


    const top =
        contents[0];


    const engagement =

        (
            Number(
                top.likes
            ) || 0
        )

        +

        (
            Number(
                top.comments
            ) || 0
        )

        +

        (
            Number(
                top.shares
            ) || 0
        )

        +

        (
            Number(
                top.saved
            ) || 0
        );


    box.innerHTML = `

        <div
            class="top-monthly-item"
        >

            <h3>
                ${escapeHtml(
                    top.caption ||
                    "Untitled Content"
                )}
            </h3>

            <p>
                Platform:
                ${escapeHtml(
                    top.platform ||
                    "-"
                )}
            </p>

            <p>
                👁 ${formatNumber(
                    top.impressions ||
                    0
                )}
                impressions
            </p>

            <p>
                👥 ${formatNumber(
                    top.reach ||
                    0
                )}
                reach
            </p>

            <p>
                🔥 ${formatNumber(
                    engagement
                )}
                engagement
            </p>

        </div>

    `;

}


// =====================================
// MONTHLY CONTENT TABLE
// =====================================

function renderMonthlyContentTable(
    month,
    year
){

    const table =
        document.getElementById(
            "monthlyContentTable"
        );


    if(!table){

        return;
    }


    const contents =
        (
            Array.isArray(
                account?.contents
            )

            ?

            account.contents

            :

            []
        )
        .filter(
            content => {

                if(!content.date){

                    return false;
                }


                const date =
                    new Date(
                        content.date +
                        "T00:00:00"
                    );


                return (
                    date.getMonth() ===
                        month
                    &&
                    date.getFullYear() ===
                        year
                );

            }
        );


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


    table.innerHTML =

        contents
        .map(
            content => {

                const engagement =

                    (
                        Number(
                            content.likes
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.comments
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.shares
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.saved
                        ) || 0
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                                content.date ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.platform ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.caption ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                content.impressions ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                content.reach ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                engagement
                            )}
                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// =====================================
// WEEKLY CONTENT TABLE
// =====================================

function renderWeeklyContentTable(
    weeklyContents
){

    const table =
        document.getElementById(
            "weeklyContentTable"
        );


    if(!table){

        return;
    }


    if(
        !Array.isArray(
            weeklyContents
        )
        ||
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


    table.innerHTML =

        weeklyContents
        .map(
            content => {

                const engagement =

                    (
                        Number(
                            content.likes
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.comments
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.shares
                        ) || 0
                    )

                    +

                    (
                        Number(
                            content.saved
                        ) || 0
                    );


                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                                content.date ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.platform ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                content.caption ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                content.impressions ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                content.reach ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                engagement
                            )}
                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


// =====================================
// WEEKLY YEAR FILTER
// =====================================

function buildWeeklyYearFilter(){

    const year =
        document.getElementById(
            "weeklyYearFilter"
        );


    if(!year){

        return;
    }


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


    year.value =
        String(
            current
        );

}


// =====================================
// MONTHLY FILTERS
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


    if(
        !month ||
        !year
    ){

        return;
    }


    const months = [

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


    month.innerHTML = "";


    months.forEach(
        (name, index) => {

            month.innerHTML += `

                <option value="${index}">
                    ${name}
                </option>

            `;

        }
    );


    const currentDate =
        new Date();


    const currentMonth =
        currentDate.getMonth();


    const currentYear =
        currentDate.getFullYear();


    month.value =
        String(
            currentMonth
        );


    year.innerHTML = "";


    for(
        let y = currentYear - 5;
        y <= currentYear + 1;
        y++
    ){

        year.innerHTML += `

            <option value="${y}">
                ${y}
            </option>

        `;

    }


    year.value =
        String(
            currentYear
        );

}


// =====================================
// REPORT FILTER EVENTS
// =====================================

const monthlyFilter =
    document.getElementById(
        "monthlyFilter"
    );


const monthlyYearFilter =
    document.getElementById(
        "monthlyYearFilter"
    );


const weeklyMonthFilter =
    document.getElementById(
        "weeklyMonthFilter"
    );


const weeklyFilter =
    document.getElementById(
        "weeklyFilter"
    );


const weeklyYearFilter =
    document.getElementById(
        "weeklyYearFilter"
    );


if(monthlyFilter){

    monthlyFilter.addEventListener(
        "change",
        renderMonthlyReport
    );

}


if(monthlyYearFilter){

    monthlyYearFilter.addEventListener(
        "change",
        renderMonthlyReport
    );

}


if(weeklyMonthFilter){

    weeklyMonthFilter.addEventListener(
        "change",
        renderWeeklyReport
    );

}


if(weeklyFilter){

    weeklyFilter.addEventListener(
        "change",
        renderWeeklyReport
    );

}


if(weeklyYearFilter){

    weeklyYearFilter.addEventListener(
        "change",
        renderWeeklyReport
    );

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


// =====================================
// OPEN LOGO MODAL
// =====================================

if(logoButton){

    logoButton.onclick =
        function(){

            if(logoModal){

                logoModal.style.display =
                    "flex";

            }

        };

}


// =====================================
// SAVE LOGO
// =====================================

if(saveLogo){

    saveLogo.onclick =
        async function(){

            if(!account){

                return;
            }


            const url =
                logoUrl?.value
                    ?.trim()
                ||
                "";


            if(!url){

                showToast(
                    "Please enter a logo URL.",
                    "error"
                );

                return;
            }


            // =========================
            // SAVE ACCOUNT LOGO
            // =========================

            account.logoButtonImage =
                url;


            // =========================
            // UPDATE BUTTON
            // =========================

            if(logoButton){

                logoButton.innerHTML = `

                    <img
                        src="${escapeHtml(
                            url
                        )}"
                        alt="Account logo"
                    >

                `;

            }


            // =========================
            // SAVE FIRESTORE
            // =========================

            await saveDatabase();


            // =========================
            // CLOSE MODAL
            // =========================

            if(logoModal){

                logoModal.style.display =
                    "none";

            }


            showToast(
                "Logo updated successfully!",
                "success"
            );

        };

}


// =====================================
// LOAD SAVED LOGO
// =====================================

function loadSavedLogo(){

    if(
        !account ||
        !account.logoButtonImage
    ){

        return;
    }


    if(!logoButton){

        return;
    }


    logoButton.innerHTML = `

        <img
            src="${escapeHtml(
                account.logoButtonImage
            )}"
            alt="Account logo"
        >

    `;

}


// =====================================
// BACK TO ACCOUNT VAULT
// =====================================

const backButton =
    document.getElementById(
        "backButton"
    );


if(backButton){

    backButton.onclick =
        function(){

            window.location.href =
                "dashboard.html";

        };

}


// =====================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =====================================

window.addEventListener(
    "click",
    function(event){

        if(
            platformModal &&
            event.target ===
            platformModal
        ){

            platformModal.style.display =
                "none";

        }


        if(
            contentModal &&
            event.target ===
            contentModal
        ){

            contentModal.style.display =
                "none";

            editingContentId =
                null;

        }


        if(
            deleteModal &&
            event.target ===
            deleteModal
        ){

            closeDeleteModal();

        }


        if(
            logoModal &&
            event.target ===
            logoModal
        ){

            logoModal.style.display =
                "none";

        }

    }
);


// =====================================
// RESTORE SAVED LOGO
// =====================================

loadSavedLogo();


// =====================================
// FINAL REPORT FILTER SETUP
// =====================================

buildMonthlyFilters();

buildWeeklyYearFilter();


// =====================================
// FINAL REPORT RENDER
// =====================================

if(
    typeof renderMonthlyReport ===
    "function"
){

    renderMonthlyReport();

}


if(
    typeof renderWeeklyReport ===
    "function"
){

    renderWeeklyReport();

}


// =====================================
// FINAL ACCOUNT PAGE STARTUP
// =====================================

// loadActiveProfile() is already called
// at the end of Part 1.
//
// DO NOT call it a second time here.
//
// =====================================
// END OF ACCOUNT.JS
// =====================================