import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import TimetableCard from "./TimetableCard";
import TimetableCompareButton from "./TimetableCompareButton";
import TimetableCreateNewButton from "./TimetableCreateNewButton";

const Home = () => {
	// const user_metadata = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
	// const username = (user_metadata?.user?.user_metadata?.username as string) ?? "John Doe";
	const username = "Me";

	return (
		<div className="w-full">
			<div className="m-8">
				<div className="mb-4 flex items-center gap-2 relative group">
					<h1 className="text-2xl font-medium tracking-tight">My Timetables</h1>
					<Pin size={24} className="text-blue-500" />
				</div>
				<div className="mb-4 flex flex-row justify-between items-center">
					<div className="flex gap-4">
						<Button
							size="xs"
							className="py-3 px-5 bg-blue-100 hover:bg-blue-300 text-black"
						>
							All
						</Button>
						<Button
							size="xs"
							className="py-3 px-5 bg-blue-100 hover:bg-blue-300 text-black"
						>
							Mine
						</Button>
						<Button
							size="xs"
							className="py-3 px-5 bg-blue-100 hover:bg-blue-300 text-black"
						>
							Shared
						</Button>
					</div>
					<div className="flex gap-8">
						<TimetableCompareButton />
						<TimetableCreateNewButton />
					</div>
				</div>
				<hr />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-8">
					{[...Array(12).keys()].map((_, index) => {
						return (
							<TimetableCard
								key={index}
								title={`Title ${index + 1}`}
								lastEditedDate={new Date()}
								owner={username}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default Home;
