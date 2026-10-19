import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Code2,
  FileCheck2,
  Zap,
  HelpCircle,
  Copy,
  Check,
  Smartphone,
  Globe,
  Share2,
  RefreshCw,
  Send,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getBackendURL } from '../api/axios';

const SUBJECT_LIST = [
  'Database Management Systems (DBMS)',
  'Data Structures & Algorithms (DSA)',
  'Operating Systems (OS)',
  'Computer Networks (CN)',
  'Artificial Intelligence & Machine Learning (AI/ML)',
  'Software Engineering & Cloud Computing',
  'Object Oriented Programming (Java/C++)'
];

const PRESET_DOUBTS = [
  {
    subject: 'Database Management Systems (DBMS)',
    prompt: 'Explain ACID properties with real-world banking transaction example',
    type: 'concept'
  },
  {
    subject: 'Data Structures & Algorithms (DSA)',
    prompt: 'How do AVL tree rotations work when inserting into right-heavy subtree?',
    type: 'concept'
  },
  {
    subject: 'Operating Systems (OS)',
    prompt: 'What are the 4 Coffman conditions required for deadlock to occur?',
    type: 'concept'
  },
  {
    subject: 'Computer Networks (CN)',
    prompt: 'Difference between TCP 3-way handshake and UDP connectionless model',
    type: 'concept'
  }
];

