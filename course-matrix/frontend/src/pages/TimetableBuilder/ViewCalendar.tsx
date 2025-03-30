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
import { Event, TimetableEvents } from "@/utils/type-utils";
import {
  getSemesterStartAndEndDates,
  getSemesterStartAndEndDatesPlusOneWeek,
} from "@/utils/semester-utils";
import { courseEventStyles } from "@/constants/calendarConstants";
import { parseEvent } from "@/utils/calendar-utils";
import { useGetUsernameFromUserIdQuery } from "@/api/authApiSlice";
import { Spinner } from "@/components/ui/spinner";
import { SemesterIcon } from "@/components/semester-icon";

interface ViewCalendarProps {
  user_id: string;
  calendar_id: number;
  timetable_title: string;
  semester: string;
  show_fancy_header: boolean;
}

const ViewCalendar = React.memo<ViewCalendarProps>(
  ({ user_id, calendar_id, timetable_title, semester, show_fancy_header }) => {
    const { data: usernameData } = useGetUsernameFromUserIdQuery(user_id, {
      skip: calendar_id === -1,
    });
    const username = usernameData
      ? usernameData.trim().length > 0
        ? usernameData
        : "John Doe"
      : "John Doe";

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

    const isLoading = isSharedEventsLoading;

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

    return isLoading ? (
      <Spinner />
    ) : (
      <div>
        {!show_fancy_header && (
          <h1 className="text-2xl flex justify-evenly font-medium tracking-tight mb-4">
            <div className="flex items-center gap-2">
              <SemesterIcon semester={semester} size={18} />
              {timetable_title}
            </div>
          </h1>
        )}
        {show_fancy_header && (
          <>
            <h1 className="text-xl text-center justify-between font-medium tracking-tight mb-4">
              You are viewing{" "}
              <span className="text-green-500">{username ?? "John Doe"}'s</span>{" "}
              timetable named{" "}
              <span className="text-green-500">{timetable_title}</span> for{" "}
              <span className="text-green-500">{semester}</span>
            </h1>
            <div className="text-sm justify-between tracking-tight mb-4">
              <b>Courses:</b>{" "}
              {courses.length === 0 && (
                <span className="text-sm text-red-500">
                  This timetable has no courses
                </span>
              )}
              {courses.map((course) => (
                <span className="text-blue-500 mr-2" key={course}>
                  {course}{" "}
                  <span className="text-gray-500">
                    ({(courseToMeetingSectionMap.get(course) ?? []).join(", ")})
                  </span>
                </span>
              ))}
            </div>
          </>
        )}
        <ScheduleXCalendar calendarApp={calendar} />
      </div>
    );
  },
);

export default ViewCalendar;
