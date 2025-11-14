import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CodeBlock } from "./CodeBlock";
import { toast } from "sonner";

export function ChatInterface() {
  const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.ai.getConversations) || [];
  const messages = useQuery(
    api.ai.getMessages,
    selectedConversation ? { conversationId: selectedConversation } : "skip"
  ) || [];

  const createConversation = useMutation(api.ai.createConversation);
  const generateResponse = useAction(api.ai.generateAIResponse);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = async () => {
    try {
      const title = `New Chat ${new Date().toLocaleDateString()}`;
      const conversationId = await createConversation({ title });
      setSelectedConversation(conversationId);
      toast.success("New conversation started!");
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await generateResponse({
        conversationId: selectedConversation,
        userMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (content: string, role: "user" | "assistant") => {
    if (role === "assistant") {
      // Check if the message contains code blocks
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const parts: Array<{
        type: "text" | "code";
        content: string;
        language?: string;
      }> = [];
      let lastIndex = 0;
      let match;

      while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: content.slice(lastIndex, match.index),
          });
        }

        // Add code block
        parts.push({
          type: "code",
          language: match[1] || "javascript",
          content: match[2].trim(),
        });

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < content.length) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex),
        });
      }

      return (
        <div className="space-y-3">
          {parts.map((part, index) => (
            <div key={index}>
              {part.type === "text" ? (
                <div className="whitespace-pre-wrap leading-relaxed">{part.content}</div>
              ) : (
                <CodeBlock language={part.language || "javascript"} code={part.content} />
              )}
            </div>
          ))}
        </div>
      );
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col shadow-2xl transition-all duration-300">
        <div className="p-6 border-b border-white/20">
          <button
            onClick={handleNewConversation}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold active:scale-95"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </div>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 mt-8 px-4">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedConversation(conv._id)}
                className={`w-full p-4 text-left rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${
                  selectedConversation === conv._id
                    ? "bg-blue-500/20 border-l-4 border-l-blue-500 shadow-lg"
                    : "hover:bg-white/20 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 truncate text-sm font-medium text-gray-700">{conv.title}</div>
                  {selectedConversation === conv._id && (
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(conv._creationTime).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-white/10 backdrop-blur-sm">
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-gray-600 mt-12 animate-fadeIn">
                  <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-8 max-w-2xl mx-auto shadow-xl border border-white/20">
                    <div className="mb-6">
                      <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      Welcome to AI Coding Assistant
                    </h3>
                    <p className="text-lg mb-6 text-gray-700">Ask me anything about HTML, CSS, or JavaScript and I'll help you build amazing things.</p>
                    <p className="text-sm mb-4 font-semibold text-gray-800">Quick start examples:</p>
                    <div className="grid gap-3 text-sm">
                      <button
                        onClick={() => setMessage("How do I create a responsive navbar?")}
                        className="bg-white/40 hover:bg-white/60 rounded-xl p-4 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md cursor-pointer border border-white/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💡</span>
                          <span className="text-gray-700 font-medium">How do I create a responsive navbar?</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setMessage("Show me how to center a div with CSS")}
                        className="bg-white/40 hover:bg-white/60 rounded-xl p-4 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md cursor-pointer border border-white/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎨</span>
                          <span className="text-gray-700 font-medium">Show me how to center a div with CSS</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setMessage("Write a JavaScript function to validate email")}
                        className="bg-white/40 hover:bg-white/60 rounded-xl p-4 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md cursor-pointer border border-white/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⚡</span>
                          <span className="text-gray-700 font-medium">Write a JavaScript function to validate email</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((msg, index) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex gap-3 max-w-4xl ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700"
                        : "bg-gradient-to-r from-gray-600 to-gray-700"
                    }`}>
                      {msg.role === "user" ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                    </div>
                    <div
                      className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white/40 backdrop-blur-xl border border-white/30 text-gray-800"
                      }`}
                    >
                      {renderMessage(msg.content, msg.role)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg p-6 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-gray-600 font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input */}
            <div className="border-t border-white/20 p-6 bg-white/10 backdrop-blur-xl">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about HTML, CSS, or JavaScript..."
                    className="w-full px-6 py-4 pr-12 bg-white/40 backdrop-blur-xl border-2 border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-gray-800 shadow-lg transition-all duration-300 hover:border-white/50"
                    disabled={isLoading}
                    autoFocus
                  />
                  {message.trim() && (
                    <button
                      type="button"
                      onClick={() => setMessage("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sending</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send</span>
                    </div>
                  )}
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-3 text-center">Press Enter to send your message</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/20 max-w-md">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-blue-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Ready to Start Coding?
                </h3>
                <p className="text-lg text-gray-700 mb-6">Select a conversation from the sidebar or create a new chat to begin.</p>
                <button
                  onClick={handleNewConversation}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 font-semibold"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
