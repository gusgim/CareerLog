import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

const adminSchema = z.object({
  action: z.string(),
  details: z.string().optional(),
})

export const adminRouter = createTRPCRouter({
  // 시스템 로그 저장
  logSystemActivity: protectedProcedure
    .input(adminSchema)
    .mutation(async ({ ctx, input }) => {
      const { action, details } = input;

      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

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
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        return {
          totalUsers: 15,
          activeUsers: 12,
          totalLogs: 342,
          reportsGenerated: 28,
          dailyActiveUsers: [
            { date: '2024-01-14', count: 8 },
            { date: '2024-01-15', count: 10 },
            { date: '2024-01-16', count: 9 },
            { date: '2024-01-17', count: 12 },
            { date: '2024-01-18', count: 11 },
            { date: '2024-01-19', count: 13 },
            { date: '2024-01-20', count: 15 },
          ],
          categoryStats: [
            { category: '수술', count: 120, percentage: 35.1 },
            { category: '진료', count: 85, percentage: 24.9 },
            { category: '교육', count: 58, percentage: 17.0 },
            { category: '연구', count: 45, percentage: 13.2 },
            { category: '학회', count: 25, percentage: 7.3 },
            { category: '기타', count: 9, percentage: 2.6 },
          ],
          monthlyGrowth: {
            userGrowth: 12.5,
            activityGrowth: 28.3,
            reportGrowth: 15.7,
          },
        };
      }

      try {
        // 실제 환경에서는 Supabase에서 데이터 조회
        const { data: profiles } = await ctx.supabase
          .from('profiles')
          .select('id, created_at')
          .order('created_at', { ascending: false });

        const { data: logs } = await ctx.supabase
          .from('logs')
          .select('id, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(100);

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

        return {
          totalUsers: profiles?.length || 0,
          activeUsers,
          totalLogs: logs?.length || 0,
          reportsGenerated: recentLogs, // recentLogs를 reportsGenerated로 매핑
          dailyActiveUsers: [], // 실제 구현에서는 일별 활성 사용자 데이터를 계산
          categoryStats: [], // 실제 구현에서는 카테고리별 통계를 계산
          monthlyGrowth: {
            userGrowth: 0, // 실제 구현에서는 전월 대비 성장률 계산
            activityGrowth: 0,
            reportGrowth: 0,
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
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        // 모의 사용자 데이터
        const mockUsers = [
          {
            id: 'user-1',
            email: 'nurse1@hospital.com',
            full_name: '김간호사',
            department: '외과',
            role: 'user',
            created_at: '2024-01-10T09:00:00Z',
            last_sign_in_at: '2024-01-15T08:30:00Z',
            activity_count: 45,
            last_activity_date: '2024-01-15',
            email_confirmed_at: '2024-01-10T09:00:00Z',
            user_metadata: { full_name: '김간호사', role: 'user' },
          },
          {
            id: 'user-2',
            email: 'nurse2@hospital.com',
            full_name: '이간호사',
            department: '내과',
            role: 'user',
            created_at: '2024-01-12T14:20:00Z',
            last_sign_in_at: '2024-01-14T16:15:00Z',
            activity_count: 32,
            last_activity_date: '2024-01-14',
            email_confirmed_at: '2024-01-12T14:20:00Z',
            user_metadata: { full_name: '이간호사', role: 'user' },
          },
          {
            id: 'user-3',
            email: 'admin@hospital.com',
            full_name: '관리자',
            department: '관리부',
            role: 'admin',
            created_at: '2024-01-08T10:00:00Z',
            last_sign_in_at: '2024-01-15T09:00:00Z',
            activity_count: 0,
            last_activity_date: null,
            email_confirmed_at: '2024-01-08T10:00:00Z',
            user_metadata: { full_name: '관리자', role: 'admin' },
          },
          {
            id: 'user-4',
            email: 'doctor1@hospital.com',
            full_name: '박의사',
            department: '외과',
            role: 'user',
            created_at: '2024-01-05T14:00:00Z',
            last_sign_in_at: '2024-01-14T11:20:00Z',
            activity_count: 28,
            last_activity_date: '2024-01-14',
            email_confirmed_at: '2024-01-05T14:00:00Z',
            user_metadata: { full_name: '박의사', role: 'user' },
          },
          {
            id: 'user-5',
            email: 'resident1@hospital.com',
            full_name: '최레지던트',
            department: '내과',
            role: 'user',
            created_at: '2024-01-15T08:30:00Z',
            last_sign_in_at: '2024-01-15T16:45:00Z',
            activity_count: 15,
            last_activity_date: '2024-01-15',
            email_confirmed_at: '2024-01-15T08:30:00Z',
            user_metadata: { full_name: '최레지던트', role: 'user' },
          },
        ];

        // 검색 필터 적용
        let filteredUsers = mockUsers;
        if (search) {
          filteredUsers = mockUsers.filter(user => 
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            user.department?.toLowerCase().includes(search.toLowerCase())
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

      try {
        // 전체 사용자 수 조회 (검색 필터 적용)
        let countQuery = ctx.supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        if (search) {
          countQuery = countQuery.or(`full_name.ilike.%${search}%,department.ilike.%${search}%`);
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
            created_at
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (search) {
          usersQuery = usersQuery.or(`full_name.ilike.%${search}%,department.ilike.%${search}%`);
        }

        const { data: users } = await usersQuery;

        // 사용자 데이터에 추가 속성 포함
        const enrichedUsers = (users || []).map(user => ({
          ...user,
          email: `${user.full_name}@hospital.com`, // 실제로는 auth.users에서 가져와야 함
          last_sign_in_at: user.created_at, // 기본값으로 생성일 사용
          activity_count: 0, // 실제로는 logs 테이블에서 계산해야 함
          last_activity_date: null, // 실제로는 logs 테이블에서 계산해야 함
          email_confirmed_at: user.created_at, // 기본값으로 생성일 사용
          user_metadata: {
            full_name: user.full_name,
            role: user.role || 'user',
          },
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

  // 백업 생성 (시뮬레이션)
  createBackup: protectedProcedure
    .mutation(async ({ ctx }) => {
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');
      
      // 최고 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && (ctx.user?.user_metadata?.role !== 'admin' || 
          ctx.user?.user_metadata?.admin_level !== 'super')) {
        throw new Error('최고 관리자 권한이 필요합니다.');
      }

      // 백업 시뮬레이션
      console.log('🔄 시스템 백업 시작:', {
        admin: ctx.user?.email,
        timestamp: new Date().toISOString(),
      });

      // 실제로는 여기서 Supabase 백업 API를 호출하거나
      // 데이터 내보내기 작업을 수행합니다.
      
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

      // 실제 환경에서는 설정 데이터를 Supabase에서 조회
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
        lastBackup: new Date().toISOString(),
        storageUsed: 0,
        storageLimit: 5000,
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
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');
      
      // 최고 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && (ctx.user?.user_metadata?.role !== 'admin' || 
          ctx.user?.user_metadata?.admin_level !== 'super')) {
        throw new Error('최고 관리자 권한이 필요합니다.');
      }

      console.log('⚙️ 시스템 설정 업데이트:', {
        admin: ctx.user?.email,
        settings: input,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: '시스템 설정이 업데이트되었습니다.' };
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

  // 수술방별 근무 빈도 분석 (최근 12개월)
  getSurgeryRoomWorkFrequency: protectedProcedure
    .input(z.object({
      operatingRoom: z.string().min(1, "수술방을 선택해주세요"),
    }))
    .query(async ({ ctx, input }) => {
      const { operatingRoom } = input;

      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      // 최근 12개월 계산
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      if (isDevelopmentMode) {
        // 개발 모드에서는 모의 데이터 반환
        return {
          operatingRoom,
          period: {
            from: twelveMonthsAgo.toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0],
          },
          topWorkers: [
            {
              rank: 1,
              userId: 'user-1',
              fullName: '김간호사',
              department: '외과',
              workCount: 45,
              percentage: 23.5,
              lastWorkDate: '2024-01-14',
            },
            {
              rank: 2,
              userId: 'user-2',
              fullName: '이간호사',
              department: '외과',
              workCount: 38,
              percentage: 19.8,
              lastWorkDate: '2024-01-13',
            },
            {
              rank: 3,
              userId: 'user-3',
              fullName: '박간호사',
              department: '외과',
              workCount: 32,
              percentage: 16.7,
              lastWorkDate: '2024-01-12',
            },
            {
              rank: 4,
              userId: 'user-4',
              fullName: '최간호사',
              department: '외과',
              workCount: 28,
              percentage: 14.6,
              lastWorkDate: '2024-01-11',
            },
            {
              rank: 5,
              userId: 'user-5',
              fullName: '정간호사',
              department: '외과',
              workCount: 25,
              percentage: 13.0,
              lastWorkDate: '2024-01-10',
            },
          ],
          totalWorkCount: 192,
          uniqueWorkers: 8,
        };
      }

      try {
        // 실제 환경에서 데이터 조회
        const { data: logs } = await ctx.supabase
          .from('logs')
          .select(`
            id,
            user_id,
            log_date,
            created_at,
            metadata,
            details,
            profiles:user_id (
              full_name,
              department
            )
          `)
          .eq('category', 'clinical')
          .gte('log_date', twelveMonthsAgo.toISOString().split('T')[0])
          .order('log_date', { ascending: false });

        if (!logs) {
          throw new Error('로그 데이터를 조회할 수 없습니다.');
        }

        // 수술방 필터링 (metadata의 operating_room 또는 details에서 검색)
        const filteredLogs = logs.filter(log => {
          const operatingRoomInMetadata = log.metadata?.operating_room;
          const operatingRoomInDetails = log.details?.toLowerCase().includes(operatingRoom.toLowerCase());
          
          return operatingRoomInMetadata === operatingRoom || operatingRoomInDetails;
        });

        // 사용자별 근무 횟수 계산
        const workerStats = filteredLogs.reduce((acc, log) => {
          const userId = log.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              userId,
              fullName: (log.profiles as any)?.full_name || '알 수 없음',
              department: (log.profiles as any)?.department || '알 수 없음',
              workCount: 0,
              lastWorkDate: log.log_date,
            };
          }
          acc[userId].workCount++;
          
          // 최근 근무일 업데이트
          if (log.log_date > acc[userId].lastWorkDate) {
            acc[userId].lastWorkDate = log.log_date;
          }
          
          return acc;
        }, {} as Record<string, any>);

        // 상위 5명 선별 및 정렬
        const sortedWorkers = Object.values(workerStats)
          .sort((a: any, b: any) => b.workCount - a.workCount)
          .slice(0, 5);

        const totalWorkCount = filteredLogs.length;
        
        // 순위 및 퍼센티지 계산
        const topWorkers = sortedWorkers.map((worker: any, index) => ({
          rank: index + 1,
          ...worker,
          percentage: totalWorkCount > 0 ? Number(((worker.workCount / totalWorkCount) * 100).toFixed(1)) : 0,
        }));

        return {
          operatingRoom,
          period: {
            from: twelveMonthsAgo.toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0],
          },
          topWorkers,
          totalWorkCount,
          uniqueWorkers: Object.keys(workerStats).length,
        };

      } catch (error) {
        console.error('수술방 근무 빈도 분석 오류:', error);
        throw new Error('수술방 근무 빈도 데이터를 조회할 수 없습니다.');
      }
    }),

  // 모든 수술방 목록 조회 (관리자용)
  getAllOperatingRooms: protectedProcedure
    .query(async ({ ctx }) => {
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        return [
          { room: '1번 수술방', count: 45 },
          { room: '2번 수술방', count: 38 },
          { room: '3번 수술방', count: 52 },
          { room: '중앙수술실 A', count: 67 },
          { room: '중앙수술실 B', count: 41 },
          { room: '응급수술실', count: 23 },
        ];
      }

      try {
        // 최근 12개월간의 모든 수술방 데이터 조회
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const { data: logs } = await ctx.supabase
          .from('logs')
          .select('metadata, details')
          .eq('category', 'clinical')
          .gte('log_date', twelveMonthsAgo.toISOString().split('T')[0]);

        if (!logs) {
          return [];
        }

        // 수술방 목록 추출 및 카운트
        const roomCounts = logs.reduce((acc, log) => {
          let operatingRoom = null;
          
          // metadata에서 operating_room 확인
          if (log.metadata?.operating_room) {
            operatingRoom = log.metadata.operating_room;
          }
          // details에서 수술방 패턴 검색
          else if (log.details) {
            const roomPattern = /(\d+번\s*수술방|중앙수술실\s*[A-Z\d]+|응급수술실|수술실\s*\d+)/gi;
            const matches = log.details.match(roomPattern);
            if (matches && matches.length > 0) {
              operatingRoom = matches[0];
            }
          }

          if (operatingRoom) {
            acc[operatingRoom] = (acc[operatingRoom] || 0) + 1;
          }

          return acc;
        }, {} as Record<string, number>);

        // 정렬된 수술방 목록 반환
        return Object.entries(roomCounts)
          .map(([room, count]) => ({ room, count }))
          .sort((a, b) => b.count - a.count);

      } catch (error) {
        console.error('수술방 목록 조회 오류:', error);
        throw new Error('수술방 목록을 조회할 수 없습니다.');
      }
    }),
}); 