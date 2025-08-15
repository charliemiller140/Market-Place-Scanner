import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeImage } from '../services/geminiService';
import { generateMockReport } from '../services/mockAnalysisService';
import { AnalysisResult, UserTier } from '../types';
import LimitModal from './LimitModal';

interface ImageUploaderProps {
  setAnalysisResults: (result: AnalysisResult[] | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  analysisResults: AnalysisResult[] | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setAnalysisResults, setIsLoading, setError, isLoading, analysisResults }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  const { user, decrementScanCount, getRemainingScans, decrementAiCredits } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      if (selectedFiles.length === 0) {
          setError("Please select one or more valid image files.");
      }
      return;
    }

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError("Please select valid image files (e.g., JPEG, PNG, WEBP).");
      return;
    }
    
    setError(null);
    setAnalysisResults(null);

    if (isBulkMode) {
      setSelectedFiles(prev => [...prev, ...imageFiles]);
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } else {
      setSelectedFiles([imageFiles[0]]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls([reader.result as string]);
      };
      reader.readAsDataURL(imageFiles[0]);
    }
  };

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesChange(event.target.files);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-600');
    handleFilesChange(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => event.currentTarget.classList.add('border-indigo-600');
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => event.currentTarget.classList.remove('border-indigo-600');

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
  };


  const handleScanImage = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResults(null);

    if (user.tier === UserTier.PAID) {
      if (user.aiCredits < selectedFiles.length) {
        setError(`You need ${selectedFiles.length} AI credits for this scan, but you only have ${user.aiCredits}.`);
        setIsLoading(false);
        setIsModalOpen(true);
        return;
      }
      try {
        const analysisPromises = selectedFiles.map(async (file) => {
          const base64Image = await convertFileToBase64(file);
          return analyzeImage(base64Image, file.type);
        });
        
        const results = await Promise.all(analysisPromises);
        decrementAiCredits(selectedFiles.length);
        setAnalysisResults(results);

      } catch (e) {
        const error = e as Error;
        setError(error.message);
      }
    } else { // GUEST or FREE user
      if (getRemainingScans() <= 0) {
        setIsModalOpen(true);
        setIsLoading(false);
        return;
      }
      try {
        const result = await generateMockReport(selectedFiles[0]);
        decrementScanCount();
        setAnalysisResults([result]);
      } catch (e) {
        const error = e as Error;
        setError("An unexpected error occurred during the basic scan.");
      }
    }
    setIsLoading(false);
  };
  
  const handleReset = () => {
    setAnalysisResults(null);
    setError(null);
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const toggleBulkMode = () => {
      handleReset();
      setIsBulkMode(prev => !prev);
  }

  const renderPreviews = () => {
    if (previewUrls.length === 0) {
      return (
        <div className="text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" /></svg>
          <p className="mt-2">Drag & drop image(s) here, or <button onClick={triggerFileSelect} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">click to browse</button></p>
        </div>
      );
    }
    if (isBulkMode) {
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto h-full w-full p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview of ${selectedFiles[index]?.name || `image ${index + 1}`}`}
                className="h-20 w-20 object-cover rounded"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label={`Remove ${selectedFiles[index]?.name || `image ${index + 1}`}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          <button 
            onClick={triggerFileSelect}
            className="h-20 w-20 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Add more images"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs mt-1">Add More</span>
          </button>
        </div>
      );
    }
    return <img src={previewUrls[0]} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />;
  };

  return (
    <>
      {user.tier === UserTier.PAID && (
        <div className="flex items-center justify-end mb-4">
          <label htmlFor="bulk-toggle" className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-300">Bulk Upload</label>
          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="bulk-toggle" id="bulk-toggle" checked={isBulkMode} onChange={toggleBulkMode} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
            <label htmlFor="bulk-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
          </div>
          <style>{`.toggle-checkbox:checked { right: 0; border-color: #4f46e5; } .toggle-checkbox:checked + .toggle-label { background-color: #4f46e5; }`}</style>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div 
          className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 h-64 flex items-center justify-center text-center transition-colors"
          onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
        >
          {renderPreviews()}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={onFileSelect}
            className="hidden"
            ref={fileInputRef}
            multiple={isBulkMode}
          />
        </div>
        <div className="flex flex-col items-center md:items-start">
        {analysisResults ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Analysis Complete!</h2>
              <button
                onClick={handleReset}
                className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Scan Another Image
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Ready to analyze?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center md:text-left">
                {isBulkMode ? `Selected ${selectedFiles.length} images for analysis.` : "Upload your product image for an instant analysis."}
              </p>
              <button
                onClick={handleScanImage}
                disabled={selectedFiles.length === 0 || isLoading}
                className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing...
                  </>
                ) : isBulkMode ? `Scan ${selectedFiles.length} Images` : "Scan Image"}
              </button>
            </>
        )}
        </div>
      </div>
      <LimitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userTier={user.tier} />
    </>
  );
};

export default ImageUploader;