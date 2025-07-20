
'use client'; 
import React, { useState, useMemo } from 'react';
import { 
    format, addDays, addWeeks, addMonths, addYears, startOfMonth, endOfMonth, 
    startOfWeek, endOfWeek, getDay, isSameDay, getDaysInMonth, setDate, 
    parseISO, isValid, isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, CheckCircle, X } from 'lucide-react';

// --- CONSTANTS & HELPER COMPONENTS ---

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEK_DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


const getOrdinal = (n) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
};

const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full capitalize shadow-sm';
    const variantClasses = {
        primary: 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 focus:ring-cyan-500 shadow-lg',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 focus:ring-cyan-400',
        ghost: 'bg-transparent text-gray-800 hover:bg-teal-50',
    };
    return <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>{children}</button>;
}; 

const NumberInput = ({ value, onChange, min = 1 }) => (
    <input
        type="number"
        value={value}
        onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= min) onChange(val);
        }}
        min={min}
        className="w-20 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
    />
);

const DateInput = ({ label, selectedDate, onChange }) => {
    const handleDateChange = (e) => {
        const parsedDate = parseISO(e.target.value);
        onChange(isValid(parsedDate) ? parsedDate : null);
    };

    return (
        <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-600">{label}</label>
            <div className="relative">
                <input
                    type="date"
                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                    onChange={handleDateChange}
                    className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
        </div>
    );
};


// --- RECURRENCE CONFIGURATION COMPONENTS ---

const DailyConfig = ({ recurrence, setRecurrence }) => (
    <div className="flex items-center space-x-2 text-gray-700">
        <span>Every</span>
        <NumberInput value={recurrence.interval} onChange={(val) => setRecurrence({ ...recurrence, interval: val })} />
        <span>day(s)</span>
    </div>
);

const WeeklyConfig = ({ recurrence, setRecurrence }) => {
    const toggleDay = (dayIndex) => {
        const newDaysOfWeek = recurrence.daysOfWeek.includes(dayIndex)
            ? recurrence.daysOfWeek.filter(d => d !== dayIndex)
            : [...recurrence.daysOfWeek, dayIndex].sort();
        if (newDaysOfWeek.length > 0) setRecurrence({ ...recurrence, daysOfWeek: newDaysOfWeek });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-700">
                <span>Every</span>
                <NumberInput value={recurrence.interval} onChange={(val) => setRecurrence({ ...recurrence, interval: val })} />
                <span>week(s) on:</span>
            </div>
            <div className="flex justify-center space-x-1">
                {WEEK_DAYS.map((day, index) => (
                    <button key={day} onClick={() => toggleDay(index)} className={`w-10 h-10 rounded-full font-semibold transition-all duration-200 text-sm transform hover:scale-110 ${recurrence.daysOfWeek.includes(index) ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-teal-100'}`}>{day}</button>
                ))}
            </div>
        </div>
    );
};

const MonthlyConfig = ({ recurrence, setRecurrence, startDate }) => {
    const handleMonthlyTypeChange = (type) => {
        const newMonthly = { ...recurrence.monthly, type };
        if (type === 'dayOfMonth') {
            newMonthly.day = startDate.getDate();
        } else {
            newMonthly.week = Math.ceil(startDate.getDate() / 7);
            newMonthly.dayOfWeek = getDay(startDate);
        }
        setRecurrence({ ...recurrence, monthly: newMonthly });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-700">
                <span>Every</span>
                <NumberInput value={recurrence.interval} onChange={(val) => setRecurrence({ ...recurrence, interval: val })} />
                <span>month(s)</span>
            </div>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="monthlyType" checked={recurrence.monthly.type === 'dayOfMonth'} onChange={() => handleMonthlyTypeChange('dayOfMonth')} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" />
                    <span className="text-gray-700">On day {getOrdinal(recurrence.monthly.day)}</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="monthlyType" checked={recurrence.monthly.type === 'dayOfWeek'} onChange={() => handleMonthlyTypeChange('dayOfWeek')} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500" />
                    <span className="text-gray-700">On the {getOrdinal(recurrence.monthly.week)} {WEEK_DAYS_FULL[recurrence.monthly.dayOfWeek]}</span>
                </label>
            </div>
        </div>
    );
};

const YearlyConfig = ({ recurrence, setRecurrence }) => (
    <div className="flex items-center space-x-2 text-gray-700">
        <span>Every</span>
        <NumberInput value={recurrence.interval} onChange={(val) => setRecurrence({ ...recurrence, interval: val })} />
        <span>year(s)</span>
    </div>
);


