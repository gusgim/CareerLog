import { CATEGORIES } from "@/lib/constants/categories"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface LogData {
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
    name: string
    type: string
    size: number
  }>
  created_at: string
}

/**
 * 활동 내용을 텍스트로 변환
 */
export function convertLogToText(log: LogData): string {
  const categoryData = CATEGORIES[log.category as keyof typeof CATEGORIES]
  const categoryName = categoryData?.name || log.category
  
  let text = `📋 ${categoryName} 활동 기록\n\n`
  
  // 기본 정보
  text += `📅 날짜: ${format(new Date(log.log_date), "yyyy년 M월 d일 (E)", { locale: ko })}\n`
  
  if (log.duration_hours) {
    text += `⏰ 소요 시간: ${log.duration_hours}시간\n`
  }
  
  text += `\n`
  
  // 카테고리별 메타데이터
  if (log.metadata && Object.keys(log.metadata).length > 0) {
    text += `📝 세부 정보:\n`
    
    if (log.category === "clinical") {
      if (log.metadata.duty_type) text += `• 듀티: ${log.metadata.duty_type}\n`
      if (log.metadata.operating_room) text += `• 수술방: ${log.metadata.operating_room}\n`
      if (log.metadata.surgery_name) text += `• 수술명: ${log.metadata.surgery_name}\n`
      if (log.metadata.professor) text += `• 교수님: ${log.metadata.professor}\n`
      if (log.metadata.patient_notes) text += `• 환자 특이사항: ${log.metadata.patient_notes}\n`
    }
    
    if (log.category === "education") {
      if (log.metadata.education_title) text += `• 교육명: ${log.metadata.education_title}\n`
      if (log.metadata.institution) text += `• 교육기관: ${log.metadata.institution}\n`
      if (log.metadata.result) text += `• 결과: ${log.metadata.result}\n`
      if (log.metadata.score) text += `• 점수: ${log.metadata.score}\n`
      if (log.metadata.main_content) text += `• 주요내용: ${log.metadata.main_content}\n`
      if (log.metadata.special_notes) text += `• 특이사항: ${log.metadata.special_notes}\n`
    }
    
    if (log.category === "performance") {
      if (log.metadata.project_title) text += `• 프로젝트명: ${log.metadata.project_title}\n`
      if (log.metadata.role) text += `• 역할/결과: ${log.metadata.role}\n`
      if (log.metadata.description) text += `• 상세내용: ${log.metadata.description}\n`
      if (log.metadata.outcome) text += `• 성과: ${log.metadata.outcome}\n`
    }
    
    text += `\n`
  }
  
  // 활동 상세 내용
  if (log.details) {
    text += `📄 활동 내용:\n${log.details}\n\n`
  }
  
  // 태그
  if (log.tags && log.tags.length > 0) {
    text += `🏷️ 태그: ${log.tags.join(", ")}\n\n`
  }
  
  // 첨부파일
  if (log.attachments && log.attachments.length > 0) {
    text += `📎 첨부파일 (${log.attachments.length}개):\n`
    log.attachments.forEach((file, index) => {
      text += `${index + 1}. ${file.name} (${file.type})\n`
    })
    text += `\n`
  }
  
  text += `⏱️ 기록일시: ${format(new Date(log.created_at), "yyyy년 M월 d일 HH:mm", { locale: ko })}\n`
  text += `\n📱 CareerLog에서 생성됨`
  
  return text
}

/**
 * 웹 공유 API를 사용한 공유
 */
export async function shareLog(log: LogData): Promise<boolean> {
  const text = convertLogToText(log)
  const title = `${CATEGORIES[log.category as keyof typeof CATEGORIES]?.name || log.category} 활동 기록`
  
  // Web Share API 지원 확인
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      })
      return true
    } catch (error) {
      return false
    }
  } else {
    // Web Share API를 지원하지 않는 경우 클립보드에 복사
    return copyToClipboard(text)
  }
}

/**
 * 클립보드에 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * PDF 다운로드 링크 생성
 */
export function generatePDFDownloadUrl(logId: string): string {
  // 실제 구현에서는 서버에서 PDF를 생성하는 API 엔드포인트를 호출
  return `/api/export/pdf/${logId}`
}

/**
 * HTML을 PDF로 변환 (클라이언트 사이드)
 */
