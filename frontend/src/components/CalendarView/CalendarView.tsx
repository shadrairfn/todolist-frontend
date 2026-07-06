import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Todo } from '../../types/todo';
import './CalendarView.css';

interface CalendarViewProps {
  todos: Todo[];
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#ffffff',
  medium: '#fad000',
  high: '#eb8909',
  urgent: '#db4c3f',
};

// Helper to get local date at midnight
const toLocalDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const CalendarView: React.FC<CalendarViewProps> = ({ todos }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const monthYearStr = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate weeks
  const weeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Sunday

    const endDate = new Date(lastDay);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Saturday
    }

    const days: Date[] = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }

    const weeksArr: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArr.push(days.slice(i, i + 7));
    }
    return weeksArr;
  }, [currentDate]);

  // Process todos
  const processedTodos = useMemo(() => {
    return todos
      .filter(t => t.start_at || t.due_at)
      .map(t => {
        const start = toLocalDate(t.start_at || t.due_at!);
        const end = toLocalDate(t.due_at || t.start_at!);
        // Handle cases where due_at might be earlier than start_at by mistake
        const actualStart = start <= end ? start : end;
        const actualEnd = start <= end ? end : start;
        return { ...t, start: actualStart, end: actualEnd };
      });
  }, [todos]);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>{monthYearStr}</h2>
        <div className="calendar-nav">
          <button onClick={prevMonth}><ChevronLeft size={20} /></button>
          <button onClick={goToToday} className="today-btn">Today</button>
          <button onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="calendar-grid">
        <div className="calendar-day-names">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="calendar-body">
          {weeks.map((week, wIdx) => {
            const weekStart = week[0];
            const weekEnd = week[6];

            // Filter events for this week
            const weekEvents = processedTodos.filter(t => t.start <= weekEnd && t.end >= weekStart);
            
            // Map to startIdx and endIdx
            const mappedEvents = weekEvents.map(t => {
               const sIdx = t.start < weekStart ? 0 : Math.floor((t.start.getTime() - weekStart.getTime()) / (1000 * 3600 * 24));
               const eIdx = t.end > weekEnd ? 6 : Math.floor((t.end.getTime() - weekStart.getTime()) / (1000 * 3600 * 24));
               
               const isContinuesLeft = t.start < weekStart;
               const isContinuesRight = t.end > weekEnd;

               return { todo: t, sIdx, eIdx, length: eIdx - sIdx + 1, isContinuesLeft, isContinuesRight };
            });

            // Sort: startIdx asc, length desc
            mappedEvents.sort((a, b) => a.sIdx - b.sIdx || b.length - a.length);

            // Pack slots
            const slots: (any | null)[][] = Array.from({ length: 7 }, () => []);
            const eventLayouts: any[] = [];
            
            mappedEvents.forEach(evt => {
               let s = 0;
               while (true) {
                 let canFit = true;
                 for (let i = evt.sIdx; i <= evt.eIdx; i++) {
                   if (slots[i][s] !== undefined) {
                     canFit = false;
                     break;
                   }
                 }
                 if (canFit) {
                   for (let i = evt.sIdx; i <= evt.eIdx; i++) {
                     slots[i][s] = evt;
                   }
                   eventLayouts.push({ ...evt, slot: s });
                   break;
                 }
                 s++;
               }
            });

            // For rendering overflow, we only show up to slot 2 (0, 1, 2 = 3 items).
            const overflowCounts = [0, 0, 0, 0, 0, 0, 0];
            const visibleLayouts = eventLayouts.filter(l => {
              if (l.slot < 3) return true;
              for (let i = l.sIdx; i <= l.eIdx; i++) overflowCounts[i]++;
              return false;
            });

            return (
              <div key={wIdx} className="calendar-week">
                <div className="calendar-week-bg">
                  {week.map((day, dIdx) => {
                    const isToday = day.getTime() === toLocalDate(new Date().toISOString()).getTime();
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    return (
                      <div key={dIdx} className={`calendar-day-bg ${!isCurrentMonth ? 'out-of-month' : ''}`}>
                        <div className={`day-number ${isToday ? 'today' : ''}`}>{day.getDate()}</div>
                        {overflowCounts[dIdx] > 0 && (
                           <div className="overflow-indicator">+{overflowCounts[dIdx]}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="calendar-week-events">
                  {visibleLayouts.map((l, i) => {
                    const color = PRIORITY_COLORS[l.todo.priority] || PRIORITY_COLORS.medium;
                    const textColor = (l.todo.priority === 'low' || l.todo.priority === 'medium') ? '#000000' : '#ffffff';
                    
                    const leftMargin = l.isContinuesLeft ? 0 : 4;
                    const rightMargin = l.isContinuesRight ? 0 : 4;
                    
                    let classes = "calendar-event-bar";
                    if (l.isContinuesLeft) classes += " continues-left";
                    if (l.isContinuesRight) classes += " continues-right";
                    if (l.todo.completed) classes += " completed-event";

                    return (
                      <div 
                        key={i} 
                        className={classes}
                        style={{
                          left: `calc((100% / 7) * ${l.sIdx} + ${leftMargin}px)`,
                          width: `calc((100% / 7) * ${l.length} - ${leftMargin + rightMargin}px)`,
                          top: `${28 + l.slot * 24}px`,
                          backgroundColor: color,
                          color: textColor
                        }}
                        title={l.todo.title}
                      >
                        {l.todo.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
