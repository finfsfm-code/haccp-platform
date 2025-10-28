import React from 'react';
import { Task } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    const { team, hasPermission } = useAppContext();
    const assignedMember = team.find(member => member.id === task.assignedTo);
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('taskId', task.id);
    };

    return (
        <div 
            draggable={hasPermission('task:edit')}
            onDragStart={handleDragStart}
            onClick={() => onClick(task)}
            className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md hover:border-emerald-500"
            aria-label={`Task: ${task.title}`}
        >
            <h4 className="font-semibold text-slate-800">{task.title}</h4>
            {assignedMember && (
                <p className="text-xs text-slate-500 mt-2">المسؤول: {assignedMember.name}</p>
            )}
            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">{task.progress}%</span>
                 <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${task.progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;