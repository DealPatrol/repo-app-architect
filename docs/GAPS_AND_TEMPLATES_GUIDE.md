# Template Assembly & Gap Tracking Feature Guide

## Overview

This feature enables developers to:
1. **Discover reusable templates** from their codebase combinations
2. **Prioritize missing code** strategically with impact/effort analysis
3. **Track completion** of gap items as they build

The system transforms the question from "What's missing?" to "What can I build with what I have?"

## Core Components

### 1. Template Assembly Hub (`/dashboard/templates`)

**Purpose**: Inspire developers by showing combinations they can build today

**Key Features**:
- Shows pre-configured templates combining 2+ blueprints
- Displays reuse percentage (how much code already exists)
- Estimates build time based on missing files
- Tiers: Quick Start (15min-1hr) → Standard (1-4h) → Comprehensive (1-5 days)
- Filter templates by tech stack and tier

**Data Flow**:
1. Templates are created from blueprint combinations
2. Each template calculates: total files, missing files, reuse %, effort hours
3. Featured templates highlight the quickest wins

### 2. Missing Code Dashboard (`/dashboard/gaps`)

**Purpose**: Strategic view of ALL missing code across projects

**Key Features**:
- **Priority Matrix**: 2D scatter plot (Impact vs Effort)
  - Top-right (red) = Quick wins (high impact, low effort)
  - Right side (orange) = Bigger investments
  - Bottom-left (gray) = Deferrable
  
- **Gap Cards**: Each missing file shows:
  - Complexity (low/medium/high)
  - Estimated hours
  - Category (auth, api, ui, database, utils, config)
  - Dependencies (what other files it needs)
  - Whether it blocks other gaps
  - Suggested stub code (if available)
  
- **Grouping**: View gaps by:
  - Priority (critical → high → medium → low)
  - Category (authentication, API, UI, etc)
  - Blueprint
  
- **Completion Tracking**: Mark gaps as done to update reuse % metrics

**Data Flow**:
1. All missing files from all blueprints are collected
2. Each gap is scored by impact (blocking?) and effort (hours)
3. Priority calculated: (critical=quick wins, high=important, medium=nice-to-have, low=defer)

### 3. Gap Priority Calculation

**Impact Score** (0-100):
- Blocking gaps: +40 points (critical path)
- Count of dependent gaps: +10pts each (max 40)
- Complexity (high=+20, medium=+10, low=0)

**Effort Score** (0-100):
- Normalized from estimated hours (40 hours = 100)
- Direct mapping: 1h = 2.5, 10h = 25, etc

**Priority Decision**:
- **Critical**: High impact (60+) + low effort (≤30) = ship immediately
- **High**: High impact (70+) OR medium impact + low effort
- **Medium**: Moderate impact (30-60)
- **Low**: Low impact (<30)

## APIs

### GET `/api/gaps/summary`
Returns all missing gaps and summary statistics

**Query Parameters**:
- `blueprintId` (optional): Filter by blueprint

**Response**:
```json
{
  "gaps": [
    {
      "id": "uuid",
      "blueprint_id": "uuid",
      "file_name": "auth-middleware.ts",
      "file_path": "src/middleware/auth-middleware.ts",
      "purpose": "Validates JWT tokens",
      "complexity": "medium",
      "estimated_hours": 2.5,
      "category": "auth",
      "dependencies": ["types.ts", "config.ts"],
      "is_blocking": true,
      "suggested_stub": "// stub code..."
    }
  ],
  "summary": {
    "total_gaps": 24,
    "blocking_gaps": 3,
    "total_hours": 45,
    "completed_count": 5,
    "by_category": { "auth": 5, "api": 8, "ui": 11 }
  }
}
```

### POST `/api/gaps/mark-complete`
Mark a gap as completed

**Body**:
```json
{
  "gapId": "uuid",
  "blueprintId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "completedGap": { "id": "...", "gap_id": "...", "completed_at": "..." },
  "completedCount": 5
}
```

### POST `/api/templates/generate`
Create a new template from blueprint combination

**Body**:
```json
{
  "name": "Full-Stack SaaS Starter",
  "description": "Combines auth + API + dashboard UI",
  "blueprintIds": ["uuid1", "uuid2", "uuid3"],
  "techStack": ["Next.js", "PostgreSQL", "React"],
  "tier": "standard"
}
```