export async function generatePDFFromHTML(log: LogData): Promise<void> {
  // 동적으로 jsPDF 라이브러리 로드
  const { default: jsPDF } = await import('jspdf')
  
  const categoryData = CATEGORIES[log.category as keyof typeof CATEGORIES]
  const categoryName = categoryData?.name || log.category
  
  // PDF 문서 생성
  const doc = new jsPDF()
  
  // 한글 폰트 설정 (필요시)
  doc.setFont('helvetica')
  
  let yPosition = 20
  const lineHeight = 10
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  
  // 제목
  doc.setFontSize(20)
  doc.text(`${categoryName} 활동 기록`, margin, yPosition)
  yPosition += lineHeight * 2
  
  // 기본 정보
  doc.setFontSize(12)
  doc.text(`날짜: ${format(new Date(log.log_date), "yyyy년 M월 d일", { locale: ko })}`, margin, yPosition)
  yPosition += lineHeight
  
  if (log.duration_hours) {
    doc.text(`소요 시간: ${log.duration_hours}시간`, margin, yPosition)
    yPosition += lineHeight
  }
  
  yPosition += lineHeight
  
  // 메타데이터 추가
  if (log.metadata && Object.keys(log.metadata).length > 0) {
    doc.setFontSize(14)
    doc.text('세부 정보:', margin, yPosition)
    yPosition += lineHeight
    
    doc.setFontSize(10)
    Object.entries(log.metadata).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        const text = `• ${key}: ${value}`
        const splitText = doc.splitTextToSize(text, doc.internal.pageSize.width - 2 * margin)
        doc.text(splitText, margin, yPosition)
        yPosition += lineHeight * splitText.length
        
        // 페이지 넘김 체크
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
      }
    })
    
    yPosition += lineHeight
  }
  
  // 활동 내용
  if (log.details) {
    doc.setFontSize(14)
    doc.text('활동 내용:', margin, yPosition)
    yPosition += lineHeight
    
    doc.setFontSize(10)
    const splitDetails = doc.splitTextToSize(log.details, doc.internal.pageSize.width - 2 * margin)
    doc.text(splitDetails, margin, yPosition)
    yPosition += lineHeight * splitDetails.length + lineHeight
  }
  
  // 태그
  if (log.tags && log.tags.length > 0) {
    doc.setFontSize(12)
    doc.text(`태그: ${log.tags.join(', ')}`, margin, yPosition)
    yPosition += lineHeight * 2
  }
  
  // 첨부파일 목록
  if (log.attachments && log.attachments.length > 0) {
    doc.setFontSize(12)
    doc.text(`첨부파일 (${log.attachments.length}개):`, margin, yPosition)
    yPosition += lineHeight
    
    doc.setFontSize(10)
    log.attachments.forEach((file, index) => {
      doc.text(`${index + 1}. ${file.name}`, margin, yPosition)
      yPosition += lineHeight
    })
  }
  
  // 파일 저장
  const fileName = `CareerLog_${categoryName}_${format(new Date(log.log_date), "yyyyMMdd")}.pdf`
  doc.save(fileName)
}

/**
 * 이미지로 변환하여 공유
 */
export async function shareAsImage(log: LogData): Promise<boolean> {
  try {
    // HTML을 캔버스로 변환하는 라이브러리 (html2canvas) 동적 로드
    const html2canvas = (await import('html2canvas')).default
    
    // 임시 HTML 요소 생성
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '800px'
    tempDiv.style.padding = '20px'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    
    const categoryData = CATEGORIES[log.category as keyof typeof CATEGORIES]
    const categoryName = categoryData?.name || log.category
    
    tempDiv.innerHTML = `
      <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h1 style="color: ${categoryData?.color?.primary || '#000'}; margin: 0 0 20px 0;">
          ${categoryData?.emoji} ${categoryName} 활동 기록
        </h1>
        <p><strong>날짜:</strong> ${format(new Date(log.log_date), "yyyy년 M월 d일", { locale: ko })}</p>
        ${log.duration_hours ? `<p><strong>소요 시간:</strong> ${log.duration_hours}시간</p>` : ''}
        <div style="margin: 20px 0;">
          <h3>활동 내용:</h3>
          <p style="background: #f9fafb; padding: 15px; border-radius: 6px;">${log.details}</p>
        </div>
        ${log.tags.length > 0 ? `<p><strong>태그:</strong> ${log.tags.join(', ')}</p>` : ''}
        <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
          📱 CareerLog에서 생성됨
        </p>
      </div>
    `
    
    document.body.appendChild(tempDiv)
    
    // 캔버스로 변환
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: 'white',
      scale: 2 // 고화질
    })
    
    document.body.removeChild(tempDiv)
    
    // 캔버스를 블롭으로 변환
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false)
          return
        }
        
        const file = new File([blob], `CareerLog_${categoryName}.png`, { type: 'image/png' })
        
        // Web Share API로 이미지 공유
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `${categoryName} 활동 기록`,
              files: [file]
            })
            resolve(true)
          } catch (error) {
            resolve(false)
          }
        } else {
          // 이미지 다운로드
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `CareerLog_${categoryName}_${format(new Date(), "yyyyMMdd")}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          resolve(true)
        }
      }, 'image/png')
    })
      } catch (error) {
      return false
    }
} 