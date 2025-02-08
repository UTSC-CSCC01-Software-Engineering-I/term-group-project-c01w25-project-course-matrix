import pdfplumber
import csv
import re

pdf_path = "UTSC Course Search.pdf"
csv_path = "courses.csv"
csv_path_prerequisites = "prerequisites.csv"
csv_path_corequisites = "corequisites.csv"

headers = [
    "code", "breadth_requirement", "course_experience", "description", "recommended_preperation", "prerequisite_description", "exclusion_description", "name", "corequisite_description", "note", 
]
headers_prerequisites = [
	"prerequisite_code", "course_code"
]
headers_corequisites = [
	"corequisite_code", "course_code"
]

data, data_prerequisites, data_corequisites = [], [], []

def setup_bounding_boxes(width, height):
	left_col = (0, 0, width / 2, height)
	right_col = (width / 2, 0, width, height)
	return (left_col, right_col)

def find_course_code_match(line):
    # Match course code: eg. ABCD01H3Y
    return re.search(r"(\d+)\.\s+([A-Z]{4}\d{2,3}[A-Z]?\d?[A-Z]?)", line)

def handle_prerequisites(prerequisite_description, code):
    # print(prerequisite_description)
    course_pattern = r"([A-Z]{4}\d{2,3}[A-Z]?\d?)"
    matches = [m.group() for m in re.finditer(course_pattern, prerequisite_description)]
    for mcode in matches:
        data_prerequisites.append([mcode, code])

def handle_corequisites(corequisite_description, code):
    # print(corequisite_description)
    course_pattern = r"([A-Z]{4}\d{2,3}[A-Z]?\d?)"
    matches = [m.group() for m in re.finditer(course_pattern, corequisite_description)]
    for mcode in matches:
        data_corequisites.append([mcode, code])

def convert_to_breadth_requirement_enum(s):
    if (s == "Arts, Literature and Language"):
        return "ART_LIT_LANG"
    elif (s == "History, Philosophy and Cultural Studies"):
        return "HIS_PHIL_CUL"
    elif (s == "Social and Behavioural Sciences"):
        return "SOCIAL_SCI"
    elif (s == "Quantitative Reasoning"):
        return "QUANT"
    elif (s == "Natural Sciences"):
	    return "NAT_SCI"
    else:
	    print(">>> Unknown Breadth Requirement: ", s)
	    return ""

# Extraction flow
with pdfplumber.open(pdf_path) as pdf:
	# Define column regions (left and right)
	left_col, right_col = setup_bounding_boxes(pdf.pages[0].width, pdf.pages[0].height)

	for idx, page in enumerate(pdf.pages):
		# print(f"\n>>>> Page {idx} ")
		
		left_text = page.within_bbox(left_col).extract_text()
		right_text = page.within_bbox(right_col).extract_text()

		# print("LEFT COLUMN:\n", left_text)
		# print("\nRIGHT COLUMN:\n", right_text)

		for text in [left_text, right_text]:
			if not text: 
				continue
				
			start_pattern = r"([A-Z]{4}\d{2,3}[A-Z]?\d?:)" # course code (with colon at end to ensure it's a header)
			end_pattern = r'Link to UTSC Timetable'
			match_starts = [(m.start(), m.end(), m.group()) for m in re.finditer(start_pattern, text)]
			match_ends = [((m.start(), m.end(), m.group())) for m in re.finditer(end_pattern, text)]

			# Handle each course section
			for start, end in zip(match_starts, match_ends):
				code = name = description = breadth_requirement = course_experience = recommended_preperation = prerequisite_description = exclusion_description = corequisite_description = note = ""

				section = text[start[0]: end[0]] # course section's text
				code = start[2][:-1]

				# Find full course name (May span multiple lines)
				name = section[10:section.index("\n")]
				line2 = section[len(name)+11: section.index("\n", len(name)+11)]
				if len(line2) <= 40:
					name += " " + line2 
				line3 = section[len(name)+11: section.index("\n", len(name)+11)]
				if len(line3) <= 40:
					name += " " + line3 
				# print(code, name)
				
				# Find fields
				field_pattern = r"(Exclusion|Breadth Requirements|Prerequisite|Corequisite|Course Experience|Note|Recommended Preparation):"
				fields = [(m.start(), m.end(), m.group()) for m in re.finditer(field_pattern, section)]
				
				if len(fields) > 0:
					description = section[len(name)+11:fields[0][0]].strip().replace("\n", " ")
				
				for j in range(len(fields)):
					field = fields[j]
					field_description = section[field[1]+1: fields[j+1][0] if j+1 < len(fields) else -1].strip().replace("\n", " ")
					# print(fields[j][2], field_description, "\n")
					if field[2] == "Exclusion:":
						exclusion_description = field_description
					elif field[2] == "Breadth Requirements:":
						breadth_requirement = convert_to_breadth_requirement_enum(field_description)
					elif field[2] == "Prerequisite:":
						prerequisite_description = field_description
						handle_prerequisites(prerequisite_description, code)
					elif field[2] == "Corequisite:":
						corequisite_description = field_description
						handle_corequisites(corequisite_description, code)
					elif field[2] == "Course Experience:":
						course_experience = field_description
					elif field[2] == "Note:":
						note = field_description
					elif field[2] == "Recommended Preparation:":
						recommended_preperation = field_description
					else:
						print(">>> Invalid field: ", field)
				
				data.append([
					code, breadth_requirement, course_experience, description, recommended_preperation,
					prerequisite_description, exclusion_description, name, corequisite_description, note
				])

with open(csv_path, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(headers)
    writer.writerows(data)

print(f"CSV file '{csv_path}' created successfully.")		

with open(csv_path_prerequisites, mode="w", newline="", encoding="utf-8") as file1:
    writer = csv.writer(file1)
    writer.writerow(headers_prerequisites)
    writer.writerows(data_prerequisites)

print(f"CSV file '{csv_path_prerequisites}' created successfully.")	

with open(csv_path_corequisites, mode="w", newline="", encoding="utf-8") as file2:
    writer = csv.writer(file2)
    writer.writerow(headers_corequisites)
    writer.writerows(data_corequisites)

print(f"CSV file '{csv_path_corequisites}' created successfully.")	


			
