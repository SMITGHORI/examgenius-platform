import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { ExamCard } from "./ExamCard";
import { EmptyState } from "@/components/ui/empty-state";
import { type Exam } from "@/lib/types";
import { ROUTES } from "@/lib/constants";

interface ExamListProps {
  exams: Exam[];
  attemptsCount?: { [key: string]: number };
}

export function ExamList({ exams, attemptsCount = {} }: ExamListProps) {
  const navigate = useNavigate();

  if (exams.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No exams found"
        description="Create your first exam to get started"
        action={{
          label: "Create Exam",
          onClick: () => navigate(ROUTES.CREATE_EXAM),
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          attemptsCount={attemptsCount[exam.id] || 0}
          onEdit={() => navigate(`${ROUTES.CREATE_EXAM}/${exam.id}`)}
          onView={() => navigate(`${ROUTES.MY_EXAMS}/${exam.id}`)}
        />
      ))}
    </div>
  );
}
