import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PDFUpload from "./PDFUpload";
import CreateExam from "./CreateExam";
import GenerateQuestions from "./GenerateQuestions";
import ExamPreview from "./ExamPreview";

type WizardStep = "upload" | "configure" | "generate" | "preview" | "start";

export interface ExamData {
  id?: string;
  title: string;
  subject: string;
  duration: number;
  totalMarks: number;
  negativeMarks: number;
  difficulty: "easy" | "medium" | "hard";
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface LocationState {
  pdfUrl: string;
  pdfId: string;
  fileName: string;
}

const ExamWizard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<LocationState | null>(null);

  useEffect(() => {
    // Check if we have PDF data in the location state
    const state = location.state as LocationState;
    console.log("Location state:", state);

    if (state?.pdfUrl) {
      setPdfData(state);
      setCurrentStep("configure");
    }
  }, [location]);

  const steps = [
    { id: "upload", title: "Upload PDF", description: "Upload your exam PDF" },
    { id: "configure", title: "Configure Exam", description: "Set exam parameters" },
    { id: "generate", title: "Generate Questions", description: "Create questions from PDF" },
    { id: "preview", title: "Preview Exam", description: "Review and finalize" },
    { id: "start", title: "Start Exam", description: "Begin the exam" },
  ];

  const handlePDFUpload = (uploadedPdfId: string) => {
    setPdfId(uploadedPdfId);
    setCurrentStep("configure");
  };

  const handleExamConfig = (data: ExamData) => {
    setExamData(data);
    setCurrentStep("generate");
  };

  const handleQuestionsGenerated = (questions: Question[]) => {
    setExamData((prev) => prev ? { ...prev, questions } : null);
    setCurrentStep("preview");
  };

  const handleStartExam = () => {
    if (examData?.id) {
      navigate(`/take/${examData.id}`);
    }
  };

  if (pdfData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Progress Bar */}
        <div className="w-full bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center relative ${
                    index < steps.findIndex((s) => s.id === currentStep)
                      ? "text-green-600"
                      : index === steps.findIndex((s) => s.id === currentStep)
                      ? "text-purple-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      index < steps.findIndex((s) => s.id === currentStep)
                        ? "bg-green-100"
                        : index === steps.findIndex((s) => s.id === currentStep)
                        ? "bg-purple-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {index < steps.findIndex((s) => s.id === currentStep) ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs">{step.description}</div>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute top-4 left-full w-full h-0.5 -ml-4 ${
                        index < steps.findIndex((s) => s.id === currentStep)
                          ? "bg-green-200"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {currentStep === "configure" && (
            <CreateExam onConfigComplete={handleExamConfig} pdfId={pdfData.pdfId} />
          )}
          {currentStep === "generate" && examData && (
            <GenerateQuestions
              examData={examData}
              pdfId={pdfData.pdfId}
              onQuestionsGenerated={handleQuestionsGenerated}
            />
          )}
          {currentStep === "preview" && examData && (
            <ExamPreview examData={examData} onStartExam={handleStartExam} />
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Progress Bar */}
        <div className="w-full bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center relative ${
                    index < steps.findIndex((s) => s.id === currentStep)
                      ? "text-green-600"
                      : index === steps.findIndex((s) => s.id === currentStep)
                      ? "text-purple-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      index < steps.findIndex((s) => s.id === currentStep)
                        ? "bg-green-100"
                        : index === steps.findIndex((s) => s.id === currentStep)
                        ? "bg-purple-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {index < steps.findIndex((s) => s.id === currentStep) ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs">{step.description}</div>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute top-4 left-full w-full h-0.5 -ml-4 ${
                        index < steps.findIndex((s) => s.id === currentStep)
                          ? "bg-green-200"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {currentStep === "upload" && <PDFUpload onUploadComplete={handlePDFUpload} />}
        </div>
      </div>
    );
  }
};

export default ExamWizard;
