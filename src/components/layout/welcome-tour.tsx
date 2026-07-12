'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, X, LayoutDashboard, MonitorSmartphone, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const slides = [
  {
    title: 'Welcome to AssetFlow Enterprise',
    description: 'The ultimate digital asset management and operations platform. Let\'s take a quick tour of what you can do.',
    icon: Sparkles,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30'
  },
  {
    title: 'Asset Lifecycle Management',
    description: 'Track the complete lifecycle of your digital and physical assets, from procurement to disposal, with enterprise-grade state machines.',
    icon: MonitorSmartphone,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    title: 'Resource Booking Engine',
    description: 'Manage shared resources like meeting rooms, vehicles, and projectors with built-in conflict prevention and approval workflows.',
    icon: Calendar,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    title: 'Audit & Verification',
    description: 'Execute operational audits, flag discrepancies, and ensure 100% compliance across all departments and locations.',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30'
  }
]

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    // Show tour on first visit
    const hasSeenTour = localStorage.getItem('assetflow_tour_seen')
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('assetflow_tour_seen', 'true')
  }

  const SlideIcon = slides[currentSlide].icon

  return (
    <>
      {/* Hidden button for triggering manually if needed */}
      <button id="trigger-tour" onClick={() => setIsOpen(true)} className="hidden" />

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative h-48 sm:h-56 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center p-6 shrink-0 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full ${slides[currentSlide].bg} flex items-center justify-center shadow-lg relative z-10`}
                  >
                    <SlideIcon className={`w-12 h-12 sm:w-16 sm:h-16 ${slides[currentSlide].color}`} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between bg-white dark:bg-zinc-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-center space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {slides[currentSlide].title}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                      {slides[currentSlide].description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-2">
                    {slides.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === currentSlide 
                            ? 'bg-indigo-600 w-6' 
                            : 'bg-zinc-200 dark:bg-zinc-800'
                        }`} 
                      />
                    ))}
                  </div>

                  <Button 
                    onClick={handleNext}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6"
                  >
                    {currentSlide === slides.length - 1 ? (
                      <>Get Started <CheckCircle2 className="w-4 h-4 ml-2" /></>
                    ) : (
                      <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
