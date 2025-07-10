# Emerald Plant Tracker - Copilot Instructions

## Project Overview

This is a **cannabis cultivation tracking application** with advanced analytics,
IoT integration, and mobile optimization. The system is **Docker-first** with
privacy-focused self-hosting requirements.

**Core Architecture**: React 19.1 + Express 5.1 + PostgreSQL 16, deployed as
single Docker container on port 420.

## Essential Development Patterns

### Docker-First Development Workflow

**ALWAYS use the development script** - never run npm/bun commands directly:

```bash
./start-dev.sh  # Starts PostgreSQL + backend in Docker, frontend with Bun
```

**Key Services:**

- Backend: `http://localhost:420` (Docker container)
- Frontend: `http://localhost:3000` (Bun dev server with proxy)
- Database: PostgreSQL on port 5433 (Docker)

### Build System: Bun + Docker

**Frontend uses Bun** (150x faster than npm):

```bash
cd frontend && bun install    # Install dependencies
bun run build               # Production build
bun run serve              # Development server
```

**Backend uses npm** in Docker containers:

```bash
docker exec emerald_backend_dev npm run migrate  # Run migrations
```

### Cannabis Domain Conventions

**Growth Stages**: `seedling`, `vegetative`, `flowering`, `harvested` (hardcoded
enum) **Port 420**: Cannabis-themed default port (configurable for enterprise)
**Tent-Based Organization**: Multi-tent support with `grow_tent` string
identifier

## Database Architecture

### PostgreSQL Schema (Migrated from SQLite)

**Core Tables:**

- `plants`: Main plant tracking with growth stages
- `environment`: Environmental data (temp, humidity, VPD, etc.)
- `logs`: Activity logging with photo support
- `analytics_data`: Calculated insights and predictions
- `iot_sensors`: IoT sensor configuration and metadata

**Migration Pattern**: Always use `backend/migrations/` with rollback support

```javascript
// Migration example
module.exports = {
  up: async query => {
    await query(`CREATE TABLE new_feature (...)`);
  },
  down: async query => {
    await query(`DROP TABLE new_feature`);
  },
};
```

### Data Relationships

**Plant-Centric Design**: Everything relates to plants via `plant_id` foreign
keys **Tent Aggregation**: Analytics grouped by `grow_tent` for multi-space
tracking **Time-Series Data**: Environment and analytics use `TIMESTAMPTZ` for
time-based queries

## API Design Patterns

### Route Organization

```
backend/routes/
├── v1/              # Legacy API (maintain compatibility)
├── plants.js        # Core CRUD operations
├── analytics.js     # Advanced analytics with AI
├── environment.js   # Environmental monitoring
└── nutrients.js     # Nutrient calculator backend
```

### Standard Response Format

```javascript
{
  success: true,
  data: { /* main payload */ },
  meta: {
    processing_time_ms: 150,
    timestamp: "2025-07-06T...",
    version: "v2"
  }
}
```

### Validation with Joi

```javascript
const plantSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  stage: Joi.string().valid('seedling', 'vegetative', 'flowering', 'harvested'),
  grow_tent: Joi.string().max(50).allow(null, ''),
});
```

## Frontend Architecture

### Component Organization

```
src/
├── components/
│   ├── analytics/           # Advanced analytics components
│   ├── mobile/             # Mobile-optimized components
│   └── [feature]/          # Feature-specific components
├── pages/                  # Route-level components
├── hooks/                  # Custom React hooks for data
├── utils/                  # API clients and utilities
└── styles/                 # CSS modules and themes
```

### State Management Patterns

**React Hooks + Local State** (no Redux):

```javascript
// Custom hooks for data fetching
const { plants, loading, error } = usePlants();
const { analytics } = useAnalytics(plantId);
const { sensors } = useIoTSensors();
```

**React Query for Server State** (newer components):

```javascript
const { data: analytics, isLoading } = useQuery({
  queryKey: ['analytics', plantId],
  queryFn: () => analyticsAPI.getPlantAnalytics(plantId),
});
```

