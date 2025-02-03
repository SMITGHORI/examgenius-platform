import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamList } from "@/components/exam/ExamList";
import { ExamStats } from "@/components/exam/ExamStats";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingPage } from "@/components/ui/loading";
import { BookOpen, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Exam } from "@/lib/types";

interface DashboardStats {
  totalExams: number;
  totalAttempts: number;
  averageScore: number;
  totalTime: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    totalAttempts: 0,
    averageScore: 0,
    totalTime: 0,
  });
  const [recentExams, setRecentExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: exams } = await supabase
          .from("exams")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        const { data: responses } = await supabase
          .from("exam_responses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (exams && responses) {
          setStats({
            totalExams: exams.length,
            totalAttempts: responses.length,
            averageScore:
              responses.reduce((acc, curr) => acc + curr.total_marks, 0) /
                (responses.length || 1),
            totalTime:
              responses.reduce(
                (acc, curr) =>
                  acc +
                  (new Date(curr.submitted_at).getTime() -
                    new Date(curr.created_at).getTime()),
                0
              ) /
              (1000 * 60 * 60),
          });
          setRecentExams(exams.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">
                Welcome to ExamGenius
              </h1>
              <p className="text-lg text-muted-foreground">
                Create, manage, and take exams with ease. Get started by creating
                your first exam or taking one.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={ROUTES.CREATE_EXAM}>
                  <Button
                    size="lg"
                    className="bg-black text-white hover:bg-black/90"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Exam
                  </Button>
                </Link>
                <Link to={ROUTES.TAKE_EXAM}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-black hover:bg-black/5"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Take Exam
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <ExamStats {...stats} />

      {/* Recent Exams */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recent Exams</h2>
            <p className="text-muted-foreground">
              Your recently created exams and their status
            </p>
          </div>
          <Link to={ROUTES.MY_EXAMS}>
            <Button 
              variant="outline"
              className="border-2 border-black hover:bg-black/5"
            >
              View All Exams
            </Button>
          </Link>
        </div>

        {recentExams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentExams.map((exam) => (
              <Card
                key={exam.id}
                className={cn(
                  "border-2 hover:shadow-lg transition-shadow",
                  exam.status === "published"
                    ? "border-l-4 border-l-black"
                    : "border-l-4 border-l-black/30"
                )}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-1">{exam.title}</CardTitle>
                  <CardDescription>{exam.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{exam.duration} mins</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Marks:</span>
                      <span className="font-medium">{exam.total_marks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span
                        className={cn(
                          "font-medium",
                          exam.status === "published"
                            ? "text-black"
                            : "text-black/60"
                        )}
                      >
                        {exam.status.charAt(0).toUpperCase() +
                          exam.status.slice(1)}
                      </span>
                    </div>
                    <Link to={`${ROUTES.MY_EXAMS}/${exam.id}`}>
                      <Button className="w-full bg-black text-white hover:bg-black/90">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="bg-black/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <PlusCircle className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-lg font-medium">No exams created yet</h3>
                <p className="text-muted-foreground">
                  Get started by creating your first exam
                </p>
                <Link to={ROUTES.CREATE_EXAM}>
                  <Button className="bg-black text-white hover:bg-black/90">
                    Create Your First Exam
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
