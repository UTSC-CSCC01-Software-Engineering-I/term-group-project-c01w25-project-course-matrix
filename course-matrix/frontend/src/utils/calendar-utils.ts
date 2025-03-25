import { Event } from "@/utils/type-utils";

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
