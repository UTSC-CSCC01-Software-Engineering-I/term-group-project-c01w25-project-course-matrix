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

export function UserMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<div className="flex flex-row items-center gap-4 px-4">
					{/* John Doe is just a placeholder name for now */}
					John Doe
					<Avatar>
						{/* Avatar Image is the profile picture of the user. The default avatar is used as a placeholder for now. */}
						<AvatarImage src="../../public/img/default-avatar.png" />
						{/* Avatar Fallback is the initials of the user. Avatar Fallback will be used if Avatar Image fails to load */}
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{/* Placeholder email of john.doe@gmail.com for now */}
				<div className="p-4">
					<p className="text-sm font-medium">john.doe@gmail.com</p>
				</div>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<Dialog>
						<DialogTrigger asChild>
							<button className="w-full text-left">Edit Account</button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Account</DialogTitle>
								<DialogDescription>
									Edit your account details.
								</DialogDescription>
							</DialogHeader>
							<div className="p-4">
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700"
								>
									New Email
								</label>
								{/* Disable this email input box for now until we have the backend for accounts set up */}
								<Input
									id="email"
									type="email"
									placeholder="john.doe@gmail.com"
									className="mt-1 block w-full"
									disabled={true}
								/>
							</div>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="secondary">Cancel</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button>Save</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<button className="w-full text-left">Logout</button>
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
