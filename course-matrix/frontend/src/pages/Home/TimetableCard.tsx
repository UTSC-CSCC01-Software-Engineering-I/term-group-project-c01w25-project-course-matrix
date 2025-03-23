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
import {
  useUpdateTimetableMutation,
  useGetTimetableQuery,
} from "@/api/timetableApiSlice";
import { Link } from "react-router-dom";
import { TimetableModel } from "@/models/models";

interface TimetableCardProps {
  refetch: () => void;
  timetableId: number;
  title: string;
  lastEditedDate: Date;
  owner: string;
  favorite: boolean;
}

/**
 * Component for displaying a timetable card with options to edit the title and access a kebab menu.
 * @param {TimetableCardProps} props - The properties for the timetable card.
 * @returns {JSX.Element} The rendered component.
 */
const TimetableCard = ({
  refetch,
  timetableId,
  title,
  lastEditedDate,
  owner,
  favorite,
}: TimetableCardProps) => {
  const [updateTimetable] = useUpdateTimetableMutation();

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

  const handleSave = async () => {
    try {
      await updateTimetable({
        id: timetableId,
        timetable_title: timetableCardTitle,
      }).unwrap();
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update timetable title:", error);
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
      refetch();
      console.log("Favourite success!");
      setToggled(!toggled);
      console.log(!toggled);
      handleReload();
    } catch (error) {
      console.error("Failed to favourite timetable:", error);
    }
  };

  const handleReload = () => {
    window.location.reload(); // Reloads the page
  };

  return (
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

          <Star
            className={`w-6 h-6 transition-colors ${
              toggled
                ? "fill-none text-gray-500"
                : "fill-yellow-500 text-yellow-500"
            }`}
            onClick={() => handleFavourite()}
          />
          <div className="flex justify-between">
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
                  refetch={refetch}
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
          <div>Owned by: {owner}</div>
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default TimetableCard;
