
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisReport from './components/AnalysisReport';
import { AnalysisResult } from './types';

const App: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                AI-Powered Image <span className="text-indigo-600 dark:text-indigo-400">Report Card</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Get instant feedback on your product photos to meet marketplace best practices and boost sales.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg">
              <ImageUploader 
                setAnalysisResults={setAnalysisResults} 
                setIsLoading={setIsLoading}
                setError={setError}
                isLoading={isLoading}
                analysisResults={analysisResults}
              />
            </div>

            {error && (
              <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <AnalysisReport results={analysisResults} isLoading={isLoading} />
          </div>
        </main>
        <footer className="text-center py-4 mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Gemini API</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default App;
