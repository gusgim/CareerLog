// 의료진 맞춤 카테고리 정의
export const CATEGORIES = {
  clinical: {
    id: "clinical",
    name: "근무",
    emoji: "🏥",
    description: "일상 근무 및 수술 관련 활동",
    color: {
      primary: "#2563eb", // blue-600
      light: "#dbeafe", // blue-50
      border: "#2563eb", // blue-600
      text: "#1d4ed8", // blue-700
    },
    fields: [
      {
        key: "duty_type",
        label: "듀티",
        type: "select",
        options: ["Day", "Evening", "Night", "11시", "기타"],
        required: true,
      },
      {
        key: "operating_room",
        label: "수술방",
        type: "text",
        placeholder: "예: 6번 수술방, 중앙수술실 3번",
        required: false,
      },
      {
        key: "surgery_name",
        label: "수술명",
        type: "text",
        placeholder: "예: 정형외과-고관절, 외과-담낭절제술",
        required: false,
      },
      {
        key: "professor",
        label: "교수님",
        type: "text",
        placeholder: "예: 김명인 교수님",
        required: false,
      },
      {
        key: "patient_notes",
        label: "환자 특이사항",
        type: "textarea",
        placeholder: "예: 과다출혈, 바이탈 불안정, 알레르기 반응 등",
        required: false,
      },
    ],
  },
  education: {
    id: "education",
    name: "교육",
    emoji: "📚",
    description: "교육 및 학습 관련 활동",
    color: {
      primary: "#7c3aed", // violet-600
      light: "#f3f4f6", // violet-50
      border: "#7c3aed", // violet-600
      text: "#6d28d9", // violet-700
    },
    subcategories: [
      {
        id: "internal_education",
        name: "사내교육",
        fields: [
          {
            key: "education_title",
            label: "교육명",
            type: "text",
            placeholder: "예: 감염관리 교육, CPR 재교육",
            required: true,
          },
          {
            key: "main_content",
            label: "주요내용",
            type: "textarea",
            placeholder: "교육의 핵심 내용을 기록해주세요",
            required: true,
          },
          {
            key: "special_notes",
            label: "특이사항",
            type: "textarea",
            placeholder: "인상 깊었던 내용이나 개선사항 등",
            required: false,
          },
        ],
      },
      {
        id: "external_education",
        name: "사외교육",
        fields: [
          {
            key: "education_title",
            label: "교육명",
            type: "text",
            placeholder: "예: 대한간호협회 세미나, 학회 참석",
            required: true,
          },
          {
            key: "institution",
            label: "교육기관",
            type: "text",
            placeholder: "예: 대한간호협회, 서울대학교",
            required: false,
          },
          {
            key: "main_content",
            label: "주요내용",
            type: "textarea",
            placeholder: "교육의 핵심 내용을 기록해주세요",
            required: true,
          },
          {
            key: "special_notes",
            label: "특이사항",
            type: "textarea",
            placeholder: "인상 깊었던 내용이나 개선사항 등",
            required: false,
          },
        ],
      },
      {
        id: "test_participation",
        name: "테스트 응시",
        fields: [
          {
            key: "test_name",
            label: "테스트명",
            type: "text",
            placeholder: "예: 감염관리 인증시험, CPR 재인증",
            required: true,
          },
          {
            key: "result",
            label: "결과",
            type: "select",
            options: ["합격", "불합격", "진행중", "예정"],
            required: false,
          },
          {
            key: "score",
            label: "점수",
            type: "text",
            placeholder: "예: 85점, Pass",
            required: false,
          },
        ],
      },
    ],
  },
  performance: {
    id: "performance",
    name: "간호성과 및 혁신추구",
    emoji: "🏆",
    description: "성과 개선 및 혁신 활동",
    color: {
      primary: "#059669", // emerald-600
      light: "#ecfdf5", // emerald-50
      border: "#059669", // emerald-600
      text: "#047857", // emerald-700
    },
    subcategories: [
      {
        id: "autonomous_innovation",
        name: "자율적 혁신",
        roles: ["리더", "팀원"],
      },
      {
        id: "clinical_research",
        name: "임상연구",
        roles: ["리더", "팀원"],
      },
      {
        id: "nursing_case_presentation",
        name: "간호사례발표",
        roles: ["발표", "채택", "제출"],
      },
      {
        id: "department_autonomous_task",
        name: "부서자율과제",
        roles: ["리더", "팀원"],
      },
      {
        id: "creative_learning",
        name: "창의학습",
        roles: ["리더", "팀원"],
      },
      {
        id: "lets_tac",
        name: "즉개선(Let's tac)",
        roles: ["포상", "제출"],
      },
      {
        id: "self_innovation",
        name: "Self 혁신",
        roles: ["포상", "제출"],
      },
      {
        id: "safety_design",
        name: "SAFTY Design",
        roles: ["포상", "제출"],
      },
      {
        id: "proposal_system",
        name: "제안제도",
        roles: ["채택"],
      },
      {
        id: "pico",
        name: "PICO",
        roles: ["채택", "기각"],
      },
    ],
    fields: [
      {
        key: "subcategory",
        label: "세부 항목",
        type: "select",
        required: true,
      },
      {
        key: "role",
        label: "역할/결과",
        type: "select",
        required: true,
      },
      {
        key: "project_title",
        label: "프로젝트/과제명",
        type: "text",
        placeholder: "프로젝트나 과제의 제목을 입력해주세요",
        required: true,
      },
      {
        key: "description",
        label: "상세 내용",
        type: "textarea",
        placeholder: "활동 내용, 성과, 배운 점 등을 상세히 기록해주세요",
        required: true,
      },
      {
        key: "outcome",
        label: "성과 및 결과",
        type: "textarea",
        placeholder: "구체적인 성과나 결과를 기록해주세요",
        required: false,
      },
    ],
  },
} as const

export type CategoryId = keyof typeof CATEGORIES
export type Category = typeof CATEGORIES[CategoryId] 