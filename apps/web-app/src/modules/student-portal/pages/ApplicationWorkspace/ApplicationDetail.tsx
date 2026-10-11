import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Clock, 
    ExternalLink, 
    MoreHorizontal,
    AlertCircle,
    Loader2
} from 'lucide-react';
import StageNavigation from './components/StageNavigation';
import { supabase } from '@/lib/supabase';

// Mock Components for content areas
const StageContent = ({ title, description }: { title: string, description: string }) => (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
        <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            开始任务
        </button>
    </div>
);

const ApplicationDetail: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const navigate = useNavigate();
    const [currentStage, setCurrentStage] = useState('preparation');
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        if (applicationId) {
            fetchProjectDetails();
        }
    }, [applicationId]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('final_university_choices')
                .select('*')
                .eq('id', applicationId)
                .single();

            if (error) throw error;
            setProject(data);
        } catch (err) {
            console.error('Error fetching project:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderStageContent = () => {
        switch(currentStage) {
            case 'preparation':
                return <StageContent title="材料准备" description="管理推荐信、成绩单及其他申请材料" />;
            case 'essays':
                return <StageContent title="文书协作" description="PS, CV, Essay 写作与版本管理" />;
            case 'application':
                return <StageContent title="网申执行" description="网申账号管理与填写进度追踪" />;
            case 'interview':
                return <StageContent title="面试与状态" description="面试安排与申请状态更新" />;
            case 'offer':
                return <StageContent title="录取与入学" description="Offer 决策与入学手续办理" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="h-screen flex items-center justify-center flex-col">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium">未找到项目</h3>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">返回</button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar Navigation */}
            <StageNavigation 
                currentStage={currentStage} 
                onStageChange={setCurrentStage}
                completedStages={[]} // To be implemented
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Sticky Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm z-20">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/student/applications')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                {/* Logo placeholder */}
                                <span className="font-bold text-gray-500">{project.school_name?.[0]}</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                    {project.program_name}
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    {project.school_name}
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    {project.degree || 'Master'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">截止日期</p>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{project.application_deadline || '待定'}</span>
                            </div>
                        </div>
                        
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />

                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {/* Advisor Avatars Placeholder */}
                                <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white font-bold">
                                    AD
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Render Active Stage Content */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {renderStageContent()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ApplicationDetail;

