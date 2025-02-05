
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, FileText, Timer, Users } from "lucide-react";
import type { Exam } from "@/lib/types";

const MyExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("exams")
          .select(`
            *,
            attempts_count:exam_responses(count)
          `)
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to match the Exam type
        const transformedExams: Exam[] = (data || []).map(exam => ({
          ...exam,
          status: exam.status as 'draft' | 'published', // Cast the status to our union type
          attempts_count: typeof exam.attempts_count === 'number' ? exam.attempts_count : 0
        }));

        setExams(transformedExams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Exams</h1>
          <p className="text-gray-600 mt-2">Manage your created exams</p>
        </div>
        <Link to="/create">
          <Button
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Create New Exam
          </Button>
        </Link>
      </div>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{exam.title}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      exam.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {exam.status}
                  </span>
                </CardTitle>
                <CardDescription>{exam.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Timer className="h-4 w-4 mr-2" />
                      {exam.duration} mins
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      {exam.total_marks} marks
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {exam.attempts_count || 0} attempts
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Eye className="h-4 w-4 mr-2" />
                      View Results
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {/* TODO: Edit exam */}}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => {/* TODO: View results */}}
                    >
                      Results
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No exams yet</h3>
            <p className="text-gray-600 mt-1">
              Create your first exam to get started
            </p>
            <Link to="/create" className="mt-4">
              <Button>Create New Exam</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyExams;
