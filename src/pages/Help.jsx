import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HelpCircle,
  BookOpen,
  UploadCloud,
  CheckCircle,
  Search,
  Download,
  Bookmark,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Layers,
  FileText,
  Key,
  Laptop
} from 'lucide-react';

const Help = () => {
  const { isAuthenticated, isStaff, isStudent, user } = useAuth();
  const [activeTab, setActiveTab] = useState('workflow');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Register & Authenticate',
      role: 'Student / Staff',
      color: 'bg-blue-500',
      description: 'Create an account specifying your academic department and enrolled semester. Secure JWT token is issued automatically.',
      linkText: 'Go to Register',
      linkUrl: '/register'
    },
    {
      step: '02',
      title: 'Upload as a Student',
      role: 'Student',
      color: 'bg-indigo-500',
      description: 'Contribute lecture notes, question banks, or lab manuals (PDF, DOCX, PPTX, TXT up to 25MB). Uploaded items enter PENDING review.',
      linkText: 'My Contributions',
      linkUrl: '/student/contributions'
    },
    {
      step: '03',
      title: 'Faculty / Staff Approves',
      role: 'Staff Only',
      color: 'bg-amber-500',
      description: 'Faculty members inspect submissions in Verify Submissions queue, review syllabus compliance, and approve to PUBLISHED status with remarks.',
      linkText: 'Verify Submissions',
      linkUrl: '/staff/verify'
    },
    {
      step: '04',
      title: 'Shows in Campus Search',
      role: 'All Users',
      color: 'bg-emerald-500',
      description: 'Approved resources appear instantly in public search with full metadata (subject, uploader, department, semester tags).',
      linkText: 'Browse Resources',
      linkUrl: '/resources'
    },
    {
      step: '05',
      title: 'Download Study Materials',
      role: 'Student / Staff',
      color: 'bg-teal-500',
      description: 'Stream verified materials directly as attachments. System increments download counters and logs user download history.',
      linkText: 'Explore Notes',
      linkUrl: '/resources'
    },
    {
      step: '06',
      title: 'Bookmark for Quick Revision',
      role: 'Student',
      color: 'bg-purple-500',
      description: 'Save important exam preparation materials with one click into your personal Bookmarks collection.',
      linkText: 'Saved Bookmarks',
      linkUrl: '/student/bookmarks'
    },
    {
      step: '07',
      title: 'Request Missing Materials',
      role: 'Student',
      color: 'bg-rose-500',
      description: 'Submit academic resource requests for missing notes or previous-year solved papers. Staff can fulfill directly from their console.',
      linkText: 'Submit Request',
      linkUrl: '/student/requests'
    },
    {
      step: '08',
      title: 'Real-Time Doubt Clearance',
      role: 'Student + Faculty',
      color: 'bg-violet-600',
      description: 'Connect directly with department faculty via live WebSockets chat for instant academic guidance and doubt resolution.',
      linkText: 'Open Doubt Chat',
      linkUrl: '/chat'
    }
  ];

  const studentFeatures = [
    {
      title: 'AI Personalized Recommendations',
      icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
      text: 'Our AI engine recommends notes matching your registered department and semester, prioritized by peer download volume.'
    },
    {
      title: 'Parametric Course Search',
      icon: <Search className="w-5 h-5 text-indigo-600" />,
      text: 'Filter materials by department (AI&DS, CSE, IT), subject, semester (1-8), academic year, and document type.'
    },
    {
      title: 'Contribution Tracking',
      icon: <UploadCloud className="w-5 h-5 text-indigo-600" />,
      text: 'Track student contributions through PENDING, UNDER_REVIEW, and PUBLISHED states with direct reviewer feedback remarks.'
    },
    {
      title: 'Study Material Requests',
      icon: <HelpCircle className="w-5 h-5 text-indigo-600" />,
      text: 'Ask faculty for specific semester question banks, lab codes, or solved solutions and get notified upon completion.'
    }
  ];

  const staffFeatures = [
    {
      title: 'Contribution Verification Queue',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      text: 'Review student-uploaded materials, inspect file contents, and approve or reject with custom feedback remarks.'
    },
    {
      title: 'Direct Resource Management',
      icon: <Layers className="w-5 h-5 text-emerald-600" />,
      text: 'Upload official lecture presentations, edit document metadata, track download frequencies, and archive legacy files.'
    },
    {
      title: 'Student Requests Fulfillment',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      text: 'Manage pending academic requests from students across departments, updating statuses to COMPLETED or IN_PROGRESS.'
    },
    {
      title: 'Repository Analytics & Reports',
      icon: <Laptop className="w-5 h-5 text-emerald-600" />,
      text: 'Inspect department-level activity, top demanded study materials, and real-time student download audit logs.'
    }
  ];

  const faqs = [
    {
      q: 'What file formats and file sizes are supported for document upload?',
      a: 'The platform supports PDF (.pdf), Microsoft Word (.docx), PowerPoint presentations (.pptx), text files (.txt), and ZIP archives (.zip) up to 25MB per file.'
    },
    {
      q: 'Why is my contributed study material marked as "PENDING"?',
      a: 'To maintain high academic standards, all student uploads require verification by a departmental staff member. Once approved, the document status transitions to PUBLISHED and is instantly accessible campus-wide.'
    },
    {
      q: 'How does the AI Recommendation engine generate suggestions?',
      a: 'The engine analyzes your department, current academic semester, subjects in your curriculum, and cross-references them with peer downloads and bookmark patterns to surface the most relevant materials.'
    },
    {
      q: 'How does Real-Time Doubt Clearance work?',
      a: 'The Doubt Clearance portal uses WebSockets (Socket.io) with JWT authentication. Messages are delivered instantly between students and faculty, supported by typing indicators and persistence in MySQL.'
    },
    {
      q: 'Can faculty members upload resources directly without review?',
      a: 'Yes. Faculty and administrator accounts have elevated permissions and their uploaded materials are published directly to the repository.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-8 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Resource Hub • All-in-One Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            One Help Center for Everything
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Everything you need to master the platform: full step-by-step contribution workflows, student search guides, faculty verification consoles, and doubt clearance tools.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/resources"
              className="inline-flex items-center space-x-2 bg-white text-indigo-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-slate-100 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Explore Materials</span>
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow transition-colors border border-indigo-400/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask a Doubt in Chat</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto space-x-2">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`pb-4 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'workflow'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Complete Workflow (8 Steps)</span>
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`pb-4 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'student'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-4 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'staff'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Faculty & Staff Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`pb-4 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Demo Accounts & Shortcuts</span>
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-4 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'faq'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQ & Rules</span>
        </button>
      </div>

      {/* Tab 1: Workflow */}
      {activeTab === 'workflow' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              The Full Academic Lifecycle
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Follow the integrated process from initial student registration and upload to faculty verification, campus discovery, download, bookmarking, and doubt clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-8 h-8 rounded-lg ${item.color} text-white font-black text-xs flex items-center justify-center shadow-sm`}>
                      {item.step}
                    </span>
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {item.role}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>
                <Link
                  to={item.linkUrl}
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2 border-t border-slate-100"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Student Guide */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h2 className="text-base font-bold text-indigo-950 mb-1">
              Student Portal Capabilities
            </h2>
            <p className="text-xs text-indigo-800">
              Everything students need to accelerate coursework, exam preparation, and collaborative study.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {studentFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start space-x-3.5"
              >
                <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Recommended Student Workflow</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600">
              <li>
                <strong>Check Dashboard:</strong> Review AI-recommended notes matching your semester (e.g. Semester 3).
              </li>
              <li>
                <strong>Search Specific Topics:</strong> Filter by subject (e.g. DBMS, Data Structures) to download lecture copies.
              </li>
              <li>
                <strong>Save Bookmarks:</strong> Hit the bookmark icon on cards you need for upcoming mid-term tests.
              </li>
              <li>
                <strong>Contribute Back:</strong> Share handwritten notes or question banks to earn contributor status.
              </li>
              <li>
                <strong>Clear Doubts:</strong> Click Doubt Clearance to message the faculty member handling the subject.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 3: Staff Guide */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h2 className="text-base font-bold text-emerald-950 mb-1">
              Faculty & Staff Administration Guide
            </h2>
            <p className="text-xs text-emerald-800">
              Tools to maintain high quality learning resources and assist students across departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {staffFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start space-x-3.5"
              >
                <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verification Policy Checklist</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verify file is clean, readable, and belongs to approved college syllabus.</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ensure correct Department, Subject, and Academic Year metadata are assigned.</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Add constructive review remarks (visible in student's contribution record).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Demo Credentials & Shortcuts */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Credential Box */}
            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                  Demo Student Account
                </span>
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Alex Rivera</h3>
              <p className="text-xs text-slate-500 mb-4">Department of AI & Data Science (Semester 3)</p>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl text-xs font-mono mb-4 border border-slate-200">
                <div>
                  <span className="text-slate-400">Email: </span>
                  <strong className="text-slate-900">student@college.edu</strong>
                </div>
                <div>
                  <span className="text-slate-400">Password: </span>
                  <strong className="text-slate-900">Password@123</strong>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                <span>Login as Student</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Staff Credential Box */}
            <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                  Demo Faculty / Staff Account
                </span>
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Dr. Sarah Jenkins</h3>
              <p className="text-xs text-slate-500 mb-4">Senior Faculty, AI & Data Science Department</p>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl text-xs font-mono mb-4 border border-slate-200">
                <div>
                  <span className="text-slate-400">Email: </span>
                  <strong className="text-slate-900">staff@college.edu</strong>
                </div>
                <div>
                  <span className="text-slate-400">Password: </span>
                  <strong className="text-slate-900">Password@123</strong>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                <span>Login as Staff</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Page Jump Board */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              Quick Shortcuts to Platform Pages
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
              <Link to="/resources" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search Resources</span>
              </Link>
              <Link to="/chat" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Doubt Chat</span>
              </Link>
              <Link to="/student/contributions" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Materials</span>
              </Link>
              <Link to="/student/bookmarks" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <Bookmark className="w-3.5 h-3.5" />
                <span>My Bookmarks</span>
              </Link>
              <Link to="/staff/verify" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verify Queue</span>
              </Link>
              <Link to="/staff/requests" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Manage Requests</span>
              </Link>
              <Link to="/staff/reports" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <Laptop className="w-3.5 h-3.5" />
                <span>Usage Reports</span>
              </Link>
              <Link to="/profile" className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <Users className="w-3.5 h-3.5" />
                <span>Profile Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: FAQ Accordion */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Frequently Asked Questions & College Policies
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Common inquiries regarding contribution guidelines, review timeframes, file limits, and recommendations.
            </p>
          </div>

          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex justify-between items-center font-bold text-sm text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                )}
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Help;
