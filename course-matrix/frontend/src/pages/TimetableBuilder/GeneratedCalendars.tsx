import { Spinner } from "@/components/ui/spinner";
import { TimetableGenerateResponseModel } from "@/models/models";
import { ScheduleXCalendar } from "@schedule-x/react";
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  viewWeek,
} from "@schedule-x/calendar";
import { Event } from "@/utils/type-utils";
import {
  getSemesterStartAndEndDates,
  getSemesterStartAndEndDatesPlusOneWeek,
} from "@/utils/semester-utils";
import { courseEventStyles } from "@/constants/calendarConstants";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import React, { useEffect, useRef, useState } from "react";
import { useGetOfferingEventsQuery } from "@/api/offeringsApiSlice";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useNavigate } from "react-router-dom";
import { useCreateTimetableMutation } from "@/api/timetableApiSlice";
import { useCreateEventMutation } from "@/api/eventsApiSlice";
import { useCreateRestrictionMutation } from "@/api/restrictionsApiSlice";
import { TimetableForm } from "@/models/timetable-form";
import { set } from "zod";
import TimetableErrorDialog from "./TimetableErrorDialog";

interface GeneratedCalendarsProps {
  setShowLoadingPage: (_: boolean) => void;
  setIsGeneratingTimetables: (_: boolean) => void;
  semester: string;
  generatedTimetables?: TimetableGenerateResponseModel;
  restrictions: TimetableForm["restrictions"];
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

export const GeneratedCalendars = React.memo<GeneratedCalendarsProps>(
  ({
    setShowLoadingPage,
    setIsGeneratingTimetables,
    semester,
    generatedTimetables,
    restrictions,
  }) => {
    if (!generatedTimetables) {
      return (
        <div className="flex flex-col items-center w-full text-xl gap-8 font-medium">
          <span>Generating...</span> <Spinner size="large" />
        </div>
      );
    }
    const timetableTitleRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Current timetable we are viewing
    const [currentTimetableIndex, setCurrentTimetableIndex] = useState(0);

    const currentTimetableOfferings =
      generatedTimetables.schedules[currentTimetableIndex];
    const numberOfTimetables = generatedTimetables.schedules.length;

    const semesterStartDate = getSemesterStartAndEndDates(semester).start;
    const { start: semesterStartDatePlusOneWeek, end: semesterEndDate } =
      getSemesterStartAndEndDatesPlusOneWeek(semester);

    const { data: courseEventsData, isLoading } = useGetOfferingEventsQuery({
      offering_ids: currentTimetableOfferings
        ?.map((offering) => offering.id)
        .join(","),
      semester_start_date: semesterStartDate,
      semester_end_date: semesterEndDate,
    }) as { data: Event[]; isLoading: boolean };

    const [createTimetable] = useCreateTimetableMutation();
    const [createEvent] = useCreateEventMutation();
    const [createRestriction] = useCreateRestrictionMutation();

    const courseEventsParsed =
      courseEventsData?.map((event, index) =>
        parseEvent(index + 1, event, "courseEvent"),
      ) ?? [];

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      for (const offering of currentTimetableOfferings) {
        const offeringId = offering.id;
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
          max_gap: restriction.maxGap,
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
      events: [...courseEventsParsed],
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

    useEffect(() => {
      setCurrentTimetableIndex(0);
    }, [generatedTimetables])

    return (
      <>
        <div>
          <div className="flex flex-row justify-between mb-8 items-center">
            <h1 className="text-xl  font-medium tracking-tight">
              Generated Timetables (
              {generatedTimetables ? generatedTimetables?.schedules?.length : 0}
              )
            </h1>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsGeneratingTimetables(false)}
              >
                Cancel Generating
              </Button>
              <TimetableErrorDialog
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => {}}>
                    Save Timetable
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
            </div>
          </div>
          {isLoading ? (
            <Spinner />
          ) : (
            <ScheduleXCalendar calendarApp={calendar} />
          )}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentTimetableIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentTimetableIndex === 0}
                  />
                </PaginationItem>
                {Array.from({ length: numberOfTimetables }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => setCurrentTimetableIndex(index)}
                      isActive={currentTimetableIndex === index}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentTimetableIndex((prev) =>
                        Math.min(numberOfTimetables - 1, prev + 1),
                      )
                    }
                    disabled={currentTimetableIndex === numberOfTimetables - 1}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </>
    );
  },
);
