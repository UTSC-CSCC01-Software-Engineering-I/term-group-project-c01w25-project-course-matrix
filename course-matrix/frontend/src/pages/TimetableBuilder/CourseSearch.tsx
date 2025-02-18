import { FilterIcon, Info, Search as SearchIcon } from "lucide-react"
import { Input } from "../../components/ui/input"
import { useContext, useEffect, useRef, useState } from "react"
import { CourseModel } from "@/models/models"
import { useClickOutside } from "@/utils/useClickOutside"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FormContext } from "./TimetableBuilder"
import OfferingContent from "./OfferingContent"
import { convertBreadthRequirement } from "@/utils/convert-breadth-requirement"

/**
 * CourseSearch Component
 *
 * Provides a search bar for users to find and select courses.
 * It integrates with a filtering system and displays search results dynamically.
 *
 * Features:
 * - **Live Search**: Filters courses based on user input and displays results in a dropdown panel.
 * - **Form Integration**: Uses `useContext(FormContext)` to update the selected courses in the parent form.
 * - **Click Outside Handling**: Uses `useClickOutside` to close the search panel specifically when clicking outside the panel.
 * - **Course Selection**: Allows users to add a course to their timetable while preventing duplicates.
 * - **Course Details Preview**:
 *   - Displays a hover card (`HoverCard`) with additional course information.
 *   - Includes prerequisites, exclusions, recommended preparation, and links to UTSC's course calendar.
 * - **Expandable Section Information**:
 *   - Uses `Accordion` to show section times info via the `OfferingContent` component.
 *
 * Props:
 * - `value` (`string`): The current search input value.
 * - `showFilter` (`() => void`): Function to toggle filter options.
 * - `onChange` (`(value: string) => void`): Callback for updating the search value.
 * - `data` (`CourseModel[]`): List of available courses to display.
 * - `isLoading` (`boolean`): Indicates whether course data is loading.
 *
 * Hooks:
 * - `useState` for managing UI states like `showPanel`.
 * - `useRef` for managing input focus and click outside detection.
 * - `useContext(FormContext)` to update the selected courses in the form.
 *
 * UI Components:
 * - `Input` for search input.
 * - `HoverCard` for additional course details.
 * - `Accordion` for expandable section info.
 * - `FilterIcon` to trigger filtering options.
 *
 * @returns {JSX.Element} The rendered course search component.
 */


interface CourseSearchProps {
  value: string,
  showFilter: () => void;
  onChange: (_: string) => void,
  data: CourseModel[],
  isLoading: boolean,
}

const CourseSearch = ({
  value,
  showFilter,
  onChange,
  data,
  isLoading,
}: CourseSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [showPanel, setShowPanel] = useState(false)
  useClickOutside(panelRef, () => setShowPanel(false), showPanel, inputRef)

  const form = useContext(FormContext)

  const handleAddCourse = (item: CourseModel) => {
    if (!form) return
    const currentList = form.getValues('courses') || [];
    if (currentList.find(c => c.id === item.id)) return // ensure uniqueness
    const newList = [...currentList, item]
    console.log(newList)
    form.setValue("courses", newList)
  }

  return (
    <div className="relative w-full">
      <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        ref={inputRef}
        value={value}
        placeholder="Search..."
        className="pl-10"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowPanel(true)}
      />
      <FilterIcon size={16} onClick={showFilter} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 transition cursor-pointer"/>
      {showPanel && (
        <div ref={panelRef} className="absolute top-full left-0 w-full bg-white shadow-md border rounded-md mt-2 p-2 z-[100] max-h-[500px] overflow-y-auto">
          {(data && data.length > 0) ? (
            data.map((item, index) => (
              <div 
                key={index} 
                onClick={() => handleAddCourse(item)} 
                className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center gap-1"
              >
                <div>
                  <p className="text-sm font-bold">{item.code}</p>
                  <p className="text-sm text-gray-500">{item.name}</p>
                </div>
                <HoverCard openDelay={50} closeDelay={0}>
                  <HoverCardTrigger >
                    <Info 
                      size={20} 
                      className="hover:text-green-500 transition duration-1"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent 
                    side="right" 
                    className="w-[380px] sm:w-[450px] md:w-[600px] lg:w-[700px] max-w-[90vw]"
                    sideOffset={10}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-sm flex flex-col gap-2">
                      <p className="text-lg font-bold">{item.code}: {item.name}</p>
                      <p>{item.description}</p>
                      <div>
                        <p><strong>Breadth Requirement: </strong> {convertBreadthRequirement(item.breadth_requirement ?? "")}</p>
                        {item.course_experience && <p><strong>Course Experience: </strong> {item.course_experience}</p>}
                        {item.prerequisite_description && <p><strong>Prerequisites: </strong> {item.prerequisite_description}</p>}
                        {item.corequisite_description && <p><strong>Corequisites: </strong> {item.corequisite_description}</p>}
                        {item.exclusion_description && <p><strong>Course Experience: </strong> {item.exclusion_description}</p>}
                        {item.recommended_preperation && <p><strong>Recommended Preperation: </strong> {item.recommended_preperation}</p>}
                        {item.note && <p><strong>Note: </strong> {item.note}</p>}
                        <a 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 underline"
                          href={`https://utsc.calendar.utoronto.ca/course/${item.code.toLowerCase()}`}
                        >Link to UTSC Course Calendar</a>
                        <div>
                          
                            <Accordion type="single" collapsible>
                              <AccordionItem value="item-1">
                                <AccordionTrigger>Section Times Info</AccordionTrigger>
                                <AccordionContent>
                                  <OfferingContent 
                                    item={item}
                                    semester={form?.getValues("semester") || ""}
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          
                        </div>
                      </div>
                    </div>
                    
                  </HoverCardContent>
                </HoverCard>
              </div>
            ))
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseSearch