import { useState, useMemo } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { useLocaleStore } from '@/store/localeStore'

type TabType = 'word' | 'sentence' | 'grapheme'

interface Segment {
  segment: string
  index: number
  isWordLike?: boolean
}

// Sample texts for different locales
const sampleTexts: Record<string, string> = {
  en: "Hello, world! This is a test. Dr. Smith went to the store.",
  de: "Hallo, Welt! Dies ist ein Test. Dr. Müller ging zum Laden.",
  fr: "Bonjour le monde! Ceci est un test. M. Dupont est allé au magasin.",
  es: "¡Hola, mundo! Esta es una prueba. El Sr. García fue a la tienda.",
  ja: "こんにちは世界！これはテストです。田中さんは店に行きました。",
  zh: "你好，世界！这是一个测试。王先生去了商店。",
  'zh-Hans': "你好，世界！这是一个测试。王先生去了商店。",
  'zh-Hant': "你好，世界！這是一個測試。王先生去了商店。",
  ko: "안녕하세요, 세계! 이것은 테스트입니다. 김 선생님이 가게에 갔습니다.",
  ar: "مرحبا بالعالم! هذا اختبار. ذهب السيد أحمد إلى المتجر.",
  th: "สวัสดีชาวโลก! นี่คือการทดสอบ คุณสมชายไปที่ร้านค้า",
  hi: "नमस्ते दुनिया! यह एक परीक्षण है। श्री शर्मा दुकान गए।",
  ru: "Привет, мир! Это тест. Г-н Иванов пошёл в магазин.",
  pt: "Olá, mundo! Este é um teste. O Sr. Silva foi à loja.",
  it: "Ciao, mondo! Questo è un test. Il Sig. Rossi è andato al negozio.",
}

// Complex script examples for demonstration
interface ScriptExample {
  locale: string
  label: string
  text: string
  translation?: string  // Actual translation of the text
  note?: string         // Explanation or context (shown as tooltip)
}

