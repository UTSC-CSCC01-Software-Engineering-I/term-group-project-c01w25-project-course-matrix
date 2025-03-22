import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RestrictionSchema,
  SemesterEnum,
  TimetableFormSchema,
  baseTimetableForm,
} from "@/models/timetable-form";
import { WandSparkles, X } from "lucide-react";
import { createContext, useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseSearch from "@/pages/TimetableBuilder/CourseSearch";
import CreateCustomSetting from "./CreateCustomSetting";
import { formatTime } from "@/utils/format-date-time";
import { FilterForm, FilterFormSchema } from "@/models/filter-form";
import { useGetCoursesQuery } from "@/api/coursesApiSlice";
import {
  useGenerateTimetableMutation,
  useGetTimetablesQuery,
} from "@/api/timetableApiSlice";
import { useGetEventsQuery } from "@/api/eventsApiSlice";
import { useGetOfferingsQuery } from "@/api/offeringsApiSlice";
import { useGetRestrictionsQuery } from "@/api/restrictionsApiSlice";
import { useDebounceValue } from "@/utils/useDebounce";
import SearchFilters from "./SearchFilters";
import Calendar from "./Calendar";
import {
  Offering,
  TimetableEvents,
  Timetable,
  Restriction,
} from "@/utils/type-utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import OfferingInfo from "./OfferingInfo";
import { Checkbox } from "@/components/ui/checkbox";
import { CourseModel, TimetableGenerateResponseModel } from "@/models/models";
import LoadingPage from "@/pages/Loading/LoadingPage";
import { GeneratedCalendars } from "./GeneratedCalendars";
import { Spinner } from "@/components/ui/spinner";

type FormContextType = UseFormReturn<z.infer<typeof TimetableFormSchema>>;
export const FormContext = createContext<FormContextType | null>(null);
const SEARCH_LIMIT = 1000;

/**
 * TimetableBuilder Component
 *
 * Allows users to build a personalized timetable by selecting courses, applying filters,
 * and setting restrictions. It integrates with `react-hook-form` for form management and fetches course data
 * dynamically using RTK Query.
 *
 * Features:
 * - **Course Selection**: Users can search for and select courses, ensuring no duplicates.
 * - **Semester Selection**: Dropdown selection for choosing the semester.
 * - **Custom Restrictions**: Allows users to define time-based restrictions for scheduling preferences.
 * - **Filters**: Users can apply advanced search filters to refine course selection.
 * - **Live Search**: Implements debounced search for optimized performance.
 * - **State Management**:
 *   - `isEditNameOpen`, `isCustomSettingsOpen`, `showFilters` for modal management.
 *   - `filters` for search filters.
 *   - `selectedCourses` and `enabledRestrictions` to track user selections.
 *
 * Hooks:
 * - `useForm` for managing form states (`form`, `filterForm`).
 * - `useEffect` to trigger API refetch on search input changes.
 * - `useDebounceValue` to prevent excessive API calls when searching.
 *
 * API Calls:
 * - Fetches course data using `useGetCoursesQuery`.
 * - Sends timetable creation request to `/api/timetable/create` (TODO).
 *
 * UI Components:
 * - `Form`, `Select`, `Input`, `Button` for structured form inputs.
 * - `CourseSearch` for searching and selecting courses.
 * - `CreateCustomSetting` for adding personalized restrictions.
 * - `SearchFilters` for filtering course results.
 *
 * @returns {JSX.Element} The rendered timetable builder.
 */

const TimetableBuilder = () => {
  const form = useForm<z.infer<typeof TimetableFormSchema>>({
    resolver: zodResolver(TimetableFormSchema),
    defaultValues: baseTimetableForm,
  });

  const filterForm = useForm<z.infer<typeof FilterFormSchema>>({
    resolver: zodResolver(FilterFormSchema),
  });

  const [queryParams] = useSearchParams();
  const isEditingTimetable = queryParams.has("edit");
  const timetableId = parseInt(queryParams.get("edit") || "0");

  const [showLoadingPage, setShowLoadingPage] = useState(isEditingTimetable);

  const selectedCourses = form.watch("courses") || [];
  const enabledRestrictions = form.watch("restrictions") || [];
  const searchQuery = form.watch("search");
  const debouncedSearchQuery = useDebounceValue(searchQuery, 250);
  const selectedSemester = form.watch("semester");
  const offeringIds = form.watch("offeringIds");

  // console.log("Selected courses", selectedCourses);
  // console.log("Enabled restrictions", enabledRestrictions);

  const [isCustomSettingsOpen, setIsCustomSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterForm | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isChoosingSectionsManually, setIsChoosingSectionsManually] =
    useState(isEditingTimetable);
  const [isGeneratingTimetables, setIsGeneratingTimetables] = useState(false);
  const [generatedTimetables, setGeneratedTimetables] =
    useState<TimetableGenerateResponseModel>();

  const noSearchAndFilter = () => {
    return !searchQuery && !filters;
  };

  // limit search number if no search query or filters for performance purposes.
  // Otherwise, limit is 10k, which effectively gets all results.
  const {
    data: coursesData,
    isLoading,
    refetch,
  } = useGetCoursesQuery({
    limit: noSearchAndFilter() ? SEARCH_LIMIT : 10000,
    search: debouncedSearchQuery || undefined,
    semester: selectedSemester,
    ...filters,
  });

  const [generateTimetable, { isLoading: isGenerateLoading }] =
    useGenerateTimetableMutation();

  const { data: allCoursesData } = useGetCoursesQuery({
    limit: 10000,
  }) as {
    data: CourseModel[];
  };

  const { data: offeringData } = useGetOfferingsQuery({}) as {
    data: Offering[];
  };
  const offerings = offeringData || [];
  const offeringIdToCourseIdMap = offerings.reduce(
    (acc, offering) => {
      acc[offering.id] = offering.course_id;
      return acc;
    },
    {} as Record<number, number>,
  );

  const { data: timetableEventsData } = useGetEventsQuery(timetableId, {
    skip: !isEditingTimetable,
  }) as {
    data: TimetableEvents;
  };

  const [loadedSemester, setLoadedSemester] = useState(false);
  const [loadedCourses, setLoadedCourses] = useState(false);
  const [loadedOfferingIds, setLoadedOfferingIds] = useState(false);
  const [loadedRestrictions, setLoadedRestrictions] = useState(false);

  const { data: restrictionsData } = useGetRestrictionsQuery(timetableId, {
    skip: !isEditingTimetable,
  }) as {
    data: Restriction[];
  };

  const { data: timetablesData } = useGetTimetablesQuery() as {
    data: Timetable[];
  };
  const timetables = timetablesData || [];
  const currentTimetableTitle = timetables.find(
    (timetable) => timetable.id === timetableId,
  )?.timetable_title;
  const currentTimetableSemester = timetables.find(
    (timetable) => timetable.id === timetableId,
  )?.semester;

  // Set the state variable courseEvents, and set the form values for 'offeringIds', 'courses', and 'restrictions'
  useEffect(() => {
    if (!loadedSemester && currentTimetableSemester) {
      form.setValue("semester", currentTimetableSemester);
      setLoadedSemester(true);
    }
    if (
      timetableEventsData &&
      coursesData &&
      allCoursesData &&
      offeringIdToCourseIdMap &&
      restrictionsData &&
      !loadedCourses &&
      !loadedOfferingIds &&
      !loadedRestrictions
    ) {
      const existingOfferingIds = [
        ...new Set(
          timetableEventsData?.courseEvents.map((event) => event.offering_id),
        ),
      ].sort((a, b) => a - b);
      form.setValue("offeringIds", existingOfferingIds);
      setLoadedOfferingIds(true);

      const existingCourseIds = [
        ...new Set(
          existingOfferingIds.map(
            (offeringId) => offeringIdToCourseIdMap[offeringId],
          ),
        ),
      ];
      const existingCourses = allCoursesData.filter((course: CourseModel) =>
        existingCourseIds.includes(course.id),
      );
      form.setValue("courses", existingCourses);
      setLoadedCourses(true);
      // Parse restrictions data (For startTime and endTime, we just care about the time, so we use the random date of 2025-01-01 so that the date can be parsed correctly)
      // We also add 1 hour (i.e. 60 * 60 * 1000 milliseconds) to the time to account for the timezone difference between the server and the client
      const parsedRestrictions = restrictionsData.map(
        (restriction: Restriction) =>
          ({
            days: JSON.parse(restriction?.days) as string[],
            disabled: restriction?.disabled,
            startTime: restriction?.start_time
              ? new Date(
                  new Date(
                    `2025-01-01T${restriction.start_time}.00Z`,
                  ).getTime() +
                    60 * 60 * 1000,
                )
              : undefined,
            endTime: restriction?.end_time
              ? new Date(
                  new Date(`2025-01-01T${restriction.end_time}.00Z`).getTime() +
                    60 * 60 * 1000,
                )
              : undefined,
            type: restriction?.type,
            numDays: restriction?.num_days,
          }) as z.infer<typeof RestrictionSchema>,
      );
      form.setValue("restrictions", parsedRestrictions);
      setLoadedRestrictions(true);
      setShowLoadingPage(false);
    }
  }, [
    timetableEventsData,
    coursesData,
    restrictionsData,
    loadedCourses,
    loadedOfferingIds,
    loadedRestrictions,
    form,
    allCoursesData,
    offeringIdToCourseIdMap,
    loadedSemester,
    currentTimetableSemester,
  ]);

  useEffect(() => {
    if (searchQuery) {
      refetch();
    }
  }, [debouncedSearchQuery]);

  const handleGenerate = async (
    values: z.infer<typeof TimetableFormSchema>,
  ) => {
    console.log(">> Timetable options:", values);
    try {
      const res = await generateTimetable(values);
      const data: TimetableGenerateResponseModel = res.data;
      setIsGeneratingTimetables(true);
      setGeneratedTimetables(data);
    } catch (error) {
      console.error("Error generating timetables: ", error);
    }
  };

  const handleReset = () => {
    form.reset();
    filterForm.reset();
    setFilters(null);
  };

  const handleRemoveCourse = (course: {
    id: number;
    code: string;
    name: string;
  }) => {
    const currentList = form.getValues("courses");
    const newList = currentList.filter((item) => item.id !== course.id);
    form.setValue("courses", newList);
  };

  const handleAddRestriction = (values: z.infer<typeof RestrictionSchema>) => {
    const currentList = form.getValues("restrictions");
    const newList = [...currentList, values];
    form.setValue("restrictions", newList);
  };

  const handleRemoveRestriction = (index: number) => {
    const currentList = form.getValues("restrictions");
    const newList = currentList.filter((_, i) => i !== index);
    form.setValue("restrictions", newList);
  };

  const applyFilters = (values: z.infer<typeof FilterFormSchema>) => {
    setFilters(values);
    console.log("Apply filters", values);
  };

  return showLoadingPage ? (
    <LoadingPage />
  ) : (
    <div className="w-full">
      <div className="m-8 flex gap-12">
        <div className="w-1/3">
          <div className="mb-4">
            <div className="mb-4 flex flex-row justify-between">
              <div>
                <h1 className="text-2xl font-medium tracking-tight mb-4">
                  {isEditingTimetable ? "Edit Timetable" : "New Timetable"}
                </h1>
                {isEditingTimetable && (
                  <p className="text-sm italic text-blue-500">
                    Editing: <strong>{currentTimetableTitle}</strong>
                  </p>
                )}
              </div>
              <div className="flex gap-2 ">
                <Button size="sm" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button size="sm" variant="outline">
                  Share
                </Button>
              </div>
            </div>
            <hr />
          </div>
          <Form {...form}>
            <FormContext.Provider value={form}>
              <form
                onSubmit={form.handleSubmit(handleGenerate)}
                className="space-y-8"
              >
                <div className="flex gap-8 w-full">
                  {/* <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              form.reset({ offeringIds: [], courses: [] });
                              form.setValue("semester", value);
                            }}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select a semester" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(SemesterEnum.Values).map(
                                (value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <FormField
                    control={form.control}
                    name="search"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Pick a few courses you'd like to take
                        </FormLabel>
                        <FormControl>
                          <CourseSearch
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            data={coursesData} // TODO: Replace with variable data
                            isLoading={isLoading}
                            showFilter={() => setShowFilters(true)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-sm">
                      Selected courses: {selectedCourses.length} (Max 8)
                    </p>
                    {!isEditingTimetable && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="manual-selection"
                          checked={isChoosingSectionsManually}
                          onCheckedChange={(checked) =>
                            setIsChoosingSectionsManually(checked === true)
                          }
                        />
                        <label
                          htmlFor="manual-selection"
                          className="text-sm font-medium"
                        >
                          Choose meeting sections manually?
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-col">
                    {!isEditingTimetable ||
                    (isEditingTimetable &&
                      loadedCourses &&
                      loadedOfferingIds &&
                      selectedCourses) ? (
                      selectedCourses.map((course, index) => {
                        return (
                          <div key={index}>
                            <div className="flex p-2 justify-between bg-green-100/50 text-xs rounded-md w-[100%]">
                              <p>
                                <strong>{course.code}:</strong> {course.name}
                              </p>
                              <div className="flex gap-4">
                                <X
                                  size={16}
                                  className="hover:text-red-500 cursor-pointer"
                                  onClick={() => {
                                    handleRemoveCourse(course);
                                    const newOfferingsIds = form
                                      .getValues("offeringIds")
                                      .filter(
                                        (offeringId: number) =>
                                          offeringIdToCourseIdMap[
                                            offeringId
                                          ] !== course.id,
                                      );
                                    form.setValue(
                                      "offeringIds",
                                      newOfferingsIds,
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            {isChoosingSectionsManually && (
                              <OfferingInfo
                                course={course}
                                semester={selectedSemester}
                                form={form}
                              />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Loading courses...
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-12 items-end">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Custom Settings</h2>
                    <p className="text-sm text-gray-500">
                      Add additional restrictions to your timetable to
                      personalize it to your needs.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => setIsCustomSettingsOpen(true)}
                  >
                    + Add new
                  </Button>
                </div>

                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name="restrictions"
                    render={() => (
                      <FormItem className="pb-2">
                        <p className="text-sm">
                          Enabled Restrictions: {enabledRestrictions.length}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 flex-col">
                    {enabledRestrictions &&
                      enabledRestrictions.map((restric, index) => (
                        <div
                          key={index}
                          className="flex p-2 justify-between bg-red-100/50 text-xs rounded-md w-[64%]"
                        >
                          {restric.type.startsWith("Restrict") ? (
                            <p>
                              <strong>{restric.type}:</strong>{" "}
                              {restric.startTime
                                ? formatTime(restric.startTime)
                                : ""}{" "}
                              {restric.type === "Restrict Between" ? " - " : ""}{" "}
                              {restric.endTime
                                ? formatTime(restric.endTime)
                                : ""}{" "}
                              {restric.days?.join(" ")}
                            </p>
                          ) : (
                            <p>
                              <strong>{restric.type}:</strong> At least{" "}
                              {restric.numDays} days off
                            </p>
                          )}

                          <X
                            size={16}
                            className="hover:text-red-500 cursor-pointer"
                            onClick={() => handleRemoveRestriction(index)}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {!isChoosingSectionsManually && (
                  <div className="w-[100px]">
                    {isGenerateLoading ? (
                      <Spinner />
                    ) : (
                      <Button type="submit">
                        <div>Generate</div>
                        <WandSparkles />
                      </Button>
                    )}
                  </div>
                )}
              </form>

              {isCustomSettingsOpen && (
                <CreateCustomSetting
                  submitHandler={handleAddRestriction}
                  closeHandler={() => setIsCustomSettingsOpen(false)}
                />
              )}
            </FormContext.Provider>
          </Form>
        </div>
        <div className="w-2/3">
          {isGeneratingTimetables ? (
            <GeneratedCalendars
              setShowLoadingPage={setShowLoadingPage}
              setIsGeneratingTimetables={setIsGeneratingTimetables}
              semester={selectedSemester}
              generatedTimetables={generatedTimetables}
              restrictions={enabledRestrictions}
            />
          ) : (
            <Calendar
              setShowLoadingPage={setShowLoadingPage}
              isChoosingSectionsManually={isChoosingSectionsManually}
              semester={selectedSemester}
              selectedCourses={selectedCourses}
              newOfferingIds={offeringIds}
              restrictions={enabledRestrictions}
            />
          )}
        </div>

        {showFilters && (
          <SearchFilters
            submitHandler={applyFilters}
            closeHandler={() => setShowFilters(false)}
            resetHandler={() => {
              setFilters(null);
              setShowFilters(false);
              console.log("reset filters");
            }}
            filterForm={filterForm}
          />
        )}
      </div>
    </div>
  );
};

export default TimetableBuilder;
