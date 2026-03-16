import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { sequelize, User, Document } from '../models/index.js';

dotenv.config();

const SAMPLE_USER = {
  firstName: 'Demo',
  middleName: 'Ops',
  lastName: 'Admin',
  suffix: '',
  email: 'demo.admin@tesla.com',
  password: 'DemoPass123!',
  role: 'admin'
};

// ── Text content for each document type ──────────────────────────────────

const MN_TEXT_1 = `MANUFACTURING NOTICE - MN-2024-0047
LINE SHUTDOWN: BATTERY MODULE ASSEMBLY LINE 4

EFFECTIVE DATE: March 15, 2024
PRIORITY: HIGH
AFFECTED LINES: Line 4, Line 4A (Sub-assembly)
DURATION: 72 hours (estimated)

1. NOTICE SUMMARY
Battery Module Assembly Line 4 will undergo a planned shutdown for equipment upgrade and recalibration. All production schedules for Line 4 and sub-assembly Line 4A will be suspended during this period.

2. REASON FOR SHUTDOWN
- Installation of new automated cell insertion robot (Model: ABB IRB 6700)
- Upgrade of conveyor control system firmware to v4.2.1
- Replacement of worn alignment fixtures (stations 7, 12, 15)
- Calibration of torque stations to updated specifications

3. IMPACT ASSESSMENT
3.1 Production Impact
- Estimated lost output: 450 battery modules
- Affected vehicle programs: Model S, Model X
- Buffer stock available: 380 modules (approximately 2.5 days)

3.2 Staffing Impact
- Line 4 operators to be reassigned to Line 2 and Line 6
- Maintenance team to support installation (12 technicians)
- Quality engineers required for post-installation validation

4. MITIGATION PLAN
- Pre-build 200 additional modules on Lines 2 and 6 prior to shutdown
- Schedule overtime shifts on Lines 2 and 6 during shutdown period
- Expedite supplier deliveries for cell inventory buildup
- Cross-train Line 4 operators on Line 2/6 procedures

5. POST-SHUTDOWN VALIDATION
- Full equipment checkout and safety inspection
- Production trial run: 50 modules at reduced speed
- Quality validation: first 100 modules undergo enhanced inspection
- Full production release upon quality engineering approval

6. COMMUNICATION PLAN
- Daily status updates via email to all stakeholders
- Escalation contact: Manufacturing Director (ext. 4501)
- Updates posted on factory floor digital boards

DISTRIBUTION LIST
- All Line 4 operators and supervisors
- Production Planning department
- Quality Engineering department
- Maintenance and Facilities team
- Supply Chain management

ISSUED BY: Manufacturing Engineering
APPROVED BY: Plant Manager
DOCUMENT ID: MN-2024-0047`;

const MN_TEXT_2 = `MANUFACTURING NOTICE - MN-2024-0063
MATERIAL CHANGE: THERMAL INTERFACE MATERIAL UPDATE

EFFECTIVE DATE: April 1, 2024
PRIORITY: MEDIUM
AFFECTED LINES: All battery assembly lines

1. NOTICE SUMMARY
Effective April 1, 2024, the thermal interface material (TIM) used in battery module assembly will change from Supplier A (Part# TIM-3045) to Supplier B (Part# TIM-7820). This change has been validated through engineering testing and approved by the Materials Review Board.

2. CHANGE DETAILS
2.1 Old Material
- Supplier: ThermalTech Inc.
- Part Number: TIM-3045
- Thermal Conductivity: 3.5 W/mK
- Application Method: Manual dispensing

2.2 New Material
- Supplier: CoolFlow Materials
- Part Number: TIM-7820
- Thermal Conductivity: 5.2 W/mK (48% improvement)
- Application Method: Automated dispensing (compatible with existing equipment)

3. REASON FOR CHANGE
- Improved thermal performance for next-generation battery cells
- Better long-term reliability (validated through 2000-hour accelerated aging)
- Cost reduction of 12% per module
- Supplier diversification strategy

4. PROCESS CHANGES
- Dispensing volume: Reduced from 3.2ml to 2.8ml per cell interface
- Cure time: Reduced from 45 minutes to 30 minutes at 65C
- Shelf life: 12 months (same as current material)
- Storage: Room temperature, no refrigeration required

5. TRAINING REQUIREMENTS
- All assembly operators: 30-minute online training module
- Maintenance technicians: 1-hour hands-on session for dispenser calibration
- Quality inspectors: Updated inspection criteria briefing
- Training completion deadline: March 28, 2024

6. QUALITY VALIDATION
- First Article Inspection (FAI) required for first 50 modules
- Enhanced thermal testing for first production week
- Standard inspection criteria apply after validation period

ISSUED BY: Materials Engineering
APPROVED BY: VP Manufacturing`;

const MI_TEXT_1 = `MANUFACTURING INSTRUCTIONS - MI-BP-0234
BATTERY PACK FINAL ASSEMBLY PROCEDURE

REVISION: 3.2.0
EFFECTIVE DATE: February 15, 2024
CLASSIFICATION: Standard Operating Procedure

1. PURPOSE
This document provides step-by-step instructions for the final assembly of battery packs for Model 3 and Model Y vehicles. All operators must follow these instructions exactly as written.

2. REQUIRED TOOLS AND EQUIPMENT
- Torque wrench (calibrated): 10-50 Nm range
- Insulated socket set (1000V rated)
- ESD wrist strap and grounding mat
- Thermal paste applicator (pneumatic)
- Digital multimeter (Fluke 87V or equivalent)
- Safety glasses with side shields
- High-voltage gloves (Class 0, tested within 6 months)
- Torque verification tool (digital)

3. PRE-ASSEMBLY CHECKLIST
Before starting assembly:
[ ] Verify all battery modules passed incoming inspection
[ ] Check module voltage balance (max deviation: 50mV between modules)
[ ] Confirm coolant system has been pressure tested (15 psi, 30 min hold)
[ ] Verify BMS (Battery Management System) firmware version 5.4.2 or later
[ ] Ensure all tools are calibrated and within certification date
[ ] Put on required PPE (safety glasses, HV gloves, ESD strap)

4. ASSEMBLY SEQUENCE

Step 1: Module Installation
4.1.1 Position battery pack housing on assembly fixture
4.1.2 Apply thermal interface material to module mounting surfaces
       - Coverage: 100% of contact area, no gaps
       - Thickness: 0.5mm ± 0.1mm
4.1.3 Lower Module 1 (front-left) into position using overhead crane
4.1.4 Secure with 8x M8 bolts, torque to 25 Nm ± 2 Nm
4.1.5 Repeat for Modules 2-16 in sequence shown in diagram BP-ASM-001

Step 2: Electrical Connections
4.2.1 Connect high-voltage bus bars between modules
       - Use new hardware for each assembly (do not reuse bolts)
       - Apply anti-seize compound to threads
       - Torque: 12 Nm ± 1 Nm in star pattern
4.2.2 Connect BMS harness to each module
       - Verify connector click (audible confirmation)
       - Gently tug to confirm seated
4.2.3 Route harness through designated channels
       - Maintain minimum 25mm clearance from HV components

Step 3: Coolant System
4.3.1 Connect coolant inlet and outlet manifolds
4.3.2 Torque coolant fittings to 15 Nm ± 1 Nm
4.3.3 Fill coolant system with 8.5L of G48 coolant mix (50/50)
4.3.4 Run coolant pump for 5 minutes to purge air
4.3.5 Top off coolant to fill line

Step 4: Final Closure
4.4.1 Apply sealing compound to pack housing perimeter
       - Continuous bead, 5mm diameter, no gaps
4.4.2 Position pack lid using alignment pins
4.4.3 Install 42x M6 perimeter bolts
       - Torque sequence: star pattern, two passes
       - First pass: 5 Nm
       - Final pass: 10 Nm ± 0.5 Nm

5. POST-ASSEMBLY TESTING
- Pack voltage measurement (within 2V of nominal)
- Insulation resistance test (> 500 MOhm at 500V DC)
- Coolant leak test (15 psi, 10 minute hold, zero pressure drop)
- BMS communication check (all 16 modules responding)
- Thermal sensor validation (all 48 sensors within 2C of ambient)

6. DOCUMENTATION
- Record all torque values in assembly log
- Document pack serial number and module serial numbers
- Log test results in MES (Manufacturing Execution System)
- Apply QC sticker after all tests pass

REVISION HISTORY
v3.0.0 - Updated for new module design (Oct 2023)
v3.1.0 - Added coolant purge procedure (Dec 2023)
v3.2.0 - Updated torque specifications per engineering change (Feb 2024)`;

const MI_TEXT_2 = `MANUFACTURING INSTRUCTIONS - MI-GA-0089
GENERAL ASSEMBLY: FRONT FASCIA INSTALLATION

REVISION: 2.0.1
EFFECTIVE DATE: January 2024
WORK STATION: GA-Station 14

1. PURPOSE
Instructions for installing the front fascia assembly on Model 3/Y vehicles at General Assembly Station 14.

2. CYCLE TIME
- Standard cycle time: 85 seconds
- Critical path operations: Connector attachment (25 seconds)

3. REQUIRED MATERIALS
- Front fascia assembly (verify part number matches vehicle variant)
- 6x push-pin fasteners (Part# FP-2234)
- 4x M6 bolts with captive washers (Part# BW-6640)
- 2x headlamp alignment pins (Part# HA-1120)
- Wiring harness connector lubricant

4. INSTALLATION PROCEDURE

Step 1: Preparation (15 seconds)
- Verify fascia variant matches vehicle build sheet
- Inspect fascia for shipping damage (scratches, cracks, paint defects)
- Remove protective film from headlamp openings
- Pre-position fascia on installation cart at correct height

Step 2: Wiring Connection (25 seconds)
- Locate front sensor harness connector (yellow tag)
- Apply connector lubricant to male pins
- Connect parking sensor harness (4-pin connector)
- Connect fog lamp harness (2-pin connector, both sides)
- Connect front camera harness (8-pin connector)
- Verify all connectors fully seated (push until click)

Step 3: Fascia Positioning (20 seconds)
- Align headlamp alignment pins with body mounting holes
- Guide fascia onto front rail mounting tabs (both sides simultaneously)
- Push fascia firmly against body until all clips engage
- Verify flush fit at fender-to-fascia gap (specification: 3mm ± 1mm)

Step 4: Fastening (25 seconds)
- Install 4x M6 bolts at underbody attachment points
- Torque: 8 Nm ± 1 Nm
- Install 6x push-pin fasteners at wheel arch liner interface
- Confirm push-pins fully seated (flush with surface)

5. QUALITY CHECKPOINTS
After installation, verify:
[ ] All gaps even and within specification (3mm ± 1mm)
[ ] Fascia flush with fenders (no step greater than 1mm)
[ ] All electrical connectors fully seated
[ ] No visible scratches or damage to painted surfaces
[ ] All fasteners installed and torqued
[ ] Headlamp fitment aligned (verify with gap gauge)

6. COMMON ISSUES AND SOLUTIONS
Issue: Gap too wide on one side
Solution: Loosen bolts, reposition, re-torque

Issue: Connector won't seat fully
Solution: Check for bent pins, clean connector, reapply lubricant

Issue: Push-pin won't engage
Solution: Verify hole alignment, check for debris in mounting hole

APPROVED BY: Manufacturing Engineering Manager`;

