'use client';

import { EmptyState, ErrorState, UploadedState, UploadingState } from '@/libs/components/file-uploader/render-state';
import { Card, CardContent } from '@/libs/components/ui/card';
import { constructUrl } from '@/libs/hooks/use-construct-url';
import { cn } from '@/libs/utils/string';
import { FC, useCallback, useEffect, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: 'image' | 'video';
}

interface FileUploaderProps {
  value?: string;
  onChange?: (value: string) => void;
  fileTypeAccepted?: 'image' | 'video';
}

export const FileUploader: FC<FileUploaderProps> = ({ onChange, value, fileTypeAccepted = 'image' }) => {
  const [fileState, setFileState] = useState<UploaderState>({
    id: null,
    file: null,
    uploading: false,
    progress: 0,
    key: value,
    isDeleting: false,
    error: false,
    objectUrl: value ? constructUrl(value) : undefined,
    fileType: fileTypeAccepted
  });

  const uploadFile = useCallback(
    async (file: File) => {
      setFileState((prev) => ({
        ...prev,
        uploading: true,
        progress: 0
      }));

      try {
        // 1. Get the presigned url from the server
        const presignedUrlResponse = await fetch('/api/s3/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contentType: file.type,
            fileName: file.name,
            size: file.size,
            isImage: fileTypeAccepted === 'image'
          })
        });

        if (!presignedUrlResponse.ok) {
          toast.error('Failed to get presigned url.');
          setFileState((prev) => ({
            ...prev,
            uploading: false,
            progress: 0,
            error: true
          }));
          return;
        }

        const { presignedUrl, key } = await presignedUrlResponse.json();

        // 2. Upload the file to the S3 bucket
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Update the progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentCompleted = Math.round((event.loaded / event.total) * 100);
              setFileState((prev) => ({
                ...prev,
                progress: percentCompleted
              }));
            }
          };

          // On load
          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 204) {
              setFileState((prev) => ({
                ...prev,
                progress: 100,
                uploading: false,
                key
              }));
              onChange?.(key);
              toast.success('File uploaded successfully.');
              resolve();
            } else {
              reject(new Error('Failed to upload file.'));
            }
          };

          // On error
          xhr.onerror = () => {
            reject(new Error('Failed to upload file.'));
          };

          // Open the PUT request
          xhr.open('PUT', presignedUrl);

          // Set the headers
          xhr.setRequestHeader('Content-Type', file.type);

          // Send the file
          xhr.send(file);
        });
      } catch (error) {
        toast.error('Something went wrong');
        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true
        }));
        return;
      }
    },
    [fileTypeAccepted, onChange]
  );

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      const file = acceptedFiles[0];

      // Revoke the old object url if it exists
      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
        URL.revokeObjectURL(fileState.objectUrl);
      }

      setFileState({
        file: file,
        uploading: false,
        progress: 0,
        objectUrl: URL.createObjectURL(file),
        fileType: fileTypeAccepted,
        id: uuidv4(),
        isDeleting: false,
        error: false
      });

      await uploadFile(file);
    },
    [fileState.objectUrl, fileTypeAccepted, uploadFile]
  );

  const handleRemoveFile = async () => {
    if (fileState.isDeleting || !fileState.objectUrl) return;
    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true
      }));

      const response = await fetch(`/api/s3/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: fileState.key })
      });

      if (!response.ok) {
        toast.error('Failed to delete file.');
        setFileState((prev) => ({
          ...prev,
          isDeleting: false,
          error: true
        }));
        return;
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
        URL.revokeObjectURL(fileState.objectUrl);
      }

      onChange?.('');

      setFileState({
        id: null,
        file: null,
        uploading: false,
        progress: 0,
        key: undefined,
        isDeleting: false,
        error: false,
        objectUrl: undefined,
        fileType: fileTypeAccepted
      });

      toast.success('File deleted successfully.');
    } catch (error) {
      toast.error('Something went wrong');
      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true
      }));
    }
  };

  const handleRejectedFiles = useCallback((fileRejections: FileRejection[]) => {
    if (!fileRejections.length) return;

    const tooManyFiles = fileRejections.find((rejection) => rejection.errors[0].code === 'too-many-files');
    const fileTooLarge = fileRejections.find((rejection) => rejection.errors[0].code === 'file-too-large');

    if (tooManyFiles) {
      toast.error('Only one file can be uploaded at a time.');
    }

    if (fileTooLarge) {
      toast.error('File is too large. Maximum size is 5MB.');
    }
  }, []);

  const renderContent = () => {
    if (fileState.uploading) {
      return <UploadingState progress={fileState.progress} fileName={fileState.file?.name || ''} />;
    }

    if (fileState.error) {
      return <ErrorState onRetry={open} />;
    }

    if (fileState.objectUrl) {
      return (
        <UploadedState
          previewUrl={fileState.objectUrl}
          isDeleting={fileState.isDeleting}
          onRemoveFile={handleRemoveFile}
          fileType={fileTypeAccepted}
        />
      );
    }

    return <EmptyState isDragActive={isDragActive} onSelectFile={open} />;
  };

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
    };
  }, [fileState.objectUrl]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: fileTypeAccepted === 'video' ? { 'video/*': [] } : { 'image/*': [] },
    maxFiles: 1,
    maxSize: fileTypeAccepted === 'video' ? 5000 * 1024 * 1024 : 5 * 1024 * 1024, // 5GB for video, 5MB for image
    onDrop: handleDrop,
    onDropRejected: handleRejectedFiles,
    disabled: fileState.uploading || !!fileState.objectUrl
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64',
        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'
      )}
    >
      <CardContent className="flex items-center justify-center h-full">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
};
