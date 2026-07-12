'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  isThinking?: boolean
}

export function AssetFlowAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: 'Hi there! I am AssetFlow AI. I can help you find idle assets, look up owners, or summarize maintenance costs. How can I help today?' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    const userQuery = input.trim()
    setInput('')
    
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userQuery }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Simulate AI thinking and querying the database
    setTimeout(async () => {
      let aiResponse = "I'm not sure about that. Try asking about 'idle assets' or 'maintenance'."
      const lowerQ = userQuery.toLowerCase()

      try {
        if (lowerQ.includes('idle') || lowerQ.includes('unused')) {
          const { data, count } = await supabase.from('assets').select('*', { count: 'exact' }).eq('status', 'available')
          aiResponse = `There are currently **${count}** idle assets sitting in the inventory marked as "Available". Would you like me to generate an allocation report for these?`
        } 
        else if (lowerQ.includes('owner') || lowerQ.includes('who owns')) {
          const { data } = await supabase.from('asset_allocations').select('asset:assets(name), employee:employees(first_name, last_name)').eq('status', 'active').limit(1)
          if (data && data.length > 0) {
            const emp: any = data[0].employee
            const ast: any = data[0].asset
            aiResponse = `Based on recent active allocations, **${emp?.first_name} ${emp?.last_name}** is currently assigned the **${ast?.name}**.`
          } else {
            aiResponse = "I couldn't find any active allocations right now."
          }
        }
        else if (lowerQ.includes('maintenance') || lowerQ.includes('repair')) {
          const { data, count } = await supabase.from('maintenance_requests').select('*', { count: 'exact' }).in('status', ['open', 'in_progress'])
          aiResponse = `There are **${count}** active maintenance tickets. The highest priority items are currently awaiting technician assignment.`
        }
        else if (lowerQ.includes('hello') || lowerQ.includes('hi')) {
          aiResponse = "Hello! I'm your enterprise asset assistant. How can I streamline your workflows today?"
        }
      } catch (err) {
        aiResponse = "I encountered a database error while looking that up."
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: aiResponse }])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all z-50 group"
          >
            <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">AssetFlow AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-50 dark:bg-zinc-900/50"
            >
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700'
                    }`}>
                      {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-tl-sm flex items-center gap-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask AssetFlow AI..."
                  className="w-full pl-4 pr-12 py-3 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 focus:ring-0 rounded-xl outline-none text-sm transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                <Sparkles className="w-3 h-3" /> Powered by AssetFlow Intelligence
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
