import { z, ZodType } from "zod"
import { SemesterEnum } from "./timetable-form"

export type FilterForm = {
  semester?: string,
  creditWeight?: number,
  breadthRequirement?: string,
  department?: string,
  yearLevel: number,
}

export const BreadthRequirementEnum = z.enum(["HIS_PHIL_CUL", "SOCIAL_SCI", "NAT_SCI", "QUANT", "ART_LIT_LANG"])

export const FilterFormSchema: ZodType<FilterForm> = z.object({
  semester: SemesterEnum.optional(),
  creditWeight: z.number().optional(),
  breadthRequirement: BreadthRequirementEnum.optional(),
  department: z.string().optional(),
  yearLevel: z.number().min(1, "Minimum level is year 1").max(4, "Maximum level is year 4"),
})