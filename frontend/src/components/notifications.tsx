import React, { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, X, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  type: "workspace_invite"
  workspaceName: string
  inviterName: string
  inviterEmail: string
  description: string
  timestamp: string
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "workspace_invite",
    workspaceName: "Design Team Pro",
    inviterName: "Sarah Johnson",
    inviterEmail: "sarah@designteam.com",
    description:
      "You've been invited to join the Design Team Pro workspace. This workspace contains ongoing design projects, client assets, and collaborative tools for our design team. Join to access shared resources and participate in team discussions.",
    timestamp: "2 hours ago",
    isRead: false,
  },
  {
    id: "2",
    type: "workspace_invite",
    workspaceName: "Marketing Hub",
    inviterName: "Mike Chen",
    inviterEmail: "mike@marketinghub.com",
    description:
      "Join our Marketing Hub workspace to collaborate on marketing campaigns, access brand assets, and coordinate with the marketing team. This workspace includes campaign planning tools, analytics dashboards, and content management systems.",
    timestamp: "1 day ago",
    isRead: false,
  },
  {
    id: "3",
    type: "workspace_invite",
    workspaceName: "Development Core",
    inviterName: "Emily Davis",
    inviterEmail: "emily@devcore.com",
    description:
      "You're invited to the Development Core workspace where our engineering team collaborates on code reviews, project planning, and technical documentation. Access development tools, repositories, and team communication channels.",
    timestamp: "3 days ago",
    isRead: true,
  },
]
const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    
    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    }

    const handleAccept = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        console.log(`Accepted invitation ${id}`)
    }

    const handleReject = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        console.log(`Rejected invitation ${id}`)
    }

    const toggleExpand = (id: string) => {
        setExpandedCard(expandedCard === id ? null : id)
    }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">

        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-[#580BDB]" />
            <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
            <AnimatePresence>
                {notifications.map((notification) => (
                <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-[#2a2a2a] border border-gray-700 rounded-lg overflow-hidden"
                >
                    <motion.div
                    layout
                    className="p-6"
                    onClick={() => {
                        toggleExpand(notification.id)
                        if (!notification.isRead) {
                        markAsRead(notification.id)
                        }
                    }}
                    >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-[#580BDB] flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">Invite to join {notification.workspaceName}</h3>
                                {!notification.isRead && <div className="w-2 h-2 bg-[#580BDB] rounded-full"></div>}
                                </div>

                                <p className="text-gray-400 text-sm mb-2">
                                From {notification.inviterName} ({notification.inviterEmail})
                                </p>

                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: expandedCard === notification.id ? "auto" : "0",
                                        opacity: expandedCard === notification.id ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{notification.description}</p>
                                </motion.div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{notification.timestamp}</span>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleReject(notification.id)
                                            }}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleAccept(notification.id)
                                            }}
                                            className="bg-[#580BDB] hover:bg-[#4D10B5] text-white px-4 py-2 text-sm"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Accept
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(notification.id)
                        }}
                        className="ml-4 p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                        {expandedCard === notification.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                        </button>
                    </div>
                    </motion.div>
                </motion.div>
                ))}
            </AnimatePresence>

            {notifications.length === 0 && (
                <div className="text-center h-full py-50">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No notifications</h3>
                    <p className="text-gray-500">{"You're all caught up! No new invites or revokes yet."}</p>
                </div>
            )}
            </div>
        </div>
    </div>
  )
}

export default Notifications