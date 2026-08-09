// =====================================
// SOCMEDATA CALENDAR
// FIRESTORE VERSION
// =====================================

console.log("CALENDAR.JS LOADED - FIRESTORE VERSION");


// =====================================
// FIREBASE
// =====================================

import {
    getProfile
} from "./firebase-db.js";

import {
    auth
} from "./firebase.js";

// =====================================
// MONTH NAMES
// =====================================

const monthNames = [
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


// =====================================
// APPLICATION STATE
// =====================================

let currentDate = new Date();

let profile = null;
let account = null;

let activeProfileId =
    localStorage.getItem("activeProfileId");

let activeAccountId =
    localStorage.getItem("activeAccountId");


// =====================================
// LOAD FIRESTORE DATA
// =====================================

async function loadCalendarData() {

    try {

        if (!activeProfileId) {

            console.warn(
                "Calendar: No active profile ID."
            );

            return false;
        }

        profile =
            await getProfile(activeProfileId);

        if (!profile) {

            console.warn(
                "Calendar: Profile not found."
            );

            return false;
        }


        // =====================================
        // GET ACCOUNTS
        // =====================================

        const accounts =
            Array.isArray(profile.accounts)
                ? profile.accounts
                : [];


        // =====================================
        // FIND ACTIVE ACCOUNT
        // =====================================

        account =
            accounts.find(function(acc) {

                return String(acc.id) ===
                    String(activeAccountId);

            });


        // =====================================
        // FALLBACK
        // =====================================

        if (!account && accounts.length > 0) {

            account = accounts[0];

            activeAccountId =
                account.id;

            localStorage.setItem(
                "activeAccountId",
                activeAccountId
            );

        }


        // =====================================
        // NO ACCOUNT
        // =====================================

        if (!account) {

            console.warn(
                "Calendar: No account found."
            );

            return false;
        }


        // =====================================
        // GLOBAL DATA
        // =====================================

        window.profile = profile;
        window.account = account;


        console.log(
            "Calendar Firebase data loaded:",
            account
        );


        return true;

    }

    catch (error) {

        console.error(
            "Calendar: Firebase loading failed.",
            error
        );

        return false;

    }

}


// =====================================
// GET ACCOUNT CONTENTS
// =====================================

function getAccountContents() {

    if (!account) {

        return [];

    }


    if (!Array.isArray(account.contents)) {

        return [];

    }


    return account.contents;

}


// =====================================
// GET CONTENTS BY DATE
// =====================================

function getContentsByDate(date) {

    const contents =
        getAccountContents();


    return contents.filter(function(content) {

        return String(content.date || "") ===
            String(date);

    });

}


// =====================================
// RENDER CALENDAR
// =====================================

function renderCalendar() {

    const month =
        currentDate.getMonth();

    const year =
        currentDate.getFullYear();


    const monthTitle =
        document.getElementById(
            "calendarMonth"
        );

    const calendarGrid =
        document.getElementById(
            "calendarGrid"
        );


    if (!monthTitle || !calendarGrid) {

        return;

    }


    // =====================================
    // MONTH TITLE
    // =====================================

    monthTitle.textContent =
        `${monthNames[month]} ${year}`;


    calendarGrid.innerHTML = "";


    // =====================================
    // CALENDAR INFORMATION
    // =====================================

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const daysInPrevMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    // =====================================
    // PREVIOUS MONTH DAYS
    // =====================================

    for (
        let i = firstDay;
        i > 0;
        i--
    ) {

        const cell =
            document.createElement("div");


        cell.className =
            "calendar-day other-month";


        cell.innerHTML = `
            <div class="day-number">
                ${daysInPrevMonth - i + 1}
            </div>
        `;


        calendarGrid.appendChild(cell);

    }


    // =====================================
    // TODAY
    // =====================================

    const today =
        new Date();


    // =====================================
    // CURRENT MONTH DAYS
    // =====================================

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement("div");


        cell.className =
            "calendar-day";


        // =====================================
        // DATE STRING
        // =====================================

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        cell.dataset.date =
            dateString;


        // =====================================
        // TODAY CLASS
        // =====================================

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {

            cell.classList.add("today");

        }


        // =====================================
        // DAY HTML
        // =====================================

        cell.innerHTML = `
            <div class="day-number">
                ${day}
            </div>

            <div class="calendar-events"></div>
        `;


        // =====================================
        // CONTENT FOR DATE
        // =====================================

        const dayContents =
            getContentsByDate(
                dateString
            );


        // =====================================
        // RENDER EVENTS
        // =====================================

        if (dayContents.length > 0) {

            const eventContainer =
                cell.querySelector(
                    ".calendar-events"
                );


            if (eventContainer) {

                eventContainer.innerHTML =
                    "";


                dayContents
                    .slice(0, 2)
                    .forEach(function(post) {

                        const shortCaption =
                            String(
                                post.caption ||
                                "Untitled"
                            ).substring(
                                0,
                                25
                            );


                        const statusClass =
                            getStatusClass(
                                post.status
                            );


                        const event =
                            document.createElement(
                                "div"
                            );


                        event.className =
                            `calendar-event ${statusClass}`;


                        event.innerHTML = `
                            <span class="event-platform">
                                ${getPlatformEmoji(post.platform)}
                            </span>

                            <span class="event-title">
                                ${escapeHTML(shortCaption)}
                            </span>
                        `;


                        eventContainer.appendChild(
                            event
                        );

                    });


                // =====================================
                // MORE CONTENT
                // =====================================

                if (dayContents.length > 2) {

                    const more =
                        document.createElement(
                            "div"
                        );


                    more.className =
                        "calendar-more";


                    more.textContent =
                        `+${dayContents.length - 2} more`;


                    eventContainer.appendChild(
                        more
                    );

                }

            }

        }


        // =====================================
        // DAY CLICK
        // =====================================

        cell.addEventListener(
            "click",
            function() {

                openCalendarDay(
                    dateString
                );

            }
        );


        calendarGrid.appendChild(cell);

    }


    // =====================================
    // COMPLETE 42 CELLS
    // =====================================

    while (
        calendarGrid.children.length < 42
    ) {

        const nextDay =
            calendarGrid.children.length -
            (firstDay + daysInMonth) +
            1;


        const cell =
            document.createElement("div");


        cell.className =
            "calendar-day other-month";


        cell.innerHTML = `
            <div class="day-number">
                ${nextDay}
            </div>
        `;


        calendarGrid.appendChild(cell);

    }

}