// --- MINI CALENDAR PREVIEW ---

const CalendarPreview = ({ recurringDates, startDate }) => {
    const [currentMonth, setCurrentMonth] = useState(startDate || new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const calendarGrid = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const gridStartDate = startOfWeek(monthStart);
        const gridEndDate = endOfWeek(monthEnd);
        const grid = [];
        let day = gridStartDate;
        while (day <= gridEndDate) {
            grid.push(day);
            day = addDays(day, 1);
        }
        return grid;
    }, [currentMonth]);

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronLeft size={20} /></button>
                <h3 className="font-bold text-lg text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h3>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {WEEK_DAYS.map(day => <div key={day} className="font-semibold text-sm text-gray-500 pb-2">{day}</div>)}
                {calendarGrid.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isSelected = recurringDates.some(d => isSameDay(d, day));
                    const isTodayDate = isToday(day);
                    return (
                        <div key={index} className={`h-9 w-9 flex items-center justify-center rounded-full text-sm transition-all duration-200 ${
                            isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                        } ${
                            isSelected ? 'bg-teal-600 text-white font-bold shadow-md' : ''
                        } ${
                            !isSelected && isTodayDate ? 'bg-teal-100 text-teal-600 font-bold' : ''
                        } ${
                            !isSelected && !isTodayDate ? 'hover:bg-gray-200' : ''
                        }`}>
                            {format(day, 'd')}
                        </div>
                    );
})}
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

