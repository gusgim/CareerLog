"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, Eye } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, 
         addMonths, subMonths, startOfMonth, endOfMonth, isSameDay, isSameMonth,
         startOfYear, endOfYear, addYears, subYears, eachMonthOfInterval, addDays, subDays } from "date-fns"
import { ko } from "date-fns/locale"
import { CATEGORIES } from "@/lib/constants/categories"
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/provider"

interface LogData {
  id: string
  log_date: string
  category: string
  subcategory?: string
  details: string
  tags: string[]
  duration_hours?: number
  metadata?: Record<string, any>
  created_at: string
}

interface CalendarViewProps {
  logs: LogData[]
  onLogClick?: (log: LogData) => void
}

type ViewType = "day" | "week" | "month" | "year"

// 드래그 가능한 로그 카드 컴포넌트
function DraggableLogCard({ log, onLogClick }: { log: LogData, onLogClick?: (log: LogData) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: log.id })

  const categoryData = CATEGORIES[log.category as keyof typeof CATEGORIES]
  const categoryColor = categoryData?.color || {
    primary: "#6b7280",
    light: "#f3f4f6",
    text: "#4b5563"
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: categoryColor.light,
    borderColor: categoryColor.primary + "40",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 mb-1 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isDragging ? 'ring-2 ring-blue-400 shadow-lg' : ''
      }`}
      onClick={() => onLogClick?.(log)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{categoryData?.emoji}</span>
          <span className="text-xs font-medium korean-text truncate" style={{ color: categoryColor.text }}>
            {categoryData?.name}
          </span>
        </div>
        {log.duration_hours && (
          <span className="text-xs text-gray-500">{log.duration_hours}h</span>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-1 line-clamp-2 korean-text">
        {log.details}
      </p>
    </div>
  )
}

// 드롭 가능한 날짜 영역 컴포넌트
function DroppableDay({ day, logs, isCurrentMonth, isToday, children }: {
  day: Date
  logs: LogData[]
  isCurrentMonth: boolean
  isToday: boolean
  children: React.ReactNode
}) {
  const { setNodeRef } = useSortable({
    id: format(day, "yyyy-MM-dd"),
    data: {
      type: 'day',
      date: format(day, "yyyy-MM-dd"),
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-2 border rounded-lg transition-colors ${
        isCurrentMonth ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
      } ${isToday ? "ring-2 ring-blue-400" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${
          isCurrentMonth ? "text-gray-900" : "text-gray-400"
        }`}>
          {format(day, "d")}
        </span>
        {logs.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {logs.length}
          </Badge>
        )}
      </div>
      {children}
    </div>
  )
}