const complexScriptExamples: ScriptExample[] = [
  // English example for comparison
  {
    locale: 'en',
    label: '🇬🇧 English - Abbreviations',
    text: 'Dr. Smith earned $1,234.56 on Jan. 1st. Mrs. Jones asked: "Is that a lot?" He replied, "It\'s O.K."',
    note: 'Tests sentence breaks with abbreviations and punctuation',
  },
  // Thai examples - no spaces between words
  {
    locale: 'th',
    label: '🇹🇭 Thai - News',
    text: 'กรุงเทพมหานครเป็นเมืองหลวงและเมืองที่มีประชากรมากที่สุดของประเทศไทย',
    translation: 'Bangkok is the capital and most populous city of Thailand.',
    note: 'No spaces between words',
  },
  {
    locale: 'th',
    label: '🇹🇭 Thai - Proverb',
    text: 'น้ำขึ้นให้รีบตัก ฝนตกให้รีบรอง ลมพัดให้รีบพา',
    translation: 'When water rises, hurry to scoop. When rain falls, hurry to collect. When wind blows, hurry to carry.',
    note: 'Traditional proverb about seizing opportunities',
  },
  {
    locale: 'th',
    label: '🇹🇭 Thai - Numbers',
    text: 'วันนี้อุณหภูมิ๓๕องศาเซลเซียส ราคาข้าว๑๒๐บาทต่อกิโลกรัม',
    translation: 'Today\'s temperature is 35°C. Rice price is 120 baht per kilogram.',
    note: 'Contains Thai numerals (๓๕ = 35, ๑๒๐ = 120)',
  },
  // Japanese examples - mixed scripts
  {
    locale: 'ja',
    label: '🇯🇵 Japanese - Mixed',
    text: '東京スカイツリーは2012年に完成した。高さは634メートルで、世界一高い電波塔です。',
    translation: 'Tokyo Skytree was completed in 2012. At 634 meters, it is the tallest radio tower in the world.',
    note: 'Mixes kanji, katakana, hiragana, and Arabic numerals',
  },
  {
    locale: 'ja',
    label: '🇯🇵 Japanese - Technical',
    text: 'このAPIはJavaScriptで実装されており、UTF-8エンコーディングをサポートしています。',
    translation: 'This API is implemented in JavaScript and supports UTF-8 encoding.',
    note: 'Technical text mixing Japanese with English terms',
  },
  {
    locale: 'ja',
    label: '🇯🇵 Japanese - Literature',
    text: '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。',
    translation: 'I am a cat. I don\'t have a name yet. I have no idea where I was born.',
    note: 'Opening of "I Am a Cat" by Natsume Sōseki',
  },
  {
    locale: 'ja',
    label: '🇯🇵 Japanese - Emoji',
    text: '今日は天気がいいですね！🌸桜を見に行きませんか？🎌',
    translation: 'The weather is nice today! Shall we go see the cherry blossoms?',
    note: 'Casual text with emoji',
  },
  // Arabic examples - right-to-left, complex joining
  {
    locale: 'ar',
    label: '🇸🇦 Arabic - News',
    text: 'أعلنت وزارة الصحة عن تسجيل ١٢٣٤ حالة جديدة. وقال المتحدث الرسمي إن الوضع مستقر.',
    translation: 'The Ministry of Health announced 1,234 new cases. The official spokesperson said the situation is stable.',
    note: 'Formal Arabic with Arabic-Indic numerals',
  },
  {
    locale: 'ar',
    label: '🇸🇦 Arabic - Poetry',
    text: 'أنا البحر في أحشائه الدر كامن، فهل ساءلوا الغواص عن صدفاتي؟',
    translation: 'I am the sea, in whose depths pearls lie hidden. Have they asked the diver about my shells?',
    note: 'Classical poetry by Ahmed Shawqi',
  },
  {
    locale: 'ar',
    label: '🇸🇦 Arabic - Technical',
    text: 'يستخدم بروتوكول HTTP/2 لنقل البيانات بسرعة ٥٠٠ ميغابت/ثانية عبر شبكة الإنترنت.',
    translation: 'The HTTP/2 protocol is used to transfer data at 500 megabits/second over the internet.',
    note: 'Technical text with Latin characters mixed in',
  },
  {
    locale: 'ar',
    label: '🇸🇦 Arabic - Diacritics',
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ.',
    translation: 'In the name of God, the Most Gracious, the Most Merciful. Praise be to God, Lord of all worlds.',
    note: 'Quranic text with full diacritical marks (tashkeel)',
  },
  // Chinese examples
  {
    locale: 'zh',
    label: '🇨🇳 Chinese - Technical',
    text: '人工智能（AI）正在改变我们的生活方式。到2025年，预计将有50%的工作受到影响。',
    translation: 'Artificial intelligence (AI) is changing our way of life. By 2025, 50% of jobs are expected to be affected.',
    note: 'Contains parenthetical abbreviation and numbers',
  },
  // Korean example
  {
    locale: 'ko',
    label: '🇰🇷 Korean - Mixed',
    text: '서울의 인구는 약 1000만 명입니다. K-pop과 K-drama가 세계적으로 인기를 얻고 있습니다.',
    translation: 'Seoul\'s population is about 10 million. K-pop and K-drama are gaining popularity worldwide.',
    note: 'Hangul mixed with Latin characters',
  },
]

// Get the base language code for sample text lookup
function getBaseLocale(locale: string): string {
  // Handle special cases
  if (locale === 'zh-Hans' || locale === 'zh-Hant') return locale
  // Get base language
  return locale.split('-')[0]
}

