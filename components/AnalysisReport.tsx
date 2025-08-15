
import React from 'react';
import { AnalysisResult, AnalysisCriteria } from '../types';

interface AnalysisReportProps {
  results: AnalysisResult[] | null;
  isLoading: boolean;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45; // r=45
    const offset = circumference - (score / 100) * circumference;
    
    let strokeColor = 'stroke-green-500';
    if (score < 75) strokeColor = 'stroke-yellow-500';
    if (score < 50) strokeColor = 'stroke-red-500';

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-200 dark:text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-1000 ${strokeColor}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{score}</span>
            </div>
        </div>
    );
};

const CriteriaRow: React.FC<{ item: AnalysisCriteria }> = ({ item }) => {
    const scoreColor = item.score >= 8 ? 'bg-green-100 text-green-800' : item.score >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
    const scoreColorDark = item.score >= 8 ? 'dark:bg-green-900 dark:text-green-300' : item.score >= 5 ? 'dark:bg-yellow-900 dark:text-yellow-300' : 'dark:bg-red-900 dark:text-red-300';

    return (
        <li className="py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full font-bold text-lg ${scoreColor} ${scoreColorDark}`}>
                        {item.score}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-md font-medium text-gray-900 truncate dark:text-white">{item.criteria}</p>
                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">{item.explanation}</p>
                </div>
            </div>
        </li>
    );
};

const ReportCard: React.FC<{result: AnalysisResult}> = ({ result }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {result.isMock && (
        <div className="bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500 text-indigo-700 dark:text-indigo-200 p-4" role="alert">
          <p className="font-bold">Basic Analysis Complete</p>
          <p>This is a preview. Upgrade to Pro to unlock a full AI-powered analysis!</p>
        </div>
      )}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-gray-50 dark:bg-gray-800/50">
        <div className="flex justify-center md:col-span-1">
            <ScoreCircle score={result.overallScore} />
        </div>
        <div className="md:col-span-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Overall Summary</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{result.summary}</p>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detailed Breakdown</h4>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {result.report.map((item, index) => (
            <CriteriaRow key={index} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
}


const AnalysisReport: React.FC<AnalysisReportProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 mx-auto"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="mt-4 text-xl font-semibold">Your report will appear here</h3>
            <p className="mt-2 text-md">Upload an image and click "Scan Image" to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Analysis Report Card(s)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {results.map((result, index) => (
          <ReportCard key={index} result={result} />
        ))}
      </div>
    </div>
  );
};

export default AnalysisReport;
