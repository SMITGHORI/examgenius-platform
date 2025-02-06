
import { supabase } from "@/lib/supabase/index";
import type { ToastProps } from "@/components/ui/toast";

export const validatePDFFile = (file: File, toast: (props: ToastProps) => void): boolean => {
  if (file.type !== "application/pdf") {
    toast({
      title: "Invalid file type",
      children: "Please upload a PDF file",
      variant: "destructive",
    });
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast({
      title: "File too large",
      children: "Maximum file size is 10MB",
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
      children: "Please sign in to upload PDFs",
      variant: "destructive",
    });
    return null;
  }

  const filename = `${user.id}/${Date.now()}-${file.name}`;
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
    handleUploadError(uploadError, toast);
    return null;
  }

  const { data: pdfUpload, error: pdfError } = await supabase
    .from('pdf_uploads')
    .select('*')
    .eq('storage_path', filename)
    .single();

  if (pdfError || !pdfUpload) {
    toast({
      title: "Upload error",
      children: pdfError?.message || "Failed to get PDF record",
      variant: "destructive",
    });
    return null;
  }

  toast({
    title: "Upload successful",
    children: "Your PDF has been uploaded and is being processed",
  });

  return pdfUpload.id;
};

const handleUploadError = (error: Error, toast: (props: ToastProps) => void) => {
  if (error.message.includes("Bucket not found")) {
    toast({
      title: "Storage not configured",
      children: "Please create a 'pdfs' bucket in your Supabase project",
      variant: "destructive",
    });
  } else if (error.message.includes("row-level security")) {
    toast({
      title: "Permission error",
      children: "You don't have permission to upload files. Please check your authentication.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Upload failed",
      children: error.message,
      variant: "destructive",
    });
  }
};
