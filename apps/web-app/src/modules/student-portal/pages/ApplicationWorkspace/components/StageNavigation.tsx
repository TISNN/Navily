import React from 'react';
import { 
    ClipboardList, 
    PenTool, 
    Globe, 
    MessageSquare, 
    CheckCircle2 
} from 'lucide-react';

interface StageNavigationProps {
    currentStage: string;
    onStageChange: (stage: string) => void;
    completedStages?: string[];
}

const stages = [
    { id: 'preparation', label: '材料准备', icon: ClipboardList, description: '推荐信与成绩单' },
    { id: 'essays', label: '文书协作', icon: PenTool, description: 'PS/CV/Essay' },
    { id: 'application', label: '网申执行', icon: Globe, description: '填写与提交' },
    { id: 'interview', label: '面试与状态', icon: MessageSquare, description: '跟进与反馈' },
    { id: 'offer', label: '录取与入学', icon: CheckCircle2, description: 'Offer决策' },
];

const StageNavigation: React.FC<StageNavigationProps> = ({ 
    currentStage, 
    onStageChange,
    completedStages = [] 
}) => {
    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 hidden lg:block min-h-screen">
            <div className="p-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    申请流程
                </h3>
                <div className="space-y-2 relative">
                    {/* Vertical Line connecting steps */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />

                    {stages.map((stage) => {
                        const isActive = currentStage === stage.id;
                        const isCompleted = completedStages.includes(stage.id);
                        const Icon = stage.icon;

                        return (
                            <button
                                key={stage.id}
                                onClick={() => onStageChange(stage.id)}
                                className={`w-full group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                    isActive 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                        : isCompleted
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-400'
                                }`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                
                                <div className="text-left pt-1">
                                    <p className={`text-sm font-medium transition-colors ${
                                        isActive 
                                            ? 'text-blue-700 dark:text-blue-300' 
                                            : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                                    }`}>
                                        {stage.label}
                                    </p>
                                    <p className={`text-xs mt-0.5 transition-colors ${
                                        isActive 
                                            ? 'text-blue-600/70 dark:text-blue-400/70' 
                                            : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                        {stage.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StageNavigation;

