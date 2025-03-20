import {
  useGetTimetableQuery,
  useUpdateTimetableMutation,
} from "@/api/timetableApiSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { TimetableModel } from "@/models/models";
import { useEffect, useState } from "react";

interface EmailNotificationSettingsProps {
  timetableId: number;
}

export const EmailNotificationSettings = ({
  timetableId,
}: EmailNotificationSettingsProps) => {
  const { data, isLoading, refetch } = useGetTimetableQuery(timetableId);
  const [updateTimetable] = useUpdateTimetableMutation();
  const [toggled, setToggled] = useState<boolean>(false);

  const handleCancel = () => {
    setToggled((data as TimetableModel[])[0]?.email_notifications_enabled);
  };

  useEffect(() => {
    if (data) {
      const val = (data as TimetableModel[])[0]?.email_notifications_enabled;
      if (val !== undefined) {
        setToggled(val);
      }
    }
  }, [data]);

  const handleUpdateEmailNotifications = async () => {
    try {
      await updateTimetable({
        id: timetableId,
        email_notifications_enabled: toggled,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update timetable:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Manage Notifications</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification settings</DialogTitle>
          <DialogDescription>
            Email notifications will be sent to your account email.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="w-full flex items-center justify-between border rounded-lg p-3">
            <div>
              <div className="text-sm font-bold">Course event emails</div>
              <div className="text-sm text-gray-400">
                Recieve emails prior to upcoming course events
              </div>
            </div>
            <div>
              <Switch
                checked={toggled}
                onCheckedChange={() => setToggled(!toggled)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleUpdateEmailNotifications}>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
