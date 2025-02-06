
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
    console.log("Upload complete, navigating with pdfId:", pdfId);
    navigate(ROUTES.CREATE_EXAM, {
      state: {
        pdfId,
      },
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
            <Route path={ROUTES.SIGN_IN} element={<SignIn />} />
            <Route path={ROUTES.SIGN_UP} element={<SignUp />} />
            
            {/* Protected Routes with MainLayout */}
            <Route
              path={ROUTES.HOME}
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CREATE_EXAM}
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ExamWizard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.UPLOAD_PDF}
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PDFUploadWrapper />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.MY_EXAMS}
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyExams />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.TAKE_EXAM}
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TakeExam />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={`${ROUTES.RESULTS}/:examId`}
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
