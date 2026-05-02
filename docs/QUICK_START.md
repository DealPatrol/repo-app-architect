# Quick Start Guide - Template Assembly & Gap Tracking

## 5-Minute Setup

### 1. Run Database Migration
```bash
# Using Neon SQL client
psql $DATABASE_URL < migrations/002_gap_tracking_and_templates.sql
```

### 2. Test the Features
- Visit `/dashboard/templates` to see templates page
- Visit `/dashboard/gaps` to see gaps page
- View main dashboard to see new widgets

### 3. Integration (When Ready)
```typescript
// After creating a blueprint, generate gaps:
import { generateGapsFromBlueprint, generateTemplatesFromBlueprints } from '@/lib/gap-generation'

// In your analysis endpoint:
const blueprint = await createBlueprint({ /* ... */ })
await generateGapsFromBlueprint(blueprint)

// After all blueprints created:
const blueprints = await getBlueprintsByAnalysis(analysisId)
await generateTemplatesFromBlueprints(blueprints)
```

## Key URLs

| Feature | URL | Purpose |
|---------|-----|---------|
| Templates Hub | `/dashboard/templates` | Discover quick wins |
| Gap Dashboard | `/dashboard/gaps` | Prioritize missing code |
| Main Dashboard | `/dashboard` | See new widgets |
| Analyses | `/dashboard/analyses` | See education banner |

## API Quick Reference

### Get All Gaps
```bash
curl http://localhost:3000/api/gaps/summary
```

**Get Gaps for Blueprint**
```bash
curl http://localhost:3000/api/gaps/summary?blueprintId=uuid
```

### Mark Gap Complete
```bash
curl -X POST http://localhost:3000/api/gaps/mark-complete \
  -H "Content-Type: application/json" \
  -d '{
    "gapId": "uuid",
    "blueprintId": "uuid"
  }'
```

### Create Template
```bash
curl -X POST http://localhost:3000/api/templates/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Template",
    "blueprintIds": ["uuid1", "uuid2"],
    "techStack": ["Next.js", "React"],
    "tier": "standard"
  }'
```

## Component Usage Examples

### Using Gap Priority Matrix
```tsx
import { GapPriorityMatrix } from '@/components/gap-priority-matrix'
import { getAllMissingGaps } from '@/lib/queries'

export function MyComponent() {
  const gaps = await getAllMissingGaps()
  
  return (
    <GapPriorityMatrix 
      gaps={gaps} 
      onGapSelect={(gap) => console.log(gap)}
    />
  )
}
```

### Using Missing File Card
```tsx
import { MissingFileCard } from '@/components/missing-file-card'

export function MyComponent({ gap, allGaps }) {
  return (
    <MissingFileCard 
      gap={gap}
      allGaps={allGaps}
      onMarkComplete={async (id) => {
        await fetch('/api/gaps/mark-complete', {
          method: 'POST',
          body: JSON.stringify({ gapId: id, blueprintId: gap.blueprint_id })
        })
      }}
    />
  )
}
```

### Using Template Card
```tsx
import { TemplateAssemblyCard } from '@/components/template-assembly-card'
import { getFeaturedTemplates } from '@/lib/queries'

export function MyComponent() {
  const templates = await getFeaturedTemplates()
  
  return (
    <div className="grid gap-4">
      {templates.map(t => (
        <TemplateAssemblyCard 
          key={t.id} 
          template={t}
          onSelect={(template) => console.log(template)}
        />
      ))}
    </div>
  )
}
```

## Database Queries

### Get All Gaps for a Blueprint
```typescript
import { getMissingGapsByBlueprint } from '@/lib/queries'

const gaps = await getMissingGapsByBlueprint(blueprintId)
```

### Get Gap Summary
```typescript
import { getGapSummary } from '@/lib/queries'

const summary = await getGapSummary()
// { total_gaps: 24, blocking_gaps: 3, total_hours: 45, completed_count: 5, by_category: {} }
```

### Mark Gap Complete
```typescript
import { markGapAsComplete } from '@/lib/queries'

await markGapAsComplete(gapId, blueprintId)
```

### Get Featured Templates
```typescript
import { getFeaturedTemplates } from '@/lib/queries'

const templates = await getFeaturedTemplates()
```

