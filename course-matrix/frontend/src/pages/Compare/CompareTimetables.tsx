import { useGetTimetablesQuery } from "@/api/timetableApiSlice";
import { Button } from "@/components/ui/button";
import { Timetable } from "@/utils/type-utils";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CompareFormSchema } from "../Home/TimetableCompareButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SemesterIcon } from "@/components/semester-icon";
import { GitCompareArrows } from "lucide-react";
import { useGetTimetablesSharedWithMeQuery } from "@/api/sharedApiSlice";
import { TimetableShare } from "../Home/Home";
import ViewCalendar from "../TimetableBuilder/ViewCalendar";
import { sortTimetablesComparator } from "@/utils/calendar-utils";

export const CompareTimetables = () => {
  const [timetable1, setTimetable1] = useState<Timetable>();
  const [timetable2, setTimetable2] = useState<Timetable>();
  const [queryParams] = useSearchParams();

  const preselectedTimetableId1 = queryParams.get("id1");
  const preselectedTimetableId2 = queryParams.get("id2");
  const preselectedUserId1 = queryParams.get("userId1");
  const preselectedUserId2 = queryParams.get("userId2");
  const needsToLoadTimetable = preselectedTimetableId1 !== null && preselectedTimetableId2 !== null && preselectedUserId1 !== null && preselectedUserId2 !== null;

  const compareForm = useForm<z.infer<typeof CompareFormSchema>>({
    resolver: zodResolver(CompareFormSchema),
    defaultValues: {
      timetable1: queryParams.has("id1")
        ? `timetable1/${preselectedTimetableId1}/${preselectedUserId1}`
        : undefined,
      timetable2: queryParams.has("id2")
        ? `timetable2/${preselectedTimetableId2}/${preselectedUserId2}`
        : undefined,
    },
  });

  const { data: myTimetablesData } = useGetTimetablesQuery() as {
    data: Timetable[];
  };
  const { data: sharedWithMeTimetablesData } =
    useGetTimetablesSharedWithMeQuery() as { data: TimetableShare[] };

  const myOwningTimetables = [...(myTimetablesData ?? [])].sort(
    sortTimetablesComparator,
  );
  const sharedWithMeTimetables = [...(sharedWithMeTimetablesData ?? [])]
    .flatMap((share) => share.timetables)
    .sort(sortTimetablesComparator);
  const allTimetables = [...myOwningTimetables, ...sharedWithMeTimetables]
    .map((timetable, index) => ({
      ...timetable,
      isShared: index >= myOwningTimetables.length,
    }))
    .sort(sortTimetablesComparator);

  const [loadedPreselectedTimetables, setLoadedPreselectedTimetables] = useState(!needsToLoadTimetable);

  useEffect(() => {
    if (
      preselectedTimetableId1 &&
      preselectedUserId1 &&
      preselectedTimetableId2 &&
      preselectedUserId2 &&
      myTimetablesData &&
      sharedWithMeTimetablesData &&
      !loadedPreselectedTimetables
    ) {
      setTimetable1(
        allTimetables.find(
          (t) =>
            t.id === parseInt(preselectedTimetableId1) &&
            t.user_id === preselectedUserId1,
        ),
      );
      setTimetable2(
        allTimetables.find(
          (t) =>
            t.id === parseInt(preselectedTimetableId2) &&
            t.user_id === preselectedUserId2,
        ),
      );
      setLoadedPreselectedTimetables(true);
    }
  }, [preselectedTimetableId1, preselectedUserId1, preselectedTimetableId2, preselectedUserId2, allTimetables, loadedPreselectedTimetables, myTimetablesData, sharedWithMeTimetablesData]);

  const onSubmit = useCallback(
    (values: z.infer<typeof CompareFormSchema>) => {
      console.log("Compare Form submitted:", values);

      const timetableId1 = parseInt(values.timetable1.split("/")[1]);
      const timetableId2 = parseInt(values.timetable2.split("/")[1]);
      const timetableUserId1 = values.timetable1.split("/")[2];
      const timetableUserId2 = values.timetable2.split("/")[2];

      setTimetable1(
        allTimetables.find(
          (t) => t.id === timetableId1 && t.user_id === timetableUserId1,
        ),
      );
      setTimetable2(
        allTimetables.find(
          (t) => t.id === timetableId2 && t.user_id === timetableUserId2,
        ),
      );
    },
    [allTimetables],
  );

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
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={
                          queryParams.has("id1")
                            ? `timetable1/${preselectedTimetableId1}/${preselectedUserId1}`
                            : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timetable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allTimetables &&
                            allTimetables.map((timetable) => (
                              <SelectItem
                                key={`timetable1/${timetable.id}/${timetable.user_id}`}
                                value={`timetable1/${timetable.id}/${timetable.user_id}`}
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
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={
                          queryParams.has("id1")
                            ? `timetable2/${preselectedTimetableId2}/${preselectedUserId2}`
                            : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timetable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allTimetables &&
                            allTimetables.map((timetable) => (
                              <SelectItem
                                key={`timetable2/${timetable.id}/${timetable.user_id}`}
                                value={`timetable2/${timetable.id}/${timetable.user_id}`}
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
              {!timetable1 ? (
                <div className="w-full text-center py-[8rem] text-sm bg-gray-100/50 rounded">
                  Select a timetable to compare
                </div>
              ) : (
                <ViewCalendar
                  user_id={timetable1.user_id}
                  calendar_id={timetable1.id}
                  timetable_title={timetable1?.timetable_title ?? ""}
                  semester={timetable1?.semester ?? "Fall 2025"}
                  show_fancy_header={false}
                />
              )}
            </div>
            <div className="w-1/2">
              {!timetable2 ? (
                <div className="w-full text-center py-[8rem] text-sm bg-gray-100/50 rounded">
                  Select a timetable to compare
                </div>
              ) : (
                <ViewCalendar
                  user_id={timetable2.user_id}
                  calendar_id={timetable2.id}
                  timetable_title={timetable2?.timetable_title ?? ""}
                  semester={timetable2?.semester ?? "Fall 2025"}
                  show_fancy_header={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
