"use client"

import { useState } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

let toastCount = 0
let globalToastState: Toast[] = []
let globalToastSetter: React.Dispatch<React.SetStateAction<Toast[]>> | null = null

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  // Set global reference for toast function
  globalToastSetter = setToasts

  const toast = (options: ToastOptions) => {
    const id = (++toastCount).toString()
    const newToast: Toast = {
      id,
      ...options,
      duration: options.duration || 5000,
    }

    setToasts(prev => {
      const newToasts = [...prev, newToast]
      globalToastState = newToasts
      return newToasts
    })

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => {
        const filteredToasts = prev.filter(t => t.id !== id)
        globalToastState = filteredToasts
        return filteredToasts
      })
    }, newToast.duration)

    return id
  }

  const dismiss = (id: string) => {
    setToasts(prev => {
      const filteredToasts = prev.filter(t => t.id !== id)
      globalToastState = filteredToasts
      return filteredToasts
    })
  }

  return {
    toasts,
    toast,
    dismiss,
  }
}

// Export standalone toast function
export function toast(options: ToastOptions) {
  const id = (++toastCount).toString()
  const newToast: Toast = {
    id,
    ...options,
    duration: options.duration || 3000,
  }

  if (globalToastSetter) {
    globalToastSetter(prev => [...prev, newToast])
    
    // Auto remove toast after duration
    setTimeout(() => {
      if (globalToastSetter) {
        globalToastSetter(prev => prev.filter(t => t.id !== id))
      }
    }, newToast.duration)
  }

  return id
} 