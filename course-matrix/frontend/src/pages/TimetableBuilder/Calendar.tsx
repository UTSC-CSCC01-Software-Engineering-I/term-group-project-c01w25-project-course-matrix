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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { TimetableFormSchema } from "@/models/timetable-form";
import {
  useGetTimetablesQuery,
  useCreateTimetableMutation,
} from "@/api/timetableApiSlice";
import { useCreateRestrictionMutation } from "@/api/restrictionsApiSlice";
import { z } from "zod";
import React, { useEffect, useRef } from "react";
import { useGetNumberOfCourseSectionsQuery } from "@/api/coursesApiSlice";
import {
  useCreateEventMutation,
  useGetEventsQuery,
  useDeleteEventMutation,
} from "@/api/eventsApiSlice";
import { useGetOfferingEventsQuery } from "@/api/offeringsApiSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Event, Timetable, TimetableEvents } from "@/utils/type-utils";
import { TimetableForm } from "@/models/timetable-form";
import { getSemesterStartAndEndDates } from "@/utils/semester-utils";

interface CalendarProps {
  semester: string;
  selectedCourses: TimetableForm["courses"];
  newOfferingIds: number[];
}

function parseEvent(id: number, event: Event, calendarId: string) {
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

const Calendar = React.memo<CalendarProps>(
  ({ semester, selectedCourses, newOfferingIds }) => {
    const form = useForm<z.infer<typeof TimetableFormSchema>>();

    const navigate = useNavigate();
    const [queryParams] = useSearchParams();
    const isEditingTimetable = queryParams.has("edit");
    const editingTimetableId = parseInt(queryParams.get("edit") ?? "0");

    const [createTimetable] = useCreateTimetableMutation();
    const [createEvent] = useCreateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const [createRestriction] = useCreateRestrictionMutation();

    const semesterStartDate = getSemesterStartAndEndDates(semester).start;
    const semesterEndDate = getSemesterStartAndEndDates(semester).end;

    const { data: courseEventsData } = useGetOfferingEventsQuery({
      offering_ids: newOfferingIds.join(","),
      semester_start_date: semesterStartDate,
      semester_end_date: semesterEndDate,
    }) as { data: Event[] };

    const { data: timetablesData } = useGetTimetablesQuery() as {
      data: Timetable[];
    };

    const courseEvents = courseEventsData ?? [];
    const userEvents: Event[] = [];

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
      selectedDate: semesterStartDate,
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
      weekOptions: {
        gridHeight: 1000,
      },
    });

    const { data: oldTimetableEvents } = useGetEventsQuery(editingTimetableId, {
      skip: !isEditingTimetable,
    }) as {
      data: TimetableEvents;
    };
    const oldOfferingIds = [
      ...new Set(
        oldTimetableEvents?.courseEvents.map((event) => event.offering_id),
      ),
    ].sort((a, b) => a - b);

    const timetableTitleRef = useRef<HTMLInputElement>(null);
    const selectedCourseIds = selectedCourses.map((course) => course.id);

    const { data: numberOfSectionsData } = useGetNumberOfCourseSectionsQuery(
      {
        course_ids: selectedCourseIds.join(","),
        semester: semester,
      },
      {
        skip: !selectedCourses.length,
      },
    );

    const totalNumberOfSections = !selectedCourses.length
      ? 0
      : (numberOfSectionsData?.totalNumberOfCourseSections ?? 0);

    const allOfferingSectionsHaveBeenSelected =
      newOfferingIds.length === totalNumberOfSections;

    console.log("TOTAL NUMBER OF SECTIONS", totalNumberOfSections);
    console.log("NEW OFFERING IDS", newOfferingIds);

    useEffect(() => {
      if (!isEditingTimetable) {
        return;
      }
    }, [timetablesData, editingTimetableId, isEditingTimetable]);

    const handleCreate = async () => {
      const timetableTitle = timetableTitleRef.current?.value ?? "";

      // Create timetable
      const { data, error } = await createTimetable({
        timetable_title: timetableTitle,
        semester: semester,
      });
      if (error) {
        console.error(error);
        return;
      }

      // Create course events for the newly created timetable
      const newTimetableId = data?.id;
      for (const offeringId of newOfferingIds) {
        const { error: offeringError } = await createEvent({
          calendar_id: newTimetableId,
          offering_id: offeringId,
          semester_start_date: semesterStartDate,
          semester_end_date: semesterEndDate,
        });
        if (offeringError) {
          console.error(offeringError);
        }
      }

      // Create restrictions for the newly created timetable
      const restrictions = form.getValues("restrictions") ?? [];
      for (const restriction of restrictions) {
        const restrictionObject = {
          calendar_id: newTimetableId,
          type: restriction.type,
          days: restriction.days,
          start_time: restriction.startTime,
          end_time: restriction.endTime,
          disabled: restriction.disabled,
          num_days: restriction.numDays,
        };
        const { error: restrictionError } =
          await createRestriction(restrictionObject);
        if (restrictionError) {
          console.error(restrictionError);
        }
      }

      // Redirect to the home page to see the newly created timetable
      navigate("/home");
    };

    const handleUpdate = async () => {
      const offeringIdsToDelete = oldOfferingIds.filter(
        (offeringId) => !newOfferingIds.includes(offeringId),
      );
      const offeringIdsToAdd = newOfferingIds.filter(
        (offeringId) => !oldOfferingIds.includes(offeringId),
      );

      // Delete course events
      for (const offeringId of offeringIdsToDelete) {
        const { error: deleteError } = await deleteEvent({
          id: 1,
          calendar_id: editingTimetableId,
          event_type: "course",
          offering_id: offeringId,
        });
        if (deleteError) {
          console.error(deleteError);
        }
      }

      // Create course events
      for (const offeringId of offeringIdsToAdd) {
        const { error: createError } = await createEvent({
          calendar_id: editingTimetableId,
          offering_id: offeringId,
          semester_start_date: semesterStartDate,
          semester_end_date: semesterEndDate,
        });
        if (createError) {
          console.error(createError);
        }
      }
      form.setValue("offeringIds", newOfferingIds);

      navigate("/home");
    };

    return (
      <div>
        <h1 className="text-4xl flex flex-row justify-between font-medium tracking-tight mb-8">
          <div>Your Timetable</div>
          {!isEditingTimetable ? (
            <Dialog>
              {!allOfferingSectionsHaveBeenSelected && (
                <p className="text-sm text-red-500 pr-2">
                  Please select all LEC/TUT/PRA sections for your courses in
                  order to save your timetable.
                </p>
              )}
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={!allOfferingSectionsHaveBeenSelected}
                >
                  Create Timetable
                </Button>
              </DialogTrigger>
              <DialogContent className="gap-5">
                <DialogHeader>
                  <DialogTitle>Timetable Creation</DialogTitle>
                  <DialogDescription>
                    What would you like to name your timetable?
                  </DialogDescription>
                </DialogHeader>
                <Label htmlFor="timetableName">Timetable Name</Label>
                <Input
                  id="timetableName"
                  placeholder="Placeholder name"
                  ref={timetableTitleRef}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      onClick={handleCreate}
                      disabled={timetableTitleRef.current?.value === ""}
                    >
                      Save
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              {!allOfferingSectionsHaveBeenSelected && (
                <p className="text-sm text-red-500 pr-2">
                  Please select all LEC/TUT/PRA sections for your courses in
                  order to save your timetable.
                </p>
              )}
              <Button
                size="sm"
                disabled={!allOfferingSectionsHaveBeenSelected}
                onClick={handleUpdate}
              >
                Update Timetable
              </Button>
            </>
          )}
        </h1>
        <ScheduleXCalendar calendarApp={calendar} />
      </div>
    );
  },
);

export default Calendar;
