"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CheckCircle2, XCircle, AlertTriangle, Plus, Edit2, Users, Shield, Award, Calendar, Building2 } from "lucide-react"
import { api } from "@/lib/trpc/provider"
import { useToast } from "@/hooks/use-toast"

interface QualificationFormData {
  id?: number
  name: string
  name_ko: string
  description: string
  category: 'education' | 'certification' | 'experience' | 'training'
  required_for_rooms: string[]
  required_experience_years: number
  is_mandatory: boolean
}

export function QualificationManagement() {
  const { toast } = useToast()
  const [activeView, setActiveView] = useState<'requirements' | 'status' | 'matrix'>('requirements')
  const [showQualificationDialog, setShowQualificationDialog] = useState(false)
  const [editingQualification, setEditingQualification] = useState<QualificationFormData | null>(null)

  // API 쿼리
  const { data: qualifications, refetch: refetchQualifications } = api.admin.getAllQualifications.useQuery(
    undefined,
    { retry: false }
  )
  const { data: staffQualifications } = api.admin.getStaffQualifications.useQuery(
    undefined,
    { retry: false }
  )
  const { data: placementMatrix } = api.admin.getPlacementMatrix.useQuery(
    undefined,
    { retry: false }
  )

  // Mutations
  const createOrUpdateQualification = api.admin.createOrUpdateQualification.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ 성공!",
        description: data.message,
        variant: "success",
      })
      setShowQualificationDialog(false)
      setEditingQualification(null)
      refetchQualifications()
    },
    onError: (error) => {
      toast({
        title: "❌ 오류!",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const assignQualification = api.admin.assignStaffQualification.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ 성공!",
        description: data.message,
        variant: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "❌ 오류!",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleQualificationSubmit = (formData: QualificationFormData) => {
    createOrUpdateQualification.mutate(formData)
  }

  const handleEditQualification = (qualification: any) => {
    setEditingQualification(qualification)
    setShowQualificationDialog(true)
  }

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      education: { label: '교육', color: 'bg-blue-100 text-blue-800' },
      certification: { label: '인증', color: 'bg-green-100 text-green-800' },
      experience: { label: '경험', color: 'bg-purple-100 text-purple-800' },
      training: { label: '훈련', color: 'bg-orange-100 text-orange-800' },
    }
    const config = categoryMap[category as keyof typeof categoryMap] || { label: category, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
  }

  const getPlacementIcon = (canWork: boolean) => {
    return canWork ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  return (
    <div className="space-y-6">
      {/* 상단 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <Button
          variant={activeView === 'requirements' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('requirements')}
          className="flex-1 korean-text"
        >
          <Shield className="h-4 w-4 mr-2" />
          자격 요건 관리
        </Button>
        <Button
          variant={activeView === 'status' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('status')}
          className="flex-1 korean-text"
        >
          <Users className="h-4 w-4 mr-2" />
          근무자 현황
        </Button>
        <Button
          variant={activeView === 'matrix' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('matrix')}
          className="flex-1 korean-text"
        >
          <Building2 className="h-4 w-4 mr-2" />
          배치 매트릭스
        </Button>
      </div>

      {/* 자격 요건 관리 */}
      {activeView === 'requirements' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="korean-text">자격 요건 설정</CardTitle>
                <CardDescription className="korean-text">
                  수술방별 필요 자격 및 경력 요건을 관리합니다.
                </CardDescription>
              </div>
              <Dialog open={showQualificationDialog} onOpenChange={setShowQualificationDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="korean-text">
                    <Plus className="h-4 w-4 mr-2" />
                    새 자격 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="korean-text">
                      {editingQualification ? '자격 요건 수정' : '새 자격 요건 추가'}
                    </DialogTitle>
                    <DialogDescription className="korean-text">
                      자격 요건의 상세 정보를 입력하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <QualificationForm
                    initialData={editingQualification}
                    onSubmit={handleQualificationSubmit}
                    onCancel={() => {
                      setShowQualificationDialog(false)
                      setEditingQualification(null)
                    }}
                    isLoading={createOrUpdateQualification.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="korean-text">자격명</TableHead>
                    <TableHead className="korean-text">카테고리</TableHead>
                    <TableHead className="korean-text">필요 경력</TableHead>
                    <TableHead className="korean-text">필수 여부</TableHead>
                    <TableHead className="korean-text">적용 수술방</TableHead>
                    <TableHead className="korean-text">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualifications?.map((qual) => (
                    <TableRow key={qual.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium korean-text">{qual.name_ko}</div>
                          <div className="text-sm text-gray-500">{qual.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(qual.category)}</TableCell>
                      <TableCell className="korean-text">
                        {qual.required_experience_years}년 이상
                      </TableCell>
                      <TableCell>
                        <Badge variant={qual.is_mandatory ? 'destructive' : 'secondary'} className="korean-text">
                          {qual.is_mandatory ? '필수' : '선택'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {qual.required_for_rooms.length > 0 ? (
                            qual.required_for_rooms.map((room: string) => (
                              <Badge key={room} variant="outline" className="text-xs">
                                {room}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 korean-text">전체</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditQualification(qual)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 근무자 자격 현황 */}
      {activeView === 'status' && (
        <div className="space-y-6">
          {staffQualifications?.map((staff) => (
            <Card key={staff.userId}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="korean-text">{staff.fullName}</CardTitle>
                    <CardDescription className="korean-text">
                      {staff.department} • {staff.yearsOfExperience}년차
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="korean-text">
                    자격 {staff.qualifications.length}개 보유
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 보유 자격 */}
                  <div>
                    <h4 className="text-sm font-medium text-green-700 korean-text mb-3 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      보유 자격 ({staff.qualifications.length}개)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {staff.qualifications.map((qual) => (
                        <div
                          key={qual.id}
                          className="p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        >
                          <div className="font-medium text-sm korean-text">{qual.name_ko}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 korean-text">
                            취득: {qual.obtained_date}
                          </div>
                          {qual.expiry_date && (
                            <div className="text-xs text-orange-600 korean-text">
                              만료: {qual.expiry_date}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 미보유 자격 */}
                  {staff.missingQualifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-orange-700 korean-text mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        미보유 자격 ({staff.missingQualifications.length}개)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {staff.missingQualifications.map((missing) => (
                          <div
                            key={missing.id}
                            className="p-3 border border-orange-200 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                          >
                            <div className="font-medium text-sm korean-text">{missing.name_ko}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 korean-text">
                              {missing.reason}
                            </div>
                            <Button size="sm" className="mt-2 h-7 text-xs korean-text">
                              자격 할당
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 배치 가능성 매트릭스 */}
      {activeView === 'matrix' && placementMatrix && (
        <Card>
          <CardHeader>
            <CardTitle className="korean-text">배치 가능성 매트릭스</CardTitle>
            <CardDescription className="korean-text">
              근무자별 각 수술방 배치 가능 여부를 한눈에 확인할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="korean-text min-w-[200px]">근무자</TableHead>
                    {placementMatrix.operatingRooms.map((room) => (
                      <TableHead key={room.id} className="text-center min-w-[120px]">
                        <div className="korean-text">{room.name}</div>
                        <div className="text-xs text-gray-500 korean-text">{room.specialty}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {placementMatrix.staff.map((staff) => (
                    <TableRow key={staff.userId}>
                      <TableCell>
                        <div>
                          <div className="font-medium korean-text">{staff.fullName}</div>
                          <div className="text-sm text-gray-500 korean-text">
                            {staff.department} • {staff.yearsOfExperience}년차
                          </div>
                        </div>
                      </TableCell>
                      {placementMatrix.operatingRooms.map((room) => {
                        const placement = (staff.placements as any)[room.id]
                        return (
                          <TableCell key={room.id} className="text-center">
                            <div className="flex flex-col items-center space-y-1">
                              {getPlacementIcon(placement.canWork)}
                              <div className="text-xs text-gray-600 dark:text-gray-400 korean-text max-w-[100px] leading-tight">
                                {placement.reason}
                              </div>
                            </div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 범례 */}
            <div className="mt-6 flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="korean-text">배치 가능</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="korean-text">배치 불가</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 자격 폼 컴포넌트
interface QualificationFormProps {
  initialData?: QualificationFormData | null
  onSubmit: (data: QualificationFormData) => void
  onCancel: () => void
  isLoading: boolean
}

function QualificationForm({ initialData, onSubmit, onCancel, isLoading }: QualificationFormProps) {
  const [formData, setFormData] = useState<QualificationFormData>({
    id: initialData?.id,
    name: initialData?.name || '',
    name_ko: initialData?.name_ko || '',
    description: initialData?.description || '',
    category: initialData?.category || 'training',
    required_for_rooms: initialData?.required_for_rooms || [],
    required_experience_years: initialData?.required_experience_years || 0,
    is_mandatory: initialData?.is_mandatory || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleRoomsChange = (roomsText: string) => {
    const rooms = roomsText.split(',').map(room => room.trim()).filter(room => room.length > 0)
    setFormData(prev => ({ ...prev, required_for_rooms: rooms }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="korean-text">자격 코드</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="예: OR_CARDIAC"
            required
          />
        </div>
        <div>
          <Label htmlFor="name_ko" className="korean-text">자격명 (한국어)</Label>
          <Input
            id="name_ko"
            value={formData.name_ko}
            onChange={(e) => setFormData(prev => ({ ...prev, name_ko: e.target.value }))}
            placeholder="예: 심장수술실 자격"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="korean-text">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="자격에 대한 상세 설명을 입력하세요"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category" className="korean-text">카테고리</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="training">훈련</SelectItem>
              <SelectItem value="certification">인증</SelectItem>
              <SelectItem value="education">교육</SelectItem>
              <SelectItem value="experience">경험</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="experience" className="korean-text">필요 경력 (년)</Label>
          <Input
            id="experience"
            type="number"
            min="0"
            value={formData.required_experience_years}
            onChange={(e) => setFormData(prev => ({ ...prev, required_experience_years: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rooms" className="korean-text">적용 수술방 (쉼표로 구분)</Label>
        <Input
          id="rooms"
          value={formData.required_for_rooms.join(', ')}
          onChange={(e) => handleRoomsChange(e.target.value)}
          placeholder="예: OR1, OR2, RR1"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="mandatory"
          checked={formData.is_mandatory}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_mandatory: checked }))}
        />
        <Label htmlFor="mandatory" className="korean-text">필수 자격</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="korean-text">
          취소
        </Button>
        <Button type="submit" disabled={isLoading} className="korean-text">
          {isLoading ? '저장 중...' : (initialData ? '수정' : '생성')}
        </Button>
      </div>
    </form>
  )
} 