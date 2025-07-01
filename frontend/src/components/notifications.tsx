"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, X, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./ui/button"

interface Notification {
  id: string
  type: "workspace_invite"
  workspaceName: string
  inviterName: string
  inviterEmail: string
  description: string
  timestamp: string
  isRead: boolean
  status?: "pending" | "accepted" | "rejected"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "workspace_invite",
    workspaceName: "Design Team Pro",
    inviterName: "Sarah Johnson",
    inviterEmail: "sarah@designteam.com",
    description:
      "You've been invited to join the Design Team Pro workspace. This workspace contains ongoing design projects, client assets, and collaborative tools for our design team.",
    timestamp: "2 hours ago",
    isRead: false,
    status: "pending",
  },
  {
    id: "2",
    type: "workspace_invite",
    workspaceName: "Marketing Hub",
    inviterName: "Mike Chen",
    inviterEmail: "mike@marketinghub.com",
    description:
      "Join our Marketing Hub workspace to collaborate on marketing campaigns, access brand assets, and coordinate with the marketing team.",
    timestamp: "1 day ago",
    isRead: false,
    status: "pending",
  },
  {
    id: "3",
    type: "workspace_invite",
    workspaceName: "Development Core",
    inviterName: "Emily Davis",
    inviterEmail: "emily@devcore.com",
    description:
      "You're invited to the Development Core workspace where our engineering team collaborates on code reviews, project planning, and technical documentation.",
    timestamp: "3 days ago",
    isRead: true,
    status: "accepted",
  },
]

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const handleAccept = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "accepted", isRead: true } : n)))
    console.log(`Accepted invitation ${id}`)
  }

  const handleReject = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "rejected", isRead: true } : n)))
    console.log(`Rejected invitation ${id}`)
  }

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const getStatusIcon = (status?: string) => {
    if (status === "accepted") {
      return <Check className="w-3 h-3 text-green-500" />
    }
    if (status === "rejected") {
      return <X className="w-3 h-3 text-red-500" />
    }
    return null
  }

  return (
    <div className="min-h-screen pt-20 w-full bg-[#1a1a1a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-[#580BDB]" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                onClick={()=>{
                    setExpandedCard(notification.id)
                    if (!notification.isRead) {
                        markAsRead(notification.id)
                    }
                }}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border border-gray-700/50 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-600 ${
                  !notification.isRead ? "bg-[#2d2a3a]/80 border-[#580BDB]/20" : "bg-[#252525]"
                }`}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#580BDB] flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm truncate ${!notification.isRead ? "font-semibold text-white" : "font-medium text-gray-200"}`}>
                            Invite to join {notification.workspaceName}
                          </h3>
                          {getStatusIcon(notification.status)}
                          {!notification.isRead && notification.status === "pending" && (
                            <div className="w-1.5 h-1.5 bg-[#580BDB] rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 justify-start">
                          <p className="text-xs text-gray-400 truncate">
                            From {notification.inviterName}{" -"}
                          </p>
                          <span className="text-xs text-gray-500 flex-shrink-0">{notification.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-3">
                      {notification.status === "pending" && (
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(notification.id)
                            }}
                            size="sm"
                            className="bg-gray-600 cursor-pointer hover:bg-gray-700 text-white px-2 py-1 text-xs rounded transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAccept(notification.id)
                            }}
                            size="sm"
                            className="bg-[#580BDB] cursor-pointer hover:bg-[#4D10B5] text-white px-2 py-1 text-xs rounded transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Accept
                          </Button>
                        </div>
                      )}
                      
                      {notification.status === "accepted" && (
                        <div className="text-xs text-green-500 font-medium px-2">Accepted</div>
                      )}
                      
                      {notification.status === "rejected" && (
                        <div className="text-xs text-red-500 font-medium px-2">Rejected</div>
                      )}
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpand(notification.id)
                          if (!notification.isRead) {
                            markAsRead(notification.id)
                          }
                        }}
                        size={"icon"}
                        className="p-1 cursor-pointer hover:bg-gray-700/50 rounded transition-colors flex-shrink-0"
                      >
                        {expandedCard === notification.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedCard === notification.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 pl-11">
                          <p className="text-xs text-gray-300 leading-relaxed mb-2">
                            {notification.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Invited by: {notification.inviterEmail}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {notifications.length === 0 && (
            <div className="text-center py-16">
              <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-400 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications