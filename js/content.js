// =====================================
// SOCMEDATA CONTENT MANAGEMENT
// FIRESTORE VERSION
// =====================================

console.log("CONTENT.JS LOADED - FIRESTORE VERSION");


// =====================================
// FIRESTORE
// =====================================

import {
    getProfile,
    saveProfile
} from "./firebase-db.js";


// =====================================
// APPLICATION STATE
// =====================================

let profile = null;
let account = null;

let activeProfileId =
    localStorage.getItem("activeProfileId");

let activeAccountId =
    localStorage.getItem("activeAccountId");

let editingContentId = null;


// =====================================
// DOM ELEMENTS
// =====================================

const contentList =
    document.getElementById("contentList");

const searchContent =
    document.getElementById("searchContent");

const statusFilter =
    document.getElementById("statusFilter");

const platformFilter =
    document.getElementById("platformFilter");

const addContent =
    document.getElementById("addContentBtn");


// =====================================
// CONTENT MODAL
// =====================================

const contentModal =
    document.getElementById("contentModal");

const closeContentModal =
    document.getElementById("closeContentModal");

const cancelContent =
    document.getElementById("cancelContent");

const saveContent =
    document.getElementById("saveContent");

const contentModalTitle =
    document.getElementById("contentModalTitle");


// =====================================
// FORM ELEMENTS
// =====================================

const contentTitle =
    document.getElementById("contentTitle");

const contentPlatform =
    document.getElementById("contentPlatform");

const contentType =
    document.getElementById("contentType");

const contentStatus =
    document.getElementById("contentStatus");

const contentDate =
    document.getElementById("contentDate");

const contentCaption =
    document.getElementById("contentCaption");

const contentHashtag =
    document.getElementById("contentHashtag");

const contentImpressions =
    document.getElementById("contentImpressions");

const contentReach =
    document.getElementById("contentReach");

const contentLikes =
    document.getElementById("contentLikes");

const contentComments =
    document.getElementById("contentComments");

const contentShares =
    document.getElementById("contentShares");

const contentSaved =
    document.getElementById("contentSaved");

const contentNotes =
    document.getElementById("contentNotes");


// =====================================
// PROFILE NAME
// =====================================

const profileName =
    document.getElementById("profileName");


// =====================================
// NUMBER FORMAT
// =====================================

function formatNumber(number) {

    return Number(number || 0)
        .toLocaleString("id-ID");

}


// =====================================
// HTML SAFETY
// =====================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================
// ENGAGEMENT
// =====================================

function getEngagement(content) {

    return (
        Number(content.likes) || 0
    ) + (
        Number(content.comments) || 0
    ) + (
        Number(content.shares) || 0
    ) + (
        Number(content.saved) || 0
    );

}


// =====================================
// GET CONTENTS
// =====================================

function getContents() {

    if (!account) {
        return [];
    }

    if (!Array.isArray(account.contents)) {
        account.contents = [];
    }

    return account.contents;

}


// =====================================
// LOAD ACTIVE PROFILE
// =====================================

async function loadContentData() {

    console.log(
        "Loading content data..."
    );

    console.log(
        "Active Profile ID:",
        activeProfileId
    );

    console.log(
        "Active Account ID:",
        activeAccountId
    );


    if (!activeProfileId) {

        console.error(
            "No active profile selected."
        );

        alert("No vault selected.");

        window.location.href =
            "../index.html";

        return;

    }


    if (!activeAccountId) {

        console.error(
            "No active account selected."
        );

        alert("No account selected.");

        window.location.href =
            "dashboard.html";

        return;

    }


    try {

        profile =
            await getProfile(
                activeProfileId
            );


        if (!profile) {

            console.error(
                "Profile not found:",
                activeProfileId
            );

            alert("Vault not found.");

            window.location.href =
                "../index.html";

            return;

        }


        console.log(
            "Profile loaded:",
            profile
        );


        if (!Array.isArray(profile.accounts)) {

            profile.accounts = [];

        }


        account =
            profile.accounts.find(
                item =>
                    String(item.id) ===
                    String(activeAccountId)
            );


        if (!account) {

            console.error(
                "Account not found:",
                activeAccountId
            );

            alert("Account not found.");

            window.location.href =
                "dashboard.html";

            return;

        }


        if (!Array.isArray(account.contents)) {

            account.contents = [];

        }


        if (profileName) {

            profileName.textContent =
                profile.name ||
                "My Vault";

        }


        console.log(
            "Active account loaded:",
            account
        );


        showContents();

    }

    catch (error) {

        console.error(
            "Failed to load content:",
            error
        );

        if (contentList) {

            contentList.innerHTML = `

                <div class="content-empty-state">

                    <div class="content-empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to Load Content
                    </h3>

                    <p>
                        Please check your Firebase connection.
                    </p>

                </div>

            `;

        }

    }

}


