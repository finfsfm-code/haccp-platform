

import React, { useState } from 'react';
// FIX: Added .ts extension to resolve module.
import { Task } from '../types.ts';
// FIX: Added .tsx extension to resolve module.
import { useAppContext } from '../context/AppContext.tsx';
import TaskCard from './TaskCard.tsx';

interface KanbanColumnProps {
  title: string;
  status: Task['status'];
  color: string;
  onCardClick: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, color, onCardClick }) => {
    const { tasks, updateTask } = useAppContext();
    const [isOver, setIsOver] = useState(false);

    const columnTasks = tasks.filter(t => t.status === status);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        
        if (!taskId) return;

        const taskToMove = tasks.find(t => t.id === taskId);
        if (taskToMove && taskToMove.status !== status) {
            await updateTask({ ...taskToMove, status: status });
        }
    };
    
    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col bg-slate-100 p-4 rounded-lg border-t-4 ${color} transition-colors ${isOver ? 'bg-emerald-100' : ''}`}
        >
            <h3 className="font-bold text-slate-700 mb-4 flex justify-between flex-shrink-0">
                <span>{title}</span>
                <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">{columnTasks.length}</span>
            </h3>
            <div className="space-y-4 overflow-y-auto h-full pr-1">
                {columnTasks.length > 0 ? (
                    columnTasks.map(task => (
                        <TaskCard key={task.id} task={task} onClick={onCardClick} />
                    ))
                ) : (
                    <div className={`flex items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-md transition-colors ${isOver ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                         <p className="text-sm text-center text-slate-400">
                           {isOver ? 'أفلت المهمة هنا' : 'لا توجد مهام هنا'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;