**Response**:
```json
{
  "template": {
    "id": "uuid",
    "name": "Full-Stack SaaS Starter",
    "blueprint_ids": ["uuid1", "uuid2", "uuid3"],
    "estimated_hours": 12,
    "reuse_percentage": 65,
    "total_files": 45,
    "missing_files": 16,
    "tier": "standard"
  }
}
```

## Database Schema

### `missing_file_gaps`
Stores all missing files that need to be built

```sql
CREATE TABLE missing_file_gaps (
  id UUID PRIMARY KEY,
  blueprint_id UUID REFERENCES app_blueprints(id),
  file_name VARCHAR,
  file_path VARCHAR,
  purpose TEXT,
  complexity VARCHAR CHECK (complexity IN ('low', 'medium', 'high')),
  estimated_hours NUMERIC,
  category VARCHAR CHECK (category IN ('auth', 'api', 'ui', 'database', 'utils', 'config', 'other')),
  dependencies JSONB,
  is_blocking BOOLEAN,
  suggested_stub TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### `completed_gaps`
Tracks which gaps developers have completed

```sql
CREATE TABLE completed_gaps (
  id UUID PRIMARY KEY,
  gap_id UUID REFERENCES missing_file_gaps(id),
  blueprint_id UUID REFERENCES app_blueprints(id),
  completed_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### `templates`
Pre-configured project combinations

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  blueprint_ids JSONB,
  tech_stack JSONB,
  estimated_hours NUMERIC,
  reuse_percentage NUMERIC,
  total_files INTEGER,
  missing_files INTEGER,
  tier VARCHAR CHECK (tier IN ('quick_start', 'standard', 'comprehensive')),
  featured BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Workflow

### For Developers

1. **Discover**: Go to `/dashboard/templates`
   - See pre-built combinations with quick wins highlighted
   - Filter by tech stack or tier
   - See how much is already built (reuse %)

2. **Prioritize**: Go to `/dashboard/gaps`
   - View all missing code in priority matrix
   - See impact vs effort visually
   - Group by category to focus
   - Review dependencies and blockers

3. **Build**: Select a gap
   - Copy suggested stub code
   - Reference similar code in your repos
   - Mark complete when done

4. **Track**: Dashboard shows progress
   - Updated completion %
   - Reuse % increases with each gap closed
   - Templates become "ship ready" as gaps close

### For System Integrations

1. **When analysis completes**: Generate gaps from missing_files
   - Parse each missing_file entry
   - Calculate complexity from file purpose/tech
   - Identify dependencies by name matching
   - Create MissingFileGap records

2. **When blueprint analyzed**: Generate templates
   - Group related blueprints
   - Calculate aggregate metrics
   - Create 1-2 featured templates
   - Create comprehensive templates

3. **When gaps marked complete**: Update metrics
   - Increment completed_count
   - Recalculate reuse_percentage for blueprint
   - Check if blueprint tier improved (e.g., foundation → almost_there)

## Integration Points

### With Existing Systems

- **Blueprints**: Feed missing_files into gap system
- **Code Completion**: Link suggested stubs to code-completion API
- **Analyses**: Trigger gap generation after analysis completes
- **Dashboard**: Show gap widget with quick stats

### With Claude/LLM

- Generate suggested_stub code for each gap
- Provide implementation hints based on category
- Summarize gap purpose and dependencies

## Usage Patterns

### Pattern 1: Quick Win Builder
```
1. Go to Templates Hub
2. Find "Quick Start" template (15min)
3. Click "Use This Template"
4. Review 1-2 missing files
5. Copy stubs, implement quickly
6. Mark complete
7. Ship in under 30 minutes
```

### Pattern 2: Strategic Prioritizer
```
1. Go to Gap Dashboard
2. Sort by "Critical" priority
3. Review impact matrix (top-right = do first)
4. Group by "dependencies"
5. Build in suggested order
6. Mark each complete
7. Watch reuse % increase
```

### Pattern 3: Category Focus
```
1. Go to Gap Dashboard
2. Filter by category (e.g. "auth")
3. See all auth-related missing files
4. Build all auth pieces together
5. Move to next category
6. Leverage dependencies for smoother workflow
```

## Future Enhancements

- [ ] Drag-drop reordering of build order
- [ ] Time tracking for gap completion
- [ ] Team collaboration (comment on gaps)
- [ ] Integration with GitHub issues (create issue per gap)
- [ ] Smart stub generation (context-aware templates)
- [ ] Impact calculation from user analytics
- [ ] Build cost estimation (infrastructure)
- [ ] Gap suggestions from AI ("you should build this next")
