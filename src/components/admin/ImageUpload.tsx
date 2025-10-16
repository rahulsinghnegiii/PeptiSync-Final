import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export const ImageUpload = ({ value, onChange, onRemove }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Please upload a JPG, PNG, or WebP image.";
    }

    if (file.size > maxSize) {
      return "File size exceeds 5MB. Please upload a smaller image.";
    }

    return null;
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadImage(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={preview}
              alt="Product preview"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center
            aspect-video w-full rounded-lg border-2 border-dashed
            transition-colors cursor-pointer
            ${isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }
            ${isUploading ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center gap-2 text-center p-6">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-3">
                  {isDragging ? (
                    <Upload className="h-6 w-6 text-primary" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP (max 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
