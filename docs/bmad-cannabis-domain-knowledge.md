# Cannabis Cultivation Domain Knowledge for BMAD Agents

## Overview

This document provides specialized cannabis cultivation knowledge to enhance BMAD agents working on the Emerald Plant Tracker project. All agents should reference this knowledge when making decisions about features, requirements, and technical implementations.

## Cannabis Growth Stages and Terminology

### Primary Growth Stages

1. **Seedling Stage (1-3 weeks)**
   - Nutrient requirements: Very light feeding (25-50% strength)
   - Environmental needs: High humidity (65-70%), moderate temperature (70-75°F)
   - Key metrics: Root development, first true leaves
   - Common issues: Damping off, overwatering, nutrient burn

2. **Vegetative Stage (3-16 weeks)**
   - Nutrient requirements: High nitrogen, moderate phosphorus/potassium
   - Environmental needs: 18+ hours light, moderate humidity (40-60%)
   - Key metrics: Height, node development, leaf count
   - Training techniques: LST, HST, SCROG, topping, FIMing

3. **Pre-Flowering/Transition (1-2 weeks)**
   - Nutrient requirements: Reduced nitrogen, increased phosphorus
   - Environmental needs: 12/12 light cycle transition
   - Key metrics: Sex determination, stretch growth
   - Critical decisions: Defoliation, final training

4. **Flowering Stage (6-12 weeks)**
   - Nutrient requirements: Low nitrogen, high phosphorus/potassium
   - Environmental needs: 12 hours light, lower humidity (30-50%)
   - Key metrics: Bud development, trichome production, pistil color
   - Monitoring: Harvest timing, mold prevention

5. **Harvest and Curing (2-8 weeks)**
   - Activities: Drying, trimming, curing
   - Environmental needs: 60°F/60% humidity for drying
   - Key metrics: Moisture content, terpene preservation
   - Quality factors: Trichome color, aroma development

### Cannabis-Specific Measurements

- **PPM/EC**: Nutrient concentration measurements (parts per million/electrical conductivity)
- **PPFD**: Photosynthetic Photon Flux Density (light intensity measurement)
- **VPD**: Vapor Pressure Deficit (relationship between temperature and humidity)
- **DLI**: Daily Light Integral (total light received per day)

## Professional Nutrient Vendors and Products

### Major Cannabis Nutrient Brands

1. **General Hydroponics**
   - Flora Series (Micro, Gro, Bloom) - 3-part system
   - pH ranges: Hydro 5.5-6.5, Soil 6.0-7.0
   - Feeding schedules: Aggressive, Medium, Light levels

2. **Advanced Nutrients**
   - pH Perfect technology (automatic pH balancing)
   - Sensi Grow/Bloom A+B base nutrients
   - Extensive supplement line (Big Bud, Overdrive, Bud Candy)

3. **Fox Farm**
   - Soil Trio: Grow Big, Big Bloom, Tiger Bloom
   - Ocean Forest and Happy Frog soil amendments
   - Soluble trio for hydroponic applications

4. **Canna**
   - Medium-specific formulations (Terra, Coco, Aqua)
   - Dutch research-based nutrient ratios
   - Enzyme-focused approach to plant nutrition

5. **Jack's Nutrients (J.R. Peters)**
   - 321 system: Part A (20-20-20), CalNit, Epsom Salt
   - Professional greenhouse standard
   - Cost-effective for large operations

### Feeding Schedule Considerations

- **Growth stage adaptation**: Nutrient ratios change dramatically between vegetative and flowering
- **Medium specificity**: Soil, coco, and hydro require different nutrient approaches
- **Water quality**: Hard vs soft water affects CalMag requirements
- **Strain sensitivity**: Indica vs Sativa feeding preferences
- **Environmental factors**: Temperature and humidity affect nutrient uptake

## Environmental Monitoring and Control

### Critical Environmental Parameters

1. **Temperature**
   - Vegetative: 70-85°F (21-29°C)
   - Flowering: 65-80°F (18-27°C)
   - Night temperatures: 5-10°F lower than day

2. **Humidity (RH)**
   - Seedling: 65-70%
   - Vegetative: 40-60%
   - Flowering: 30-50% (lower to prevent mold)
   - Late flowering: 30-40%

3. **Vapor Pressure Deficit (VPD)**
   - Optimal range: 0.8-1.2 kPa
   - Calculated from temperature and humidity
   - Affects transpiration and nutrient uptake

4. **CO₂ Levels**
   - Ambient: 400-450 ppm
   - Enhanced: 1000-1500 ppm (with adequate ventilation)
   - Only beneficial with high light levels

5. **Light (PPFD)**
   - Seedling: 200-400 µmol/m²/s
   - Vegetative: 400-600 µmol/m²/s
   - Flowering: 600-1000 µmol/m²/s

### Popular Environmental Controllers

- **AC Infinity**: CloudLab series with app integration
- **Spider Farmer**: GGS (Grow GPS) sensors with data logging
- **Mars Hydro**: Smart controllers with environmental automation
- **Vivosun**: AeroLight series with wireless monitoring

## Cannabis Cultivation Techniques

### Training Methods

1. **Low Stress Training (LST)**
   - Bending branches to create even canopy
   - No cutting or breaking of plant tissue
   - Increases light penetration and yields

2. **High Stress Training (HST)**
   - Topping: Cutting main stem to create two colas
   - FIMing: Pinching growth tip to create multiple colas
   - Supercropping: Controlled stem damage to increase yields

3. **Screen of Green (SCROG)**
   - Horizontal screen to train branches
   - Maximizes light efficiency in limited space
   - Requires longer vegetative period