### Cannabis-Themed UI Patterns

**Color Scheme**: Dark theme with green accent (`#10b981`) **Stage Colors**:
Defined in `utils/stageColors.js` with growth stage mapping **Cannabis Icons**:
Emoji-based system (`🌱`, `🌿`, `🌸`, `🌾`)

## Analytics & AI Integration

### TensorFlow.js Client-Side AI

```javascript
// Model loading pattern
const loadModel = async () => {
  const model = await tf.loadLayersModel('/models/yield-prediction.json');
  return model;
};

// Prediction pattern
const predictYield = async (plantData, environmentData) => {
  const prediction = model.predict(preprocessedData);
  return prediction.dataSync()[0];
};
```

### Analytics Engine Service

```javascript
// Backend service pattern
const AnalyticsEngine = {
  async processPlantAnalytics(plantId) {
    const historicalData = await getHistoricalData(plantId);
    const predictions = await runMLPredictions(historicalData);
    return formatAnalyticsResponse(predictions);
  },
};
```

## IoT & Sensor Integration

### MQTT Pattern for Sensors

```javascript
// Sensor data flow
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

client.on('message', async (topic, message) => {
  const sensorData = JSON.parse(message.toString());
  await saveSensorReading(topic, sensorData);
  emitRealTimeUpdate(sensorData);
});
```

### Sensor Configuration

```javascript
// Standard sensor config
{
  sensor_name: "Tent 1 Temperature",
  sensor_type: "temperature",
  protocol: "MQTT",
  connection_config: {
    broker: "mqtt://localhost:1883",
    topic: "sensors/tent1/temperature"
  },
  grow_tent: "Main Tent"
}
```

## Mobile Optimization

### Responsive Component Pattern

```javascript
// Mobile-first responsive wrapper
const ResponsiveWrapper = ({ children, mobileComponent }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? mobileComponent : children;
};
```

### Touch-Optimized Forms

```javascript
// Touch targets and mobile form patterns
const TouchOptimizedForm = () => (
  <form className="mobile-form">
    <input
      className="touch-target" // min 44px touch target
      type="text"
      style={{ fontSize: '16px' }} // Prevent zoom on iOS
    />
  </form>
);
```

## Testing Patterns

### API Testing with Supertest

```javascript
describe('Analytics API', () => {
  test('GET /api/analytics/plants/:id', async () => {
    const response = await request(app)
      .get('/api/analytics/plants/123')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('yield_prediction');
  });
});
```

### React Testing Library

```javascript
// Component testing pattern
test('renders analytics dashboard', () => {
  render(<AnalyticsDashboard plantId="123" />);
  expect(screen.getByText('Yield Prediction')).toBeInTheDocument();
});
```

## Critical Integration Points

### Nutrient Calculator Domain Logic

**Brand Configuration Structure** in `models/nutrientData-2025.js`:

```javascript
const nutrientBrands = {
  'general-hydroponics': {
    name: 'General Hydroponics Flora Series (2025 Reformulated)',
    products: {
      seedling: [
        { name: 'FloraMicro', ratio: 1.25, unit: 'ml/gal' },
        { name: 'FloraGro', ratio: 1.25, unit: 'ml/gal' },
      ],
      // vegetative, flowering stages...
      supplements: [
        { name: 'CALiMAGic', ratio: 2.5, unit: 'ml/gal', optional: true },
        { name: 'RapidStart', ratio: 1.25, unit: 'ml/gal', earlyGrowth: true },
      ],
    },
    strengthMultipliers: { light: 0.5, medium: 1.0, aggressive: 1.5 },
    targetEC: { seedling: { light: 0.3, medium: 0.6, aggressive: 0.9 } },
  },
};
```

**Calculator Integration Patterns**:

- **localStorage Persistence**: All user preferences auto-saved with
  `nutrientCalculator_` prefix
