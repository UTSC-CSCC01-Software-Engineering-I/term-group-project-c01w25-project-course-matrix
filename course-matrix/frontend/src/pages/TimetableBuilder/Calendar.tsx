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
  useUpdateTimetableMutation,
} from "@/api/timetableApiSlice";
import {
  useGetRestrictionsQuery,
  useCreateRestrictionMutation,
  useDeleteRestrictionMutation,
} from "@/api/restrictionsApiSlice";
import { z } from "zod";
import React, { useEffect, useRef, useState } from "react";
import { useGetNumberOfCourseSectionsQuery } from "@/api/coursesApiSlice";
import {
  useCreateEventMutation,
  useGetEventsQuery,
  useDeleteEventMutation,
  useUpdateEventMutation,
} from "@/api/eventsApiSlice";
import { useGetOfferingsQuery } from "@/api/offeringsApiSlice";
import { useGetOfferingEventsQuery } from "@/api/offeringsApiSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Event,
  Timetable,
  TimetableEvents,
  Restriction,
  Offering,
} from "@/utils/type-utils";
import { TimetableForm } from "@/models/timetable-form";
import {
  getSemesterStartAndEndDates,
  getSemesterStartAndEndDatesPlusOneWeek,
} from "@/utils/semester-utils";
import { courseEventStyles } from "@/constants/calendarConstants";
import TimetableErrorDialog from "./TimetableErrorDialog";

