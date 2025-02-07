
import { supabase } from "@/lib/supabase/index";
import type { ToastProps } from "@/components/ui/toast";

export const validatePDFFile = (file: File, toast: (props: ToastProps) => void): boolean => {
  if (file.type !== "application/pdf") {
    toast({
      title: "Invalid file type",
      description: "Please upload a PDF file",
      variant: "destructive",
    });
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "Maximum file size is 10MB",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

export const handlePDFUpload = async (
  file: File,
  toast: (props: ToastProps) => void
): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please sign in to upload PDFs",
      variant: "destructive",
    });
    return null;
  }

  const filename = `${user.id}/${Date.now()}-${file.name}`;
  console.log("[handlePDFUpload] Uploading file:", filename);

  const { error: uploadError, data } = await supabase.storage
    .from("pdfs")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "application/pdf",
    });

  if (uploadError) {
    console.error("[handlePDFUpload] Upload error:", uploadError);
    
    if (uploadError.message.includes("authentication")) {
      toast({
        title: "Authentication error",
        description: "Please sign in again",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Upload failed",
      description: uploadError.message,
      variant: "destructive",
    });
    return null;
  }

  console.log("[handlePDFUpload] File uploaded successfully, creating database record");

  const { data: pdfUpload, error: dbError } = await supabase
    .from('pdf_uploads')
    .insert({
      title: file.name,
      file_name: file.name,
      storage_path: filename,
      size: file.size,
      uploaded_by: user.id,
      status: 'pending'
    })
    .select()
    .single();

  if (dbError) {
    console.error("[handlePDFUpload] Database error:", dbError);
    toast({
      title: "Upload error",
      description: "Failed to save file information",
      variant: "destructive",
    });
    return null;
  }

  toast({
    title: "Upload successful",
    description: "Your PDF is being processed",
  });

  return pdfUpload.id;
};
