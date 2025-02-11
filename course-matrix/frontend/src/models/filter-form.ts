import { z, ZodType } from "zod"
import { SemesterEnum } from "./timetable-form"

export type FilterForm = {
  semester?: string,
  creditWeight?: number,
  breadthRequirement?: string,
}

export const BreadthRequirementEnum = z.enum(["HIS_PHIL_CUL", "SOCIAL_SCI", "NAT_SCI", "QUANT", "ART_LIT_LANG"])

export const FilterFormSchema: ZodType<FilterForm> = z.object({
  semester: SemesterEnum.optional(),
  creditWeight: z.number().optional(),
  breadthRequirement: BreadthRequirementEnum.optional(),
})