const QI_TEXT_1 = `QUALITY INSTRUCTIONS - QI-INS-0156
INCOMING INSPECTION: BATTERY CELL RECEIVING

REVISION: 4.1.0
EFFECTIVE DATE: March 2024
INSPECTION LEVEL: Level II (AQL 1.0)

1. PURPOSE
This Quality Instruction defines the incoming inspection requirements for battery cells received from approved suppliers. All incoming lots must be inspected and released before use in production.

2. SCOPE
Applies to all cylindrical battery cells (2170 and 4680 format) received at the Gigafactory incoming inspection area.

3. SAMPLING PLAN
3.1 Lot Size and Sample Size
- Lot size 1-150: Sample 8 cells
- Lot size 151-500: Sample 13 cells
- Lot size 501-1200: Sample 20 cells
- Lot size 1201-3200: Sample 32 cells
- Lot size 3200+: Sample 50 cells

3.2 Acceptance Criteria
- Zero critical defects allowed
- Maximum 1 major defect per sample
- Maximum 2 minor defects per sample

4. VISUAL INSPECTION
4.1 External Appearance
Inspect each sample cell for:
- Dents or deformation (reject if > 0.3mm depth)
- Corrosion or discoloration on terminals
- Electrolyte leakage (any visible leakage = reject entire lot)
- Label legibility and correct orientation
- Protective cap presence and condition

4.2 Dimensional Verification
Using calibrated digital calipers:
- 2170 cells: Diameter 21.0mm ± 0.2mm, Height 70.0mm ± 0.3mm
- 4680 cells: Diameter 46.0mm ± 0.3mm, Height 80.0mm ± 0.4mm
- Terminal height: Within specification per drawing

5. ELECTRICAL TESTING
5.1 Open Circuit Voltage (OCV)
- Measurement: Digital multimeter (4.5 digit minimum)
- 2170 cells: 3.60V to 3.70V
- 4680 cells: 3.60V to 3.70V
- Reject if voltage outside range

5.2 Internal Resistance (IR)
- Measurement: AC impedance at 1kHz
- 2170 cells: < 25 mOhm
- 4680 cells: < 15 mOhm
- Reject if resistance exceeds limit

5.3 Weight Verification
- Use precision scale (0.01g resolution)
- 2170 cells: 68g ± 2g
- 4680 cells: 355g ± 8g
- Weight outliers indicate potential internal defects

6. ENVIRONMENTAL TESTING (Monthly lot validation)
- Thermal cycling: -20C to +60C, 100 cycles
- Vibration test: Per IEC 62660-2
- Crush test: Per UN 38.3 T6
- Short circuit test: Per IEC 62660-2

7. DOCUMENTATION REQUIREMENTS
For each inspected lot:
- Record lot number, supplier, date received
- Document all measurements and test results
- Photograph any defects found
- Complete inspection report in QMS
- Apply lot status label (Green=Accept, Red=Reject, Yellow=Hold)

8. NON-CONFORMING MATERIAL
- Segregate rejected cells in designated quarantine area
- Issue Non-Conformance Report (NCR) within 24 hours
- Notify supplier quality engineer within 48 hours
- Disposition options: Return to supplier, Sort (100%), Scrap
- Track corrective actions in supplier portal

REVISION HISTORY
v4.0.0 - Added 4680 cell specifications (Jan 2024)
v4.1.0 - Updated sampling plan per new AQL requirements (Mar 2024)`;

const QI_TEXT_2 = `QUALITY INSTRUCTIONS - QI-PRO-0078
IN-PROCESS INSPECTION: WELD QUALITY VERIFICATION

REVISION: 2.3.0
EFFECTIVE DATE: February 2024
APPLICABLE STATIONS: Welding Stations W1 through W8

1. PURPOSE
Define inspection criteria and methods for verifying weld quality during battery module assembly. This instruction applies to all ultrasonic and laser welding operations.

2. INSPECTION FREQUENCY
- Visual inspection: Every unit (100%)
- Dimensional check: Every 10th unit
- Destructive testing: 3 samples per shift per station
- Process audit: Weekly per station

3. ULTRASONIC WELD INSPECTION

3.1 Visual Criteria
Accept:
- Uniform weld pattern with consistent indentation
- No cracks, voids, or porosity visible under 10x magnification
- Flash (excess material) < 0.5mm beyond weld zone
- Consistent color (no discoloration indicating overheating)

Reject:
- Any crack extending from weld zone
- Incomplete fusion (visible gap at interface)
- Burn-through or excessive thinning
- Misalignment > 0.3mm from nominal position

3.2 Strength Testing (Destructive)
- Pull test: Minimum 150N for tab-to-busbar welds
- Peel test: Minimum 80N/25mm for foil welds
- Shear test: Minimum 200N for structural welds
- Document all test results with station and operator ID

4. LASER WELD INSPECTION

4.1 Visual Criteria
Accept:
- Continuous weld bead with uniform width (±0.2mm)
- Smooth surface with no spatter beyond 2mm from weld
- Consistent penetration depth (verify on cross-section samples)
- No undercut greater than 10% of material thickness

Reject:
- Porosity visible on surface (any size)
- Crack of any length in weld or heat-affected zone
- Incomplete penetration (< 80% of joint thickness)
- Excessive spatter indicating process instability

4.2 Dimensional Verification
- Weld width: As specified on drawing ± 0.2mm
- Weld position: Within 0.3mm of nominal
- Penetration depth: 80-100% of thinner material (verify on cross-section)

5. PROCESS MONITORING
- Monitor weld energy/power in real-time
- Set alarm limits at ± 10% of nominal parameters
- Log all out-of-limit events
- Quarantine affected units for additional inspection

6. CORRECTIVE ACTIONS
When defects are found:
1. Stop production at affected station
2. Quarantine last 50 units for re-inspection
3. Notify process engineer and quality supervisor
4. Identify root cause (tooling wear, parameter drift, material variation)
5. Implement correction and verify with 10 consecutive good units
6. Document in corrective action system

APPROVED BY: Quality Director`;

const QAN_TEXT_1 = `QUALITY ALERT NOTICE - QAN-2024-0019
CRITICAL: TORQUE SPECIFICATION NON-CONFORMANCE

ALERT LEVEL: RED (Immediate Action Required)
ISSUED: March 8, 2024, 14:30 PST
VALID UNTIL: Resolved and closed by Quality Engineering

1. PROBLEM DESCRIPTION
During routine quality audit of Battery Pack Assembly Line 2, it was discovered that torque values on bus bar connections at Station 5 have been consistently below specification for an estimated 4-hour production window (10:00 to 14:00, March 8, 2024).

Root cause: Torque tool calibration drift. Tool ID# TW-2234 was found to be reading 18% low compared to master standard.

2. AFFECTED PRODUCT
- Product: Battery Pack Assembly (Model 3/Y)
- Serial number range: BP-240308-0045 through BP-240308-0082 (estimated 37 units)
- Station: Line 2, Station 5 (bus bar torque)
- Specification: 12 Nm ± 1 Nm
- Actual measured: 9.8 Nm average (range: 9.2 to 10.4 Nm)

3. RISK ASSESSMENT
- Safety risk: MEDIUM - Under-torqued connections can increase electrical resistance
- Potential consequences: Localized heating, accelerated degradation, potential connection failure
- Customer impact: Possible if not contained (reduced battery performance, potential safety event)

4. IMMEDIATE CONTAINMENT ACTIONS
[ ] STOP production at Line 2, Station 5 (COMPLETED - 14:35)
[ ] Quarantine all 37 affected units (COMPLETED - 14:45)
[ ] Replace torque tool TW-2234 with calibrated spare (COMPLETED - 14:40)
[ ] Verify replacement tool calibration against master standard
[ ] Notify Plant Manager and Quality Director
[ ] Issue shipping hold for any affected units already sent to vehicle assembly

5. DISPOSITION OF AFFECTED UNITS
All 37 units must be:
1. Returned to rework station
2. Bus bar connections loosened and re-torqued with verified tool
3. Torque values documented for each connection (24 per pack)
4. Units re-inspected by quality engineer before release
5. Rework documented in MES with reference to this QAN

6. CORRECTIVE ACTIONS
Short-term (within 24 hours):
- All torque tools on Line 2 to be verified against master standard
- Increase torque audit frequency from hourly to every 30 minutes
- Add visual indicator (color coding) for recently calibrated tools

Long-term (within 2 weeks):
- Implement wireless torque monitoring system with real-time alerts
- Review calibration frequency for all torque tools (currently quarterly)
- Add redundant torque verification step at downstream station

7. DISTRIBUTION
- All Line 2 supervisors and operators
- Quality Engineering team
- Manufacturing Engineering team
- Plant Manager
- Supply Chain (for shipping hold)

ISSUED BY: Quality Engineering
QAN OWNER: Senior Quality Engineer
CLOSURE REQUIRES: Quality Director approval`;