- **Dynamic API Loading**: Brands fetched from `/api/nutrients/brands` endpoint
- **Growth Stage Logic**: Automatic ratio adjustments based on plant development
  stage
- **Medium-Specific Calculations**: Hydro vs soil vs coco feeding strength
  modifications
- **Watering Method Adjustments**: Hand-watering vs drip vs aero concentration
  scaling

**Key Calculator Functions**:

```javascript
// Auto-save preferences pattern
const savePreference = (key, value) => {
  localStorage.setItem(`nutrientCalculator_${key}`, JSON.stringify(value));
};

// Multi-stage calculation pipeline
const calculateNutrients = () => {
  const baseRatios = getStageRatios(growthStage);
  const adjustedRatios = applyStrengthMultiplier(baseRatios, feedingStrength);
  const scaledAmounts = scaleForTankSize(adjustedRatios, tankSize);
  return applyMediumAdjustments(scaledAmounts, growMedium);
};
```

## Advanced Chart.js Integration

### Chart Component Architecture

**Base Chart Configuration**:

```javascript
// Standard Chart.js setup with cannabis theming
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#e2e8f0', // Cannabis dark theme colors
        font: { size: 12, weight: '500' },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      titleColor: '#10b981', // Cannabis green accent
      bodyColor: '#e2e8f0',
    },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
    },
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
    },
  },
};
```

**Advanced Chart Types** with `AdvancedAnalyticsChart.js`:

```javascript
// Multi-axis charts for correlating metrics
const multiAxisConfig = {
  scales: {
    y: {
      type: 'linear',
      position: 'left',
      title: { display: true, text: 'Growth Rate (%)' },
    },
    y1: {
      type: 'linear',
      position: 'right',
      title: { display: true, text: 'Environmental Score' },
      grid: { drawOnChartArea: false },
    },
  },
};

// Cannabis cultivation optimal range annotations
const optimalRanges = {
  seedling: { temperature: [70, 77], humidity: [65, 70], vpd: [0.4, 0.8] },
  vegetative: { temperature: [70, 80], humidity: [40, 70], vpd: [0.8, 1.2] },
  flowering: { temperature: [65, 80], humidity: [40, 50], vpd: [1.0, 1.5] },
};
```

**Chart Performance Patterns**:

```javascript
// Memory leak prevention
const ChartComponent = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      // Destroy chart instance on unmount
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Chart.js instance management
  const updateChart = useCallback(newData => {
    if (chartRef.current) {
      chartRef.current.data = newData;
      chartRef.current.update('none'); // No animation for performance
    }
  }, []);
};
```

**Cannabis-Specific Chart Features**:

- **Growth Stage Colors**: Automatic color coding based on plant development
  stage
- **VPD Calculation Charts**: Vapor pressure deficit visualization for optimal
  growing
- **Yield Prediction Trends**: TensorFlow.js integration for ML-powered
  forecasting
- **Environmental Correlation**: Multi-metric charts showing
  temp/humidity/growth relationships
- **Technique Effectiveness**: Radar charts for LST, SCROG, topping, defoliation
  analysis

### Environmental Data Flow

```
IoT Sensors → MQTT → Backend Service → PostgreSQL → Analytics Engine → Frontend Dashboard
```

## Advanced Analytics Engine Patterns

### Service Architecture in `services/analyticsEngine.js`

**Core Processing Pipeline**:

```javascript
// Analytics calculation workflow
class AnalyticsEngine {
  static async processHistoricalData(plantId, options = {}) {
    // 1. Check for recent calculations to avoid duplicate work
    const existingAnalytics = await AnalyticsModel.getLatest(plantId);
    if (
      !forceRecalculation &&
      this.isRecentCalculation(existingAnalytics.calculation_date)
    ) {
      return existingAnalytics;
    }

    // 2. Gather multi-source historical data
    const plantData = await this.getPlantData(plantId);
    const historicalData = await this.getHistoricalData(
      plantId,
      startDate,
      endDate
    );

    // 3. Run cannabis-specific calculations
    const analytics = await this.calculateAnalytics(plantData, historicalData);

    // 4. Store and cache results
    return await AnalyticsModel.save(plantId, analytics);
  }
}
```

