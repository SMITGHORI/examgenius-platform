import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ExamData, Question } from "@/lib/types";

interface Props {
  examData: ExamData;
  pdfId: string;
  onQuestionsGenerated: (questions: Question[]) => void;
}

const GenerateQuestions = ({ examData, pdfId, onQuestionsGenerated }: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generateQuestions = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Get PDF content
      const { data: pdf, error: pdfError } = await supabase
        .from("pdfs")
        .select("storage_path")
        .eq("id", pdfId)
        .single();

      if (pdfError) throw pdfError;

      // Simulate question generation with progress updates
      const totalSteps = 5;
      const questions: Question[] = [];

      for (let i = 1; i <= totalSteps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProgress((i / totalSteps) * 100);

        // Add sample questions (replace with real question generation)
        for (let j = 1; j <= 4; j++) {
          questions.push({
            id: `q${i}_${j}`,
            exam_id: examData.id || '',
            question_text: `Sample question ${i}.${j} from the PDF content`,
            options: [
              "Sample option 1",
              "Sample option 2",
              "Sample option 3",
              "Sample option 4",
            ],
            correct_answer: "0",
            marks: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      // Save questions to database
      const { error: saveError } = await supabase.from("questions").insert(
        questions.map((q) => ({
          exam_id: examData.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          marks: q.marks,
        }))
      );

      if (saveError) throw saveError;

      toast({
        title: "Success",
        description: "Questions generated successfully!",
      });

      onQuestionsGenerated(questions);
    } catch (error: any) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          Generate Questions
        </h2>
        <p className="text-gray-600">
          We'll analyze your PDF and generate questions based on your exam configuration
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Exam Title</h3>
              <p className="text-gray-900">{examData.title}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Subject</h3>
              <p className="text-gray-900">{examData.subject}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Duration</h3>
              <p className="text-gray-900">{examData.duration} minutes</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Total Marks</h3>
              <p className="text-gray-900">{examData.totalMarks}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Negative Marks</h3>
              <p className="text-gray-900">{examData.negativeMarks}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Difficulty</h3>
              <p className="text-gray-900 capitalize">{examData.difficulty}</p>
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600">
                Generating questions... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button
            onClick={generateQuestions}
            disabled={isGenerating}
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Questions...</span>
              </div>
            ) : (
              "Generate Questions"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuestions;