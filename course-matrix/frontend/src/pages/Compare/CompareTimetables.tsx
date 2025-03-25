import { useGetTimetableQuery, useGetTimetablesQuery } from "@/api/timetableApiSlice";
import { Button } from "@/components/ui/button";
import { Timetable, TimetableEvents } from "@/utils/type-utils";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Calendar from "../TimetableBuilder/Calendar";
import { useGetEventsQuery } from "@/api/eventsApiSlice";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CompareFormSchema } from "../Home/TimetableCompareButton";
import { format } from "path";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SemesterIcon } from "@/components/semester-icon";
import { GitCompareArrows } from "lucide-react";

export const CompareTimetables = () => {

  const [timetable1, setTimetable1] = useState<Timetable>();
  const [timetable2, setTimetable2] = useState<Timetable>();
  const [offeringIds1, setOfferingIds1] = useState<number[]>();
  const [offeringIds2, setOfferingIds2] = useState<number[]>();
  const [queryParams] = useSearchParams();

  const compareForm = useForm<z.infer<typeof CompareFormSchema>>({
    resolver: zodResolver(CompareFormSchema),
    defaultValues: {
      timetable1: queryParams.has("id1") ? parseInt(queryParams.get("id1") ?? "0") : undefined,
      timetable2: queryParams.has("id2") ? parseInt(queryParams.get("id2") ?? "0") : undefined
    }
  });
  
  const onSubmit = (values: z.infer<typeof CompareFormSchema>) => {
    console.log("Compare Form submitted:", values);
    const timetableId1 = compareForm.getValues("timetable1");
    const timetableId2 = compareForm.getValues("timetable2");
    setTimetable1(timetables.find(t => t.id === timetableId1))
    refetchEvents1()
    setTimetable2(timetables.find(t => t.id === timetableId2))
    refetchEvents2()
  };

  const { data: timetables, isLoading, refetch } = useGetTimetablesQuery() as {
      data: Timetable[];
      isLoading: boolean;
      refetch: () => void;
    };

  const { data: timetableEventsData1, refetch: refetchEvents1 } = useGetEventsQuery(
    compareForm.getValues("timetable1") ?? undefined, 
    {
      skip: compareForm.getValues("timetable1") === undefined
    }
  ) as {
    data: TimetableEvents;
    refetch: () => void;
  };
  const { data: timetableEventsData2, refetch: refetchEvents2 } = useGetEventsQuery(
    compareForm.getValues("timetable2"),
    {
      skip: compareForm.getValues("timetable2") === undefined
    }
  ) as {
    data: TimetableEvents;
    refetch: () => void;
  };

  useEffect(() => {
    if (queryParams.has("id1") && timetables) {
      const id = parseInt(queryParams.get("id1") || "0");
      compareForm.setValue("timetable1", id);
      setTimetable1(timetables.find(t => t.id === id));
    }
  }, [timetables]);

  useEffect(() => {
    if (queryParams.has("id2") && timetables) {
      const id = parseInt(queryParams.get("id2") || "0");
      compareForm.setValue("timetable2", id);
      setTimetable2(timetables.find(t => t.id === id));
    }
  }, [timetables]);

  // get unique offeringIds for calendar
  useEffect(() => {
    if (timetableEventsData1) {
      const uniqueOfferingIds = new Set<number>();
      for (const event of timetableEventsData1.courseEvents) {
        if (!uniqueOfferingIds.has(event.offering_id))
          uniqueOfferingIds.add(event.offering_id);
      }
      setOfferingIds1(Array.from(uniqueOfferingIds));
    }
  }, [timetableEventsData1]);

  useEffect(() => {
    if (timetableEventsData2) {
      const uniqueOfferingIds = new Set<number>();
      for (const event of timetableEventsData2.courseEvents) {
        if (!uniqueOfferingIds.has(event.offering_id))
          uniqueOfferingIds.add(event.offering_id);
      }
      setOfferingIds2(Array.from(uniqueOfferingIds));
    }
  }, [timetableEventsData2]);

  return (
    <>
      <div className="w-full">
        <div className="mb-2 p-8 pt-4">
          <div className="mb-2 flex flex-row items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight">
                Comparing Timetables
              </h1>
            </div>
            <Form {...compareForm}>
              <form
                onSubmit={compareForm.handleSubmit(onSubmit)}
                className="flex flex-row gap-4 items-center"
              >
                <FormField
                  control={compareForm.control}
                  name="timetable1"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={queryParams.has("id1") ? (queryParams.get("id1") ?? "") : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timetable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timetables && timetables.map((timetable) => (
                            <SelectItem
                              key={timetable.id}
                              value={timetable.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <SemesterIcon
                                  semester={timetable.semester}
                                  size={18}
                                />
                                <span>{timetable.timetable_title}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button size="sm" className="px-5">
                  Compare
                  <GitCompareArrows />
                </Button>
                <FormField
                  control={compareForm.control}
                  name="timetable2"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={queryParams.has("id1") ? (queryParams.get("id2") ?? "") : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timetable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timetables && timetables.map((timetable) => (
                            <SelectItem
                              key={timetable.id}
                              value={timetable.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <SemesterIcon
                                  semester={timetable.semester}
                                  size={18}
                                />
                                <span>{timetable.timetable_title}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <div className="flex gap-2 ml-[7rem]">
              <Link to="/dashboard/home">
                <Button size="sm" variant="outline" onClick={() => {}}>
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
          <hr className="mb-4" />
          <div className="flex gap-4">
            <div className="w-1/2">
              {!offeringIds1 ? (
                <>
                  {queryParams.has("id1") ? <Spinner /> : <div className="w-full text-center py-[8rem] text-sm bg-gray-100/50 rounded">Select a timetable to compare</div>}
                </>
              ) : (
                <Calendar
                  setShowLoadingPage={() => {}}
                  isChoosingSectionsManually={false}
                  semester={timetable1?.semester ?? "Fall 2025"}
                  selectedCourses={[]}
                  newOfferingIds={offeringIds1}
                  restrictions={[]}
                  header={timetable1?.timetable_title}
                />
              )}
            </div>
            <div className="w-1/2">
              {!offeringIds2 ? (
                <>
                  {queryParams.has("id2") ? <Spinner /> : <div className="w-full text-center py-[8rem] text-sm bg-gray-100/50 rounded">Select a timetable to compare</div>}
                </>
              ) : (
                <Calendar
                  setShowLoadingPage={() => {}}
                  isChoosingSectionsManually={false}
                  semester={timetable2?.semester ?? "Fall 2025"}
                  selectedCourses={[]}
                  newOfferingIds={offeringIds2}
                  restrictions={[]}
                  header={timetable2?.timetable_title}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
