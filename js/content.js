console.log("CONTENT.JS LOADED VERSION 3");


// =====================================
// SOCMEDATA CONTENT MANAGEMENT
// =====================================
// Uses the SAME database structure
// as the Account Dashboard.
//
// Vault
//   ↓
// Profile
//   ↓
// Account
//   ↓
// account.contents
// =====================================



// =====================================
// LOAD DATABASE
// =====================================

let profiles =
    JSON.parse(
        localStorage.getItem("profiles")
    ) || [];



let activeProfileId =
    localStorage.getItem(
        "activeProfileId"
    );



let activeAccountId =
    localStorage.getItem(
        "activeAccountId"
    );



console.log(
    "Active Profile:",
    activeProfileId
);


console.log(
    "Active Account:",
    activeAccountId
);



// =====================================
// FIND ACTIVE PROFILE
// =====================================

let profile =
    profiles.find(
        p => p.id == activeProfileId
    );



if(!profile){

    console.error(
        "Profile not found."
    );

    alert("Vault not found.");

    window.location.href =
        "../index.html";

}



// =====================================
// FIND ACTIVE ACCOUNT
// =====================================

let account =
    profile.accounts?.find(
        a => a.id == activeAccountId
    );



if(!account){

    console.error(
        "Account not found."
    );

    alert("Account not found.");

    window.location.href =
        "dashboard.html";

}



// =====================================
// DATABASE SAFETY
// =====================================

if(!account.contents){

    account.contents = [];

}



// =====================================
// SAVE DATABASE
// =====================================

function saveDatabase(){

    localStorage.setItem(

        "profiles",

        JSON.stringify(
            profiles
        )

    );

}



// =====================================
// PROFILE NAME
// =====================================

const profileName =
    document.getElementById(
        "profileName"
    );



if(profileName){

    profileName.textContent =
        profile.name || "My Vault";

}



// =====================================
// ELEMENTS
// =====================================

const contentList =
    document.getElementById(
        "contentList"
    );


const searchContent =
    document.getElementById(
        "searchContent"
    );


const statusFilter =
    document.getElementById(
        "statusFilter"
    );


const platformFilter =
    document.getElementById(
        "platformFilter"
    );


const addContent =
    document.getElementById(
        "addContentBtn"
    );


const contentModal =
    document.getElementById(
        "contentModal"
    );


const closeContentModal =
    document.getElementById(
        "closeContentModal"
    );


const cancelContent =
    document.getElementById(
        "cancelContent"
    );


const saveContent =
    document.getElementById(
        "saveContent"
    );


const contentModalTitle =
    document.getElementById(
        "contentModalTitle"
    );



// =====================================
// FORM ELEMENTS
// =====================================

const contentTitle =
    document.getElementById(
        "contentTitle"
    );


const contentPlatform =
    document.getElementById(
        "contentPlatform"
    );


const contentType =
    document.getElementById(
        "contentType"
    );


const contentStatus =
    document.getElementById(
        "contentStatus"
    );


const contentDate =
    document.getElementById(
        "contentDate"
    );


const contentCaption =
    document.getElementById(
        "contentCaption"
    );


const contentHashtag =
    document.getElementById(
        "contentHashtag"
    );


const contentImpressions =
    document.getElementById(
        "contentImpressions"
    );


const contentReach =
    document.getElementById(
        "contentReach"
    );


const contentLikes =
    document.getElementById(
        "contentLikes"
    );


const contentComments =
    document.getElementById(
        "contentComments"
    );


const contentShares =
    document.getElementById(
        "contentShares"
    );


const contentSaved =
    document.getElementById(
        "contentSaved"
    );


const contentNotes =
    document.getElementById(
        "contentNotes"
    );



// =====================================
// EDIT MODE
// =====================================

let editingContentId = null;



// =====================================
// NUMBER FORMAT
// =====================================

function formatNumber(number){

    return Number(number || 0)
        .toLocaleString("id-ID");

}



// =====================================
// ENGAGEMENT CALCULATOR
// =====================================

