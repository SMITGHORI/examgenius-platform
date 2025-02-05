
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import type { FilePreviewProps } from "@/lib/types";

export const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
  return (
    <div className="border-2 border-black/10 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-black/5 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="hover:bg-black/5"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
