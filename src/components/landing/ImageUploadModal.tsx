import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { extractTextFromImage } from '@/services/geminiService';
import { toast } from 'sonner';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG)');
      return;
    }

    setSelectedImage(file);
    setExtractedText(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleScan = async () => {
    if (!selectedImage || !imagePreview) return;

    setIsScanning(true);

    try {
      // Extract text from image
      const text = await extractTextFromImage(imagePreview);
      
      if (!text || text.trim().length === 0) {
        toast.error('No text found in the image. Please try a clearer image.');
        setIsScanning(false);
        return;
      }

      setExtractedText(text);
      toast.success('Text extracted successfully!');
    } catch (error) {
      console.error('Failed to extract text:', error);
      toast.error('Failed to extract text from image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerate = () => {
    if (!extractedText) return;

    // Navigate to skill tree page with extracted text
    const encodedText = encodeURIComponent(extractedText.trim());
    navigate(`/skill-tree/${encodedText}?source=scan`);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="glass rounded-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Scan Textbook Page</h2>
              <p className="text-sm text-muted-foreground">
                Upload an image and we'll extract the text
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-accent rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Upload Zone */}
          {!selectedImage && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-300
                ${isDragging ? 'border-primary bg-primary/10' : 'border-card-border hover:border-primary/50'}
              `}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">
                Drop an image here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG (max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}

          {/* Image Preview */}
          {selectedImage && imagePreview && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-card-border">
                <img
                  src={imagePreview}
                  alt="Uploaded textbook page"
                  className="w-full max-h-96 object-contain bg-muted/20"
                />
                
                {/* Scanning Animation */}
                {isScanning && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm">
                    <div className="scanning-line" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="glass rounded-xl px-6 py-3">
                        <p className="text-foreground font-medium">Scanning...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Change Image Button */}
              {!isScanning && !extractedText && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setExtractedText(null);
                  }}
                  className="w-full"
                >
                  Choose Different Image
                </Button>
              )}
            </div>
          )}

          {/* Extracted Text Preview */}
          {extractedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">
                Extracted Text
              </label>
              <div className="glass rounded-xl p-4 max-h-48 overflow-y-auto border border-card-border">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {extractedText}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isScanning}
            >
              Cancel
            </Button>
            
            {!extractedText ? (
              <Button
                onClick={handleScan}
                disabled={!selectedImage || isScanning}
                className="flex-1 text-base font-semibold"
                style={{
                  background: selectedImage
                    ? 'linear-gradient(135deg, hsl(190, 100%, 50%), hsl(258, 90%, 66%))'
                    : undefined,
                  boxShadow: selectedImage ? '0 0 20px rgba(0, 212, 255, 0.2)' : undefined,
                }}
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Extract Text
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                className="flex-1 text-base font-semibold"
                style={{
                  background: 'linear-gradient(135deg, hsl(190, 100%, 50%), hsl(258, 90%, 66%))',
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
                }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Skill Tree
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
