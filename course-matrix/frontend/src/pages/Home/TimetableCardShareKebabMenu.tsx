import { Button } from "@/components/ui/button";
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
import { useDeleteSharedTimetablesWithMeMutation } from "@/api/sharedApiSlice";
import { useState } from "react";
import TimetableErrorDialog from "../TimetableBuilder/TimetableErrorDialog";

interface TimetableCardShareKebabMenu {
  sharedRefetch: () => void;
  owner_id: string;
  calendar_id: number;
}

/**
 * Component for the kebab menu in the shared timetable card, providing options to remove the shared timetable from the user's dashboard.
 * @returns {JSX.Element} The rendered component.
 */
const TimetableCardShareKebabMenu = ({
  sharedRefetch,
  owner_id,
  calendar_id,
}: TimetableCardShareKebabMenu) => {
  const [deleteSharedTimetable] = useDeleteSharedTimetablesWithMeMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRemove = async () => {
    const { error } = await deleteSharedTimetable({ owner_id, calendar_id });

    if (error) {
      const errorData = (error as { data?: { error?: string } }).data;
      setErrorMessage(errorData?.error ?? "Unknown error occurred");
      return;
    } else {
      sharedRefetch();
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Dialog>
            <TimetableErrorDialog
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
            <DialogTrigger asChild>
              <button className="w-full text-left text-red-600">Remove</button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  Remove Timetable Shared To You
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this timetable shared with
                  you? This action cannot be undone.
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
                    onClick={handleRemove}
                  >
                    Remove
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

export default TimetableCardShareKebabMenu;
