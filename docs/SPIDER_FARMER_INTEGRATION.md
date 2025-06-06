# Spider Farmer GGS Integration

This document explains how to integrate your Spider Farmer GGS controller with GrowLogger for automatic environmental data logging.

## Overview

GrowLogger provides a dedicated API endpoint that accepts data from Spider Farmer GGS controllers, automatically converting and storing environmental readings in your grow log.

## API Endpoint

**URL:** `POST /api/environment/spider-farmer`

**Content-Type:** `application/json`

## Supported Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `temperature` | Number | Temperature reading (°F) | No |
| `humidity` | Number | Humidity percentage (0-100) | No |
| `ph` | Number | pH level (0-14) | No |
| `light_duration` | Number | Light duration in seconds | No |
| `vpd` | Number | Vapor Pressure Deficit | No |
| `timestamp` | String | ISO timestamp of reading | No |

## Example Request

```bash
curl -X POST http://your-growlogger-server:5000/api/environment/spider-farmer \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 76.2,
    "humidity": 62.5,
    "ph": 6.3,
    "light_duration": 64800,
    "vpd": 1.2,
    "timestamp": "2025-06-05T04:00:00Z"
  }'
```

## Response

```json
{
  "id": 2,
  "message": "Environment data received from Spider Farmer GGS",
  "logged_at": "2025-06-05T04:00:00.000Z"
}
```

## Configuration

### Spider Farmer GGS Setup

1. Access your Spider Farmer GGS controller's web interface
2. Navigate to the API/Webhook settings
3. Configure HTTP POST requests to: `http://your-growlogger-server:5000/api/environment/spider-farmer`
4. Set the request format to JSON
5. Map your sensor data to the supported parameters above

### Data Conversion

The endpoint automatically handles the following conversions:

- **Light Duration**: Converts seconds to hours for storage
- **VPD**: Stored in the notes field as "VPD: {value}"
- **Timestamp**: Converts to ISO format if provided, otherwise uses current time
- **Auto-logging**: Adds "Auto-logged from Spider Farmer GGS" to notes if no VPD provided

## Viewing Data

Once configured, your Spider Farmer data will appear in:

1. **Environment Page**: Real-time readings and historical logs
2. **Weekly Stats**: Averaged environmental data over time
3. **Latest Reading Cards**: Current environmental conditions

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure GrowLogger is running and accessible from your GGS controller
2. **Invalid Data**: Check that your GGS is sending data in the expected format
3. **Missing Readings**: Verify the webhook URL and network connectivity

### Testing the Integration

You can test the endpoint manually:

```bash
# Test basic functionality
curl -X POST http://localhost:5000/api/environment/spider-farmer \
  -H "Content-Type: application/json" \
  -d '{"temperature": 75.0, "humidity": 60.0}'

# Test with all parameters
curl -X POST http://localhost:5000/api/environment/spider-farmer \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 76.2,
    "humidity": 62.5,
    "ph": 6.3,
    "light_duration": 64800,
    "vpd": 1.2,
    "timestamp": "2025-06-05T04:00:00Z"
  }'
```

## Security Considerations

- Consider setting up authentication if your GrowLogger instance is exposed to the internet
- Use HTTPS in production environments
- Implement rate limiting if needed (basic rate limiting is already included)

## Support

For issues with the integration:

1. Check the GrowLogger backend logs for error messages
2. Verify your Spider Farmer GGS configuration
3. Test the endpoint manually using curl or similar tools
4. Ensure network connectivity between devices 