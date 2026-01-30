# 🔄 Circular Economy Redesign: The Refurbisher Ecosystem

## 1. Project Overview & Objective
Transform **Recycle-Bharat** from a linear e-waste tracking system into a **Circular Economy Platform**. By introducing the **Refurbisher** role, we bridge the gap between "Active Use" and "Waste," enabling a **"Repair First, Recycle Last"** policy.

---

## 2. Updated User Roles & Actors

| Role | Responsibility |
| :--- | :--- |
| **CITIZEN** | Lists devices, chooses between Refurbish (Commercial) or Recycle (Environmental). |
| **REFURBISHER** | Authorized center that evaluates, repairs, or buys components for reuse. |
| **REFURBISHER_AGENT** | Employee of the Refurbisher who handles doorstep diagnostics and pickup (Path B). |
| **RECYCLER** | Endpoint for non-reusable electronic waste destruction. |
| **COLLECTOR** | Agent of the Recycler who handles waste pickup from Citizen or Refurbisher (Path A/Waste). |
| **GOVT / GOVT_AUTHORITY** | Monitors circular economy metrics (Refurbish Rate vs. Recycling Rate). |

---

## 3. The Two-Path Lifecycle (FSM Redesign)

### Path A: Direct Recycle (Green Path)
*Focus: Environment, high credit points for Citizen.*
1. `ACTIVE` → `RECYCLING_REQUESTED`
2. `RECYCLING_REQUESTED` → `COLLECTOR_ASSIGNED` (Recycler's Collector)
3. `COLLECTOR_ASSIGNED` → `COLLECTED` (Verify via **`WST-`** code)
4. `COLLECTED` → `DELIVERED_TO_RECYCLER`
5. `DELIVERED_TO_RECYCLER` → `RECYCLED` (Terminal)
6. **Incentive:** Citizen receives Environmental Credit Points.

### Path B: Diagnostic & Refurbish (Commercial Path)
*Focus: Circularity, Cash/Repair Value for Citizen, Credit Points for Refurbisher.*
1. `ACTIVE` → `REFURB_DIAGNOSTIC_REQUESTED` (Citizen pays Pre-diagnostic fee - Simulated)
2. `REFURB_DIAGNOSTIC_REQUESTED` → `UNDER_DIAGNOSTIC` (Refurbisher's Agent picks up via **`REF-`** code)
3. `UNDER_DIAGNOSTIC` → `PROPOSAL_PENDING` 
   - **SLA:** Must move to this state within **48 hours**, else Auto-Dispute/Penalty.
4. **Branching Decision (Citizen Choice):**
   - **Option 1 (REPAIR):** `PROPOSAL_PENDING` → `REPAIRING` (User pays simulated repair cost)
     - `REPAIRING` → `ACTIVE` (Verify delivery back to Citizen via **`RTN-`** code)
   - **Option 2 (SELL):** `PROPOSAL_PENDING` → `COMPONENTS_SOLD` (User accepts buy-back value)
     - Refurbisher keeps reusable parts.
5. **Waste Loop (Waste Handover):** Refurbisher requests pickup for non-functional carcass.
   - `COMPONENTS_SOLD` → `WASTE_HANDOVER_PENDING`
   - `WASTE_HANDOVER_PENDING` → `COLLECTED` (Verify via **`WST-`** code from Recycler's Collector)
   - `COLLECTED` → `RECYCLED` (Terminal)
6. **Incentive Logic:**
   - **Citizen:** Receives simulated Cash/Refurbished Device. **No** Recycle Credit Points.
   - **Refurbisher:** Receives Environmental Credit Points for handing over waste to the Recycler.

---

**Implementation Status:** ✅ COMPLETE (Rev 2.1)
- **Backend:** Models, Routes, FSM, and Controller fully integrated.
- **Frontend:** Citizen Choice UI, Refurbisher Dashboard, and Verification flows active.
- **Verification:** Triple-code system (`REF-`, `RTN-`, `WST-`) operational.
---

## 4. Database Schema Changes (SQL)

### A. Role Update
```sql
ALTER TYPE role_type ADD VALUE 'REFURBISHER';
ALTER TYPE role_type ADD VALUE 'REFURBISHER_AGENT';
```

### B. Device State Expansion
```sql
ALTER TYPE device_state ADD VALUE 'REFURB_DIAGNOSTIC_REQUESTED';
ALTER TYPE device_state ADD VALUE 'UNDER_DIAGNOSTIC';
ALTER TYPE device_state ADD VALUE 'PROPOSAL_PENDING';
ALTER TYPE device_state ADD VALUE 'REPAIRING';
ALTER TYPE device_state ADD VALUE 'REFURBISHED';
ALTER TYPE device_state ADD VALUE 'COMPONENTS_SOLD';
ALTER TYPE device_state ADD VALUE 'WASTE_HANDOVER_PENDING';
```

### C. Refurbish Jobs Table
```sql
CREATE TABLE refurbish_jobs (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) UNIQUE NOT NULL,
    refurbisher_id INTEGER REFERENCES users(id) NOT NULL,
    agent_id INTEGER REFERENCES users(id), -- Refurbisher's internal agent
    citizen_id INTEGER REFERENCES users(id) NOT NULL,
    
    -- Financials (Simulated for Demo)
    diagnostic_fee_paid BOOLEAN DEFAULT false,
    repair_quote DECIMAL(10, 2),
    buyback_quote DECIMAL(10, 2),
    
    -- Status
    citizen_decision ENUM('PENDING', 'APPROVE_REPAIR', 'SELL_COMPONENTS', 'RETURN_AS_IS') DEFAULT 'PENDING',
    job_status ENUM('DIAGNOSTIC', 'PROPOSED', 'IN_REPAIR', 'COMPLETED', 'CANCELLED') DEFAULT 'DIAGNOSTIC',
    diag_proposal_deadline TIMESTAMP WITH TIME ZONE, -- For 48h SLA
    
    -- Verification Codes
    refurb_pickup_code VARCHAR(10), -- REF-XXXXXX
    refurb_return_code VARCHAR(10), -- RTN-XXXXXX (For repair return)
    hardware_fingerprint JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Security & Fraud Prevention (Redesigned)

### A. Triple Verification Codes
- **`REF-XXXXXX`**: Pickup by Refurbisher Agent.
- **`RTN-XXXXXX`**: Return of repaired device to Citizen.
- **`WST-XXXXXX`**: Pickup of waste by Recycler Collector (from Citizen or Refurbisher).

### B. Refurbisher Accountability
- **Govt Approval:** Only Govt-vetted Refurbishers can register.
- **Refund Policy:** If a Refurbisher fails (Fraud/SLA breach), Admin/Govt reviews the log and triggers a simulated refund to the Citizen.

---

## 6. Dashboard Coordination

### Citizen Dashboard
- **Choice Interface:** Post listing, Citizen sees "Environment (Recycle)" vs "Value (Refurbish)".
- **Diagnostic Fee Payment:** Integrated checkout for the pre-diagnostic fee.
- **Proposal Approval:** Interactive card to view repair costs and accept/reject.

### Refurbisher Dashboard
- **Diagnostic Lab:** Interface to input repair/buyback quotes.
- **Inventory:** Track devices currently "In-Repair."
- **Waste Management:** Button to trigger "Recycler Pickup" for stripped components and non-functional junk.

### Recycler Dashboard
- **Source Differentiation:** Dashboard shows if incoming waste is from a **Citizen** (Direct) or **Refurbisher** (Stripped).

### Govt Dashboard
- **Sustainability Matrix:**
  - **Refurbishment Rate (%)**: Total Refurbished / Total Requests.
  - **Material Circularity Index**: Weight of materials recovered from refurbisher-driven recycling.

---

## 7. Next Steps for Implementation
1. Migrate the Database using the definitions above.
2. Update the `LifecycleService` FSM rules.
3. Create the `RefurbishController` for diagnostic management.
4. Implement the dual-code verification system.
5. Build the Refurbisher-specific UI components.
