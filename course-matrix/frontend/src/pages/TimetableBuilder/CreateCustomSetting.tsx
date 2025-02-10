import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useContext, useState } from "react"
import { FormContext } from "./TimetableBuilder"
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { baseRestrictionForm, RestrictionSchema } from "@/models/timetable-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod";
import { Button } from "@/components/ui/button";

interface CreateCustomSettingProps {
  closeHandler: () => void;
  submitHandler: (values: z.infer<typeof RestrictionSchema>) => void;
}

const CreateCustomSetting = ({
  closeHandler,
  submitHandler
}: CreateCustomSettingProps) => {

  const restrictionForm = useForm<z.infer<typeof RestrictionSchema>>({
    resolver: zodResolver(RestrictionSchema),
    defaultValues: baseRestrictionForm,
  })

  const createRestriction = (values: z.infer<typeof RestrictionSchema>) => {
    console.log("e")
    submitHandler(values)
    closeHandler()
  }

  const getRestrictionType = (value: string) => {
    if (value === "Restrict Before" || value === "Restrict After" || "Restrict Between") {
      return "time"
    }
    else if (value === "Restrict Day") {
      return "day"
    }
    else if (value === "Days Off") {
      return "days off"
    }
  } 

  return (
    <div className="fixed -top-8 inset-0 z-[50] bg-black/50 flex items-center justify-center">
      <Card className="w-[600px]">
        <CardHeader>
          <div className="relative">
            <X size={16} onClick={() => closeHandler()} className="absolute top-0 right-0 cursor-pointer hover:text-gray-400"/>
          </div>
          <CardTitle className="font-medium pb-2">Create New Restriction</CardTitle>
          <CardDescription>Prevent courses from being scheduled for certain times and days.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...restrictionForm}>
            <form onSubmit={restrictionForm.handleSubmit(createRestriction, (errors) => console.log(errors) )} className="space-y-8">
              <div className="flex gap-8 w-full">
                <FormField
                    control={restrictionForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restriction Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={""}>
                            <SelectTrigger className="w-[320px]">
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Restrict Before">Restrict Times Before XX:XX</SelectItem>
                              <SelectItem value="Restrict After">Restrict Times After XX:XX</SelectItem>
                              <SelectItem value="Restrict Between">Restrict Times Between XX:XX-YY:YY</SelectItem>
                              <SelectItem value="Restrict Day">Restrict Entire Day</SelectItem>
                              <SelectItem value="Days Off">Enforce Minimum Days Off Per Week</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {getRestrictionType(restrictionForm.getValues("type")) === "day" || getRestrictionType(restrictionForm.getValues("type")) === "time" ? (
                    <FormField
                      control={restrictionForm.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restriction Type</FormLabel>
                          <FormControl>
                            
                            
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <></>
                  )}
              </div>

              <Button type="submit">Create</Button>
            </form>
          </Form>
          
        </CardContent>
        <CardFooter>

        </CardFooter>
      </Card>
    </div>
  )
}

export default CreateCustomSetting