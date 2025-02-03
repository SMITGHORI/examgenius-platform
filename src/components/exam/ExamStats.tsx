import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, FileText, GraduationCap } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="bg-black/5 p-2 rounded-full">
          <Icon className="h-4 w-4 text-black" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface ExamStatsProps {
  totalExams: number;
  totalAttempts: number;
  averageScore: number;
  totalTime: number;
}

export function ExamStats({
  totalExams,
  totalAttempts,
  averageScore,
  totalTime,
}: ExamStatsProps) {
  const stats = [
    {
      title: "Total Exams Created",
      value: totalExams,
      icon: FileText,
    },
    {
      title: "Total Attempts",
      value: totalAttempts,
      icon: BookOpen,
    },
    {
      title: "Average Score",
      value: `${averageScore.toFixed(1)}%`,
      icon: GraduationCap,
    },
    {
      title: "Total Time Spent",
      value: `${totalTime.toFixed(1)}h`,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