const QAN_TEXT_2 = `QUALITY ALERT NOTICE - QAN-2024-0025
WARNING: SUPPLIER MATERIAL DEVIATION - COOLANT HOSE

ALERT LEVEL: YELLOW (Elevated Monitoring Required)
ISSUED: March 12, 2024
VALID UNTIL: Supplier corrective action verified

1. PROBLEM DESCRIPTION
Incoming inspection identified dimensional variation in coolant hoses received from FlexHose Corp (Lot# FH-2024-0892). Inner diameter measurements on sample of 20 hoses showed 3 units outside specification.

2. DEVIATION DETAILS
- Part: Coolant Hose Assembly (Part# CH-4420)
- Specification: Inner diameter 19.0mm ± 0.3mm
- Lot size: 2,400 hoses
- Sample size: 20
- Out-of-spec units: 3 (measured at 19.5mm, 19.6mm, 19.4mm)
- Defect rate in sample: 15%

3. RISK ASSESSMENT
- Safety risk: LOW - Oversized hoses may not seal properly on barb fittings
- Potential consequence: Coolant leak during thermal cycling
- Production impact: Current inventory sufficient for 3 days while lot is sorted

4. CONTAINMENT ACTIONS
[ ] Quarantine entire lot FH-2024-0892
[ ] 100% inspection of quarantined lot (measure inner diameter)
[ ] Notify supplier quality representative
[ ] Verify last 3 received lots are within specification (spot check 50 per lot)
[ ] Release conforming hoses only after individual measurement verification

5. SUPPLIER NOTIFICATION
- Formal notification sent to FlexHose Corp quality manager
- 8D report requested within 10 business days
- Supplier on-site audit scheduled for March 20, 2024
- Incoming inspection level increased to Level III for next 5 lots

6. INTERIM MEASURES
- All coolant hose lots from this supplier: 100% dimensional inspection
- Assembly line operators: Perform visual and tactile check for loose fit
- Quality gate added: Coolant system pressure test hold time increased from 10 to 20 minutes

ISSUED BY: Supplier Quality Engineering
ESCALATION: Quality Director if additional non-conforming lots received`;

const VA_TEXT_1 = `VISUAL AIDE - VA-EL-0034
BATTERY MODULE CONNECTOR IDENTIFICATION GUIDE

REVISION: 1.5.0
EFFECTIVE DATE: January 2024

1. PURPOSE
This visual aide provides a reference guide for identifying and correctly routing all electrical connectors in the battery module assembly. Post this document at assembly stations for operator reference.

2. CONNECTOR COLOR CODE SYSTEM

HIGH VOLTAGE CONNECTORS (ORANGE)
- All high-voltage connections use orange-colored connectors and cables
- Voltage range: 60V to 400V DC
- ALWAYS verify lockout/tagout before handling
- Minimum PPE: Class 0 HV gloves + safety glasses

SIGNAL CONNECTORS (BLACK)
- Battery Management System (BMS) signal connections
- Low voltage (0-12V)
- Standard ESD precautions required

TEMPERATURE SENSOR CONNECTORS (BLUE)
- Thermistor connections for cell temperature monitoring
- 2-pin connectors, keyed for correct orientation
- Do not force - if resistance felt, check alignment

COOLANT SYSTEM CONNECTORS (GREEN)
- Coolant temperature and flow sensors
- Quick-disconnect fittings with locking clips
- Verify O-ring presence before connecting

3. CONNECTOR ROUTING MAP

Module Position | HV Connector | BMS Connector | Temp Sensors
Front-Left     | Port A1       | Port B1       | T1, T2, T3
Front-Right    | Port A2       | Port B2       | T4, T5, T6
Center-Left    | Port A3       | Port B3       | T7, T8, T9
Center-Right   | Port A4       | Port B4       | T10, T11, T12
Rear-Left      | Port A5       | Port B5       | T13, T14, T15
Rear-Right     | Port A6       | Port B6       | T16, T17, T18

4. CRITICAL ROUTING RULES
- NEVER route signal cables alongside HV cables
- Maintain minimum 50mm separation between HV and signal harnesses
- Use designated cable channels only
- Secure all cables with tie-wraps at 150mm intervals
- No cables should rest on sharp edges or moving components

5. VERIFICATION CHECKLIST
After routing all connections:
[ ] All HV connectors locked (orange lever in closed position)
[ ] All BMS connectors clicked (audible confirmation)
[ ] All temperature sensors connected (verify in diagnostic software)
[ ] Cable routing follows designated channels
[ ] Minimum separation distances maintained
[ ] All tie-wraps installed at required intervals
[ ] No pinched or stressed cables

6. REFERENCE IMAGES
[See posted wall chart VA-EL-0034-POSTER for full-size routing diagram]
[See digital version in Document Finder for zoom capability]

POSTED AT: Line 2 Station 3, Line 2 Station 4, Line 4 Station 3, Line 4 Station 4
REVIEWED BY: Electrical Engineering, Manufacturing Engineering, Safety`;

const VA_TEXT_2 = `VISUAL AIDE - VA-SA-0012
PPE REQUIREMENTS BY WORK ZONE

REVISION: 2.0.0
EFFECTIVE DATE: February 2024

1. PURPOSE
Quick reference guide for Personal Protective Equipment (PPE) requirements in each factory work zone. This visual aide must be posted at all zone entry points.

2. ZONE CLASSIFICATIONS AND REQUIRED PPE

ZONE A - GENERAL ASSEMBLY (GREEN ZONE)
Required PPE:
- Safety glasses with side shields
- Steel-toe safety shoes
- High-visibility vest
- Hearing protection (if noise > 85dB)

ZONE B - BATTERY ASSEMBLY (YELLOW ZONE)
Required PPE:
- Safety glasses with side shields
- Steel-toe safety shoes
- ESD wrist strap (connected to ground)
- ESD-safe clothing (no synthetic fabrics)
- High-visibility vest

ZONE C - HIGH VOLTAGE AREA (ORANGE ZONE)
Required PPE - ALL items from Zone B PLUS:
- Class 0 high-voltage gloves (tested within 6 months)
- Leather protector gloves over HV gloves
- Arc-flash rated face shield (if applicable)
- Flame-resistant clothing

ZONE D - CHEMICAL HANDLING (RED ZONE)
Required PPE:
- Chemical splash goggles
- Chemical-resistant gloves (type per MSDS)
- Chemical-resistant apron
- Respiratory protection (if required by MSDS)
- Steel-toe chemical-resistant boots

ZONE E - WELDING AREA (BLUE ZONE)
Required PPE:
- Auto-darkening welding helmet (shade 10-13)
- Flame-resistant welding jacket
- Welding gloves (leather, gauntlet style)
- Steel-toe boots with metatarsal guard
- Hearing protection

3. PPE INSPECTION REQUIREMENTS
- Inspect all PPE before each use
- HV gloves: Visual + air inflation test before each use
- Report damaged PPE immediately - do not use
- Replace HV gloves every 6 months or after any damage

4. EMERGENCY EQUIPMENT LOCATIONS
- Eye wash stations: Every zone entrance
- Emergency showers: Zones C and D
- First aid kits: Every 50 meters along main aisle
- AED locations: Break rooms, main office, each zone entrance
- Fire extinguishers: Every 20 meters (ABC type in general areas, CO2 in electrical areas)

5. VISITOR REQUIREMENTS
All visitors must wear minimum Zone A PPE at all times.
Visitors are NOT permitted in Zones C or D without escort and additional training.

POSTED AT: All zone entry points, break rooms, visitor reception
APPROVED BY: Environmental Health & Safety Manager`;

const PCA_TEXT_1 = `PROCESS CHANGE APPROVAL - PCA-2024-0008
WELD PARAMETER OPTIMIZATION: ULTRASONIC CELL WELDING

STATUS: APPROVED
CHANGE TYPE: Process Parameter Modification
RISK LEVEL: Medium
EFFECTIVE DATE: April 15, 2024

1. CHANGE DESCRIPTION
Modification of ultrasonic welding parameters at battery cell tab welding stations (W1-W4) to improve weld strength consistency and reduce scrap rate.

2. CURRENT STATE
- Weld energy: 450J ± 20J
- Weld time: 0.35 seconds
- Amplitude: 35 microns
- Force: 200N
- Current scrap rate: 2.3% (target: < 1.5%)
- Current Cpk: 1.15

3. PROPOSED STATE
- Weld energy: 480J ± 15J (increased energy, tighter tolerance)
- Weld time: 0.32 seconds (reduced)
- Amplitude: 38 microns (increased)
- Force: 220N (increased)
- Expected scrap rate: < 0.8%
- Expected Cpk: > 1.67

4. JUSTIFICATION
4.1 Problem Statement
Current weld parameters produce acceptable but inconsistent results. Process capability (Cpk 1.15) is below the 1.33 target. Approximately 2.3% of welds require rework, impacting cycle time and cost.

4.2 Root Cause Analysis
- Energy level at lower bound creates marginal welds during material lot variations
- Longer weld time increases heat input, causing occasional thermal damage
- Current force is insufficient for consistent coupling during high-speed operation

4.3 Expected Benefits
- 65% reduction in scrap rate (2.3% to 0.8%)
- Improved process capability (Cpk 1.15 to 1.67)
- Annual cost savings: estimated $340,000
- Reduced rework time: 15 minutes/shift average

5. VALIDATION PLAN
5.1 Pre-Production Validation
- DOE (Design of Experiments): 32 runs with 4 factors, 2 levels
- Pull test validation: 200 samples at new parameters
- Cross-section analysis: 20 samples for penetration depth verification
- Thermal analysis: IR camera monitoring during welding

5.2 Production Validation
- 500-unit pilot run on Station W1
- 100% pull test for first 100 units
- Statistical process control monitoring for full pilot run
- Compare results against current production baseline

6. RISK ASSESSMENT
Risk: Increased force may accelerate sonotrode wear
Mitigation: Reduce sonotrode replacement interval from 50,000 to 40,000 welds

Risk: Higher energy may cause occasional thermal damage
Mitigation: IR monitoring with automatic stop at 120C surface temperature

Risk: Tighter tolerance may increase false rejects
Mitigation: Upgrade energy measurement system from ±5J to ±2J resolution

7. APPROVAL SIGNATURES
Manufacturing Engineering: APPROVED (March 5, 2024)
Quality Engineering: APPROVED (March 7, 2024)
Process Engineering: APPROVED (March 6, 2024)
Plant Manager: APPROVED (March 10, 2024)

8. IMPLEMENTATION TIMELINE
Week 1: Update weld recipes in PLC (all 4 stations)
Week 2: Station W1 pilot production
Week 3: Validate pilot results, adjust if needed
Week 4: Roll out to stations W2-W4
Week 5: Full production release with monitoring

CHANGE OWNER: Process Engineering Manager
DOCUMENT ID: PCA-2024-0008`;

