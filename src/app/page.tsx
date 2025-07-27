'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Copy, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  AlertCircle, 
  Send,
  Sun,
  Moon,
  MessageSquare,
  Plus,
  Menu,
  Settings,
  User,
  Trash2,
  FileText
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  feedback?: 'like' | 'dislike' | null;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(systemPrefersDark);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Enhanced auto-scroll with smooth animation
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input after loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Generate conversation title from first message
  const generateConversationTitle = (firstMessage: string): string => {
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;
    return title || 'New Conversation';
  };

  // Save current conversation
  const saveCurrentConversation = useCallback(() => {
    if (messages.length === 0) return;

    const conversationTitle = messages.length > 0 
      ? generateConversationTitle(messages[0].text)
      : 'New Conversation';

    const conversation: Conversation = {
      id: currentConversationId || Date.now().toString(),
      title: conversationTitle,
      messages: messages,
      createdAt: conversations.find(c => c.id === currentConversationId)?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.id === conversation.id);
      const updated = existingIndex >= 0 
        ? prev.map((c, index) => index === existingIndex ? conversation : c)
        : [conversation, ...prev];
      
      // Keep only last 50 conversations
      const limited = updated.slice(0, 50);
      localStorage.setItem('chatConversations', JSON.stringify(limited));
      return limited;
    });

    if (!currentConversationId) {
      setCurrentConversationId(conversation.id);
    }
  }, [messages, currentConversationId, conversations]);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatConversations');
    const savedCurrentId = localStorage.getItem('currentConversationId');
    
    if (savedConversations) {
      try {
        const parsedConversations: Conversation[] = JSON.parse(savedConversations);
        const conversationsWithDates = parsedConversations.map(conv => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        setConversations(conversationsWithDates);
        
        // Load the most recent conversation if no specific ID saved
        if (savedCurrentId && conversationsWithDates.find(c => c.id === savedCurrentId)) {
          loadConversation(savedCurrentId, conversationsWithDates);
        } else if (conversationsWithDates.length > 0) {
          loadConversation(conversationsWithDates[0].id, conversationsWithDates);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }
  }, []);

  // Save current conversation when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentConversation();
      }, 1000); // Debounce saving
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, saveCurrentConversation]);

  // Save current conversation ID
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('currentConversationId', currentConversationId);
    }
  }, [currentConversationId]);

  const sendMessageToAPI = async (messageText: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.filter(msg => msg.status !== 'error'),
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        message: data.message,
        success: true,
      };

    } catch (error) {
      console.error('Error sending message:', error);
      return {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false,
      };
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    // Start new conversation if none exists
    if (!currentConversationId) {
      const newConversationId = Date.now().toString();
      setCurrentConversationId(newConversationId);
    }

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Update message status to sent
    setMessages(prev => prev.map(msg => 
      msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
    ));

    const result = await sendMessageToAPI(currentInput);
    setIsLoading(false);

    if (result.success) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.message,
        sender: 'assistant',
        timestamp: new Date(),
        status: 'sent',
        feedback: null,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } else {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `Sorry, I encountered an error: ${result.message}`,
        sender: 'assistant',
        timestamp: new Date(),
        status: 'error',
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const messageToRetry = messages[messageIndex];
    if (messageToRetry.sender !== 'assistant') return;

    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.sender !== 'user') return;

    setRetryingMessageId(messageId);
    setIsLoading(true);

    const result = await sendMessageToAPI(userMessage.text);
    
    setIsLoading(false);
    setRetryingMessageId(null);

    if (result.success) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: result.message, status: 'sent', timestamp: new Date() }
          : msg
      ));
    }
  };

  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
        : msg
    ));
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId('');
    setSidebarOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const loadConversation = (conversationId: string, conversationsList?: Conversation[]) => {
    const conversationsToSearch = conversationsList || conversations;
    const conversation = conversationsToSearch.find(c => c.id === conversationId);
    
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(conversationId);
      setSidebarOpen(false);
    }
  };

  const deleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== conversationId);
      localStorage.setItem('chatConversations', JSON.stringify(updated));
      return updated;
    });

    // If deleting current conversation, start new one
    if (conversationId === currentConversationId) {
      startNewConversation();
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // ChatGPT-style loading indicator
  const LoadingIndicator = () => (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-start space-x-4 py-6">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ChatGPT-style message component
  const MessageComponent = ({ message }: { message: Message }) => (
    <div className={`w-full ${message.sender === 'assistant' ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="flex items-start space-x-4 py-6 group">
          {/* Avatar */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
            {message.sender === 'user' ? (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 space-y-2">
            <div className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {message.text}
            </div>

            {/* Message actions */}
            {message.sender === 'assistant' && message.status !== 'error' && (
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleCopyMessage(message.text)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  title="Copy message"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFeedback(message.id, 'like')}
                  className={`p-1 rounded ${
                    message.feedback === 'like' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFeedback(message.id, 'dislike')}
                  className={`p-1 rounded ${
                    message.feedback === 'dislike' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="Bad response"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Retry button for error messages */}
            {message.sender === 'assistant' && message.status === 'error' && (
              <button
                onClick={() => handleRetryMessage(message.id)}
                disabled={retryingMessageId === message.id}
                className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${retryingMessageId === message.id ? 'animate-spin' : ''}`} />
                <span>{retryingMessageId === message.id ? 'Retrying...' : 'Retry'}</span>
              </button>
            )}
          </div>

          {/* Status indicator for user messages */}
          {message.sender === 'user' && (
            <div className="flex-shrink-0">
              {message.status === 'sending' && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              )}
              {message.status === 'sent' && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {message.status === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-black transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold">ChatBoart</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={startNewConversation}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 px-4 overflow-y-auto">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Recent</div>
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => loadConversation(conversation.id)}
                  className={`group flex items-center justify-between text-gray-300 text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    conversation.id === currentConversationId 
                      ? 'bg-gray-800' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 truncate pr-2">
                    <div className="truncate">{conversation.title}</div>
                    <div className="text-xs text-gray-500">
                      {conversation.messages.length} messages • {conversation.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <div className="text-gray-500 text-sm px-3 py-2">
                  No conversations yet
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-400"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-semibold">ChatBoart</h1>
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-500 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">How can I help you today?</h2>
                <div className="flex justify-center space-x-4 mt-6">
                  <Link 
                    href="/rfqs"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View RFQ Table
                  </Link>
                  <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center transition-colors">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((message) => (
                <MessageComponent key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto p-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Send a message..."
                disabled={isLoading}
                className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                rows={1}
                style={{ 
                  minHeight: '52px',
                  maxHeight: '200px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '52px';
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={inputText.trim() === '' || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              ChatBoart can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;