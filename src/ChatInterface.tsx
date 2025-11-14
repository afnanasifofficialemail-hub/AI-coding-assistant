import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CodeBlock } from "./CodeBlock";

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
    const title = `New Chat ${new Date().toLocaleDateString()}`;
    const conversationId = await createConversation({ title });
    setSelectedConversation(conversationId);
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
      <div className="w-80 bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/20">
          <button
            onClick={handleNewConversation}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold"
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
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => setSelectedConversation(conv._id)}
              className={`w-full p-4 text-left rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                selectedConversation === conv._id 
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-4 border-l-blue-500 shadow-lg" 
                  : "hover:bg-white/20 hover:shadow-md"
              }`}
            >
              <div className="truncate text-sm font-medium text-gray-700">{conv.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(conv._creationTime).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-white/10 backdrop-blur-sm">
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-gray-600 mt-12">
                  <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-8 max-w-2xl mx-auto shadow-xl border border-white/20">
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome to AI Coding Assistant! 🚀
                    </h3>
                    <p className="text-lg mb-4">Ask me anything about HTML, CSS, or JavaScript.</p>
                    <p className="text-sm mb-4 font-medium">Try these examples:</p>
                    <div className="grid gap-3 text-sm">
                      <div className="bg-white/20 rounded-xl p-3 text-left">
                        💡 "How do I create a responsive navbar?"
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 text-left">
                        🎨 "Show me how to center a div with CSS"
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 text-left">
                        ⚡ "Write a JavaScript function to validate email"
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-4xl p-6 rounded-2xl shadow-lg transform hover:scale-[1.01] transition-all duration-300 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-white/40 backdrop-blur-xl border border-white/30 text-gray-800"
                    }`}
                  >
                    {renderMessage(msg.content, msg.role)}
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
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about HTML, CSS, or JavaScript..."
                  className="flex-1 px-6 py-4 bg-white/30 backdrop-blur-xl border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-800 shadow-lg transition-all duration-300"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </div>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Select a conversation or start a new chat
                </h3>
                <p className="text-lg">Get help with HTML, CSS, and JavaScript coding</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
