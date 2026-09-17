import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Check,
  X,
  RefreshCw,
  Trash2
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
  const isDark = theme === "obsidian-gold" || theme === "obsidian-noir";
  const isNeumorphic = theme === "neumorphic";

  const [previewUrl, setPreviewUrl] = useState<string>(user.avatarUrl || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Compress & resize image to max 360x360 with Canvas for optimal local storage
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP, GIF).");
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
          setSuccessMessage("Photo ready! Click 'Save Photo' to apply.");
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
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Save changes
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      soundFx.playMissionComplete();
      await onSaveAvatar(previewUrl);
      onClose();
    } catch (err: any) {
      soundFx.playWrong();
      setErrorMessage(err.message || "Failed to update profile picture.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to initials / blank
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 space-y-5 transition-all shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
          isDark
            ? "bg-zinc-900 border border-zinc-800 text-zinc-100"
            : isNeumorphic
            ? "bg-[#E2E8F0] border border-white/80 text-slate-800 shadow-[10px_10px_30px_#c5cbd5,-10px_-10px_30px_#ffffff]"
            : "bg-[#FFFDF9] border-2 border-[#1E1B18] text-[#1E1B18]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                isDark
                  ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                  : "bg-white text-indigo-600 shadow-sm"
              }`}
            >
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Upload Profile Picture</h3>
              <p className="text-[11px] opacity-60">Personalize your cadet avatar</p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-avatar-modal"
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Display */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5">
          <div className="relative shrink-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={user.fullName || "Cadet Profile"}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => {
                  setErrorMessage("Avatar image failed to load. Please choose another.");
                }}
                className={`w-16 h-16 rounded-full object-cover border-2 shadow-md ${
                  isDark ? "border-amber-400" : "border-indigo-600"
                }`}
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${
                  isDark
                    ? "bg-amber-500/15 border-2 border-amber-400 text-amber-400"
                    : "bg-white border-2 border-indigo-600 text-indigo-600 shadow-sm"
                }`}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow">
              <Check className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="font-bold text-sm truncate">{user.fullName || "Cadet"}</h4>
            <p className="text-[11px] font-mono opacity-70 truncate">
              {user.email || `@${user.username || "cadet"}`}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <span
                className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                  isDark ? "bg-amber-400/20 text-amber-300" : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {previewUrl ? "Photo Active" : "Initials Monogram"}
              </span>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleResetToInitials}
                  className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
                  title="Remove photo"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload Area */}
        <div className="space-y-3">
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
              isDragOver
                ? isDark
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-indigo-600 bg-indigo-50"
                : isDark
                ? "border-zinc-700 hover:border-amber-400/80 bg-zinc-800/40 hover:bg-zinc-800/80"
                : "border-slate-300 hover:border-indigo-500 bg-white/70 hover:bg-white"
            }`}
          >
            <div
              className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2.5 transition-all ${
                isDark
                  ? "bg-zinc-800 text-amber-400"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs">Choose photo from your device</h4>
            <p className="text-[11px] opacity-60 mt-1">
              Drag & drop your photo here, or click to browse
            </p>
            <span className="inline-block mt-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 opacity-75">
              PNG, JPG, WEBP, GIF up to 10MB
            </span>
          </div>
        </div>

        {/* Notices */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <X className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center gap-2.5 justify-end">
          <button
            type="button"
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold ${
              isDark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-slate-200 text-slate-700"
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-save-avatar"
            disabled={isProcessing}
            onClick={handleSave}
            className={`py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-[0.99] disabled:opacity-50 ${
              isDark
                ? "bg-amber-400 hover:bg-amber-300 text-zinc-950"
                : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            }`}
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
