'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  FaBook,
  FaPen,
  FaEdit,
  FaStar,
  FaShoppingCart,
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaBookOpen,
  FaCross,
  FaFeatherAlt,
  FaRegLightbulb,
  FaUsers,
  FaFileAlt,
  FaQuoteLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRegCopy,
  FaTags,
  FaListOl,
  FaRegBookmark,
  FaArrowRight,
  FaCircle,
  FaCheck,
  FaDownload,
  FaHistory,
  FaClock,
  FaChartBar,
} from 'react-icons/fa'
import { FiLoader, FiInfo, FiAlertCircle } from 'react-icons/fi'
import { HiOutlineDocumentText } from 'react-icons/hi'

// =====================================================================
// AGENT IDS
// =====================================================================
const AGENT_IDS = {
  BOOK_OUTLINE: '699dc06311babb6bd9bda5c9',
  CHAPTER_WRITER: '699dc063c546a47313680796',
  MANUSCRIPT_EDITOR: '699dc0642324bf32f83b5d61',
  SCRIPTURE_ASSISTANT: '699dc064d6de05974a3c6c6f',
}

const AGENTS_INFO = [
  { id: AGENT_IDS.BOOK_OUTLINE, name: 'Book Outline Generator', purpose: 'Creates comprehensive book outlines from prompts' },
  { id: AGENT_IDS.CHAPTER_WRITER, name: 'AI Chapter Writer', purpose: 'Drafts full book chapters in your style' },
  { id: AGENT_IDS.MANUSCRIPT_EDITOR, name: 'Manuscript Editor', purpose: 'Edits and polishes manuscript text' },
  { id: AGENT_IDS.SCRIPTURE_ASSISTANT, name: 'Scripture Assistant', purpose: 'Finds and contextualizes Bible references' },
]

// =====================================================================
// TYPES
// =====================================================================
interface OutlineResponse {
  book_title?: string
  subtitle?: string
  target_audience?: string
  synopsis?: string
  estimated_pages?: string
  themes?: string
  chapters?: string
}

interface ChapterResponse {
  chapter_title?: string
  chapter_number?: string
  word_count?: string
  chapter_content?: string
  style_notes?: string
}

interface EditorResponse {
  edited_text?: string
  changes_summary?: string
  quality_before?: string
  quality_after?: string
  editorial_notes?: string
  pacing_feedback?: string
}

interface ScriptureResponse {
  primary_verse?: string
  verse_text?: string
  translation?: string
  context_explanation?: string
  related_verses?: string
  integration_suggestion?: string
  devotional_application?: string
}

interface SampleBook {
  id: number
  title: string
  author: string
  genre: string
  price: number
  rating: number
  pages: number
  publishDate: string
  description: string
  gradientFrom: string
  gradientTo: string
}

interface SessionItem {
  id: string
  type: 'outline' | 'chapter' | 'edit' | 'scripture'
  title: string
  preview: string
  timestamp: Date
  data: any
}

interface PrefillChapter {
  title: string
  number: string
  summary: string
}

interface WritingStats {
  wordsGenerated: number
  outlinesCreated: number
  chaptersWritten: number
  editsPerformed: number
}

// =====================================================================
// GENRE OPTIONS
// =====================================================================
const GENRES = [
  'Fiction', 'Non-Fiction', 'Fantasy', 'Sci-Fi', 'Romance',
  'Thriller', 'Mystery', 'Self-Help', 'Business',
  'Faith/Spiritual', 'Biography', "Children's"
]

const TRANSLATIONS = ['KJV', 'NIV', 'ESV', 'NASB', 'NLT']

// =====================================================================
// SAMPLE DATA
// =====================================================================
const SAMPLE_BOOKS: SampleBook[] = [
  { id: 1, title: 'The Silent Path', author: 'Maria Gonzales', genre: 'Fiction', price: 14.99, rating: 4.5, pages: 342, publishDate: '2025-03-15', description: 'A haunting tale of self-discovery through the quiet landscapes of rural Japan.', gradientFrom: 'from-indigo-600', gradientTo: 'to-purple-700' },
  { id: 2, title: 'Beyond the Stars', author: 'James Chen', genre: 'Sci-Fi', price: 12.99, rating: 4.8, pages: 418, publishDate: '2025-01-22', description: 'Humanity\'s first contact with an alien civilization challenges everything we know about the universe.', gradientFrom: 'from-blue-600', gradientTo: 'to-cyan-600' },
  { id: 3, title: 'Walking in Faith', author: 'Sarah Williams', genre: 'Faith/Spiritual', price: 16.99, rating: 4.9, pages: 256, publishDate: '2024-11-08', description: 'A deeply personal exploration of finding purpose through spiritual practice and community.', gradientFrom: 'from-amber-500', gradientTo: 'to-orange-600' },
  { id: 4, title: 'Mind Over Matter', author: 'Dr. Robert Kim', genre: 'Self-Help', price: 19.99, rating: 4.3, pages: 298, publishDate: '2025-02-14', description: 'Evidence-based strategies for building mental resilience and achieving peak performance.', gradientFrom: 'from-emerald-500', gradientTo: 'to-teal-600' },
  { id: 5, title: 'The Last Relic', author: 'T.K. Harrison', genre: 'Fantasy', price: 11.99, rating: 4.7, pages: 512, publishDate: '2024-09-30', description: 'An epic quest across three kingdoms to recover an ancient artifact before darkness falls.', gradientFrom: 'from-rose-500', gradientTo: 'to-pink-600' },
  { id: 6, title: 'Crimson Midnight', author: 'Olivia Drake', genre: 'Thriller', price: 13.99, rating: 4.4, pages: 380, publishDate: '2025-04-01', description: 'A forensic psychologist races against time to stop a killer who strikes at exactly midnight.', gradientFrom: 'from-red-600', gradientTo: 'to-rose-700' },
]

const SAMPLE_OUTLINE: OutlineResponse = {
  book_title: 'Echoes of Tomorrow',
  subtitle: 'A Journey Through Time and Memory',
  target_audience: 'Young adults and adult readers who enjoy literary fiction with elements of magical realism and philosophical exploration',
  synopsis: 'In a world where memories can be shared like currency, a young archivist discovers she can hear the echoes of futures yet to come. As she navigates a society built on the trade of experiences, she must decide whether to reveal her gift -- risking everything -- or stay silent as a catastrophic event looms on the horizon. Echoes of Tomorrow weaves together themes of identity, connection, and the price of knowledge in a richly imagined near-future setting.',
  estimated_pages: '320',
  themes: 'Memory and Identity, The Ethics of Knowledge, Human Connection in a Digital Age, Free Will vs. Determinism, The Cost of Truth',
  chapters: 'Chapter 1: The Memory Market - Introducing the world of memory trading and our protagonist Lena\nChapter 2: First Echo - Lena discovers her ability to hear future echoes\nChapter 3: The Archive - Deep dive into Lena\'s work and the history of memory science\nChapter 4: Whispers of Warning - The first signs of the approaching catastrophe\nChapter 5: The Collector - Introduction of the antagonist who hoards rare memories\nChapter 6: Unraveling - Lena begins to understand the scope of her power\nChapter 7: Allies and Shadows - Building a trusted circle while evading detection\nChapter 8: The Price of Seeing - Personal costs of Lena\'s gift\nChapter 9: Convergence - All threads begin to come together\nChapter 10: Echoes Fulfilled - The climactic confrontation and resolution',
}

