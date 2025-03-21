import { useGetOfferingsQuery } from "@/api/offeringsApiSlice";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseModel, OfferingModel } from "@/models/models";
import { useEffect, useMemo, useState } from "react";
import { Edit } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TimetableFormSchema } from "@/models/timetable-form";
import { z } from "zod";

interface OfferingInfoProps {
  course: Pick<CourseModel, "code" | "name" | "id">;
  semester: string;
  form: UseFormReturn<z.infer<typeof TimetableFormSchema>>;
}

const OfferingInfo = ({ course, semester, form }: OfferingInfoProps) => {
  const { data: offeringsData, isLoading } = useGetOfferingsQuery({
    course_code: course.code,
    semester: semester,
  });

  const offeringIds = form.watch("offeringIds") ?? [];

  const lectures = offeringsData
    ?.filter((offering: OfferingModel) =>
      offering.meeting_section.startsWith("LEC"),
    )
    .sort((a: OfferingModel, b: OfferingModel) =>
      a.meeting_section < b.meeting_section ? -1 : 1,
    );
  const tutorials = offeringsData
    ?.filter((offering: OfferingModel) =>
      offering.meeting_section.startsWith("TUT"),
    )
    .sort((a: OfferingModel, b: OfferingModel) =>
      a.meeting_section < b.meeting_section ? -1 : 1,
    );
  const practicals = offeringsData
    ?.filter((offering: OfferingModel) =>
      offering.meeting_section.startsWith("PRA"),
    )
    .sort((a: OfferingModel, b: OfferingModel) =>
      a.meeting_section < b.meeting_section ? -1 : 1,
    );

  const lectureSections: string[] = [
    ...new Set(
      lectures?.map((lec: { meeting_section: string }) => lec.meeting_section),
    ),
  ] as string[];
  const tutorialSections = [
    ...new Set(
      tutorials?.map((tut: { meeting_section: string }) => tut.meeting_section),
    ),
  ] as string[];
  const practicalSections = [
    ...new Set(
      practicals?.map(
        (pra: { meeting_section: string }) => pra.meeting_section,
      ),
    ),
  ] as string[];
  const sections = [
    ...new Set([...lectureSections, ...tutorialSections, ...practicalSections]),
  ];
  const sectionsToOfferingIdsMap = new Map<string, number[]>();
  sections.forEach((section: string) => {
    const lectureOfferingIds = lectures
      ?.filter(
        (lec: { meeting_section: string }) => lec.meeting_section === section,
      )
      .map((lec: { id: number }) => lec.id);
    const tutorialOfferingIds = tutorials
      ?.filter(
        (tut: { meeting_section: string }) => tut.meeting_section === section,
      )
      .map((tut: { id: number }) => tut.id);
    const practicalOfferingIds = practicals
      ?.filter(
        (pra: { meeting_section: string }) => pra.meeting_section === section,
      )
      .map((pra: { id: number }) => pra.id);
    const offeringIds = [
      ...lectureOfferingIds,
      ...tutorialOfferingIds,
      ...practicalOfferingIds,
    ];
    sectionsToOfferingIdsMap.set(section, offeringIds);
  });

  const selectedOfferingIds = offeringsData?.filter((offering: OfferingModel) =>
    offeringIds.includes(offering.id),
  );

  const initialSelectedLecture = useMemo(
    () =>
      selectedOfferingIds?.filter((offering: { meeting_section: string }) =>
        offering.meeting_section.startsWith("LEC"),
      ) ?? [],
    [selectedOfferingIds],
  );
  const initialSelectedTutorial = useMemo(
    () =>
      selectedOfferingIds?.filter((offering: { meeting_section: string }) =>
        offering.meeting_section.startsWith("TUT"),
      ) ?? [],
    [selectedOfferingIds],
  );
  const initialSelectedPractical = useMemo(
    () =>
      selectedOfferingIds?.filter((offering: { meeting_section: string }) =>
        offering.meeting_section.startsWith("PRA"),
      ) ?? [],
    [selectedOfferingIds],
  );

  // Load initial selected lecture, tutorial, practical
  const [loadedInitialSelectedLecture, setLoadedInitialSelectedLecture] =
    useState(false);
  const [loadedInitialSelectedTutorial, setLoadedInitialSelectedTutorial] =
    useState(false);
  const [loadedInitialSelectedPractical, setLoadedInitialSelectedPractical] =
    useState(false);
  useEffect(() => {
    if (!loadedInitialSelectedLecture && initialSelectedLecture.length > 0) {
      setSelectedLecture(initialSelectedLecture);
      setLoadedInitialSelectedLecture(true);
    }
  }, [initialSelectedLecture, loadedInitialSelectedLecture]);
  useEffect(() => {
    if (!loadedInitialSelectedTutorial && initialSelectedTutorial.length > 0) {
      setSelectedTutorial(initialSelectedTutorial);
      setLoadedInitialSelectedTutorial(true);
    }
  }, [initialSelectedTutorial, loadedInitialSelectedTutorial]);
  useEffect(() => {
    if (
      !loadedInitialSelectedPractical &&
      initialSelectedPractical.length > 0
    ) {
      setSelectedPractical(initialSelectedPractical);
      setLoadedInitialSelectedPractical(true);
    }
  }, [initialSelectedPractical, loadedInitialSelectedPractical]);

  const [selectedLecture, setSelectedLecture] = useState<OfferingModel[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<OfferingModel[]>([]);
  const [selectedPractical, setSelectedPractical] = useState<OfferingModel[]>(
    [],
  );

  const handleSelect = (
    lecture: OfferingModel[],
    tutorial: OfferingModel[],
    practical: OfferingModel[],
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
    const oldOfferingIds: number[] = [
      ...selectedLecture,
      ...selectedTutorial,
      ...selectedPractical,
    ].map((offering: OfferingModel) => offering.id);
    const newOfferingIds: number[] = [
      ...lecture,
      ...tutorial,
      ...practical,
    ].map((offering: OfferingModel) => offering.id);

    const filteredOfferingIds = offeringIds.filter(
      (id: number) => !oldOfferingIds.includes(id),
    );
    const resultOfferingIds = [...filteredOfferingIds, ...newOfferingIds];
    form.setValue("offeringIds", resultOfferingIds);
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
        <div className="flex gap-2 p-4 justify-between bg-green-100/50 w-[100%] text-xs">
          {lectures?.length > 0 &&
            (!isEditingLectureSection ? (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                {selectedLecture[0]?.meeting_section ?? "No LEC selected"}
                <Edit
                  size={16}
                  className="hover:text-blue-500 cursor-pointer"
                  onClick={() => setIsEditingLectureSection(true)}
                />
              </div>
            ) : (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                <Select
                  value={selectedLecture
                    .map((lec: OfferingModel) => lec.id.toString())
                    .join(",")}
                  onOpenChange={(isOpen) => setIsEditingLectureSection(isOpen)}
                  onValueChange={(value) => {
                    handleSelect(
                      lectures?.filter((offering: OfferingModel) =>
                        value.split(",").includes(offering.id.toString()),
                      ),
                      initialSelectedTutorial,
                      initialSelectedPractical,
                    );
                  }}
                >
                  <SelectTrigger className="w-[100%]">
                    <SelectValue placeholder="Select LEC" />
                  </SelectTrigger>
                  <SelectContent>
                    {lectureSections?.map((section: string) => {
                      const lectureOfferingIds =
                        sectionsToOfferingIdsMap.get(section);
                      if (!lectureOfferingIds) return null;

                      return (
                        <SelectGroup>
                          <SelectItem
                            value={lectureOfferingIds.join(",")}
                            className={
                              "font-bold bg-yellow-300 focus:bg-yellow-500 cursor-pointer"
                            }
                          >
                            {section}
                          </SelectItem>
                          {lectureOfferingIds.map((id: number) => {
                            const offering = lectures?.find(
                              (offering: OfferingModel) => offering.id === id,
                            );
                            return (
                              <SelectLabel
                                key={id}
                                className={"bg-yellow-100 font-light"}
                              >{`${offering?.day}, ${offering?.start} - ${offering?.end}`}</SelectLabel>
                            );
                          })}
                        </SelectGroup>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ))}
          {tutorials?.length > 0 &&
            (!isEditingTutorialSection ? (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                {selectedTutorial[0]?.meeting_section ?? "No TUT selected"}
                <Edit
                  size={16}
                  className="hover:text-blue-500 cursor-pointer"
                  onClick={() => setIsEditingTutorialSection(true)}
                />
              </div>
            ) : (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                <Select
                  value={selectedTutorial
                    .map((tut: OfferingModel) => tut.id.toString())
                    .join(",")}
                  onOpenChange={(isOpen) => setIsEditingTutorialSection(isOpen)}
                  onValueChange={(value) => {
                    handleSelect(
                      initialSelectedLecture,
                      tutorials?.filter((offering: OfferingModel) =>
                        value.split(",").includes(offering.id.toString()),
                      ),
                      initialSelectedPractical,
                    );
                  }}
                >
                  <SelectTrigger className="w-[100%]">
                    <SelectValue placeholder="Select TUT" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutorialSections?.map((section: string) => {
                      const tutorialOfferingIds =
                        sectionsToOfferingIdsMap.get(section);
                      if (!tutorialOfferingIds) return null;

                      return (
                        <SelectGroup>
                          <SelectItem
                            value={tutorialOfferingIds.join(",")}
                            className={
                              "font-bold bg-yellow-300 focus:bg-yellow-500 cursor-pointer"
                            }
                          >
                            {section}
                          </SelectItem>
                          {tutorialOfferingIds.map((id: number) => {
                            const offering = tutorials?.find(
                              (offering: OfferingModel) => offering.id === id,
                            );
                            return (
                              <SelectLabel
                                key={id}
                                className={"bg-yellow-100 font-light"}
                              >{`${offering?.day}, ${offering?.start} - ${offering?.end}`}</SelectLabel>
                            );
                          })}
                        </SelectGroup>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ))}
          {practicals?.length > 0 &&
            (!isEditingPracticalSection ? (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                {selectedPractical[0]?.meeting_section ?? "No PRA selected"}
                <Edit
                  size={16}
                  className="hover:text-blue-500 cursor-pointer"
                  onClick={() => setIsEditingPracticalSection(true)}
                />
              </div>
            ) : (
              <div className="flex justify-between align-items p-4 gap-4 bg-blue-100/50">
                <Select
                  value={selectedPractical
                    .map((pra: OfferingModel) => pra.id.toString())
                    .join(",")}
                  onOpenChange={(isOpen) =>
                    setIsEditingPracticalSection(isOpen)
                  }
                  onValueChange={(value) => {
                    handleSelect(
                      initialSelectedLecture,
                      initialSelectedTutorial,
                      practicals?.filter((offering: OfferingModel) =>
                        value.split(",").includes(offering.id.toString()),
                      ),
                    );
                  }}
                >
                  <SelectTrigger className="w-[100%]">
                    <SelectValue placeholder="Select PRA" />
                  </SelectTrigger>
                  <SelectContent>
                    {practicalSections?.map((section: string) => {
                      const practicalOfferingIds =
                        sectionsToOfferingIdsMap.get(section);
                      if (!practicalOfferingIds) return null;

                      return (
                        <SelectGroup>
                          <SelectItem
                            value={practicalOfferingIds.join(",")}
                            className={
                              "font-bold bg-yellow-300 focus:bg-yellow-500 cursor-pointer"
                            }
                          >
                            {section}
                          </SelectItem>
                          {practicalOfferingIds.map((id: number) => {
                            const offering = practicals?.find(
                              (offering: OfferingModel) => offering.id === id,
                            );
                            return (
                              <SelectLabel
                                key={id}
                                className={"bg-yellow-100 font-light"}
                              >{`${offering?.day}, ${offering?.start} - ${offering?.end}`}</SelectLabel>
                            );
                          })}
                        </SelectGroup>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ))}
        </div>
      )}
    </>
  );
};

export default OfferingInfo;
