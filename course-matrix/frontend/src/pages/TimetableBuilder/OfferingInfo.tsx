import { useGetOfferingsQuery } from "@/api/offeringsApiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseModel, OfferingModel } from "@/models/models";
import { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TimetableFormSchema } from "@/models/timetable-form";
import { z } from "zod";

interface OfferingInfoProps {
  offeringIds: number[];
  course: Pick<CourseModel, "code" | "name" | "id">;
  semester: string;
  form: UseFormReturn<z.infer<typeof TimetableFormSchema>>;
}

const OfferingInfo = ({
  offeringIds,
  course,
  semester,
  form,
}: OfferingInfoProps) => {
  const { data, isLoading } = useGetOfferingsQuery({
    course_code: course.code,
    semester: semester,
  });

  const lectures = data?.filter((offering: OfferingModel) =>
    offering.meeting_section.startsWith("LEC"),
  );
  const tutorials = data?.filter((offering: OfferingModel) =>
    offering.meeting_section.startsWith("TUT"),
  );
  const practicals = data?.filter((offering: OfferingModel) =>
    offering.meeting_section.startsWith("PRA"),
  );

  const selectedOfferingIds = data?.filter((offering: OfferingModel) =>
    offeringIds.includes(offering.id),
  );
  const initialSelectedLecture = selectedOfferingIds?.find(
    (offering: { meeting_section: string }) =>
      offering.meeting_section.startsWith("LEC"),
  );
  const initialSelectedTutorial = selectedOfferingIds?.find(
    (offering: { meeting_section: string }) =>
      offering.meeting_section.startsWith("TUT"),
  );
  const initialSelectedPractical = selectedOfferingIds?.find(
    (offering: { meeting_section: string }) =>
      offering.meeting_section.startsWith("PRA"),
  );

  // console.log(`LECTURES for course ${course.code}`, lectures);
  // console.log(`TUTORIALS for course ${course.code}`, tutorials);
  // console.log(`PRACTICALS for course ${course.code}`, practicals);
  // console.log("OFFERING IDS", form.getValues("offeringIds"));
  // console.log(`SELECTED OFFERING IDS for course ${course.code}`, selectedOfferingIds);
  // console.log(`INITIAL SELECTED LECTURE for course ${course.code}`, initialSelectedLecture);
  // console.log(`INITIAL SELECTED TUTORIAL for course ${course.code}`, initialSelectedTutorial);
  // console.log(`INITIAL SELECTED PRACTICAL for course ${course.code}`, initialSelectedPractical);

  const [selectedLecture, setSelectedLecture] = useState<
    OfferingModel | undefined
  >();
  const [selectedTutorial, setSelectedTutorial] = useState<
    OfferingModel | undefined
  >();
  const [selectedPractical, setSelectedPractical] = useState<
    OfferingModel | undefined
  >();

  useEffect(() => {
    setSelectedLecture(initialSelectedLecture);
    setSelectedTutorial(initialSelectedTutorial);
    setSelectedPractical(initialSelectedPractical);
  }, [
    initialSelectedLecture,
    initialSelectedTutorial,
    initialSelectedPractical,
  ]);

  useEffect(() => {
    const offeringIds = form.getValues("offeringIds") ?? [];
    const otherCourseOfferingIds = offeringIds.filter(
      (id) => !data?.map((offering: OfferingModel) => offering.id).includes(id),
    );
    const newOfferingIds = [
      ...otherCourseOfferingIds,
      selectedLecture?.id,
      selectedTutorial?.id,
      selectedPractical?.id,
    ].filter((id): id is number => id !== undefined);
    form.setValue("offeringIds", newOfferingIds);
  }, [selectedLecture, selectedTutorial, selectedPractical, form, data]);

  const handleSelect = (
    lecture: OfferingModel | undefined,
    tutorial: OfferingModel | undefined,
    practical: OfferingModel | undefined,
  ) => {
    if (lecture) {
      setSelectedLecture(lecture);
      setIsEditingLectureSection(false);
    }
    if (tutorial) {
      setSelectedTutorial(tutorial);
      setIsEditingTutorialSection(false);
    }
    if (practical) {
      setSelectedPractical(practical);
      setIsEditingPracticalSection(false);
    }
  };

  const [isEditingLectureSection, setIsEditingLectureSection] = useState(false);
  const [isEditingTutorialSection, setIsEditingTutorialSection] =
    useState(false);
  const [isEditingPracticalSection, setIsEditingPracticalSection] =
    useState(false);

  return (
    <>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="flex gap-2 p-4 justify-between bg-green-100/50 w-[80%] text-xs">
          {lectures?.length > 0 &&
            (!isEditingLectureSection ? (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                {selectedLecture?.meeting_section ?? "No LEC selected"}
                <Edit
                  size={16}
                  className="hover:text-blue-500 cursor-pointer"
                  onClick={() => setIsEditingLectureSection(true)}
                />
              </div>
            ) : (
              <Select
                value={selectedLecture?.id?.toString()}
                onValueChange={(value) =>
                  handleSelect(
                    lectures?.find(
                      (offering: OfferingModel) =>
                        offering.id.toString() === value,
                    ),
                    undefined,
                    undefined,
                  )
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select LEC" />
                </SelectTrigger>
                <SelectContent>
                  {lectures?.map((offering: OfferingModel) => (
                    <SelectItem
                      key={offering.id}
                      value={offering.id.toString()}
                    >
                      {`${offering.meeting_section} (${offering.day}, ${offering.start} - ${offering.end})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          {tutorials?.length > 0 &&
            (!isEditingTutorialSection ? (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                {selectedTutorial?.meeting_section ?? "No TUT selected"}
                <Edit
                  size={16}
                  className="hover:text-blue-500 cursor-pointer"
                  onClick={() => setIsEditingTutorialSection(true)}
                />
              </div>
            ) : (
              <Select
                value={selectedTutorial?.id?.toString()}
                onValueChange={(value) => {
                  handleSelect(
                    undefined,
                    tutorials?.find(
                      (offering: OfferingModel) =>
                        offering.id.toString() === value,
                    ),
                    undefined,
                  );
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select TUT" />
                </SelectTrigger>
                <SelectContent>
                  {tutorials?.map((offering: OfferingModel) => (
                    <SelectItem
                      key={offering.id}
                      value={offering.id.toString()}
                    >
                      {`${offering.meeting_section} (${offering.day}, ${offering.start} - ${offering.end})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          {practicals?.length > 0 &&
            (!isEditingPracticalSection ? (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                {selectedPractical?.meeting_section ?? "No PRA selected"}
                <Edit
                  size={16}
                  className="hover:text-blue-500 cursor-pointer"
                  onClick={() => setIsEditingPracticalSection(true)}
                />
              </div>
            ) : (
              <Select
                value={selectedPractical?.id?.toString()}
                onValueChange={(value) => {
                  handleSelect(
                    undefined,
                    undefined,
                    practicals?.find(
                      (offering: OfferingModel) =>
                        offering.id.toString() === value,
                    ),
                  );
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select PRA" />
                </SelectTrigger>
                <SelectContent>
                  {practicals?.map((offering: OfferingModel) => (
                    <SelectItem
                      key={offering.id}
                      value={offering.id.toString()}
                    >
                      {`${offering.meeting_section} (${offering.day}, ${offering.start} - ${offering.end})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
        </div>
      )}
    </>
  );
};

export default OfferingInfo;