const PCA_TEXT_2 = `PROCESS CHANGE APPROVAL - PCA-2024-0015
LINE SPEED INCREASE: GENERAL ASSEMBLY LINE 1

STATUS: PENDING VALIDATION
CHANGE TYPE: Process Speed Modification
RISK LEVEL: High
TARGET EFFECTIVE DATE: May 1, 2024

1. CHANGE DESCRIPTION
Increase General Assembly Line 1 line speed from 52 JPH (Jobs Per Hour) to 58 JPH to meet increased production targets for Q2 2024.

2. CURRENT STATE
- Line speed: 52 JPH
- Takt time: 69.2 seconds
- Operator count: 48 per shift
- Quality performance: 97.5% FTQ (First Time Quality)
- Safety incidents (YTD): 2 recordable

3. PROPOSED STATE
- Line speed: 58 JPH (+11.5%)
- Takt time: 62.1 seconds (-7.1 seconds)
- Operator count: 52 per shift (+4 operators)
- Target quality: Maintain > 97% FTQ
- Safety target: Zero additional incidents

4. JUSTIFICATION
- Q2 production target increased by 12% per business planning
- Customer demand exceeds current capacity
- Adding second shift not feasible (facility constraint)
- Line speed increase is most cost-effective option

5. WORK CONTENT ANALYSIS
Stations requiring rebalance (takt time reduction):
- Station 14 (Front Fascia): Currently 67s, need to reduce to 61s
  Action: Split connector attachment to new sub-station 14A
- Station 22 (Dashboard Install): Currently 68s, need to reduce to 61s
  Action: Add powered assist tool, reduce manual handling
- Station 31 (Seat Install): Currently 66s, need to reduce to 61s
  Action: Pre-stage seats on automated cart delivery system
- Station 38 (Wheel Install): Currently 65s, need to reduce to 61s
  Action: Upgrade to 4-spindle simultaneous torque system

6. STAFFING REQUIREMENTS
New positions required:
- 2 operators for Station 14A (new sub-station)
- 1 utility operator for material delivery
- 1 quality auditor for increased inspection rate
Training: All Line 1 operators require updated work instructions and hands-on training

7. EQUIPMENT CHANGES
- Station 14: Install additional connector tooling
- Station 22: New powered assist arm (procurement lead time: 6 weeks)
- Station 31: Automated cart delivery system (procurement lead time: 8 weeks)
- Station 38: 4-spindle torque system (procurement lead time: 4 weeks)
- Conveyor system: Speed controller reprogramming

8. RISK ASSESSMENT
Risk: Quality degradation due to reduced cycle time
Mitigation: Additional quality gates, increased audit frequency

Risk: Ergonomic issues from faster pace
Mitigation: Ergonomic assessment of all modified stations, powered assist tools

Risk: Material supply may not support higher rate
Mitigation: 2-week buffer stock build, supplier notification 6 weeks prior

9. VALIDATION PLAN
- Week 1-2: Equipment installation and commissioning
- Week 3: Operator training on modified stations
- Week 4: Trial run at 55 JPH (intermediate speed)
- Week 5: Full speed trial at 58 JPH
- Week 6: Validate quality, safety, and efficiency metrics
- Week 7: Full production release (if all metrics met)

10. APPROVAL STATUS
Manufacturing Engineering: APPROVED (March 1, 2024)
Quality Engineering: PENDING (awaiting validation plan results)
Safety: APPROVED WITH CONDITIONS (ergonomic assessment required)
Plant Manager: PENDING (awaiting Quality approval)
Finance: APPROVED (ROI validated)

CHANGE OWNER: General Assembly Manager
DOCUMENT ID: PCA-2024-0015`;

const MN_TEXT_3 = `MANUFACTURING NOTICE - MN-2024-0071
SHIFT SCHEDULE CHANGE: ALL PRODUCTION LINES

EFFECTIVE DATE: April 15, 2024
PRIORITY: MEDIUM
AFFECTED: All production employees

1. NOTICE SUMMARY
Effective April 15, 2024, production shift schedules will transition from the current 3-shift rotation (8-hour shifts) to a modified 2-shift rotation (12-hour shifts) for Lines 1-6.

2. NEW SCHEDULE
- A Shift: 6:00 AM to 6:00 PM (Mon-Wed, alternating Thu)
- B Shift: 6:00 PM to 6:00 AM (Mon-Wed, alternating Thu)
- C Shift: 6:00 AM to 6:00 PM (Fri-Sun)
- D Shift: 6:00 PM to 6:00 AM (Fri-Sun)

3. REASON FOR CHANGE
- Reduce shift handoff quality escapes (currently 15% of defects occur during shift transitions)
- Improve operator continuity on complex assemblies
- Align with supplier delivery schedules
- Increase weekly production capacity by 8%

4. TRANSITION PLAN
- Week 1 (April 8-12): Orientation sessions for all employees
- Week 2 (April 15): New schedule begins, supervisors on extended overlap
- Week 3-4: Monitor and adjust as needed
- Break schedules: Two 30-minute paid breaks per 12-hour shift

5. COMPENSATION ADJUSTMENTS
- Overtime calculated after 40 hours per week (per state law)
- Shift differential: 15% premium for night shifts
- All benefits remain unchanged

ISSUED BY: Human Resources & Manufacturing Operations
APPROVED BY: VP Manufacturing`;

const MN_TEXT_4 = `MANUFACTURING NOTICE - MN-2024-0085
NEW EQUIPMENT INSTALLATION: AUTOMATED OPTICAL INSPECTION SYSTEM

EFFECTIVE DATE: May 1, 2024
PRIORITY: HIGH
AFFECTED LINES: Lines 2, 4, 6

1. NOTICE SUMMARY
Three new Automated Optical Inspection (AOI) systems will be installed at end-of-line stations on Battery Assembly Lines 2, 4, and 6. Installation occurs during planned maintenance windows.

2. EQUIPMENT DETAILS
- System: Keyence XG-X Series Vision System
- Cameras: 12 per station (360-degree coverage)
- Inspection speed: < 2 seconds per module
- Defect detection: Scratches, dents, label placement, connector seating

3. INSTALLATION SCHEDULE
- Line 6: April 22-24 (during scheduled maintenance)
- Line 4: April 29 - May 1
- Line 2: May 6-8

4. OPERATOR IMPACT
- No manual visual inspection required at AOI stations after go-live
- Operators to receive 2-hour training on AOI interface and alarm response
- Reject handling: AOI auto-diverts to rework conveyor
- Override procedure requires supervisor authorization

5. EXPECTED BENEFITS
- 99.7% defect detection rate (current manual: 94%)
- Consistent inspection criteria (eliminates operator variability)
- Full traceability with image storage per unit
- Reduced cycle time: saves 8 seconds per unit vs manual inspection

ISSUED BY: Manufacturing Engineering
APPROVED BY: Director of Manufacturing`;

const MN_TEXT_5 = `MANUFACTURING NOTICE - MN-2024-0092
PRODUCTION RAMP-UP: MODEL Y REFRESH LAUNCH

EFFECTIVE DATE: June 1, 2024
PRIORITY: HIGH
AFFECTED: All departments

1. NOTICE SUMMARY
Production ramp for the refreshed Model Y begins June 1, 2024. All departments must be prepared for the phased production increase from current 800 units/week to 1,200 units/week by end of Q3 2024.

2. RAMP SCHEDULE
- Phase 1 (June 1-30): 850 units/week - New tooling validation
- Phase 2 (July 1-31): 950 units/week - Process optimization
- Phase 3 (Aug 1-31): 1,100 units/week - Full staffing deployment
- Phase 4 (Sep 1-30): 1,200 units/week - Target rate achieved

3. KEY CHANGES FOR REFRESH
- Updated front fascia and headlamp assembly (new tooling at Station 14)
- Revised interior trim (3 new color options)
- New infotainment unit installation procedure
- Updated battery pack cooling manifold (15% flow increase)

4. STAFFING REQUIREMENTS
- 35 additional operators (hiring in progress)
- All current operators: 4-hour refresh training by May 25
- New operators: 2-week onboarding program

5. SUPPLY CHAIN READINESS
- All refresh parts validated and in pipeline
- 2-week safety stock target for critical components
- Daily supplier readiness calls during Phase 1

ISSUED BY: Launch Management Office
APPROVED BY: Plant Manager`;

const MI_TEXT_3 = `MANUFACTURING INSTRUCTIONS - MI-DU-0145
DRIVE UNIT ASSEMBLY: REAR MOTOR INSTALLATION

REVISION: 2.1.0
EFFECTIVE DATE: March 2024
WORK STATION: DU-Station 8

1. PURPOSE
Step-by-step instructions for installing the rear drive unit into the Model 3/Y subframe assembly.

2. CYCLE TIME: 110 seconds

3. REQUIRED TOOLS
- Overhead gantry crane (2-ton capacity)
- Torque wrench: 80-200 Nm range (calibrated)
- Alignment laser tool (Part# AT-5500)
- Drive unit lifting fixture (Part# LF-DU-200)
- Thread locking compound (Loctite 243)

4. INSTALLATION PROCEDURE

Step 1: Pre-Installation Check (15 seconds)
- Verify drive unit serial number matches build sheet
- Inspect mounting surfaces for debris or damage
- Confirm all protective caps removed from fluid ports
- Check subframe alignment pins are present and undamaged

Step 2: Positioning (30 seconds)
- Attach lifting fixture to drive unit (4 mounting points)
- Raise drive unit with gantry crane
- Align using laser tool - front mount first, then rear
- Lower slowly until alignment pins engage (audible click)

Step 3: Fastening (40 seconds)
- Install 4x M12 front mount bolts with thread locker
- Torque sequence: Front-left, front-right, rear-left, rear-right
- Torque: 120 Nm ± 5 Nm (two-pass method)
- Install 2x M10 rear mount bolts, torque to 85 Nm ± 3 Nm

Step 4: Connections (25 seconds)
- Connect HV power cable (orange, 3-pin)
- Connect coolant inlet hose (green tag)
- Connect coolant outlet hose (blue tag)
- Connect signal harness (12-pin connector)
- Verify all connections seated with gentle tug test

5. POST-INSTALLATION
- Spin test: Rotate output shaft by hand (should turn freely)
- Verify no coolant leaks at connections
- Log serial numbers in MES system
- Apply QC stamp on inspection card

APPROVED BY: Powertrain Engineering Manager`;

