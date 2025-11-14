import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { EnhancedSignInWrapper } from "./EnhancedSignInWrapper";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ChatInterface } from "./ChatInterface";
import { UserProfile } from "./components/UserProfile";
import { DatabaseManager } from "./components/DatabaseManager";
import { useState } from "react";

export default function App() {
  const [currentView, setCurrentView] = useState<"chat" | "profile" | "database">("chat");
  
  // Check if current user is admin (for showing database tab)
  const currentUser = useQuery(api.auth.loggedInUser);
  const isAdmin = currentUser?.email && ["claraartist607@gmail.com"].includes(currentUser.email);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50 relative overflow-hidden">
      {/* Enhanced 3D animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary floating orbs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-full blur-3xl animate-pulse transform-gpu"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl animate-pulse delay-1000 transform-gpu"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-2xl animate-pulse delay-500 transform-gpu"></div>
        
        {/* Secondary floating elements */}
        <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-gradient-to-br from-emerald-400/25 to-teal-600/25 rounded-full blur-xl animate-bounce transform-gpu" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-tr from-rose-400/20 to-orange-600/20 rounded-full blur-2xl animate-pulse delay-2000 transform-gpu"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500/40 rounded-full animate-ping"></div>
        <div className="absolute top-1/4 left-3/4 w-1 h-1 bg-blue-400/50 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-cyan-500/40 rounded-full animate-ping delay-1500"></div>
      </div>

      {/* Glassmorphism header */}
      <header className="relative z-10 sticky top-0 bg-white/20 backdrop-blur-2xl border-b border-white/30 shadow-2xl">
        <div className="h-20 flex justify-between items-center px-8">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              {/* 3D icon container */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl transform rotate-6 opacity-30 group-hover:rotate-12 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl transform -rotate-3 opacity-20 group-hover:-rotate-6 transition-transform duration-300"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AI Coding Assistant
              </h2>
              <p className="text-sm text-gray-600/80 font-medium">Powered by GPT-4</p>
            </div>
          </div>
          
          <Authenticated>
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <button
                  onClick={() => setCurrentView("chat")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    currentView === "chat"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-white/20"
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setCurrentView("profile")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    currentView === "profile"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-white/20"
                  }`}
                >
                  👤 Profile
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setCurrentView("database")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      currentView === "database"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-white/20"
                    }`}
                  >
                    🗄️ Database
                  </button>
                )}
              </nav>
              <div className="text-right">
                <span className="text-sm text-gray-700 font-semibold">Created by Afnan</span>
                <p className="text-xs text-gray-500">Full-Stack Developer</p>
              </div>
              <SignOutButton />
            </div>
          </Authenticated>

          <Unauthenticated>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-sm text-gray-700 font-semibold">Created by Afnan</span>
                <p className="text-xs text-gray-500">Full-Stack Developer</p>
              </div>
            </div>
          </Unauthenticated>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex">
        <Content currentView={currentView} />
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      />
    </div>
  );
}

function Content({ currentView }: { currentView: "chat" | "profile" | "database" }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="relative">
          {/* Enhanced 3D loading spinner */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200/50"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 border-r-purple-600 absolute top-0"></div>
          <div className="animate-ping rounded-full h-4 w-4 bg-blue-600 absolute top-6 left-6"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <div className="flex-1">
          {currentView === "chat" && <ChatInterface />}
          {currentView === "profile" && <UserProfile />}
          {currentView === "database" && <DatabaseManager />}
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg mx-auto">
            <div className="text-center mb-12">
              {/* Enhanced 3D logo */}
              <div className="relative inline-block mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl transform rotate-6 opacity-20 group-hover:rotate-12 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl transform -rotate-6 opacity-20 group-hover:-rotate-12 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-3xl transform rotate-3 opacity-15 group-hover:rotate-9 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-500">
                  <svg className="w-16 h-16 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
                AI Coding Assistant
              </h1>
              <p className="text-2xl text-gray-700 mb-3 font-medium">Your personal HTML, CSS & JavaScript helper</p>
              <p className="text-lg text-gray-600 mb-2">Powered by advanced AI technology</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 font-medium">
                <span>Created by</span>
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">Afnan</span>
                <span>•</span>
                <span>Full-Stack Developer</span>
              </div>
            </div>
            
            {/* Enhanced sign-in form container */}
            <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <EnhancedSignInWrapper />
            </div>
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