const AITools = () => {
  const [activeTab, setActiveTab] = useState('clarity'); // 'clarity', 'code', 'exam', 'cheatsheet'
  const [copied, setCopied] = useState(false);
  const [networkCopied, setNetworkCopied] = useState(false);

  // Tab 1: Clarity states
  const [claritySubject, setClaritySubject] = useState(SUBJECT_LIST[0]);
  const [clarityDepth, setClarityDepth] = useState('exam'); // 'simple', 'exam', 'deep'
  const [clarityQuery, setClarityQuery] = useState('');
  const [clarityLoading, setClarityLoading] = useState(false);
  const [clarityResult, setClarityResult] = useState(null);

  // Tab 2: Code Debugger states
  const [codeLang, setCodeLang] = useState('SQL');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeResult, setCodeResult] = useState(null);

  // Tab 3: Exam Prep states
  const [examSubject, setExamSubject] = useState(SUBJECT_LIST[0]);
  const [examUnit, setExamUnit] = useState('Unit 2: Core Architecture & Algorithms');
  const [examType, setExamType] = useState('13mark'); // '2mark', '13mark', 'numerical'
  const [examLoading, setExamLoading] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Tab 4: Cheat Sheet states
  const [sheetTopic, setSheetTopic] = useState('');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetResult, setSheetResult] = useState(null);

  // Engine status
  const [aiStatus, setAiStatus] = useState({
    activeEngine: 'Loading AI Engine...',
    llmConfigured: false,
    status: 'checking'
  });

  useEffect(() => {
    // Check AI Engine status
    api.get('/ai/status')
      .then((res) => {
        if (res.data) setAiStatus(res.data);
      })
      .catch((err) => {
        console.warn('AI status check failed:', err.message);
        setAiStatus({
          activeEngine: 'EGSPEC Academic Engine (Local)',
          llmConfigured: false,
          status: 'online'
        });
      });
  }, []);

  const networkUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const copyUrl = (text, setFunc) => {
    navigator.clipboard.writeText(text);
    setFunc(true);
    setTimeout(() => setFunc(false), 2000);
  };

  // --- Handlers ---
  const handleSolveClarity = async (e) => {
    if (e) e.preventDefault();
    if (!clarityQuery.trim()) return;

    setClarityLoading(true);
    setClarityResult(null);

    try {
      const res = await api.post('/ai/clarity', {
        subject: claritySubject,
        query: clarityQuery.trim(),
        depth: clarityDepth
      });

      if (res.data && res.data.data) {
        const d = res.data.data;
        setClarityResult({
          source: d.source,
          title: d.title,
          subject: d.subject,
          depth: d.depth,
          breakdown: d.breakdown,
          practicalExample: d.practicalExample,
          examPoints: d.examPoints,
          relatedResources: d.relatedResources || [],
          recommendedLink: '/resources?keyword=' + encodeURIComponent(claritySubject.split(' ')[0])
        });
      }
    } catch (err) {
      console.error('Clarity API Error:', err);
    } finally {
      setClarityLoading(false);
    }
  };

  const handleDebugCode = async (e) => {
    if (e) e.preventDefault();
    if (!codeInput.trim()) return;

    setCodeLoading(true);
    setCodeResult(null);

    try {
      const res = await api.post('/ai/debug', {
        language: codeLang,
        code: codeInput.trim(),
        errorMsg: codeError.trim()
      });

      if (res.data && res.data.data) {
        const d = res.data.data;
        setCodeResult({
          source: d.source,
          analysis: d.analysis,
          fixedCode: d.fixedCode,
          complexity: d.complexity
        });
      }
    } catch (err) {
      console.error('Code Debug API Error:', err);
    } finally {
      setCodeLoading(false);
    }
  };

  const handleGenerateExam = async (e) => {
    if (e) e.preventDefault();
    setExamLoading(true);
    setExamResult(null);

    try {
      const res = await api.post('/ai/exam-prep', {
        subject: examSubject,
        unit: examUnit,
        examType: examType
      });

      if (res.data && res.data.data) {
        const d = res.data.data;
        setExamResult({
          source: d.source,
          question: d.question,
          subject: d.subject,
          unit: d.unit,
          outline: d.outline,
          rubric: d.rubric
        });
      }
    } catch (err) {
      console.error('Exam Prep API Error:', err);
    } finally {
      setExamLoading(false);
    }
  };

  const handleGenerateSheet = async (e) => {
    if (e) e.preventDefault();
    if (!sheetTopic.trim()) return;

    setSheetLoading(true);
    setSheetResult(null);

    try {
      const res = await api.post('/ai/cheatsheet', {
        topic: sheetTopic.trim()
      });

      if (res.data && res.data.data) {
        const d = res.data.data;
        const cards = [
          {
            header: '⚡ 30-Second Core Definition',
            bullets: [d.summary]
          },
          {
            header: '📐 Key Formulas & Invariants',
            bullets: d.formulas || []
          },
          {
            header: '🎯 Common Exam Mistakes to Avoid',
            bullets: d.pitfalls || []
          }
        ];

        setSheetResult({
          title: `High-Yield Exam Cheat Sheet: ${sheetTopic.trim()}`,
          cards,
          comparison: d.comparison
        });
      }
    } catch (err) {
      console.error('Cheat Sheet API Error:', err);
    } finally {
      setSheetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>egspec.com • EGSPEC AI Academic Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                AI Academic Clarity & Doubt Solver
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
                Instant syllabus explanations, exam answer marking schemes, SQL & code debugging,
                and high-yield cheat sheets accessible from any mobile, tablet, or PC.
              </p>
            </div>

            {/* Cross-Device Connection Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col space-y-2 min-w-[260px]">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
                <span className="flex items-center space-x-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Open on Any Device</span>
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                Connect your phone to the college Wi-Fi and open:
              </p>
              <div className="flex items-center space-x-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-emerald-300 justify-between">
                <span className="truncate">{networkUrl}</span>
                <button
                  onClick={() => copyUrl(networkUrl, setNetworkCopied)}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy LAN Link"
                >
                  {networkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[10px] text-indigo-300 flex items-center justify-between pt-1">
                <span>Domain: <strong className="text-white">egspec.com</strong></span>
                <Link to="/resources" className="text-indigo-200 hover:text-white underline">Browse Notes</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('clarity')}
            className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'clarity'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1. Concept & Doubt Solver</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Code & Query Debugger</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'exam'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>3. Exam Prep & Rubric</span>
          </button>

          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'cheatsheet'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>4. Quick Revision Sheet</span>
          </button>
        </div>

        {/* Tab 1: Concept & Doubt Solver */}
        {activeTab === 'clarity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Ask Academic Doubt</span>
                </h2>

                <form onSubmit={handleSolveClarity} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={claritySubject}
                      onChange={(e) => setClaritySubject(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {SUBJECT_LIST.map((subj) => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Explanation Format
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'simple', label: 'Simple (EL5)' },
                        { id: 'exam', label: '13-Mark Model' },
                        { id: 'deep', label: 'Deep Technical' }
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setClarityDepth(d.id)}
                          className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-all ${
                            clarityDepth === d.id
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Doubt or Topic
                    </label>
                    <textarea
                      rows={4}
                      value={clarityQuery}
                      onChange={(e) => setClarityQuery(e.target.value)}
                      placeholder="Type your question e.g., How does Dijkstra algorithm work with min-heap? Or explain ACID properties..."
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!clarityQuery.trim() || clarityLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all"
                  >
                    {clarityLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating EGSPEC Clarity...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Solve Doubt Instantly</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Preset Chips */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Popular Exam Doubts
                </span>
                <div className="space-y-1.5">
                  {PRESET_DOUBTS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setClaritySubject(preset.subject);
                        setClarityQuery(preset.prompt);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 border border-transparent hover:border-indigo-100 text-xs text-slate-700 transition-colors flex items-center space-x-2"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{preset.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output View */}
            <div className="lg:col-span-7">
              {clarityResult ? (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {clarityResult.subject}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                          clarityResult.source?.includes('gemini')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          <span>{clarityResult.source?.includes('gemini') ? 'Gemini 3.8 Flash AI' : 'EGSPEC Academic Engine'}</span>
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                        {clarityResult.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => copyUrl(clarityResult.breakdown, setCopied)}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Copy Answer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Core Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Concept Clarity Breakdown
                    </h4>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
                      {clarityResult.breakdown}
                    </div>
                  </div>

                  {/* Real World / Code Example */}
                  {clarityResult.practicalExample && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Real-World & Numerical Example
                      </h4>
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-amber-50/60 p-4 rounded-xl border border-amber-200/50">
                        {clarityResult.practicalExample}
                      </div>
                    </div>
                  )}

                  {/* Exam Presentation Rubric */}
                  {clarityResult.examPoints && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Model Exam Strategy (13-Mark Distribution)
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {clarityResult.examPoints.map((pt, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verified Repository Resources from Database */}
                  {clarityResult.relatedResources && clarityResult.relatedResources.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Verified Study Materials in College Repository
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {clarityResult.relatedResources.map((res) => (
                          <a
                            key={res.id}
                            href={`${getBackendURL()}/${res.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900 transition-colors"
                          >
                            <div className="truncate pr-2">
                              <span className="font-semibold block truncate">{res.title}</span>
                              <span className="text-[10px] text-indigo-600 font-medium">{res.resource_type} • {res.subject_name}</span>
                            </div>
                            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resource Recommendation & Live Doubt Chat Link */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Link
                      to={clarityResult.recommendedLink}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Open Verified Notes for this Topic</span>
                    </Link>

                    <Link
                      to="/chat"
                      className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition-colors shadow-sm text-center"
                    >
                      Connect in Doubt Chat
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Ask any doubt from your syllabus
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Select your subject and enter any concept or question. EGSPEC AI will formulate a
                    structured college-level explanation with exam presentation tips.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Code & Query Debugger */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Submit Code or SQL Query</span>
                </h2>

                <form onSubmit={handleDebugCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Language / Tech
                    </label>
                    <select
                      value={codeLang}
                      onChange={(e) => setCodeLang(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="SQL">SQL (MySQL / Oracle)</option>
                      <option value="Python">Python 3</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                      <option value="JavaScript">JavaScript</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Paste Code Snippet
                    </label>
                    <textarea
                      rows={6}
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder={
                        codeLang === 'SQL'
                          ? 'SELECT * FROM users WHERE id IN (SELECT uploaded_by FROM resources);'
                          : 'def calculate_sum(nums):\n    total = 0\n    for i in nums: total += i\n    return total'
                      }
                      className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Observed Error or Goal (Optional)
                    </label>
                    <input
                      type="text"
                      value={codeError}
                      onChange={(e) => setCodeError(e.target.value)}
                      placeholder="e.g. Slow performance, syntax error at line 3, or NullPointerException"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!codeInput.trim() || codeLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all"
                  >
                    {codeLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Debugging Code...</span>
                      </>
                    ) : (
                      <>
                        <Code2 className="w-4 h-4" />
                        <span>Analyze & Fix Code</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7">
              {codeResult ? (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {codeLang} Fixed & Optimized
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                        Analysis & Correction Report
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {codeResult.complexity}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Diagnosis
                    </h4>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {codeResult.analysis}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Corrected Code
                      </h4>
                      <button
                        onClick={() => copyUrl(codeResult.fixedCode, setCopied)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                      {codeResult.fixedCode}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Code2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Paste your SQL Query or Code
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Detect syntax bugs, performance bottlenecks, and get optimized code with time/space complexities.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Exam Prep & Rubric */}
        {activeTab === 'exam' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  <span>Exam Question & Answer Builder</span>
                </h2>

                <form onSubmit={handleGenerateExam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {SUBJECT_LIST.map((subj) => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Unit or Topic Module
                    </label>
                    <input
                      type="text"
                      value={examUnit}
                      onChange={(e) => setExamUnit(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Mark Weightage
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: '2mark', label: '2-Mark Short Question' },
                        { id: '13mark', label: '13-Mark Long Essay' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setExamType(t.id)}
                          className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-all ${
                            examType === t.id
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={examLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all"
                  >
                    {examLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating Exam Rubric...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="w-4 h-4" />
                        <span>Generate Question & Model Answer</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7">
              {examResult ? (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {examResult.subject} • {examResult.unit}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-2">
                      {examResult.question}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Model Answer Outline & Key Points
                    </h4>
                    <div className="space-y-2">
                      {examResult.outline.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="font-bold text-indigo-600 mt-0.5">{idx + 1}.</span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Official Evaluator Scoring Rubric
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-bold">
                          <tr>
                            <th className="py-2.5 px-3 text-left">Grading Component</th>
                            <th className="py-2.5 px-3 text-right">Awarded Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {examResult.rubric.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 text-slate-700">{r.item}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-indigo-600">{r.marks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileCheck2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Prepare with University Marking Schemes
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Generate expected university questions along with point-by-point model answers
                    and exact marks distribution for scoring maximum CGPA.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Quick Revision Sheet */}
        {activeTab === 'cheatsheet' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>High-Yield Cheat Sheet Builder</span>
                </h2>

                <form onSubmit={handleGenerateSheet} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Topic or Concept Name
                    </label>
                    <input
                      type="text"
                      value={sheetTopic}
                      onChange={(e) => setSheetTopic(e.target.value)}
                      placeholder="e.g. BCNF vs 3NF, Dijkstra Algorithm, CPU Scheduling"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {['BCNF Normalization', 'Dijkstra vs Bellman-Ford', 'Virtual Memory & Paging', 'SQL Indexing B+ Trees'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSheetTopic(tag)}
                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-700 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={!sheetTopic.trim() || sheetLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all"
                  >
                    {sheetLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating Cheat Sheet...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Generate Revision Card</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7">
              {sheetResult ? (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-900">
                      {sheetResult.title}
                    </h3>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      Quick Revision
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {sheetResult.cards.map((card, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {card.header}
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {card.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start space-x-2">
                              <span className="text-indigo-600 font-bold">•</span>
                              <span className="leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    High-Yield 5-Minute Exam Revision
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Get condensed summaries, formulas, and common pitfalls right before entering the exam hall.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITools;
