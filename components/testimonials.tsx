'use client'

import { Card } from '@/components/ui/card'

const testimonials = [
  {
    quote: 'RepoFuse discovered 3 hidden apps in our codebase. We shipped one in 2 weeks and it generated $50k in revenue.',
    author: 'Alex Chen',
    title: 'Founder & CTO',
    company: 'TechStartup Inc',
  },
  {
    quote: 'Instead of starting from scratch, RepoFuse helped us assemble products from existing code. Saved us 6 months of development time.',
    author: 'Sarah Johnson',
    title: 'Product Lead',
    company: 'Global Tech',
  },
  {
    quote: 'The Reddit demand insights showed us exactly what users were asking for. We built exactly what the market needed.',
    author: 'Marcus Rodriguez',
    title: 'Indie Developer',
    company: 'Solo Founder',
  },
  {
    quote: 'Reduced our AI costs by 60% using the BYOK plan. Quality stayed the same, profit went way up.',
    author: 'Emily Watson',
    title: 'Engineering Manager',
    company: 'Scale.io',
  },
]

export function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Developers ship faster with RepoFuse
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of builders discovering, assembling, and shipping apps from their existing code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card
              key={idx}
              className="p-8 bg-card hover:shadow-lg hover:shadow-black/5 transition-all duration-300 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-chart-1">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-foreground mb-6 flex-grow leading-relaxed">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.title} at {testimonial.company}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