export default function SegmentationPage() {
  const { selectedLocale } = useLocaleStore()
  const [activeTab, setActiveTab] = useState<TabType>('word')
  const [inputText, setInputText] = useState(() => {
    const base = getBaseLocale(selectedLocale)
    return sampleTexts[base] || sampleTexts[selectedLocale] || sampleTexts.en
  })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedExample, setSelectedExample] = useState<ScriptExample | null>(null)

  // Update sample text when locale changes
  const updateSampleText = () => {
    const base = getBaseLocale(selectedLocale)
    setInputText(sampleTexts[base] || sampleTexts[selectedLocale] || sampleTexts.en)
    setSelectedExample(null)
  }

  // Load an example
  const loadExample = (example: ScriptExample) => {
    setInputText(example.text)
    setSelectedExample(example)
  }

  // Segment text using Intl.Segmenter
  const segments = useMemo((): Segment[] => {
    if (!inputText) return []

    try {
      const segmenter = new Intl.Segmenter(selectedLocale, { granularity: activeTab })
      const segmentIterator = segmenter.segment(inputText)

      return Array.from(segmentIterator).map((seg) => ({
        segment: seg.segment,
        index: seg.index,
        isWordLike: 'isWordLike' in seg ? seg.isWordLike : undefined,
      }))
    } catch (error) {
      console.error('Segmentation error:', error)
      return []
    }
  }, [inputText, selectedLocale, activeTab])

  // Count meaningful segments
  const segmentStats = useMemo(() => {
    if (activeTab === 'word') {
      const wordLike = segments.filter((s) => s.isWordLike).length
      const nonWordLike = segments.filter((s) => s.isWordLike === false).length
      return { total: segments.length, wordLike, nonWordLike }
    }
    return { total: segments.length }
  }, [segments, activeTab])

  // Copy code to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      // Silently fail
    }
  }

  // Get segment display style based on type
  const getSegmentStyle = (segment: Segment): string => {
    if (activeTab === 'word') {
      if (segment.isWordLike) {
        return 'bg-blue-100 text-blue-800 border-blue-300'
      }
      return 'bg-slate-100 text-slate-600 border-slate-300'
    }
    if (activeTab === 'sentence') {
      return 'bg-green-100 text-green-800 border-green-300'
    }
    // grapheme
    return 'bg-purple-100 text-purple-800 border-purple-300'
  }

  // Tab descriptions
  const tabDescriptions: Record<TabType, { title: string; description: string; useCase: string }> = {
    word: {
      title: 'Word Segmentation',
      description: 'Splits text at word boundaries. Essential for languages like Chinese, Japanese, and Thai that do not use spaces between words.',
      useCase: 'Use for word counting, search highlighting, text analysis, or finding linguistic word boundaries across languages.',
    },
    sentence: {
      title: 'Sentence Segmentation',
      description: 'Splits text at sentence boundaries. Handles abbreviations (Dr., Mr., etc.) and other edge cases according to locale rules.',
      useCase: 'Use for text-to-speech, summarization, document navigation, or processing text sentence by sentence.',
    },
    grapheme: {
      title: 'Grapheme (Character) Segmentation',
      description: 'Splits text into user-perceived characters (grapheme clusters). Correctly handles emoji, combining characters, and complex scripts.',
      useCase: 'Use for character counting, cursor positioning, text truncation, or any operation where you need to match user perception of characters.',
    },
  }

  // CLDR source file URL
  const cldrSourceUrl = 'https://github.com/unicode-org/cldr/tree/main/common/segments'
  const cldrRootXmlUrl = 'https://github.com/unicode-org/cldr/blob/main/common/segments/root.xml'

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Text Segmentation</h1>
        <p className="text-muted-foreground">
          Explore text boundary analysis for{' '}
          <span className="font-mono font-semibold text-foreground">
            {selectedLocale}
          </span>
          {' '}using CLDR segmentation rules
        </p>
        <div className="mt-3 px-4 py-2 bg-muted/50 border border-muted rounded-md text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> CLDR defines rules for segmenting text into words, sentences, and grapheme clusters. These rules are implemented by the native{' '}
            <code className="px-1 py-0.5 bg-muted rounded text-xs">Intl.Segmenter</code> API.
          </p>
        </div>
      </div>

      {/* CLDR Source Link */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">CLDR Segmentation Rules</h3>
            <p className="text-sm text-muted-foreground">
              View the XML source files that define segmentation rules for all locales
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={cldrRootXmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              root.xml
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={cldrSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              All Segments
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('word')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'word'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Word Breaks
          </button>
          <button
            onClick={() => setActiveTab('sentence')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sentence'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Sentence Breaks
          </button>
          <button
            onClick={() => setActiveTab('grapheme')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'grapheme'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            Character Breaks
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Overview */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{tabDescriptions[activeTab].title}</h2>
          <p className="text-muted-foreground mb-4">
            {tabDescriptions[activeTab].description}
          </p>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">
              <span className="font-semibold">Use case:</span>{' '}
              {tabDescriptions[activeTab].useCase}
            </p>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Try It Yourself</h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Enter text to segment:
                </label>
                <button
                  onClick={updateSampleText}
                  className="text-xs text-primary hover:underline"
                >
                  Load sample text for {selectedLocale}
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  setSelectedExample(null)
                }}
                placeholder="Enter text here..."
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] font-sans"
                dir="auto"
              />
            </div>

            {/* Complex Script Examples */}
            <div className="p-4 bg-muted/50 rounded-lg border border-muted">
              <h3 className="text-sm font-semibold mb-3">
                Try Example Texts
              </h3>
              <div className="flex flex-wrap gap-2">
                {complexScriptExamples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadExample(example)}
                    className={`px-3 py-1.5 text-xs border rounded-md transition-colors text-left ${
                      selectedExample === example
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent hover:border-primary'
                    }`}
                    title={example.note || example.text.slice(0, 50)}
                  >
                    {example.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Click any example to load it. Hover for details.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="px-3 py-2 bg-muted rounded-md">
                <span className="text-muted-foreground">Total segments: </span>
                <span className="font-semibold">{segmentStats.total}</span>
              </div>
              {activeTab === 'word' && 'wordLike' in segmentStats && (
                <>
                  <div className="px-3 py-2 bg-blue-50 rounded-md">
                    <span className="text-blue-600">Words: </span>
                    <span className="font-semibold text-blue-800">{segmentStats.wordLike}</span>
                  </div>
                  <div className="px-3 py-2 bg-slate-100 rounded-md">
                    <span className="text-slate-600">Non-words: </span>
                    <span className="font-semibold text-slate-800">{segmentStats.nonWordLike}</span>
                  </div>
                </>
              )}
            </div>

            {/* Segmentation Results */}
            {segments.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Segmentation result:
                </div>
                <div className="p-4 bg-muted rounded-md overflow-x-auto">
                  <div className="flex flex-wrap gap-1" dir="auto">
                    {segments.map((seg, idx) => (
                      <span
                        key={idx}
                        className={`inline-block px-2 py-1 rounded border text-sm font-mono ${getSegmentStyle(seg)}`}
                        title={
                          activeTab === 'word'
                            ? seg.isWordLike
                              ? 'Word-like segment'
                              : 'Non-word segment (space/punctuation)'
                            : `Segment ${idx + 1}`
                        }
                      >
                        {seg.segment === ' ' ? '␣' : seg.segment === '\n' ? '↵' : seg.segment}
                      </span>
                    ))}
                  </div>
                </div>

                {activeTab === 'word' && (
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
                      Word-like segments
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-slate-100 border border-slate-300 rounded"></span>
                      Non-word segments (spaces, punctuation)
                    </span>
                  </div>
                )}

                {/* Translation - always LTR since it's English */}
                {selectedExample?.translation && (
                  <p
                    className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground italic"
                    dir="ltr"
                  >
                    {selectedExample.translation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Why Segmentation Matters */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Why Segmentation Matters</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">The Problem</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-destructive">✗</span>
                  <span><code className="text-xs bg-muted px-1 rounded">string.length</code> counts code units, not characters</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">✗</span>
                  <span><code className="text-xs bg-muted px-1 rounded">split(' ')</code> fails for CJK languages without spaces</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">✗</span>
                  <span><code className="text-xs bg-muted px-1 rounded">split('.')</code> breaks on abbreviations like "Dr."</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">✗</span>
                  <span>Emoji like 👨‍👩‍👧‍👦 are multiple code points but one character</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">The Solution</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span><code className="text-xs bg-muted px-1 rounded">Intl.Segmenter</code> uses Unicode rules</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Handles all languages including Chinese, Japanese, Thai</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Correctly identifies sentence boundaries</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Counts grapheme clusters as users perceive them</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Common Examples</h2>

          <div className="space-y-4">
            {activeTab === 'grapheme' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  These examples show how grapheme segmentation handles complex characters:
                </p>
                {[
                  { text: '👨‍👩‍👧‍👦', desc: 'Family emoji (7 code points, 1 grapheme)' },
                  { text: '🇺🇸', desc: 'Flag emoji (2 code points, 1 grapheme)' },
                  { text: 'café', desc: 'Accented character (5 code points, 4 graphemes with NFC)' },
                  { text: '한글', desc: 'Korean text (2 syllable blocks, 2 graphemes)' },
                ].map((example, idx) => {
                  const segmenter = new Intl.Segmenter(selectedLocale, { granularity: 'grapheme' })
                  const segs = Array.from(segmenter.segment(example.text))
                  return (
                    <div key={idx} className="p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{example.text}</span>
                        <span className="text-sm text-muted-foreground">→</span>
                        <div className="flex gap-1">
                          {segs.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded text-sm">
                              {s.segment}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {example.desc}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {activeTab === 'word' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Word segmentation is especially important for languages without spaces:
                </p>
                {[
                  { text: '日本語を話します', locale: 'ja', desc: 'Japanese (no spaces between words)' },
                  { text: '我喜欢学习中文', locale: 'zh', desc: 'Chinese (no spaces between words)' },
                  { text: 'ภาษาไทยไม่มีช่องว่าง', locale: 'th', desc: 'Thai (no spaces between words)' },
                ].map((example, idx) => {
                  try {
                    const segmenter = new Intl.Segmenter(example.locale, { granularity: 'word' })
                    const segs = Array.from(segmenter.segment(example.text)).filter(s => s.isWordLike)
                    return (
                      <div key={idx} className="p-3 bg-muted rounded-md">
                        <div className="flex items-start gap-4">
                          <span className="text-lg font-medium min-w-[180px]">{example.text}</span>
                          <span className="text-sm text-muted-foreground">→</span>
                          <div className="flex flex-wrap gap-1">
                            {segs.map((s, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded text-sm">
                                {s.segment}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                            {example.desc}
                          </span>
                        </div>
                      </div>
                    )
                  } catch {
                    return null
                  }
                })}
              </div>
            )}

            {activeTab === 'sentence' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sentence segmentation handles abbreviations and edge cases:
                </p>
                {[
                  { text: 'Dr. Smith went home. She was tired.', desc: 'Handles "Dr." abbreviation' },
                  { text: 'I paid $10.50. It was expensive!', desc: 'Handles decimal numbers' },
                  { text: 'What?! Are you sure? Yes, I am.', desc: 'Handles multiple punctuation' },
                ].map((example, idx) => {
                  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' })
                  const segs = Array.from(segmenter.segment(example.text))
                  return (
                    <div key={idx} className="p-3 bg-muted rounded-md">
                      <div className="mb-2 text-sm">{example.text}</div>
                      <div className="flex flex-wrap gap-1">
                        {segs.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-sm">
                            {s.segment.trim() || '(space)'}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{example.desc}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Using with JavaScript */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Using with JavaScript</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use the native <code className="px-1 py-0.5 bg-muted rounded text-xs">Intl.Segmenter</code> API to segment text in your code:
          </p>

          <div className="space-y-4">
            {/* Basic usage */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Basic Usage ({activeTab} segmentation):
              </div>
              <div className="relative">
                <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                  <pre className="whitespace-pre">{`const segmenter = new Intl.Segmenter('${selectedLocale}', {
  granularity: '${activeTab}'
})

const text = "${inputText.slice(0, 30)}${inputText.length > 30 ? '...' : ''}"
const segments = segmenter.segment(text)

for (const { segment, index${activeTab === 'word' ? ', isWordLike' : ''} } of segments) {
  console.log({ segment, index${activeTab === 'word' ? ', isWordLike' : ''} })
}`}</pre>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    `const segmenter = new Intl.Segmenter('${selectedLocale}', {\n  granularity: '${activeTab}'\n})\n\nconst text = "${inputText.slice(0, 30)}${inputText.length > 30 ? '...' : ''}"\nconst segments = segmenter.segment(text)\n\nfor (const { segment, index${activeTab === 'word' ? ', isWordLike' : ''} } of segments) {\n  console.log({ segment, index${activeTab === 'word' ? ', isWordLike' : ''} })\n}`,
                    'basic'
                  )}
                  className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedCode === 'basic' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Count words example */}
            {activeTab === 'word' && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Count words (excluding punctuation/spaces):
                </div>
                <div className="relative">
                  <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="whitespace-pre">{`function countWords(text, locale = '${selectedLocale}') {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' })
  return [...segmenter.segment(text)]
    .filter(s => s.isWordLike)
    .length
}

countWords("${inputText.slice(0, 40)}") // ${segmentStats.wordLike}`}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `function countWords(text, locale = '${selectedLocale}') {\n  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' })\n  return [...segmenter.segment(text)]\n    .filter(s => s.isWordLike)\n    .length\n}\n\ncountWords("${inputText.slice(0, 40)}") // ${segmentStats.wordLike}`,
                      'count'
                    )}
                    className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedCode === 'count' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Grapheme length example */}
            {activeTab === 'grapheme' && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Get true character count:
                </div>
                <div className="relative">
                  <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="whitespace-pre">{`function graphemeLength(text, locale = '${selectedLocale}') {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' })
  return [...segmenter.segment(text)].length
}

// Compare with string.length:
const emoji = '👨‍👩‍👧‍👦'
emoji.length           // 11 (code units)
graphemeLength(emoji)  // 1 (user-perceived character)`}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `function graphemeLength(text, locale = '${selectedLocale}') {\n  const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' })\n  return [...segmenter.segment(text)].length\n}\n\n// Compare with string.length:\nconst emoji = '👨‍👩‍👧‍👦'\nemoji.length           // 11 (code units)\ngraphemeLength(emoji)  // 1 (user-perceived character)`,
                      'grapheme'
                    )}
                    className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedCode === 'grapheme' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Split sentences example */}
            {activeTab === 'sentence' && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Split text into sentences:
                </div>
                <div className="relative">
                  <div className="font-mono text-sm bg-slate-950 text-green-400 px-4 py-3 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="whitespace-pre">{`function splitSentences(text, locale = '${selectedLocale}') {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'sentence' })
  return [...segmenter.segment(text)]
    .map(s => s.segment.trim())
    .filter(s => s.length > 0)
}

splitSentences("Dr. Smith went home. She was tired.")
// ["Dr. Smith went home.", "She was tired."]`}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `function splitSentences(text, locale = '${selectedLocale}') {\n  const segmenter = new Intl.Segmenter(locale, { granularity: 'sentence' })\n  return [...segmenter.segment(text)]\n    .map(s => s.segment.trim())\n    .filter(s => s.length > 0)\n}\n\nsplitSentences("Dr. Smith went home. She was tired.")\n// ["Dr. Smith went home.", "She was tired."]`,
                      'sentence'
                    )}
                    className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedCode === 'sentence' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Browser Support */}
        <div className="bg-muted rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Browser Support</h2>
          <p className="text-muted-foreground mb-3">
            <code className="px-1 py-0.5 bg-background rounded text-xs">Intl.Segmenter</code> is supported in all modern browsers:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>Chrome 87+ (October 2020)</li>
            <li>Edge 87+ (October 2020)</li>
            <li>Safari 14.1+ (April 2021)</li>
            <li>Firefox 125+ (April 2024)</li>
            <li>Node.js 16+</li>
          </ul>
          <p className="text-muted-foreground mt-3 text-sm">
            Over 94% of users globally have access to this API.
          </p>
        </div>
      </div>
    </div>
  )
}
