// File: frontend/src/components/UploadPreview.tsx
import React from 'react';

interface UploadPreviewProps {
  fileUrl: string;
  fileType: string;
  onRemove: () => void;
}

export const UploadPreview: React.FC<UploadPreviewProps> = ({ 
  fileUrl, 
  fileType, 
  onRemove 
}) => {
  return (
    <div className="relative inline-block">
      {fileType === 'image' && (
        <img 
          src={fileUrl} 
          alt="Preview" 
          className="max-w-xs rounded-lg shadow-md"
        />
      )}
      {fileType === 'video' && (
        <video 
          src={fileUrl} 
          controls 
          className="max-w-xs rounded-lg shadow-md"
        />
      )}
      {fileType === 'audio' && (
        <audio 
          src={fileUrl} 
          controls 
          className="max-w-xs"
        />
      )}
      
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center text-xs"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
};
