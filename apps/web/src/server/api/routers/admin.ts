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

  // === 자격 관리 시스템 ===

  // 모든 자격 유형 조회
  getAllQualifications: protectedProcedure
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
          {
            id: 1,
            name: 'OR_BASIC',
            name_ko: '수술실 기본 자격',
            description: '수술실 근무를 위한 기본 교육 이수',
            category: 'training',
            required_for_rooms: ['OR1', 'OR2', 'OR3', 'OR4', 'OR5', 'OR6'],
            required_experience_years: 0,
            is_mandatory: true,
          },
          {
            id: 2,
            name: 'OR_CARDIAC',
            name_ko: '심장수술실 자격',
            description: '심장수술실 근무를 위한 전문 교육',
            category: 'training',
            required_for_rooms: ['OR1'],
            required_experience_years: 6,
            is_mandatory: true,
          },
          {
            id: 3,
            name: 'OR_NEURO',
            name_ko: '신경수술실 자격',
            description: '신경수술실 근무를 위한 전문 교육',
            category: 'training',
            required_for_rooms: ['OR2'],
            required_experience_years: 5,
            is_mandatory: true,
          },
          {
            id: 4,
            name: 'RR_BASIC',
            name_ko: '회복실 기본 자격',
            description: '회복실 근무를 위한 기본 교육',
            category: 'training',
            required_for_rooms: ['RR1', 'RR2'],
            required_experience_years: 2,
            is_mandatory: true,
          },
          {
            id: 5,
            name: 'CPR_CERTIFICATION',
            name_ko: 'CPR 인증',
            description: '심폐소생술 인증',
            category: 'certification',
            required_for_rooms: [],
            required_experience_years: 0,
            is_mandatory: true,
          },
        ];
      }

      try {
        const { data: qualifications } = await ctx.supabase
          .from('qualifications')
          .select('*')
          .order('category', { ascending: true })
          .order('name_ko', { ascending: true });

        return qualifications || [];
      } catch (error) {
        console.error('자격 목록 조회 오류:', error);
        throw new Error('자격 목록을 조회할 수 없습니다.');
      }
    }),

  // 근무자별 자격 현황 조회
  getStaffQualifications: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        return [
          {
            userId: 'user-1',
            fullName: '김간호사',
            department: '외과',
            yearsOfExperience: 8,
            qualifications: [
              {
                id: 1,
                name: 'OR_BASIC',
                name_ko: '수술실 기본 자격',
                obtained_date: '2020-03-15',
                expiry_date: null,
                status: 'active',
              },
              {
                id: 2,
                name: 'OR_CARDIAC',
                name_ko: '심장수술실 자격',
                obtained_date: '2022-08-20',
                expiry_date: null,
                status: 'active',
              },
              {
                id: 5,
                name: 'CPR_CERTIFICATION',
                name_ko: 'CPR 인증',
                obtained_date: '2024-01-10',
                expiry_date: '2026-01-10',
                status: 'active',
              },
            ],
            missingQualifications: [
              {
                id: 3,
                name: 'OR_NEURO',
                name_ko: '신경수술실 자격',
                reason: '선택사항',
              },
            ],
          },
          {
            userId: 'user-2',
            fullName: '이간호사',
            department: '내과',
            yearsOfExperience: 4,
            qualifications: [
              {
                id: 1,
                name: 'OR_BASIC',
                name_ko: '수술실 기본 자격',
                obtained_date: '2021-06-10',
                expiry_date: null,
                status: 'active',
              },
              {
                id: 5,
                name: 'CPR_CERTIFICATION',
                name_ko: 'CPR 인증',
                obtained_date: '2023-11-15',
                expiry_date: '2025-11-15',
                status: 'active',
              },
            ],
            missingQualifications: [
              {
                id: 2,
                name: 'OR_CARDIAC',
                name_ko: '심장수술실 자격',
                reason: '경력 부족 (6년 이상 필요)',
              },
              {
                id: 3,
                name: 'OR_NEURO',
                name_ko: '신경수술실 자격',
                reason: '경력 부족 (5년 이상 필요)',
              },
            ],
          },
        ];
      }

      try {
        // 실제 환경에서 구현
        // 복잡한 조인 쿼리가 필요하므로 우선 기본 구조만 제공
        return [];
      } catch (error) {
        console.error('근무자 자격 현황 조회 오류:', error);
        throw new Error('근무자 자격 현황을 조회할 수 없습니다.');
      }
    }),

  // 배치 가능성 매트릭스 조회
  getPlacementMatrix: protectedProcedure
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
          operatingRooms: [
            { id: 'OR1', name: '수술실 1호 (심장외과)', specialty: 'cardiac' },
            { id: 'OR2', name: '수술실 2호 (신경외과)', specialty: 'neuro' },
            { id: 'OR3', name: '수술실 3호 (일반외과)', specialty: 'general' },
            { id: 'RR1', name: '회복실 A', specialty: 'recovery' },
          ],
          staff: [
            {
              userId: 'user-1',
              fullName: '김간호사',
              department: '외과',
              yearsOfExperience: 8,
              placements: {
                OR1: { canWork: true, reason: '심장수술실 자격 보유' },
                OR2: { canWork: false, reason: '신경수술실 자격 미보유' },
                OR3: { canWork: true, reason: '기본 자격 보유' },
                RR1: { canWork: true, reason: '기본 자격 보유' },
              },
            },
            {
              userId: 'user-2',
              fullName: '이간호사',
              department: '내과',
              yearsOfExperience: 4,
              placements: {
                OR1: { canWork: false, reason: '경력 부족 (6년 이상 필요)' },
                OR2: { canWork: false, reason: '경력 부족 (5년 이상 필요)' },
                OR3: { canWork: true, reason: '기본 자격 보유' },
                RR1: { canWork: true, reason: '기본 자격 보유' },
              },
            },
            {
              userId: 'user-3',
              fullName: '박간호사',
              department: '외과',
              yearsOfExperience: 7,
              placements: {
                OR1: { canWork: true, reason: '심장수술실 자격 보유' },
                OR2: { canWork: true, reason: '신경수술실 자격 보유' },
                OR3: { canWork: true, reason: '기본 자격 보유' },
                RR1: { canWork: true, reason: '기본 자격 보유' },
              },
            },
          ],
        };
      }

      try {
        // 실제 환경에서 구현
        // 복잡한 매트릭스 계산이 필요하므로 우선 기본 구조만 제공
        return {
          operatingRooms: [],
          staff: [],
        };
      } catch (error) {
        console.error('배치 가능성 매트릭스 조회 오류:', error);
        throw new Error('배치 가능성 매트릭스를 조회할 수 없습니다.');
      }
    }),

  // 자격 추가/수정
  createOrUpdateQualification: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      name: z.string().min(1),
      name_ko: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(['education', 'certification', 'experience', 'training']),
      required_for_rooms: z.array(z.string()).default([]),
      required_experience_years: z.number().min(0).default(0),
      is_mandatory: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        console.log('자격 생성/수정 (개발 모드):', input);
        return { 
          success: true, 
          message: input.id ? '자격이 수정되었습니다.' : '새 자격이 생성되었습니다.',
          id: input.id || Date.now(),
        };
      }

      try {
        if (input.id) {
          // 수정
          const { data, error } = await ctx.supabase
            .from('qualifications')
            .update({
              name: input.name,
              name_ko: input.name_ko,
              description: input.description,
              category: input.category,
              required_for_rooms: input.required_for_rooms,
              required_experience_years: input.required_experience_years,
              is_mandatory: input.is_mandatory,
            })
            .eq('id', input.id)
            .select()
            .single();

          if (error) throw error;
          return { success: true, message: '자격이 수정되었습니다.', id: data.id };
        } else {
          // 생성
          const { data, error } = await ctx.supabase
            .from('qualifications')
            .insert({
              name: input.name,
              name_ko: input.name_ko,
              description: input.description,
              category: input.category,
              required_for_rooms: input.required_for_rooms,
              required_experience_years: input.required_experience_years,
              is_mandatory: input.is_mandatory,
            })
            .select()
            .single();

          if (error) throw error;
          return { success: true, message: '새 자격이 생성되었습니다.', id: data.id };
        }
      } catch (error) {
        console.error('자격 생성/수정 오류:', error);
        throw new Error('자격을 저장할 수 없습니다.');
      }
    }),

  // 근무자 자격 할당/제거
  assignStaffQualification: protectedProcedure
    .input(z.object({
      userId: z.string(),
      qualificationId: z.number(),
      obtained_date: z.string().optional(),
      expiry_date: z.string().optional(),
      notes: z.string().optional(),
      remove: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        console.log('근무자 자격 할당/제거 (개발 모드):', input);
        return { 
          success: true, 
          message: input.remove ? '자격이 제거되었습니다.' : '자격이 할당되었습니다.',
        };
      }

      try {
        if (input.remove) {
          // 제거
          const { error } = await ctx.supabase
            .from('staff_qualifications')
            .delete()
            .eq('user_id', input.userId)
            .eq('qualification_id', input.qualificationId);

          if (error) throw error;
          return { success: true, message: '자격이 제거되었습니다.' };
        } else {
          // 할당
          const { data, error } = await ctx.supabase
            .from('staff_qualifications')
            .upsert({
              user_id: input.userId,
              qualification_id: input.qualificationId,
              obtained_date: input.obtained_date,
              expiry_date: input.expiry_date,
              notes: input.notes,
              status: 'active',
            })
            .select()
            .single();

          if (error) throw error;
          return { success: true, message: '자격이 할당되었습니다.' };
        }
      } catch (error) {
        console.error('근무자 자격 할당/제거 오류:', error);
        throw new Error('자격 할당/제거에 실패했습니다.');
      }
    }),

  // === 개별 사용자 분석 시스템 ===

  // 개별 사용자 분석 데이터 조회
  getUserAnalytics: protectedProcedure
    .input(z.object({
      userId: z.string(),
      period: z.enum(['6', '12', '18', '24']).default('12'), // 개월 수
    }))
    .query(async ({ ctx, input }) => {
      const { userId, period } = input;
      
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        // 모의 데이터
        const mockData = {
          userInfo: {
            id: userId,
            fullName: userId === 'user-1' ? '김간호사' : '이간호사',
            department: '외과',
            yearsOfExperience: userId === 'user-1' ? 8 : 4,
            joinDate: userId === 'user-1' ? '2016-03-15' : '2020-06-10',
          },
          period: {
            months: parseInt(period),
            startDate: new Date(Date.now() - parseInt(period) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
          },
          dutyStats: [
            { dutyType: '수술실 근무', count: 45, percentage: 38.5, avgHoursPerShift: 8.2 },
            { dutyType: '회복실 근무', count: 28, percentage: 23.9, avgHoursPerShift: 7.8 },
            { dutyType: '주간 근무', count: 32, percentage: 27.4, avgHoursPerShift: 8.0 },
            { dutyType: '야간 근무', count: 12, percentage: 10.3, avgHoursPerShift: 12.0 },
          ],
          operatingRoomStats: [
            { room: '수술실 1호 (심장외과)', count: 22, percentage: 31.4, lastWorkDate: '2024-01-15' },
            { room: '수술실 3호 (일반외과)', count: 18, percentage: 25.7, lastWorkDate: '2024-01-14' },
            { room: '회복실 A', count: 15, percentage: 21.4, lastWorkDate: '2024-01-13' },
            { room: '수술실 2호 (신경외과)', count: 10, percentage: 14.3, lastWorkDate: '2024-01-10' },
            { room: '회복실 B', count: 5, percentage: 7.1, lastWorkDate: '2024-01-08' },
          ],
          monthlyTrends: [
            { month: '2023-08', totalShifts: 18, totalHours: 152 },
            { month: '2023-09', totalShifts: 22, totalHours: 178 },
            { month: '2023-10', totalShifts: 20, totalHours: 165 },
            { month: '2023-11', totalShifts: 19, totalHours: 148 },
            { month: '2023-12', totalShifts: 23, totalHours: 185 },
            { month: '2024-01', totalShifts: 15, totalHours: 125 }, // 현재 월은 부분 데이터
          ],
          performance: {
            totalShifts: 117,
            totalHours: 853,
            avgShiftsPerMonth: 19.5,
            avgHoursPerMonth: 142.2,
            attendanceRate: 96.8,
            overtimeHours: 45,
          },
          insights: [
            {
              type: 'strength',
              title: '강점 분야',
              description: '심장수술실 근무 빈도가 높아 전문성을 갖추고 있습니다.',
            },
            {
              type: 'opportunity',
              title: '개선 기회',
              description: '신경수술실 근무 경험이 상대적으로 적어 다양한 경험을 위해 배치를 고려해볼 수 있습니다.',
            },
            {
              type: 'workload',
              title: '근무 부하',
              description: '월평균 근무시간이 적정 수준으로 유지되고 있습니다.',
            },
          ],
        };

        return mockData;
      }

      try {
        // 실제 환경에서 구현
        // 복잡한 분석 쿼리가 필요하므로 우선 기본 구조만 제공
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(period));

        return {
          userInfo: {
            id: userId,
            fullName: '미구현',
            department: '미구현',
            yearsOfExperience: 0,
            joinDate: '미구현',
          },
          period: {
            months: parseInt(period),
            startDate: startDate.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
          },
          dutyStats: [],
          operatingRoomStats: [],
          monthlyTrends: [],
          performance: {
            totalShifts: 0,
            totalHours: 0,
            avgShiftsPerMonth: 0,
            avgHoursPerMonth: 0,
            attendanceRate: 0,
            overtimeHours: 0,
          },
          insights: [],
        };
      } catch (error) {
        console.error('개별 사용자 분석 조회 오류:', error);
        throw new Error('사용자 분석 데이터를 조회할 수 없습니다.');
      }
    }),

  // 전체 사용자 목록 조회 (분석용)
  getUsersForAnalysis: protectedProcedure
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
          {
            id: 'user-1',
            fullName: '김간호사',
            department: '외과',
            yearsOfExperience: 8,
            lastActivityDate: '2024-01-15',
          },
          {
            id: 'user-2',
            fullName: '이간호사',
            department: '내과',
            yearsOfExperience: 4,
            lastActivityDate: '2024-01-14',
          },
          {
            id: 'user-3',
            fullName: '박간호사',
            department: '외과',
            yearsOfExperience: 7,
            lastActivityDate: '2024-01-13',
          },
          {
            id: 'user-4',
            fullName: '최간호사',
            department: '내과',
            yearsOfExperience: 5,
            lastActivityDate: '2024-01-12',
          },
          {
            id: 'user-5',
            fullName: '정간호사',
            department: '외과',
            yearsOfExperience: 6,
            lastActivityDate: '2024-01-11',
          },
        ];
      }

      try {
        // 실제 환경에서 구현
        const { data: profiles } = await ctx.supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            department,
            years_of_experience,
            created_at
          `)
          .order('full_name', { ascending: true });

        return profiles?.map(profile => ({
          id: profile.id,
          fullName: profile.full_name || '이름 없음',
          department: profile.department || '미지정',
          yearsOfExperience: profile.years_of_experience || 0,
          lastActivityDate: profile.created_at?.split('T')[0] || '미지정',
        })) || [];
      } catch (error) {
        console.error('사용자 목록 조회 오류:', error);
        throw new Error('사용자 목록을 조회할 수 없습니다.');
      }
    }),

  // === 자동 스케줄링 시스템 ===

  // 스케줄링 알고리즘 실행
  generateAutoSchedule: protectedProcedure
    .input(z.object({
      startDate: z.string(), // YYYY-MM-DD 형식
      endDate: z.string(),   // YYYY-MM-DD 형식
      constraints: z.object({
        maxConsecutiveDays: z.number().default(3),
        minRestHours: z.number().default(12),
        maxWeeklyHours: z.number().default(40),
        preferredDistribution: z.boolean().default(true),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { startDate, endDate, constraints = {} } = input;
      
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        // 모의 스케줄 생성 결과
        const mockSchedule = {
          scheduleId: `schedule_${Date.now()}`,
          period: { startDate, endDate },
          constraints,
          generatedAt: new Date().toISOString(),
          schedules: [
            {
              date: startDate,
              shifts: [
                {
                  userId: 'user-1',
                  userName: '김간호사',
                  operatingRoom: 'OR1',
                  dutyType: '수술실 근무',
                  startTime: '08:00',
                  endTime: '16:00',
                  qualificationMatch: 100,
                },
                {
                  userId: 'user-2',
                  userName: '이간호사',
                  operatingRoom: 'OR3',
                  dutyType: '수술실 근무',
                  startTime: '08:00',
                  endTime: '16:00',
                  qualificationMatch: 95,
                },
                {
                  userId: 'user-3',
                  userName: '박간호사',
                  operatingRoom: 'RR1',
                  dutyType: '회복실 근무',
                  startTime: '16:00',
                  endTime: '00:00',
                  qualificationMatch: 100,
                },
              ],
            },
          ],
          analysis: {
            totalScheduledShifts: 21,
            distributionScore: 92,
            qualificationMatchScore: 97,
            workloadBalanceScore: 89,
            suggestions: [
              '김간호사의 심장수술실 경험을 활용하여 OR1에 우선 배치했습니다.',
              '이간호사는 신경수술실 경험이 부족하여 OR2 대신 OR3에 배치했습니다.',
              '전체 근무자 간 근무시간 분배가 균형있게 조정되었습니다.',
            ],
          },
        };

        return {
          success: true,
          message: '자동 스케줄이 성공적으로 생성되었습니다.',
          schedule: mockSchedule,
        };
      }

      try {
        // 실제 환경에서는 복잡한 스케줄링 알고리즘 실행
        // 1. 현재 근무자 목록 및 자격 조회
        // 2. 수술방별 요구사항 확인
        // 3. 과거 근무 이력 분석
        // 4. 제약조건 적용
        // 5. 최적화 알고리즘 실행

        return {
          success: false,
          message: '자동 스케줄링 기능은 아직 구현 중입니다.',
          schedule: null,
        };
      } catch (error) {
        console.error('자동 스케줄링 오류:', error);
        throw new Error('자동 스케줄 생성에 실패했습니다.');
      }
    }),

  // 스케줄 최적화 제안
  optimizeSchedule: protectedProcedure
    .input(z.object({
      scheduleId: z.string(),
      optimizationGoals: z.array(z.enum(['workload', 'qualification', 'preference', 'experience'])).default(['workload']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { scheduleId, optimizationGoals } = input;
      
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        const mockOptimization = {
          originalScheduleId: scheduleId,
          optimizedScheduleId: `optimized_${Date.now()}`,
          optimizationGoals,
          improvements: [
            {
              type: 'workload',
              description: '김간호사와 이간호사의 근무시간 차이를 8시간에서 4시간으로 줄였습니다.',
              impact: 'high',
            },
            {
              type: 'qualification',
              description: '자격 요건 매치 점수가 94%에서 98%로 향상되었습니다.',
              impact: 'medium',
            },
            {
              type: 'experience',
              description: '신규 간호사에게 다양한 수술방 경험 기회를 3회 추가 제공했습니다.',
              impact: 'medium',
            },
          ],
          stats: {
            beforeScore: 87,
            afterScore: 94,
            improvementPercentage: 8.0,
          },
        };

        return {
          success: true,
          message: '스케줄이 성공적으로 최적화되었습니다.',
          optimization: mockOptimization,
        };
      }

      try {
        // 실제 환경에서 최적화 로직 실행
        return {
          success: false,
          message: '스케줄 최적화 기능은 아직 구현 중입니다.',
          optimization: null,
        };
      } catch (error) {
        console.error('스케줄 최적화 오류:', error);
        throw new Error('스케줄 최적화에 실패했습니다.');
      }
    }),

  // 응급 상황 대응 스케줄링
  handleEmergencyScheduling: protectedProcedure
    .input(z.object({
      date: z.string(),
      operatingRoom: z.string(),
      requiredQualifications: z.array(z.string()).default([]),
      urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { date, operatingRoom, requiredQualifications, urgencyLevel } = input;
      
      // 개발 모드 확인
      const isDevelopmentMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_url_here');

      // 관리자 권한 확인 (개발 모드에서는 더 관대하게)
      if (!isDevelopmentMode && ctx.user?.user_metadata?.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }

      if (isDevelopmentMode) {
        const mockEmergencyResponse = {
          requestId: `emergency_${Date.now()}`,
          date,
          operatingRoom,
          urgencyLevel,
          availableStaff: [
            {
              userId: 'user-1',
              userName: '김간호사',
              qualificationMatch: 100,
              currentStatus: 'available',
              responseTime: '즉시 가능',
              lastRestHours: 16,
            },
            {
              userId: 'user-3',
              userName: '박간호사',
              qualificationMatch: 95,
              currentStatus: 'on_call',
              responseTime: '15분 내',
              lastRestHours: 8,
            },
          ],
          recommendation: {
            primaryChoice: {
              userId: 'user-1',
              userName: '김간호사',
              reason: '해당 수술방 전문 자격을 보유하고 있으며 충분한 휴식을 취한 상태입니다.',
            },
            backupChoices: [
              {
                userId: 'user-3',
                userName: '박간호사',
                reason: '당직 중이며 필요 자격을 보유하고 있습니다.',
              },
            ],
          },
        };

        return {
          success: true,
          message: '응급 상황 대응 스케줄이 생성되었습니다.',
          emergency: mockEmergencyResponse,
        };
      }

      try {
        // 실제 환경에서 응급 상황 대응 로직 실행
        return {
          success: false,
          message: '응급 상황 대응 기능은 아직 구현 중입니다.',
          emergency: null,
        };
      } catch (error) {
        console.error('응급 스케줄링 오류:', error);
        throw new Error('응급 상황 대응에 실패했습니다.');
      }
    }),
}); 