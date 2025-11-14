import { useState } from "react";

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800/90 text-gray-300 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="font-semibold text-sm uppercase tracking-wide">{language}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 text-xs bg-gray-700/80 hover:bg-gray-600/80 rounded-lg transition-all duration-300 font-medium transform hover:scale-105 shadow-lg"
        >
          {copied ? (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </div>
          )}
        </button>
      </div>
      <pre className="p-6 overflow-x-auto">
        <code className="text-gray-100 text-sm font-mono whitespace-pre leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}