function getEngagement(content){

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
// RENDER CONTENTS
// =====================================

function showContents(){

    if(!contentList){

        console.error(
            "contentList not found."
        );

        return;

    }



    contentList.innerHTML = "";



    let contents =
        account.contents || [];



    // =================================
    // SEARCH
    // =================================

    const searchValue =
        searchContent
        ?
        searchContent.value
            .toLowerCase()
            .trim()
        :
        "";



    // =================================
    // FILTER
    // =================================

    let filteredContents =
        contents.filter(content=>{


            const title =
                (
                    content.title ||
                    ""
                ).toLowerCase();


            const caption =
                (
                    content.caption ||
                    ""
                ).toLowerCase();


            const hashtag =
                (
                    content.hashtag ||
                    ""
                ).toLowerCase();



            const matchesSearch =

                searchValue === ""

                ||

                title.includes(
                    searchValue
                )

                ||

                caption.includes(
                    searchValue
                )

                ||

                hashtag.includes(
                    searchValue
                );



            const matchesStatus =

                !statusFilter

                ||

                statusFilter.value === "all"

                ||

                (
                    content.status ||
                    "Draft"
                ).toLowerCase()
                ===
                statusFilter.value;



            const matchesPlatform =

                !platformFilter

                ||

                platformFilter.value === "all"

                ||

                content.platform
                ===
                platformFilter.value;



            return (

                matchesSearch &&

                matchesStatus &&

                matchesPlatform

            );


        });



    // =================================
    // EMPTY STATE
    // =================================

    if(filteredContents.length === 0){

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
    // RENDER CARDS
    // =================================

    filteredContents.forEach(
        content=>{


        const card =
            document.createElement(
                "div"
            );



        card.className =
            "content-card";



        const engagement =
            getEngagement(
                content
            );



        const status =
            content.status ||
            "Draft";



        card.innerHTML = `

        <div class="content-header">


            <div>

                <h3>

                    🎬

                    ${
                        content.title ||
                        content.caption ||
                        "Untitled Content"
                    }

                </h3>

            </div>


            <span
                class="status ${status.toLowerCase()}"
            >

                ${status}

            </span>


        </div>



        <div class="content-info">


            <p>

                📱

                ${
                    content.platform ||
                    "-"
                }

            </p>


            <p>

                🎞

                ${
                    content.contentType ||
                    "-"
                }

            </p>


        </div>



        <p class="content-date">

            📅

            ${
                content.date ||
                "-"
            }

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
                data-id="${content.id}"
            >

                ✏ Edit

            </button>


            <button
                class="delete-content"
                data-id="${content.id}"
            >

                🗑 Delete

            </button>


        </div>


        `;



        // =================================
        // EDIT
        // =================================

        const editButton =
            card.querySelector(
                ".edit-content"
            );



        if(editButton){

            editButton.onclick =
                function(){

                    openEditContent(
                        content.id
                    );

                };

        }



        // =================================
        // DELETE
        // =================================

        const deleteButton =
            card.querySelector(
                ".delete-content"
            );



        if(deleteButton){

            deleteButton.onclick =
                function(){

                    deleteContent(
                        content.id
                    );

                };

        }



        contentList.appendChild(
            card
        );


    });

}



// =====================================
// OPEN CREATE MODAL
// =====================================

function openCreateContent(){

    editingContentId =
        null;



    if(contentModalTitle){

        contentModalTitle.textContent =
            "Create Content";

    }



    if(saveContent){

        saveContent.textContent =
            "Create Content";

    }



    clearContentForm();



    if(contentModal){

        contentModal.style.display =
            "flex";

    }

}



// =====================================
// CLEAR FORM
// =====================================

function clearContentForm(){

    if(contentTitle)
        contentTitle.value = "";


    if(contentPlatform)
        contentPlatform.selectedIndex = 0;


    if(contentType)
        contentType.selectedIndex = 0;


    if(contentStatus)
        contentStatus.value =
            "Draft";


    if(contentDate)
        contentDate.value = "";


    if(contentCaption)
        contentCaption.value = "";


    if(contentHashtag)
        contentHashtag.value = "";


    if(contentImpressions)
        contentImpressions.value = "";


    if(contentReach)
        contentReach.value = "";


    if(contentLikes)
        contentLikes.value = "";


    if(contentComments)
        contentComments.value = "";


    if(contentShares)
        contentShares.value = "";


    if(contentSaved)
        contentSaved.value = "";


    if(contentNotes)
        contentNotes.value = "";

}



// =====================================
// OPEN EDIT MODAL
// =====================================

function openEditContent(id){

    const content =
        account.contents.find(
            item =>
                item.id == id
        );



    if(!content)
        return;



    editingContentId =
        content.id;



    if(contentModalTitle){

        contentModalTitle.textContent =
            "Edit Content";

    }



    if(saveContent){

        saveContent.textContent =
            "Update Content";

    }



    if(contentTitle)
        contentTitle.value =
            content.title || "";


    if(contentPlatform)
        contentPlatform.value =
            content.platform || "Instagram";


    if(contentType)
        contentType.value =
            content.contentType || "Post";


    if(contentStatus)
        contentStatus.value =
            content.status || "Draft";


    if(contentDate)
        contentDate.value =
            content.date || "";


    if(contentCaption)
        contentCaption.value =
            content.caption || "";


    if(contentHashtag)
        contentHashtag.value =
            content.hashtag || "";


    if(contentImpressions)
        contentImpressions.value =
            content.impressions || 0;


    if(contentReach)
        contentReach.value =
            content.reach || 0;


    if(contentLikes)
        contentLikes.value =
            content.likes || 0;


    if(contentComments)
        contentComments.value =
            content.comments || 0;


    if(contentShares)
        contentShares.value =
            content.shares || 0;


    if(contentSaved)
        contentSaved.value =
            content.saved || 0;


    if(contentNotes)
        contentNotes.value =
            content.notes || "";



    if(contentModal){

        contentModal.style.display =
            "flex";

    }

}



// =====================================
// SAVE CONTENT
// =====================================

function saveContentData(){

    // =================================
    // BASIC VALIDATION
    // =================================

    if(!contentTitle){

        return;

    }



    const title =
        contentTitle.value.trim();



    if(title === ""){

        alert(
            "Please enter a content title."
        );

        return;

    }



    if(!contentDate ||
       contentDate.value === ""){

        alert(
            "Please select a publish date."
        );

        return;

    }



    // =================================
    // BUILD CONTENT OBJECT
    // =================================

    const contentData = {

        id:
            editingContentId !== null
            ?
            editingContentId
            :
            Date.now(),


        accountId:
            activeAccountId,


        title:
            title,


        platform:
            contentPlatform
            ?
            contentPlatform.value
            :
            "",


        contentType:
            contentType
            ?
            contentType.value
            :
            "Post",


        status:
            contentStatus
            ?
            contentStatus.value
            :
            "Draft",


        date:
            contentDate
            ?
            contentDate.value
            :
            "",


        caption:
            contentCaption
            ?
            contentCaption.value
            :
            "",


        hashtag:
            contentHashtag
            ?
            contentHashtag.value
            :
            "",


        impressions:
            Number(
                contentImpressions
                ?
                contentImpressions.value
                :
                0
            ) || 0,


        reach:
            Number(
                contentReach
                ?
                contentReach.value
                :
                0
            ) || 0,


        likes:
            Number(
                contentLikes
                ?
                contentLikes.value
                :
                0
            ) || 0,


        comments:
            Number(
                contentComments
                ?
                contentComments.value
                :
                0
            ) || 0,


        shares:
            Number(
                contentShares
                ?
                contentShares.value
                :
                0
            ) || 0,


        saved:
            Number(
                contentSaved
                ?
                contentSaved.value
                :
                0
            ) || 0,


        notes:
            contentNotes
            ?
            contentNotes.value
            :
            ""

    };



    // =================================
    // UPDATE EXISTING
    // =================================

    if(editingContentId !== null){

        const index =
            account.contents.findIndex(
                item =>
                    item.id ==
                    editingContentId
            );



        if(index !== -1){

            account.contents[index] =
                {

                    ...account.contents[index],

                    ...contentData,

                    id:
                        editingContentId

                };

        }

    }



    // =================================
    // CREATE NEW
    // =================================

    else{

        account.contents.push(
            contentData
        );

    }



    // =================================
    // SAVE
    // =================================

    saveDatabase();



    // =================================
    // RESET EDIT MODE
    // =================================

    editingContentId =
        null;



    // =================================
    // CLOSE MODAL
    // =================================

    if(contentModal){

        contentModal.style.display =
            "none";

    }



    // =================================
    // REFRESH CONTENT
    // =================================

    showContents();



    console.log(
        "Content saved:",
        contentData
    );

}



// =====================================
// DELETE CONTENT
// =====================================

function deleteContent(id){

    const content =
        account.contents.find(
            item =>
                item.id == id
        );



    if(!content)
        return;



    const confirmed =
        confirm(
            `Delete "${content.title || "this content"}"?`
        );



    if(!confirmed)
        return;



    account.contents =
        account.contents.filter(
            item =>
                item.id != id
        );



    saveDatabase();



    showContents();



    console.log(
        "Content deleted:",
        id
    );

}



// =====================================
// ADD CONTENT BUTTON
// =====================================

if(addContent){

    addContent.onclick =
        openCreateContent;

}



// =====================================
// SAVE BUTTON
// =====================================

if(saveContent){

    saveContent.onclick =
        saveContentData;

}



// =====================================
// CLOSE MODAL
// =====================================

if(closeContentModal){

    closeContentModal.onclick =
        function(){

            if(contentModal){

                contentModal.style.display =
                    "none";

            }

            editingContentId =
                null;

        };

}



// =====================================
// CANCEL BUTTON
// =====================================

if(cancelContent){

    cancelContent.onclick =
        function(){

            if(contentModal){

                contentModal.style.display =
                    "none";

            }

            editingContentId =
                null;

        };

}



// =====================================
// CLICK OUTSIDE MODAL
// =====================================

window.addEventListener(
    "click",
    function(event){

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

    }
);



// =====================================
// SEARCH
// =====================================

if(searchContent){

    searchContent.addEventListener(
        "input",
        showContents
    );

}



// =====================================
// STATUS FILTER
// =====================================

if(statusFilter){

    statusFilter.addEventListener(
        "change",
        showContents
    );

}



// =====================================
// PLATFORM FILTER
// =====================================

if(platformFilter){

    platformFilter.addEventListener(
        "change",
        showContents
    );

}



// =====================================
// INITIAL RENDER
// =====================================

showContents();



console.log(
    "Content Management initialized."
);