interface CalendarProps {
  setShowLoadingPage: React.Dispatch<React.SetStateAction<boolean>>;
  isChoosingSectionsManually: boolean;
  semester: string;
  selectedCourses: TimetableForm["courses"];
  newOfferingIds: number[];
  restrictions: TimetableForm["restrictions"];
  header?: string;
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
  ({
    setShowLoadingPage,
    semester,
    selectedCourses,
    newOfferingIds,
    restrictions,
    isChoosingSectionsManually,
    header = "Your Timetable",
  }) => {
    const form = useForm<z.infer<typeof TimetableFormSchema>>();

    const navigate = useNavigate();
    const [queryParams] = useSearchParams();
    const isEditingTimetable = queryParams.has("edit");
    const editingTimetableId = parseInt(queryParams.get("edit") ?? "0");

    const [createTimetable] = useCreateTimetableMutation();
    const [updateTimetable] = useUpdateTimetableMutation();
    const [createEvent] = useCreateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const [createRestriction] = useCreateRestrictionMutation();
    const [deleteRestriction] = useDeleteRestrictionMutation();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(
      null,
    );
    const semesterStartDate = getSemesterStartAndEndDates(semester).start;
    const { start: semesterStartDatePlusOneWeek, end: semesterEndDate } =
      getSemesterStartAndEndDatesPlusOneWeek(semester);

    const { data: offeringsData } = useGetOfferingsQuery({}) as {
      data: Offering[];
    };

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

    const { data: timetableEvents } = useGetEventsQuery(editingTimetableId, {
      skip: !isEditingTimetable,
    }) as {
      data: TimetableEvents;
    };

    const oldOfferingIds = [
      ...new Set(
        timetableEvents?.courseEvents.map((event) => event.offering_id),
      ),
    ].sort((a, b) => a - b);

    const { data: restrictionsData } = useGetRestrictionsQuery(
      editingTimetableId,
      {
        skip: !isEditingTimetable,
      },
    ) as {
      data: Restriction[];
    };

    const oldRestrictions = restrictionsData ?? [];

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

    const totalNumberOfRequiredSections = !selectedCourses.length
      ? 0
      : (numberOfSectionsData?.totalNumberOfCourseSections ?? 0);
    const totalNumberOfSelectedSections = [
      ...new Set(
        offeringsData
          ?.filter((offering) => newOfferingIds.includes(offering.id))
          .map(
            (offering) =>
              `${offering.code} ${offering.offering} ${offering.meeting_section}`,
          ),
      ),
    ].length;
    const allOfferingSectionsHaveBeenSelected =
      totalNumberOfSelectedSections === totalNumberOfRequiredSections;

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
        const errorData = (error as { data?: { error?: string } }).data;
        setErrorMessage(errorData?.error ?? "Unknown error occurred");
        return;
      }
      setShowLoadingPage(true);
      // Create course events for the newly created timetable
      const newTimetableId = data[0].id;
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
      for (const restriction of restrictions) {
        const restrictionObject = {
          calendar_id: newTimetableId,
          type: restriction.type,
          days: restriction.days,
          start_time: restriction.startTime,
          end_time: restriction.endTime,
          disabled: restriction.disabled,
          num_days: restriction.numDays,
          max_gap: restriction.maxGap,
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
      const timetableTitle = timetableTitleRef.current?.value ?? "";
      setShowLoadingPage(true);

      const offeringIdsToDelete = oldOfferingIds.filter(
        (offeringId) => !newOfferingIds.includes(offeringId),
      );
      const offeringIdsToAdd = newOfferingIds.filter(
        (offeringId) => !oldOfferingIds.includes(offeringId),
      );
      if (offeringIdsToAdd.length === 0 && offeringIdsToDelete.length === 0) {
        setUpdateErrorMessage("You have made no changes to the timetable!");
        setShowLoadingPage(false);
        return;
      }
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
      // Delete restrictions
      for (const restriction of oldRestrictions) {
        const { error: deleteError } = await deleteRestriction({
          id: restriction.id,
          calendar_id: editingTimetableId,
        });
        if (deleteError) {
          console.error(deleteError);
        }
      }
      // Create restrictions
      for (const restriction of restrictions) {
        const restrictionObject = {
          calendar_id: editingTimetableId,
          type: restriction.type,
          days: restriction.days,
          start_time: restriction.startTime,
          end_time: restriction.endTime,
          disabled: restriction.disabled,
          num_days: restriction.numDays,
          max_gap: restriction.maxGap,
        };
        const { error: restrictionError } =
          await createRestriction(restrictionObject);
        if (restrictionError) {
          console.error(restrictionError);
        }
      }

      try {
        await updateTimetable({
          id: editingTimetableId,
          timetable_title: timetableTitle,
        }).unwrap();
      } catch (error) {
        setUpdateErrorMessage("You have made no changes to the timetable");
        setShowLoadingPage(false);
        return;
      }
      navigate("/home");
    };

    return (
      <div>
        <h1 className="text-2xl flex flex-row justify-between font-medium tracking-tight mb-4">
          <div>{header}</div>
          <TimetableErrorDialog
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />
          {!isEditingTimetable ? (
            <Dialog>
              {isChoosingSectionsManually &&
                !allOfferingSectionsHaveBeenSelected && (
                  <p className="text-sm text-red-500 pr-2">
                    Please select all LEC/TUT/PRA sections for your courses in
                    order to save your timetable.
                  </p>
                )}
              <DialogTrigger asChild>
                {isChoosingSectionsManually && (
                  <Button
                    size="sm"
                    disabled={!allOfferingSectionsHaveBeenSelected}
                  >
                    Create Timetable
                  </Button>
                )}
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
            <div>
              <div className="flex gap-2">
                {isChoosingSectionsManually &&
                  !allOfferingSectionsHaveBeenSelected && (
                    <p className="text-sm text-red-500 pr-2">
                      Please select all LEC/TUT/PRA sections for your courses in
                      order to save your timetable.
                    </p>
                  )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/home")}
                >
                  Cancel Editing
                </Button>
                <Button
                  size="sm"
                  disabled={!allOfferingSectionsHaveBeenSelected}
                  onClick={handleUpdate}
                >
                  Update Timetable
                </Button>
              </div>
              <div className="mt-1 text-sm text-red-500 font-bold">
                {" "}
                {updateErrorMessage}{" "}
              </div>
            </div>
          )}
        </h1>
        <ScheduleXCalendar calendarApp={calendar} />
      </div>
    );
  },
);

export default Calendar;
