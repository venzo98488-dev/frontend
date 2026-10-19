import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Award,
  Zap,
  ArrowRight,
  TrendingUp,
  Brain,
  Search
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Comprehensive high-yield academic flashcards categorized by subject
const ACADEMIC_FLASHCARDS = [
  // DBMS
  {
    id: 'dbms-1',
    subject: 'Database Management Systems',
    category: 'DBMS',
    difficulty: 'Medium',
    question: 'What are the ACID properties in database transaction management?',
    answer: 'ACID ensures reliable transaction processing in database engines:\n\n• Atomicity: Entire transaction completes or none occurs ("all-or-nothing").\n• Consistency: Database moves from one valid state to another, upholding all constraints.\n• Isolation: Concurrent transactions execute without interfering with one another.\n• Durability: Once committed, updates persist even across system crashes.',
    examTip: 'University 13-Mark Tip: Always draw the Transaction State Transition Diagram (Active -> Partially Committed -> Committed / Failed -> Aborted).',
    formula: 'Strict 2PL prevents cascading rollbacks; WAL (Write-Ahead Logging) ensures Durability.'
  },
  {
    id: 'dbms-2',
    subject: 'Database Management Systems',
    category: 'DBMS',
    difficulty: 'Hard',
    question: 'What is the exact mathematical definition of Boyce-Codd Normal Form (BCNF)?',
    answer: 'A relation R is in BCNF if and only if for every non-trivial functional dependency X -> Y, X is a superkey of R.\n\nBCNF is stricter than 3NF because 3NF allows Y to be a prime attribute when X is not a superkey, whereas BCNF strictly eliminates all redundancies caused by functional dependencies.',
    examTip: 'Remember: Every BCNF decomposition is lossless-join, but dependency preservation is NOT always guaranteed (unlike 3NF).',
    formula: 'Condition: ∀ (X → Y) non-trivial ⇒ X is a Superkey.'
  },
  {
    id: 'dbms-3',
    subject: 'Database Management Systems',
    category: 'DBMS',
    difficulty: 'Medium',
    question: 'Why are B+ Trees preferred over B-Trees for database file indexing?',
    answer: '1. In B+ Trees, data pointers/records are stored ONLY in leaf nodes; internal nodes only store navigation keys, allowing higher fanout and fewer disk I/O operations.\n2. Leaf nodes are linked sequentially as a doubly linked list, enabling fast range queries without tree traversals.\n3. Search time is consistent because all leaf nodes sit at the exact same depth.',
    examTip: 'Examiners look for the linked list pointer diagram between leaf nodes and calculation of tree height h ≤ ⌈log_⌈m/2⌉ (N)⌉.',
    formula: 'Disk Block Factor (Fanout): B = ⌊BlockSize / (KeySize + PointerSize)⌋'
  },

  // DSA
  {
    id: 'dsa-1',
    subject: 'Data Structures & Algorithms',
    category: 'DSA',
    difficulty: 'Medium',
    question: 'How does AVL Tree self-balancing work during insertion and deletion?',
    answer: 'An AVL tree maintains a balance factor (BF) for every node: BF = height(left_subtree) - height(right_subtree), where BF ∈ {-1, 0, +1}.\n\nWhen |BF| > 1, balance is restored via one of four rotations:\n• Left-Left (LL) -> Single Right Rotation\n• Right-Right (RR) -> Single Left Rotation\n• Left-Right (LR) -> Left Rotate child, then Right Rotate node\n• Right-Left (RL) -> Right Rotate child, then Left Rotate node.',
    examTip: 'Guaranteed worst-case lookup, insert, and delete time complexity is strictly O(log N).',
    formula: 'Max Height: h < 1.44 log₂(N + 2) - 0.328'
  },
  {
    id: 'dsa-2',
    subject: 'Data Structures & Algorithms',
    category: 'DSA',
    difficulty: 'Hard',
    question: 'What is the working principle and limitation of Dijkstra\'s Shortest Path Algorithm?',
    answer: 'Dijkstra finds the shortest path from a single source to all vertices in a weighted graph with NON-NEGATIVE edge weights using a Greedy approach with a Priority Queue (Min-Heap).\n\nIt repeatedly relaxes edges from the closest unvisited vertex until all vertices are settled.\n\nLimitation: It fails on graphs with negative-weight edges because the greedy choice assumes visited shortest paths cannot be improved.',
    examTip: 'For graphs with negative edges, state that Bellman-Ford algorithm (O(V·E)) or Floyd-Warshall (O(V³)) must be used.',
    formula: 'Time Complexity: O((V + E) log V) with Min-Heap, Space: O(V)'
  },
  {
    id: 'dsa-3',
    subject: 'Data Structures & Algorithms',
    category: 'DSA',
    difficulty: 'Easy',
    question: 'Compare QuickSort and MergeSort in terms of Time, Space, and Stability.',
    answer: '• QuickSort: Divide-and-Conquer; Average Time: O(N log N), Worst Time: O(N²) (sorted input with bad pivot); In-place Space: O(log N) auxiliary; NOT stable by default.\n\n• MergeSort: Divide-and-Conquer; Time: O(N log N) in ALL cases (Best, Avg, Worst); Auxiliary Space: O(N); STABLE sorting algorithm (preserves original order of duplicates).',
    examTip: 'Use MergeSort for linked lists (no random access required) and external sorting of large disk files.',
    formula: 'Recurrence: MergeSort T(n) = 2T(n/2) + O(n) | QuickSort T(n) = T(k) + T(n-k-1) + O(n)'
  },

  // Operating Systems
  {
    id: 'os-1',
    subject: 'Operating Systems',
    category: 'OS',
    difficulty: 'Medium',
    question: 'What are the 4 Coffman conditions required for a Deadlock to occur?',
    answer: 'All four conditions must hold simultaneously for a deadlock to persist:\n\n1. Mutual Exclusion: At least one resource must be non-shareable.\n2. Hold and Wait: A process holds resources while requesting new ones.\n3. No Preemption: Resources cannot be forcibly taken from a holding process.\n4. Circular Wait: A closed loop of processes exists where each waits for a resource held by the next.',
    examTip: 'Deadlock Prevention works by invalidating at least one of these 4 conditions at design time.',
    formula: 'Resource Allocation Graph (RAG): Cycle is a necessary and sufficient condition if single-instance.'
  },
  {
    id: 'os-2',
    subject: 'Operating Systems',
    category: 'OS',
    difficulty: 'Hard',
    question: 'What is Thrashing in Virtual Memory, and how is it resolved?',
    answer: 'Thrashing occurs when a computer is spending more time swapping pages into and out of disk (paging) than executing actual program instructions.\n\nCauses:\n• Over-allocation of multiprogramming degree.\n• Insufficient physical RAM frames for the combined working sets.\n\nResolution:\n• Decrease degree of multiprogramming.\n• Working Set Strategy: Allocate each process enough frames to hold its working set W(t, Δ).',
    examTip: 'Always draw the graph of CPU Utilization vs Degree of Multiprogramming showing the sharp drop-off.',
    formula: 'Page Fault Frequency (PFF): Maintain page fault rate between upper (P_high) and lower (P_low) bounds.'
  },

  // Computer Networks
  {
    id: 'cn-1',
    subject: 'Computer Networks',
    category: 'CN',
    difficulty: 'Medium',
    question: 'Describe the TCP 3-Way Handshake connection establishment process.',
    answer: 'Step 1 (SYN): Client sends SYN segment to Server with initial sequence number seq = x.\nStep 2 (SYN-ACK): Server responds with SYN bit set, seq = y, and ACK bit set with ack = x + 1.\nStep 3 (ACK): Client acknowledges with ACK bit set and ack = y + 1. Connection is now ESTABLISHED.',
    examTip: 'Viva Question: Why 3 steps instead of 2? To prevent delayed duplicate packets from causing phantom sessions.',
    formula: 'Sequence numbering prevents replay attacks; Window Size field dictates flow control.'
  },
  {
    id: 'cn-2',
    subject: 'Computer Networks',
    category: 'CN',
    difficulty: 'Easy',
    question: 'What is the difference between TCP and UDP transport protocols?',
    answer: '• TCP (Transmission Control Protocol): Connection-oriented, reliable, guarantees in-order delivery, flow control (Sliding Window), congestion control (AIMD). Used by HTTP/HTTPS, SSH, FTP, SMTP.\n\n• UDP (User Datagram Protocol): Connectionless, unreliable (best-effort), no packet retransmission, lightweight header (8 bytes vs 20 bytes). Used by DNS, VoIP, Video Streaming, Gaming.',
    examTip: 'Header size comparison is worth 2 marks: UDP header is 8 bytes; minimum TCP header is 20 bytes.',
    formula: 'TCP Flow Control equation: SendWindow ≤ min(CongestionWindow, ReceiverWindow)'
  },

  // AI & Machine Learning
  {
    id: 'aiml-1',
    subject: 'Artificial Intelligence & Machine Learning',
    category: 'AI & ML',
    difficulty: 'Medium',
    question: 'What is the Bias-Variance tradeoff in Machine Learning models?',
    answer: '• High Bias (Underfitting): The model is overly simplistic and fails to capture underlying patterns, leading to high training error and test error (e.g. fitting linear regression on non-linear data).\n\n• High Variance (Overfitting): The model is overly complex and memorizes noise in training data, giving low training error but high test error.\n\nGoal: Find the sweet spot that minimizes Total Expected Error = Bias² + Variance + Irreducible Error.',
    examTip: 'Mention regularization methods: L1 (Lasso - feature selection) and L2 (Ridge - weight shrinkage).',
    formula: 'MSE = Bias(θ̂)² + Var(θ̂) + σ²'
  }
];

