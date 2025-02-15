import pandas as pd

def remove_duplicates(input_file: str, output_file: str, key_column: str):
    df = pd.read_csv(input_file)
    
    df_deduplicated = df.drop_duplicates(subset=[key_column], keep='first')
    
    df_deduplicated.to_csv(output_file, index=False)
    print(f"Duplicates removed. Cleaned file saved as: {output_file}")

if __name__ == "__main__":
    input_file = "courses.csv"
    output_file = "courses.csv"
    key_column = "code" 
    
    remove_duplicates(input_file, output_file, key_column)