export function CalendarView({ logs, onLogClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("month")
  const [activeId, setActiveId] = useState<string | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // tRPC 날짜 업데이트 mutation
  const utils = api.useContext()
  const updateDateMutation = api.log.updateDate.useMutation({
    onSuccess: async () => {
      // 캐시 무효화
      await Promise.all([
        utils.log.getAll.invalidate(),
        utils.log.getStats.invalidate(),
      ])
      
      toast({
        title: "이동 완료! 📅",
        description: "활동이 새로운 날짜로 이동되었습니다.",
        variant: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "이동 실패",
        description: error.message || "활동 이동에 실패했습니다.",
        variant: "destructive",
      })
    },
  })

  // 날짜 범위 계산
  const dateRange = useMemo(() => {
    switch (viewType) {
      case "day":
        return {
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59)
        }
      case "week":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 })
        }
      case "month":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        }
      case "year":
        return {
          start: startOfYear(currentDate),
          end: endOfYear(currentDate)
        }
    }
  }, [currentDate, viewType])

  // 날짜별 로그 그룹화
  const logsByDate = useMemo(() => {
    const grouped: Record<string, LogData[]> = {}
    logs.forEach(log => {
      const dateKey = format(new Date(log.log_date), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(log)
    })
    return grouped
  }, [logs])

  // 날짜 네비게이션
  const navigateDate = (direction: "prev" | "next") => {
    switch (viewType) {
      case "day":
        setCurrentDate(direction === "prev" ? subDays(currentDate, 1) : addDays(currentDate, 1))
        break
      case "week":
        setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
        break
      case "month":
        setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
        break
      case "year":
        setCurrentDate(direction === "prev" ? subYears(currentDate, 1) : addYears(currentDate, 1))
        break
    }
  }

  // 로그 카드 렌더링
  const renderLogCard = (log: LogData) => {
    const categoryData = CATEGORIES[log.category as keyof typeof CATEGORIES]
    const categoryColor = categoryData?.color || {
      primary: "#6b7280",
      light: "#f3f4f6",
      text: "#4b5563"
    }

    return (
      <div
        key={log.id}
        className="p-2 mb-1 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
        style={{
          backgroundColor: categoryColor.light,
          borderColor: categoryColor.primary + "40"
        }}
        onClick={() => onLogClick?.(log)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{categoryData?.emoji}</span>
            <span className="text-xs font-medium korean-text truncate" style={{ color: categoryColor.text }}>
              {categoryData?.name}
            </span>
          </div>
          {log.duration_hours && (
            <span className="text-xs text-gray-500">{log.duration_hours}h</span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2 korean-text">
          {log.details}
        </p>
      </div>
    )
  }

  // 주간 뷰 렌더링
  const renderWeekView = () => {
    const days = eachDayOfInterval(dateRange)
    
    return (
      <div className="grid grid-cols-7 gap-4 h-full">
        {/* 헤더 */}
        {days.map(day => (
          <div key={day.toISOString()} className="text-center">
            <div className="font-semibold text-sm korean-text">
              {format(day, "E", { locale: ko })}
            </div>
            <div className="text-2xl font-bold mt-1">
              {format(day, "d")}
            </div>
          </div>
        ))}
        
        {/* 내용 */}
        {days.map(day => {
          const dateKey = format(day, "yyyy-MM-dd")
          const dayLogs = logsByDate[dateKey] || []
          
          return (
            <div key={day.toISOString()} className="min-h-[300px] p-2 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                {dayLogs.map(renderLogCard)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // 월간 뷰 렌더링
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["일", "월", "화", "수", "목", "금", "토"].map(day => (
              <div key={day} className="text-center font-semibold korean-text py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <SortableContext
            items={days.map(day => format(day, "yyyy-MM-dd"))}
            strategy={verticalListSortingStrategy}
          >
            {days.map(day => {
              const dateKey = format(day, "yyyy-MM-dd")
              const dayLogs = logsByDate[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())

              return (
                <DroppableDay
                  key={day.toISOString()}
                  day={day}
                  logs={dayLogs}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                >
                  <div className="space-y-1">
                    {dayLogs.slice(0, 3).map(log => (
                      <DraggableLogCard
                        key={log.id}
                        log={log}
                        onLogClick={onLogClick}
                      />
                    ))}
                    {dayLogs.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayLogs.length - 3} more
                      </div>
                    )}
                  </div>
                </DroppableDay>
              )
            })}
          </SortableContext>
        </div>
      </DndContext>
    )
  }

  // 연간 뷰 렌더링
  const renderYearView = () => {
    const months = eachMonthOfInterval(dateRange)

    return (
      <div className="grid grid-cols-4 gap-6 h-full">
        {months.map(month => {
          const monthKey = format(month, "yyyy-MM")
          const monthLogs = logs.filter(log => 
            format(new Date(log.log_date), "yyyy-MM") === monthKey
          )

          // 카테고리별 로그 개수 계산
          const categoryStats = monthLogs.reduce((acc, log) => {
            const category = log.category
            acc[category] = (acc[category] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          return (
            <Card key={month.toISOString()} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg korean-text">
                  {format(month, "M월", { locale: ko })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">총 활동</span>
                    <span className="font-semibold">{monthLogs.length}건</span>
                  </div>
                  
                  {Object.entries(categoryStats).map(([category, count]) => {
                    const categoryData = CATEGORIES[category as keyof typeof CATEGORIES]
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{categoryData?.emoji}</span>
                          <span className="text-sm korean-text">{categoryData?.name}</span>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // 일간 뷰 렌더링
  const renderDayView = () => {
    const dateKey = format(currentDate, "yyyy-MM-dd")
    const dayLogs = logsByDate[dateKey] || []
    const isToday = isSameDay(currentDate, new Date())

    // 시간대별로 로그 그룹화 (created_at 기준)
    const logsByHour = dayLogs.reduce((acc, log) => {
      const hour = new Date(log.created_at).getHours()
      if (!acc[hour]) acc[hour] = []
      acc[hour].push(log)
      return acc
    }, {} as Record<number, LogData[]>)

    return (
      <div className="flex flex-col h-full">
        {/* 일간 헤더 */}
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold korean-text">
                {format(currentDate, "yyyy년 M월 d일 (E)", { locale: ko })}
              </h3>
              {isToday && (
                <Badge variant="default" className="mt-2">오늘</Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">총 활동</div>
              <div className="text-2xl font-bold text-blue-600">{dayLogs.length}건</div>
            </div>
          </div>
        </div>

        {/* 시간대별 활동 */}
        <div className="flex-1 overflow-y-auto">
          {dayLogs.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="korean-text">이 날에는 기록된 활동이 없습니다.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 24 }, (_, i) => i).map(hour => {
                const hourLogs = logsByHour[hour] || []
                const timeString = `${hour.toString().padStart(2, '0')}:00`
                
                return (
                  <div key={hour} className="flex border-b border-gray-200 pb-4">
                    {/* 시간 표시 */}
                    <div className="w-20 text-right pr-4 pt-2">
                      <div className="text-sm font-medium text-gray-600">{timeString}</div>
                    </div>
                    
                    {/* 해당 시간의 활동들 */}
                    <div className="flex-1 min-h-[60px]">
                      {hourLogs.length > 0 ? (
                        <div className="space-y-2">
                          {hourLogs.map(log => (
                            <div key={log.id} className="p-3 bg-white rounded-lg shadow-sm border-l-4"
                                 style={{ borderLeftColor: CATEGORIES[log.category as keyof typeof CATEGORIES]?.color?.primary || "#6b7280" }}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-lg">{CATEGORIES[log.category as keyof typeof CATEGORIES]?.emoji}</span>
                                    <span className="font-medium korean-text text-sm">{CATEGORIES[log.category as keyof typeof CATEGORIES]?.name}</span>
                                    {log.duration_hours && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {log.duration_hours}시간
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 korean-text">{log.details}</p>
                                  {log.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {log.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onLogClick?.(log)}
                                  className="ml-2"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center text-gray-300">
                          <div className="w-full border-t border-dashed border-gray-200"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      // 로그 ID와 새로운 날짜 추출
      const logId = parseInt(active.id as string)
      const newDate = over.id as string

      updateDateMutation.mutate({
        id: logId,
        log_date: newDate,
      })
    }
    setActiveId(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold korean-text">
              {viewType === "day" && format(currentDate, "yyyy년 M월 d일", { locale: ko })}
              {viewType === "week" && (
                <>
                  {format(startOfWeek(currentDate, { weekStartsOn: 0 }), "yyyy년 M월 d일", { locale: ko })}
                  {" ~ "}
                  {format(endOfWeek(currentDate, { weekStartsOn: 0 }), "M월 d일", { locale: ko })}
                </>
              )}
              {viewType === "month" && format(currentDate, "yyyy년 M월", { locale: ko })}
              {viewType === "year" && format(currentDate, "yyyy년", { locale: ko })}
            </h2>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="korean-text"
            >
              오늘
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 뷰 타입 선택 */}
        <div className="flex items-center space-x-2">
          {[
            { type: "day" as const, label: "일간" },
            { type: "week" as const, label: "주간" },
            { type: "month" as const, label: "월간" },
            { type: "year" as const, label: "연간" }
          ].map(view => (
            <Button
              key={view.type}
              variant={viewType === view.type ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType(view.type)}
              className="korean-text"
            >
              {view.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 캘린더 내용 */}
      <div className="flex-1 overflow-hidden">
        {viewType === "week" && renderWeekView()}
        {viewType === "month" && renderMonthView()}
        {viewType === "year" && renderYearView()}
        {viewType === "day" && renderDayView()}
      </div>
    </div>
  )
} 