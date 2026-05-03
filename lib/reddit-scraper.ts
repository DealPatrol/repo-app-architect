import { getDb } from './db'

const REDDIT_API_BASE = 'https://www.reddit.com/r'
const APP_KEYWORDS = {
  dashboard: ['dashboard', 'analytics', 'metrics', 'monitoring', 'stats'],
  'ecommerce-store': ['shopify', 'store', 'ecommerce', 'products', 'checkout', 'cart'],
  'task-management': ['task', 'todo', 'projects', 'kanban', 'productivity', 'planning'],
  'crm': ['crm', 'customer', 'sales', 'leads', 'contacts', 'pipeline'],
  'documentation': ['docs', 'documentation', 'wiki', 'knowledge base', 'faq'],
  'blog': ['blog', 'content management', 'cms', 'articles', 'publishing'],
  'chatbot': ['chat', 'chatbot', 'ai assistant', 'conversation', 'support'],
  'form-builder': ['form', 'survey', 'questionnaire', 'feedback', 'signup'],
  'payment-processor': ['payment', 'stripe', 'billing', 'subscription', 'checkout'],
  'notification-system': ['notification', 'alerts', 'email', 'sms', 'real-time'],
}

interface RedditPost {
  id: string
  subreddit: string
  title: string
  selftext: string
  score: number
  num_comments: number
  created_utc: number
}

/**
 * Scrape Reddit posts from popular subreddits
 */
export async function scrapeRedditPosts(): Promise<void> {
  const subreddits = ['webdev', 'SideProject', 'learnprogramming', 'entrepreneur', 'startups']

  for (const subreddit of subreddits) {
    try {
      console.log(`[v0] Scraping r/${subreddit}`)
      const posts = await fetchRedditPosts(subreddit)
      await storeRedditPosts(posts)
    } catch (error) {
      console.error(`[v0] Error scraping r/${subreddit}:`, error)
    }
  }

  // Analyze posts and update demand signals
  await analyzeAndUpdateDemandSignals()
}

/**
 * Fetch posts from a specific subreddit
 */
async function fetchRedditPosts(subreddit: string): Promise<RedditPost[]> {
  try {
    const response = await fetch(
      `${REDDIT_API_BASE}/${subreddit}/top.json?t=week&limit=100`,
      {
        headers: {
          'User-Agent': 'RepoFuse-Demand-Analyzer/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}`)
    }

    const data = await response.json()
    return data.data.children.map((child: any) => ({
      id: child.data.id,
      subreddit: child.data.subreddit,
      title: child.data.title,
      selftext: child.data.selftext,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
    }))
  } catch (error) {
    console.error(`[v0] Failed to fetch Reddit posts for r/${subreddit}:`, error)
    return []
  }
}

/**
 * Store Reddit posts in database
 */
async function storeRedditPosts(posts: RedditPost[]): Promise<void> {
  if (posts.length === 0) return

  const sql = getDb()

  for (const post of posts) {
    try {
      await sql`
        INSERT INTO reddit_posts (id, subreddit, title, content, score, comments, posted_at)
        VALUES (
          ${post.id},
          ${post.subreddit},
          ${post.title},
          ${post.selftext},
          ${post.score},
          ${post.num_comments},
          to_timestamp(${post.created_utc})
        )
        ON CONFLICT (subreddit, id) DO UPDATE
        SET score = EXCLUDED.score, comments = EXCLUDED.comments
      `
    } catch (error) {
      console.error(`[v0] Error storing post ${post.id}:`, error)
    }
  }
}

/**
 * Analyze stored Reddit posts and update demand signals
 */
export async function analyzeAndUpdateDemandSignals(): Promise<void> {
  const sql = getDb()

  // Get all recent Reddit posts
  const posts = await sql`
    SELECT * FROM reddit_posts 
    WHERE cached_at > NOW() - INTERVAL '7 days'
    ORDER BY score DESC
  `

  // Calculate demand scores for each app type
  const demandScores: Record<string, { score: number; keywords: Set<string>; painPoints: string[] }> = {}

  for (const post of posts) {
    const text = `${post.title} ${post.content}`.toLowerCase()

    for (const [appType, keywords] of Object.entries(APP_KEYWORDS)) {
      let matchCount = 0
      const matchedKeywords = new Set<string>()

      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          matchCount++
          matchedKeywords.add(keyword)
        }
      }

      if (matchCount > 0) {
        if (!demandScores[appType]) {
          demandScores[appType] = { score: 0, keywords: new Set(), painPoints: [] }
        }

        // Score: engagement * keyword match strength
        const engagement = Math.log(post.score + post.comments + 1)
        const matchStrength = matchCount / keywords.length
        demandScores[appType].score += engagement * matchStrength

        // Collect keywords and pain points
        matchedKeywords.forEach((k) => demandScores[appType].keywords.add(k))

        // Extract potential pain points (sentences with keywords)
        if (text.includes('need') || text.includes('want') || text.includes('problem') || text.includes('help')) {
          demandScores[appType].painPoints.push(post.title)
        }
      }
    }
  }

  // Normalize scores to 0-100 scale and update database
  const maxScore = Math.max(...Object.values(demandScores).map((d) => d.score), 1)

  for (const [appType, data] of Object.entries(demandScores)) {
    const normalizedScore = Math.round((data.score / maxScore) * 100)
    const keywords = Array.from(data.keywords)
    const painPoints = data.painPoints.slice(0, 5) // Top 5 pain points

    try {
      await sql`
        INSERT INTO app_demand_signals (app_type, demand_score, trending_keywords, pain_points, post_count, avg_engagement)
        VALUES (
          ${appType},
          ${normalizedScore},
          ${JSON.stringify(keywords)},
          ${JSON.stringify(painPoints)},
          ${Object.values(demandScores).length},
          ${Math.round(maxScore)}
        )
        ON CONFLICT (app_type) DO UPDATE
        SET 
          demand_score = EXCLUDED.demand_score,
          trending_keywords = EXCLUDED.trending_keywords,
          pain_points = EXCLUDED.pain_points,
          updated_at = CURRENT_TIMESTAMP
      `
    } catch (error) {
      console.error(`[v0] Error updating demand signal for ${appType}:`, error)
    }
  }

  console.log(`[v0] Updated demand signals for ${Object.keys(demandScores).length} app types`)
}

/**
 * Get demand signals for an app type
 */
export async function getDemandSignal(appType: string) {
  const sql = getDb()
  const result = await sql`
    SELECT * FROM app_demand_signals WHERE app_type = ${appType} LIMIT 1
  `
  return result[0] || null
}

/**
 * Get top in-demand apps
 */
export async function getTopInDemandApps(limit: number = 10) {
  const sql = getDb()
  const results = await sql`
    SELECT * FROM app_demand_signals 
    ORDER BY demand_score DESC 
    LIMIT ${limit}
  `
  return results
}