// =====================================
// SAVE PROFILE TO FIRESTORE
// =====================================

async function saveDatabase() {

    if (!profile) {

        console.error(
            "Cannot save. Profile is missing."
        );

        return false;

    }


    try {

        const success =
            await saveProfile(
                profile
            );


        if (!success) {

            console.error(
                "Firestore save failed."
            );

            return false;

        }


        console.log(
            "Profile successfully saved to Firestore."
        );

        return true;

    }

    catch (error) {

        console.error(
            "Firestore save error:",
            error
        );

        return false;

    }

}


// =====================================
// RENDER CONTENTS
// =====================================

function showContents() {

    if (!contentList) {

        console.error(
            "contentList not found."
        );

        return;

    }


    contentList.innerHTML = "";


    const contents =
        getContents();


    // =================================
    // SEARCH VALUE
    // =================================

    const searchValue =
        searchContent
            ? searchContent.value
                .trim()
                .toLowerCase()
            : "";


    // =================================
    // FILTER CONTENT
    // =================================

    const filteredContents =
        contents.filter(
            content => {

                const title =
                    String(
                        content.title || ""
                    ).toLowerCase();


                const caption =
                    String(
                        content.caption || ""
                    ).toLowerCase();


                const hashtag =
                    String(
                        content.hashtag || ""
                    ).toLowerCase();


                const matchesSearch =
                    searchValue === "" ||
                    title.includes(searchValue) ||
                    caption.includes(searchValue) ||
                    hashtag.includes(searchValue);


                const currentStatus =
                    String(
                        content.status || "Draft"
                    ).toLowerCase();


                const selectedStatus =
                    statusFilter
                        ? statusFilter.value
                        : "all";


                const matchesStatus =
                    selectedStatus === "all" ||
                    currentStatus ===
                    selectedStatus;


                const selectedPlatform =
                    platformFilter
                        ? platformFilter.value
                        : "all";


                const matchesPlatform =
                    selectedPlatform === "all" ||
                    content.platform ===
                    selectedPlatform;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPlatform
                );

            }
        );


    // =================================
    // EMPTY STATE
    // =================================

    if (filteredContents.length === 0) {

        contentList.innerHTML = `

            <div class="content-empty-state">

                <div class="content-empty-icon">
                    📝
                </div>

                <h3>
                    No Content Found
                </h3>

                <p>
                    Create content or change your filters.
                </p>

            </div>

        `;

        return;

    }


    // =================================
    // CREATE CONTENT CARDS
    // =================================

    filteredContents.forEach(
        content => {

            const card =
                document.createElement("div");


            card.className =
                "content-card";


            const engagement =
                getEngagement(
                    content
                );


            const status =
                content.status ||
                "Draft";


            const title =
                content.title ||
                content.caption ||
                "Untitled Content";


            card.innerHTML = `

                <div class="content-header">

                    <div>

                        <h3>
                            🎬
                            ${escapeHTML(title)}
                        </h3>

                    </div>

                    <span
                        class="status ${escapeHTML(
                            status.toLowerCase()
                        )}"
                    >
                        ${escapeHTML(status)}
                    </span>

                </div>


                <div class="content-info">

                    <p>
                        📱
                        ${escapeHTML(
                            content.platform || "-"
                        )}
                    </p>


                    <p>
                        🎞
                        ${escapeHTML(
                            content.contentType || "-"
                        )}
                    </p>

                </div>


                <p class="content-date">

                    📅

                    ${escapeHTML(
                        content.date || "-"
                    )}

                </p>


                <div class="content-metrics">

                    <span>

                        👁

                        ${formatNumber(
                            content.impressions
                        )}

                    </span>


                    <span>

                        👥

                        ${formatNumber(
                            content.reach
                        )}

                    </span>


                    <span>

                        🔥

                        ${formatNumber(
                            engagement
                        )}

                    </span>

                </div>


                <div class="content-actions">

                    <button
                        class="edit-content"
                        type="button"
                    >
                        ✏ Edit
                    </button>


                    <button
                        class="delete-content"
                        type="button"
                    >
                        🗑 Delete
                    </button>

                </div>

            `;


            // =================================
            // EDIT BUTTON
            // =================================

            const editButton =
                card.querySelector(
                    ".edit-content"
                );


            if (editButton) {

                editButton.addEventListener(
                    "click",
                    function () {

                        openEditContent(
                            content.id
                        );

                    }
                );

            }


            // =================================
            // DELETE BUTTON
            // =================================

            const deleteButton =
                card.querySelector(
                    ".delete-content"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function () {

                        deleteContent(
                            content.id
                        );

                    }
                );

            }


            contentList.appendChild(
                card
            );

        }
    );

}


