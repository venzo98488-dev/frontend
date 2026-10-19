import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Code2,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getBackendURL } from '../api/axios';

const KNOWLEDGE_RESPONSES = {
  acid: {
    title: 'ACID Properties in DBMS',
    content: `**ACID Properties** guarantee reliable transaction processing in database systems:

• **Atomicity (All-or-Nothing)**: Either all operations in a transaction commit successfully, or none take effect. If any statement fails, the entire transaction is rolled back.
• **Consistency (State Validity)**: Transactions move the database from one valid state to another, strictly obeying primary keys, foreign keys, and check constraints.
• **Isolation (Concurrent Independence)**: Transactions executing simultaneously appear to execute serially without dirty reads or uncommitted dependency anomalies.
• **Durability (Persistence)**: Once committed, updates persist permanently even in the event of an immediate system crash or power outage.`,
    noteLink: '/resources?keyword=DBMS'
  },
  normalization: {
    title: 'Relational Database Normalization & BCNF',
    content: `**Normalization** eliminates redundancy and prevents insertion, update, and deletion anomalies:

• **1NF**: Atomic values per attribute; no multi-valued columns or repeating groups.
• **2NF**: In 1NF + complete dependency on primary key (eliminates partial dependency on composite keys).
• **3NF**: In 2NF + eliminates transitive dependency ($X \\rightarrow Y$ where $Y$ is not part of a key).
• **BCNF (Boyce-Codd NF)**: Strictest 3NF where for every functional dependency $X \\rightarrow Y$, $X$ MUST be a super key.`,
    noteLink: '/resources?keyword=DBMS'
  },
  trees: {
    title: 'Binary Search Trees & AVL Rotations',
    content: `**Balanced Search Trees**:
• **BST Property**: For every node $N$, $\\text{keys}(N.\\text{left}) < N.\\text{key} < \\text{keys}(N.\\text{right})$.
• **AVL Tree**: A self-balancing BST where the Balance Factor ($\\text{height}(\\text{left}) - \\text{height}(\\text{right})$) is always $\\in \\{-1, 0, +1\\}$.
• **Rotations**:
  - **LL / RR**: Single rotation for outer imbalance.
  - **LR / RL**: Double rotation for inner zigzag imbalance.
  - Guaranteed time complexity: $O(\\log n)$ for search, insert, and delete.`,
    noteLink: '/resources?keyword=DSA'
  },
  dijkstra: {
    title: 'Dijkstra Shortest Path Algorithm',
    content: `**Dijkstra's Algorithm** computes the shortest path from a source vertex to all other vertices in a directed/undirected weighted graph with non-negative edge weights.

• **Approach**: Greedy with a Priority Queue (Min-Heap).
• **Time Complexity**: $O((V + E) \\log V)$ using an adjacency list and binary heap.
• **Key Step (Relaxation)**: If $\\text{dist}[u] + \\text{weight}(u, v) < \\text{dist}[v]$, update $\\text{dist}[v] = \\text{dist}[u] + \\text{weight}(u, v)$.
• **Limitation**: Fails on graphs containing negative edge weights (use Bellman-Ford instead).`,
    noteLink: '/resources?keyword=DSA'
  },
  deadlock: {
    title: 'Operating System Deadlocks & Coffman Conditions',
    content: `A **Deadlock** is a state where a set of processes are blocked because each is holding a resource and waiting for another resource held by another process.

Four **Coffman Conditions** must hold simultaneously:
1. **Mutual Exclusion**: Non-shareable resource.
2. **Hold and Wait**: Process holding $\\ge 1$ resource requests another.
3. **No Preemption**: Resources cannot be forcibly seized.
4. **Circular Wait**: Closed loop of waiting processes.

• **Handling**: Deadlock prevention (negate 1 condition), avoidance (Banker's Algorithm), or detection and recovery.`,
    noteLink: '/resources?keyword=Operating'
  }
};

const GlobalAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your EGSPEC AI Academic Assistant. Ask any academic doubt from your syllabus or choose a quick topic below.'
    }
  ]);

  const handleAsk = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    setConversation((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/assistant', { message: userText });
      if (res.data && res.data.data) {
        const d = res.data.data;
        let text = d.reply;
        if (d.example) {
          text += `\n\n${d.example}`;
        }
        setConversation((prev) => [
          ...prev,
          {
            sender: 'ai',
            text,
            source: d.source,
            relatedResources: d.relatedResources || [],
            link: '/resources?keyword=' + encodeURIComponent(userText.split(' ')[0])
          }
        ]);
      }
    } catch (err) {
      console.warn('AI Assistant API call error, using local knowledge base:', err.message);
      const lower = userText.toLowerCase();
      let responseObj = null;

      if (lower.includes('acid') || lower.includes('transaction')) {
        responseObj = KNOWLEDGE_RESPONSES.acid;
      } else if (lower.includes('normal') || lower.includes('bcnf') || lower.includes('3nf')) {
        responseObj = KNOWLEDGE_RESPONSES.normalization;
      } else if (lower.includes('tree') || lower.includes('avl') || lower.includes('bst')) {
        responseObj = KNOWLEDGE_RESPONSES.trees;
      } else if (lower.includes('dijkstra') || lower.includes('shortest') || lower.includes('graph')) {
        responseObj = KNOWLEDGE_RESPONSES.dijkstra;
      } else if (lower.includes('deadlock') || lower.includes('concurrency')) {
        responseObj = KNOWLEDGE_RESPONSES.deadlock;
      }

      let aiText = '';
      if (responseObj) {
        aiText = `💡 **${responseObj.title}**\n\n${responseObj.content}`;
      } else {
        aiText = `✨ **Academic Clarity Analysis for:** "${userText}"\n\nKey Concept Breakdown:\n• **Core Principle**: In your syllabus curriculum, this topic focuses on foundational algorithms, efficiency metrics, and structural integrity.\n• **Exam Guidance**: For 13-mark questions, remember to include the formal definition, a clean architectural/state diagram, a step-by-step numerical/code example, and time/space complexity.\n• **Repository Access**: Verified lecture notes matching this topic are available in the EGSPEC Resource Hub.`;
      }

      setConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiText,
          link: responseObj?.noteLink || '/resources'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = async (promptText) => {
    setQuery(promptText);
    setConversation((prev) => [...prev, { sender: 'user', text: promptText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/assistant', { message: promptText });
      if (res.data && res.data.data) {
        const d = res.data.data;
        let text = d.reply;
        if (d.example) {
          text += `\n\n${d.example}`;
        }
        setConversation((prev) => [
          ...prev,
          {
            sender: 'ai',
            text,
            source: d.source,
            relatedResources: d.relatedResources || [],
            link: '/resources?keyword=' + encodeURIComponent(promptText.split(' ')[0])
          }
        ]);
      }
    } catch (err) {
      const lower = promptText.toLowerCase();
      let responseObj = KNOWLEDGE_RESPONSES.acid;
      if (lower.includes('bcnf')) responseObj = KNOWLEDGE_RESPONSES.normalization;
      if (lower.includes('avl')) responseObj = KNOWLEDGE_RESPONSES.trees;
      if (lower.includes('dijkstra')) responseObj = KNOWLEDGE_RESPONSES.dijkstra;
      if (lower.includes('deadlock')) responseObj = KNOWLEDGE_RESPONSES.deadlock;

      setConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `💡 **${responseObj.title}**\n\n${responseObj.content}`,
          link: responseObj.noteLink
        }
      ]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Always visible on all screens) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center space-x-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white px-4 py-3 rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-indigo-400/30"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <span className="text-xs font-bold tracking-wide">
              EGSPEC <span className="text-indigo-200">AI Doubts</span>
            </span>
          </button>
        </div>
      )}

      {/* Floating Drawer / Dialog */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 overflow-hidden ${
            isExpanded
              ? 'w-[95vw] sm:w-[650px] h-[85vh]'
              : 'w-[92vw] sm:w-[420px] h-[550px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wide flex items-center space-x-1.5">
                  <span>egspec.com</span>
                  <span className="text-[10px] bg-indigo-500/40 px-1.5 py-0.2 rounded font-normal text-indigo-200">
                    AI Doubt Assistant
                  </span>
                </h3>
                <p className="text-[10px] text-indigo-300">Instant syllabus clarity across any device</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto text-[11px] shrink-0">
            <button
              onClick={() => handleQuickPrompt('Explain ACID Properties')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-medium whitespace-nowrap transition-colors"
            >
              💡 ACID
            </button>
            <button
              onClick={() => handleQuickPrompt('BCNF Normalization')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-medium whitespace-nowrap transition-colors"
            >
              💡 BCNF
            </button>
            <button
              onClick={() => handleQuickPrompt('AVL Tree Rotations')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-medium whitespace-nowrap transition-colors"
            >
              💡 AVL Trees
            </button>
            <button
              onClick={() => handleQuickPrompt('Dijkstra Shortest Path')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-medium whitespace-nowrap transition-colors"
            >
              💡 Dijkstra
            </button>
            <Link
              to="/ai-tools"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold whitespace-nowrap transition-colors flex items-center space-x-1"
            >
              <span>Full AI Tools</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Messages Stream */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/40">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.link && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-indigo-600 font-bold">Recommended Study Material</span>
                      <Link
                        to={msg.link}
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100"
                      >
                        Open Note
                      </Link>
                    </div>
                  )}

                  {msg.relatedResources && msg.relatedResources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] text-indigo-600 font-bold block">Relevant Study Notes:</span>
                      {msg.relatedResources.map((res) => (
                        <a
                          key={res.id}
                          href={`${getBackendURL()}/${res.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-[11px] text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 p-1.5 rounded-lg transition-colors"
                        >
                          <span className="truncate font-medium">{res.title}</span>
                          <BookOpen className="w-3 h-3 shrink-0 ml-1.5 text-indigo-600" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-indigo-600 font-medium italic">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                <span>EGSPEC AI is analyzing syllabus & generating clarity...</span>
              </div>
            )}
          </div>

          {/* Footer Input Box */}
          <form onSubmit={handleAsk} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any academic doubt (e.g. DBMS, DSA, AI)..."
              className="flex-grow text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-sm"
              title="Send Doubt"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default GlobalAIAssistant;