**Cannabis-Specific Calculations**:

```javascript
// VPD (Vapor Pressure Deficit) calculation for optimal growing
const calculateVPD = (temperature, humidity) => {
  const saturationVaporPressure =
    0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
  const actualVaporPressure = saturationVaporPressure * (humidity / 100);
  return saturationVaporPressure - actualVaporPressure;
};

// Growth stage transition predictions
const predictStageTransition = (plantData, environmentalData) => {
  const daysInStage = calculateDaysInCurrentStage(plantData);
  const environmentalScore =
    calculateEnvironmentalOptimality(environmentalData);
  return {
    nextStageETA: calculateTransitionDate(daysInStage, environmentalScore),
    confidence: calculatePredictionConfidence(plantData, environmentalData),
  };
};
```

**Data Aggregation Patterns**:

```javascript
// Time-series aggregation for trend analysis
const aggregateEnvironmentalData = async (plantId, period) => {
  const sql = `
    SELECT 
      DATE_TRUNC('day', logged_at) as date,
      AVG(temperature) as avg_temp,
      AVG(humidity) as avg_humidity,
      AVG(calculated_vpd) as avg_vpd
    FROM environment 
    WHERE plant_id = $1 AND logged_at >= NOW() - INTERVAL '${period} days'
    GROUP BY DATE_TRUNC('day', logged_at)
    ORDER BY date
  `;
  return await query(sql, [plantId]);
};
```

### AI Model Integration

**TensorFlow.js Client-Side Processing**:

```javascript
// Model loading and caching strategy
const ModelManager = {
  models: new Map(),

  async loadModel(modelName) {
    if (this.models.has(modelName)) {
      return this.models.get(modelName);
    }

    const model = await tf.loadLayersModel(`/models/${modelName}.json`);
    this.models.set(modelName, model);
    return model;
  },

  async predictYield(plantData, environmentalData) {
    const model = await this.loadModel('yield-prediction');
    const processedInput = this.preprocessData(plantData, environmentalData);
    const prediction = model.predict(processedInput);
    return prediction.dataSync()[0];
  },
};
```

### Background Processing

**Scheduled Analytics Updates**:

```javascript
// Cron-based analytics processing
const cron = require('node-cron');

// Run analytics every 6 hours for active plants
cron.schedule('0 */6 * * *', async () => {
  const activePlants = await query(
    'SELECT id FROM plants WHERE archived = false'
  );

  for (const plant of activePlants) {
    try {
      await AnalyticsEngine.processHistoricalData(plant.id);
    } catch (error) {
      console.error(`Analytics failed for plant ${plant.id}:`, error);
    }
  }
});
```

## Mobile Optimization Architecture

### Responsive Design Patterns

**Mobile-First CSS Architecture**:

```css
/* Touch target minimum sizes (44px Apple HIG, 48px Android) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Prevent zoom on iOS form inputs */
input,
select,
textarea {
  font-size: 16px; /* Prevents iOS zoom when font-size < 16px */
}

/* Mobile navigation with smooth transitions */
.mobile-nav-drawer {
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  will-change: transform; /* Optimize for animations */
}

.mobile-nav-drawer.is-open {
  transform: translateX(0);
}
```

**Responsive Component Wrapper Pattern**:

```javascript
// Conditional rendering based on screen size
const ResponsiveComponent = ({ children, mobileComponent }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? mobileComponent : children;
};
```

### Touch Interaction Patterns

**Swipe Gesture Navigation**:

