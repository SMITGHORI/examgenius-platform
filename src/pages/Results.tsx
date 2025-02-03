import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface Submission {
  id: string;
  exam_id: string;
  score: number;
  submitted_at: string;
  exam: {
    title: string;
    total_marks: number;
  };
}

const Results = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            *,
            exam:exams (
              title,
              total_marks
            )
          `)
          .eq('user_id', user.user?.id)
          .order('submitted_at', { ascending: false });

        if (error) throw error;

        setSubmissions(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load results",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const chartData = submissions.map(submission => ({
    name: submission.exam.title,
    score: (submission.score / submission.exam.total_marks) * 100
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Results</h1>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No exam submissions yet</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            {submissions.map(submission => (
              <div
                key={submission.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {submission.exam.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted on{" "}
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {submission.score}/{submission.exam.total_marks}
                    </p>
                    <p className="text-sm text-gray-500">
                      {((submission.score / submission.exam.total_marks) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Results;