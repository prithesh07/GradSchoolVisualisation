from flask import Flask, render_template, jsonify
import pandas as pd
import json

app = Flask(__name__)

# Load the CSV into a DataFrame
universities_df = pd.read_csv('universities.csv')

# Function to create a proportionally sampled subset of universities
def get_proportional_sample(universities_df, sample_size):
    country_counts = universities_df['Country'].value_counts()
    proportions = country_counts / country_counts.sum()
    proportional_allocation = (proportions * sample_size).round().astype(int)

    data_frames = []
    for country, count in proportional_allocation.items():
        country_df = universities_df[universities_df['Country'] == country]
        top_universities = country_df.sort_values(by='2024 RANK', ascending=True).head(count)
        data_frames.append(top_universities)

    # Concatenate all data frames to create the proportional sample
    proportional_sample = pd.concat(data_frames, ignore_index=True)

    # Ensure there are no duplicates based on `InstitutionName`
    proportional_sample = proportional_sample.drop_duplicates(subset='InstitutionName')

    # If the sample size is less than required, add more from the overall ranking
    if len(proportional_sample) < sample_size:
        remaining = sample_size - len(proportional_sample)
        additional_universities = universities_df.sort_values(by='2024 RANK').head(remaining)
        proportional_sample = pd.concat([proportional_sample, additional_universities], ignore_index=True)

        # Ensure no duplicates after adding additional universities
        proportional_sample = proportional_sample.drop_duplicates(subset='InstitutionName')

    return proportional_sample

@app.route('/')
def index():
    # Get the proportional sample
    proportional_sample = get_proportional_sample(universities_df, sample_size=998)

    # Check for duplicate institution names
    duplicates = proportional_sample['InstitutionName'].duplicated().sum()
    if duplicates > 0:
        raise AssertionError(f"Found {duplicates} duplicate institutions with the same name. Please check the data.")

    # Save the unique proportional sample to CSV
    proportional_sample.to_csv('static/sampled_universities.csv', index=False)

    # Render the template with the full universities data (as JSON)
    universities_json = universities_df.to_json(orient='records')

    return render_template('index.html', universities_data=universities_json)

if __name__ == '__main__':
    app.run(debug=True)
