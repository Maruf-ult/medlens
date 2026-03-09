import json
import pandas as pd
from pathlib import Path
from tqdm import tqdm

INPUT_CSV  = Path('E:/medlens/data/raw/pmcpatients/PMC-Patients.csv')
OUTPUT_FILE = Path('E:/medlens/data/processed/pmcpatients.jsonl')
TARGET = 5000

Path('E:/medlens/data/processed').mkdir(parents=True, exist_ok=True)
Path('E:/medlens/data/raw/pmcpatients').mkdir(parents=True, exist_ok=True)

print(f'Reading {INPUT_CSV}...')

df = pd.read_csv(INPUT_CSV, nrows=TARGET)
print(f'Loaded {len(df)} rows')
print(f'Columns: {list(df.columns)}')

count = 0
with open(OUTPUT_FILE, 'w') as f:
    for _, row in tqdm(df.iterrows(), total=len(df), desc='Processing'):

        # Get patient summary — try different column names
        summary = ''
        for col in ['patient', 'Patient', 'summary', 'text', 'patient_summary']:
            if col in df.columns:
                summary = str(row.get(col, '')).strip()
                if summary and summary != 'nan':
                    break

        if len(summary) < 100:
            continue

        age = str(row.get('age', row.get('Age', ''))).strip()
        sex = str(row.get('sex', row.get('Sex', row.get('gender', '')))).strip()

        item = {
            'source': 'pmcpatients',
            'specialty': 'Case Report',
            'text': f'Patient: {age} {sex}\n\n{summary}',
            'metadata': {
                'age': age,
                'sex': sex,
                'patient_id': str(row.get('patient_id', row.get('id', ''))),
            }
        }
        f.write(json.dumps(item) + '\n')
        count += 1

print(f'✅ Done! {count} records saved to {OUTPUT_FILE}')