
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import ExamWizard from "@/pages/ExamWizard";
import TakeExam from "@/pages/TakeExam";
import MyExams from "@/pages/MyExams";
import Profile from "@/pages/Profile";
import Results from "@/pages/Results";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";
import PDFUpload from "@/pages/PDFUpload";
import { ROUTES } from "@/lib/constants";

const queryClient = new QueryClient();

const PDFUploadWrapper = () => {
  const navigate = useNavigate();

  const handleUploadComplete = (pdfId: string) => {
    navigate(ROUTES.CREATE_EXAM, {
      state: {
        pdfId,
      },
      replace: true
    });
  };

  return <PDFUpload onUploadComplete={handleUploadComplete} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Routes with MainLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ExamWizard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-pdf"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PDFUploadWrapper />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-exams"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyExams />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/take-exam"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TakeExam />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:examId"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Results />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
