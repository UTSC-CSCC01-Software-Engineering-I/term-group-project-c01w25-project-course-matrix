import pdfplumber
import csv
import re

pdf_path = "Timetable _ Office of the Registrar Winter 2024.pdf"
csv_path = "offerings_winter_2026.csv"x
# NOTE: Change this to modify session column of mock data
session = "Winter 2026"

headers = [
    "course_code", "meeting_section", "offering", "day", "start", "end", "location", "current", "max", "is_waitlisted", "delivery_mode", "instructor", "notes"
]

TABLE_START_INDICATORS = ["MeetingSection".upper(), "Meeting".upper()]
data = []

def is_table_start(line):
    for indicator in TABLE_START_INDICATORS:
        if line.replace("\n", "").replace(" ", "").upper().startswith(indicator):
            return True
    return False

def find_match(line):
    # Match course code: eg. ABCD01H3Y
    return re.search(r"(\d+)\.\s+([A-Z]{4}\d{2,3}[A-Z]?\d?[A-Z]?)", line)

def page_has_overflow_table(lines):
    # if course code shows up BEFORE a table start, then this means this page has no overflow
    # table. Otherwise, it does have an overflow table.
    for line in lines:
        if find_match(line): 
            return False
        if is_table_start(line.replace("\n", "").replace(" ", "").upper()):
            return True
    return False
    
def next_valid_table(tables, idx, current_course_code):
    # Valid table has 10 columns. The PDFs sometimes treat blobs of text as tables, hence why we
    # need this filter.
    for i in range(idx, len(tables)):
        if len(tables[i][0]) >= 10:
            return i
            
    return idx

def convert_to_delivery_mode_enum(s):
    if (s == "In-person"):
        return "IN_PERSON"
    elif (s == "Online - Synchronous"):
        return "ONLINE_SYNCHRONOUS"
    elif (s == "Online - Asynchronous"):
        return "ONLINE_ASYNCHRONOUS"

def find_meeting_section(s, idx, table, prev_table):
    full_table = prev_table + table
    idx = idx + len(prev_table)
    if full_table[idx][0] and len(full_table[idx][0]) > 0 and not is_table_start(full_table[idx][0]):
        return full_table[idx][0]
    elif idx-1 >= 0 and full_table[idx-1][0] and len(full_table[idx-1]) > 0 and not is_table_start(full_table[idx -1][0]):
        return full_table[idx-1][0]
    elif idx-2 >= 0 and full_table[idx-2][0] and len(full_table[idx-2]) > 0 and not is_table_start(full_table[idx - 2][0]):
        return full_table[idx-2][0]
    elif idx-2 >= 0 and full_table[idx-2][0] and len(full_table[idx-2]) > 0 and not is_table_start(full_table[idx - 3][0]):
        return full_table[idx-3][0]
    else:
        return ""

def handle_invalid_table(table, current_course_code):
    for row_ in table:
        for content in row_:
                if not content: continue
                # print(content)
                pattern = r'(?<=\n)(?:\b(?:LEC|TUT|PRA)\d{2,4}\b|\b(?:MO|TU|WE|TH|FR|SA|SU)\b)' # start of a valid row
                end_pattern = r'Add to'
                match_starts = [m.start() for m in re.finditer(pattern, content)]
                match_ends = [m.start() for m in re.finditer(end_pattern, content)]
                prev_meeting_section = ""
                for start, end in zip(match_starts, match_ends):
                    row = content[start:end].replace("\n", " ").replace("\uf067", " ").split(" ")
                    if row[0] in ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]:
                        row.insert(0, "")
                    # print(row)
                    if len(row) < 10:
                        continue
                    if row[4] == "Available":
                        row.pop(5)
                        row.pop(5)
                        row[4] = "Available on ACORN"
                    if len(row) >= 10:
                        meeting_section = (row[0] if len(row[0]) > 0 else prev_meeting_section).replace("\n", "")
                        prev_meeting_section = meeting_section
                        day = row[1].replace("\n", "") if row[1] else None
                        start = row[2].replace("\n", "") if row[2] else None
                        end = row[3].replace("\n", "") if row[3] else None
                        location = row[4].replace("\n", "") if row[4] else None
                        current = row[5].replace("\n", "") if row[5] else None
                        max_capacity = row[6].replace("\n", "") if row[6] else None
                        wait = (True if row[7].replace("\n", "") == 'Y' else False) if row[7] else None
                        delivery_mode = convert_to_delivery_mode_enum(row[8].replace("\n", "")) if row[8] else None

                        row[9] = row[9] + " " + row[10] # complete instructor full name
                        row.pop(10)

                        instructor = row[9].replace("\n", "") if row[9] else None
                        notes = row[10].replace("\n", "") if len(row) > 10 and row[10] else None

                        data.append([
                            current_course_code, meeting_section, session, day, start, end, location,
                            current, max_capacity, wait, delivery_mode, instructor, notes
                        ])


def process_table(table, course_code, prev_table):
    if table[0][0] == '':
        # print(table)
        handle_invalid_table(table, course_code)
    else:
        for idx, row in enumerate(table):
            if row[0] and is_table_start(row[0].replace("\n", "").replace(" ", "").upper()): # Skip header
                continue
            if len(row) >= 10:  # Ensure it's a valid row
                meeting_section = find_meeting_section(row[0], idx, table, prev_table).replace("\n", "")
                day = row[1].replace("\n", "") if row[1] else None
                start = row[2].replace("\n", "") if row[2] else None
                end = row[3].replace("\n", "") if row[3] else None
                location = row[4].replace("\n", "") if row[4] else None
                current = row[5].replace("\n", "") if row[5] else None
                max_capacity = row[6].replace("\n", "") if row[6] else None
                wait = (True if row[7].replace("\n", "") == 'Y' else False) if row[7] else None
                delivery_mode = convert_to_delivery_mode_enum(row[8].replace("\n", "")) if row[8] else None
                instructor = row[9].replace("\n", "") if row[9] else None
                notes = row[10].replace("\n", "") if len(row) > 10 and row[10] else None

                data.append([
                    current_course_code, meeting_section, session, day, start, end, location,
                    current, max_capacity, wait, delivery_mode, instructor, notes
                ])
    


# Extraction flow
with pdfplumber.open(pdf_path) as pdf:
    current_course_code = ""
    prev_page_table = []
    for idx, page in enumerate(pdf.pages):
        text = page.extract_text()
        tables = page.extract_tables()
        tables_read_this_page = 0

        # print(f"\n>>>> Page {idx} ")
        
        if text:
            lines = text.split("\n")
            # continue previous table
            if page_has_overflow_table(lines):
                # print(f"Processing overflow table!\n")
                process_table(tables[0], current_course_code, prev_page_table)
                tables_read_this_page += 1
            for line in lines:
                match = find_match(line) # match a course code
                if match:
                    current_course_code = match.group(2) 
                    # print(current_course_code)
                    # Process the next available table
                    if tables and tables_read_this_page < len(tables): 
                        tables_read_this_page = next_valid_table(tables, tables_read_this_page, current_course_code)
                        # print(f"Processing table number {tables_read_this_page}:  {tables[tables_read_this_page]}")
                        process_table(
                            tables[tables_read_this_page], 
                            current_course_code, 
                            tables[tables_read_this_page - 1] if tables_read_this_page > 0 else prev_page_table
                        )
                        tables_read_this_page += 1
        prev_page_table = tables[-1] if tables else []
        # print(prev_page_table)
    

with open(csv_path, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(headers)
    writer.writerows(data)

print(f"CSV file '{csv_path}' created successfully.")
