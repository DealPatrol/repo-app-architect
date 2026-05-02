import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CodeCompletionEditor } from '@/components/code-completion-editor'
import { Code2, Brain, Zap, Target } from 'lucide-react'

export const metadata = {
  title: 'Code Completion | DealPatrol',
  description: 'AI-powered code completion with relevance-guided context selection',
}

export default function CodeCompletionPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">Intelligent Code Completion</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              AI-powered code completion using relevance-guided context selection. Our system analyzes your incomplete code, retrieves similar patterns from your codebase, and generates intelligent completions using advanced LLMs.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          {/* How it Works Cards */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-semibold">Semantic Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Our analyzer extracts method signatures, class context, and coding patterns from your incomplete code to understand intent.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-semibold">Relevance Ranking</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Retrieved code snippets are scored based on pattern matching, signature similarity, and reusability metrics to find the best matches.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-semibold">Intelligent Generation</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Selected context is passed to advanced LLMs with semantic information to generate accurate, contextually-aware code completions.
            </p>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Try It Out</h2>
            <p className="text-muted-foreground">
              Paste your incomplete code and watch as the system generates intelligent completions based on context selection.
            </p>
          </div>

          <CodeCompletionEditor />
        </div>

        {/* Workflow Visualization */}
        <div className="mt-12 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Workflow</h2>
            <p className="text-muted-foreground">
              The relevance-guided context selection pipeline
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {[
              {
                step: 1,
                title: 'Analyze',
                description: 'Extract semantic context (signatures, patterns, imports)',
              },
              {
                step: 2,
                title: 'Retrieve',
                description: 'Search codebase for similar functions and patterns',
              },
              {
                step: 3,
                title: 'Score',
                description: 'Rank snippets by relevance using multiple metrics',
              },
              {
                step: 4,
                title: 'Select',
                description: 'Choose top-matching snippets above threshold',
              },
              {
                step: 5,
                title: 'Generate',
                description: 'Use LLM with selected context for completion',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <Card className="p-4 h-full">
                  <div className="text-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold mx-auto mb-2">
                      {item.step}
                    </div>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
                {item.step < 5 && (
                  <div className="hidden md:flex absolute top-8 -right-2 translate-x-full items-center justify-center">
                    <div className="w-3 h-0.5 bg-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Key Features</h2>
            <p className="text-muted-foreground">
              Powerful capabilities for production code completion
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: 'Multi-Language Support',
                description: 'Python, JavaScript, TypeScript, Java, C++, Go, and more',
              },
              {
                title: 'Pattern Recognition',
                description: 'Detects coding patterns like async-await, error-handling, data-processing',
              },
              {
                title: 'Semantic Understanding',
                description: 'Analyzes method signatures, class context, and package information',
              },
              {
                title: 'Relevance Scoring',
                description: 'Multi-factor scoring based on patterns, signatures, and reusability',
              },
              {
                title: 'Batch Processing',
                description: 'Generate completions for multiple code snippets efficiently',
              },
              {
                title: 'Context Transparency',
                description: 'See which snippets were selected and their relevance scores',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-4">
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