const MI_TEXT_4 = `MANUFACTURING INSTRUCTIONS - MI-PT-0067
PAINT BOOTH OPERATION: BASECOAT APPLICATION

REVISION: 5.0.0
EFFECTIVE DATE: January 2024
WORK AREA: Paint Shop - Booth 3

1. PURPOSE
Operating procedure for basecoat application in Paint Booth 3 using robotic spray systems.

2. BOOTH SPECIFICATIONS
- Temperature: 23°C ± 1°C
- Humidity: 65% ± 5% RH
- Air velocity: 0.3 m/s downward
- Filter change interval: Every 8 hours or 200 vehicles

3. PRE-OPERATION CHECKLIST
[ ] Booth temperature and humidity within specification
[ ] Air filtration system status: GREEN
[ ] Paint supply lines primed and bubble-free
[ ] Robot teach points verified (daily first-run check)
[ ] Color match panel approved by paint quality
[ ] Spray guns clean and atomizer caps replaced

4. BASECOAT APPLICATION SEQUENCE

Pass 1 - Primer Surface Preparation
- Tack wipe all surfaces with approved solvent cloth
- Verify no dust, fibers, or contaminants visible under UV light
- Report any primer defects to paint quality before proceeding

Pass 2 - First Basecoat Layer
- Film thickness target: 12-15 microns
- Robot speed: 400 mm/s
- Spray distance: 200mm from surface
- Fan width: 300mm
- Flash time after first coat: 3 minutes minimum

Pass 3 - Second Basecoat Layer
- Film thickness target: 12-15 microns (cumulative: 24-30 microns)
- Same parameters as Pass 2
- Flash time after second coat: 5 minutes minimum

Pass 4 - Optional Third Layer (metallic colors only)
- Orientation coat at reduced pressure
- Film thickness: 5-8 microns
- Purpose: Align metallic flakes for uniform appearance

5. QUALITY CHECKS BETWEEN BOOTHS
- Film thickness measurement (3 points per panel)
- Visual inspection under halogen flood lights
- Color match verification against master panel
- Orange peel assessment (must be ≤ Grade 3)

APPROVED BY: Paint Operations Manager`;

const MI_TEXT_5 = `MANUFACTURING INSTRUCTIONS - MI-EL-0198
WIRING HARNESS INSTALLATION: BODY MAIN HARNESS

REVISION: 3.1.0
EFFECTIVE DATE: February 2024
WORK STATION: GA-Station 6 and 7

1. PURPOSE
Instructions for routing and connecting the body main wiring harness in Model 3/Y vehicles.

2. CYCLE TIME: 145 seconds (split across 2 stations)

3. MATERIALS
- Body main harness assembly (verify P/N matches variant on build sheet)
- 12x push-pin retainers (Part# PR-3340)
- 6x adhesive cable clips (Part# AC-1150)
- Connector grease (apply to all exterior connectors)

4. STATION 6 - ROUTING (75 seconds)

Step 1: Harness Insertion
- Feed harness through firewall grommet (pre-installed)
- Ensure grommet fully seated (water seal critical)
- Route trunk along driver side sill channel

Step 2: Sill Routing
- Lay harness in channel, press into retainer clips every 150mm
- Install 6x push-pin retainers through harness loops into body holes
- Verify no pinch points at door hinge area
- Route A-pillar branch upward through headliner channel

Step 3: Rear Routing
- Route rear branch under rear seat mount
- Feed through C-pillar channel to taillight area
- Secure with 3x adhesive clips along trunk floor

5. STATION 7 - CONNECTIONS (70 seconds)

Step 1: Forward Connections
- BCM connector (24-pin, gray) - driver kick panel
- Fuse box connector (48-pin, black) - under dash
- Instrument cluster (16-pin, blue) - behind steering column
- Climate control (8-pin, white) - center stack

Step 2: Rear Connections
- Left taillight (6-pin)
- Right taillight (6-pin)
- Trunk latch (4-pin)
- Rear camera (4-pin)

6. VERIFICATION
- Continuity test via diagnostic tool (scan for all modules present)
- Tug test on every connector (must hold firm)
- Visual check: no exposed wires, no kinked harness sections

APPROVED BY: Electrical Engineering Supervisor`;

const QI_TEXT_3 = `QUALITY INSTRUCTIONS - QI-PT-0234
PAINT QUALITY INSPECTION: FINAL APPEARANCE AUDIT

REVISION: 3.0.0
EFFECTIVE DATE: March 2024
INSPECTION AREA: Paint Shop Exit

1. PURPOSE
Define inspection criteria for final paint quality assessment before vehicles proceed to General Assembly.

2. INSPECTION ENVIRONMENT
- Lighting: 1500 lux minimum, CRI > 90 (halogen flood)
- Inspector position: 45-degree angle, distance 0.5-1.0 meters
- Background: Neutral gray walls (18% reflectance)
- Inspection time: Maximum 90 seconds per vehicle

3. DEFECT CLASSIFICATION

CRITICAL (Grade A - Reject):
- Paint runs or sags > 2mm in length
- Color mismatch between panels (ΔE > 1.5)
- Exposed primer or bare metal
- Foreign object inclusions > 0.5mm
- Fish eyes or craters on horizontal surfaces

MAJOR (Grade B - Rework):
- Dust nibs > 3 per panel on horizontal surfaces
- Orange peel exceeding Grade 4 standard
- Sanding marks visible under inspection lighting
- Overspray on non-painted surfaces
- Minor color fade at panel edges

MINOR (Grade C - Accept with Note):
- Dust nibs ≤ 3 per panel
- Minor texture variation in hidden areas
- Slight gloss variation between panels (< 5 GU difference)

4. MEASUREMENT TOOLS
- Glossmeter (60° angle): Target ≥ 85 GU for all colors
- Film thickness gauge: Total DFT 100-130 microns
- Color spectrophotometer: ΔE ≤ 1.0 vs master
- Surface profile comparator for orange peel grading

5. DOCUMENTATION
- Record all defects on vehicle inspection sheet with location codes
- Photograph Grade A and B defects
- Enter data into quality tracking system within 30 minutes
- Generate shift summary report for paint operations

APPROVED BY: Paint Quality Supervisor`;

const QI_TEXT_4 = `QUALITY INSTRUCTIONS - QI-FA-0089
FINAL VEHICLE AUDIT: PRE-DELIVERY INSPECTION

REVISION: 6.2.0
EFFECTIVE DATE: February 2024
AUDIT FREQUENCY: 100% of vehicles before shipment

1. PURPOSE
Comprehensive final audit checklist ensuring every vehicle meets Tesla delivery standards before leaving the factory.

2. EXTERIOR AUDIT (3 minutes)

2.1 Panel Gaps and Flush
- All panel gaps: Within ± 1mm of nominal
- Flush tolerance: ± 0.5mm
- Measure at 12 designated points per vehicle side
- Record measurements in gap audit database

2.2 Paint and Finish
- No visible defects under daylight simulation lighting
- All trim pieces properly aligned and secured
- Glass: No chips, cracks, or distortion
- Wheels: No curb damage, proper torque verified

2.3 Lighting
- All exterior lights functional (headlamps, taillights, signals, markers)
- Headlamp aim verified via alignment screen
- DRL operation confirmed

3. INTERIOR AUDIT (3 minutes)

3.1 Fit and Finish
- Dashboard alignment and gap consistency
- Center screen powers on within 5 seconds
- All switches and controls functional
- Seat adjustment: All axes operational
- Seatbelts: Retract smoothly, latches click

3.2 NVH Quick Check
- Close each door: Solid sound, no rattles
- Open/close trunk and frunk: Smooth operation
- Window operation: All 4 windows cycle smoothly

4. FUNCTIONAL TESTS (4 minutes)
- Start vehicle, verify no warning lights after 10 seconds
- HVAC: Heat and cool within 30 seconds of activation
- Wiper operation: All speeds
- Horn: Functional
- Parking brake: Engage and release

5. DISPOSITION
- PASS: Vehicle cleared for shipment
- CONDITIONAL: Minor fix needed, rework and re-audit within 24 hours
- FAIL: Major issue, return to production for correction

APPROVED BY: Quality Assurance Director`;

const QI_TEXT_5 = `QUALITY INSTRUCTIONS - QI-SQ-0156
SUPPLIER PART VALIDATION: PPAP REQUIREMENTS

REVISION: 2.1.0
EFFECTIVE DATE: January 2024
APPLIES TO: All new production parts and engineering changes

1. PURPOSE
Define the Production Part Approval Process (PPAP) requirements for supplier parts before they can be used in Tesla vehicle production.

2. SUBMISSION LEVELS

Level 1 - Warrant Only
- Part submission warrant signed by supplier
- Used for: Low-risk cosmetic parts only

Level 3 - Standard (Most Common)
- Part submission warrant
- Dimensional results (full layout, 5 parts minimum)
- Material test results
- Performance test results
- Process flow diagram
- Control plan
- FMEA (Process)
- Capability study (Cpk ≥ 1.67 for critical characteristics)

Level 5 - Full
- All Level 3 elements PLUS:
- On-site audit results
- Checking fixtures and measurement systems
- Sample parts (25 minimum for production trial)
- Used for: Safety-critical components

3. DIMENSIONAL VALIDATION
- Measure all drawing characteristics on 5 production parts
- Report in standardized format (PPAP template v4.0)
- GD&T features: Report actual values, not just pass/fail
- Critical dimensions: Cpk study on 30 consecutive parts

4. MATERIAL CERTIFICATION
- Mill certificates for all raw materials
- IMDS (International Material Data System) entry required
- REACH and RoHS compliance documentation
- Restricted substance test results per Tesla RSL

5. APPROVAL TIMELINE
- Initial review: 5 business days from submission
- Feedback to supplier: Within 3 business days of review
- Final approval or rejection: Within 15 business days total
- Interim approval (conditional): 90 days maximum

APPROVED BY: Supplier Quality Engineering Manager`;

