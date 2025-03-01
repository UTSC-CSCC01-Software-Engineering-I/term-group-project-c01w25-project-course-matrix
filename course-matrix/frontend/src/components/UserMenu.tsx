import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import {
  useAccountDeleteMutation,
  useLogoutMutation,
  useUpdateUsernameMutation,
} from "@/api/authApiSlice";
import { useDispatch } from "react-redux";
import { clearCredentials } from "@/stores/authslice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

/**
 * UserMenu Component
 *
 * Provides a dropdown menu for the user to manage their account settings.
 * Includes options for viewing account information, editing account details,
 * logging out, and deleting the account (currently non-functional).
 *
 * Features:
 * - **User Information**: Displays the user's name, email (placeholder), and avatar.
 * - **Account Actions**:
 *   - **Edit Account**: Opens a dialog to edit account details (currently disabled for email and password).
 *   - **Logout**: Logs out the user, clears credentials, and redirects to the homepage.
 *   - **Delete Account**: Opens a confirmation dialog for account deletion (currently non-functional).
 * - **Dialog Components**: Uses the `Dialog` component for editing account details and confirming account deletion.
 * - **Avatar**: Displays a default user avatar with initials fallback.
 *
 * Hooks:
 * - `useLogoutMutation` for handling user logout.
 * - `useDispatch` and `useNavigate` for Redux actions and navigation after logout.
 *
 * UI Components:
 * - `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` for dropdown menu functionality.
 * - `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter` for modal dialogs.
 * - `Avatar`, `AvatarFallback`, `AvatarImage` for displaying the user's avatar.
 * - `Button`, `Input`, `Label` for form inputs and actions.
 *
 * @returns {JSX.Element} The rendered user menu dropdown with account options.
 */

export function UserMenu() {
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const [deleteAccount] = useAccountDeleteMutation();
  const [usernameUpdate] = useUpdateUsernameMutation();

  const usernameRef = useRef<HTMLInputElement>(null);
  const user_metadata = JSON.parse(localStorage.getItem("userInfo") ?? "{}"); //User Data
  const username = (user_metadata?.user?.user_metadata?.username as string) ?? "John Doe"
  const initials = username//Gets User Initials
    .split(" ") // Split the string by spaces
    .map((word) => word[0]) // Take the first letter of each word
    .join("") // Join them back into a string
    .toUpperCase(); // Convert to uppercase;

  const userId = user_metadata.user.id;

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      dispatch(clearCredentials());
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount({ uuid: userId }).unwrap();
      dispatch(clearCredentials());
      navigate("/");
    } catch (err) {
      console.error("Delete account failed: ", err);
    }
  };

  const handleUsernameUpdate = async () => {
    try {
      const username = usernameRef.current?.value;
      if (!username.trim()) {
        return;
      }
      user_metadata.user.user_metadata.username =
        usernameRef.current?.value.trimEnd();
      localStorage.setItem("userInfo", JSON.stringify(user_metadata));
      await usernameUpdate({
        userId: userId,
        username: user_metadata.user.user_metadata.username,
      });
    } catch (err) {
      console.error("Update username failed: ", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex flex-row items-center gap-4 px-4 text-sm">
          {username}
          <Avatar>
            {/* Avatar Image is the profile picture of the user. The default avatar is used as a placeholder for now. */}
            <AvatarImage src="../../public/img/default-avatar.png" />
            {/* Avatar Fallback is the initials of the user. Avatar Fallback will be used if Avatar Image fails to load */}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="p-4 flex gap-4 items-center">
          <Mail size={16} />
          <p className="text-sm font-medium">
            {user_metadata.user.user_metadata.email}
          </p>
        </div>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full text-left">Edit Account</button>
            </DialogTrigger>
            <DialogContent className="gap-5">
              <DialogHeader>
                <DialogTitle>Edit Account</DialogTitle>
                <DialogDescription>
                  Edit your account details.
                </DialogDescription>
              </DialogHeader>
              <Label htmlFor="username">New User Name</Label>
              {/* Disable this email input box for now until we have the backend for accounts set up */}
              <Input
                id="username"
                type="text"
                placeholder={user_metadata.user.user_metadata.username}
                ref={usernameRef}
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.stopPropagation(); // Allows space input
                  }
                }}
              />
              <Label htmlFor="email">New Email</Label>
              {/* Disable this email input box for now until we have the backend for accounts set up */}
              <Input
                id="email"
                type="email"
                placeholder="john.doe@gmail.com"
                disabled
              />
              <Label htmlFor="email">New Password</Label>
              {/* Disable this password input box for now until we have the backend for accounts set up */}
              <Input id="password" disabled={true} />
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
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button className="w-full text-left" onClick={handleLogout}>
            Logout
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full text-left text-red-600">
                Delete Account
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                {/* The logic for deleting accounts has not been implemented yet. Currently, clicking 'Delete' here will just close the Delete dialog. */}
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
}
