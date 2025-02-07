
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PDFUpload from "./PDFUpload";
import CreateExam from "./CreateExam";
import GenerateQuestions from "./GenerateQuestions";
import ExamPreview from "./ExamPreview";
import type { ExamData, Question } from "@/lib/types";

type WizardStep = "upload" | "configure" | "generate" | "preview" | "start";

interface LocationState {
  pdfId: string;
  examId?: string;
  fromUpload?: boolean;
}

const ExamWizard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as LocationState;
    console.log("[ExamWizard] Component mounted");
    console.log("[ExamWizard] Location state:", state);
    console.log("[ExamWizard] URL param id:", id);
    console.log("[ExamWizard] Current step:", currentStep);

    if (id || state?.pdfId) {
      const newPdfId = id || state?.pdfId;
      console.log("[ExamWizard] Setting PDF ID to:", newPdfId);
      setPdfId(newPdfId);
      
      if (state?.fromUpload || (id && currentStep === "upload")) {
        console.log("[ExamWizard] Moving to configure step");
        setCurrentStep("configure");
      }
    }
  }, [location, id, currentStep]);

  const handlePDFUpload = (uploadedPdfId: string) => {
    console.log("[ExamWizard] PDF Upload complete:", uploadedPdfId);
    setPdfId(uploadedPdfId);
    setCurrentStep("configure");
  };

  const handleExamConfig = (data: ExamData) => {
    console.log("[ExamWizard] Exam configuration complete:", data);
    setExamData(data);
    setCurrentStep("generate");
  };

  const handleQuestionsGenerated = (questions: Question[]) => {
    console.log("[ExamWizard] Questions generated:", questions);
    setExamData((prev) => prev ? { ...prev, questions } : null);
    setCurrentStep("preview");
  };

  const handleStartExam = () => {
    if (examData?.id) {
      navigate(`/take/${examData.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {[
              { id: "upload", title: "Upload PDF", description: "Upload your exam PDF" },
              { id: "configure", title: "Configure Exam", description: "Set exam parameters" },
              { id: "generate", title: "Generate Questions", description: "Create questions from PDF" },
              { id: "preview", title: "Preview Exam", description: "Review and finalize" },
              { id: "start", title: "Start Exam", description: "Begin the exam" },
            ].map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center relative ${
                  index < [
                    "upload",
                    "configure",
                    "generate",
                    "preview",
                    "start",
                  ].indexOf(currentStep)
                    ? "text-green-600"
                    : index ===
                      [
                        "upload",
                        "configure",
                        "generate",
                        "preview",
                        "start",
                      ].indexOf(currentStep)
                    ? "text-purple-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    index < [
                      "upload",
                      "configure",
                      "generate",
                      "preview",
                      "start",
                    ].indexOf(currentStep)
                      ? "bg-green-100"
                      : index ===
                        [
                          "upload",
                          "configure",
                          "generate",
                          "preview",
                          "start",
                        ].indexOf(currentStep)
                      ? "bg-purple-100"
                      : "bg-gray-100"
                  }`}
                >
                  {index < [
                    "upload",
                    "configure",
                    "generate",
                    "preview",
                    "start",
                  ].indexOf(currentStep) ? (
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
                {index < 4 && (
                  <div
                    className={`absolute top-4 left-full w-full h-0.5 -ml-4 ${
                      index < [
                        "upload",
                        "configure",
                        "generate",
                        "preview",
                        "start",
                      ].indexOf(currentStep)
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
        {currentStep === "configure" && pdfId && (
          <CreateExam onConfigComplete={handleExamConfig} pdfId={pdfId} />
        )}
        {currentStep === "generate" && examData && (
          <GenerateQuestions
            examData={examData}
            pdfId={pdfId || ""}
            onQuestionsGenerated={handleQuestionsGenerated}
          />
        )}
        {currentStep === "preview" && examData && (
          <ExamPreview examData={examData} onStartExam={handleStartExam} />
        )}
      </div>
    </div>
  );
};

export default ExamWizard;
