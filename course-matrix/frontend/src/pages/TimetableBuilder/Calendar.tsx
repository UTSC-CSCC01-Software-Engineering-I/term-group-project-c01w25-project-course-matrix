import { ScheduleXCalendar } from "@schedule-x/react";
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  viewWeek,
} from "@schedule-x/calendar";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import "@schedule-x/theme-default/dist/index.css";
import { Button } from "@/components/ui/button";

function Calendar({ courseEvents, userEvents }) {
  let index = 1;
  const courseEventsParsed = courseEvents.map(
    (event: {
      event_name: string;
      event_date: string;
      event_start: string;
      event_end: string;
    }) => ({
      id: index++,
      title: event.event_name,
      start:
        event.event_date +
        " " +
        event.event_start.split(":")[0] +
        ":" +
        event.event_start.split(":")[1],
      end:
        event.event_date +
        " " +
        event.event_end.split(":")[0] +
        ":" +
        event.event_end.split(":")[1],
      calendarId: "courseEvent",
    }),
  );
  const userEventsParsed = userEvents.map(
    (event: {
      event_name: string;
      event_date: string;
      event_start: string;
      event_end: string;
    }) => ({
      id: index++,
      title: event.event_name,
      start:
        event.event_date +
        " " +
        event.event_start.split(":")[0] +
        ":" +
        event.event_start.split(":")[1],
      end:
        event.event_date +
        " " +
        event.event_end.split(":")[0] +
        ":" +
        event.event_end.split(":")[1],
      calendarId: "userEvent",
    }),
  );

  const calendar = createCalendar({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    defaultView: viewWeek.name,
    events: [...courseEventsParsed, ...userEventsParsed],
    calendars: {
      courseEvent: {
        colorName: "courseEvent",
        lightColors: {
          main: "#1c7df9",
          container: "#d2e7ff",
          onContainer: "#002859",
        },
        darkColors: {
          main: "#c0dfff",
          onContainer: "#dee6ff",
          container: "#426aa2",
        },
      },
    },
    plugins: [createDragAndDropPlugin(), createEventModalPlugin()],
  });

  return (
    <div>
      <h1 className="text-4xl flex flex-row justify-between font-medium tracking-tight mb-8">
        <div>Your Timetable</div>
        <Button size="sm">Save as copy</Button>
      </h1>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}

export default Calendar;
