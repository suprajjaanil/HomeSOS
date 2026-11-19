import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { ImageUploadResponse } from '../types';

interface PhotoUploadProps {
  attachedImages: string[];
  onImagesChange: (images: string[], visualDesc?: string) => void;
  isLoading?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  attachedImages,
  onImagesChange,
  isLoading = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [latestVisualDesc, setLatestVisualDesc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const res: ImageUploadResponse = await api.uploadImage(file);
      const updated = [...attachedImages, res.image_url];
      if (res.visual_description) {
        setLatestVisualDesc(res.visual_description);
      }
      onImagesChange(updated, res.visual_description || undefined);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload photo';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = attachedImages.filter((_, idx) => idx !== indexToRemove);
    onImagesChange(updated);
    if (updated.length === 0) {
      setLatestVisualDesc(null);
    }
  };

  return (
    <div className="bg-navy-900/60 border border-navy-700/80 rounded-2xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-teal-500/20 text-teal-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">
              Attach Problem Photos <span className="text-[10px] text-teal-400 font-normal">(Optional)</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Take a camera snapshot or upload clear photos of visible water leaks, cracks, switches, etc.
            </p>
          </div>
        </div>

        {attachedImages.length > 0 && (
          <span className="text-[10px] bg-teal-900/60 text-teal-300 border border-teal-700/60 px-2 py-0.5 rounded-full font-mono">
            {attachedImages.length} attached
          </span>
        )}
      </div>

      {/* Action Buttons: Camera Snap & File Upload */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isUploading || isLoading}
          className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Take Camera Photo</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading}
          className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
          <span>Choose from Gallery</span>
        </button>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading && (
          <span className="text-xs text-teal-300 flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Uploading & scanning photo...
          </span>
        )}
      </div>

      {uploadError && (
        <div className="text-[11px] text-red-300 bg-red-950/60 border border-red-800/80 p-2 rounded-lg mb-2">
          {uploadError}
        </div>
      )}

      {/* Thumbnails Gallery */}
      {attachedImages.length > 0 && (
        <div className="space-y-2 mt-2">
          <div className="flex flex-wrap gap-2.5">
            {attachedImages.map((imgUrl, idx) => (
              <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-navy-600 shadow-md bg-navy-950">
                <img
                  src={imgUrl}
                  alt={`Attached preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Visual Observation AI Note */}
          {latestVisualDesc && (
            <div className="bg-navy-950/80 border border-teal-500/30 rounded-xl p-2.5 text-[11px] text-teal-200 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-300 block font-bold mb-0.5">
                  AI Visual Observation (Preliminary):
                </strong>
                <p className="text-slate-300 italic">
                  "{latestVisualDesc}"
                </p>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  ⚠️ Note: Preliminary visual observation only. Physical inspection by technician will confirm exact diagnostics.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