const SAMPLE_CHAPTER: ChapterResponse = {
  chapter_title: 'The Memory Market',
  chapter_number: '1',
  word_count: '3,450',
  chapter_content: 'The morning light filtered through the crystalline walls of the Memory Exchange, casting prismatic shadows across the trading floor. Lena adjusted her archival gloves -- thin, translucent things that hummed faintly against her skin -- and surveyed the day\'s offerings.\n\nRows upon rows of memory capsules lined the display cases, each one glowing with a soft, inner light that spoke to the richness of the experience contained within. A childhood summer in Provence. The first breath of a newborn. The exhilaration of a mountain summit. Each memory, extracted, refined, and sealed for sale.\n\n"You\'re early again," noted Marcus, her supervisor, appearing from behind a column of archived memories dating back to the previous century. His salt-and-pepper beard was neatly trimmed, but his eyes carried the weight of a man who had seen too many memories that weren\'t his own.\n\n"The Erikson collection arrives today," Lena replied, unable to keep the anticipation from her voice. "Three generations of unprocessed memories. Do you know how rare that is?"\n\nMarcus smiled, but it didn\'t reach his eyes. "Rare enough to attract attention we don\'t want. Be careful with this one, Lena."\n\nShe nodded, already moving toward the intake chamber. In this world, memories were more than nostalgia -- they were power, currency, identity itself. And Lena was about to discover that some memories held secrets that could reshape everything.',
  style_notes: 'Written in third-person limited perspective, following Lena. The prose style balances literary description with accessible pacing. World-building is woven naturally into the narrative through character interactions and environmental details rather than exposition dumps.',
}

const SAMPLE_EDITOR: EditorResponse = {
  edited_text: 'The morning light filtered through the crystalline walls of the Memory Exchange, casting prismatic shadows across the trading floor. Lena adjusted her archival gloves -- thin, translucent things that hummed softly against her skin -- and surveyed the day\'s offerings with practiced precision.\n\nRows upon rows of memory capsules lined the display cases, each glowing with a warm, inner luminescence that hinted at the richness of the experience sealed within.',
  changes_summary: '- Replaced "faintly" with "softly" for better auditory imagery\n- Added "with practiced precision" to strengthen character competence\n- Changed "spoke to" to "hinted at" for subtler foreshadowing\n- Replaced "light" with "luminescence" to avoid repetition with the opening sentence\n- Minor punctuation adjustments for improved flow',
  quality_before: '7',
  quality_after: '9',
  editorial_notes: 'The prose is strong with vivid sensory details. The world-building through environment is effective. Consider varying sentence length more in the opening paragraph -- three consecutive complex sentences could benefit from a short, punchy sentence to create rhythm. The dialogue is natural and efficient at conveying character dynamics.',
  pacing_feedback: 'The pacing is well-balanced for an opening chapter. The transition from scene-setting to character interaction occurs at the right moment. The hint of mystery at the end ("attract attention we don\'t want") provides excellent forward momentum. Consider adding a brief moment of sensory pause between the dialogue exchanges to prevent the mid-section from feeling rushed.',
}

const SAMPLE_SCRIPTURE: ScriptureResponse = {
  primary_verse: 'Jeremiah 29:11',
  verse_text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.',
  translation: 'NIV',
  context_explanation: 'This verse comes from a letter the prophet Jeremiah sent to the Jewish exiles in Babylon. God was speaking through Jeremiah to assure the people that despite their current suffering and displacement, He had not abandoned them. The "plans" referenced are part of God\'s sovereign design that extends beyond immediate circumstances. In its full context (verses 10-14), God promises restoration after a period of seventy years, encouraging the exiles to settle, build, and seek the welfare of the city where they live.',
  related_verses: 'Romans 8:28 - "And we know that in all things God works for the good of those who love him"\nProverbs 3:5-6 - "Trust in the LORD with all your heart and lean not on your own understanding"\nIsaiah 55:8-9 - "For my thoughts are not your thoughts, neither are your ways my ways"\nPsalm 37:4 - "Take delight in the LORD, and he will give you the desires of your heart"\nPhilippians 1:6 - "He who began a good work in you will carry it on to completion"',
  integration_suggestion: 'This verse works beautifully as a thematic anchor for characters facing uncertainty or transition. Consider having a mentor character share this verse during a pivotal moment when the protagonist feels lost. It can serve as a turning point -- the character beginning to trust a larger plan even when the path forward is unclear. Avoid using it as a simple comfort quote; instead, explore the tension between trusting divine plans and the human desire for control.',
  devotional_application: 'In our own writing journeys, this verse reminds us that the creative process itself is part of a larger plan. When facing writer\'s block, rejection, or uncertainty about our work\'s purpose, we can find reassurance that our stories -- like our lives -- are being woven into something meaningful. Reflect on how your writing might be the very "hope and future" God is using to reach someone who needs your story.',
}

// =====================================================================
// HELPERS
// =====================================================================
function safeParseField(value: string | undefined | null): any {
  if (!value) return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function parseQualityScore(value: string | undefined | null): number {
  if (!value) return 0
  const num = parseFloat(value.replace(/[^0-9.]/g, ''))
  return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 10)
}

function parseThemes(themesStr: string | undefined | null): string[] {
  if (!themesStr) return []
  const parsed = safeParseField(themesStr)
  if (Array.isArray(parsed)) return parsed.map(String)
  if (typeof parsed === 'string') {
    return parsed.split(/,|\n/).map((t: string) => t.trim()).filter(Boolean)
  }
  return []
}

function parseChapters(chaptersStr: string | undefined | null): { title: string; description: string }[] {
  if (!chaptersStr) return []
  const parsed = safeParseField(chaptersStr)
  if (Array.isArray(parsed)) {
    return parsed.map((c: any) => ({
      title: c?.title ?? c?.chapter_title ?? String(c),
      description: c?.summary ?? c?.description ?? '',
    }))
  }
  if (typeof parsed === 'string') {
    return parsed.split('\n').filter(Boolean).map((line: string) => {
      const dashIdx = line.indexOf(' - ')
      if (dashIdx > -1) {
        return { title: line.slice(0, dashIdx).trim(), description: line.slice(dashIdx + 3).trim() }
      }
      return { title: line.trim(), description: '' }
    })
  }
  return []
}

function parseRelatedVerses(versesStr: string | undefined | null): { reference: string; text: string }[] {
  if (!versesStr) return []
  const parsed = safeParseField(versesStr)
  if (Array.isArray(parsed)) {
    return parsed.map((v: any) => ({
      reference: v?.reference ?? String(v),
      text: v?.text ?? '',
    }))
  }
  if (typeof parsed === 'string') {
    return parsed.split('\n').filter(Boolean).map((line: string) => {
      const dashIdx = line.indexOf(' - ')
      if (dashIdx > -1) {
        return { reference: line.slice(0, dashIdx).trim(), text: line.slice(dashIdx + 3).trim() }
      }
      return { reference: line.trim(), text: '' }
    })
  }
  return []
}

// =====================================================================
// DOWNLOAD HELPER
// =====================================================================
function downloadAsText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// =====================================================================
// TIME AGO HELPER
// =====================================================================
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// =====================================================================
// WORD COUNT HELPER
// =====================================================================
function countWords(text: string | undefined | null): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

// =====================================================================
// MARKDOWN RENDERER
// =====================================================================
function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

// =====================================================================
// ERROR BOUNDARY
// =====================================================================
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Something went wrong</h2>
            <p className="text-gray-500 mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// =====================================================================
// COPY BUTTON COMPONENT
// =====================================================================
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
      document.body.removeChild(textarea)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-8 text-xs gap-1.5 border-gray-200 hover:bg-gray-50"
    >
      {copied ? (
        <>
          <FaCheck className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <FaRegCopy className="h-3 w-3" />
          {label ?? 'Copy'}
        </>
      )}
    </Button>
  )
}