const QAN_TEXT_3 = `QUALITY ALERT NOTICE - QAN-2024-0031
PAINT DEFECT CLUSTER: METALLIC BASECOAT ORANGE PEEL

ALERT LEVEL: YELLOW (Elevated Monitoring)
ISSUED: March 15, 2024
VALID UNTIL: Root cause corrected

1. PROBLEM DESCRIPTION
An increase in orange peel defects has been identified on vehicles painted in Midnight Silver Metallic during the past 48 hours. Defect rate has increased from 2% baseline to 11% on affected color.

2. AFFECTED PRODUCT
- Color: Midnight Silver Metallic (Color Code: PMNG)
- Lines affected: Paint Booth 3 and Booth 5
- Estimated affected vehicles: 85 units (March 13-15)
- Other colors NOT affected

3. ROOT CAUSE INVESTIGATION (In Progress)
- Suspected: Humidity control drift in Booth 3 (recorded 72% vs 65% target)
- Under investigation: New batch of metallic basecoat (Lot# PPG-240312-A)
- HVAC maintenance records being reviewed
- Paint viscosity samples sent to lab (results expected March 16)

4. CONTAINMENT ACTIONS
[ ] Increase paint quality inspection from sampling to 100% for PMNG color
[ ] Hold all PMNG vehicles from last 48 hours for re-inspection
[ ] Calibrate humidity sensors in Booth 3 and 5
[ ] Retain paint samples from current batch for lab analysis
[ ] Notify paint supplier of potential material issue

5. REWORK DISPOSITION
Vehicles with orange peel exceeding Grade 3:
- Wet sand affected panels (2000 grit)
- Buff and polish to restore finish
- Re-inspect under standard lighting
- Maximum 2 rework attempts before respray required

ISSUED BY: Paint Quality Engineering`;

const QAN_TEXT_4 = `QUALITY ALERT NOTICE - QAN-2024-0038
CRITICAL: FASTENER LOT RECALL - INCORRECT HEAT TREATMENT

ALERT LEVEL: RED (Immediate Action Required)
ISSUED: March 18, 2024
VALID UNTIL: All affected inventory dispositioned

1. PROBLEM DESCRIPTION
Fastener supplier (BoltPro Industries) has issued a voluntary recall notification for M10 structural bolts (Part# BP-M10-FL-10.9) due to incorrect heat treatment. Affected bolts may not meet Grade 10.9 tensile strength requirements.

2. AFFECTED LOT INFORMATION
- Part: M10x30 Flanged Bolt, Grade 10.9
- Supplier: BoltPro Industries
- Affected lots: BP-2024-1102, BP-2024-1103, BP-2024-1104
- Quantity in recall: 45,000 pieces
- Date codes: February 15-22, 2024
- Used at: Suspension mount, subframe attachment points

3. RISK ASSESSMENT
- Safety risk: HIGH - These are structural fasteners in suspension system
- Failure mode: Bolt fracture under dynamic loading
- Potential consequence: Suspension component separation during driving

4. IMMEDIATE ACTIONS
[ ] STOP all production using affected bolt lots
[ ] Quarantine all remaining inventory from affected lots
[ ] Identify all vehicles built with affected lot numbers (via MES traceability)
[ ] Notify vehicle engineering for risk assessment
[ ] Replace with verified conforming bolts from alternative lots
[ ] 100% torque re-verification on affected vehicles if still in plant

5. FIELD ACTION (if vehicles shipped)
- Engineering to complete risk analysis within 24 hours
- If field action required, notify regulatory affairs team
- Prepare dealer notification package
- Supplier 8D report required within 5 business days

ISSUED BY: Supplier Quality Engineering
ESCALATION: VP Quality - Immediate notification required`;

const QAN_TEXT_5 = `QUALITY ALERT NOTICE - QAN-2024-0042
WARNING: SOFTWARE CALIBRATION ERROR - TORQUE CONTROLLERS

ALERT LEVEL: YELLOW (Elevated Monitoring)
ISSUED: March 20, 2024
VALID UNTIL: Software patch deployed and verified

1. PROBLEM DESCRIPTION
A software update deployed to Atlas Copco torque controllers on March 19 introduced a calibration offset. Controllers at 6 stations are reading 3-5% higher than actual applied torque.

2. AFFECTED STATIONS
- GA Line 1: Stations 22, 31 (dashboard, seat install)
- GA Line 2: Stations 15, 28 (door hinge, wheel bolts)
- Battery Line 4: Station 8 (module mounting)
- Battery Line 6: Station 12 (bus bar connections)

3. IMPACT ANALYSIS
- Affected window: March 19, 6:00 AM to March 20, 10:00 AM (28 hours)
- Estimated affected vehicles/modules: 320 vehicles, 180 battery modules
- Actual torque is LOWER than displayed (controllers read high)
- Maximum under-torque: 5% of nominal specification

4. CONTAINMENT
[ ] Roll back software to previous version (v8.2.1) - COMPLETED 10:15 AM
[ ] Verify all 6 stations reading correctly against master standard
[ ] Identify all units produced during affected window via MES timestamps
[ ] Spot-check torque on 50 random units from affected period
[ ] If spot-check shows values below minimum, expand to 100% verification

5. CORRECTIVE ACTION
- Software vendor to provide root cause analysis within 48 hours
- All future software updates require validation on test bench before deployment
- Add torque verification step using independent measurement after any software change

ISSUED BY: Process Engineering
REVIEWED BY: Quality Director`;

const VA_TEXT_3 = `VISUAL AIDE - VA-TQ-0045
CRITICAL TORQUE SEQUENCE DIAGRAM: BATTERY PACK CLOSURE

REVISION: 2.0.0
EFFECTIVE DATE: March 2024

1. PURPOSE
Reference diagram for the correct bolt torquing sequence when closing battery pack housings. Following the correct star pattern is critical to ensure uniform seal compression.

2. BOLT LAYOUT (42 perimeter bolts - M6)

Bolt numbering starts at front-left corner, proceeds clockwise:
Position 1-11: Front edge (left to right)
Position 12-22: Right edge (front to rear)
Position 23-32: Rear edge (right to left)
Position 33-42: Left edge (rear to front)

3. TORQUE SEQUENCE - STAR PATTERN

PASS 1 (Snug - 5 Nm):
Order: 1 → 22 → 11 → 32 → 6 → 27 → 17 → 37 → 3 → 24 → 14 → 35 → 8 → 29 → 19 → 39 → 5 → 26 → 9 → 30 → 15 → 36 → 20 → 40 → 2 → 23 → 12 → 33 → 7 → 28 → 16 → 38 → 4 → 25 → 10 → 31 → 13 → 34 → 18 → 42 → 21 → 41

PASS 2 (Final - 10 Nm ± 0.5 Nm):
Same sequence as Pass 1
Mark each bolt with paint pen after final torque

4. CRITICAL RULES
- NEVER torque bolts in sequential order (1, 2, 3, 4...)
- NEVER skip Pass 1 and go directly to final torque
- If any bolt is found loose during Pass 2, restart BOTH passes
- Maximum time between Pass 1 and Pass 2: 10 minutes
- Sealant working time: 30 minutes from application

5. VERIFICATION
After completing both passes:
[ ] All 42 bolts marked with yellow paint pen
[ ] No gaps visible between housing and lid
[ ] Sealant squeeze-out visible around entire perimeter
[ ] Torque audit: Verify 5 random bolts with checking tool

POSTED AT: Battery Pack Closure Stations - Lines 2, 4, 6`;

const VA_TEXT_4 = `VISUAL AIDE - VA-FL-0023
FLUID FILL POINT IDENTIFICATION GUIDE

REVISION: 3.0.0
EFFECTIVE DATE: February 2024

1. PURPOSE
Quick reference for identifying all vehicle fluid fill points, correct fluid types, and fill quantities. Post at all fluid fill stations.

2. FLUID FILL POINTS

COOLANT SYSTEM (ORANGE CAP)
- Location: Front trunk, passenger side
- Fluid: G-48 ethylene glycol coolant (50/50 pre-mix)
- Quantity: 8.5 liters (Model 3), 9.2 liters (Model Y)
- Fill method: Vacuum fill system
- Verification: Level between MIN and MAX marks after 5-min circulation

BRAKE FLUID (YELLOW CAP)
- Location: Front trunk, driver side
- Fluid: DOT 4 brake fluid (Tesla-approved brands only)
- Quantity: 0.6 liters
- Fill method: Gravity fill with reservoir adapter
- Verification: Level at MAX mark, ABS bleed cycle completed

WINDSHIELD WASHER (BLUE CAP)
- Location: Front trunk, center
- Fluid: Tesla-approved washer concentrate (diluted per label)
- Quantity: 3.8 liters
- Fill method: Manual pour
- Verification: Fill to neck, test spray operation

DRIVE UNIT GEAR OIL (NO EXTERNAL FILL - FACTORY SEALED)
- Front unit: 0.8L Dexron VI ATF (pre-filled at drive unit assembly)
- Rear unit: 0.9L Dexron VI ATF (pre-filled at drive unit assembly)
- Service interval: Lifetime fill, no maintenance required

A/C REFRIGERANT (GREEN SERVICE PORT)
- Refrigerant: R-1234yf
- Charge: 650g (Model 3), 720g (Model Y)
- Fill method: Certified A/C charging station only
- Heat pump vehicles: Additional 50g for heat pump circuit

3. CRITICAL WARNINGS
- NEVER mix coolant types (G-48 only, no G-05 or universal)
- NEVER use DOT 3 brake fluid (DOT 4 minimum)
- Verify correct fluid BEFORE filling - cross-contamination requires full system flush

POSTED AT: All fluid fill stations in General Assembly`;

const VA_TEXT_5 = `VISUAL AIDE - VA-DG-0056
DIAGNOSTIC ERROR CODE QUICK REFERENCE

REVISION: 4.1.0
EFFECTIVE DATE: March 2024

1. PURPOSE
Quick reference for common diagnostic error codes encountered during end-of-line testing. For full diagnostic procedures, refer to the service manual.

2. BATTERY SYSTEM CODES

BMS_001: Cell voltage imbalance > 100mV
- Action: Re-run cell balancing. If persists after 30 min, flag for engineering
- Priority: HIGH - Do not ship

BMS_002: Temperature sensor out of range
- Action: Check connector at affected sensor position. Re-seat and re-test
- Priority: MEDIUM - Rework and re-test

BMS_003: Isolation fault detected
- Action: STOP. Measure pack isolation resistance. Must be > 500kΩ
- Priority: CRITICAL - HV safety issue, quarantine immediately

BMS_004: Communication timeout with module
- Action: Check CAN bus harness connector at module. Re-seat connector
- Priority: MEDIUM - Usually connector seating issue

3. DRIVE UNIT CODES

DU_010: Motor phase resistance out of range
- Action: Check HV connector torque. Re-run resistance test
- Priority: HIGH - Do not ship if persists

DU_015: Resolver signal fault
- Action: Check resolver connector. If persists, replace drive unit
- Priority: HIGH - Vehicle undriveable

DU_020: Inverter over-temperature during test
- Action: Verify coolant flow to inverter. Check for air in cooling circuit
- Priority: MEDIUM - Purge cooling system and re-test

4. BODY ELECTRONICS CODES

BCM_101: Door ajar sensor fault
- Action: Check door latch connector and harness routing
- Priority: LOW - Adjust and re-test

BCM_105: Window anti-pinch calibration needed
- Action: Run window initialization procedure (close-open-close)
- Priority: LOW - Standard post-assembly calibration

BCM_110: Seat memory module not responding
- Action: Check seat wiring harness under seat rail
- Priority: LOW - Re-seat connector and re-test

5. ESCALATION
If error code persists after standard corrective action:
1. Document code, station, VIN, and actions taken
2. Escalate to zone engineer within 15 minutes
3. Do NOT repeat corrective action more than 2 times

POSTED AT: All End-of-Line Test Stations`;

