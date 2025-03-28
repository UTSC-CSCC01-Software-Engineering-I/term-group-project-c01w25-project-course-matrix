import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateUsernameMutation } from "@/api/authApiSlice";
import { useRef } from "react";

interface EditAccountDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const EditAccountDialog = ({ open, setOpen }: EditAccountDialogProps) => {
  const [updateUsername] = useUpdateUsernameMutation();

  const usernameRef = useRef<HTMLInputElement>(null);
  const user_metadata = JSON.parse(localStorage.getItem("userInfo") ?? "{}"); //User Data
  const userId = user_metadata.user.id;

  const handleUsernameUpdate = async () => {
    try {
      const username = usernameRef?.current?.value;
      if (!username || !username.trim()) {
        return;
      }
      user_metadata.user.user_metadata.username =
        usernameRef.current?.value.trimEnd();
      localStorage.setItem("userInfo", JSON.stringify(user_metadata));
      await updateUsername({
        userId: userId,
        username: user_metadata.user.user_metadata.username,
      });
    } catch (err) {
      console.error("Update username failed: ", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-5">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>Edit your account details.</DialogDescription>
        </DialogHeader>
        <Label htmlFor="username">New User Name</Label>
        <Input
          id="username"
          type="text"
          placeholder={user_metadata.user.user_metadata.username}
          ref={usernameRef}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleUsernameUpdate}>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAccountDialog;
