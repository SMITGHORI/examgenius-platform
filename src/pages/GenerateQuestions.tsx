
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { ExamData, Question } from "@/lib/types";

interface Props {
  examData: ExamData;
  pdfId: string;
  onQuestionsGenerated: (questions: Question[]) => void;
}

const GenerateQuestions = ({ examData, pdfId, onQuestionsGenerated }: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const { toast } = useToast();

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-exam-questions', {
        body: { pdfId }
      });

      if (error) throw error;

      const questions: Question[] = data.questions.map((q: any, index: number) => ({
        id: `q_${index}`,
        exam_id: examData.id || "",
        ...q,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      setGeneratedQuestions(questions);
      toast({
        title: "Success",
        description: "Questions generated successfully!",
      });

      // Save questions to database
      const { error: saveError } = await supabase.from("questions").insert(
        questions.map(q => ({
          exam_id: examData.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          marks: q.marks,
          explanation: q.explanation,
          page_number: q.page_number
        }))
      );

      if (saveError) throw saveError;
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

      <Card>
        <CardHeader>
          <CardTitle>Exam Configuration</CardTitle>
          <CardDescription>Review your exam settings before generating questions</CardDescription>
        </CardHeader>
        <CardContent>
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
              <p className="text-gray-900">{examData.total_marks}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedQuestions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
            <CardDescription>Review the generated questions before proceeding</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {generatedQuestions.map((question, index) => (
                  <Card key={question.id} className="border border-gray-200">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            Question {index + 1}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {question.marks} marks
                          </span>
                        </div>
                        <p className="text-gray-800">{question.question_text}</p>
                        <div className="grid gap-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-4 rounded-lg ${
                                optIndex.toString() === question.correct_answer
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-200"
                              } border`}
                            >
                              <div className="flex items-center space-x-3">
                                <span
                                  className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${
                                    optIndex.toString() === question.correct_answer
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span>{option}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <span className="font-semibold">Explanation: </span>
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={generateQuestions}
          disabled={isGenerating}
          className="w-full h-12 text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Questions...</span>
            </div>
          ) : (
            "Generate Questions"
          )}
        </Button>
      )}
    </div>
  );
};

export default GenerateQuestions;