// =====================================================================
// STAR RATING COMPONENT
// =====================================================================
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.3
  const stars: React.ReactNode[] = []
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="h-3.5 w-3.5 text-amber-400" />)
    } else if (i === fullStars && hasHalf) {
      stars.push(<FaStar key={i} className="h-3.5 w-3.5 text-amber-300" />)
    } else {
      stars.push(<FaStar key={i} className="h-3.5 w-3.5 text-gray-300" />)
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>
}

// =====================================================================
// LOADING SPINNER COMPONENT
// =====================================================================
function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <FiLoader className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-gray-400 text-sm mt-1">This may take a moment...</p>
    </div>
  )
}

// =====================================================================
// INLINE STATUS MESSAGE
// =====================================================================
function StatusMessage({ type, message }: { type: 'success' | 'error' | 'info'; message: string }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  const icons = {
    success: <FaCheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />,
    error: <FaExclamationTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />,
    info: <FiInfo className="h-4 w-4 text-blue-600 flex-shrink-0" />,
  }
  return (
    <div className={cn('flex items-start gap-2 p-3 rounded-lg border text-sm', styles[type])}>
      {icons[type]}
      <span>{message}</span>
    </div>
  )
}

// =====================================================================
// FEATURE HIGHLIGHTS SECTION
// =====================================================================
function FeatureHighlights() {
  const features = [
    {
      icon: <FaRegLightbulb className="h-6 w-6 text-indigo-600" />,
      bgColor: 'bg-indigo-100',
      title: 'Generate Outlines',
      description: 'Turn a single idea into a full book outline with chapters, themes, and audience analysis.',
    },
    {
      icon: <FaFeatherAlt className="h-6 w-6 text-purple-600" />,
      bgColor: 'bg-purple-100',
      title: 'Write Chapters',
      description: 'AI co-author drafts publication-ready chapters that match your unique writing style.',
    },
    {
      icon: <FaEdit className="h-6 w-6 text-amber-600" />,
      bgColor: 'bg-amber-100',
      title: 'Edit & Polish',
      description: 'Professional manuscript editing with quality scoring, grammar fixes, and pacing feedback.',
    },
    {
      icon: <FaCross className="h-6 w-6 text-emerald-600" />,
      bgColor: 'bg-emerald-100',
      title: 'Scripture Integration',
      description: 'Find, verify, and integrate Bible references with theological context and devotional insights.',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature, i) => (
        <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 group">
          <CardContent className="pt-6 pb-5 text-center">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110', feature.bgColor)}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1.5">{feature.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// =====================================================================
// WRITING STATS BAR
// =====================================================================
function WritingStatsBar({ stats }: { stats: WritingStats }) {
  const items = [
    { icon: <HiOutlineDocumentText className="h-4 w-4 text-indigo-600" />, count: stats.wordsGenerated.toLocaleString(), label: 'Words Generated' },
    { icon: <FaBook className="h-3.5 w-3.5 text-purple-600" />, count: stats.outlinesCreated, label: 'Outlines' },
    { icon: <FaFeatherAlt className="h-3.5 w-3.5 text-amber-600" />, count: stats.chaptersWritten, label: 'Chapters' },
    { icon: <FaEdit className="h-3.5 w-3.5 text-emerald-600" />, count: stats.editsPerformed, label: 'Edits' },
  ]

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2 mb-2">
          <FaChartBar className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session Progress</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-sm font-bold text-gray-900">{item.count}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================================
// SESSION HISTORY PANEL
// =====================================================================
function SessionHistoryPanel({
  sessionHistory,
  onSelectItem,
}: {
  sessionHistory: SessionItem[]
  onSelectItem: (item: SessionItem) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const displayItems = sessionHistory.slice(0, 10)

  const typeIcons: Record<string, React.ReactNode> = {
    outline: <FaBook className="h-3 w-3 text-indigo-600" />,
    chapter: <FaFeatherAlt className="h-3 w-3 text-purple-600" />,
    edit: <FaEdit className="h-3 w-3 text-amber-600" />,
    scripture: <FaCross className="h-3 w-3 text-emerald-600" />,
  }

  const typeLabels: Record<string, string> = {
    outline: 'Outline',
    chapter: 'Chapter',
    edit: 'Edit',
    scripture: 'Scripture',
  }

  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  if (displayItems.length === 0) return null

  return (
    <Card className="border-0 shadow-md mt-4">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
            <FaHistory className="h-3.5 w-3.5 text-gray-500" />
            Session History
            <Badge variant="secondary" className="ml-1 h-5 text-xs">{displayItems.length}</Badge>
          </CardTitle>
          {expanded ? <FaChevronDown className="h-3 w-3 text-gray-400" /> : <FaChevronRight className="h-3 w-3 text-gray-400" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-1.5">
              {displayItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="mt-0.5 flex-shrink-0">{typeIcons[item.type] ?? <FaCircle className="h-3 w-3 text-gray-400" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                      <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                        <FaClock className="h-2.5 w-2.5" />
                        {now ? timeAgo(item.timestamp) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{item.preview}</p>
                    <Badge variant="outline" className="mt-1 text-xs h-4 px-1.5">{typeLabels[item.type] ?? item.type}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}

// =====================================================================
// BOOK OUTLINE TAB
// =====================================================================
function BookOutlineTab({
  showSample,
  activeAgentId,
  setActiveAgentId,
  onChapterSelect,
  onSessionAdd,
  onStatsUpdate,
  outlineResult,
  setOutlineResult,
}: {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
  onChapterSelect: (chapter: PrefillChapter) => void
  onSessionAdd: (item: SessionItem) => void
  onStatsUpdate: (type: 'outline', wordCount: number) => void
  outlineResult: OutlineResponse | null
  setOutlineResult: (r: OutlineResponse | null) => void
}) {
  const [formData, setFormData] = useState({ prompt: '', genre: '', audience: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set())

  const displayData = showSample ? SAMPLE_OUTLINE : outlineResult

  const handleGenerate = useCallback(async () => {
    if (!formData.prompt.trim()) {
      setError('Please enter a book idea or prompt.')
      return
    }
    setLoading(true)
    setError(null)
    setOutlineResult(null)
    setActiveAgentId(AGENT_IDS.BOOK_OUTLINE)
    try {
      const message = `Generate a book outline for: ${formData.prompt}${formData.genre ? `. Genre: ${formData.genre}` : ''}${formData.audience ? `. Target audience: ${formData.audience}` : ''}`
      const res = await callAIAgent(message, AGENT_IDS.BOOK_OUTLINE)
      if (res.success && res?.response?.result) {
        const data = res.response.result as OutlineResponse
        setOutlineResult(data)
        const wordCount = countWords(data.synopsis) + countWords(data.chapters) + countWords(data.themes)
        onStatsUpdate('outline', wordCount)
        onSessionAdd({
          id: Date.now().toString(),
          type: 'outline',
          title: data.book_title ?? 'Untitled Outline',
          preview: (data.synopsis ?? '').slice(0, 80) + '...',
          timestamp: new Date(),
          data,
        })
      } else {
        setError(res?.error ?? res?.response?.message ?? 'Failed to generate outline. Please try again.')
      }
    } catch (e: any) {
      setError(e?.message ?? 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [formData, setActiveAgentId, onSessionAdd, onStatsUpdate, setOutlineResult])

  const toggleChapter = (idx: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const themes = displayData ? parseThemes(displayData.themes) : []
  const chapters = displayData ? parseChapters(displayData.chapters) : []

  // Build full outline text for copy/download
  const buildOutlineText = (): string => {
    if (!displayData) return ''
    let text = `${displayData.book_title ?? 'Untitled'}\n`
    if (displayData.subtitle) text += `${displayData.subtitle}\n`
    text += '\n'
    if (displayData.target_audience) text += `Target Audience: ${displayData.target_audience}\n\n`
    if (displayData.estimated_pages) text += `Estimated Pages: ${displayData.estimated_pages}\n\n`
    if (displayData.synopsis) text += `Synopsis:\n${displayData.synopsis}\n\n`
    if (themes.length > 0) text += `Themes:\n${themes.map(t => `- ${t}`).join('\n')}\n\n`
    if (chapters.length > 0) text += `Chapters:\n${chapters.map((ch, i) => `${i + 1}. ${ch.title}${ch.description ? ' - ' + ch.description : ''}`).join('\n')}\n`
    return text
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FaBook className="h-5 w-5 text-indigo-600" />
            Generate Book Outline
          </CardTitle>
          <CardDescription>Describe your book idea and we will create a comprehensive outline with chapters, themes, and more.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="outline-prompt" className="text-gray-700">Book Idea / Prompt *</Label>
            <Textarea
              id="outline-prompt"
              placeholder="e.g., A coming-of-age story set in a world where memories can be traded as currency..."
              value={showSample ? 'A coming-of-age story set in a near-future world where memories can be shared and traded as currency, exploring themes of identity and human connection' : formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              rows={4}
              className="mt-1.5"
              disabled={showSample}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700">Genre</Label>
              <Select
                value={showSample ? 'Fiction' : formData.genre}
                onValueChange={(val) => setFormData(prev => ({ ...prev, genre: val }))}
                disabled={showSample}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="outline-audience" className="text-gray-700">Target Audience</Label>
              <Input
                id="outline-audience"
                placeholder="e.g., Young adults, ages 18-35"
                value={showSample ? 'Young adults and literary fiction readers' : formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                className="mt-1.5"
                disabled={showSample}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerate}
            disabled={loading || showSample}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? <><FiLoader className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FaRegLightbulb className="mr-2 h-4 w-4" /> Generate Outline</>}
          </Button>
        </CardFooter>
      </Card>

      {/* Error Display */}
      {error && <StatusMessage type="error" message={error} />}

      {/* Loading State */}
      {loading && <LoadingSpinner message="Generating your book outline..." />}

      {/* Results */}
      {displayData && !loading && (
        <div className="space-y-4">
          {/* Title Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{displayData.book_title ?? 'Untitled'}</h2>
                  {displayData.subtitle && (
                    <p className="text-indigo-100 mt-1 text-lg italic">{displayData.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CopyButton text={buildOutlineText()} label="Copy" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(`${(displayData.book_title ?? 'outline').replace(/\s+/g, '_')}_outline.txt`, buildOutlineText())}
                    className="h-8 text-xs gap-1.5 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                  >
                    <FaDownload className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {displayData.target_audience && (
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <FaUsers className="mr-1 h-3 w-3" />
                    {displayData.target_audience}
                  </Badge>
                )}
                {displayData.estimated_pages && (
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <FaFileAlt className="mr-1 h-3 w-3" />
                    {displayData.estimated_pages} pages
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Synopsis */}
          {displayData.synopsis && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FaBookOpen className="h-4 w-4 text-indigo-600" />
                    Synopsis
                  </CardTitle>
                  <CopyButton text={displayData.synopsis} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 leading-relaxed text-sm">
                  {renderMarkdown(displayData.synopsis)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Themes */}
          {themes.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FaTags className="h-4 w-4 text-indigo-600" />
                  Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {themes.map((theme, i) => (
                    <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chapters */}
          {chapters.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FaListOl className="h-4 w-4 text-indigo-600" />
                  Chapter Breakdown ({chapters.length} chapters)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {chapters.map((ch, i) => {
                    // Extract chapter number and title for the "Write This Chapter" button
                    const chTitle = ch.title.replace(/^Chapter\s+\d+:\s*/i, '').trim()
                    return (
                      <div key={i} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleChapter(i)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">{i + 1}</span>
                            <span className="font-medium text-sm text-gray-900">{ch.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 gap-1 px-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                onChapterSelect({
                                  title: chTitle || ch.title,
                                  number: String(i + 1),
                                  summary: ch.description,
                                })
                              }}
                            >
                              <FaArrowRight className="h-2.5 w-2.5" />
                              <span className="hidden sm:inline">Write This Chapter</span>
                            </Button>
                            {expandedChapters.has(i) ? <FaChevronDown className="h-3 w-3 text-gray-400" /> : <FaChevronRight className="h-3 w-3 text-gray-400" />}
                          </div>
                        </button>
                        {expandedChapters.has(i) && ch.description && (
                          <div className="px-3 pb-3 pl-13">
                            <p className="text-sm text-gray-600 ml-10">{ch.description}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!displayData && !loading && !error && (
        <div className="text-center py-16">
          <FaBook className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No outline generated yet</h3>
          <p className="text-gray-400 text-sm mt-1">Enter your book idea above and click Generate Outline to get started.</p>
        </div>
      )}
    </div>
  )
}

// =====================================================================
// CHAPTER WRITER TAB
// =====================================================================
function ChapterWriterTab({
  showSample,
  activeAgentId,
  setActiveAgentId,
  prefillChapter,
  onSessionAdd,
  onStatsUpdate,
  chapterResult,
  setChapterResult,
}: {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
  prefillChapter: PrefillChapter | null
  onSessionAdd: (item: SessionItem) => void
  onStatsUpdate: (type: 'chapter', wordCount: number) => void
  chapterResult: ChapterResponse | null
  setChapterResult: (r: ChapterResponse | null) => void
}) {
  const [formData, setFormData] = useState({
    chapterTitle: '', chapterNumber: '', summary: '', genre: '', styleNotes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prefill from outline-to-chapter flow
  useEffect(() => {
    if (prefillChapter) {
      setFormData(prev => ({
        ...prev,
        chapterTitle: prefillChapter.title,
        chapterNumber: prefillChapter.number,
        summary: prefillChapter.summary,
      }))
    }
  }, [prefillChapter])

  const displayData = showSample ? SAMPLE_CHAPTER : chapterResult

  const handleWrite = useCallback(async () => {
    if (!formData.summary.trim()) {
      setError('Please enter a chapter summary or brief.')
      return
    }
    setLoading(true)
    setError(null)
    setChapterResult(null)
    setActiveAgentId(AGENT_IDS.CHAPTER_WRITER)
    try {
      const message = `Write a full chapter with the following details:${formData.chapterTitle ? ` Chapter title: "${formData.chapterTitle}".` : ''}${formData.chapterNumber ? ` Chapter number: ${formData.chapterNumber}.` : ''} Brief/summary: ${formData.summary}${formData.genre ? `. Genre: ${formData.genre}` : ''}${formData.styleNotes ? `. Style notes: ${formData.styleNotes}` : ''}`
      const res = await callAIAgent(message, AGENT_IDS.CHAPTER_WRITER)
      if (res.success && res?.response?.result) {
        const data = res.response.result as ChapterResponse
        setChapterResult(data)
        const wordCount = countWords(data.chapter_content)
        onStatsUpdate('chapter', wordCount)
        onSessionAdd({
          id: Date.now().toString(),
          type: 'chapter',
          title: data.chapter_title ?? `Chapter ${data.chapter_number ?? ''}`,
          preview: (data.chapter_content ?? '').slice(0, 80) + '...',
          timestamp: new Date(),
          data,
        })
      } else {
        setError(res?.error ?? res?.response?.message ?? 'Failed to write chapter. Please try again.')
      }
    } catch (e: any) {
      setError(e?.message ?? 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [formData, setActiveAgentId, onSessionAdd, onStatsUpdate, setChapterResult])

  const buildChapterText = (): string => {
    if (!displayData) return ''
    let text = ''
    if (displayData.chapter_number) text += `Chapter ${displayData.chapter_number}: `
    text += `${displayData.chapter_title ?? 'Untitled Chapter'}\n\n`
    if (displayData.chapter_content) text += `${displayData.chapter_content}\n\n`
    if (displayData.style_notes) text += `---\nStyle Notes: ${displayData.style_notes}\n`
    if (displayData.word_count) text += `Word Count: ${displayData.word_count}\n`
    return text
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FaPen className="h-5 w-5 text-indigo-600" />
            Write a Chapter
          </CardTitle>
          <CardDescription>Provide details about the chapter you want written and our AI co-author will draft publication-ready prose.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ch-title" className="text-gray-700">Chapter Title</Label>
              <Input
                id="ch-title"
                placeholder="e.g., The Memory Market"
                value={showSample ? 'The Memory Market' : formData.chapterTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, chapterTitle: e.target.value }))}
                className="mt-1.5"
                disabled={showSample}
              />
            </div>
            <div>
              <Label htmlFor="ch-number" className="text-gray-700">Chapter Number</Label>
              <Input
                id="ch-number"
                type="number"
                placeholder="e.g., 1"
                value={showSample ? '1' : formData.chapterNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, chapterNumber: e.target.value }))}
                className="mt-1.5"
                disabled={showSample}
                min={1}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ch-summary" className="text-gray-700">Chapter Summary / Brief *</Label>
            <Textarea
              id="ch-summary"
              placeholder="Describe what happens in this chapter, key scenes, character developments..."
              value={showSample ? 'Introduce the world of memory trading and our protagonist Lena, a talented archivist at the Memory Exchange. She discovers an unusual collection of memories that hints at something larger.' : formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              rows={4}
              className="mt-1.5"
              disabled={showSample}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700">Genre</Label>
              <Select
                value={showSample ? 'Fiction' : formData.genre}
                onValueChange={(val) => setFormData(prev => ({ ...prev, genre: val }))}
                disabled={showSample}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ch-style" className="text-gray-700">Writing Style Notes</Label>
              <Input
                id="ch-style"
                placeholder="e.g., First person, literary fiction, lyrical prose"
                value={showSample ? 'Third-person limited, literary fiction with accessible pacing' : formData.styleNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, styleNotes: e.target.value }))}
                className="mt-1.5"
                disabled={showSample}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleWrite}
            disabled={loading || showSample}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? <><FiLoader className="mr-2 h-4 w-4 animate-spin" /> Writing...</> : <><FaFeatherAlt className="mr-2 h-4 w-4" /> Write Chapter</>}
          </Button>
        </CardFooter>
      </Card>

      {/* Error Display */}
      {error && <StatusMessage type="error" message={error} />}

      {/* Loading State */}
      {loading && <LoadingSpinner message="Writing your chapter..." />}

      {/* Results */}
      {displayData && !loading && (
        <div className="space-y-4">
          {/* Chapter Header */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {displayData.chapter_number && (
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                        Chapter {displayData.chapter_number}
                      </Badge>
                    )}
                    {displayData.word_count && (
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                        {displayData.word_count} words
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mt-2">{displayData.chapter_title ?? 'Untitled Chapter'}</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CopyButton text={displayData.chapter_content ?? ''} label="Copy" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(`chapter_${displayData.chapter_number ?? '0'}_${(displayData.chapter_title ?? 'untitled').replace(/\s+/g, '_')}.txt`, buildChapterText())}
                    className="h-8 text-xs gap-1.5 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                  >
                    <FaDownload className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Chapter Content */}
          {displayData.chapter_content && (
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <ScrollArea className="max-h-[600px]">
                  <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-serif">
                    {displayData.chapter_content.split('\n').map((paragraph, i) => {
                      if (!paragraph.trim()) return <div key={i} className="h-4" />
                      return <p key={i} className="mb-4 text-base leading-7 first-letter:text-lg first-letter:font-semibold">{paragraph}</p>
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Style Notes */}
          {displayData.style_notes && (
            <Card className="border-0 shadow-md bg-indigo-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
                  <FiInfo className="h-4 w-4" />
                  Style Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-indigo-800">
                  {renderMarkdown(displayData.style_notes)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!displayData && !loading && !error && (
        <div className="text-center py-16">
          <FaPen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No chapter written yet</h3>
          <p className="text-gray-400 text-sm mt-1">Fill in the details above and click Write Chapter to get started.</p>
        </div>
      )}
    </div>
  )
}

// =====================================================================
// MANUSCRIPT EDITOR TAB
// =====================================================================
function ManuscriptEditorTab({
  showSample,
  activeAgentId,
  setActiveAgentId,
  onSessionAdd,
  onStatsUpdate,
  editorResult,
  setEditorResult,
}: {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
  onSessionAdd: (item: SessionItem) => void
  onStatsUpdate: (type: 'edit', wordCount: number) => void
  editorResult: EditorResponse | null
  setEditorResult: (r: EditorResponse | null) => void
}) {
  const [manuscript, setManuscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edited' | 'original'>('edited')

  const displayData = showSample ? SAMPLE_EDITOR : editorResult

  const handleEdit = useCallback(async () => {
    if (!manuscript.trim()) {
      setError('Please paste your manuscript text.')
      return
    }
    setLoading(true)
    setError(null)
    setEditorResult(null)
    setActiveAgentId(AGENT_IDS.MANUSCRIPT_EDITOR)
    try {
      const message = `Please edit and improve the following manuscript text:\n\n${manuscript}`
      const res = await callAIAgent(message, AGENT_IDS.MANUSCRIPT_EDITOR)
      if (res.success && res?.response?.result) {
        const data = res.response.result as EditorResponse
        setEditorResult(data)
        const wordCount = countWords(data.edited_text)
        onStatsUpdate('edit', wordCount)
        onSessionAdd({
          id: Date.now().toString(),
          type: 'edit',
          title: 'Manuscript Edit',
          preview: (data.edited_text ?? '').slice(0, 80) + '...',
          timestamp: new Date(),
          data,
        })
      } else {
        setError(res?.error ?? res?.response?.message ?? 'Failed to edit manuscript. Please try again.')
      }
    } catch (e: any) {
      setError(e?.message ?? 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [manuscript, setActiveAgentId, onSessionAdd, onStatsUpdate, setEditorResult])

  const qualityBefore = displayData ? parseQualityScore(displayData.quality_before) : 0
  const qualityAfter = displayData ? parseQualityScore(displayData.quality_after) : 0

  const buildEditedText = (): string => {
    if (!displayData) return ''
    let text = `Edited Manuscript\n${'='.repeat(40)}\n\n`
    if (displayData.edited_text) text += `${displayData.edited_text}\n\n`
    text += `---\n`
    if (displayData.changes_summary) text += `Changes Summary:\n${displayData.changes_summary}\n\n`
    if (displayData.editorial_notes) text += `Editorial Notes:\n${displayData.editorial_notes}\n\n`
    if (displayData.pacing_feedback) text += `Pacing Feedback:\n${displayData.pacing_feedback}\n\n`
    text += `Quality: ${qualityBefore}/10 -> ${qualityAfter}/10\n`
    return text
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FaEdit className="h-5 w-5 text-indigo-600" />
            Edit Manuscript
          </CardTitle>
          <CardDescription>Paste your manuscript text below for professional editing, including grammar, style, clarity, and pacing improvements.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your manuscript text here... (e.g., a chapter, a scene, or a few paragraphs you want polished)"
            value={showSample ? 'The morning light filtered through the crystalline walls of the Memory Exchange, casting prismatic shadows across the trading floor. Lena adjusted her archival gloves -- thin, translucent things that hummed faintly against her skin -- and surveyed the day\'s offerings.\n\nRows upon rows of memory capsules lined the display cases, each one glowing with a soft, inner light that spoke to the richness of the experience contained within.' : manuscript}
            onChange={(e) => setManuscript(e.target.value)}
            rows={8}
            className="font-serif"
            disabled={showSample}
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleEdit}
            disabled={loading || showSample}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? <><FiLoader className="mr-2 h-4 w-4 animate-spin" /> Editing...</> : <><FaEdit className="mr-2 h-4 w-4" /> Edit Manuscript</>}
          </Button>
        </CardFooter>
      </Card>

      {/* Error Display */}
      {error && <StatusMessage type="error" message={error} />}

      {/* Loading State */}
      {loading && <LoadingSpinner message="Editing your manuscript..." />}

      {/* Results */}
      {displayData && !loading && (
        <div className="space-y-4">
          {/* Quality Scores */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quality Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Before Editing</span>
                    <span className="text-sm font-bold text-gray-800">{qualityBefore}/10</span>
                  </div>
                  <Progress value={qualityBefore * 10} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">After Editing</span>
                    <span className="text-sm font-bold text-indigo-700">{qualityAfter}/10</span>
                  </div>
                  <div className="relative">
                    <Progress value={qualityAfter * 10} className="h-3" />
                  </div>
                </div>
              </div>
              {qualityAfter > qualityBefore && (
                <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                  <FaCheckCircle className="h-3 w-3" />
                  Quality improved by {qualityAfter - qualityBefore} points
                </p>
              )}
            </CardContent>
          </Card>

          {/* Edited Text vs Original */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Manuscript Text</CardTitle>
                <div className="flex items-center gap-2">
                  <CopyButton text={displayData.edited_text ?? ''} label="Copy Edited" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText('edited_manuscript.txt', buildEditedText())}
                    className="h-8 text-xs gap-1.5"
                  >
                    <FaDownload className="h-3 w-3" />
                    Download
                  </Button>
                  <div className="flex items-center gap-0 bg-gray-100 rounded-lg p-0.5 ml-2">
                    <button
                      onClick={() => setViewMode('edited')}
                      className={cn('px-3 py-1 text-xs font-medium rounded-md transition-colors', viewMode === 'edited' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700')}
                    >
                      Edited
                    </button>
                    <button
                      onClick={() => setViewMode('original')}
                      className={cn('px-3 py-1 text-xs font-medium rounded-md transition-colors', viewMode === 'original' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700')}
                    >
                      Original
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <div className="prose prose-sm max-w-none text-gray-800 font-serif leading-relaxed">
                  {viewMode === 'edited'
                    ? (displayData.edited_text ?? '').split('\n').map((p, i) =>
                        !p.trim() ? <div key={i} className="h-4" /> : <p key={i} className="mb-4 text-base leading-7">{p}</p>
                      )
                    : (showSample
                        ? 'The morning light filtered through the crystalline walls of the Memory Exchange, casting prismatic shadows across the trading floor. Lena adjusted her archival gloves -- thin, translucent things that hummed faintly against her skin -- and surveyed the day\'s offerings.\n\nRows upon rows of memory capsules lined the display cases, each one glowing with a soft, inner light that spoke to the richness of the experience contained within.'
                        : manuscript
                      ).split('\n').map((p, i) =>
                        !p.trim() ? <div key={i} className="h-4" /> : <p key={i} className="mb-4 text-base leading-7 text-gray-600">{p}</p>
                      )
                  }
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Changes Summary */}
          {displayData.changes_summary && (
            <Card className="border-0 shadow-md border-l-4 border-l-amber-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                  <FaRegCopy className="h-4 w-4" />
                  Changes Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">
                  {renderMarkdown(displayData.changes_summary)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editorial Notes */}
          {displayData.editorial_notes && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FaEdit className="h-4 w-4 text-indigo-600" />
                  Editorial Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">
                  {renderMarkdown(displayData.editorial_notes)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pacing Feedback */}
          {displayData.pacing_feedback && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FaArrowRight className="h-4 w-4 text-indigo-600" />
                  Pacing Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">
                  {renderMarkdown(displayData.pacing_feedback)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!displayData && !loading && !error && (
        <div className="text-center py-16">
          <FaEdit className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No manuscript edited yet</h3>
          <p className="text-gray-400 text-sm mt-1">Paste your manuscript text above and click Edit Manuscript.</p>
        </div>
      )}
    </div>
  )
}

// =====================================================================
// SCRIPTURE ASSISTANT TAB
// =====================================================================
function ScriptureAssistantTab({
  showSample,
  activeAgentId,
  setActiveAgentId,
  onSessionAdd,
  scriptureResult,
  setScriptureResult,
}: {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
  onSessionAdd: (item: SessionItem) => void
  scriptureResult: ScriptureResponse | null
  setScriptureResult: (r: ScriptureResponse | null) => void
}) {
  const [formData, setFormData] = useState({ topic: '', context: '', translation: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayData = showSample ? SAMPLE_SCRIPTURE : scriptureResult

  const handleSearch = useCallback(async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic or theme.')
      return
    }
    setLoading(true)
    setError(null)
    setScriptureResult(null)
    setActiveAgentId(AGENT_IDS.SCRIPTURE_ASSISTANT)
    try {
      const message = `Find scripture references for the topic: "${formData.topic}"${formData.context ? `. Context/purpose: ${formData.context}` : ''}${formData.translation ? `. Preferred translation: ${formData.translation}` : ''}`
      const res = await callAIAgent(message, AGENT_IDS.SCRIPTURE_ASSISTANT)
      if (res.success && res?.response?.result) {
        const data = res.response.result as ScriptureResponse
        setScriptureResult(data)
        onSessionAdd({
          id: Date.now().toString(),
          type: 'scripture',
          title: data.primary_verse ?? 'Scripture Search',
          preview: (data.verse_text ?? '').slice(0, 80) + '...',
          timestamp: new Date(),
          data,
        })
      } else {
        setError(res?.error ?? res?.response?.message ?? 'Failed to search scriptures. Please try again.')
      }
    } catch (e: any) {
      setError(e?.message ?? 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [formData, setActiveAgentId, onSessionAdd, setScriptureResult])

  const relatedVerses = displayData ? parseRelatedVerses(displayData.related_verses) : []

  const buildScriptureText = (): string => {
    if (!displayData) return ''
    let text = `${displayData.primary_verse ?? 'Verse'}`
    if (displayData.translation) text += ` (${displayData.translation})`
    text += '\n\n'
    if (displayData.verse_text) text += `"${displayData.verse_text}"\n\n`
    if (displayData.context_explanation) text += `Context:\n${displayData.context_explanation}\n\n`
    if (relatedVerses.length > 0) {
      text += 'Related Verses:\n'
      relatedVerses.forEach(v => {
        text += `- ${v.reference}${v.text ? ': ' + v.text : ''}\n`
      })
      text += '\n'
    }
    if (displayData.integration_suggestion) text += `Integration Suggestion:\n${displayData.integration_suggestion}\n\n`
    if (displayData.devotional_application) text += `Devotional Application:\n${displayData.devotional_application}\n`
    return text
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FaCross className="h-5 w-5 text-indigo-600" />
            Scripture Assistant
          </CardTitle>
          <CardDescription>Find, verify, and contextually integrate Bible references into your writing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sc-topic" className="text-gray-700">Topic or Theme *</Label>
            <Input
              id="sc-topic"
              placeholder="e.g., Hope in difficult times, God's plan, Forgiveness"
              value={showSample ? "God's plan and purpose for our lives" : formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              className="mt-1.5"
              disabled={showSample}
            />
          </div>
          <div>
            <Label htmlFor="sc-context" className="text-gray-700">Context / Purpose</Label>
            <Textarea
              id="sc-context"
              placeholder="What are you writing about? How do you plan to use this scripture?"
              value={showSample ? 'Writing a chapter where the protagonist faces uncertainty about their future and needs to find reassurance in faith' : formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              rows={3}
              className="mt-1.5"
              disabled={showSample}
            />
          </div>
          <div>
            <Label className="text-gray-700">Preferred Translation</Label>
            <Select
              value={showSample ? 'NIV' : formData.translation}
              onValueChange={(val) => setFormData(prev => ({ ...prev, translation: val }))}
              disabled={showSample}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a translation" />
              </SelectTrigger>
              <SelectContent>
                {TRANSLATIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSearch}
            disabled={loading || showSample}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? <><FiLoader className="mr-2 h-4 w-4 animate-spin" /> Searching...</> : <><FaSearch className="mr-2 h-4 w-4" /> Find Scripture</>}
          </Button>
        </CardFooter>
      </Card>

      {/* Error Display */}
      {error && <StatusMessage type="error" message={error} />}

      {/* Loading State */}
      {loading && <LoadingSpinner message="Searching scriptures..." />}

      {/* Results */}
      {displayData && !loading && (
        <div className="space-y-4">
          {/* Primary Verse Card */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 border-b border-amber-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-amber-900">{displayData.primary_verse ?? 'Verse'}</h2>
                  {displayData.translation && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                      {displayData.translation}
                    </Badge>
                  )}
                </div>
                <CopyButton text={buildScriptureText()} label="Copy All" />
              </div>
              {displayData.verse_text && (
                <div className="relative pl-6 border-l-4 border-amber-400">
                  <FaQuoteLeft className="absolute -left-1 -top-1 h-4 w-4 text-amber-400" />
                  <p className="text-gray-800 text-lg italic leading-relaxed font-serif">
                    {displayData.verse_text}
                  </p>
                  <div className="mt-2">
                    <CopyButton text={`${displayData.primary_verse ?? ''} - "${displayData.verse_text}" (${displayData.translation ?? ''})`} label="Copy Verse" />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Context Explanation */}
          {displayData.context_explanation && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FaBookOpen className="h-4 w-4 text-indigo-600" />
                    Context & Explanation
                  </CardTitle>
                  <CopyButton text={displayData.context_explanation} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {renderMarkdown(displayData.context_explanation)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Verses */}
          {relatedVerses.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FaRegBookmark className="h-4 w-4 text-indigo-600" />
                  Related Verses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedVerses.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <FaCircle className="h-2 w-2 text-indigo-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold text-sm text-indigo-700">{v.reference}</span>
                        {v.text && <p className="text-sm text-gray-600 mt-0.5 italic">{v.text}</p>}
                      </div>
                      <CopyButton text={`${v.reference}${v.text ? ' - ' + v.text : ''}`} label="" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integration Suggestion */}
          {displayData.integration_suggestion && (
            <Card className="border-0 shadow-md border-l-4 border-l-indigo-400">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
                    <FaRegLightbulb className="h-4 w-4" />
                    Integration Suggestion
                  </CardTitle>
                  <CopyButton text={displayData.integration_suggestion} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">
                  {renderMarkdown(displayData.integration_suggestion)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Devotional Application */}
          {displayData.devotional_application && (
            <Card className="border-0 shadow-md bg-purple-50/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                    <FaCross className="h-4 w-4" />
                    Devotional Application
                  </CardTitle>
                  <CopyButton text={displayData.devotional_application} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-purple-900 leading-relaxed">
                  {renderMarkdown(displayData.devotional_application)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!displayData && !loading && !error && (
        <div className="text-center py-16">
          <FaCross className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No scripture search yet</h3>
          <p className="text-gray-400 text-sm mt-1">Enter a topic above and click Find Scripture to get started.</p>
        </div>
      )}
    </div>
  )
}

// =====================================================================
// MARKETPLACE SECTION
// =====================================================================
function MarketplaceSection({ cartCount, setCartCount }: { cartCount: number; setCartCount: (fn: (prev: number) => number) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const [addedBookId, setAddedBookId] = useState<number | null>(null)
  const [previewBookId, setPreviewBookId] = useState<number | null>(null)

  const genres = ['All', 'Fiction', 'Sci-Fi', 'Fantasy', 'Thriller', 'Self-Help', 'Faith/Spiritual']

  const filteredBooks = SAMPLE_BOOKS.filter((book) => {
    const matchesSearch = !searchQuery || book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = !activeGenre || activeGenre === 'All' || book.genre === activeGenre
    return matchesSearch && matchesGenre
  })

  const handleAddToCart = (bookId: number) => {
    setCartCount((prev: number) => prev + 1)
    setAddedBookId(bookId)
    setTimeout(() => setAddedBookId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g === 'All' ? null : g)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              (activeGenre === g || (g === 'All' && !activeGenre))
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Book Cover Placeholder */}
            <div className={cn('h-48 bg-gradient-to-br flex items-center justify-center relative', book.gradientFrom, book.gradientTo)}>
              <div className="text-center px-6">
                <FaBook className="mx-auto h-8 w-8 text-white/40 mb-2" />
                <h3 className="text-white font-bold text-lg leading-tight">{book.title}</h3>
                <p className="text-white/70 text-sm mt-1">{book.author}</p>
              </div>
              <Badge className="absolute top-3 right-3 bg-white/20 text-white border-white/30 text-xs hover:bg-white/30">
                {book.genre}
              </Badge>
            </div>
            <CardContent className="pt-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{book.title}</h4>
                  <p className="text-xs text-gray-500">{book.author}</p>
                </div>
                <span className="text-lg font-bold text-indigo-600">${book.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{book.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><FaFileAlt className="h-2.5 w-2.5" />{book.pages} pages</span>
                <span className="flex items-center gap-1"><FaClock className="h-2.5 w-2.5" />{book.publishDate}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <StarRating rating={book.rating} />
                  <span className="text-xs text-gray-500 ml-1">{book.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-gray-500 hover:text-indigo-600"
                    onClick={() => setPreviewBookId(previewBookId === book.id ? null : book.id)}
                  >
                    <FaBookOpen className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  {addedBookId === book.id ? (
                    <Button size="sm" variant="outline" className="h-8 text-xs border-green-200 text-green-600 bg-green-50" disabled>
                      <FaCheck className="mr-1.5 h-3 w-3" />
                      Added
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={() => handleAddToCart(book.id)}
                    >
                      <FaShoppingCart className="mr-1.5 h-3 w-3" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            {/* Preview Panel */}
            {previewBookId === book.id && (
              <div className="border-t bg-gray-50 p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{book.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span><strong>Genre:</strong> {book.genre}</span>
                  <span><strong>Pages:</strong> {book.pages}</span>
                  <span><strong>Published:</strong> {book.publishDate}</span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <FaSearch className="mx-auto h-8 w-8 text-gray-300 mb-3" />
          <p className="text-gray-500">No books found matching your search.</p>
        </div>
      )}
    </div>
  )
}

// =====================================================================
// AGENT STATUS
// =====================================================================
function AgentStatusPanel({ activeAgentId }: { activeAgentId: string | null }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-700">AI Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {AGENTS_INFO.map((agent) => (
            <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-gray-300')}>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{agent.name}</p>
                <p className="text-xs text-gray-400 truncate">{agent.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================================
// MAIN PAGE COMPONENT
// =====================================================================
export default function Page() {
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('outline')
  const [prefillChapter, setPrefillChapter] = useState<PrefillChapter | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [sessionHistory, setSessionHistory] = useState<SessionItem[]>([])
  const [writingStats, setWritingStats] = useState<WritingStats>({
    wordsGenerated: 0,
    outlinesCreated: 0,
    chaptersWritten: 0,
    editsPerformed: 0,
  })

  // Lifted result states so session history can reload them
  const [outlineResult, setOutlineResult] = useState<OutlineResponse | null>(null)
  const [chapterResult, setChapterResult] = useState<ChapterResponse | null>(null)
  const [editorResult, setEditorResult] = useState<EditorResponse | null>(null)
  const [scriptureResult, setScriptureResult] = useState<ScriptureResponse | null>(null)

  const handleChapterSelect = useCallback((chapter: PrefillChapter) => {
    setPrefillChapter(chapter)
    setActiveTab('writer')
  }, [])

  const handleSessionAdd = useCallback((item: SessionItem) => {
    setSessionHistory(prev => [item, ...prev].slice(0, 20))
  }, [])

  const handleStatsUpdate = useCallback((type: 'outline' | 'chapter' | 'edit', wordCount: number) => {
    setWritingStats(prev => {
      const next = { ...prev, wordsGenerated: prev.wordsGenerated + wordCount }
      if (type === 'outline') next.outlinesCreated = prev.outlinesCreated + 1
      if (type === 'chapter') next.chaptersWritten = prev.chaptersWritten + 1
      if (type === 'edit') next.editsPerformed = prev.editsPerformed + 1
      return next
    })
  }, [])

  const handleSelectHistoryItem = useCallback((item: SessionItem) => {
    switch (item.type) {
      case 'outline':
        setOutlineResult(item.data as OutlineResponse)
        setActiveTab('outline')
        break
      case 'chapter':
        setChapterResult(item.data as ChapterResponse)
        setActiveTab('writer')
        break
      case 'edit':
        setEditorResult(item.data as EditorResponse)
        setActiveTab('editor')
        break
      case 'scripture':
        setScriptureResult(item.data as ScriptureResponse)
        setActiveTab('scripture')
        break
    }
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Header */}
        <header className="bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <FaBookOpen className="h-7 w-7 text-indigo-300" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">SOMA-AI</h1>
                </div>
                <p className="text-indigo-200 text-sm sm:text-base max-w-lg">AI-Powered Book Marketplace & Writing Studio -- Create, edit, and publish with intelligent writing assistants.</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Cart Counter */}
                {cartCount > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10">
                    <FaShoppingCart className="h-4 w-4 text-indigo-300" />
                    <Badge className="bg-indigo-500 text-white border-0 text-xs h-5 min-w-[20px] flex items-center justify-center">{cartCount}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2.5 backdrop-blur-sm border border-white/10">
                  <Label htmlFor="sample-toggle" className="text-sm text-indigo-200 cursor-pointer">Sample Data</Label>
                  <Switch
                    id="sample-toggle"
                    checked={showSample}
                    onCheckedChange={setShowSample}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Feature Highlights */}
          <div className="mb-6">
            <FeatureHighlights />
          </div>

          {/* Writing Stats Bar */}
          <div className="mb-6">
            <WritingStatsBar stats={writingStats} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-1 bg-white shadow-sm border p-1 rounded-xl">
              <TabsTrigger value="outline" className="flex items-center gap-2 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                <FaBook className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Book</span> Outline
              </TabsTrigger>
              <TabsTrigger value="writer" className="flex items-center gap-2 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                <FaPen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Chapter</span> Writer
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                <FaEdit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Manuscript</span> Editor
              </TabsTrigger>
              <TabsTrigger value="scripture" className="flex items-center gap-2 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                <FaCross className="h-3.5 w-3.5" />
                Scripture
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center gap-2 text-xs sm:text-sm py-2.5 rounded-lg col-span-2 md:col-span-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                <FaShoppingCart className="h-3.5 w-3.5" />
                Marketplace
                {cartCount > 0 && <Badge className="bg-indigo-500 text-white border-0 text-xs h-4 min-w-[16px] px-1 flex items-center justify-center ml-1">{cartCount}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* Outline Tab */}
            <TabsContent value="outline">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <BookOutlineTab
                    showSample={showSample}
                    activeAgentId={activeAgentId}
                    setActiveAgentId={setActiveAgentId}
                    onChapterSelect={handleChapterSelect}
                    onSessionAdd={handleSessionAdd}
                    onStatsUpdate={handleStatsUpdate}
                    outlineResult={outlineResult}
                    setOutlineResult={setOutlineResult}
                  />
                </div>
                <div className="hidden lg:block">
                  <div className="sticky top-6 space-y-0">
                    <AgentStatusPanel activeAgentId={activeAgentId} />
                    <SessionHistoryPanel sessionHistory={sessionHistory} onSelectItem={handleSelectHistoryItem} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Writer Tab */}
            <TabsContent value="writer">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <ChapterWriterTab
                    showSample={showSample}
                    activeAgentId={activeAgentId}
                    setActiveAgentId={setActiveAgentId}
                    prefillChapter={prefillChapter}
                    onSessionAdd={handleSessionAdd}
                    onStatsUpdate={handleStatsUpdate}
                    chapterResult={chapterResult}
                    setChapterResult={setChapterResult}
                  />
                </div>
                <div className="hidden lg:block">
                  <div className="sticky top-6 space-y-0">
                    <AgentStatusPanel activeAgentId={activeAgentId} />
                    <SessionHistoryPanel sessionHistory={sessionHistory} onSelectItem={handleSelectHistoryItem} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Editor Tab */}
            <TabsContent value="editor">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <ManuscriptEditorTab
                    showSample={showSample}
                    activeAgentId={activeAgentId}
                    setActiveAgentId={setActiveAgentId}
                    onSessionAdd={handleSessionAdd}
                    onStatsUpdate={handleStatsUpdate}
                    editorResult={editorResult}
                    setEditorResult={setEditorResult}
                  />
                </div>
                <div className="hidden lg:block">
                  <div className="sticky top-6 space-y-0">
                    <AgentStatusPanel activeAgentId={activeAgentId} />
                    <SessionHistoryPanel sessionHistory={sessionHistory} onSelectItem={handleSelectHistoryItem} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Scripture Tab */}
            <TabsContent value="scripture">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <ScriptureAssistantTab
                    showSample={showSample}
                    activeAgentId={activeAgentId}
                    setActiveAgentId={setActiveAgentId}
                    onSessionAdd={handleSessionAdd}
                    scriptureResult={scriptureResult}
                    setScriptureResult={setScriptureResult}
                  />
                </div>
                <div className="hidden lg:block">
                  <div className="sticky top-6 space-y-0">
                    <AgentStatusPanel activeAgentId={activeAgentId} />
                    <SessionHistoryPanel sessionHistory={sessionHistory} onSelectItem={handleSelectHistoryItem} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Marketplace Tab */}
            <TabsContent value="marketplace">
              <MarketplaceSection cartCount={cartCount} setCartCount={setCartCount} />
            </TabsContent>
          </Tabs>

          {/* Mobile Agent Status & Session History */}
          <div className="lg:hidden mt-6 space-y-4">
            <AgentStatusPanel activeAgentId={activeAgentId} />
            <SessionHistoryPanel sessionHistory={sessionHistory} onSelectItem={handleSelectHistoryItem} />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaBookOpen className="h-5 w-5 text-indigo-400" />
                  <span className="font-semibold text-white text-lg">SOMA-AI</span>
                </div>
                <p className="text-sm leading-relaxed">AI-Powered Book Marketplace & Writing Studio. Create, edit, and publish with intelligent writing assistants powered by advanced AI.</p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => setActiveTab('outline')} className="text-sm hover:text-indigo-400 transition-colors">Writing Studio</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('marketplace')} className="text-sm hover:text-indigo-400 transition-colors">Marketplace</button>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-indigo-400 transition-colors">About</a>
                  </li>
                </ul>
              </div>

              {/* AI Agents Summary */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-3">AI Agents</h3>
                <div className="space-y-2">
                  {AGENTS_INFO.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full flex-shrink-0', activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-gray-600')} />
                      <span className="text-xs">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Separator className="my-6 bg-gray-800" />
            <p className="text-center text-xs text-gray-500">SOMA-AI Writing Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
