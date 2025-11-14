import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function DatabaseManager() {
  const [activeTab, setActiveTab] = useState<"users" | "conversations" | "messages">("users");
  
  // Use admin-only queries
  const users = useQuery(api.users.getAllUsers);
  const conversations = useQuery(api.ai.getAllConversations);

  const tabs = [
    { id: "users", label: "Users", icon: "👥" },
    { id: "conversations", label: "Conversations", icon: "💬" },
    { id: "messages", label: "Messages", icon: "📝" },
  ];

  // Show access denied message if user is not admin
  if (users === undefined && conversations === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white">
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-red-100 mt-2">You don't have permission to access the database manager</p>
          </div>
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              This section is restricted to administrators only. If you believe you should have access, 
              please contact the system administrator.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">For Developers:</h3>
              <p className="text-sm text-yellow-700">
                To grant admin access, update the <code className="bg-yellow-200 px-1 rounded">adminEmails</code> array 
                in <code className="bg-yellow-200 px-1 rounded">convex/users.ts</code> and 
                <code className="bg-yellow-200 px-1 rounded">convex/ai.ts</code> with your email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Database Manager</h1>
              <p className="text-blue-100 mt-2">Admin-only access to application data</p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <span className="text-sm font-semibold">🔒 Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 bg-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white/20 text-gray-800 border-b-2 border-blue-500"
                  : "text-gray-600 hover:bg-white/10"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "users" && (
            <UsersTab users={users} />
          )}
          {activeTab === "conversations" && (
            <ConversationsTab conversations={conversations} />
          )}
          {activeTab === "messages" && (
            <MessagesTab />
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users }: { users: any[] | undefined }) {
  if (!users) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Users ({users.length})</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Admin View
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full bg-white/20 rounded-xl overflow-hidden">
          <thead className="bg-white/30">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className={index % 2 === 0 ? "bg-white/10" : ""}>
                <td className="px-4 py-3 text-gray-800">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    {user.name || "Unnamed User"}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email || "No email"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.isAnonymous 
                      ? "bg-gray-200 text-gray-700" 
                      : "bg-green-200 text-green-700"
                  }`}>
                    {user.isAnonymous ? "Anonymous" : "Registered"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(user._creationTime).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConversationsTab({ conversations }: { conversations: any[] | undefined }) {
  if (!conversations) {
    return <div className="text-center py-8">Loading conversations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">All Conversations ({conversations.length})</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Admin View
        </div>
      </div>
      
      <div className="grid gap-4">
        {conversations.map((conv) => (
          <div key={conv._id} className="bg-white/20 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{conv.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Created: {new Date(conv._creationTime).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  User ID: {conv.userId}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                ID: {conv._id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
      <p className="text-gray-600 mb-4">Select a conversation to view messages</p>
      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
        Admin View
      </div>
    </div>
  );
}
