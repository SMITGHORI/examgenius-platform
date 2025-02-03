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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/index";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    let retryCount = 0;
    const maxRetries = 3;

    const attemptUpload = async (): Promise<boolean> => {
      try {
        console.log("Starting upload attempt...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to upload PDFs",
            variant: "destructive",
          });
          return false;
        }

        console.log("User authenticated:", user.id);

        // Upload file to Supabase Storage
        const filename = `${user.id}/${Date.now()}-${file.name}`;
        console.log("Uploading file:", filename);

        const { error: uploadError, data } = await supabase.storage
          .from("pdfs")
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: "application/pdf",
            duplex: "half",
            metadata: {
              size: file.size.toString(),
              filename: file.name,
              mimetype: file.type,
              encoding: "7bit",
              "content-type": "application/pdf",
              "content-length": file.size.toString()
            }
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          
          if (uploadError.message.includes("Bucket not found")) {
            toast({
              title: "Storage not configured",
              description: "Please create a 'pdfs' bucket in your Supabase project",
              variant: "destructive",
            });
            return false;
          } 
          
          if (uploadError.message.includes("row-level security")) {
            toast({
              title: "Permission error",
              description: "You don't have permission to upload files. Please check your authentication.",
              variant: "destructive",
            });
            return false;
          }

          toast({
            title: "Upload failed",
            description: uploadError.message,
            variant: "destructive",
          });
          return false;
        }

        console.log("Upload successful, data:", data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("pdfs")
          .getPublicUrl(filename);

        console.log("Public URL:", publicUrl);

        // Wait for a short time to allow the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the PDF upload record
        const { data: pdfUpload, error: pdfError } = await supabase
          .from('pdf_uploads')
          .select('*')
          .eq('storage_path', filename)
          .single();

        console.log("PDF Upload Query Result:", { pdfUpload, pdfError });

        if (pdfError) {
          console.error("PDF Upload Error:", pdfError);
          throw new Error(`Failed to get PDF record: ${pdfError.message}`);
        }

        if (!pdfUpload) {
          console.error("No PDF Upload found for path:", filename);
          throw new Error('PDF record not found after upload');
        }

        console.log("PDF Upload record:", pdfUpload);

        toast({
          title: "Upload successful",
          description: "Your PDF has been uploaded and is being processed",
        });

        // Navigate to create exam with the correct PDF ID
        navigate(ROUTES.CREATE_EXAM, {
          state: {
            pdfUrl: publicUrl,
            pdfId: pdfUpload.id, // This should be a UUID from the pdf_uploads table
            fileName: file.name,
            pdfUpload: pdfUpload // Pass the entire record for debugging
          },
          replace: true
        });

        return true;

      } catch (error: any) {
        console.error("Error in upload attempt:", error);
        
        if (error.message?.includes("navigation")) {
          toast({
            title: "Navigation error",
            description: (
              <div className="flex flex-col gap-2">
                <p>Click the button below to continue to exam creation</p>
                <Button
                  onClick={() => window.location.href = ROUTES.CREATE_EXAM}
                  className="bg-black text-white hover:bg-black/90"
                >
                  Continue to Create Exam
                </Button>
              </div>
            ),
            duration: 10000,
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "An unexpected error occurred",
            variant: "destructive",
          });
        }
        return false;
      }
    };

    try {
      while (retryCount < maxRetries) {
        const success = await attemptUpload();
        if (success) break;
        
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Upload PDF</h1>
        <p className="text-muted-foreground mt-2">
          Upload a PDF file to automatically generate exam questions
        </p>
      </div>

      <Card className="border-2 border-black/10">
        <CardHeader>
          <CardTitle>PDF Upload</CardTitle>
          <CardDescription>
            Select a PDF file to upload. Maximum file size is 10MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!file ? (
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
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
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
                    onClick={() => setFile(null)}
                    className="hover:bg-black/5"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                className="border-2 border-black hover:bg-black/5"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading || processing}
                className="bg-black text-white hover:bg-black/90"
              >
                {(uploading || processing) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {uploading
                  ? "Uploading..."
                  : processing
                  ? "Processing..."
                  : "Upload and Process"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-black/10">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Learn how we process your PDF to create exam questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="bg-black/5 w-12 h-12 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="font-medium">1. Upload PDF</h3>
              <p className="text-sm text-muted-foreground">
                Upload your PDF document containing the course material or content
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-black/5 w-12 h-12 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-medium">2. Process Content</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes the content and extracts key information
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-black/5 w-12 h-12 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-medium">3. Generate Questions</h3>
              <p className="text-sm text-muted-foreground">
                Questions are automatically generated based on the content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}