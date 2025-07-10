import { createClient } from "@/lib/supabase/client"

// 허용된 파일 타입
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
  documents: ['application/pdf']
} as const

// 파일 크기 제한 (바이트)
export const FILE_SIZE_LIMITS = {
  pdf: 5 * 1024 * 1024, // 5MB
  image: 5 * 1024 * 1024, // 5MB (10MB에서 5MB로 변경)
} as const

export interface FileUploadResult {
  url: string
  path: string
  name: string
  size: number
  type: string
}

export interface FileValidationError {
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED'
  message: string
}

/**
 * 파일 타입 검증
 */
export function validateFileType(file: File): boolean {
  const allAllowedTypes = [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents]
  return allAllowedTypes.includes(file.type as any)
}

/**
 * 파일 크기 검증
 */
export function validateFileSize(file: File): boolean {
  if (file.type === 'application/pdf') {
    return file.size <= FILE_SIZE_LIMITS.pdf
  } else if (ALLOWED_FILE_TYPES.images.includes(file.type as any)) {
    return file.size <= FILE_SIZE_LIMITS.image
  }
  return false
}

/**
 * 파일 검증 (타입 + 크기)
 */
export function validateFile(file: File): FileValidationError | null {
  if (!validateFileType(file)) {
    return {
      code: 'INVALID_TYPE',
      message: 'PDF 또는 이미지 파일만 업로드 가능합니다.'
    }
  }

  if (!validateFileSize(file)) {
    const limit = file.type === 'application/pdf' ? '5MB' : '5MB'
    return {
      code: 'FILE_TOO_LARGE',
      message: `파일 크기가 ${limit}를 초과합니다.`
    }
  }

  return null
}

/**
 * 파일 이름 생성 (중복 방지)
 */
export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${userId}/${timestamp}-${randomStr}.${extension}`
}

/**
 * 파일을 Supabase Storage에 업로드
 */
export async function uploadFileToSupabase(
  file: File,
  userId: string,
  bucket: string = 'attachments'
): Promise<FileUploadResult> {
  const supabase = createClient()
  
  // 파일 검증
  const validationError = validateFile(file)
  if (validationError) {
    throw new Error(validationError.message)
  }

  // 파일 이름 생성
  const fileName = generateFileName(file.name, userId)

  try {
    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error('파일 업로드에 실패했습니다.')
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return {
      url: urlData.publicUrl,
      path: fileName,
      name: file.name,
      size: file.size,
      type: file.type
    }
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error('파일 업로드 중 오류가 발생했습니다.')
  }
}

/**
 * 파일 삭제
 */
export async function deleteFileFromSupabase(
  filePath: string,
  bucket: string = 'attachments'
): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('File delete error:', error)
    return false
  }
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 파일 타입에 따른 아이콘 반환
 */
export function getFileIcon(fileType: string): string {
  if (fileType === 'application/pdf') return '📄'
  if (fileType.startsWith('image/')) return '🖼️'
  return '📎'
}

/**
 * 이미지 파일 미리보기 URL 생성
 */
export function createImagePreviewUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
} 