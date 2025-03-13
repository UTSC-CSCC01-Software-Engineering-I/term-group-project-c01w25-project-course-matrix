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
import { UseFormReturn } from "react-hook-form";
import { TimetableFormSchema } from "@/models/timetable-form";
import {
  useGetTimetablesQuery,
	useCreateTimetableMutation,
	useDeleteTimetableMutation,
} from "@/api/timetableApiSlice";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useGetNumberOfCourseSectionsQuery } from "@/api/coursesApiSlice";
import { useCreateEventMutation } from "@/api/eventsApiSlice";
import { off } from "process";
import { useSearchParams } from "react-router-dom";
import { parse } from "path";

interface Event {
	event_name: string;
	event_date: string;
	event_start: string;
	event_end: string;
}

interface CalendarProps {
	semesterStartDate: string;
	semesterEndDate: string;
	courseEvents: Event[];
	userEvents: Event[];
	form: UseFormReturn<z.infer<typeof TimetableFormSchema>>;
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

function Calendar({
	semesterStartDate,
	semesterEndDate,
	courseEvents,
	userEvents,
	form,
}: CalendarProps) {
	const [queryParams] = useSearchParams();
	const isEditingTimetable = queryParams.has("edit");
	const editingTimetableId = queryParams.get("edit");

  const { data: timetablesData } = useGetTimetablesQuery();
	const [createTimetable] = useCreateTimetableMutation();
	const [createEvent] = useCreateEventMutation();
	const [deleteTimetable] = useDeleteTimetableMutation();

	let index = 1;
	const courseEventsParsed = courseEvents.map((event) =>
		parseEvent(index++, event, "courseEvent")
	);
	const userEventsParsed = userEvents.map((event) =>
		parseEvent(index++, event, "userEvent")
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
		weekOptions: {
			gridHeight: 1000,
		},
	});

	const offeringIds = form.watch("offeringIds") ?? [];
	const semester = form.watch("semester") ?? "";
	const [timetableTitle, setTimetableTitle] = useState("");

	const selectedCourses = form.getValues("courses") ?? [];
	const selectedCourseIds = selectedCourses.map((course) => course.id);
	const { data: numberOfSectionsData } = useGetNumberOfCourseSectionsQuery({
		course_ids: selectedCourseIds.join(","),
		semester: semester,
	});
	const totalNumberOfSections =
		numberOfSectionsData?.totalNumberOfCourseSections ?? 0;

    console.log("totalNumberOfSections", totalNumberOfSections);
    console.log("offerings length", offeringIds.length);

	const allOfferingSectionsHaveBeenSelected =
		offeringIds.length === totalNumberOfSections;

  useEffect(() => {
    if (!isEditingTimetable) {
      return;
    }
    setTimetableTitle(timetablesData?.find((timetable) => timetable.id === parseInt(editingTimetableId ?? '0')).timetable_title ?? "");
  }, [timetablesData, editingTimetableId, timetableTitle, isEditingTimetable]);

	const handleCreate = async () => {
		// Create timetable
		const { data, error } = await createTimetable({
			timetable_title: timetableTitle,
			semester: semester,
		});
		if (error) {
			console.error(error);
		}
    
		// Create course events for the newly created timetable
		const timetableId = data[0]?.id;
		const promises = offeringIds.map(async (offeringId) => {
			const { error: offeringError } = await createEvent({
				calendar_id: timetableId,
				offering_id: offeringId,
				semester_start_date: semesterStartDate,
				semester_end_date: semesterEndDate,
			});
			if (offeringError) {
				console.error(offeringError);
			}
		});
		await Promise.all(promises);

		// Refresh the page and redirect to the home page to see the newly created timetable
		window.location.reload();
		window.location.href = "/home";
	};

	const handleUpdate = async () => {
		// Delete the existing timetable
    const { error: deleteError } = await deleteTimetable(editingTimetableId);
    if (deleteError) {
      console.error(deleteError);
    }

    // Create new timetable and create course events for the newly created timetable
    await handleCreate();
	};

	return (
		<div>
			<h1 className="text-4xl flex flex-row justify-between font-medium tracking-tight mb-8">
				<div>Your Timetable</div>
				{!isEditingTimetable ? (
					<Dialog>
						{!allOfferingSectionsHaveBeenSelected && (
							<p className="text-sm text-red-500 pr-2">
								Please select all LEC/TUT/PRA sections for your courses in order
								to save your timetable.
							</p>
						)}
						<DialogTrigger asChild>
							<Button size="sm" disabled={!allOfferingSectionsHaveBeenSelected}>
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
								onChange={(e) => setTimetableTitle(e.target.value.trim())}
							/>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="secondary">Cancel</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button
										onClick={handleCreate}
										disabled={timetableTitle === ""}
									>
										Save
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				) : (
					<Button size="sm" disabled={!allOfferingSectionsHaveBeenSelected} onClick={handleUpdate}>
						Update Timetable
					</Button>
				)}
			</h1>
			<ScheduleXCalendar calendarApp={calendar} />
		</div>
	);
}

export default Calendar;
