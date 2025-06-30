# Spider Farmer GGS CSV Import Guide

## Overview
The Emerald Plant Tracker now supports importing environmental data from Spider Farmer GGS (Grow GPS) sensor exports. This feature allows you to bulk import temperature, humidity, and VPD readings with automatic duplicate detection and data validation.

## Supported CSV Format
The system expects CSV files with the following format from Spider Farmer GGS exports:

```csv
deviceSerialnum,temperature(°C),humidity,vpd,temperature(°F),Timestamp
,29.1,55.6,1.79,84.38,2025-05-21 00:30:01
,28.6,58.5,1.62,83.48,2025-05-21 01:00:01
```

### Column Mapping
- **temperature(°C)** → Database `temperature` field (Celsius)
- **humidity** → Database `humidity` field (percentage)
- **vpd** → Database `vpd` field (kPa)
- **Timestamp** → Database `logged_at` field (automatically converted to ISO format)
- **deviceSerialnum** → Not used (can be empty)
- **temperature(°F)** → Not used (Celsius version takes priority)

## How to Import

### 1. Via Web Interface
1. Navigate to the **Environment** page
2. Select your desired grow tent from the dropdown
3. Click the **Import CSV** button in the header
4. Select your Spider Farmer CSV file
5. Wait for the import to complete
6. Review the import summary

### 2. Via API (Advanced)
```bash
curl -X POST \
  -F "csvFile=@your_export.csv" \
  -F "grow_tent=Your Tent Name" \
  http://localhost:420/api/environment/import-csv
```

## Features

### ✅ Automatic Duplicate Detection
- Records are compared using timestamp matching (±1 minute tolerance)
- Duplicate records are automatically skipped
- Import summary shows how many duplicates were found

### ✅ Data Validation
- Required fields: timestamp, temperature, humidity
- Invalid timestamps are rejected
- Non-numeric values are handled gracefully
- Detailed error reporting for problematic rows

### ✅ Grow Tent Assignment
- All imported data is assigned to the selected grow tent
- Defaults to "Main Tent" if none specified

### ✅ Progress Feedback
- Real-time loading indicators during import
- Detailed success/error messages
- Statistics on imported, skipped, and error records

## Import Results

After import, you'll see a summary like:
```
Import completed! 150 records imported, 25 duplicates skipped.
```

### Statistics Breakdown
- **Total Parsed**: Number of rows successfully read from CSV
- **Imported**: New records added to database
- **Duplicates**: Records skipped due to existing similar data
- **Errors**: Invalid rows that couldn't be processed

## Data Quality Notes

### Timestamp Handling
- Spider Farmer timestamps are automatically converted to UTC
- Format: `YYYY-MM-DD HH:mm:ss` → ISO 8601
- Timezone assumed to be local system time

### Temperature Units
- Data is stored in Celsius as provided by Spider Farmer
- Frontend can display in Fahrenheit if needed

### VPD Calculations
- VPD values are imported directly from Spider Farmer calculations
- Units: kPa (kilopascals)

## Troubleshooting

### Common Issues

**"No CSV file uploaded"**
- Ensure you selected a file before clicking import
- Verify the file has a `.csv` extension

**"Invalid timestamp format"**
- Check that your CSV has the correct timestamp column
- Ensure timestamps follow: `YYYY-MM-DD HH:mm:ss` format

**"Only CSV files are allowed"**
- File must have `.csv` extension
- MIME type must be `text/csv`

**Import shows many errors**
- Check that your CSV matches the expected Spider Farmer format
- Verify column headers are exactly as shown above
- Ensure numeric fields contain valid numbers

### Large File Imports
- File size limit: 10MB
- For very large files, consider splitting into smaller chunks
- Import process handles up to several thousand records efficiently

## Best Practices

1. **Export Regularly**: Import Spider Farmer data weekly or monthly
2. **Backup First**: Always keep original CSV files as backups
3. **Review Results**: Check import statistics for any issues
4. **Tent Organization**: Use descriptive tent names for better organization
5. **Data Validation**: Review imported data in the Environment page

## Technical Details

### API Endpoint
- **URL**: `POST /api/environment/import-csv`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `csvFile`: The CSV file to import
  - `grow_tent`: Target grow tent name (optional)

### Database Storage
- Records stored in `environment_logs` table
- Automatic `created_at` timestamps for audit trail
- Relationship to grow tents and plants maintained

### Security
- File validation prevents non-CSV uploads
- Input sanitization on all data fields
- Temporary file cleanup after processing

---

*For technical support or feature requests, check the project's GitHub issues page.* 