const PCA_TEXT_3 = `PROCESS CHANGE APPROVAL - PCA-2024-0022
NEW STRUCTURAL ADHESIVE: BODY PANEL BONDING

STATUS: APPROVED
CHANGE TYPE: Material and Process
RISK LEVEL: Medium
EFFECTIVE DATE: May 15, 2024

1. CHANGE DESCRIPTION
Replace current epoxy structural adhesive (Henkel Teroson EP5065) with new crash-optimized adhesive (Dow BETAFORCE 2850) for body panel bonding at Stations B12-B16 in Body Shop.

2. CURRENT STATE
- Adhesive: Henkel Teroson EP5065
- Bead width: 8mm
- Cure temperature: 180°C for 25 minutes
- Lap shear strength: 25 MPa
- Impact peel strength: 20 N/mm

3. PROPOSED STATE
- Adhesive: Dow BETAFORCE 2850
- Bead width: 6mm (25% material reduction)
- Cure temperature: 170°C for 20 minutes (energy savings)
- Lap shear strength: 32 MPa (28% improvement)
- Impact peel strength: 35 N/mm (75% improvement)

4. JUSTIFICATION
- Superior crash energy absorption (validated in 15 crash tests)
- Lower application temperature reduces energy costs by $120K/year
- Narrower bead reduces material cost by 25%
- Faster cure time increases throughput by 2 JPH at body shop bottleneck

5. VALIDATION RESULTS
- Full vehicle crash test: PASS (NHTSA 5-star equivalent)
- 1000-hour salt spray corrosion test: PASS
- Thermal cycling (-40°C to +80°C, 500 cycles): PASS
- Production trial (500 vehicles): Zero adhesive-related defects

6. IMPLEMENTATION
- Week 1: Install new dispensing equipment and purge lines
- Week 2: Operator training (4 hours per operator)
- Week 3: Pilot run on Station B12 only (100 vehicles)
- Week 4: Roll out to B13-B16 after pilot validation

APPROVED BY: Body Engineering, Quality, Manufacturing`;

const PCA_TEXT_4 = `PROCESS CHANGE APPROVAL - PCA-2024-0029
AUTOMATED VISION INSPECTION: WIRE HARNESS ROUTING

STATUS: APPROVED
CHANGE TYPE: Inspection Method
RISK LEVEL: Low
EFFECTIVE DATE: April 1, 2024

1. CHANGE DESCRIPTION
Replace manual visual inspection of wire harness routing at GA Stations 6-7 with automated camera-based inspection system. The system uses AI-powered image recognition to verify harness routing, connector seating, and clip installation.

2. CURRENT STATE
- Inspection method: Manual visual by operator (self-inspect)
- Inspection time: 15 seconds per vehicle
- Detection rate: ~88% (based on downstream escape data)
- Common escapes: Missing clips, loose connectors, incorrect routing

3. PROPOSED STATE
- Inspection method: 8-camera vision system with AI analysis
- Inspection time: 3 seconds per vehicle (automated)
- Expected detection rate: >99%
- System: Cognex ViDi Deep Learning platform
- Training dataset: 10,000 labeled images (correct and defective)

4. JUSTIFICATION
- 12% of warranty claims in harness category traced to routing defects
- Manual inspection inconsistent across operators and shifts
- Camera system provides 100% documented evidence per vehicle
- Expected warranty cost reduction: $280K/year
- ROI payback period: 8 months

5. SYSTEM SPECIFICATIONS
- 8x Cognex IS7800 cameras (5MP resolution)
- LED ring lighting with polarization filters
- Processing time: < 2 seconds for full analysis
- Pass/fail decision with defect location overlay
- Image archive: 90 days rolling storage

6. FAILURE MODE HANDLING
- If vision system detects defect: Yellow light, operator corrects and re-scans
- If vision system is offline: Revert to manual inspection protocol
- If uncertain result (confidence < 95%): Flag for manual verification
- Daily system calibration check using reference panel

APPROVED BY: Quality Engineering, Manufacturing Engineering`;

const PCA_TEXT_5 = `PROCESS CHANGE APPROVAL - PCA-2024-0035
PACKAGING METHOD CHANGE: BATTERY MODULE SHIPPING

STATUS: PENDING VALIDATION
CHANGE TYPE: Packaging and Logistics
RISK LEVEL: Medium
TARGET EFFECTIVE DATE: June 1, 2024

1. CHANGE DESCRIPTION
Transition battery module shipping packaging from single-use cardboard/foam to reusable plastic totes with custom foam inserts. This change applies to all battery modules shipped between Cell Manufacturing and Pack Assembly buildings.

2. CURRENT STATE
- Packaging: Corrugated cardboard box with EPS foam inserts
- Modules per container: 2
- Container lifecycle: Single use (recycled after unpacking)
- Damage rate during transport: 0.8%
- Annual packaging cost: $1.2M
- Annual packaging waste: 45 tons

3. PROPOSED STATE
- Packaging: HDPE returnable tote (Part# RT-BM-400)
- Modules per container: 4 (double current capacity)
- Container lifecycle: 250+ cycles (5-year estimated life)
- Expected damage rate: < 0.1%
- Annual packaging cost: $180K (after Year 1 investment)
- Annual packaging waste: < 2 tons (end-of-life recycling only)

4. JUSTIFICATION
- 85% reduction in packaging cost after Year 1
- 96% reduction in packaging waste
- Better protection reduces module damage during transport
- Doubles shipping density (fewer forklift trips required)
- Aligns with Tesla sustainability commitments

5. RISK ASSESSMENT
Risk: Tote damage or contamination affecting module quality
Mitigation: Automated tote wash and inspection station at return point

Risk: Insufficient tote inventory during ramp-up
Mitigation: Order 120% of calculated requirement, phase out cardboard gradually

Risk: Foam insert degradation over time
Mitigation: Replace inserts every 50 cycles, visual inspection at wash station

6. VALIDATION PLAN
- Ship vibration test: ISTA 3A protocol with loaded totes
- Drop test: Corner and edge drops from 0.5m height
- 30-day pilot: Track damage rate on 500 module shipments
- Cost tracking: Compare actual vs projected savings for 90 days

APPROVAL STATUS
Manufacturing Engineering: APPROVED
Quality Engineering: APPROVED
Logistics: APPROVED
Finance: PENDING (reviewing Year 1 investment)
Sustainability: APPROVED

CHANGE OWNER: Logistics and Packaging Engineering`;

// ── Reusable Cloudinary URLs for downloadable files ──────────────────

const CLOUDINARY_DOCX_1 = 'https://res.cloudinary.com/dtr1tnutd/raw/upload/v1763998236/cwmeq1s3yjy2cg4c7csr.docx';
const CLOUDINARY_PDF_1 = 'https://res.cloudinary.com/dtr1tnutd/raw/upload/test_document_3_gtadth.pdf';
const CLOUDINARY_DOCX_2 = 'https://res.cloudinary.com/dtr1tnutd/raw/upload/v1763998602/hwv8b6bqll7ydgfecmhd.docx';

