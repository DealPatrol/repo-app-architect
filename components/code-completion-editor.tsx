'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, CheckCircle2, Code2, Zap } from 'lucide-react'

interface CompletionStep {
  text: string
  completed: boolean
}

interface SelectedSnippet {
  name: string
  path: string
  relevanceScore: number
  matchedPatterns: string[]
}

export function CodeCompletionEditor() {
  const [incompleteCode, setIncompleteCode] = useState('')
  const [completion, setCompletion] = useState<string | null>(null)
  const [selectedSnippets, setSelectedSnippets] = useState<SelectedSnippet[]>([])
  const [steps, setSteps] = useState<CompletionStep[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState('python')

  const handleGenerateCompletion = async () => {
    if (!incompleteCode.trim()) {
      setError('Please enter incomplete code')
      return
    }

    setLoading(true)
    setError(null)
    setSteps([])
    setCompletion(null)
    setSelectedSnippets([])

    try {
      // Simulate step progress
      const stepTexts = [
        'Analyzing incomplete code for semantic context...',
        'Retrieving similar functions from codebase...',
        'Scoring relevance and selecting best context...',
        'Generating code completion with LLM...',
      ]

      const tempSteps = stepTexts.map((text) => ({ text, completed: false }))
      setSteps(tempSteps)

      // Start completion request
      const response = await fetch('/api/code-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incompleteCode,
          language,
          codebaseSnippets: [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate completion')
      }

      const data = await response.json()

      // Animate steps completion
      data.steps.forEach((step: string, index: number) => {
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s, i) => (i <= index ? { ...s, completed: true } : s))
          )
        }, 300 * index)
      })

      setCompletion(data.completion)
      setSelectedSnippets(data.selectedSnippets)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('[v0] Completion error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Programming Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              disabled={loading}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Incomplete Code</label>
            <Textarea
              value={incompleteCode}
              onChange={(e) => setIncompleteCode(e.target.value)}
              placeholder="Paste your incomplete code here..."
              className="min-h-48 font-mono text-sm"
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleGenerateCompletion}
            disabled={loading || !incompleteCode.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Generating Completion...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Completion
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Process Steps */}
      {steps.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Processing Steps
          </h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : loading ? (
                    <Spinner className="h-5 w-5" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
                <p className={`text-sm ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-500/50 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {/* Selected Snippets */}
      {selectedSnippets.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Selected Context Snippets</h3>
          <div className="space-y-3">
            {selectedSnippets.map((snippet, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{snippet.name}</p>
                    <p className="text-xs text-muted-foreground">{snippet.path}</p>
                  </div>
                  <Badge variant="secondary">
                    {snippet.relevanceScore.toFixed(1)}% Match
                  </Badge>
                </div>
                {snippet.matchedPatterns.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {snippet.matchedPatterns.map((pattern, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Completion Result */}
      {completion && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Generated Completion
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(completion)}
            >
              Copy Code
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
            <code>{completion}</code>
          </pre>
        </Card>
      )}
    </div>
  )
}
