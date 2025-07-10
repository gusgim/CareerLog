"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  X, 
  FileText, 
  Eye,
  Download,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  validateFile, 
  uploadFileToSupabase, 
  deleteFileFromSupabase,
  formatFileSize,
  getFileIcon,
  createImagePreviewUrl,
  type FileUploadResult
} from "@/lib/utils/file-upload"
import { useAuth } from "@/contexts/auth-context"

interface FileUploadProps {
  onFilesChange: (files: FileUploadResult[]) => void
  maxFiles?: number
  disabled?: boolean
}

interface UploadingFile {
  file: File
  progress: number
  previewUrl?: string
  error?: string
}

export function FileUpload({ onFilesChange, maxFiles = 5, disabled = false }: FileUploadProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 파일 선택 처리
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || !user) return

    const filesArray = Array.from(files)
    const validFiles: File[] = []

    // 파일 검증
    for (const file of filesArray) {
      const validationError = validateFile(file)
      if (validationError) {
        toast({
          title: "파일 업로드 실패",
          description: `${file.name}: ${validationError.message}`,
          variant: "destructive"
        })
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // 최대 파일 수 체크
    if (uploadedFiles.length + validFiles.length > maxFiles) {
      toast({
        title: "파일 개수 초과",
        description: `최대 ${maxFiles}개의 파일만 업로드 가능합니다.`,
        variant: "destructive"
      })
      return
    }

    // 미리보기 URL 생성 및 업로딩 상태 설정
    const uploadingFilesWithPreview = await Promise.all(
      validFiles.map(async (file) => {
        let previewUrl: string | undefined
        if (file.type.startsWith('image/')) {
          previewUrl = await createImagePreviewUrl(file)
        }
        return {
          file,
          progress: 0,
          previewUrl
        }
      })
    )

    setUploadingFiles(prev => [...prev, ...uploadingFilesWithPreview])

    // 파일 업로드 처리
    for (let i = 0; i < uploadingFilesWithPreview.length; i++) {
      const { file } = uploadingFilesWithPreview[i]
      
      try {
        // 진행률 업데이트 (실제 업로드 진행률은 Supabase에서 제공하지 않으므로 시뮬레이션)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(uf => 
              uf.file === file && uf.progress < 90 
                ? { ...uf, progress: uf.progress + 10 }
                : uf
            )
          )
        }, 200)

        const uploadResult = await uploadFileToSupabase(file, user.id)
        
        clearInterval(progressInterval)
        
        // 업로드 완료
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, progress: 100 }
              : uf
          )
        )

        // 업로드된 파일 목록에 추가
        setUploadedFiles(prev => {
          const newFiles = [...prev, uploadResult]
          onFilesChange(newFiles)
          return newFiles
        })

        toast({
          title: "파일 업로드 완료",
          description: `${file.name}이 성공적으로 업로드되었습니다.`
        })

      } catch (error) {
        console.error('Upload error:', error)
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, error: error instanceof Error ? error.message : '업로드 실패' }
              : uf
          )
        )
        
        toast({
          title: "파일 업로드 실패",
          description: `${file.name}: ${error instanceof Error ? error.message : '업로드 중 오류 발생'}`,
          variant: "destructive"
        })
      }
    }

    // 완료된 업로딩 파일들 정리 (3초 후)
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(uf => uf.progress !== 100 && !uf.error))
    }, 3000)
  }, [user, uploadedFiles.length, maxFiles, onFilesChange])

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  // 파일 삭제
  const handleFileDelete = async (file: FileUploadResult) => {
    try {
      await deleteFileFromSupabase(file.path)
      setUploadedFiles(prev => {
        const newFiles = prev.filter(f => f.path !== file.path)
        onFilesChange(newFiles)
        return newFiles
      })
      
      toast({
        title: "파일 삭제 완료",
        description: `${file.name}이 삭제되었습니다.`
      })
    } catch (error) {
      toast({
        title: "파일 삭제 실패",
        description: "파일 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // 파일 미리보기
  const handleFilePreview = (file: FileUploadResult) => {
    if (file.type.startsWith('image/')) {
      window.open(file.url, '_blank')
    } else if (file.type === 'application/pdf') {
      window.open(file.url, '_blank')
    }
  }

  // 업로딩 파일 취소
  const handleUploadCancel = (file: File) => {
    setUploadingFiles(prev => prev.filter(uf => uf.file !== file))
  }

  return (
    <div className="space-y-4">
      {/* 파일 업로드 영역 */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium korean-text">
                파일을 여기에 드래그하거나 클릭하여 선택
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PDF, 이미지 파일 (각 최대 5MB)
              </p>
            </div>
            
            {/* 액션 버튼들 */}
            <div className="flex justify-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                파일 선택
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  cameraInputRef.current?.click()
                }}
                disabled={disabled}
              >
                <Camera className="h-4 w-4 mr-2" />
                카메라 (여러장)
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.multiple = true
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement
                    handleFileSelect(target.files)
                  }
                  input.click()
                }}
                disabled={disabled}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                갤러리 (여러장)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
      
      {/* 카메라 입력 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* 업로딩 중인 파일들 */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium korean-text">업로드 중...</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center space-x-3">
                {uploadingFile.previewUrl ? (
                  <img 
                    src={uploadingFile.previewUrl} 
                    alt="미리보기" 
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-lg">
                      {getFileIcon(uploadingFile.file.type)}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>
                  
                  {uploadingFile.error ? (
                    <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                  ) : (
                    <Progress value={uploadingFile.progress} className="mt-1" />
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUploadCancel(uploadingFile.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 업로드된 파일 목록 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium korean-text">첨부된 파일 ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center space-x-3">
                {file.type.startsWith('image/') ? (
                  <img 
                    src={file.url} 
                    alt="첨부 이미지" 
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {file.type === 'application/pdf' ? 'PDF' : '이미지'}
                  </Badge>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilePreview(file)}
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
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileDelete(file)}
                    title="삭제"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 