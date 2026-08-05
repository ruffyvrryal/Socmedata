// =====================================
// SOCMEDATA CALENDAR
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

let currentDate = new Date();

function renderCalendar() {

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const monthTitle = document.getElementById("calendarMonth");
    const calendarGrid = document.getElementById("calendarGrid");

    if (!monthTitle || !calendarGrid) return;

    monthTitle.textContent = `${monthNames[month]} ${year}`;

    calendarGrid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month days
    for (let i = firstDay; i > 0; i--) {

        const cell = document.createElement("div");

        cell.className = "calendar-day other-month";

        cell.innerHTML = `
            <div class="day-number">
                ${daysInPrevMonth - i + 1}
            </div>
        `;

        calendarGrid.appendChild(cell);

    }

    // Current month days
    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {

        const cell = document.createElement("div");

        cell.className = "calendar-day";

        const dateString =
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

cell.dataset.date = dateString;

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            cell.classList.add("today");
        }

        cell.dataset.date =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        cell.innerHTML = `
    <div class="day-number">${day}</div>
    <div class="calendar-events"></div>
`;

const dayContents = account.contents.filter(function(content){

    return content.date === dateString;

});

if(dayContents.length > 0){

    const eventContainer =
    cell.querySelector(".calendar-events");

eventContainer.innerHTML = "";

dayContents.slice(0, 2).forEach(function(post){

    eventContainer.innerHTML += `
        <div class="calendar-event">

            <strong>
                ${getPlatformEmoji(post.platform)}
            </strong>

            ${post.caption || "Untitled"}

        </div>
    `;

});

if(dayContents.length > 2){

    eventContainer.innerHTML += `
        <div class="calendar-more">
            +${dayContents.length - 2} more
        </div>
    `;

}

}

cell.addEventListener("click", function () {

    openCalendarDay(cell.dataset.date);

});

calendarGrid.appendChild(cell);

    }

    // Fill remaining cells to make 42
    while (calendarGrid.children.length < 42) {

        const nextDay =
            calendarGrid.children.length -
            (firstDay + daysInMonth) + 1;

        const cell = document.createElement("div");

        cell.className = "calendar-day other-month";

        cell.innerHTML = `
            <div class="day-number">${nextDay}</div>
        `;

        calendarGrid.appendChild(cell);

    }

}

const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

if (prevBtn) {

    prevBtn.addEventListener("click", () => {

        currentDate.setMonth(currentDate.getMonth() - 1);

        renderCalendar();

    });

}

if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        currentDate.setMonth(currentDate.getMonth() + 1);

        renderCalendar();

    });

}

renderCalendar();

function openCalendarDay(date){

    const modal =
        document.getElementById("calendarModal");

    const title =
        document.getElementById("calendarModalTitle");

    const content =
        document.getElementById("calendarModalContent");

    title.textContent = date;

    const dayContents = account.contents.filter(function(post){

        return post.date === date;

    });

    if(dayContents.length === 0){

        content.innerHTML = `
            <p>No content scheduled for this day.</p>
        `;

    }else{

        content.innerHTML = "";

        dayContents.forEach(function(post){

            content.innerHTML += `

                <div class="calendar-post-card">

                    <h3>
                        ${getPlatformEmoji(post.platform)}
                        ${post.platform}
                    </h3>

                    <p>
                        <strong>Caption:</strong><br>
                        ${post.caption || "-"}
                    </p>

                    <p>
                        👁 ${formatNumber(post.views || 0)} Views
                    </p>

                    <p>
                        ❤️ ${formatNumber(post.likes || 0)} Likes
                    </p>

                    <p>
                        💬 ${formatNumber(post.comments || 0)} Comments
                    </p>

                    <p>
                        🔄 ${formatNumber(post.shares || 0)} Shares
                    </p>

                    <p>
                        🔖 ${formatNumber(post.saved || 0)} Saved
                    </p>

                </div>

            `;

        });

    }

    modal.style.display = "flex";

}

const calendarModal =
    document.getElementById("calendarModal");

const closeCalendarModal =
    document.getElementById("closeCalendarModal");

if (closeCalendarModal) {

    closeCalendarModal.addEventListener("click", function(){

        calendarModal.style.display = "none";

    });

}

window.addEventListener("click", function(e){

    if(e.target === calendarModal){

        calendarModal.style.display = "none";

    }

});

console.log("Account Contents:", account.contents);

function getPlatformEmoji(platform){

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
            return "📄";

    }

}