"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
  selectedFile: File | null;
  onClear: () => void;
}

export function UploadZone({ onFileSelect, isAnalyzing, selectedFile, onClear }: UploadZoneProps) {
  const [dragError, setDragError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setDragError(null);
      if (rejected.length > 0) {
        const err = rejected[0].errors[0];
        if (err.code === "file-too-large") {
          setDragError("Dosya çok büyük. Maksimum 20MB.");
        } else if (err.code === "file-invalid-type") {
          setDragError("Geçersiz dosya türü. PDF, DOCX veya TXT yükleyin.");
        } else {
          setDragError(err.message);
        }
        return;
      }
      if (accepted.length > 0) {
        onFileSelect(accepted[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: isAnalyzing,
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
                <FileText className="h-7 w-7 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{selectedFile.name}</p>
                <p className="text-sm text-slate-400 mt-0.5">
                  {formatFileSize(selectedFile.size)} •{" "}
                  {selectedFile.name.split(".").pop()?.toUpperCase()} dosyası
                </p>
              </div>
              {!isAnalyzing && (
                <button
                  onClick={onClear}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isAnalyzing && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <div className="h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300",
                isDragActive
                  ? "border-violet-400 bg-violet-500/10 scale-[1.01]"
                  : "border-slate-700 bg-slate-900/50 hover:border-violet-500/50 hover:bg-violet-500/5"
              )}
            >
              <input {...getInputProps()} />

              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-4"
              >
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
                    isDragActive ? "bg-violet-500/30" : "bg-slate-800"
                  )}
                >
                  <Upload
                    className={cn(
                      "h-8 w-8 transition-colors duration-300",
                      isDragActive ? "text-violet-400" : "text-slate-400"
                    )}
                  />
                </div>

                <div>
                  <p className="text-lg font-semibold text-white mb-1">
                    {isDragActive ? "Dosyayı bırakın" : "Sözleşmeyi yükleyin"}
                  </p>
                  <p className="text-sm text-slate-400">
                    Sürükleyip bırakın veya{" "}
                    <span className="text-violet-400 font-medium">dosya seçin</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-md bg-slate-800 px-2 py-1 font-mono">PDF</span>
                  <span className="rounded-md bg-slate-800 px-2 py-1 font-mono">DOCX</span>
                  <span className="rounded-md bg-slate-800 px-2 py-1 font-mono">TXT</span>
                  <span className="text-slate-600">• Maks. 20MB</span>
                </div>
              </motion.div>
            </div>

            <AnimatePresence>
              {dragError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {dragError}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