// =====================================
// OPEN CREATE CONTENT
// =====================================

function openCreateContent() {

    editingContentId =
        null;


    if (contentModalTitle) {

        contentModalTitle.textContent =
            "Create Content";

    }


    if (saveContent) {

        saveContent.textContent =
            "Create Content";

    }


    clearContentForm();


    if (contentModal) {

        contentModal.style.display =
            "flex";

    }

}


// =====================================
// CLEAR FORM
// =====================================

function clearContentForm() {

    if (contentTitle) {

        contentTitle.value =
            "";

    }


    if (contentPlatform) {

        contentPlatform.selectedIndex =
            0;

    }


    if (contentType) {

        contentType.selectedIndex =
            0;

    }


    if (contentStatus) {

        contentStatus.value =
            "Draft";

    }


    if (contentDate) {

        contentDate.value =
            "";

    }


    if (contentCaption) {

        contentCaption.value =
            "";

    }


    if (contentHashtag) {

        contentHashtag.value =
            "";

    }


    if (contentImpressions) {

        contentImpressions.value =
            "";

    }


    if (contentReach) {

        contentReach.value =
            "";

    }


    if (contentLikes) {

        contentLikes.value =
            "";

    }


    if (contentComments) {

        contentComments.value =
            "";

    }


    if (contentShares) {

        contentShares.value =
            "";

    }


    if (contentSaved) {

        contentSaved.value =
            "";

    }


    if (contentNotes) {

        contentNotes.value =
            "";

    }

}


// =====================================
// OPEN EDIT CONTENT
// =====================================

function openEditContent(id) {

    const content =
        getContents().find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!content) {

        console.error(
            "Content not found:",
            id
        );

        return;

    }


    editingContentId =
        content.id;


    if (contentModalTitle) {

        contentModalTitle.textContent =
            "Edit Content";

    }


    if (saveContent) {

        saveContent.textContent =
            "Update Content";

    }


    if (contentTitle) {

        contentTitle.value =
            content.title || "";

    }


    if (contentPlatform) {

        contentPlatform.value =
            content.platform ||
            "Instagram";

    }


    if (contentType) {

        contentType.value =
            content.contentType ||
            "Post";

    }


    if (contentStatus) {

        contentStatus.value =
            content.status ||
            "Draft";

    }


    if (contentDate) {

        contentDate.value =
            content.date || "";

    }


    if (contentCaption) {

        contentCaption.value =
            content.caption || "";

    }


    if (contentHashtag) {

        contentHashtag.value =
            content.hashtag || "";

    }


    if (contentImpressions) {

        contentImpressions.value =
            content.impressions || 0;

    }


    if (contentReach) {

        contentReach.value =
            content.reach || 0;

    }


    if (contentLikes) {

        contentLikes.value =
            content.likes || 0;

    }


    if (contentComments) {

        contentComments.value =
            content.comments || 0;

    }


    if (contentShares) {

        contentShares.value =
            content.shares || 0;

    }


    if (contentSaved) {

        contentSaved.value =
            content.saved || 0;

    }


    if (contentNotes) {

        contentNotes.value =
            content.notes || "";

    }


    if (contentModal) {

        contentModal.style.display =
            "flex";

    }

}


// =====================================
// BUILD CONTENT OBJECT
// =====================================

function buildContentData() {

    return {

        id:
            editingContentId !== null
                ? editingContentId
                : Date.now(),


        accountId:
            activeAccountId,


        title:
            contentTitle
                ? contentTitle.value.trim()
                : "",


        platform:
            contentPlatform
                ? contentPlatform.value
                : "",


        contentType:
            contentType
                ? contentType.value
                : "Post",


        status:
            contentStatus
                ? contentStatus.value
                : "Draft",


        date:
            contentDate
                ? contentDate.value
                : "",


        caption:
            contentCaption
                ? contentCaption.value.trim()
                : "",


        hashtag:
            contentHashtag
                ? contentHashtag.value.trim()
                : "",


        impressions:
            Number(
                contentImpressions
                    ? contentImpressions.value
                    : 0
            ) || 0,


        reach:
            Number(
                contentReach
                    ? contentReach.value
                    : 0
            ) || 0,


        likes:
            Number(
                contentLikes
                    ? contentLikes.value
                    : 0
            ) || 0,


        comments:
            Number(
                contentComments
                    ? contentComments.value
                    : 0
            ) || 0,


        shares:
            Number(
                contentShares
                    ? contentShares.value
                    : 0
            ) || 0,


        saved:
            Number(
                contentSaved
                    ? contentSaved.value
                    : 0
            ) || 0,


        notes:
            contentNotes
                ? contentNotes.value.trim()
                : ""

    };

}


