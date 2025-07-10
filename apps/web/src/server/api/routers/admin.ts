import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '../trpc';

export const adminRouter = createTRPCRouter({
  // 전체 사용자 목록 조회
  getAllUsers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');
      
      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      const { limit, offset, search } = input;

      if (isDevelopmentMode) {
        // 모의 사용자 데이터
        const mockUsers = [
          {
            id: 'user-1',
            email: 'doctor1@hospital.com',
            user_metadata: { full_name: '김의사', role: 'user' },
            created_at: '2024-01-15T09:00:00Z',
            last_sign_in_at: '2024-01-20T14:30:00Z',
            email_confirmed_at: '2024-01-15T09:05:00Z',
            activity_count: 45,
            last_activity_date: '2024-01-20',
          },
          {
            id: 'user-2',
            email: 'nurse1@hospital.com',
            user_metadata: { full_name: '이간호사', role: 'user' },
            created_at: '2024-01-10T11:00:00Z',
            last_sign_in_at: '2024-01-19T16:20:00Z',
            email_confirmed_at: '2024-01-10T11:05:00Z',
            activity_count: 32,
            last_activity_date: '2024-01-19',
          },
          {
            id: 'admin-1',
            email: 'admin@careerlog.com',
            user_metadata: { full_name: '관리자', role: 'admin', admin_level: 'super' },
            created_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: '2024-01-20T18:00:00Z',
            email_confirmed_at: '2024-01-01T00:05:00Z',
            activity_count: 0,
            last_activity_date: null,
          },
          {
            id: 'user-3',
            email: 'doctor2@hospital.com',
            user_metadata: { full_name: '박전문의', role: 'user' },
            created_at: '2024-01-12T15:30:00Z',
            last_sign_in_at: '2024-01-18T10:15:00Z',
            email_confirmed_at: '2024-01-12T15:35:00Z',
            activity_count: 28,
            last_activity_date: '2024-01-18',
          },
          {
            id: 'user-4',
            email: 'resident1@hospital.com',
            user_metadata: { full_name: '최레지던트', role: 'user' },
            created_at: '2024-01-18T09:00:00Z',
            last_sign_in_at: '2024-01-20T12:00:00Z',
            email_confirmed_at: '2024-01-18T09:05:00Z',
            activity_count: 15,
            last_activity_date: '2024-01-20',
          },
        ];

        // 검색 필터 적용
        let filteredUsers = mockUsers;
        if (search) {
          filteredUsers = mockUsers.filter(user => 
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.user_metadata?.full_name?.toLowerCase().includes(search.toLowerCase())
          );
        }

        // 페이지네이션 적용
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);

        return {
          users: paginatedUsers,
          totalCount: filteredUsers.length,
          hasMore: offset + limit < filteredUsers.length,
        };
      }

      // 실제 Supabase 구현 (여기서는 스킵)
      return {
        users: [],
        totalCount: 0,
        hasMore: false,
      };
    }),

  // 시스템 전체 통계 조회
  getSystemStats: protectedProcedure.query(async ({ ctx }) => {
    // 개발 모드 확인
    const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                             process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');
    
    // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
    if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
      throw new Error('관리자 권한이 필요합니다.');
    }

    if (isDevelopmentMode) {
      return {
        totalUsers: 125,
        activeUsers: 89,
        totalLogs: 2847,
        reportsGenerated: 156,
        dailyActiveUsers: [
          { date: '2024-01-14', count: 45 },
          { date: '2024-01-15', count: 52 },
          { date: '2024-01-16', count: 48 },
          { date: '2024-01-17', count: 61 },
          { date: '2024-01-18', count: 55 },
          { date: '2024-01-19', count: 67 },
          { date: '2024-01-20', count: 73 },
        ],
        categoryStats: [
          { category: '수술', count: 856, percentage: 30.1 },
          { category: '진료', count: 742, percentage: 26.1 },
          { category: '교육', count: 485, percentage: 17.0 },
          { category: '연구', count: 398, percentage: 14.0 },
          { category: '학회', count: 256, percentage: 9.0 },
          { category: '기타', count: 110, percentage: 3.8 },
        ],
        monthlyGrowth: {
          userGrowth: 12.5,
          activityGrowth: 28.3,
          reportGrowth: 15.7,
        },
      };
    }

    // 실제 Supabase 구현 (여기서는 스킵)
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalLogs: 0,
      reportsGenerated: 0,
      dailyActiveUsers: [],
      categoryStats: [],
      monthlyGrowth: {
        userGrowth: 0,
        activityGrowth: 0,
        reportGrowth: 0,
      },
    };
  }),

  // 시스템 설정 조회
  getSystemSettings: protectedProcedure.query(async ({ ctx }) => {
    // 개발 모드 확인
    const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                             process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');
    
    // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
    if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
      throw new Error('관리자 권한이 필요합니다.');
    }

    if (isDevelopmentMode) {
      return {
        siteName: 'CareerLog',
        siteDescription: '의료진을 위한 커리어 관리 플랫폼',
        allowUserRegistration: true,
        requireEmailVerification: true,
        maxLogsPerUser: 1000,
        maxFileUploadSize: 10,
        enableNotifications: true,
        maintenanceMode: false,
        systemVersion: '2.1.0',
        lastBackup: '2024-01-20T02:00:00Z',
        storageUsed: 1250,
        storageLimit: 5000,
      };
    }

    return {};
  }),

  // 시스템 설정 업데이트
  updateSystemSettings: protectedProcedure
    .input(
      z.object({
        siteName: z.string().optional(),
        siteDescription: z.string().optional(),
        allowUserRegistration: z.boolean().optional(),
        requireEmailVerification: z.boolean().optional(),
        maxLogsPerUser: z.number().optional(),
        maxFileUploadSize: z.number().optional(),
        enableNotifications: z.boolean().optional(),
        maintenanceMode: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');
      
      // 최고 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && (ctx.user?.user_metadata?.role !== 'admin' || 
          ctx.user?.user_metadata?.admin_level !== 'super')) {
        throw new Error('최고 관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        return { success: true, message: '설정이 성공적으로 업데이트되었습니다.' };
      }

      return { success: false, message: '실제 환경에서는 구현되지 않았습니다.' };
    }),

  // 사용자 삭제 (관리자 전용)
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');
      
      // 최고 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && (ctx.user?.user_metadata?.role !== 'admin' || 
          ctx.user?.user_metadata?.admin_level !== 'super')) {
        throw new Error('최고 관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        return { success: true, message: '사용자가 성공적으로 삭제되었습니다.' };
      }

      return { success: false, message: '실제 환경에서는 구현되지 않았습니다.' };
    }),
}); 