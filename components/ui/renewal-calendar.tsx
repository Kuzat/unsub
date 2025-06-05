"use client"
import { useState } from "react";

type Renewal = {
  id: string;
  serviceName: string;
  serviceLogoUrl: string | null;
  price: number;
  currency: string;
  renewalDate: Date;
  billingCycle: string;
};

type RenewalCalendarProps = {
  renewalsByDate: Record<string, Renewal[]>;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
};

export function RenewalCalendar({ renewalsByDate, firstDayOfWeek = 1 }: RenewalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Adjust the first day of month calculation based on firstDayOfWeek
  const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() - firstDayOfWeek + 7) % 7;
  const today = new Date();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const orderedDayNames = [...dayNames.slice(firstDayOfWeek), ...dayNames.slice(0, firstDayOfWeek)];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getRenewalsByDate = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return renewalsByDate[dateStr] || [];
  };

  const isToday = (day: number) => {
    return today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear;
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayRenewals = getRenewalsByDate(day);
      const isCurrentDay = isToday(day);

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-1 ${
            isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayRenewals.slice(0, 2).map((renewal) => (
              <div
                key={renewal.id}
                className="text-xs p-1 rounded truncate bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                title={`${renewal.serviceName}: ${renewal.price} ${renewal.currency}`}
              >
                {renewal.serviceName}
              </div>
            ))}
            {dayRenewals.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{dayRenewals.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full h-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg h-full flex flex-col">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 mb-2">
            {orderedDayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 flex-grow">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Subscription renewals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
