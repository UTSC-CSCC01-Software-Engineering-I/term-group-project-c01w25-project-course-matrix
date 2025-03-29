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
import { convertTimestampToLocaleTime } from "../../utils/convert-timestamp-to-locale-time";

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
  const [updateTimetable] = useUpdateTimetableMutation();
  const timetableId = timetable.id;

  const user_metadata = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
  const loggedInUsername =
    (user_metadata?.user?.user_metadata?.username as string) ??
    (user_metadata?.user?.email as string);
  const { data: usernameData } = useGetUsernameFromUserIdQuery(ownerId);
  const ownerUsername = isShared
    ? (usernameData ?? "John Doe")
    : loggedInUsername;

  const [timetableCardTitle, setTimetableCardTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { data, refetch } = useGetTimetableQuery(timetableId);
  const [toggled, setToggled] = useState(favorite);
  const [lastEdited, setLastEdited] = useState(
    convertTimestampToLocaleTime(lastEditedDate.toISOString()).split(",")[0],
  );

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
    refetch();
  };

  useEffect(() => {
    if (data) {
      const val = (data as TimetableModel[])[0]?.favorite;
      if (val !== undefined) {
        setToggled(val);
      }
      setLastEdited(
        convertTimestampToLocaleTime(
          (data as TimetableModel[])[0]?.updated_at,
        ).split(",")[0],
      );
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
    <Card className="w-full">
      <CardHeader>
        <img
          src="/img/default-timetable-card-image.png"
          alt="Timetable default image"
          className="cursor-pointer"
          onClick={() => setSelectedSharedTimetable(timetable)}
        />
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
          <div>
            Last edited{" "}
            {
              convertTimestampToLocaleTime(lastEditedDate.toISOString()).split(
                ",",
              )[0]
            }
          </div>

          <div>Owned by: {ownerUsername}</div>
        </CardDescription>
      </CardContent>
    </Card>
  ) : (
    <Card className="w-full">
      <CardHeader>
        <Link to={`/dashboard/timetable?edit=${timetableId}`}>
          <img
            src="/img/default-timetable-card-image.png"
            alt="Timetable default image"
          />
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
          <div className="p-2">
            <Star
              className={`cursor-pointer h-5 w-5 transition-colors ${
                toggled
                  ? "fill-yellow-500 text-yellow-500"
                  : "fill-none text-gray-500"
              } `}
              onClick={() => handleFavourite()}
            />
          </div>

          <div className="flex justify-around">
            {!isEditingTitle && (
              <>
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
          <div>Last edited {lastEdited}</div>
          <div>Owned by: {ownerUsername}</div>
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default TimetableCard;