```javascript
// Touch handling in MobileNavigation.js
const handleTouchStart = e => {
  setTouchStartX(e.targetTouches[0].clientX);
};

const handleTouchMove = e => {
  setTouchEndX(e.targetTouches[0].clientX);
};

const handleTouchEnd = () => {
  if (!touchStartX || !touchEndX) return;

  const distance = touchStartX - touchEndX;
  const isLeftSwipe = distance > 50;
  const isRightSwipe = distance < -50;

  if (isLeftSwipe && isOpen) {
    setIsOpen(false); // Close drawer on left swipe
  }
};
```

**Mobile Form Optimization**:

```javascript
// Mobile-optimized form components
const MobileFormField = ({ label, type = 'text', ...props }) => (
  <div className="mobile-form-field">
    <label className="mobile-label">{label}</label>
    <input
      type={type}
      className="mobile-input touch-target"
      style={{ fontSize: '16px' }} // Prevent iOS zoom
      {...props}
    />
  </div>
);

// Auto-expanding textarea for mobile
const MobileTextArea = ({ value, onChange, ...props }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className="mobile-textarea"
      style={{ fontSize: '16px', resize: 'none' }}
      {...props}
    />
  );
};
```

### Mobile Navigation Strategy

**Drawer Navigation Implementation**:

```javascript
// Mobile navigation with accessibility and performance optimization
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus management for accessibility
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on route change
  const location = useLocation();
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* Backdrop with click-to-close */}
      {isOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setIsOpen(false)}
          style={{ touchAction: 'none' }} // Prevent scroll
        />
      )}

      {/* Drawer with focus trap */}
      <nav
        ref={drawerRef}
        className={`mobile-nav-drawer ${isOpen ? 'is-open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation items with proper touch targets */}
      </nav>
    </>
  );
};
```

## Docker Development Workflow

### Multi-Container Development Setup

**Development Compose Strategy** in `docker-compose.dev.yml`:

```yaml
# PostgreSQL with health checks and data persistence
postgres:
  image: postgres:16-alpine
  container_name: emerald_postgres_dev
  ports:
    - '5433:5432' # Non-standard port to avoid conflicts
  environment:
    - POSTGRES_DB=emerald_db
    - POSTGRES_USER=plant_user
    - POSTGRES_PASSWORD=securepassword
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ['CMD-SHELL', 'pg_isready -U plant_user -d emerald_db']
    interval: 30s
    timeout: 10s
    retries: 3

# Backend with hot reload and volume mounting
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile.dev
  volumes:
    - ./backend:/app # Source code hot reload
    - /app/node_modules # Prevent overwriting node_modules
    - ./backend/uploads:/app/uploads # Persistent uploads
  environment:
    - NODE_ENV=development
    - DB_HOST=postgres # Docker internal networking
  depends_on:
    postgres:
      condition: service_healthy # Wait for DB to be ready
```

### Development Script Architecture

**Docker Permission Management** in `start-dev.sh`:

```bash
# Automatic Docker group permission handling
if ! docker info > /dev/null 2>&1; then
  echo "🔧 Docker access issue detected. Checking permissions..."

  # Add user to docker group if not already there
  if ! groups $USER | grep -q docker; then
    sudo usermod -aG docker $USER
    echo "✅ Added user to docker group"
  fi

  # Re-execute script with proper Docker group permissions
  if ! id -Gn | grep -q docker; then
    exec sg docker -c "$0 $*"
  fi
fi
```

**Service Orchestration Pattern**:

```bash
# Sequential startup with dependency management
echo "🐳 Starting PostgreSQL and backend services..."
docker compose -f docker-compose.dev.yml up -d postgres backend

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo "🔄 Running database migrations..."
docker exec emerald_backend_dev npm run migrate

echo "⚡ Building and starting Bun-powered frontend..."
cd frontend

# Bun installation and build process
BUN_CMD="bun"
if ! command -v bun &> /dev/null; then
    BUN_CMD="~/.bun/bin/bun"
fi

