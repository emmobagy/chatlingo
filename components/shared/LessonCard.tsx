'use client';

import React from 'react';

interface LessonCardProps {
  title: string;
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  progress?: number;
  timeEstimate?: string;
  locked?: boolean;
  premium?: boolean;
  completed?: boolean;
  onClick?: () => void;
  className?: string;
}

export const LessonCard = ({
  title,
  description,
  difficulty = 'beginner',
  progress = 0,
  timeEstimate = '10 min',
  locked = false,
  premium = false,
  completed = false,
  onClick,
  className = '',
}: LessonCardProps) => {
  const difficultyConfig = {
    beginner: {
      label: 'Beginner',
      color: 'bg-primary-100 text-primary-700 border-primary-200',
      icon: '⭐',
    },
    intermediate: {
      label: 'Intermediate',
      color: 'bg-secondary-100 text-secondary-700 border-secondary-200',
      icon: '⭐⭐',
    },
    advanced: {
      label: 'Advanced',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: '⭐⭐⭐',
    },
  };

  const config = difficultyConfig[difficulty];

  return (
    <div
      onClick={!locked ? onClick : undefined}
      className={`
        relative group
        bg-white rounded-xl border-2 border-gray-200
        p-6
        transition-all duration-200
        ${!locked ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary-300' : 'opacity-75 cursor-not-allowed'}
        ${className}
      `}
    >
      {/* Lock Overlay */}
      {locked && (
        <div className="absolute inset-0 bg-gray-900/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {premium && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-heading font-bold text-lg text-gray-800 mb-1 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        </div>

        {completed && (
          <div className="ml-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={`
          inline-flex items-center gap-1
          px-3 py-1
          text-xs font-semibold
          rounded-full border
          ${config.color}
        `}>
          <span>{config.icon}</span>
          {config.label}
        </span>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeEstimate}
        </div>
      </div>

      {/* Hover Indicator */}
      {!locked && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export const LessonCardGrid = () => {
  const lessons = [
    {
      title: 'Basic Greetings',
      description: 'Learn how to say hello, goodbye, and introduce yourself',
      difficulty: 'beginner' as const,
      progress: 100,
      timeEstimate: '5 min',
      completed: true,
    },
    {
      title: 'Numbers & Counting',
      description: 'Master numbers from 0 to 100 and basic counting',
      difficulty: 'beginner' as const,
      progress: 65,
      timeEstimate: '8 min',
    },
    {
      title: 'Present Tense Verbs',
      description: 'Understand and use common verbs in present tense',
      difficulty: 'intermediate' as const,
      progress: 30,
      timeEstimate: '15 min',
    },
    {
      title: 'Business Vocabulary',
      description: 'Professional terms for work and business contexts',
      difficulty: 'advanced' as const,
      progress: 0,
      timeEstimate: '20 min',
      locked: true,
      premium: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {lessons.map((lesson, index) => (
        <LessonCard
          key={index}
          {...lesson}
          onClick={() => console.log(`Clicked: ${lesson.title}`)}
        />
      ))}
    </div>
  );
};
