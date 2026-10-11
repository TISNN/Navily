import React from 'react';
import { Calendar, Trophy, Star, ArrowRight, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ApplicationCardProps {
    id: string;
    universityName: string;
    universityLogo?: string;
    programName: string;
    degreeType: string;
    intake: string;
    deadline: string;
    status: string; // e.g., '文书撰写中', '网申进行中', '已提交'
    progress: number; // 0-100
    isFavorite?: boolean;
}

const statusColors: Record<string, string> = {
    '准备中': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    '文书撰写中': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    '网申进行中': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    '已提交': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    '等待结果': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    '录取': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    '被拒': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({
    id,
    universityName,
    universityLogo,
    programName,
    degreeType,
    intake,
    deadline,
    status,
    progress,
    isFavorite = false,
}) => {
    const navigate = useNavigate();

    // Calculate days remaining
    const daysRemaining = Math.max(0, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const deadlineColor = daysRemaining < 7 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400';

    return (
        <div 
            onClick={() => navigate(`/student/applications/${id}`)}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
        >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-600">
                            {universityLogo ? (
                                <img src={universityLogo} alt={universityName} className="w-8 h-8 object-contain" />
                            ) : (
                                <Trophy className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {universityName}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                    {degreeType}
                                </span>
                                {isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                            </div>
                        </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status] || statusColors['准备中']}`}>
                        {status}
                    </span>
                </div>

                {/* Program Title */}
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 line-clamp-2">
                    {programName}
                </h4>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{intake}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${deadlineColor}`}>
                        <Clock className="w-4 h-4" />
                        <span>剩 {daysRemaining} 天</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-auto">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500 dark:text-gray-400">申请进度</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    查看详情
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
};

export default ApplicationCard;

