import * as funcs from "./functions.js"

export function generateCalender(month,year){
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(year, month - 1, 1);
    const firstDayOfWeek = date.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const calendarContainer = document.getElementById("calendar");
    calendarContainer.innerHTML = ""; // Clear the existing calendar

    // Add day headers (Sunday, Monday, etc.)
    daysOfWeek.forEach(day => {
        const header = document.createElement("div");
        header.className = "calendar-item calendar-header";
        header.textContent = day;
        calendarContainer.appendChild(header);
    });

    // Create empty spaces before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-item empty-cell";
        calendarContainer.appendChild(emptyCell);
    }

    // Add day numbers and shift blocks
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "calendar-item calendar-day";

        // Create a span for the day number (top-right corner)
        const dayNumber = document.createElement("span");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;

        // Create divs for shift blocks
        const morningShiftBlock = document.createElement("div");
        morningShiftBlock.className = "shift-block shift-1";

        const eveningShiftBlock = document.createElement("div");
        eveningShiftBlock.className = "shift-block shift-2";

        const nightShiftBlock = document.createElement("div");
        nightShiftBlock.className = "shift-block shift-3";

        funcs.assignWorkers(day,morningShiftBlock,eveningShiftBlock,nightShiftBlock)

        // Append elements inside the day cell
        dayCell.appendChild(dayNumber);
        dayCell.appendChild(morningShiftBlock);
        dayCell.appendChild(eveningShiftBlock);
        dayCell.appendChild(nightShiftBlock);

        calendarContainer.appendChild(dayCell);
    }
}