import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RestrictionSchema, TimetableFormSchema, baseTimetableForm } from "@/models/timetable-form"
import { Edit, X } from "lucide-react"
import { createContext, useEffect, useState } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import CourseSearch from "@/pages/TimetableBuilder/CourseSearch"
import { mockSearchData } from "./mockSearchData"
import { CourseModel } from "@/models/models"
import CreateCustomSetting from "./CreateCustomSetting"
import { formatTime } from "@/utils/format-date-time"
import { FilterForm, FilterFormSchema } from "@/models/filter-form"
import { useGetCoursesQuery } from "@/api/coursesApiSlice"
import { useDebounceValue } from "@/utils/useDebounce"
import SearchFilters from "./SearchFilters"

type FormContextType = UseFormReturn<z.infer<typeof TimetableFormSchema>>;
export const FormContext = createContext<FormContextType | null>(null)

const TimetableBuilder = () => {
  const form = useForm<z.infer<typeof TimetableFormSchema>>({
    resolver: zodResolver(TimetableFormSchema),
    defaultValues: baseTimetableForm,
  })

  const filterForm = useForm<z.infer<typeof FilterFormSchema>>({
    resolver: zodResolver(FilterFormSchema),
  })

  const selectedCourses = form.watch("courses") || []
  const enabledRestrictions = form.watch("restrictions") || []
  const searchQuery = form.watch("search")
  const debouncedSearchQuery = useDebounceValue(searchQuery, 500)

  const [isEditNameOpen, setIsEditNameOpen] = useState(false)
  const [isCustomSettingsOpen, setIsCustomSettingsOpen] = useState(false)
  const [searchData, setSearchData] = useState<CourseModel[]>(mockSearchData.courses) // TODO replace with real query
  const [filters, setFilters] = useState<FilterForm | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { data, isLoading, error, refetch } = useGetCoursesQuery(filters)

  useEffect(() => {
    if (searchQuery) {
      refetch();
    }
  }, [debouncedSearchQuery])
 
  const createTimetable = (values: z.infer<typeof TimetableFormSchema>) => {
    console.log(values)
    // TODO Send request to /api/timetable/create
  }

  const handleReset = () => {
    form.reset()
  }

  const handleRemoveCourse = (course: {id: number, code: string, name: string}) => {
    const currentList = form.getValues("courses")
    const newList = currentList.filter((item) => item.id !== course.id)
    form.setValue('courses', newList);
  }

  const handleAddRestriction = (values: z.infer<typeof RestrictionSchema>) => {
    const currentList = form.getValues("restrictions")
    const newList = [...currentList, values]
    form.setValue("restrictions", newList)
  }

  const handleRemoveRestriction = (index: number) => {
    const currentList = form.getValues("restrictions")
    const newList = currentList.filter((_, i) => i !== index)
    form.setValue('restrictions', newList);
  }

  const applyFilters = (values: z.infer<typeof FilterFormSchema>) => {
    setFilters(values)
    console.log("Apply filters", values)
  }

  const onSearchChange = (searchQuery: string) => {
    
  }

  return <>
    <div className="w-full">
      <div className="m-8">
        <div className="mb-4 flex flex-row justify-between items-center">
          <div className="flex items-center gap-4 relative group">
            <h1 className="text-2xl font-medium tracking-tight">{baseTimetableForm.name}</h1>
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity top-2 -right-7 cursor-pointer">
              <Edit
                size={16} 
                className="text-gray-500 hover:text-green-500"
                onClick={() => {setIsEditNameOpen(true)}}
              />
            </div>
          </div>
          <div className="flex gap-4 ">
            <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
            <Button size="sm">Share</Button>
          </div>
        </div>
        <hr/>
      </div>

      <div className="m-8 flex gap-12">
        <div className="w-1/2">
          <Form {...form}>
            <FormContext.Provider value={form}>
              <form onSubmit={form.handleSubmit(createTimetable)} className="space-y-8">
                <div className="flex gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select a semester" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                              <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                              <SelectItem value="Winter 2026">Winter 2026</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="search"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>Pick a few courses you'd like to take</FormLabel>
                        <FormControl>
                          <CourseSearch value={field.value} 
                            onChange={(value) => {
                              field.onChange(value)
                              onSearchChange(value)
                            }} 
                            data={searchData} // TODO: Replace with variable data
                            showFilter={() => setShowFilters(true)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm pb-2">Selected courses: {selectedCourses.length}</p>
                  <div className="flex gap-2 flex-col">
                    {selectedCourses.map((course, index) => (
                      <div key={index} className="flex p-2 justify-between bg-green-100/50 text-xs rounded-md w-[64%]">
                        <p><strong>{course.code}:</strong> {course.name}</p> 
                        <X size={16} className="hover:text-red-500 cursor-pointer" onClick={() => handleRemoveCourse(course)}/>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-12 items-end">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Custom Settings</h2>
                    <p className="text-sm text-gray-500">Add additional restrictions to your timetable to personalize it to your needs.</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setIsCustomSettingsOpen(true)}>+ Add new</Button>
                </div>

                <div className="flex flex-col">
                  <p className="text-sm pb-2">Enabled Restrictions: {enabledRestrictions.length}</p>
                  <div className="flex gap-2 flex-col">
                    {enabledRestrictions.map((restric, index) => (
                      <div key={index} className="flex p-2 justify-between bg-red-100/50 text-xs rounded-md w-[64%]">
                        {restric.type.startsWith("Restrict") ? (
                          <p><strong>{restric.type}:</strong> {restric.startTime ? formatTime(restric.startTime) : ""} {restric.type === "Restrict Between" ? " - " : ""} {restric.endTime ? formatTime(restric.endTime) : ""} {restric.days?.join(" ")}</p> 
                        ) : (
                          <p><strong>{restric.type}:</strong> At least {restric.numDays} days off</p>
                        )}
                        
                        <X size={16} className="hover:text-red-500 cursor-pointer" onClick={() => handleRemoveRestriction(index)}/>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit">Generate</Button>
              </form>
            </FormContext.Provider>
          </Form>
        </div>
        <div className="w-1/2 bg-slate-100/50 flex items-center justify-center">
            <p className="text-sm text-muted-foreground"> Fill in the form to create your timetable!</p>
        </div>
        {isCustomSettingsOpen && (
          <CreateCustomSetting submitHandler={handleAddRestriction} closeHandler={() => setIsCustomSettingsOpen(false)}/>
        )}

        {showFilters && (
          <SearchFilters
            submitHandler={applyFilters}
            closeHandler={() => setShowFilters(false)}
            resetHandler={() => {
              setFilters(null)
              setShowFilters(false)
              console.log("reset filters")
            }}
            filterForm={filterForm}
          />
        )}
      </div>
    </div>
  </>
}

export default TimetableBuilder