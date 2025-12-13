import { Button } from '@/libs/components/ui/button';
import { Progress } from '@/libs/components/ui/progress';
import { cn } from '@/libs/utils/string';
import { CloudUploadIcon, ImageIcon, Loader2, XIcon } from 'lucide-react';
import Image from 'next/image';

export const EmptyState = ({ isDragActive }: { isDragActive: boolean }) => {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12">
        <CloudUploadIcon className={cn('size-6 text-muted-foreground', isDragActive && 'text-primary')} />
      </div>
      <p className="text-base font-semibold text-foreground">
        Drag and drop an image here or <span className="text-purple-800 font-bold cursor-pointer">click to upload</span>
      </p>
      <Button type="button" className="mt-4">
        Select File
      </Button>
    </div>
  );
};

export const ErrorState = () => {
  return (
    <div className="text-center">
      <div className="flex flex-col items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
        <ImageIcon className="size-6 text-destructive" />
      </div>

      <p className="text-base font-semibold">Upload failed</p>
      <p className="text-xs mt-1">Something went wrong while uploading the file.</p>

      <Button className="mt-3" type="button">
        Retry File Selection
      </Button>
    </div>
  );
};

export const UploadedState = ({
  previewUrl,
  isDeleting,
  onRemoveFile
}: {
  previewUrl: string;
  isDeleting: boolean;
  onRemoveFile: () => void;
}) => {
  return (
    <div>
      <Image src={previewUrl} alt="Uploaded" fill className="object-contain p-2" />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className={cn('absolute top-4 right-4')}
        onClick={onRemoveFile}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <XIcon className="size-4" />}
      </Button>
    </div>
  );
};

export const UploadingState = ({ progress, fileName }: { progress: number; fileName: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <p className="text-sm text-muted-foreground">Uploading {fileName}...</p>
      <Progress value={progress} className="w-full" />
    </div>
  );
};
