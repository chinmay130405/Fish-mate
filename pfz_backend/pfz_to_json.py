import pandas as pd
import json

# Load merged PFZ CSV
csv_path = 'merged_pfz.csv'  # Change to your actual file path
out_path = 'pfz_weighted.json'

df = pd.read_csv(csv_path)

# Group by coordinates and count frequency
freq = df.groupby(['Lat_dd_dec', 'Long_DD_dec']).size().reset_index(name='count')

# Normalize frequency to 0-1
max_count = freq['count'].max()
freq['weight'] = freq['count'] / max_count

# Sort by frequency and keep top 100
top = freq.sort_values('count', ascending=False).head(100)

# Convert to list of [lat, lon, weight]
result = top[['Lat_dd_dec', 'Long_DD_dec', 'weight']].values.tolist()

# Save to JSON file
with open(out_path, 'w') as f:
    json.dump(result, f)

print(f"Saved {len(result)} points to {out_path}")
