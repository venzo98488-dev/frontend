import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Clock,
  CheckCheck,
  Check,
  Search,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined'
    ? (window.location.protocol === 'https:' || window.location.hostname.includes('netlify.app')
        ? window.location.origin
        : `http://${window.location.hostname}:5000`)
    : 'http://localhost:5000');

const Chat = () => {
  const { user, token, isStaff } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Chat Socket server');
    });

    // Listen for incoming messages
    socketRef.current.on('new_message', (msg) => {
      if (selectedContact && msg.sender_id === selectedContact.id) {
        setMessages((prev) => [...prev, msg]);
        // Mark as read immediately
        socketRef.current.emit('mark_read', { sender_id: msg.sender_id });
      }

      // Update contacts list last message snippet
      setContacts((prev) =>
        prev.map((c) =>
          c.id === msg.sender_id
            ? {
                ...c,
                last_message: msg.message,
                last_message_time: msg.created_at,
                unread_count:
                  selectedContact?.id === c.id ? c.unread_count : (c.unread_count || 0) + 1
              }
            : c
        )
      );
    });

    // Listen for typing indicator
    socketRef.current.on('user_typing', ({ sender_id, isTyping: typingStatus }) => {
      if (selectedContact && sender_id === selectedContact.id) {
        setIsTyping(typingStatus);
      }
    });

    // Listen for messages read receipt
    socketRef.current.on('messages_read', ({ reader_id }) => {
      if (selectedContact && selectedContact.id === reader_id) {
        setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, selectedContact]);

  // Load Contacts list
  const fetchContacts = async () => {
    try {
      const res = await api.get('/chat/contacts');
      setContacts(res.data.contacts || []);
      // If none selected and contacts exist, select the first one on desktop
      if (!selectedContact && res.data.contacts?.length > 0 && window.innerWidth >= 768) {
        setSelectedContact(res.data.contacts[0]);
      }
    } catch (err) {
      console.error('Failed to load chat contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Load messages when selected contact changes
  useEffect(() => {
    if (!selectedContact) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await api.get(`/chat/messages/${selectedContact.id}`);
        setMessages(res.data.messages || []);

        // Clear unread count for this contact in local state
        setContacts((prev) =>
          prev.map((c) => (c.id === selectedContact.id ? { ...c, unread_count: 0 } : c))
        );

        // Tell socket we marked as read
        if (socketRef.current) {
          socketRef.current.emit('mark_read', { sender_id: selectedContact.id });
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedContact]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle typing debounce
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (socketRef.current && selectedContact) {
      socketRef.current.emit('typing', {
        receiver_id: selectedContact.id,
        isTyping: true
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && selectedContact) {
          socketRef.current.emit('typing', {
            receiver_id: selectedContact.id,
            isTyping: false
          });
        }
      }, 1500);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    if (socketRef.current) {
      socketRef.current.emit(
        'send_message',
        {
          receiver_id: selectedContact.id,
          message: messageText
        },
        (response) => {
          if (response?.success) {
            setMessages((prev) => [...prev, response.message]);
            // Update last message in contact list
            setContacts((prev) =>
              prev.map((c) =>
                c.id === selectedContact.id
                  ? {
                      ...c,
                      last_message: messageText,
                      last_message_time: new Date().toISOString()
                    }
                  : c
              )
            );
          }
        }
      );
    }
  };

  const sendQuickDoubt = (text) => {
    setNewMessage(text);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.department_name && c.department_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[78vh]">
        {/* Left Sidebar: Contacts */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
            selectedContact ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isStaff ? 'Student Inquiries' : 'Doubt Clearance Chat'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isStaff
                    ? 'Resolve student doubts in real-time'
                    : 'Direct communication with department faculty'}
                </p>
              </div>
            </div>

            {/* Search contacts */}
            <div className="mt-3 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isStaff ? 'Search student...' : 'Search faculty...'}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
            {loadingContacts ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-xs text-slate-400">Loading contacts...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No contacts found.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/90 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {contact.name}
                        </p>
                        {contact.last_message_time && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(contact.last_message_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {contact.department_name || contact.role}
                        </span>
                        {contact.unread_count > 0 && (
                          <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>

                      {contact.last_message && (
                        <p className="text-[11px] text-slate-500 truncate mt-1">
                          {contact.last_message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Chat Window */}
        <div className={`flex-grow flex flex-col bg-slate-50/30 ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
          {selectedContact ? (
            <>
              {/* Active Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="md:hidden p-1 text-slate-400 hover:text-slate-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedContact.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {selectedContact.role === 'STAFF' || selectedContact.role === 'ADMIN'
                        ? 'Department Faculty'
                        : 'Student'} • {selectedContact.department_name || 'Academic Member'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    <span>AI Auto-Clarity Active</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live WebSockets</span>
                  </span>
                </div>
              </div>

              {/* Message History Stream */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400 max-w-sm mx-auto">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">Start your conversation</p>
                    <p className="mt-1">
                      Type your doubt or question below. Messages are saved securely and delivered in real-time.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    const isAutoClarity = msg.message.includes('Automated Doubt Clarity Assistant') || msg.is_auto_clarity;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {isAutoClarity ? (
                          <div className="max-w-xl rounded-2xl text-xs sm:text-sm shadow-md border border-indigo-200/90 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 p-4 text-slate-800 leading-relaxed">
                            <div className="flex items-center space-x-2 pb-2.5 mb-2.5 border-b border-indigo-100 text-indigo-900 font-bold text-xs">
                              <span className="p-1 bg-indigo-600 text-white rounded-md shadow-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                              </span>
                              <span>Instant Academic Clarity Assistant</span>
                              <span className="text-[10px] font-normal text-slate-500 italic ml-auto">
                                on behalf of {selectedContact.name}
                              </span>
                            </div>
                            <div className="whitespace-pre-wrap text-slate-700 space-y-1">
                              {msg.message.replace(/🤖 \*\*Automated Doubt Clarity Assistant\*\*[\s\S]*?\n\n/, '')}
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-400 px-1">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isMe && (
                            <span>
                              {msg.is_read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-indigo-600 inline" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                    <span>{selectedContact.name} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Doubt Starters (for Students) */}
              {!isStaff && (
                <div className="px-4 py-2 bg-slate-100/60 border-t border-slate-200/60 flex items-center space-x-2 overflow-x-auto text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex-shrink-0 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Quick Doubts:</span>
                  </span>
                  <button
                    onClick={() => sendQuickDoubt('Can you explain ACID properties in DBMS and how transactions maintain consistency?')}
                    className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors"
                  >
                    💡 ACID Properties
                  </button>
                  <button
                    onClick={() => sendQuickDoubt('What is BCNF normalization and how does it eliminate update anomalies?')}
                    className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors"
                  >
                    💡 BCNF Normalization
                  </button>
                  <button
                    onClick={() => sendQuickDoubt('How do AVL tree rotations (LL, RR, LR, RL) rebalance binary search trees?')}
                    className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors"
                  >
                    💡 AVL Tree Rotations
                  </button>
                  <button
                    onClick={() => sendQuickDoubt('Can you explain Dijkstra shortest path algorithm vs Bellman-Ford?')}
                    className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors"
                  >
                    💡 Dijkstra Algorithm
                  </button>
                  <button
                    onClick={() => sendQuickDoubt('What are the four Coffman conditions for operating system deadlock?')}
                    className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors"
                  >
                    💡 Deadlock Conditions
                  </button>
                  <button
                    onClick={() => sendQuickDoubt('Hello Professor, I had a doubt regarding the Unit 3 exam syllabus.')}
                    className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors"
                  >
                    Exam Syllabus
                  </button>
                </div>
              )}

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder={`Type a message to ${selectedContact.name}...`}
                  className="flex-grow py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm disabled:opacity-40 transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center p-8 text-center text-slate-400">
              <div className="max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Real-Time Doubt Clearance
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select a faculty member or student from the left panel to begin an instant doubt clearance session.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
