'use client'

import { useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/card'
import type { MissingFileGap } from '@/lib/queries'
import { gapsToMatrixPoints } from '@/lib/gap-priorities'

interface GapPriorityMatrixProps {
  gaps: MissingFileGap[]
  onGapSelect?: (gap: MissingFileGap) => void
}

const priorityColors = {
  critical: '#dc2626', // red-600
  high: '#ea580c',    // orange-600
  medium: '#2563eb',  // blue-600
  low: '#64748b',     // slate-500
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    return (
      <div className="bg-background border border-border rounded px-2 py-1.5 shadow-lg">
        <p className="text-xs font-semibold">{data.gap.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {Math.round(data.impact)} impact • {Math.round(data.effort)} effort
        </p>
      </div>
    )
  }
  return null
}

export function GapPriorityMatrix({ gaps, onGapSelect }: GapPriorityMatrixProps) {
  const data = useMemo(() => {
    return gapsToMatrixPoints(gaps).map(point => ({
      ...point,
      x: point.effort,
      y: point.impact,
    }))
  }, [gaps])

  const colors = data.map(d => priorityColors[d.priority])

  return (
    <Card className="w-full h-full min-h-96 p-4">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-sm">Impact vs Effort Matrix</h3>
          <p className="text-xs text-muted-foreground">
            Top-right (red) = quick wins. Bottom-right (orange) = bigger investment. Bottom-left (gray) = deferrable.
          </p>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            onClick={(state: any) => {
              if (state?.activeTooltipIndex !== undefined && onGapSelect) {
                onGapSelect(data[state.activeTooltipIndex].gap)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              type="number"
              dataKey="x"
              label={{ value: 'Effort (hours normalized)', position: 'bottom', offset: 10 }}
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              stroke="var(--color-foreground)"
            />
            <YAxis
              type="number"
              dataKey="y"
              label={{ value: 'Impact Score', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              stroke="var(--color-foreground)"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Quadrant backgrounds as visual guides */}
            <defs>
              <pattern
                id="quickWins"
                x="0"
                y="0"
                width="50%"
                height="50%"
                patternUnits="userSpaceOnUse"
                patternTransform="translate(50%, 50%)"
              >
                <rect width="50%" height="50%" fill="rgba(34, 197, 94, 0.05)" />
              </pattern>
              <pattern
                id="bigInvestment"
                x="0"
                y="0"
                width="50%"
                height="50%"
                patternUnits="userSpaceOnUse"
                patternTransform="translate(50%, 0%)"
              >
                <rect width="50%" height="50%" fill="rgba(234, 88, 12, 0.05)" />
              </pattern>
            </defs>

            <Scatter name="Gaps" data={data} isAnimationActive={false}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50">
          {Object.entries(priorityColors).map(([priority, color]) => (
            <div key={priority} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize">{priority}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
