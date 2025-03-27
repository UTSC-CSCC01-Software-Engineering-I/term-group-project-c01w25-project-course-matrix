import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import { EllipsisVertical } from "lucide-react";
import { useDeleteTimetableMutation } from "@/api/timetableApiSlice";
import { EmailNotificationSettings } from "./EmailNotificationSettings";
import ShareDialog from "../TimetableBuilder/ShareDialog";
import { useState } from "react";

interface TimetableCardKebabMenuProps {
  refetchMyTimetables: () => void;
  refetchSharedTimetables: () => void;
  timetableId: number;
}

/**
 * Component for the kebab menu in the timetable card, providing options to edit or delete the timetable.
 * @returns {JSX.Element} The rendered component.
 */
const TimetableCardKebabMenu = ({
  refetchMyTimetables,
  refetchSharedTimetables,
  timetableId,
}: TimetableCardKebabMenuProps) => {
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [deleteTimetable] = useDeleteTimetableMutation();

  const handleDelete = async () => {
    try {
      await deleteTimetable(timetableId);
      refetchMyTimetables();
      refetchSharedTimetables();
    } catch (error) {
      console.error("Failed to delete timetable:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="sm" variant="ghost" className="p-2">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link to={`/dashboard/timetable?edit=${timetableId}`}>
            Edit Timetable
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <EmailNotificationSettings timetableId={timetableId} />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer"
          onClick={() => setOpenShareDialog(true)}
        >
          Share Timetable
        </DropdownMenuItem>
        <ShareDialog
          open={openShareDialog}
          setOpen={setOpenShareDialog}
          calendar_id={timetableId}
        />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full text-left text-red-600">
                Delete Timetable
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  Delete Timetable
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your timetable? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 text-white"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TimetableCardKebabMenu;