// =====================================
// STATUS CLASS
// =====================================

function getStatusClass(status) {

    const normalized =
        String(
            status || "Scheduled"
        ).toLowerCase();


    if (normalized === "published") {

        return "published";

    }


    if (normalized === "scheduled") {

        return "scheduled";

    }


    if (normalized === "private") {

        return "private";

    }


    if (normalized === "draft") {

        return "draft";

    }


    return "scheduled";

}


// =====================================
// PREVIOUS MONTH
// =====================================

const prevBtn =
    document.getElementById(
        "prevMonth"
    );


if (prevBtn) {

    prevBtn.addEventListener(
        "click",
        function() {

            currentDate.setMonth(
                currentDate.getMonth() - 1
            );


            renderCalendar();

        }
    );

}


// =====================================
// NEXT MONTH
// =====================================

const nextBtn =
    document.getElementById(
        "nextMonth"
    );


if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        function() {

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );


            renderCalendar();

        }
    );

}


// =====================================
// INITIALIZE CALENDAR
// =====================================

async function initializeCalendar() {

    console.log(
        "Calendar: Initializing..."
    );


    const loaded =
        await loadCalendarData();


    if (!loaded) {

        console.warn(
            "Calendar: Firebase account data unavailable."
        );

        return;

    }


    renderCalendar();

}