export default function RecurringDatePicker() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false); // State for confirmation modal
    const [recurrence, setRecurrence] = useState({
        type: 'daily',
        interval: 1,
        daysOfWeek: [getDay(new Date())],
        monthly: {
            type: 'dayOfMonth',
            day: new Date().getDate(),
            week: Math.ceil(new Date().getDate() / 7),
            dayOfWeek: getDay(new Date()),
        },
    });

    const handleStartDateChange = (date) => {
        if (!date) return;
        setStartDate(date);
        setRecurrence(prev => ({
            ...prev,
            daysOfWeek: [getDay(date)],
            monthly: {
                ...prev.monthly,
                day: date.getDate(),
                week: Math.ceil(date.getDate() / 7),
                dayOfWeek: getDay(date),
            }
        }));
    };

    const handleTypeChange = (type) => {
        setRecurrence(prev => ({ ...prev, type }));
    };
    
    const handleConfirm = () => {
        setIsConfirmed(true);
    };
    
    const handleCloseConfirmation = () => {
        setIsConfirmed(false);
    };

    const recurringDates = useMemo(() => {
        if (!startDate) return [];
        const dates = [];
        let currentDate = startDate;
        const maxIterations = 365;
        let count = 0;

        while (count < maxIterations && (!endDate || currentDate <= endDate)) {
            switch (recurrence.type) {
                case 'daily':
                    if (count % recurrence.interval === 0) dates.push(addDays(startDate, count));
                    break;
                case 'weekly':
                    if (recurrence.daysOfWeek.includes(getDay(currentDate))) dates.push(currentDate);
                    break;
                case 'monthly':
                    let monthDate;
                    if (recurrence.monthly.type === 'dayOfMonth') {
                        monthDate = setDate(currentDate, recurrence.monthly.day);
                    } else {
                        const { week, dayOfWeek } = recurrence.monthly;
                        const firstDayOfMonth = startOfMonth(currentDate);
                        let firstOccurrence = (dayOfWeek - getDay(firstDayOfMonth) + 7) % 7;
                        let targetDay = firstOccurrence + 1 + (week - 1) * 7;
                        if (targetDay <= getDaysInMonth(currentDate)) {
                            monthDate = setDate(currentDate, targetDay);
                        }
                    }
                    if (monthDate && monthDate >= startDate && (!endDate || monthDate <= endDate)) dates.push(monthDate);
                    break;
                case 'yearly':
                    if (currentDate >= startDate) dates.push(currentDate);
                    break;
            }

            count++;
            if (recurrence.type === 'daily') { /* Handled by count */ } 
            else if (recurrence.type === 'weekly') { currentDate = addDays(currentDate, 1); } 
            else if (recurrence.type === 'monthly') { currentDate = addMonths(startOfMonth(currentDate), recurrence.interval); } 
            else if (recurrence.type === 'yearly') { currentDate = addYears(currentDate, recurrence.interval); }
        }
        return dates;
    }, [startDate, endDate, recurrence]);

    const getSummaryText = () => {
        if (!startDate) return "Select a start date.";
        
        let summary = `Occurs `;
        switch(recurrence.type) {
            case 'daily':
                summary += recurrence.interval > 1 ? `every ${recurrence.interval} days` : 'daily';
                break;
            case 'weekly':
                summary += recurrence.interval > 1 ? `every ${recurrence.interval} weeks` : 'weekly';
                const selectedDays = recurrence.daysOfWeek.map(d => WEEK_DAYS_FULL[d]).join(', ');
                summary += ` on ${selectedDays}`;
                break;
            case 'monthly':
                summary += recurrence.interval > 1 ? `every ${recurrence.interval} months` : 'monthly';
                if (recurrence.monthly.type === 'dayOfMonth') {
                    summary += ` on the ${getOrdinal(recurrence.monthly.day)}`;
                } else {
                    summary += ` on the ${getOrdinal(recurrence.monthly.week)} ${WEEK_DAYS_FULL[recurrence.monthly.dayOfWeek]}`;
                }
                break;
            case 'yearly':
                summary += recurrence.interval > 1 ? `every ${recurrence.interval} years` : 'yearly';
                summary += ` on ${format(startDate, 'MMMM d')}`;
                break;
            default: return "Select a recurrence rule.";
        }
        
        summary += `, starting ${format(startDate, 'MMM d, yyyy')}`;
        if (endDate) {
            summary += `, until ${format(endDate, 'MMM d, yyyy')}`;
        }
        
        return summary + '.';
    };

    return (
        <div className="relative bg-gradient-to-br from-gray-50 to-slate-100 p-4 sm:p-6 md:p-8 font-sans max-w-4xl mx-auto rounded-2xl shadow-2xl border border-gray-200">
            {isConfirmed && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border text-center max-w-md mx-4">
                        <button onClick={handleCloseConfirmation} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Schedule Confirmed!</h2>
                        <p className="text-gray-600 mb-6">The following recurring schedule has been created:</p>
                        <div className="p-4 bg-teal-50 border-l-4 border-teal-500 text-teal-800 rounded-r-lg text-left">
                            <p className="font-medium">{getSummaryText()}</p>
                        </div>
                        <Button onClick={handleCloseConfirmation} className="mt-8 w-full">
                            Create Another Schedule
                        </Button>
                    </div>
                </div>
            )}

            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Recurring Event</h1>
                <p className="text-gray-500 mt-2">Create a custom schedule for your event</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- Left Column: Configuration --- */}
                <div className="space-y-6">
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">1. Choose Recurrence</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {['daily', 'weekly', 'monthly', 'yearly'].map(type => (
                                <Button key={type} onClick={() => handleTypeChange(type)} variant={recurrence.type === type ? 'primary' : 'secondary'}>{type}</Button>
                            ))}
                        </div>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow-md min-h-[170px] flex flex-col justify-center">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">2. Set Options</h3>
                        {recurrence.type === 'daily' && <DailyConfig recurrence={recurrence} setRecurrence={setRecurrence} />}
                        {recurrence.type === 'weekly' && <WeeklyConfig recurrence={recurrence} setRecurrence={setRecurrence} />}
                        {recurrence.type === 'monthly' && <MonthlyConfig recurrence={recurrence} setRecurrence={setRecurrence} startDate={startDate} />}
                        {recurrence.type === 'yearly' && <YearlyConfig recurrence={recurrence} setRecurrence={setRecurrence} />}
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">3. Define Range</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DateInput label="Starts on" selectedDate={startDate} onChange={handleStartDateChange} />
                            <DateInput label="Ends on (optional)" selectedDate={endDate} onChange={setEndDate} />
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Preview & Summary --- */}
                <div className="space-y-6">
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Summary</h2>
                        <div className="p-4 bg-teal-50 border-l-4 border-teal-500 text-teal-800 rounded-r-lg flex items-start space-x-3">
                            <Info size={20} className="flex-shrink-0 mt-0.5"/>
                            <p className="font-medium text-sm">{getSummaryText()}</p>
                        </div>
                    </div>
                    <div className="p-5 bg-white rounded-xl shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Preview Calendar</h2>
                        <CalendarPreview recurringDates={recurringDates} startDate={startDate} />
                    </div>
                </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => console.log("Cancelled")}>Cancel</Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Confirm Schedule
                </Button>
            </div>
        </div>
    );
}