## Utilities Reference

### Priority Calculation
```typescript
import { 
  calculateImpactScore,
  calculateEffortScore,
  getPriority,
  gapsToMatrixPoints
} from '@/lib/gap-priorities'

const impact = calculateImpactScore(gap, allGaps)  // 0-100
const effort = calculateEffortScore(gap)            // 0-100
const priority = getPriority(impact, effort)        // 'critical' | 'high' | 'medium' | 'low'
const points = gapsToMatrixPoints(gaps)             // For visualization
```

### Gap Generation
```typescript
import { 
  generateGapsFromBlueprint,
  generateTemplatesFromBlueprints
} from '@/lib/gap-generation'

const gaps = await generateGapsFromBlueprint(blueprint)
const templates = await generateTemplatesFromBlueprints(blueprints)
```

## Common Tasks

### Display Gap Priority Matrix
```tsx
<GapPriorityMatrix gaps={gaps} />
```

### Show All Gaps for a Blueprint
```tsx
const gaps = await getMissingGapsByBlueprint(blueprintId)

<div className="grid gap-3">
  {gaps.map(gap => (
    <MissingFileCard key={gap.id} gap={gap} allGaps={gaps} />
  ))}
</div>
```

### Filter Gaps by Priority
```typescript
import { groupGapsByPriority } from '@/lib/gap-priorities'

const grouped = groupGapsByPriority(gaps)
// { critical: [...], high: [...], medium: [...], low: [...] }

grouped.critical.forEach(gap => console.log(gap.file_name))
```

### Get Recommended Build Order
```typescript
import { getSuggestedBuildOrder } from '@/lib/gap-priorities'

const { immediate, nextWave, deferrable } = getSuggestedBuildOrder(gaps)
// Build immediate first, then nextWave, then deferrable
```

### Create a Template
```typescript
const template = await createTemplate({
  name: 'Full-Stack Starter',
  description: 'Auth + API + Dashboard UI',
  blueprint_ids: ['uuid1', 'uuid2', 'uuid3'],
  tech_stack: ['Next.js', 'React', 'PostgreSQL'],
  estimated_hours: 12,
  reuse_percentage: 65,
  total_files: 45,
  missing_files: 16,
  tier: 'standard',
  featured: false,
})
```

## Troubleshooting

### No gaps showing up?
- Check database migration ran successfully
- Verify blueprints have `missing_files` array
- Call `generateGapsFromBlueprint()` to create gaps

### Templates not appearing?
- Ensure blueprints exist and have missing files
- Call `generateTemplatesFromBlueprints()` 
- Check that `featured` is set correctly

### Matrix not rendering?
- Verify Recharts is installed
- Check gaps have valid complexity/effort values
- Look for JavaScript errors in console

### Missing completion tracking?
- Ensure `completed_gaps` table exists
- Call `markGapAsComplete()` with correct IDs
- Check gap_id and blueprint_id are valid UUIDs

## Files & Locations

```
📁 Project Root
├── 📁 app/
│   ├── 📁 api/
│   │   ├── gaps/
│   │   │   ├── summary/route.ts
│   │   │   └── mark-complete/route.ts
│   │   └── templates/
│   │       └── generate/route.ts
│   └── 📁 dashboard/
│       ├── gaps/page.tsx
│       └── templates/page.tsx
├── 📁 components/
│   ├── missing-file-card.tsx
│   ├── gap-priority-matrix.tsx
│   ├── template-assembly-card.tsx
│   └── feature-education-banner.tsx
├── 📁 lib/
│   ├── gap-priorities.ts
│   ├── gap-generation.ts
│   └── queries.ts (enhanced)
├── 📁 migrations/
│   └── 002_gap_tracking_and_templates.sql
└── 📁 docs/
    ├── GAPS_AND_TEMPLATES_GUIDE.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── PRODUCTION_READINESS.md
    └── QUICK_START.md (this file)
```

## Support

See full documentation:
- **Feature Guide**: `/docs/GAPS_AND_TEMPLATES_GUIDE.md`
- **Implementation**: `/docs/IMPLEMENTATION_SUMMARY.md`
- **Production Checklist**: `/docs/PRODUCTION_READINESS.md`

**Ready to ship! 🚀**
