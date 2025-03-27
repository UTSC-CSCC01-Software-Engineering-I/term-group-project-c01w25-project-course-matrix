import { Event, Timetable } from "@/utils/type-utils";

export function parseEvent(id: number, event: Event, calendarId: string) {
  return {
    id: id,
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
    calendarId: calendarId,
  };
}

export function sortTimetablesComparator(a: Timetable, b: Timetable) {
  if (a.favorite == b.favorite)
    return b?.updated_at.localeCompare(a?.updated_at);
  if (a.favorite) return -1;
  if (b.favorite) return 1;
  return 0;
}