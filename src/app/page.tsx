"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";

type ProcessingState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "请上传 JPG、PNG 或 WebP 格式的图片";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "图片请小于 12MB";
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setErrorMessage("");
    setProcessingState("idle");
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setProcessingState("loading");
    setErrorMessage("");
    setResultUrl(null);

    const formData = new FormData();
    formData.append("image_file", selectedFile);
    formData.append("size", "auto");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `处理失败 (${response.status})`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("API 返回空结果");
      }

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProcessingState("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "处理失败";
      if (message === "The user aborted a request.") {
        setErrorMessage("请求超时，请重试");
      } else {
        setErrorMessage(message);
      }
      setProcessingState("error");
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "removed-background.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setProcessingState("idle");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="container">
        <header className="header">
          <h1 className="logo">SnapBackground</h1>
        </header>

        <main>
          {/* Upload Area */}
          <div
            className={`upload-area ${isDragOver ? "drag-over" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}
          >
            <div className="upload-icon">📷</div>
            <p>拖拽图片到这里，或点击选择文件</p>
            <p className="hint">支持 JPG、PNG、WebP，最大 12MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden-input"
          />

          {/* Error Message */}
          {errorMessage && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Original Preview */}
          {previewUrl && (
            <div className="preview-section">
              <p className="preview-label">原图</p>
              <div className="preview-box">
                <img src={previewUrl} alt="原图预览" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {previewUrl && !resultUrl && (
            <button
              className="btn btn-primary"
              onClick={handleRemoveBackground}
              disabled={processingState === "loading"}
            >
              {processingState === "loading" ? (
                <>
                  <span className="spinner"></span>
                  处理中...
                </>
              ) : (
                "🎯 移除背景"
              )}
            </button>
          )}

          {/* Loading State */}
          {processingState === "loading" && (
            <div className="status loading">
              正在移除背景，预计需要 5-10 秒...
            </div>
          )}

          {/* Result Preview */}
          {resultUrl && (
            <div className="result-section">
              <p className="preview-label">结果</p>
              <div className="preview-box checkerboard">
                <img src={resultUrl} alt="处理结果" />
              </div>
              <button className="btn download-btn" onClick={handleDownload}>
                ⬇️ 下载 PNG
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                处理下一张
              </button>
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        <p>
          由 <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer">Remove.bg</a> 提供 AI 能力
        </p>
      </footer>
    </>
  );
}
