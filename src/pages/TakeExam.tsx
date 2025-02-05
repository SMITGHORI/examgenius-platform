import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ExamQuestion, Question } from "@/lib/types";

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadExam = async () => {
      try {
        const { data: exam, error: examError } = await supabase
          .from("exams")
          .select("*")
          .eq("id", examId)
          .single();

        if (examError) throw examError;

        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .select("*")
          .eq("exam_id", examId);

        if (questionError) throw questionError;

        setExamData(exam);
        const transformedQuestions: ExamQuestion[] = questionData.map((q: Question) => ({
          ...q,
          userAnswer: undefined
        }));
        setQuestions(transformedQuestions);
        setTimeLeft(exam.duration * 60);
      } catch (error: any) {
        console.error("Error loading exam:", error);
        toast({
          title: "Error",
          description: "Failed to load exam",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId, toast]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex ? { ...q, userAnswer: answerIndex.toString() } : q
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const answers = questions.map((q) => ({
        question_id: q.id,
        selected_option: q.userAnswer,
        is_correct: q.userAnswer === q.correct_answer,
        marks_obtained: q.userAnswer === q.correct_answer ? q.marks : 0
      }));

      const totalScore = answers.reduce((sum, a) => sum + a.marks_obtained, 0);

      const { error } = await supabase
        .from('exam_submissions')
        .insert({
          exam_id: examId,
          user_id: user.id,
          responses: answers,
          score: totalScore,
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;

      navigate(`/results/${examId}`);
    } catch (error: any) {
      console.error("Error submitting exam:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit exam",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {examData.title}
              </h1>
              <p className="text-gray-600">{examData.subject}</p>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-mono font-bold ${
                  timeLeft < 300 ? "text-red-600 animate-pulse" : "text-gray-900"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-600">Time Remaining</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  index === currentQuestion
                    ? "bg-purple-600 text-white"
                    : q.userAnswer !== undefined
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {questions[currentQuestion] && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900">
                  Question {currentQuestion + 1}
                </h2>
                <span className="text-sm text-gray-600">
                  {questions[currentQuestion].marks} marks
                </span>
              </div>

              <p className="text-gray-800 text-lg">
                {questions[currentQuestion].question_text}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion, index)}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                      questions[currentQuestion].userAnswer === index.toString()
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          questions[currentQuestion].userAnswer === index.toString()
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span
                        className={
                          questions[currentQuestion].userAnswer === index.toString()
                            ? "text-purple-700"
                            : "text-gray-700"
                        }
                      >
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      prev > 0 ? prev - 1 : questions.length - 1
                    )
                  }
                  variant="outline"
                  className="w-32"
                >
                  Previous
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-32 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>

                <Button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      prev < questions.length - 1 ? prev + 1 : 0
                    )
                  }
                  variant="outline"
                  className="w-32"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeExam;
