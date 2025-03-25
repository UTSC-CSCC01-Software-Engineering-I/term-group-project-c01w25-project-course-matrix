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
import { Pin } from "lucide-react";
import TimetableCard from "./TimetableCard";
import TimetableCompareButton from "./TimetableCompareButton";
import TimetableCreateNewButton from "./TimetableCreateNewButton";
import { useGetTimetablesQuery } from "../../api/timetableApiSlice";
import { useState } from "react";
import TimetableErrorDialog from "../TimetableBuilder/TimetableErrorDialog";
import { useGetTimetablesSharedWithMeQuery } from "@/api/sharedApiSlice";
import SharedCalendar from "../TimetableBuilder/SharedCalendar";
import { useGetUsernameFromUserIdQuery } from "@/api/authApiSlice";

export interface Timetable {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  semester: string;
  timetable_title: string;
  favorite: boolean;
}

export interface TimetableShare {
  id: number;
  calendar_id: number;
  owner_id: string;
  shared_id: string;
  timetables: Timetable[];
}

/**
 * Home component that displays the user's timetables and provides options to create or compare timetables.
 * @returns {JSX.Element} The rendered component.
 */
const Home = () => {
  const { data: myTimetablesData, isLoading: myTimetablesDataLoading, refetch } = useGetTimetablesQuery() as {
    data: Timetable[];
    isLoading: boolean;
    refetch: () => void;
  };

  const { data: sharedWithMeData, isLoading: sharedWithmeDataLoading, refetch: sharedRefetch } = useGetTimetablesSharedWithMeQuery() as {
    data: TimetableShare[];
    isLoading: boolean;
    refetch: () => void;
  };

  const isLoading = myTimetablesDataLoading || sharedWithmeDataLoading;

  const myOwningTimetables = [...(myTimetablesData ?? [])].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const sharedWithMeTimetables = [...(sharedWithMeData ?? [])].flatMap((share) => share.timetables).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const allTimetables = [...myOwningTimetables, ...sharedWithMeTimetables].map((timetable, index) => ({
    ...timetable,
    isShared: index >= myOwningTimetables.length
  }))

  console.log("My Owning Timetables", myOwningTimetables);
  console.log("Shared With Me Timetables", sharedWithMeTimetables);
  console.log("All Timetables", allTimetables);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");


  const [selectedSharedTimetable, setSelectedSharedTimetable] = useState<Timetable | null>(null);
  const selectedSharedTimetableId = selectedSharedTimetable?.id ?? -1;
  const selectedSharedTimetableTitle = selectedSharedTimetable?.timetable_title ?? "";
  const selectedSharedTimetableOwnerId = selectedSharedTimetable?.user_id ?? "";
  const selectSharedTimetableSemester = selectedSharedTimetable?.semester ?? "";

  // Get the selected shared timetable owner's username
  const { data: usernameData } = useGetUsernameFromUserIdQuery(selectedSharedTimetableOwnerId, { skip: selectedSharedTimetableId === -1 });
  const ownerUsername = usernameData ?? "";
  
  console.log("SELECTED SHARED TIMETABLE", selectedSharedTimetable);

  return (
    <div className="w-full">
      <div className="m-8">
        <Dialog open={selectedSharedTimetable !== null} onOpenChange={() => setSelectedSharedTimetable(null)}>
          <DialogTitle></DialogTitle>
          <DialogContent className="max-w-[80%] max-h-[100%]">
            <SharedCalendar 
              user_id={selectedSharedTimetableOwnerId}
              user_username={ownerUsername}
              calendar_id={selectedSharedTimetableId}
              timetable_title={selectedSharedTimetableTitle}
              semester={selectSharedTimetableSemester}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" size="sm">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="mb-4 flex items-center gap-2 relative group">
          <h1 className="text-2xl font-medium tracking-tight">My Timetables</h1>
          <Pin size={24} className="text-blue-500" />
        </div>
        <TimetableErrorDialog
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
        <div className="mb-4 flex flex-row justify-between items-center">
          <div className="flex gap-4">
            <Button
              size="xs"
              className={`py-3 px-5 hover:bg-blue-300 text-black ${activeTab === "All" ? "bg-blue-300" : "bg-blue-100"}`}
              onClick={() => setActiveTab("All")}
            >
              All
            </Button>
            <Button
              size="xs"
              className={`py-3 px-5 hover:bg-blue-300 text-black ${activeTab === "Mine" ? "bg-blue-300" : "bg-blue-100"}`}
              onClick={() => setActiveTab("Mine")}
            >
              Mine
            </Button>
            <Button
              size="xs"
              className={`py-3 px-5 hover:bg-blue-300 text-black ${activeTab === "Shared" ? "bg-blue-300" : "bg-blue-100"}`}
              onClick={() => setActiveTab("Shared")}
            >
              Shared With Me
            </Button>
          </div>
          <div className="flex gap-8">
            <TimetableCompareButton />
            <TimetableCreateNewButton />
          </div>
        </div>
        <hr />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-between mt-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : activeTab === "All" ? 
            allTimetables.map((timetable) => (
                <TimetableCard
                  refetch={refetch}
                  sharedRefetch={sharedRefetch}
                  setErrorMessage={setErrorMessage}
                  key={timetable.id}
                  ownerId={timetable.user_id}
                  title={timetable.timetable_title}
                  lastEditedDate={new Date(timetable.updated_at)}
                  isShared={timetable.isShared}
                  timetable={timetable}
                  setSelectedSharedTimetable={setSelectedSharedTimetable}
                />
              ))
            : activeTab === "Mine" ?
            myOwningTimetables.map((timetable) => (
                <TimetableCard
                  refetch={refetch}
                  sharedRefetch={sharedRefetch}
                  setErrorMessage={setErrorMessage}
                  key={timetable.id}
                  ownerId={timetable.user_id}
                  title={timetable.timetable_title}
                  lastEditedDate={new Date(timetable.updated_at)}
                  isShared={false}
                  timetable={timetable}
                  setSelectedSharedTimetable={setSelectedSharedTimetable}
                />
              ))
            : sharedWithMeTimetables.map((timetable) => (
                <TimetableCard
                  refetch={refetch}
                  sharedRefetch={sharedRefetch}
                  setErrorMessage={setErrorMessage}
                  key={timetable.id}
                  ownerId={timetable.user_id}
                  title={timetable.timetable_title}
                  lastEditedDate={new Date(timetable.updated_at)}
                  isShared={true}
                  timetable={timetable}
                  setSelectedSharedTimetable={setSelectedSharedTimetable}
                />
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default Home;
