import { useGetTimetableQuery } from "@/api/timetableApiSlice";
import { Button } from "@/components/ui/button";
import { Timetable, TimetableEvents } from "@/utils/type-utils";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Calendar from "../TimetableBuilder/Calendar";
import { useGetEventsQuery } from "@/api/eventsApiSlice";
import { Spinner } from "@/components/ui/spinner";

export const CompareTimetables = () => {

  const [queryParams] = useSearchParams();
  const validParams = queryParams.has("id1") && queryParams.has("id2");

  if (!validParams) {
    return (
      <div className="w-full text-red-500 text-center mt-10">You have not selected two timetables to compare. Please try again.</div>
    )
  }
  const timetableId1 = parseInt(queryParams.get("id1") || "0");
  const timetableId2 = parseInt(queryParams.get("id2") || "0");

  const { data: data1} = useGetTimetableQuery(timetableId1) as { data: Timetable[]};
  const { data: data2} = useGetTimetableQuery(timetableId2) as { data: Timetable[]};

  const { data: timetableEventsData1 } = useGetEventsQuery(timetableId1) as {
    data: TimetableEvents;
  };
  const { data: timetableEventsData2 } = useGetEventsQuery(timetableId2) as {
    data: TimetableEvents;
  };

  const [timetable1, setTimetable1] = useState<Timetable | null>(null);
  const [timetable2, setTimetable2] = useState<Timetable | null>(null);
  const [offeringIds1, setOfferingIds1] = useState<number[]>([]);
  const [offeringIds2, setOfferingIds2] = useState<number[]>([]);
  

  useEffect(() => {
    if (data1) {
      setTimetable1(data1[0])
    }
  }, [data1])
  useEffect(()=> {
    if (data2) {
      setTimetable2(data2[0])
    }
  }, [data2])

  // get unique offeringIds for calendar
  useEffect(() => {
    if (timetableEventsData1) {
      const uniqueOfferingIds = new Set<number>();
      for (const event of timetableEventsData1.courseEvents) {
        if (!uniqueOfferingIds.has(event.offering_id))
          uniqueOfferingIds.add(event.offering_id)
      }
      setOfferingIds1(Array.from(uniqueOfferingIds))
    }
    
  }, [timetableEventsData1])

  useEffect(() => {
    if (timetableEventsData2) {
      const uniqueOfferingIds = new Set<number>();
      for (const event of timetableEventsData2.courseEvents) {
        if (!uniqueOfferingIds.has(event.offering_id))
          uniqueOfferingIds.add(event.offering_id)
      }
      setOfferingIds2(Array.from(uniqueOfferingIds))
    }
  }, [timetableEventsData2])

  return <>
    <div className="w-full">
        <div className="mb-4 p-8">
          <div className="mb-2 flex flex-row justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight mb-4">
                Comparing Timetables
              </h1>
            </div>
            <div className="flex gap-2 ">
              <Link to="/dashboard/home">
                <Button size="sm" variant="outline" onClick={() => {}}>
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
          <hr className="mb-4"/>
          <div className="flex gap-4">
            <div className="w-1/2">
              {offeringIds1.length === 0 ? <Spinner/> : (
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
              {offeringIds2.length === 0 ? <Spinner/> : (
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
}