const SAMPLES = [
  // ── MN: Manufacturing Notices ──
  {
    title: 'Line Shutdown Notice - Battery Module Line 4',
    description: 'Planned shutdown for equipment upgrade and recalibration on Line 4.',
    documentType: 'MN',
    category: 'Battery Module',
    tags: ['battery', 'shutdown', 'maintenance', 'line-4'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'mn_line_shutdown_001',
    textContent: MN_TEXT_1
  },
  {
    title: 'Material Change Notice - Thermal Interface',
    description: 'Thermal interface material supplier change notification and process updates.',
    documentType: 'MN',
    category: 'Battery Pack',
    tags: ['material-change', 'thermal', 'supplier'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'mn_material_change_002',
    textContent: MN_TEXT_2
  },
  {
    title: 'Shift Schedule Change - Stamping Plant',
    description: 'Updated shift rotation schedule for stamping plant effective April 2024.',
    documentType: 'MN',
    category: 'Drive Unit',
    tags: ['shift-change', 'stamping', 'schedule'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'mn_shift_schedule_003',
    textContent: MN_TEXT_3
  },
  {
    title: 'New Equipment Installation - CNC Mill Bay 7',
    description: 'Notice for new 5-axis CNC milling center installation in Bay 7.',
    documentType: 'MN',
    category: 'Energy',
    tags: ['equipment', 'cnc', 'installation', 'bay-7'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'mn_cnc_install_004',
    textContent: MN_TEXT_4
  },
  {
    title: 'Production Ramp-Up Plan - Cybertruck Line',
    description: 'Phase 2 ramp-up timeline and milestones for Cybertruck production.',
    documentType: 'MN',
    category: 'Semi',
    tags: ['ramp-up', 'cybertruck', 'capacity', 'milestones'],
    version: '2.0.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'mn_ramp_up_005',
    textContent: MN_TEXT_5
  },

  // ── MI: Manufacturing Instructions ──
  {
    title: 'Battery Pack Final Assembly Procedure',
    description: 'Step-by-step instructions for Model 3/Y battery pack final assembly.',
    documentType: 'MI',
    category: 'Battery Pack',
    tags: ['battery', 'assembly', 'torque', 'procedure'],
    version: '3.2.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'mi_battery_assembly_001',
    textContent: MI_TEXT_1
  },
  {
    title: 'Front Fascia Installation Instructions',
    description: 'General assembly instructions for front fascia installation at Station 14.',
    documentType: 'MI',
    category: 'Power Wall',
    tags: ['general-assembly', 'fascia', 'installation'],
    version: '2.0.1',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'mi_fascia_install_002',
    textContent: MI_TEXT_2
  },
  {
    title: 'Drive Unit Assembly Procedure',
    description: 'Complete assembly procedure for front and rear drive unit installation.',
    documentType: 'MI',
    category: 'Drive Unit',
    tags: ['drive-unit', 'assembly', 'motor', 'procedure'],
    version: '1.4.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'mi_drive_unit_003',
    textContent: MI_TEXT_3
  },
  {
    title: 'Paint Booth Operation Manual',
    description: 'Standard operating procedure for automated paint booth Lines 1-3.',
    documentType: 'MI',
    category: 'Mega Pack',
    tags: ['paint', 'booth', 'operation', 'automation'],
    version: '3.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'mi_paint_booth_004',
    textContent: MI_TEXT_4
  },
  {
    title: 'Wiring Harness Installation Guide',
    description: 'Step-by-step instructions for main body wiring harness routing and connection.',
    documentType: 'MI',
    category: 'PCS',
    tags: ['wiring', 'harness', 'installation', 'routing'],
    version: '2.1.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'mi_wiring_harness_005',
    textContent: MI_TEXT_5
  },

  // ── QI: Quality Instructions ──
  {
    title: 'Battery Cell Incoming Inspection',
    description: 'Incoming inspection requirements for 2170 and 4680 battery cells.',
    documentType: 'QI',
    category: 'Battery Module',
    tags: ['inspection', 'battery-cell', 'incoming', 'AQL'],
    version: '4.1.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'qi_cell_inspection_001',
    textContent: QI_TEXT_1
  },
  {
    title: 'Weld Quality Verification Procedure',
    description: 'In-process inspection criteria for ultrasonic and laser welds.',
    documentType: 'QI',
    category: 'Drive Unit',
    tags: ['welding', 'inspection', 'ultrasonic', 'laser'],
    version: '2.3.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'qi_weld_quality_002',
    textContent: QI_TEXT_2
  },
  {
    title: 'Paint Quality Inspection Standards',
    description: 'Color match, orange peel, and defect classification for all paint operations.',
    documentType: 'QI',
    category: 'Energy',
    tags: ['paint', 'inspection', 'color-match', 'defect'],
    version: '5.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'qi_paint_quality_003',
    textContent: QI_TEXT_3
  },
  {
    title: 'Final Vehicle Audit Checklist',
    description: 'Comprehensive end-of-line audit checklist for all vehicle programs.',
    documentType: 'QI',
    category: 'Semi',
    tags: ['audit', 'final-inspection', 'checklist', 'vehicle'],
    version: '3.1.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'qi_final_audit_004',
    textContent: QI_TEXT_4
  },
  {
    title: 'Supplier Part Validation (PPAP) Procedure',
    description: 'PPAP submission requirements and validation criteria for new supplier parts.',
    documentType: 'QI',
    category: 'Battery Pack',
    tags: ['ppap', 'supplier', 'validation', 'incoming'],
    version: '2.0.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'qi_ppap_validation_005',
    textContent: QI_TEXT_5
  },

  // ── QAN: Quality Alert Notices ──
  {
    title: 'CRITICAL: Torque Specification Non-Conformance',
    description: 'Red alert for torque tool calibration drift on Line 2 bus bar connections.',
    documentType: 'QAN',
    category: 'Battery Module',
    tags: ['alert', 'torque', 'calibration', 'critical'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'qan_torque_alert_001',
    textContent: QAN_TEXT_1
  },
  {
    title: 'WARNING: Coolant Hose Material Deviation',
    description: 'Yellow alert for dimensional variation in incoming coolant hose lot.',
    documentType: 'QAN',
    category: 'Power Wall',
    tags: ['alert', 'supplier', 'coolant', 'deviation'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'qan_coolant_hose_002',
    textContent: QAN_TEXT_2
  },
  {
    title: 'ALERT: Paint Defect Cluster - Line 2 Booth',
    description: 'Orange alert for elevated paint defect rate in Line 2 spray booth.',
    documentType: 'QAN',
    category: 'Mega Pack',
    tags: ['alert', 'paint', 'defect', 'cluster'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'qan_paint_defect_003',
    textContent: QAN_TEXT_3
  },
  {
    title: 'CRITICAL: Fastener Lot Recall - Supplier XM',
    description: 'Red alert for non-conforming fastener lot requiring immediate containment.',
    documentType: 'QAN',
    category: 'PCS',
    tags: ['alert', 'fastener', 'recall', 'critical', 'containment'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'qan_fastener_recall_004',
    textContent: QAN_TEXT_4
  },
  {
    title: 'WARNING: Software Calibration Error - ABS Module',
    description: 'Yellow alert for incorrect calibration data in ABS control module batch.',
    documentType: 'QAN',
    category: 'Semi',
    tags: ['alert', 'software', 'calibration', 'abs', 'module'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'qan_software_cal_005',
    textContent: QAN_TEXT_5
  },

  // ── VA: Visual Aides ──
  {
    title: 'Battery Module Connector ID Guide',
    description: 'Color-coded connector identification and routing reference for assembly.',
    documentType: 'VA',
    category: 'Battery Module',
    tags: ['visual-aide', 'connector', 'routing', 'color-code'],
    version: '1.5.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'va_connector_guide_001',
    textContent: VA_TEXT_1
  },
  {
    title: 'PPE Requirements by Work Zone',
    description: 'Quick reference for PPE requirements in each factory work zone.',
    documentType: 'VA',
    category: 'Energy',
    tags: ['visual-aide', 'ppe', 'safety', 'zones'],
    version: '2.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'va_ppe_guide_002',
    textContent: VA_TEXT_2
  },
  {
    title: 'Torque Sequence Diagram - Subframe Assembly',
    description: 'Visual guide for correct bolt torque sequence on front subframe.',
    documentType: 'VA',
    category: 'Drive Unit',
    tags: ['visual-aide', 'torque', 'sequence', 'subframe'],
    version: '1.2.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'va_torque_sequence_003',
    textContent: VA_TEXT_3
  },
  {
    title: 'Fluid Fill Point Identification Chart',
    description: 'Location and color-coded identification of all fluid fill points on vehicle.',
    documentType: 'VA',
    category: 'Battery Pack',
    tags: ['visual-aide', 'fluid-fill', 'identification', 'chart'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'va_fluid_fill_004',
    textContent: VA_TEXT_4
  },
  {
    title: 'Diagnostic Error Code Quick Reference',
    description: 'Visual quick-reference card for common DTC codes and resolution steps.',
    documentType: 'VA',
    category: 'PCS',
    tags: ['visual-aide', 'diagnostic', 'dtc', 'error-codes'],
    version: '3.0.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'va_dtc_reference_005',
    textContent: VA_TEXT_5
  },

  // ── PCA: Process Change Approvals ──
  {
    title: 'Weld Parameter Optimization - Ultrasonic',
    description: 'Approved process change for ultrasonic welding parameter optimization.',
    documentType: 'PCA',
    category: 'Mega Pack',
    tags: ['process-change', 'welding', 'optimization', 'approved'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'pca_weld_params_001',
    textContent: PCA_TEXT_1
  },
  {
    title: 'Line Speed Increase - GA Line 1',
    description: 'Process change request to increase GA Line 1 from 52 to 58 JPH.',
    documentType: 'PCA',
    category: 'Power Wall',
    tags: ['process-change', 'line-speed', 'capacity', 'pending'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'pca_line_speed_002',
    textContent: PCA_TEXT_2
  },
  {
    title: 'New Structural Adhesive Introduction',
    description: 'Approval for new structural adhesive replacing spot welds on rear quarter panel.',
    documentType: 'PCA',
    category: 'Semi',
    tags: ['process-change', 'adhesive', 'structural', 'approved'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_DOCX_1,
    filePublicId: 'pca_adhesive_003',
    textContent: PCA_TEXT_3
  },
  {
    title: 'Automated Vision Inspection Deployment',
    description: 'Process change to add AI-powered vision inspection at end-of-line station.',
    documentType: 'PCA',
    category: 'Battery Module',
    tags: ['process-change', 'vision', 'inspection', 'automation'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_PDF_1,
    filePublicId: 'pca_vision_inspect_004',
    textContent: PCA_TEXT_4
  },
  {
    title: 'Packaging Method Change - Battery Modules',
    description: 'Updated packaging and shipping method for battery modules to reduce damage.',
    documentType: 'PCA',
    category: 'Battery Pack',
    tags: ['process-change', 'packaging', 'battery', 'shipping'],
    version: '1.0.0',
    fileUrl: CLOUDINARY_DOCX_2,
    filePublicId: 'pca_packaging_005',
    textContent: PCA_TEXT_5
  }
];

const extensionToMime = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

const detectMime = (url) => {
  const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  if (!match) return 'application/octet-stream';
  return extensionToMime[match[1].toLowerCase()] || 'application/octet-stream';
};

const fetchSize = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const len = response.headers.get('content-length');
    return len ? parseInt(len, 10) : 0;
  } catch (error) {
    console.warn('Unable to fetch size for', url, error.message);
    return 0;
  }
};

const main = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('Database schema synced');

  let user = await User.findOne({ where: { email: SAMPLE_USER.email }, paranoid: false });
  if (!user) {
    user = await User.create(SAMPLE_USER);
    console.log('Created demo admin user demo.admin@tesla.com (password: DemoPass123!)');
  } else {
    console.log('Demo admin user already exists');
  }

  // Fetch file sizes once per unique URL
  const uniqueUrls = [...new Set(SAMPLES.map(s => s.fileUrl))];
  const sizeMap = {};
  for (const url of uniqueUrls) {
    sizeMap[url] = await fetchSize(url);
  }

  let created = 0;
  let updated = 0;

  for (const sample of SAMPLES) {
    const payload = {
      ...sample,
      fileType: detectMime(sample.fileUrl),
      fileSize: sizeMap[sample.fileUrl] || 0,
      createdBy: user.id
    };

    const existing = await Document.findOne({ where: { title: sample.title }, paranoid: false });
    if (existing) {
      await existing.update(payload);
      updated++;
      console.log(`  Updated: ${sample.title}`);
    } else {
      await Document.create(payload);
      created++;
      console.log(`  Created: ${sample.title}`);
    }
  }

  await sequelize.close();
  console.log(`\nSeeding complete: ${created} created, ${updated} updated (${SAMPLES.length} total)`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