4. **Sea of Green (SOG)**
   - Many small plants flowered early
   - Shorter cycle times
   - Requires more plants and clones

### Harvest Timing Indicators

1. **Trichome Color**
   - Clear: Not ready
   - Cloudy/Milky: Peak THC
   - Amber: More sedative effects

2. **Pistil Color**
   - White: Early flowering
   - Orange/Brown: Approaching harvest
   - 70-80% brown: General harvest indicator

3. **Fade and Senescence**
   - Natural yellowing of fan leaves
   - Nutrient translocation to buds
   - Indicates plant maturity

## Privacy and Legal Considerations

### Self-Hosted Architecture Requirements

- **Data sovereignty**: All cultivation data must remain on user's hardware
- **No cloud dependencies**: System must function completely offline
- **Privacy by design**: No external analytics or tracking
- **Legal compliance**: Support for various legal jurisdictions

### Compliance Features

- **Plant count tracking**: Monitor legal plant limits
- **Cultivation logs**: Detailed records for legal compliance
- **Secure data storage**: Encrypted local storage
- **Access controls**: User authentication and data protection

## Integration with Emerald Plant Tracker Features

### Nutrient Calculator Domain Logic

- **Vendor-specific algorithms**: Each brand has unique calculation methods
- **Growth stage adjustments**: Automatic nutrient ratio changes
- **Medium compatibility**: Soil, coco, hydro require different approaches
- **Water quality compensation**: Hard/soft water adjustments

### Environmental Monitoring Integration

- **VPD calculations**: Real-time vapor pressure deficit computation
- **Trend analysis**: Historical environmental data patterns
- **Alert systems**: Notifications for out-of-range conditions
- **Automation triggers**: Environmental controller integration

### Plant Tracking Workflows

- **Growth stage progression**: Automatic or manual stage advancement
- **Training documentation**: Photo and note tracking for techniques
- **Harvest predictions**: Yield estimation based on historical data
- **Quality metrics**: Trichome development and harvest timing

### Analytics and AI Recommendations

- **Yield optimization**: Historical data analysis for improvement suggestions
- **Environmental correlations**: Link conditions to plant performance
- **Nutrient efficiency**: Optimize feeding schedules based on results
- **Problem identification**: Early detection of issues from patterns

## Technical Implementation Guidelines

### Database Schema Considerations

- **Growth stage tracking**: Proper enumeration of cannabis stages
- **Nutrient data modeling**: Vendor-specific product and ratio storage
- **Environmental data**: Time-series storage for trend analysis
- **Compliance fields**: Legal tracking and reporting requirements

### API Design Principles

- **Cannabis terminology**: Use proper cultivation language in endpoints
- **Growth stage context**: APIs should understand current plant stage
- **Vendor abstraction**: Nutrient calculations should support multiple brands
- **Privacy preservation**: No external API dependencies

### User Interface Design

- **Cannabis-focused aesthetics**: Green color schemes, plant imagery
- **Cultivation workflow**: UI should match grower thought processes
- **Mobile optimization**: Field use during plant care activities
- **Accessibility**: Support for various user technical skill levels

## Common Cannabis Cultivation Problems

### Nutrient Issues

1. **Nutrient Burn**
   - Symptoms: Brown, crispy leaf tips
   - Cause: Over-fertilization
   - Solution: Reduce nutrient concentration

2. **Nutrient Deficiencies**
   - Nitrogen: Yellowing lower leaves
   - Phosphorus: Purple stems, dark leaves
   - Potassium: Brown leaf edges
   - CalMag: Rust spots, interveinal chlorosis

3. **pH Problems**
   - Symptoms: Nutrient lockout despite adequate feeding
   - Hydro range: 5.5-6.5
   - Soil range: 6.0-7.0

### Environmental Issues

1. **Heat Stress**
   - Symptoms: Leaf curling, bleaching
   - Solution: Improve ventilation, reduce light intensity

2. **Light Burn**
   - Symptoms: Bleached tops, crispy leaves
   - Solution: Increase light distance or reduce intensity

3. **Mold and Mildew**
   - Prevention: Proper humidity control, air circulation
   - Critical during flowering stage

### Pest Management

- **Spider Mites**: Fine webbing, stippled leaves
- **Thrips**: Silver streaks on leaves
- **Fungus Gnats**: Small flying insects, larvae in soil
- **Aphids**: Small insects on new growth

## Quality Metrics and Standards

### Harvest Quality Indicators

- **Trichome density**: Indicator of potency
- **Terpene preservation**: Aroma and flavor compounds
- **Proper cure**: Moisture content and aging
- **Trim quality**: Appearance and bag appeal

### Yield Optimization Factors

- **Light efficiency**: Grams per watt calculations
- **Space utilization**: Grams per square foot
- **Time efficiency**: Harvest frequency and cycle times
- **Resource efficiency**: Water and nutrient usage

## Integration with Modern Technology

### IoT Sensor Applications

- **Continuous monitoring**: 24/7 environmental data collection
- **Alert systems**: Immediate notifications for problems
- **Automation triggers**: Environmental controller integration
- **Data logging**: Historical trend analysis

### AI and Machine Learning Applications

- **Pattern recognition**: Identify optimal growing conditions
- **Predictive analytics**: Forecast problems before they occur
- **Yield prediction**: Estimate harvest based on current conditions
- **Recommendation engines**: Suggest improvements based on data

This domain knowledge should inform all BMAD agent decisions and recommendations when working on cannabis cultivation features for the Emerald Plant Tracker.