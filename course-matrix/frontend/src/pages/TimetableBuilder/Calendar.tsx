import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
 
import '@schedule-x/theme-default/dist/index.css'
import { useEffect, useState } from 'react'
 
function Calendar() {
  const eventsService = useState(() => createEventsServicePlugin())[0]
 
  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: [
      {
        id: '1',
        title: 'Event 1',
        start: '2025-03-05',
        end: '2023-03-07',
      },
      {
        id: '2',
        title: 'Event 2',
        start: '2025-02-26',
        end: '2025-02-28',
      },
      {
        id: '3',
        title: 'Event 3',
        start: '2025-02-24 07:00',
        end: '2025-02-24 09:00',
      },
    ],
    plugins: [eventsService]
  })
 
  useEffect(() => {
    // get all events
    eventsService.getAll()
  }, [eventsService])
 
  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}
 
export default Calendar