// =====================================
// SAVE CONTENT
// =====================================

async function saveContentData() {

    // =================================
    // VALIDATE TITLE
    // =================================

    if (!contentTitle) {

        return;

    }


    const title =
        contentTitle.value.trim();


    if (title === "") {

        alert(
            "Please enter a content title."
        );

        return;

    }


    // =================================
    // VALIDATE DATE
    // =================================

    if (
        !contentDate ||
        contentDate.value === ""
    ) {

        alert(
            "Please select a publish date."
        );

        return;

    }


    if (!account) {

        alert(
            "Account not found."
        );

        return;

    }


    // =================================
    // BUILD DATA
    // =================================

    const contentData =
        buildContentData();


    const contents =
        getContents();


    // =================================
    // UPDATE EXISTING
    // =================================

    if (editingContentId !== null) {

        const index =
            contents.findIndex(
                item =>
                    String(item.id) ===
                    String(editingContentId)
            );


        if (index === -1) {

            alert(
                "Content not found."
            );

            return;

        }


        contents[index] = {

            ...contents[index],

            ...contentData,

            id:
                editingContentId

        };

    }


    // =================================
    // CREATE NEW
    // =================================

    else {

        contents.push(
            contentData
        );

    }


    // =================================
    // SAVE TO FIRESTORE
    // =================================

    const success =
        await saveDatabase();


    if (!success) {

        alert(
            "Failed to save content to Firestore."
        );

        return;

    }


    // =================================
    // RESET
    // =================================

    editingContentId =
        null;


    // =================================
    // CLOSE MODAL
    // =================================

    closeContentForm();


    // =================================
    // REFRESH
    // =================================

    showContents();


    console.log(
        "Content saved successfully:",
        contentData
    );

}


// =====================================
// DELETE CONTENT
// =====================================

async function deleteContent(id) {

    const contents =
        getContents();


    const content =
        contents.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!content) {

        console.error(
            "Content not found:",
            id
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete "${content.title || "this content"}"?`
        );


    if (!confirmed) {

        return;

    }


    account.contents =
        contents.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    const success =
        await saveDatabase();


    if (!success) {

        alert(
            "Failed to delete content from Firestore."
        );

        return;

    }


    showContents();


    console.log(
        "Content deleted:",
        id
    );

}


// =====================================
// CLOSE CONTENT MODAL
// =====================================

function closeContentForm() {

    if (contentModal) {

        contentModal.style.display =
            "none";

    }


    editingContentId =
        null;

}


// =====================================
// ADD CONTENT BUTTON
// =====================================

if (addContent) {

    addContent.addEventListener(
        "click",
        openCreateContent
    );

}


// =====================================
// SAVE CONTENT BUTTON
// =====================================

if (saveContent) {

    saveContent.addEventListener(
        "click",
        saveContentData
    );

}


// =====================================
// CLOSE BUTTON
// =====================================

if (closeContentModal) {

    closeContentModal.addEventListener(
        "click",
        closeContentForm
    );

}


// =====================================
// CANCEL BUTTON
// =====================================

if (cancelContent) {

    cancelContent.addEventListener(
        "click",
        closeContentForm
    );

}


// =====================================
// CLICK OUTSIDE MODAL
// =====================================

window.addEventListener(
    "click",
    function (event) {

        if (
            contentModal &&
            event.target === contentModal
        ) {

            closeContentForm();

        }

    }
);


// =====================================
// SEARCH
// =====================================

if (searchContent) {

    searchContent.addEventListener(
        "input",
        showContents
    );

}


// =====================================
// STATUS FILTER
// =====================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        showContents
    );

}


// =====================================
// PLATFORM FILTER
// =====================================

if (platformFilter) {

    platformFilter.addEventListener(
        "change",
        showContents
    );

}


// =====================================
// INITIALIZE
// =====================================

loadContentData();