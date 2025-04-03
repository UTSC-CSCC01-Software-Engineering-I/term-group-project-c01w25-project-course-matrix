import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';

import configureStore from "redux-mock-store";
import { afterEach, beforeEach, describe, expect, test, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { useNavigate } from "react-router-dom";
import { useRuntimeRefresh } from "@/pages/Assistant/runtime-provider";

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
import { Check, ChevronRight, Mail } from "lucide-react";
import {
  useAccountDeleteMutation,
  useLogoutMutation,
} from "@/api/authApiSlice";

import { UserMenu } from "@/components/UserMenu";

jest.mock("../../../frontend/src/components/UserMenu", () => ({
  UserMenu: (setOpen: () => {}) => {
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();
    const refreshRuntime = useRuntimeRefresh();
    const [deleteAccount] = useAccountDeleteMutation();

    const [openEditAccountDialog, setOpenEditAccountDialog] = React.useState(false); // State for the Edit Account Dialog
    
    const user_metadata = JSON.parse(localStorage.getItem("userInfo") ?? "{}"); //User Data
    const username =
      (user_metadata?.user?.user_metadata?.username as string) ?? "John Doe";
    const initials = username //Gets User Initials
      .split(" ") // Split the string by spaces
      .map((word) => word[0]) // Take the first letter of each word
      .join("") // Join them back into a string
      .toUpperCase(); // Convert to uppercase;

    const userId = user_metadata.user.id;

    const handleLogout = async () => {
      try {
        await logout({}).unwrap();
        refreshRuntime();
        navigate("/login");
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };

    const handleDelete = async () => {
      try {
        await deleteAccount({ uuid: userId }).unwrap();
        navigate("/");
      } catch (err) {
        console.error("Delete account failed: ", err);
      }
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex flex-row items-center gap-4 px-4 text-sm">
            {username}
            <Avatar data-testid="user-menu-trigger">
              {/* Avatar Image is the profile picture of the user. The default avatar is used as a placeholder for now. */}
              <AvatarImage src="/img/grey-avatar.png" className="h-18 w-18" />
              {/* Avatar Fallback is the initials of the user. Avatar Fallback will be used if Avatar Image fails to load */}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div className="p-4 flex gap-4 items-center">
            <Mail size={16} />
            <p className="text-sm font-medium">
              {user_metadata?.user?.user_metadata?.email}
            </p>
          </div>
          <DropdownMenuItem>
            <button className="w-full text-left" onClick={() => setOpenEditAccountDialog(true)} data-testid="edit-account-button">
              Edit Account
            </button>
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
        {openEditAccountDialog && (
          <Dialog open={openEditAccountDialog} onOpenChange={setOpenEditAccountDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Account</DialogTitle>
                <DialogDescription>
                  <div className="grid gap-4 py-4">
                    <label htmlFor="username" className="text-sm font-medium">
                      New User Name
                    </label>
                    <input
                      type="text"
                      id="username"
                      placeholder={username}
                      className="border rounded-md p-2 w-full"
                    />
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditAccountDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DropdownMenu>
    );
  },
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@/api/authApiSlice", () => ({
  useLogoutMutation: jest.fn(() => [jest.fn()]),
  useAccountDeleteMutation: jest.fn(() => [jest.fn()]),
}));

jest.mock("@/pages/Assistant/runtime-provider", () => ({
  useRuntimeRefresh: jest.fn(),
  PUBLIC_ASSISTANT_BASE_URL: "test-url",
  ASSISTANT_UI_KEY: "test-key",
}));

jest.mock("lucide-react", () => ({
  Check: () => <div>Check</div>,
  ChevronRight: () => <div>ChevronRight</div>,
  Circle: () => <div>Circle</div>,
  Mail: () => <div>Mail</div>,
}));

describe("UserMenu Component", () => {
  beforeEach(() => {
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        user: {
          id: "123",
          user_metadata: {
            username: "John Doe",
            email: "john.doe@example.com",
          },
        },
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("check local storage", () => {
    expect(localStorage.getItem("userInfo")).not.toBeNull();
  });

  test('renders user name and email', () => {
    render(<UserMenu setOpen={() => {}} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test('renders user avatar with initials', () => {
    render(<UserMenu setOpen={() => {}} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
