"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, X, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./ui/button"
import { useQuery } from "@tanstack/react-query"
import { get } from "@/actions/common"
import { GET_ALL_NOTIFICATIONS } from "@/constants/API_Endpoints"
import NotificationsSkelelton from "./skeletons/NotificationsSkelelton"
import { Notification } from "@/types/form.types"

const Notifications = () => {
  const { data: notificationsData, isLoading: fetchingNotifications } = useQuery({
    queryKey: ['notificationsData'],
    queryFn: async () => {
      const res = await get(GET_ALL_NOTIFICATIONS)
      return res.payload.notifications
    }
  })

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  useEffect(() => {
    if (notificationsData && notificationsData.length > 0) {
      setNotifications([...notificationsData])
    }
  }, [notificationsData])

  useEffect(() => {
    console.log("Notifications : ", notificationsData);
  }, [notificationsData])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)))
  }

  const handleAccept = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.notification_id === id ? { ...n, reaction: "accepted", is_read: true } : n)))
    console.log(`Accepted invitation ${id}`)
  }

  const handleReject = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.notification_id === id ? { ...n, reaction: "rejected", is_read: true } : n)))
    console.log(`Rejected invitation ${id}`)
  }

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const getStatusIcon = (status?: string | undefined) => {
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
        
        {fetchingNotifications ? <NotificationsSkelelton/> : <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.notification_id}
                onClick={() => {
                  setExpandedCard(notification.notification_id)
                  if (!notification.is_read) {
                    markAsRead(notification.notification_id)
                  }
                }}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border border-gray-700/50 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-600 cursor-pointer ${
                  !notification.is_read ? "bg-[#2d2a3a]/80 border-[#580BDB]/20" : "bg-[#252525]"
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
                          <h3 className={`text-sm truncate ${!notification.is_read ? "font-semibold text-white" : "font-medium text-gray-200"}`}>
                            Invite to join {notification.workspace_name}
                          </h3>
                          {getStatusIcon(notification?.reaction)}
                          {!notification.is_read && notification?.reaction === "pending" && (
                            <div className="w-1.5 h-1.5 bg-[#580BDB] rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 justify-start">
                          <p className="text-xs text-gray-400 truncate">
                            From {notification.name}{" -"}
                          </p>
                          <span className="text-xs text-gray-500 flex-shrink-0">{new Date(notification.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-3">
                      {notification.reaction === "pending" && (
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(notification.notification_id)
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
                              handleAccept(notification.notification_id)
                            }}
                            size="sm"
                            className="bg-[#580BDB] cursor-pointer hover:bg-[#4D10B5] text-white px-2 py-1 text-xs rounded transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Accept
                          </Button>
                        </div>
                      )}
                      
                      {notification.reaction === "accepted" && (
                        <div className="text-xs text-green-500 font-medium px-2">Accepted</div>
                      )}
                      
                      {notification.reaction === "rejected" && (
                        <div className="text-xs text-red-500 font-medium px-2">Rejected</div>
                      )}
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpand(notification.notification_id)
                          if (!notification.is_read) {
                            markAsRead(notification.notification_id)
                          }
                        }}
                        size={"icon"}
                        className="p-1 cursor-pointer hover:bg-gray-700/50 rounded transition-colors flex-shrink-0"
                      >
                        {expandedCard === notification.notification_id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedCard === notification.notification_id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 pl-11">
                          <p className="text-xs text-gray-300 leading-relaxed mb-2">
                            {notification.message_content}
                          </p>
                          <p className="text-xs text-gray-500">
                            Invited by: {notification.senderEmail}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {notifications.length === 0 && !fetchingNotifications && (
            <div className="text-center py-16">
              <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-400 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">You&apos;re all caught up!</p>
            </div>
          )}
        </div>}
      </div>
    </div>
  )
}

export default Notifications