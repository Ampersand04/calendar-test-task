export function formatDateForDataset(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function formatTime(timeString) {
  if (!timeString) return null;
  try {
    const [hours, minutes] = timeString.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    return timeString;
  }
}
export function isSameDate(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function getCalendarDayClass(dayObj) {
  let classes = "calendar-day";
  classes += dayObj.isCurrentMonth ? " current-month" : " other-month";
  if (dayObj.isSelected) classes += " selected";
  if (dayObj.hasEvents) classes += " hasEvents";
  return classes;
}
export function getDayNumberClass(dayObj) {
  if (dayObj.isToday) return "day-number today";
  return "day-number";
}
