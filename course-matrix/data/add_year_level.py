import csv
import sys

def get_year_level(code):
    if len(code) >= 4:
        fourth_char = code[3]
        if fourth_char == 'A':
            return "1st year"
        elif fourth_char == 'B':
            return "2nd year"
        elif fourth_char == 'C':
            return "3rd year"
        elif fourth_char == 'D':
            return "4th year"
    return ""  # Default empty string if code is too short or doesn't match

def process_csv(input_file, output_file):
    with open(input_file, 'r', newline='', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames + ['year_level']
        
        with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for row in reader:
                row['year_level'] = get_year_level(row['code'])
                writer.writerow(row)
    
    print(f"Successfully processed {input_file} and created {output_file} with year_level column added.")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        process_csv(sys.argv[1], sys.argv[2])
    else:
        input_file = "./tables/courses.csv"
        output_file = "./tables/courses_with_year.csv"
        process_csv(input_file, output_file)