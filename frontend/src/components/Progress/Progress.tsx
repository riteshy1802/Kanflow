import { ProgressObject } from '@/types/form.types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const Progress = ({ progress }: { progress: ProgressObject[] }) => {
  const total = progress.reduce((sum, item) => sum + item.count, 0);

  const upperCaseAndRemoveUnderScores = (name: string) =>
    name.toUpperCase().replace(/_/g, ' ');

  return (
    <TooltipProvider>
      <div className="flex w-full items-center px-6 pb-3 overflow-hidden">
        {progress.map((item, index) => {
          const percentage = total === 0 ? 0 : (item.count / total) * 100;
          const roundedClass =
            index === 0
              ? 'rounded-tl-[10px] rounded-bl-[10px]'
              : index === progress.length - 1
              ? 'rounded-tr-[10px] rounded-br-[10px]'
              : '';

          return (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ flex: 0 }}
                  animate={{ flex: item.count }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                  className={`${item.bgColor} ${roundedClass} h-2`}
                  style={{ minWidth: '1%' }}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="bg-[#272829]/100 text-white text-[0.6rem] font-bold border border-gray-700 rounded px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${item.bgColor}`}
                  ></span>
                  <span>{upperCaseAndRemoveUnderScores(item.name)}</span>
                </div>
                <div className="mt-1">
                  <strong>{item.count}</strong> Task{item.count>1 ? 's' : ""} (
                  {percentage.toFixed(1)}%)
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default Progress;
