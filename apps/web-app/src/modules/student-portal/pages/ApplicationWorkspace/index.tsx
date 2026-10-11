import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Filter, 
    Search, 
    Plus, 
    Loader2, 
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText
} from 'lucide-react';
import ApplicationCard from './components/ApplicationCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Temporary interface until we integrate full types
interface Application {
    id: string;
    university_name: string;
    program_name: string;
    degree_type: string;
    intake: string;
    due_date: string;
    submission_status: string;
    decision_result: string;
    priority_rank: number;
    application_portal_url?: string;
    current_stage?: string; // New field
}

const ApplicationDashboard: React.FC = () => {
    const { studentId } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Stats
    const stats = {
        total: applications.length,
        inProgress: applications.filter(app => !['Submitted', 'Accepted', 'Rejected'].includes(app.submission_status || '')).length,
        offers: applications.filter(app => app.decision_result === 'Accepted').length
    };

    useEffect(() => {
        if (studentId) {
            fetchApplications();
        }
    }, [studentId]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // Fetch from final_university_choices table
            const { data, error } = await supabase
                .from('final_university_choices')
                .select('*')
                .eq('student_id', studentId)
                .order('priority_rank', { ascending: true });

            if (error) throw error;

            // Map database fields to our component interface
            const mappedApps = (data || []).map(app => ({
                id: app.id,
                university_name: app.school_name,
                program_name: app.program_name,
                degree_type: 'Master', // Default or fetch from somewhere else if available
                intake: '2026 Fall', // Default or fetch from application_direction
                due_date: app.application_deadline || '2025-12-31', // Fallback date
                submission_status: app.submission_status || '准备中',
                decision_result: app.decision_result,
                priority_rank: app.priority_rank,
                application_portal_url: app.application_portal_url,
                current_stage: '文书撰写中' // Mock stage for now
            }));

            setApplications(mappedApps);
        } catch (err: any) {
            console.error('Error fetching applications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.university_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              app.program_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || app.submission_status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Determine progress based on status (mock logic)
    const getProgress = (status: string) => {
        switch(status) {
            case '准备中': return 10;
            case '文书撰写中': return 40;
            case '网申进行中': return 70;
            case '已提交': return 90;
            case '等待结果': return 95;
            case '录取': return 100;
            default: return 0;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-blue-600" />
                        申请工作台
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        管理所有申请项目，跟踪文书与网申进度
                    </p>
                </div>
                
                {/* Stats Cards */}
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">共申请</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">进行中</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">已斩获</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.offers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="搜索学校或专业..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                        <Filter className="w-4 h-4" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
                        >
                            <option value="all">全部状态</option>
                            <option value="准备中">准备中</option>
                            <option value="文书撰写中">文书撰写中</option>
                            <option value="网申进行中">网申进行中</option>
                            <option value="已提交">已提交</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Application Grid */}
            {error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">加载失败</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{error}</p>
                    <button 
                        onClick={fetchApplications}
                        className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        重试
                    </button>
                </div>
            ) : filteredApplications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApplications.map((app) => (
                        <ApplicationCard 
                            key={app.id}
                            id={app.id}
                            universityName={app.university_name}
                            programName={app.program_name}
                            degreeType={app.degree_type}
                            intake={app.intake}
                            deadline={app.due_date}
                            status={app.submission_status}
                            progress={getProgress(app.submission_status)}
                            isFavorite={app.priority_rank <= 3} // Example logic
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <LayoutDashboard className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">暂无申请项目</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md text-center">
                        您还没有确认任何申请学校。请先前往“选校列表”确认您的目标院校，或联系您的顾问老师。
                    </p>
                </div>
            )}
        </div>
    );
};

export default ApplicationDashboard;

