import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Check,
  X,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { UserProfile, AppTheme } from "../../types";
import { soundFx } from "../../utils/sound";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void> | void;
  theme?: AppTheme;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveAvatar,
  theme = "neumorphic",
}) => {
  const isDark =
    theme === "obsidian-gold" ||
    theme === "obsidian-noir" ||
    theme === "cyber-dark" ||
    theme === "neon-matrix";

  const [previewUrl, setPreviewUrl] = useState<string>(user.avatarUrl || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage(
        "Please select a valid image file (PNG, JPG, WEBP, GIF)."
      );
      soundFx.playWrong();
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File is too large. Please select an image under 10MB.");
      soundFx.playWrong();
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsProcessing(false);
        setErrorMessage("Failed to read image file.");
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setPreviewUrl(compressedDataUrl);
          soundFx.playTap();
          setSuccessMessage("Photo ready. Save to apply.");
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        setErrorMessage("Could not parse image. Please try another photo.");
      };
      img.src = result;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      soundFx.playMissionComplete();
      await onSaveAvatar(previewUrl);
      onClose();
    } catch (err: unknown) {
      soundFx.playWrong();
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update profile picture."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToInitials = async () => {
    setIsProcessing(true);
    try {
      soundFx.playTap();
      setPreviewUrl("");
      await onSaveAvatar("");
      onClose();
    } catch {
      setErrorMessage("Failed to reset photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="apple-surface w-full max-w-md rounded-3xl p-6 space-y-5 overflow-hidden max-h-[90vh] flex flex-col">
        <div
          className={`flex items-center justify-between pb-3 border-b ${
            isDark ? "border-white/[0.08]" : "border-black/[0.06]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark
                  ? "bg-[#2997FF]/15 text-[#2997FF]"
                  : "bg-[#0071E3]/10 text-[#0071E3]"
              }`}
            >
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Profile Photo
              </h3>
              <p
                className={`text-xs ${
                  isDark ? "text-zinc-400" : "text-[#6E6E73]"
                }`}
              >
                Customize your avatar
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-avatar-modal"
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="apple-surface-muted flex items-center gap-4 p-3.5 rounded-2xl">
          <div className="relative shrink-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={user.fullName || "Cadet Profile"}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() =>
                  setErrorMessage(
                    "Avatar image failed to load. Please choose another."
                  )
                }
                className="w-14 h-14 rounded-full object-cover border border-black/10 dark:border-white/10"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border ${
                  isDark
                    ? "bg-[#1C1C1E] border-white/10 text-white"
                    : "bg-white border-black/[0.06] text-[#1D1D1F]"
                }`}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <h4 className="font-semibold text-sm truncate">
              {user.fullName || "Cadet"}
            </h4>
            <p
              className={`text-xs truncate ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              {user.email || `@${user.username || "cadet"}`}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className={isDark ? "text-[#2997FF]" : "text-[#0071E3]"}>
                {previewUrl ? "Photo active" : "Initials"}
              </span>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleResetToInitials}
                  className="text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload-input"
          />

          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-[#0071E3] bg-[#0071E3]/[0.05]"
                : isDark
                ? "border-white/15 hover:border-[#2997FF]/50 bg-white/[0.02]"
                : "border-black/15 hover:border-[#0071E3]/50 bg-black/[0.015]"
            }`}
          >
            <div
              className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2.5 ${
                isDark
                  ? "bg-[#2997FF]/15 text-[#2997FF]"
                  : "bg-[#0071E3]/10 text-[#0071E3]"
              }`}
            >
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-xs">
              Choose photo from device
            </h4>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-zinc-400" : "text-[#6E6E73]"
              }`}
            >
              Drag and drop, or click to browse (PNG, JPG, WEBP up to 10MB)
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <X className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div
          className={`pt-3 border-t flex items-center gap-2.5 justify-end ${
            isDark ? "border-white/[0.08]" : "border-black/[0.06]"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className={`py-2 px-4 rounded-full text-xs font-medium ${
              isDark
                ? "hover:bg-white/[0.08] text-zinc-300"
                : "hover:bg-black/[0.05] text-[#6E6E73]"
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-save-avatar"
            disabled={isProcessing}
            onClick={handleSave}
            className="py-2 px-5 rounded-full font-semibold text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
