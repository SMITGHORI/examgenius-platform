
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import type { FileInputProps } from "@/lib/types";

export const FileInput = ({ onFileChange }: FileInputProps) => {
  return (
    <div className="border-2 border-dashed border-black/10 rounded-lg p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="bg-black/5 p-4 rounded-full mb-4">
          <FileText className="h-8 w-8 text-black" />
        </div>
        <h3 className="text-lg font-medium mb-2">
          Drop your PDF here or click to upload
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          PDF files only, up to 10MB
        </p>
        <Label
          htmlFor="pdf-upload"
          className="bg-black text-white hover:bg-black/90 px-4 py-2 rounded-lg cursor-pointer"
        >
          Choose File
        </Label>
        <Input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
