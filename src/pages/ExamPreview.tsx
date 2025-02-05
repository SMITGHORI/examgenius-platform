
import { Button } from "@/components/ui/button";
import type { ExamData } from "@/lib/types";

interface Props {
  examData: ExamData;
  onStartExam: () => void;
}

const ExamPreview = ({ examData, onStartExam }: Props) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          Exam Preview
        </h2>
        <p className="text-gray-600">Review your exam before starting</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="space-y-8">
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
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Negative Marks</h3>
              <p className="text-gray-900">{examData.negative_marks}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Difficulty</h3>
              <p className="text-gray-900 capitalize">{examData.difficulty}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Questions</h3>
            <div className="space-y-6">
              {examData.questions?.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-gray-50 rounded-lg p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-medium text-gray-900">
                      Question {index + 1}
                    </h4>
                    <span className="text-sm text-gray-600">
                      {question.marks} marks
                    </span>
                  </div>
                  <p className="text-gray-800">{question.question_text}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-4 rounded-lg border ${
                          optIndex.toString() === question.correct_answer
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                              optIndex.toString() === question.correct_answer
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span
                            className={
                              optIndex.toString() === question.correct_answer
                                ? "text-green-700"
                                : "text-gray-700"
                            }
                          >
                            {option}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <Button
              onClick={onStartExam}
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200"
            >
              Start Exam
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPreview;