auth.onAuthStateChanged(
    (user) => {

        if (user) {

            console.log(
                "Calendar: Authentication ready."
            );

            initializeCalendar();

        } else {

            console.log(
                "Calendar: No authenticated user."
            );

        }

    }
);


// =====================================
// OPEN CALENDAR DAY
// =====================================

function openCalendarDay(date) {

    const modal =
        document.getElementById(
            "calendarModal"
        );


    const title =
        document.getElementById(
            "calendarModalTitle"
        );


    const content =
        document.getElementById(
            "calendarModalContent"
        );


    if (!modal || !title || !content) {

        return;

    }


    // =====================================
    // MODAL TITLE
    // =====================================

    title.textContent =
        date;


    // =====================================
    // GET CONTENT
    // =====================================

    const dayContents =
        getContentsByDate(date);


    // =====================================
    // NO CONTENT
    // =====================================

    if (dayContents.length === 0) {

        content.innerHTML = `
            <p>
                No content scheduled for this day.
            </p>
        `;

    }


    // =====================================
    // CONTENT EXISTS
    // =====================================

    else {

        content.innerHTML =
            "";


        dayContents.forEach(
            function(post) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "calendar-post-card";


                card.innerHTML = `
                    <h3>
                        ${getPlatformEmoji(post.platform)}
                        ${escapeHTML(
                            post.platform || "-"
                        )}
                    </h3>

                    <p>
                        <strong>Caption:</strong><br>
                        ${escapeHTML(
                            post.caption || "-"
                        )}
                    </p>

                    <p>
                        📌 Status:
                        ${escapeHTML(
                            post.status || "Scheduled"
                        )}
                    </p>

                    <p>
                        👁
                        ${formatNumber(
                            post.impressions || 0
                        )}
                        Impressions
                    </p>

                    <p>
                        👥
                        ${formatNumber(
                            post.reach || 0
                        )}
                        Reach
                    </p>

                    <p>
                        ❤️
                        ${formatNumber(
                            post.likes || 0
                        )}
                        Likes
                    </p>

                    <p>
                        💬
                        ${formatNumber(
                            post.comments || 0
                        )}
                        Comments
                    </p>

                    <p>
                        🔄
                        ${formatNumber(
                            post.shares || 0
                        )}
                        Shares
                    </p>

                    <p>
                        🔖
                        ${formatNumber(
                            post.saved || 0
                        )}
                        Saved
                    </p>
                `;


                content.appendChild(
                    card
                );

            }
        );

    }


    // =====================================
    // SHOW MODAL
    // =====================================

    modal.style.display =
        "flex";

}


// =====================================
// CLOSE CALENDAR MODAL
// =====================================

const calendarModal =
    document.getElementById(
        "calendarModal"
    );


const closeCalendarModal =
    document.getElementById(
        "closeCalendarModal"
    );


if (closeCalendarModal) {

    closeCalendarModal.addEventListener(
        "click",
        function() {

            if (calendarModal) {

                calendarModal.style.display =
                    "none";

            }

        }
    );

}


// =====================================
// CLOSE MODAL ON BACKDROP
// =====================================

window.addEventListener(
    "click",
    function(event) {

        if (
            calendarModal &&
            event.target === calendarModal
        ) {

            calendarModal.style.display =
                "none";

        }

    }
);


// =====================================
// PLATFORM EMOJI
// =====================================

function getPlatformEmoji(platform) {

    switch (platform) {

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
            return "📄";

    }

}


// =====================================
// NUMBER FORMAT
// =====================================

function formatNumber(value) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "en-US"
    );

}


// =====================================
// HTML ESCAPE
// =====================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================
// GLOBAL FUNCTIONS
// =====================================

window.renderCalendar =
    renderCalendar;


window.openCalendarDay =
    openCalendarDay;


window.getContentsByDate =
    getContentsByDate;