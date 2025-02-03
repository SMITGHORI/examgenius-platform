import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase, testDatabaseConnection } from "@/lib/supabase";

interface LocationState {
  pdfId: string;
  pdfUrl: string;
  fileName: string;
  pdfUpload?: any;
}

export default function CreateExam() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    totalMarks: 100
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;

  useEffect(() => {
    // Validate location state
    if (!state?.pdfId) {
      console.error("No PDF ID in state:", state);
      toast({
        title: "Error",
        description: "No PDF selected. Please upload a PDF first.",
        variant: "destructive"
      });
      navigate(-1);
      return;
    }

    console.log("CreateExam state:", state);

    const checkConnection = async () => {
      const result = await testDatabaseConnection();
      if (!result.success) {
        toast({
          title: "Database Connection Error",
          description: result.error,
          variant: "destructive",
          duration: 5000
        });
      }
    };
    checkConnection();
  }, [state, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Creating exam with PDF ID:", state.pdfId);
      console.log("Full state:", state);

      // Test connection first
      const { success, error: connectionError } = await testDatabaseConnection();
      if (!success) {
        throw new Error(`Database connection failed: ${connectionError}`);
      }

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      // Verify PDF exists
      const { data: pdf, error: pdfError } = await supabase
        .from("pdf_uploads")
        .select("id")
        .eq("id", state.pdfId)
        .single();

      if (pdfError) {
        console.error("PDF verification error:", pdfError);
        throw new Error(`PDF not found: ${pdfError.message}`);
      }

      if (!pdf) {
        throw new Error("PDF not found in database");
      }

      // Create the exam
      const examData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        total_marks: formData.totalMarks,
        pdf_id: state.pdfId,
        created_by: user.id,
        status: "draft"
      };

      console.log("Submitting exam data:", examData);

      const { data: exam, error: examError } = await supabase
        .from("exams")
        .insert(examData)
        .select()
        .single();

      if (examError) {
        console.error("Exam creation error:", examError);
        throw examError;
      }

      if (!exam) {
        throw new Error("No exam data returned after creation");
      }

      console.log("Exam created successfully:", exam);

      toast({
        title: "Success",
        description: "Exam created successfully"
      });

      // Navigate to the next step
      navigate(`/exam/${exam.id}/edit`, { replace: true });

    } catch (error: any) {
      console.error("Detailed error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        name: error.name,
        stack: error.stack
      });

      toast({
        title: "Failed to create exam",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Enter exam title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter exam description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 60,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min="1"
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalMarks: parseInt(e.target.value) || 100,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Exam"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}