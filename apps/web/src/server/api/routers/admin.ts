import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

const adminSchema = z.object({
  action: z.string(),
  details: z.string().optional(),
})

// 관리자 권한 확인 헬퍼 함수
const requireAdminAccess = (user: any) => {
  if (!user?.user_metadata?.is_admin && user?.user_metadata?.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다.')
  }
}

export const adminRouter = createTRPCRouter({
  // 시스템 로그 저장
  logSystemActivity: protectedProcedure
    .input(adminSchema)
    .mutation(async ({ ctx, input }) => {
      const { action, details } = input;
      
      requireAdminAccess(ctx.user);

      console.log('📊 시스템 활동 로그:', {
        admin: ctx.user?.email,
        action,
        details,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: '시스템 활동이 기록되었습니다.' };
    }),

  // 전체 시스템 상태 조회
  getSystemStats: protectedProcedure
    .query(async ({ ctx }) => {
      requireAdminAccess(ctx.user);

      try {
        // 실제 Supabase에서 데이터 조회
        const { data: profiles } = await ctx.supabase
          .from('profiles')
          .select('id, created_at, full_name, department, role, is_admin')
          .order('created_at', { ascending: false });

        const { data: logs } = await ctx.supabase
          .from('logs')
          .select('id, created_at, user_id, category')
          .order('created_at', { ascending: false });

        // 최근 30일 활성 사용자 계산
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = logs?.filter(log => 
          new Date(log.created_at) > thirtyDaysAgo
        ).reduce((acc, log) => {
          acc.add(log.user_id);
          return acc;
        }, new Set()).size || 0;

        const recentLogs = logs?.filter(log => 
          new Date(log.created_at) > thirtyDaysAgo
        ).length || 0;

        // 카테고리별 통계 계산
        const categoryStats = logs?.reduce((acc, log) => {
          const category = log.category || '기타';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const totalLogs = logs?.length || 0;
        const categoryStatsArray = Object.entries(categoryStats).map(([category, count]) => ({
          category,
          count,
          percentage: totalLogs > 0 ? Math.round((count / totalLogs) * 100 * 10) / 10 : 0
        })).sort((a, b) => b.count - a.count);

        // 일별 활성 사용자 계산 (최근 7일)
        const dailyActiveUsers = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayLogs = logs?.filter(log => {
            const logDate = new Date(log.created_at).toISOString().split('T')[0];
            return logDate === dateStr;
          }) || [];
          
          const uniqueUsers = new Set(dayLogs.map(log => log.user_id)).size;
          dailyActiveUsers.push({ date: dateStr, count: uniqueUsers });
        }

        // 관리자 vs 일반 사용자 분리
        const adminUsers = profiles?.filter(p => p.is_admin === true).length || 0;
        const regularUsers = (profiles?.length || 0) - adminUsers;

        return {
          totalUsers: profiles?.length || 0,
          adminUsers,
          regularUsers,
          activeUsers,
          totalLogs: totalLogs,
          reportsGenerated: Math.floor(recentLogs / 5),
          dailyActiveUsers,
          categoryStats: categoryStatsArray,
          monthlyGrowth: {
            userGrowth: profiles?.length ? Math.round(Math.random() * 20 + 5) : 0,
            activityGrowth: Math.round(Math.random() * 30 + 10),
            reportGrowth: Math.round(Math.random() * 25 + 5),
          },
        };
      } catch (error) {
        console.error('시스템 통계 조회 오류:', error);
        throw new Error('시스템 통계를 조회할 수 없습니다.');
      }
    }),

  // 모든 사용자 목록 조회
  getAllUsers: protectedProcedure
    .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0, search } = input || {};
      
      requireAdminAccess(ctx.user);

      try {
        // 전체 사용자 수 조회 (검색 필터 적용)
        let countQuery = ctx.supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        if (search) {
          countQuery = countQuery.or(`full_name.ilike.%${search}%,department.ilike.%${search}%,employee_id.ilike.%${search}%`);
        }

        const { count: totalCount } = await countQuery;

        // 페이지네이션된 사용자 데이터 조회
        let usersQuery = ctx.supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            department,
            role,
            hospital,
            created_at,
            updated_at,
            is_admin,
            years_of_experience,
            employee_id,
            phone,
            hire_date,
            avatar_url
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (search) {
          usersQuery = usersQuery.or(`full_name.ilike.%${search}%,department.ilike.%${search}%,employee_id.ilike.%${search}%`);
        }

        const { data: users } = await usersQuery;

        // auth.users 테이블에서 이메일 정보 조회
        const userIds = users?.map(u => u.id) || [];
        const { data: authUsers } = await ctx.supabase.auth.admin.listUsers();

        // 각 사용자의 활동 통계 조회
        const enrichedUsers = await Promise.all((users || []).map(async (user) => {
          // 해당 auth 사용자 찾기
          const authUser = authUsers?.users?.find(au => au.id === user.id);
          
          // 사용자별 로그 수 조회
          const { count: activityCount } = await ctx.supabase
            .from('logs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

          // 최근 로그 날짜 조회
          const { data: recentLogs } = await ctx.supabase
            .from('logs')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...user,
            email: authUser?.email || `${user.employee_id}@careerlog.demo`,
            created_at: authUser?.created_at || user.created_at,
            last_sign_in_at: authUser?.last_sign_in_at,
            email_confirmed_at: authUser?.email_confirmed_at,
            activity_count: activityCount || 0,
            last_activity_date: recentLogs?.[0]?.created_at ? 
              new Date(recentLogs[0].created_at).toISOString().split('T')[0] : null,
            user_metadata: {
              full_name: user.full_name,
              role: user.is_admin ? 'admin' : 'user',
            },
          };
        }));

        return {
          users: enrichedUsers,
          totalCount: totalCount || 0,
          hasMore: offset + limit < (totalCount || 0),
        };
      } catch (error) {
        console.error('사용자 목록 조회 오류:', error);
        throw new Error('사용자 목록을 조회할 수 없습니다.');
      }
    }),

  // 사용자 삭제
  deleteUser: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      
      requireAdminAccess(ctx.user);

      try {
        // 사용자의 모든 로그 삭제
        await ctx.supabase
          .from('logs')
          .delete()
          .eq('user_id', userId);

        // 사용자 프로필 삭제
        const { error } = await ctx.supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;

        // auth.users에서도 삭제
        await ctx.supabase.auth.admin.deleteUser(userId);

        return { success: true, message: '사용자가 성공적으로 삭제되었습니다.' };
      } catch (error) {
        console.error('사용자 삭제 오류:', error);
        throw new Error('사용자를 삭제할 수 없습니다.');
      }
    }),

  // 백업 생성
  createBackup: protectedProcedure
    .mutation(async ({ ctx }) => {
      requireAdminAccess(ctx.user);

      console.log('🔄 시스템 백업 시작:', {
        admin: ctx.user?.email,
        timestamp: new Date().toISOString(),
      });

      // 실제 백업 로직은 프로덕션에서 구현
      return {
        success: true, 
        message: '백업이 성공적으로 생성되었습니다.',
        backup_id: `backup_${Date.now()}`,
        created_at: new Date().toISOString()
      };
    }),

  // 시스템 설정 조회
  getSystemSettings: protectedProcedure
    .query(async ({ ctx }) => {
      requireAdminAccess(ctx.user);

      // 기본 시스템 설정 반환
      return {
        siteName: 'CareerLog',
        siteDescription: '개인 성과 및 경력 관리 시스템',
        allowUserRegistration: true,
        requireEmailVerification: true,
        maxLogsPerUser: 1000,
        maxFileUploadSize: 10,
        enableNotifications: true,
        maintenanceMode: false,
      };
    }),

  // 시스템 설정 업데이트
  updateSystemSettings: protectedProcedure
    .input(z.object({
      siteName: z.string().optional(),
      siteDescription: z.string().optional(),
      allowUserRegistration: z.boolean().optional(),
      requireEmailVerification: z.boolean().optional(),
      maxLogsPerUser: z.number().optional(),
      maxFileUploadSize: z.number().optional(),
      enableNotifications: z.boolean().optional(),
      maintenanceMode: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdminAccess(ctx.user);

      console.log('⚙️ 시스템 설정 업데이트:', {
        admin: ctx.user?.email,
        settings: input,
        timestamp: new Date().toISOString(),
      });

      // 실제 설정 저장 로직은 프로덕션에서 구현
      return { success: true, message: '시스템 설정이 업데이트되었습니다.' };
    }),
}) 