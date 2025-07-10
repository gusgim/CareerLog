import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTimeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  
  return formatDate(d)
}

export function getCategoryColor(category: string): string {
  const colors = {
    '근무': 'bg-blue-500',
    '교육': 'bg-green-500',
    '성과': 'bg-purple-500',
    '혁신': 'bg-orange-500',
    '연구': 'bg-red-500',
    '기타': 'bg-gray-500',
  }
  return colors[category as keyof typeof colors] || 'bg-gray-500'
}

export function getCategoryEmoji(category: string): string {
  const emojis = {
    '근무': '🏥',
    '교육': '📚',
    '성과': '🏆',
    '혁신': '💡',
    '연구': '🔬',
    '기타': '📝',
  }
  return emojis[category as keyof typeof emojis] || '📝'
} 