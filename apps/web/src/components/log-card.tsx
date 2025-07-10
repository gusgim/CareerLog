"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, MapPin, User, Edit3, Trash2, MoreHorizontal, Tag, Calendar, ChevronDown, ChevronUp, Share2, Download, Copy, FileImage, Eye, Edit, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CATEGORIES } from "@/lib/constants/categories"
import { formatFileSize, getFileIcon } from "@/lib/utils/file-upload"
import { 
  shareLog, 
  copyToClipboard, 
  generatePDFFromHTML, 
  shareAsImage, 
  convertLogToText 
} from "@/lib/utils/export-utils"
import { useToast } from "@/hooks/use-toast"

interface LogCardProps {
  log: {
    id: string
    log_date: string
    category: string
    subcategory?: string
    details: string
    tags: string[]
    duration_hours?: number
    metadata?: Record<string, any>
    attachments?: Array<{
      url: string
      path: string
      name: string
      size: number
      type: string
    }>
    created_at: string
  }
  onEdit?: (log: any) => void
  onDelete?: (logId: string) => void
}

export function LogCard({ log, onEdit, onDelete }: LogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()
  
  // 카테고리 정보 가져오기
  const categoryData = CATEGORIES[log.category as keyof typeof CATEGORIES]
  const categoryName = categoryData?.name || log.category
  const categoryEmoji = categoryData?.emoji || "📋"
  const categoryColor = categoryData?.color?.primary || "#6B7280"

  // 세부 카테고리 이름 가져오기
  const getSubcategoryName = () => {
    if (!log.subcategory) return null
    
    if (log.category === "education" && 'subcategories' in categoryData) {
      const subcategoryData = categoryData.subcategories.find((sub: any) => sub.id === log.subcategory)
      return subcategoryData?.name || log.subcategory
    }
    
    if (log.category === "performance" && 'subcategories' in categoryData) {
      const subcategoryData = categoryData.subcategories.find((sub: any) => sub.id === log.metadata?.subcategory)
      return subcategoryData?.name || log.metadata?.subcategory
    }
    
    return log.subcategory
  }

  // 공유 기능
  const handleShare = async () => {
    setIsSharing(true)
    try {
      const success = await shareLog(log)
      if (success) {
        toast({
          title: "공유 완료! 📤",
          description: "활동 기록이 성공적으로 공유되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "공유 실패",
        description: "공유 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }
  
  // 클립보드 복사
  const handleCopyToClipboard = async () => {
    try {
      const text = convertLogToText(log)
      const success = await copyToClipboard(text)
      if (success) {
        toast({
          title: "복사 완료! 📋",
          description: "활동 기록이 클립보드에 복사되었습니다.",
        })
      } else {
        toast({
          title: "복사 실패",
          description: "클립보드 복사에 실패했습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }
  
  // PDF 다운로드
  const handlePDFDownload = async () => {
    try {
      await generatePDFFromHTML(log)
      toast({
        title: "PDF 다운로드 완료! 📄",
        description: "활동 기록이 PDF로 다운로드되었습니다.",
      })
    } catch (error) {
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }
  
  // 이미지로 공유
  const handleShareAsImage = async () => {
    setIsSharing(true)
    try {
      const success = await shareAsImage(log)
      if (success) {
        toast({
          title: "이미지 공유 완료! 🖼️",
          description: "활동 기록이 이미지로 공유되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "이미지 공유 실패",
        description: "이미지 공유 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  // 메타데이터 렌더링
  const renderMetadata = () => {
    if (!log.metadata || Object.keys(log.metadata).length === 0) return null

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
        <h4 className="font-medium text-gray-700 korean-text">세부 정보</h4>
        
        {log.category === "clinical" && (
          <div className="space-y-1 text-sm">
            {log.metadata.duty_type && (
              <p><span className="font-medium">듀티:</span> {log.metadata.duty_type}</p>
            )}
            {log.metadata.operating_room && (
              <p><span className="font-medium">수술방:</span> {log.metadata.operating_room}</p>
            )}
            {log.metadata.surgery_name && (
              <p><span className="font-medium">수술명:</span> {log.metadata.surgery_name}</p>
            )}
            {log.metadata.professor && (
              <p><span className="font-medium">교수님:</span> {log.metadata.professor}</p>
            )}
            {log.metadata.patient_notes && (
              <p><span className="font-medium">환자 특이사항:</span> {log.metadata.patient_notes}</p>
            )}
          </div>
        )}
        
        {log.category === "education" && (
          <div className="space-y-1 text-sm">
            {log.metadata.education_title && (
              <p><span className="font-medium">교육명:</span> {log.metadata.education_title}</p>
            )}
            {log.metadata.institution && (
              <p><span className="font-medium">교육기관:</span> {log.metadata.institution}</p>
            )}
            {log.metadata.result && (
              <p><span className="font-medium">결과:</span> {log.metadata.result}</p>
            )}
            {log.metadata.score && (
              <p><span className="font-medium">점수:</span> {log.metadata.score}</p>
            )}
            {log.metadata.main_content && (
              <p><span className="font-medium">주요내용:</span> {log.metadata.main_content}</p>
            )}
            {log.metadata.special_notes && (
              <p><span className="font-medium">특이사항:</span> {log.metadata.special_notes}</p>
            )}
          </div>
        )}
        
        {log.category === "performance" && (
          <div className="space-y-1 text-sm">
            {log.metadata.project_title && (
              <p><span className="font-medium">프로젝트명:</span> {log.metadata.project_title}</p>
            )}
            {log.metadata.role && (
              <p><span className="font-medium">역할/결과:</span> {log.metadata.role}</p>
            )}
            {log.metadata.description && (
              <p><span className="font-medium">상세내용:</span> {log.metadata.description}</p>
            )}
            {log.metadata.outcome && (
              <p><span className="font-medium">성과:</span> {log.metadata.outcome}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // 첨부파일 렌더링
  const renderAttachments = () => {
    if (!log.attachments || log.attachments.length === 0) return null

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
        <h4 className="font-medium text-blue-700 korean-text flex items-center space-x-2">
          <Paperclip className="h-4 w-4" />
          <span>첨부파일 ({log.attachments.length}개)</span>
        </h4>
        
        <div className="space-y-2">
          {log.attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                  title="미리보기"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                  title="다운로드"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg group border-l-4`}
      style={{ borderLeftColor: categoryColor }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm"
              style={{ 
                backgroundColor: categoryData?.color?.light || '#f3f4f6',
                color: categoryData?.color?.text || '#4b5563',
                border: `2px solid ${categoryData?.color?.primary || '#6b7280'}20`
              }}
            >
              {categoryData?.emoji || '📋'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg korean-text" style={{ color: categoryData?.color?.text || '#4b5563' }}>
                  {categoryName}
                </h3>
                {getSubcategoryName() && (
                  <Badge variant="outline" className="text-xs" style={{ 
                    borderColor: categoryData?.color?.primary || '#6b7280',
                    color: categoryData?.color?.text || '#4b5563'
                  }}>
                    {getSubcategoryName()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(log.log_date), "M월 d일 (E)", { locale: ko })}</span>
                </div>
                {log.duration_hours && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{log.duration_hours}시간</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleShare} disabled={isSharing}>
                  <Share2 className="h-4 w-4 mr-2" />
                  공유하기
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  텍스트 복사
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handlePDFDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF 다운로드
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleShareAsImage} disabled={isSharing}>
                  <FileImage className="h-4 w-4 mr-2" />
                  이미지로 공유
                </DropdownMenuItem>
                
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(log)}>
                    <Edit className="h-4 w-4 mr-2" />
                    수정하기
                  </DropdownMenuItem>
                )}
                
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(log.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제하기
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* 활동 내용 */}
          <div>
            <p className="text-gray-700 korean-text">
              {isExpanded ? log.details : `${log.details.slice(0, 100)}${log.details.length > 100 ? '...' : ''}`}
            </p>
            
            {log.details.length > 100 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto text-blue-600 hover:text-blue-800"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    접기
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    더 보기
                  </>
                )}
              </Button>
            )}
          </div>

          {/* 메타데이터 */}
          {isExpanded && renderMetadata()}

          {/* 첨부파일 */}
          {isExpanded && renderAttachments()}

          {/* 태그 */}
          {log.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {log.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 