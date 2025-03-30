import { ScheduleXCalendar } from "@schedule-x/react";
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  viewWeek,
} from "@schedule-x/calendar";
// import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import "@schedule-x/theme-default/dist/index.css";
import React from "react";
import { useGetSharedEventsQuery } from "@/api/eventsApiSlice";
import { Event, TimetableEvents, Restriction } from "@/utils/type-utils";
import {
  getSemesterStartAndEndDates,
  getSemesterStartAndEndDatesPlusOneWeek,
} from "@/utils/semester-utils";
import { courseEventStyles } from "@/constants/calendarConstants";
import { parseEvent } from "@/utils/calendar-utils";
import { useGetSharedRestrictionsQuery } from "@/api/sharedApiSlice";
import { formatTime } from "@/utils/format-date-time";
import LoadingPage from "../Loading/LoadingPage";

interface SharedCalendarProps {
  user_id: string;
  user_username: string;
  calendar_id: number;
  timetable_title: string;
  semester: string;
}

const SharedCalendar = React.memo<SharedCalendarProps>(
  ({ user_id, user_username, calendar_id, timetable_title, semester }) => {
    const semesterStartDate = getSemesterStartAndEndDates(semester).start;
    const { start: semesterStartDatePlusOneWeek, end: semesterEndDate } =
      getSemesterStartAndEndDatesPlusOneWeek(semester);

    const { data: sharedEventsData, isLoading: isSharedEventsLoading } =
      useGetSharedEventsQuery(
        { user_id, calendar_id },
        { skip: !user_id || !calendar_id },
      ) as {
        data: TimetableEvents;
        isLoading: boolean;
      };
    const sharedEvents = sharedEventsData as TimetableEvents;

    const { data: restrictionsData, isLoading: isRestrictionsLoading } =
      useGetSharedRestrictionsQuery(
        { user_id, calendar_id },
        { skip: !user_id || !calendar_id },
      ) as {
        data: Restriction[];
        isLoading: boolean;
      };
    const restrictions = restrictionsData ?? [];

    const isLoading = isSharedEventsLoading || isRestrictionsLoading;

    const courseEvents: Event[] = sharedEvents?.courseEvents ?? [];
    const userEvents: Event[] = sharedEvents?.userEvents ?? [];

    const courses = [
      ...new Set(
        courseEvents.map((event) => event.event_name.split("-")[0].trim()),
      ),
    ];
    const courseToMeetingSectionMap = new Map<string, string[]>();
    courseEvents.forEach((event) => {
      const course = event.event_name.split("-")[0].trim();
      const meetingSection = event.event_name.split("-")[1].trim();
      if (courseToMeetingSectionMap.has(course)) {
        const meetingSections = courseToMeetingSectionMap.get(course);
        if (meetingSections) {
          courseToMeetingSectionMap.set(course, [
            ...new Set([...meetingSections, meetingSection]),
          ]);
        }
      } else {
        courseToMeetingSectionMap.set(course, [meetingSection]);
      }
    });

    let index = 1;
    const courseEventsParsed = courseEvents.map((event) =>
      parseEvent(index++, event, "courseEvent"),
    );
    const userEventsParsed = userEvents.map((event) =>
      parseEvent(index++, event, "userEvent"),
    );

    const calendar = createCalendar({
      views: [
        createViewDay(),
        createViewWeek(),
        createViewMonthGrid(),
        createViewMonthAgenda(),
      ],
      firstDayOfWeek: 0,
      selectedDate: semesterStartDatePlusOneWeek,
      minDate: semesterStartDate,
      maxDate: semesterEndDate,
      defaultView: viewWeek.name,
      events: [...courseEventsParsed, ...userEventsParsed],
      calendars: {
        courseEvent: courseEventStyles,
      },
      plugins: [createEventModalPlugin()],
      weekOptions: {
        gridHeight: 600,
      },
      dayBoundaries: {
        start: "06:00",
        end: "21:00",
      },
      isResponsive: false,
    });

    const username =
      user_username.trim().length > 0 ? user_username : "John Doe";

    return isLoading ? (
      <LoadingPage />
    ) : (
      <div>
        <h1 className="text-xl text-center justify-between font-medium tracking-tight mb-4">
          You are viewing{" "}
          <span className="text-green-500">{username ?? "John Doe"}'s</span>{" "}
          timetable named{" "}
          <span className="text-green-500">{timetable_title}</span> for{" "}
          <span className="text-green-500">{semester}</span>
        </h1>
        <div className="text-sm justify-between tracking-tight mb-2">
          <b>Courses:</b>{" "}
          {courses.length === 0 && (
            <span className="text-sm text-red-500">
              This timetable has no courses
            </span>
          )}
          {courses.map((course) => (
            <span className="text-blue-500 mr-2" key={course}>
              {course}{" "}
              <span className="text-yellow-500">
                ({(courseToMeetingSectionMap.get(course) ?? []).join(", ")})
              </span>
            </span>
          ))}
        </div>
        <b className="text-sm">Restrictions: </b>
        {restrictions.length === 0 && (
          <span className="text-sm text-red-500">No restrictions applied</span>
        )}
        <div className="grid grid-rows-3 text-sm justify-between mb-4">
          {restrictions.map((restriction) => {
            const restrictedDays = JSON.parse(restriction.days)
              .map((day: string) => {
                if (day === "MO") return "Monday";
                if (day === "TU") return "Tuesday";
                if (day === "WE") return "Wednesday";
                if (day === "TH") return "Thursday";
                if (day === "FR") return "Friday";
                if (day === "SA") return "Saturday";
                if (day === "SU") return "Sunday";
                return "Unknown Day";
              })
              .join(", ");
            const restrictionText =
              restriction.type === "Max Gap"
                ? `${restriction.type} of ${restriction.max_gap} Hours on ${restriction.days}`
                : restriction.type === "Restrict Before"
                  ? `${restriction.type} ${formatTime(new Date(`2025-01-01T${restriction.end_time}.00Z`))} on ${restrictedDays}`
                  : restriction.type === "Restrict After"
                    ? `${restriction.type} ${formatTime(new Date(`2025-01-01T${restriction.start_time}.00Z`))} on ${restrictedDays}`
                    : restriction.type === "Restrict Between"
                      ? `${restriction.type} ${formatTime(new Date(`2025-01-01T${restriction.start_time}.00Z`))} and ${formatTime(new Date(`2025-01-01T${restriction.end_time}.00Z`))} on ${restrictedDays}`
                      : restriction.type === "Restrict Day"
                        ? `Restrict the days of ${restrictedDays}`
                        : restriction.type === "Days Off"
                          ? `Minimum of ${restriction.num_days} days off`
                          : "Unknown Restriction Applied";

            return (
              <div className="text-red-500" key={restriction.id}>
                {restrictionText}
              </div>
            );
          })}
        </div>
        <ScheduleXCalendar calendarApp={calendar} />
      </div>
    );
  },
);

export default SharedCalendar;
