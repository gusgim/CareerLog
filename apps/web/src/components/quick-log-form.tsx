"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileUpload } from "@/components/file-upload"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/provider"
import { CATEGORIES, type CategoryId } from "@/lib/constants/categories"
import { X, Plus, Tag, Clock, Calendar, Save, Loader2, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { type FileUploadResult } from "@/lib/utils/file-upload"

const formSchema = z.object({
  log_date: z.string().min(1, "날짜를 선택해주세요"),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  subcategory: z.string().optional(),
  details: z.string().min(5, "활동 내용을 5자 이상 입력해주세요"),
  tags: z.array(z.string()).default([]),
  duration_hours: z.number()
    .min(0.5, "최소 0.5시간 이상 입력해주세요")
    .max(24, "최대 24시간까지만 입력 가능합니다")
    .optional(),
  metadata: z.record(z.any()).default({}),
  attachments: z.array(z.object({
    url: z.string(),
    path: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string()
  })).default([]),
})

type FormData = z.infer<typeof formSchema>

interface QuickLogFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  editLog?: any // 편집할 로그 데이터 (편집 모드에서 사용)
}

export function QuickLogForm({ open, onOpenChange, onSuccess, editLog }: QuickLogFormProps) {
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "">("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  const [metadata, setMetadata] = useState<Record<string, any>>({})
  const [attachments, setAttachments] = useState<FileUploadResult[]>([])

  // 편집 모드 여부 확인
  const isEditMode = !!editLog

  // tRPC 훅 및 유틸리티
  const utils = api.useContext()
  
  const createLogMutation = api.log.create.useMutation({
    onSuccess: async () => {
      // 폼 리셋
      resetForm()
      
      // 모달 닫기
      onOpenChange(false)
      
      // tRPC 캐시 무효화 - 모든 log 관련 쿼리 갱신
      await Promise.all([
        utils.log.getAll.invalidate(),
        utils.log.getStats.invalidate(),
      ])
      
      // 성공 콜백 호출 (대시보드에서 토스트 처리)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: "❌ 등록 오류 발생!",
        description: error.message || "활동 기록에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000
      })
    },
  })

  const updateLogMutation = api.log.update.useMutation({
    onSuccess: async () => {
      // 폼 리셋
      resetForm()
      
      // 모달 닫기
      onOpenChange(false)
      
      // tRPC 캐시 무효화 - 모든 log 관련 쿼리 갱신
      await Promise.all([
        utils.log.getAll.invalidate(),
        utils.log.getStats.invalidate(),
      ])
      
      // 성공 콜백 호출
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: "❌ 수정 오류 발생!",
        description: error.message || "활동 수정에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000
      })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      log_date: format(new Date(), "yyyy-MM-dd"),
      category: "",
      subcategory: "",
      details: "",
      tags: [],
      duration_hours: undefined,
      metadata: {},
      attachments: [],
    },
  })

  // 폼 리셋 함수
  const resetForm = () => {
    reset()
    setTags([])
    setSelectedCategory("")
    setSelectedSubcategory("")
    setMetadata({})
    setAttachments([])
  }

  // 편집 모드일 때 폼 초기화
  useEffect(() => {
    if (isEditMode && editLog && open) {
      // 기본 필드 설정
      setValue("log_date", editLog.log_date)
      setValue("category", editLog.category)
      setValue("subcategory", editLog.subcategory || "")
      setValue("details", editLog.details)
      setValue("duration_hours", editLog.duration_hours)
      
      // 태그 설정
      const logTags = editLog.tags || []
      setTags(logTags)
      setValue("tags", logTags)
      
      // 카테고리 설정
      setSelectedCategory(editLog.category as CategoryId)
      setSelectedSubcategory(editLog.subcategory || "")
      
      // 메타데이터 설정
      const logMetadata = editLog.metadata || {}
      setMetadata(logMetadata)
      setValue("metadata", logMetadata)
      
      // 첨부파일 설정
      const logAttachments = editLog.attachments || []
      setAttachments(logAttachments)
      setValue("attachments", logAttachments)
    } else if (!isEditMode && open) {
      // 생성 모드일 때는 초기값으로 리셋
      resetForm()
      setValue("log_date", format(new Date(), "yyyy-MM-dd"))
    }
  }, [isEditMode, editLog, open, setValue])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setValue("tags", updatedTags)
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    setValue("tags", updatedTags)
  }

  const handleMetadataChange = (key: string, value: any) => {
    const newMetadata = { ...metadata, [key]: value }
    setMetadata(newMetadata)
    setValue("metadata", newMetadata)
  }

  const handleFilesChange = (files: FileUploadResult[]) => {
    setAttachments(files)
    setValue("attachments", files)
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode) {
        await updateLogMutation.mutateAsync({
          id: editLog.id,
          ...data,
          metadata,
          attachments,
        })
      } else {
        await createLogMutation.mutateAsync({
          ...data,
          metadata,
          attachments,
        })
      }
    } catch (error) {
      // 에러는 onError에서 처리됨
    }
  }

  const selectedCategoryData = selectedCategory ? CATEGORIES[selectedCategory] : null
  const currentSubcategories = selectedCategoryData && 'subcategories' in selectedCategoryData 
    ? selectedCategoryData.subcategories : []
  const currentFields = selectedCategoryData && 'fields' in selectedCategoryData 
    ? selectedCategoryData.fields : []

  // 교육 카테고리의 경우 서브카테고리별 필드 가져오기
  const getEducationFields = () => {
    if (selectedCategory !== "education" || !selectedSubcategory) return []
    const subcategoryData = currentSubcategories.find((sub: any) => sub.id === selectedSubcategory)
    return subcategoryData && 'fields' in subcategoryData ? subcategoryData.fields : []
  }

  // 간호성과 카테고리의 경우 역할 옵션 가져오기
  const getPerformanceRoles = () => {
    if (selectedCategory !== "performance" || !metadata.subcategory) return []
    const subcategoryData = currentSubcategories.find((sub: any) => sub.id === metadata.subcategory)
    return subcategoryData && 'roles' in subcategoryData ? subcategoryData.roles : []
  }

  const renderDynamicFields = () => {
    if (!selectedCategory) return null

    if (selectedCategory === "clinical") {
      return currentFields.map((field: any) => (
        <div key={field.key} className="space-y-2">
          <Label className="korean-text">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.type === "select" && field.options ? (
            <Select onValueChange={(value) => handleMetadataChange(field.key, value)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder={`${field.label}를 선택하세요`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option: any) => (
                  <SelectItem key={option} value={option}>
                    <span className="korean-text">{option}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === "textarea" ? (
            <Textarea
              placeholder={field.placeholder}
              onChange={(e) => handleMetadataChange(field.key, e.target.value)}
              className="min-h-[80px] text-base resize-none"
            />
          ) : (
            <Input
              type="text"
              placeholder={field.placeholder}
              onChange={(e) => handleMetadataChange(field.key, e.target.value)}
              className="h-12 text-base"
            />
          )}
        </div>
      ))
    }

    if (selectedCategory === "education" && selectedSubcategory) {
      const fields = getEducationFields()
      return fields.map((field: any) => (
        <div key={field.key} className="space-y-2">
          <Label className="korean-text">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.type === "select" && field.options ? (
            <Select onValueChange={(value) => handleMetadataChange(field.key, value)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder={`${field.label}를 선택하세요`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option: any) => (
                  <SelectItem key={option} value={option}>
                    <span className="korean-text">{option}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === "textarea" ? (
            <Textarea
              placeholder={field.placeholder}
              onChange={(e) => handleMetadataChange(field.key, e.target.value)}
              className="min-h-[80px] text-base resize-none"
            />
          ) : (
            <Input
              type="text"
              placeholder={field.placeholder}
              onChange={(e) => handleMetadataChange(field.key, e.target.value)}
              className="h-12 text-base"
            />
          )}
        </div>
      ))
    }

    if (selectedCategory === "performance") {
      return currentFields.map((field: any) => {
        if (field.key === "subcategory") {
          return (
            <div key={field.key} className="space-y-2">
              <Label className="korean-text">
                {field.label}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select onValueChange={(value) => handleMetadataChange(field.key, value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="세부 항목을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {currentSubcategories.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      <span className="korean-text">{sub.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }

        if (field.key === "role") {
          const roles = getPerformanceRoles()
          if (roles.length === 0) return null
          
          return (
            <div key={field.key} className="space-y-2">
              <Label className="korean-text">
                {field.label}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select onValueChange={(value) => handleMetadataChange(field.key, value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="역할/결과를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role} value={role}>
                      <span className="korean-text">{role}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }

        return (
          <div key={field.key} className="space-y-2">
            <Label className="korean-text">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                placeholder={field.placeholder}
                onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                className="min-h-[100px] text-base resize-none"
              />
            ) : (
              <Input
                type="text"
                placeholder={field.placeholder}
                onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                className="h-12 text-base"
              />
            )}
          </div>
        )
      })
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 korean-text">
            <span className="text-2xl">⚡</span>
            <span>{isEditMode ? "활동 수정" : "새 활동 등록"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 날짜 선택 */}
          <div className="space-y-2">
            <Label htmlFor="log_date" className="flex items-center space-x-2 korean-text">
              <Calendar className="h-4 w-4" />
              <span>날짜</span>
            </Label>
            <Input
              id="log_date"
              type="date"
              {...register("log_date")}
              className="h-12 text-base"
            />
            {errors.log_date && (
              <p className="text-sm text-red-500">{errors.log_date.message}</p>
            )}
          </div>

          {/* 메인 카테고리 선택 */}
          <div className="space-y-2">
            <Label className="korean-text">
              카테고리 <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select 
              value={selectedCategory} 
              onValueChange={(value: CategoryId) => {
                setSelectedCategory(value)
                setSelectedSubcategory("")
                setMetadata({})
                setValue("category", value)
                setValue("subcategory", "")
                setValue("metadata", {})
              }}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CATEGORIES).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.emoji}</span>
                      <span className="korean-text">{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* 교육 카테고리의 서브카테고리 */}
          {selectedCategory === "education" && (
            <div className="space-y-2">
              <Label className="korean-text">
                교육 유형 <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                value={selectedSubcategory}
                onValueChange={(value) => {
                  setSelectedSubcategory(value)
                  setValue("subcategory", value)
                  setMetadata({})
                }}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="교육 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {currentSubcategories.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      <span className="korean-text">{sub.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 동적 필드 렌더링 */}
          {renderDynamicFields()}

          {/* 소요 시간 */}
          <div className="space-y-2">
            <Label htmlFor="duration_hours" className="flex items-center space-x-2 korean-text">
              <Clock className="h-4 w-4" />
              <span>소요 시간 (시간)</span>
            </Label>
            <Input
              id="duration_hours"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              placeholder="예: 2.5"
              {...register("duration_hours", {
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? undefined : Number(value),
              })}
              className="h-12 text-base"
            />
            <p className="text-xs text-gray-500 korean-text">
              최소 0.5 ~ 최대 24 까지 입력 가능
            </p>
            {errors.duration_hours && (
              <p className="text-sm text-red-500">{errors.duration_hours.message}</p>
            )}
          </div>

          {/* 추가 설명 */}
          <div className="space-y-2">
            <Label htmlFor="details" className="korean-text">
              추가 설명
            </Label>
            <Textarea
              id="details"
              placeholder="활동에 대한 추가적인 설명이나 특이사항을 기록해주세요..."
              {...register("details")}
              className="min-h-[100px] text-base resize-none"
            />
            {errors.details && (
              <p className="text-sm text-red-500">{errors.details.message}</p>
            )}
          </div>

          {/* 첨부파일 */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 korean-text">
              <Paperclip className="h-4 w-4" />
              <span>첨부파일</span>
            </Label>
            <FileUpload
              onFilesChange={handleFilesChange}
              maxFiles={5}
              disabled={createLogMutation.isLoading}
            />
          </div>

          {/* 태그 입력 */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 korean-text">
              <Tag className="h-4 w-4" />
              <span>태그</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                placeholder="태그를 입력하세요"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 h-10 text-base"
              />
              <Button
                type="button"
                size="sm"
                onClick={addTag}
                className="h-10 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createLogMutation.isLoading}
              className="korean-text"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={createLogMutation.isLoading}
              className="korean-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {createLogMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "수정하기" : "등록하기"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 