const CATEGORIES = ['All Topics', 'DBMS', 'DSA', 'OS', 'CN', 'AI & ML'];

const Flashcards = () => {
  const { success, info } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState(ACADEMIC_FLASHCARDS);
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'quiz'

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('egspec_flashcard_mastered');
      if (saved) {
        setMasteredIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter cards on category change
  useEffect(() => {
    let filtered = ACADEMIC_FLASHCARDS;
    if (selectedCategory !== 'All Topics') {
      filtered = ACADEMIC_FLASHCARDS.filter((c) => c.category === selectedCategory);
    }
    setCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory]);

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (activeTab !== 'flashcards') return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cards.length, currentIndex]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    info('Flashcard deck shuffled!');
  };

  const toggleMastered = (cardId) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
        success('Marked as Mastered! Keep up the momentum.');
      }
      try {
        localStorage.setItem('egspec_flashcard_mastered', JSON.stringify([...next]));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Generate 5-question multiple choice quiz
  const startQuiz = () => {
    const pool = selectedCategory === 'All Topics'
      ? ACADEMIC_FLASHCARDS
      : ACADEMIC_FLASHCARDS.filter((c) => c.category === selectedCategory);

    const questions = pool.slice(0, 5).map((item) => {
      // create plausible options
      const correct = item.formula || item.answer.slice(0, 100) + '...';
      const distractors = [
        'Condition is evaluated strictly in linear O(N) runtime regardless of depth.',
        'Requires all prime attributes to transitively depend upon secondary candidate keys.',
        'Assumes equal disk block distribution without needing tree height balancing.'
      ];
      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

      return {
        id: item.id,
        question: item.question,
        subject: item.subject,
        options,
        correctIndex: options.indexOf(correct),
        explanation: item.answer
      };
    });

    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCompleted(false);
    setActiveTab('quiz');
  };

  const handleSelectQuizOption = (index) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === quizQuestions[quizIndex].correctIndex) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const currentCard = cards[currentIndex] || cards[0];
  const isCurrentMastered = currentCard ? masteredIds.has(currentCard.id) : false;
  const masteryPercentage = cards.length > 0
    ? Math.round((cards.filter((c) => masteredIds.has(c.id)).length / cards.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Active Recall Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Flashcards & Exam Mastery
          </h1>
          <p className="mt-2 text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Master university high-yield questions, formulas, and viva concepts through spaced repetition and instant self-evaluation.
          </p>
        </div>

        {/* Tab Switcher & Quick Action */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'flashcards'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Flashcards</span>
            </button>
            <button
              onClick={startQuiz}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'quiz'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Take Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Mastery Meter */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Deck Mastery</span>
            <span className="text-xs font-extrabold text-indigo-600">{masteryPercentage}% Complete</span>
          </div>
          <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${masteryPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'flashcards' ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Card <strong className="text-slate-800">{currentIndex + 1}</strong> of{' '}
              <strong className="text-slate-800">{cards.length}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShuffle}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                title="Shuffle Flashcard Deck"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Flip Card</span>
              </button>
            </div>
          </div>

          {/* Interactive 3D Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none min-h-[340px] perspective-1000"
          >
            <div
              className={`w-full min-h-[340px] rounded-3xl p-6 sm:p-10 transition-all duration-300 shadow-lg border relative flex flex-col justify-between ${
                isFlipped
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      isFlipped
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {currentCard.category}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      currentCard.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentCard.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {currentCard.difficulty}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {isCurrentMastered && (
                    <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mastered</span>
                    </span>
                  )}
                  <span className={`text-[11px] font-medium ${isFlipped ? 'text-slate-400' : 'text-slate-400'}`}>
                    {isFlipped ? 'Answer / Solution' : 'Question Prompt'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="my-6">
                {!isFlipped ? (
                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
                      {currentCard.subject}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug">
                      {currentCard.question}
                    </h2>
                    <p className="text-xs text-slate-400 italic">
                      Click anywhere on the card or press Spacebar to reveal answer & university exam rubric...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed animate-in fade-in duration-200">
                    <p className="whitespace-pre-line">{currentCard.answer}</p>
                    {currentCard.examTip && (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                        {currentCard.examTip}
                      </div>
                    )}
                    {currentCard.formula && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-200 text-xs font-mono">
                        Key Formulation: {currentCard.formula}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100/10 text-xs">
                <span className={isFlipped ? 'text-slate-400' : 'text-slate-400'}>
                  Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">Space</kbd> to flip • <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">→</kbd> to navigate
                </span>

                <span className={`font-semibold ${isFlipped ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {isFlipped ? 'Click to flip back' : 'Click to reveal'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Assessment & Navigation Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastered(currentCard.id);
                }}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                  isCurrentMastered
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${isCurrentMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{isCurrentMastered ? 'Mastered in Deck' : 'Mark as Mastered'}</span>
              </button>

              <Link
                to={`/resources?keyword=${encodeURIComponent(currentCard.category)}`}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-600 border border-slate-300 transition-colors flex items-center space-x-1"
                title="Search matching notes in repository"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Find Notes</span>
              </Link>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrev}
                className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-xs"
                title="Previous Card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center space-x-1.5"
              >
                <span>Next Card</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Mode */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
          {!quizCompleted ? (
            quizQuestions.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Question {quizIndex + 1} of {quizQuestions.length}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                      {quizQuestions[quizIndex].question}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600">Score: {quizScore}</span>
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {quizQuestions[quizIndex].options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === quizQuestions[quizIndex].correctIndex;
                    let btnClass = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';

                    if (showExplanation) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                      } else if (isSelected) {
                        btnClass = 'bg-rose-50 border-rose-500 text-rose-900';
                      }
                    } else if (isSelected) {
                      btnClass = 'bg-indigo-50 border-indigo-500 text-indigo-900';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showExplanation}
                        onClick={() => handleSelectQuizOption(idx)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-start space-x-3 ${btnClass}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Banner */}
                {showExplanation && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1.5 animate-in fade-in">
                    <span className="font-bold block uppercase tracking-wider text-[10px] text-indigo-700">
                      Syllabus Explanation & Concept
                    </span>
                    <p className="leading-relaxed whitespace-pre-line">
                      {quizQuestions[quizIndex].explanation}
                    </p>
                  </div>
                )}

                {/* Bottom Quiz Control */}
                <div className="flex justify-end pt-2">
                  <button
                    disabled={selectedAnswer === null}
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <span>{quizIndex + 1 === quizQuestions.length ? 'View Final Results' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Quiz Completed Score Summary */
            <div className="text-center py-8 space-y-5 max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Quiz Completed!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  You scored <strong className="text-indigo-600 text-base">{quizScore}</strong> out of{' '}
                  <strong>{quizQuestions.length}</strong> (
                  {Math.round((quizScore / quizQuestions.length) * 100)}%)
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                {quizScore === quizQuestions.length ? (
                  <span className="text-emerald-700 font-bold">
                    🌟 Outstanding Performance! You have mastered these core concepts.
                  </span>
                ) : quizScore >= 3 ? (
                  <span className="text-indigo-700 font-semibold">
                    👍 Solid foundation! Review the flashcards to lock in a top university grade.
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    💡 Good practice attempt! Explore the verified notes in the repository for detailed clarity.
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  onClick={startQuiz}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                >
                  Return to Flashcards
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
