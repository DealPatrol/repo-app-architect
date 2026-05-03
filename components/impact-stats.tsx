'use client'

import { TrendingUp, Zap, Clock } from 'lucide-react'

const stats = [
  {
    value: '12,000+',
    label: 'Repos Analyzed',
    icon: TrendingUp,
    description: 'Real codebases scanned worldwide',
  },
  {
    value: '500+',
    label: 'Blueprints Discovered',
    icon: Zap,
    description: 'Potential apps identified',
  },
  {
    value: '10,000+',
    label: 'Hours Saved',
    icon: Clock,
    description: 'Developer time accelerated',
  },
]

export function ImpactStats() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-chart-1" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-lg font-semibold text-foreground mb-2">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
