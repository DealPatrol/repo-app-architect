import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, Lock, Eye, Server, Trash2, Terminal, 
  CheckCircle2, XCircle, ArrowRight, Download,
  Database, Cpu, Cloud, HardDrive
} from 'lucide-react'

export const metadata = {
  title: 'How We Handle Your Data | RepoFuse',
  description: 'Ultra-transparent breakdown of how RepoFuse handles your code and data. Plain English explanations with security protocols.',
}

export default function DataHandlingPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero */}
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
          <Shield className="h-3 w-3 mr-1" />
          Security First
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          How We Handle{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
            Your Data
          </span>
        </h1>
        <p className="text-lg text-cyan-200/60 max-w-2xl mx-auto">
          No corporate double-speak. Here&apos;s exactly what happens to your code, 
          explained in plain English with the legal version side-by-side.
        </p>
      </div>

      {/* Security Badges */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-cyan-400" />
          Security Protocols We Use
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { 
              icon: Lock, 
              title: 'AES-256 Encryption', 
              desc: 'Data encrypted at rest',
              status: 'active'
            },
            { 
              icon: Shield, 
              title: 'TLS 1.3', 
              desc: 'Data encrypted in transit',
              status: 'active'
            },
            { 
              icon: Cpu, 
              title: 'In-Memory Analysis', 
              desc: 'Code processed in RAM only',
              status: 'active'
            },
            { 
              icon: Trash2, 
              title: 'Auto-Purge', 
              desc: 'Data deleted after analysis',
              status: 'active'
            },
            { 
              icon: Eye, 
              title: 'Read-Only Access', 
              desc: 'Cannot modify your repos',
              status: 'active'
            },
            { 
              icon: Server, 
              title: 'US-Based Servers', 
              desc: 'Hosted on Vercel Edge',
              status: 'active'
            },
            { 
              icon: Database, 
              title: 'SOC 2 Type II', 
              desc: 'Compliance in progress',
              status: 'pending'
            },
            { 
              icon: HardDrive, 
              title: 'No Code Storage', 
              desc: 'Only metadata retained',
              status: 'active'
            },
          ].map((badge, i) => (
            <Card 
              key={i} 
              className={`bg-black/60 backdrop-blur-sm transition-all ${
                badge.status === 'active' 
                  ? 'border-cyan-500/30 hover:border-cyan-400/50' 
                  : 'border-yellow-500/30 hover:border-yellow-400/50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    badge.status === 'active' ? 'bg-cyan-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <badge.icon className={`h-5 w-5 ${
                      badge.status === 'active' ? 'text-cyan-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{badge.title}</p>
                    <p className="text-xs text-cyan-200/60">{badge.desc}</p>
                    {badge.status === 'pending' && (
                      <Badge variant="outline" className="mt-1 text-xs border-yellow-500/50 text-yellow-400">
                        In Progress
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Plain English vs Legal Table */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Eye className="h-5 w-5 text-cyan-400" />
          Plain English vs. Legal Speak
        </h2>
        <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/30">
                  <th className="text-left p-4 font-mono text-xs text-cyan-400 uppercase tracking-widest">Topic</th>
                  <th className="text-left p-4 font-mono text-xs text-cyan-400 uppercase tracking-widest bg-cyan-950/30">Plain English</th>
                  <th className="text-left p-4 font-mono text-xs text-cyan-400/60 uppercase tracking-widest">Legal Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/20">
                {[
                  {
                    topic: 'Code Access',
                    plain: "We can only READ your code. We literally cannot change, delete, or commit anything.",
                    legal: "RepoFuse requests read-only OAuth scopes (repo:read) and does not request write, delete, or administrative permissions."
                  },
                  {
                    topic: 'Code Storage',
                    plain: "Your actual code is NEVER saved to our servers. We analyze it in memory and throw it away.",
                    legal: "Source code is processed ephemerally in volatile memory. No persistent storage of source code occurs. Only derived metadata is retained."
                  },
                  {
                    topic: 'What We Keep',
                    plain: "We save things like 'this repo has 50 files and uses React' - not your actual code.",
                    legal: "Retained data includes: repository names, file counts, language statistics, framework detection results, and AI-generated analysis summaries."
                  },
                  {
                    topic: 'AI Processing',
                    plain: "Our AI reads your code structure to suggest ideas. It never trains on your code or shares it.",
                    legal: "AI analysis is performed in isolated, stateless inference sessions. User code is not used for model training or shared with third parties."
                  },
                  {
                    topic: 'Data Deletion',
                    plain: "Delete your account = we delete everything. No 'we keep backups for 90 days' nonsense.",
                    legal: "Upon account deletion, all user data including metadata is permanently purged within 24 hours. No archival copies are retained."
                  },
                  {
                    topic: 'Third Parties',
                    plain: "We don't sell, share, or give your data to anyone. Period.",
                    legal: "User data is not shared with, sold to, or disclosed to third parties except as required by law with user notification where legally permitted."
                  },
                  {
                    topic: 'Encryption',
                    plain: "Everything is encrypted - when it's moving AND when it's sitting still.",
                    legal: "All data in transit is protected via TLS 1.3. Data at rest is encrypted using AES-256 encryption standards."
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-white">{row.topic}</span>
                    </td>
                    <td className="p-4 bg-cyan-950/20">
                      <span className="text-cyan-100">{row.plain}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-cyan-200/60 text-sm">{row.legal}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Local Analysis Option */}
      <section className="mb-16">
        <Card className="bg-gradient-to-br from-orange-950/40 via-black to-cyan-950/20 border-orange-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Terminal className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <Badge className="mb-1 bg-orange-500/20 text-orange-300 border-orange-500/30">
                  Coming Soon
                </Badge>
                <CardTitle className="text-2xl text-white">Local Analysis Mode</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-cyan-200/80">
              For maximum privacy, run RepoFuse analysis entirely on your machine. 
              Your code never leaves your computer - we just receive the results.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  How It Works
                </h3>
                <ul className="space-y-2 text-sm text-cyan-200/60">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono">1.</span>
                    Install our open-source CLI tool
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono">2.</span>
                    Run analysis locally on your machine
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono">3.</span>
                    Only metadata + results are sent to RepoFuse
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono">4.</span>
                    View ideas in your dashboard (code-free)
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  Perfect For
                </h3>
                <ul className="space-y-2 text-sm text-cyan-200/60">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Enterprise teams with strict compliance
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Air-gapped or restricted networks
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Developers who want zero cloud exposure
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Proprietary/classified codebases
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-orange-500/20">
              <p className="text-xs font-mono text-orange-400 mb-2"># Coming Soon - Join the waitlist</p>
              <code className="text-sm text-cyan-300 font-mono">
                npx repofuse-cli analyze ./my-project
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-orange-500 hover:bg-orange-400 text-black font-bold">
                <Download className="h-4 w-4 mr-2" />
                Join CLI Waitlist
              </Button>
              <Button variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/30">
                View on GitHub (Soon)
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Data Flow Diagram */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Cloud className="h-5 w-5 text-cyan-400" />
          Data Flow: What Actually Happens
        </h2>
        <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {[
              { icon: Database, label: 'Your Repo', desc: 'GitHub/GitLab', color: 'cyan' },
              { icon: Eye, label: 'Read Only', desc: 'OAuth fetch', color: 'cyan' },
              { icon: Cpu, label: 'In-Memory', desc: 'AI analysis', color: 'orange' },
              { icon: Trash2, label: 'Code Deleted', desc: 'Immediately', color: 'red' },
              { icon: HardDrive, label: 'Metadata Only', desc: 'Stored securely', color: 'cyan' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`p-3 rounded-xl mb-2 ${
                    step.color === 'cyan' ? 'bg-cyan-500/20 border border-cyan-500/30' :
                    step.color === 'orange' ? 'bg-orange-500/20 border border-orange-500/30' :
                    'bg-red-500/20 border border-red-500/30'
                  }`}>
                    <step.icon className={`h-6 w-6 ${
                      step.color === 'cyan' ? 'text-cyan-400' :
                      step.color === 'orange' ? 'text-orange-400' :
                      'text-red-400'
                    }`} />
                  </div>
                  <p className="font-bold text-white text-sm">{step.label}</p>
                  <p className="text-xs text-cyan-200/60">{step.desc}</p>
                </div>
                {i < 4 && (
                  <ArrowRight className="h-5 w-5 text-cyan-500/40 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* What We Don't Do */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-400" />
          What We Will NEVER Do
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Store your actual source code',
            'Train AI models on your code',
            'Share data with third parties',
            'Sell your information',
            'Access private repos without permission',
            'Make changes to your repositories',
            'Keep data after you delete your account',
            'Use your code for any purpose beyond analysis',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-red-950/20 border border-red-500/20">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span className="text-cyan-100">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Card className="bg-gradient-to-r from-cyan-950/40 via-black to-cyan-950/40 border-cyan-500/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Still Have Questions?</h2>
          <p className="text-cyan-200/60 mb-6">
            We&apos;re developers too. We get it. Reach out anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
              Contact Security Team
            </Button>
            <Button variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/30" asChild>
              <Link href="/">
                Back to Home
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </main>
  )
}
