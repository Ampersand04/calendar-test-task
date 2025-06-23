import { LightningElement, track } from 'lwc';

export default class CustomCalendar extends LightningElement {
    
    @track currentDate = new Date();
    @track selectedEvent = null;

    events = [
        { date: '2025-04-05', title: 'Daily Standup', participants: '' },
        { date: '2025-04-22', title: 'Doctor appointment', participants: 'Dr.Smith, Dr.Williamson' },
        { date: '2025-04-27', title: 'Event Name', participants: '' }
    ];

    get monthName() {
        return this.currentDate.toLocaleString('default', { month: 'long' });
    }

    get year() {
        return this.currentDate.getFullYear();
    }

    get days() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
    
        // Текущий месяц
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDaysInMonth = lastDay.getDate();
    
        // Смещение: день недели первого числа месяца (с понедельника = 0)
        const startOffset = (firstDay.getDay() + 6) % 7;
    
        // Предыдущий месяц
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
        const daysArray = [];
    
        // 1. Добавляем дни предыдущего месяца
        for (let i = startOffset - 1; i >= 0; i--) {
            const dateNum = daysInPrevMonth - i;
            const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
            const event = this.events.find(e => e.date === dateStr);
    
            daysArray.push({
                date: dateNum,
                dateKey: dateStr,
                className: 'day other-month',
                event
            });
        }
    
        // 2. Добавляем дни текущего месяца
        for (let i = 1; i <= totalDaysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const event = this.events.find(e => e.date === dateStr);
    
            daysArray.push({
                date: i,
                dateKey: dateStr,
                className: event ? 'day event-day' : 'day',
                event
            });
        }
    
        // 3. Добавляем дни следующего месяца (до 42 ячеек всего)
        const nextMonth = (month + 1) % 12;
        const nextYear = month === 11 ? year + 1 : year;
        const nextDaysNeeded = 35 - daysArray.length;
    
        for (let i = 1; i <= nextDaysNeeded; i++) {
            const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const event = this.events.find(e => e.date === dateStr);
    
            daysArray.push({
                date: i,
                dateKey: dateStr,
                className: 'day other-month',
                event
            });
        }
    
        return daysArray;
    }
    
    
    get weekdayNames() {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.currentDate = new Date(this.currentDate);
        this.selectedEvent = null;
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.currentDate = new Date(this.currentDate);
        this.selectedEvent = null;
    }

    handleDateClick(event) {
        const dateKey = event.currentTarget.dataset.key;
        const selected = this.events.find(e => e.date === dateKey);
        this.selectedEvent = selected || null;
    }

    deleteEvent() {
        this.events = this.events.filter(e => e !== this.selectedEvent);
        this.selectedEvent = null;
    }
}