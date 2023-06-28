import { read } from "fs";
import { useRef, useState, useEffect, useCallback } from "react";

export type UploadedFile = {
  file: File;
  preview: string;
};

export default function useFileUpload() {
  const [upload, setUpload] = useState<UploadedFile>();
  const [sizeExceeded, setSizeExceeded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = 1_000_000; // 1mb

  const removeFile = () => {
    setUpload(undefined);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    afterUpload?: (preview: string | ArrayBuffer | null, file: File) => void
  ) => {
    if (!event.target.files) return;

    const uploadedFile = event.target.files[0];

    const maxSizeExceeded = uploadedFile.size > maxFileSize;

    if (maxSizeExceeded) {
      setSizeExceeded(true);
      return;
    }
    if (sizeExceeded) setSizeExceeded(false);

    const reader = new FileReader();
    reader.readAsDataURL(uploadedFile as Blob);

    reader.onload = () => {
      setUpload({
        file: uploadedFile,
        preview: reader.result as string,
      });

      if (!afterUpload) return;
      afterUpload(reader.result, uploadedFile);
    };
  };

  const formattedMaxSize = () => {
    const sizeMb = maxFileSize / 1024 ** 2;
    return `${sizeMb.toFixed(0)} MB`;
  };

  return {
    upload,
    handleFileChange,
    removeFile,
    formattedMaxSize,
    sizeExceeded,
    fileInputRef,
  };
}
