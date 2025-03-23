import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import TimetableCard from "./TimetableCard";
import TimetableCreateNewButton from "./TimetableCreateNewButton";
import { useGetTimetablesQuery } from "../../api/timetableApiSlice";
import { Timetable } from "@/utils/type-utils";
import { TimetableCompareButton } from "./TimetableCompareButton";

/**
 * Home component that displays the user's timetables and provides options to create or compare timetables.
 * @returns {JSX.Element} The rendered component.
 */
const Home = () => {
  const user_metadata = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
  const name =
    (user_metadata?.user?.user_metadata?.username as string) ??
    (user_metadata?.user?.email as string);

  const { data, isLoading, refetch } = useGetTimetablesQuery() as {
    data: Timetable[];
    isLoading: boolean;
    refetch: () => void;
  };

  return (
    <div className="w-full">
      <div className="m-8">
        <div className="mb-4 flex items-center gap-2 relative group">
          <h1 className="text-2xl font-medium tracking-tight">My Timetables</h1>
          <Pin size={24} className="text-blue-500" />
        </div>
        <div className="mb-4 flex flex-row justify-between items-center">
          <div className="flex gap-4">
            <Button
              size="xs"
              className="py-3 px-5 bg-blue-100 hover:bg-blue-300 text-black"
              disabled
            >
              All
            </Button>
            <Button
              size="xs"
              className="py-3 px-5 bg-blue-100 hover:bg-blue-300 text-black"
            >
              Mine
            </Button>
            <Button
              size="xs"
              className="py-3 px-5 bg-blue-100 hover:bg-blue-300 text-black"
              disabled
            >
              Shared
            </Button>
          </div>
          <div className="flex gap-2">
            <TimetableCompareButton timetables={data} />
            <TimetableCreateNewButton />
          </div>
        </div>
        <hr />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-between mt-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            [...data]
              .sort((a: Timetable, b: Timetable) =>
                b?.updated_at.localeCompare(a?.updated_at),
              )
              .map((timetable) => (
                <TimetableCard
                  refetch={refetch}
                  key={timetable.id}
                  timetableId={timetable.id}
                  title={timetable.timetable_title}
                  lastEditedDate={new Date(timetable.updated_at)}
                  owner={name}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
