import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import TimetableCardKebabMenu from "./TimetableCardKebabMenu";
import TimetableCardShareKebabMenu from "./TimetableCardShareKebabMenu";
import { useGetUsernameFromUserIdQuery } from "@/api/authApiSlice";
import { Timetable } from "./Home";
import {
  useUpdateTimetableMutation,
  useGetTimetableQuery,
} from "@/api/timetableApiSlice";
import { Link } from "react-router-dom";
import { TimetableModel } from "@/models/models";
import { ImagePlaceholder } from "@/components/imagePlaceholder";
import { SemesterIcon } from "@/components/semester-icon";

const semesterToBgColor = (semester: string) => {
  if (semester.startsWith("Fall")) {
    return "bg-red-100";
  } else if (semester.startsWith("Winter")) {
    return "bg-blue-100";
  } else {
    return "bg-yellow-100";
  }
};

interface TimetableCardProps {
  refetchMyTimetables: () => void;
  refetchSharedTimetables: () => void;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  ownerId: string;
  title: string;
  lastEditedDate: Date;
  isShared: boolean;
  timetable: Timetable;
  setSelectedSharedTimetable: React.Dispatch<
    React.SetStateAction<Timetable | null>
  >;
  favorite: boolean;
}

/**
 * Component for displaying a timetable card with options to edit the title and access a kebab menu.
 * @param {TimetableCardProps} props - The properties for the timetable card.
 * @returns {JSX.Element} The rendered component.
 */
const TimetableCard = ({
  refetchMyTimetables,
  refetchSharedTimetables,
  setErrorMessage,
  ownerId,
  title,
  lastEditedDate,
  isShared,
  timetable,
  setSelectedSharedTimetable,
  favorite,
}: TimetableCardProps) => {
  /// small blurred version

  const [updateTimetable] = useUpdateTimetableMutation();

  const timetableId = timetable.id;

  const user_metadata = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
  const loggedInUsername =
    (user_metadata?.user?.user_metadata?.username as string) ??
    (user_metadata?.user?.email as string);
  const { data: usernameData } = useGetUsernameFromUserIdQuery(ownerId);
  const ownerUsername = isShared
    ? usernameData ?? "John Doe"
    : loggedInUsername;

  const lastEditedDateArray = lastEditedDate
    .toISOString()
    .split("T")[0]
    .split("-");
  const lastEditedYear = lastEditedDateArray[0];
  const lastEditedMonth = lastEditedDateArray[1];
  const lastEditedDay = lastEditedDateArray[2];
  const lastEditedDateTimestamp =
    lastEditedMonth + "/" + lastEditedDay + "/" + lastEditedYear;

  const [timetableCardTitle, setTimetableCardTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { data } = useGetTimetableQuery(timetableId);
  const [toggled, setToggled] = useState(favorite);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSave = async () => {
    try {
      await updateTimetable({
        id: timetableId,
        timetable_title: timetableCardTitle,
      }).unwrap();
      setIsEditingTitle(false);
    } catch (error) {
      const errorData = (error as { data?: { error?: string } }).data;
      setErrorMessage(errorData?.error ?? "Unknown error occurred");
      return;
    }
  };

  useEffect(() => {
    if (data) {
      const val = (data as TimetableModel[])[0]?.favorite;
      if (val !== undefined) {
        setToggled(val);
      }
    }
  }, [data]);

  const handleFavourite = async () => {
    try {
      await updateTimetable({
        id: timetableId,
        favorite: !toggled,
      }).unwrap();
      refetchMyTimetables();
      refetchSharedTimetables();
      console.log("Favourite success!");
      setToggled(!toggled);
      console.log(!toggled);
    } catch (error) {
      console.error("Failed to favourite timetable:", error);
    }
  };

  return isShared ? (
    <Card className="w-full transition duration-200 hover:bg-gray-100/50 hover:border-green-300">
      <CardHeader>
        <div className="relative w-full h-full">
          <div
            className={`w-full h-full p-20 flex justify-center rounded-lg ${semesterToBgColor(
              timetable.semester
            )} cursor-pointer animate-fade-in`}
          >
            <SemesterIcon semester={timetable.semester} />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <CardTitle>
            <Input
              disabled={true}
              value={timetableCardTitle}
              className="-ml-3 font-bold border-none text-ellipsis"
            />
          </CardTitle>
          <div className="flex justify-between items-center">
            <Button
              size="sm"
              variant="outline"
              className="p-2"
              onClick={() => setSelectedSharedTimetable(timetable)}
            >
              View
            </Button>
            <TimetableCardShareKebabMenu
              refetchMyTimetables={refetchMyTimetables}
              refetchSharedTimetables={refetchSharedTimetables}
              owner_id={ownerId}
              calendar_id={timetableId}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="-mt-3">
        <CardDescription className="flex justify-between text-xs">
          <div>Last edited {lastEditedDateTimestamp}</div>
          <div>Owned by: {ownerUsername}</div>
        </CardDescription>
      </CardContent>
    </Card>
  ) : (
    <Card className="w-full transition duration-200 hover:bg-gray-100/50 hover:border-green-300">
      <CardHeader>
        <Link to={`/dashboard/timetable?edit=${timetableId}`}>
          <div className="relative w-full h-full">
            <div
              className={`w-full h-full p-20 flex justify-center rounded-lg ${semesterToBgColor(
                timetable.semester
              )} cursor-pointer animate-fade-in`}
            >
              <SemesterIcon semester={timetable.semester} />
            </div>
          </div>
        </Link>
        <div className="flex justify-between items-center">
          <CardTitle>
            <Input
              disabled={!isEditingTitle}
              value={timetableCardTitle}
              className={
                !isEditingTitle
                  ? "-ml-3 font-bold border-none text-ellipsis"
                  : "w-5/6 font-bold"
              }
              onChange={(e) => setTimetableCardTitle(e.target.value)}
            />
          </CardTitle>

          <div className="flex justify-around">
            {!isEditingTitle && (
              <>
                <Star
                  size={18}
                  className={`cursor-pointer transition-colors mt-2 mr-2 ${
                    toggled
                      ? "fill-yellow-500 text-yellow-500"
                      : "fill-none text-gray-500"
                  } `}
                  onClick={() => handleFavourite()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-2"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Pencil />
                </Button>
                <TimetableCardKebabMenu
                  refetchMyTimetables={refetchMyTimetables}
                  refetchSharedTimetables={refetchSharedTimetables}
                  timetableId={timetableId}
                />
              </>
            )}
            {isEditingTitle && (
              <Button
                size="sm"
                className="px-5 bg-black hover:bg-gray-700"
                onClick={handleSave}
              >
                Save
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="-mt-3">
        <CardDescription className="flex justify-between text-xs">
          <div>Last edited {lastEditedDateTimestamp}</div>
          <div>Owned by: {ownerUsername}</div>
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default TimetableCard;
