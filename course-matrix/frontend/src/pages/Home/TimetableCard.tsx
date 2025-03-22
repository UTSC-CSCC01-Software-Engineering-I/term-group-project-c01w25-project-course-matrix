import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useState } from "react";
import TimetableCardKebabMenu from "./TimetableCardKebabMenu";
import { useUpdateTimetableMutation } from "@/api/timetableApiSlice";
import { Link } from "react-router-dom";

interface TimetableCardProps {
  refetch: () => void;
  timetableId: number;
  title: string;
  lastEditedDate: Date;
  owner: string;
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