$BUN_CMD install
$BUN_CMD run build
$BUN_CMD run serve  # Development server with hot reload
```

### Container Build Optimization

**Multi-Stage Dockerfile Strategy**:

```dockerfile
# Backend development container
FROM node:22-alpine
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source code (changes more frequently)
COPY . .

# Use nodemon for hot reload in development
CMD ["npm", "run", "dev"]
```

**Bun-Powered Frontend Container**:

```dockerfile
# Frontend with Bun (150x faster than npm)
FROM oven/bun:1.1-alpine
WORKDIR /app

# Install dependencies with lockfile for consistency
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
EXPOSE 3000

# Bun development server with hot reload
CMD ["bun", "run", "start"]
```

### Database Migration Workflow

**Migration Execution Pattern**:

```bash
# Safe migration with rollback capability
docker exec emerald_backend_dev npm run migrate

# Check migration status
docker exec emerald_backend_dev npm run migrate:status

# Rollback if needed
docker exec emerald_backend_dev npm run migrate:rollback
```

**Volume Management Strategy**:

```yaml
volumes:
  postgres_data: # Database persistence
  emerald_uploads: # File upload persistence
  node_modules_cache: # Dependency caching
```

### Photo Upload & OCR Processing

**Tesseract.js Integration** for environmental controller parsing:

```javascript
// OCR configuration for environmental controllers
const parseSpiderFarmerScreenshot = async imageFile => {
  const {
    data: { text },
  } = await Tesseract.recognize(imageFile, 'eng', {
    tessedit_char_whitelist:
      '0123456789.°C%kPa ppm μmol/s-+:VPDCOTemperatureHumidityAir ',
  });

  // Brand-specific parsing patterns
  const temperature = text.match(/Temperature[:\s]*(\d+\.?\d*)°?C/i);
  const humidity = text.match(/Humidity[:\s]*(\d+\.?\d*)%/i);
  const vpd = text.match(/VPD[:\s]*(\d+\.?\d*)/i);
};
```

**Supported Controller Brands**:

- Spider Farmer environmental controllers
- AC Infinity climate systems
- Vivosun environmental monitors
- Mars Hydro climate controllers

**OCR Processing Pipeline**:

```javascript
// Complete OCR workflow
const processEnvironmentalPhoto = async file => {
  // 1. Extract EXIF metadata for timestamp
  const metadata = await getImageMetadata(file);

  // 2. Run OCR with controller-specific patterns
  const ocrData = await parseControllerScreenshot(file);

  // 3. Validate and format data
  const validated = validateEnvironmentalData(ocrData);

  // 4. Auto-populate environment form
  return { ...validated, timestamp: metadata.timestamp };
};
```

**Image Processing with Sharp**:

- **Multer** for upload handling with size limits
- **Sharp** for image optimization and format conversion
- **EXIF extraction** for automatic timestamp detection
- **Upload validation** for supported image formats

## Common Gotchas

1. **Port 420 Conflicts**: Check if port is available before starting
2. **Bun vs NPM**: Frontend uses Bun, backend uses npm in Docker
3. **PostgreSQL Migrations**: Always test migration rollbacks
4. **Cannabis Stage Validation**: Use exact enum values in database
5. **Docker Group Permissions**: `start-dev.sh` handles Docker access
   automatically
6. **Mobile Safari Zoom**: Use `fontSize: '16px'` on inputs to prevent zoom
7. **Chart.js Memory**: Destroy chart instances to prevent memory leaks
8. **Sensor Data Validation**: Always validate IoT sensor readings before
   storage

## Quick Commands

```bash
# Development
./start-dev.sh                           # Start full dev environment
docker exec emerald_backend_dev npm run migrate  # Run migrations

# Frontend (from frontend/)
bun install && bun run build && bun run serve    # Build and serve

# Backend debugging
docker logs emerald_backend_dev          # View backend logs
docker exec -it emerald_backend_dev sh   # Shell into backend container

# Database
docker exec -it emerald_postgres_dev psql -U plant_user -d emerald_db  # Direct DB access
```
