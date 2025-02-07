
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { PDFUploadProps } from "@/lib/types";
import { FileInput } from "@/components/pdf-upload/FileInput";
import { FilePreview } from "@/components/pdf-upload/FilePreview";
import { HowItWorks } from "@/components/pdf-upload/HowItWorks";
import { handlePDFUpload, validatePDFFile } from "@/utils/pdf-upload";
import { supabase } from "@/lib/supabase";

export default function PDFUpload({ onUploadComplete }: PDFUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validatePDFFile(selectedFile, toast)) {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    let retryCount = 0;
    const maxRetries = 3;

    try {
      while (retryCount < maxRetries) {
        const pdfId = await handlePDFUpload(file, toast);
        console.log("[PDFUpload] PDF upload complete, pdfId:", pdfId);
        
        if (pdfId) {
          // Start PDF processing
          setProcessing(true);
          console.log("[PDFUpload] Starting PDF processing for pdfId:", pdfId);
          
          const { data, error } = await supabase.functions.invoke('process-pdf', {
            body: { pdfId }
          });

          if (error) {
            console.error("[PDFUpload] Processing error:", error);
            throw error;
          }

          console.log("[PDFUpload] Processing complete, result:", data);

          if (onUploadComplete) {
            console.log("[PDFUpload] Calling onUploadComplete with pdfId:", pdfId);
            onUploadComplete(pdfId);
          } else {
            const path = `/exam/${data.examId}/edit`;
            console.log("[PDFUpload] No onUploadComplete handler, navigating to:", path);
            console.log("[PDFUpload] Navigation state:", {
              pdfId,
              examId: data.examId,
              fromUpload: true
            });
            
            navigate(path, {
              state: { 
                pdfId,
                examId: data.examId,
                fromUpload: true
              },
            });
          }
          break;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    } catch (error: any) {
      console.error("[PDFUpload] Error in handleUpload:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload PDF</h1>
        <p className="text-muted-foreground mt-2">
          Upload a PDF file to automatically generate exam questions
        </p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">PDF Upload</CardTitle>
          <CardDescription className="text-muted-foreground">
            Select a PDF file to upload. Maximum file size is 10MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!file ? (
              <FileInput onFileChange={handleFileChange} />
            ) : (
              <FilePreview file={file} onRemove={() => setFile(null)} />
            )}

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                className="border-2 border-border hover:bg-muted"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading || processing}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {(uploading || processing) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {uploading
                  ? "Uploading..."
                  : processing
                  ? "Processing PDF..."
                  : "Upload and Process"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <HowItWorks />
    </div>
  );
}
