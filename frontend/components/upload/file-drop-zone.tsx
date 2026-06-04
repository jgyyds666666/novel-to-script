"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText } from "lucide-react";

interface FileDropZoneProps {
  onFileAccepted: (file: File) => void;
  acceptedExtensions?: string[];
  maxSizeMB?: number;
}

export function FileDropZone({
  onFileAccepted,
  acceptedExtensions = [".txt"],
  maxSizeMB = 10,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!acceptedExtensions.includes(ext)) {
        setError(`仅支持 ${acceptedExtensions.join(", ")} 格式`);
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`文件大小不能超过 ${maxSizeMB}MB`);
        return false;
      }
      setError(null);
      return true;
    },
    [acceptedExtensions, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        setSelectedFile(file);
        onFileAccepted(file);
      }
    },
    [onFileAccepted, validateFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        setSelectedFile(file);
        onFileAccepted(file);
      }
    },
    [onFileAccepted, validateFile]
  );

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          error && "border-destructive/50"
        )}
      >
        <input
          type="file"
          accept={acceptedExtensions.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-10 w-10 text-primary" />
            <span className="font-medium">{selectedFile.name}</span>
            <span className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <span className="font-medium text-primary underline underline-offset-2">
                点击上传
              </span>
              <span className="text-muted-foreground"> 或拖拽文件到此处</span>
            </div>
            <span className="text-xs text-muted-foreground">
              支持 .txt 纯文本文件，最大 {maxSizeMB}MB
            </span>
          </div>
        )}
      </label>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
