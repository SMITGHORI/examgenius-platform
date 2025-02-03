import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, FileText, Timer, Users } from "lucide-react";
import { type Exam } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ExamCardProps {
  exam: Exam;
  attemptsCount?: number;
  onEdit?: () => void;
  onView?: () => void;
}

export function ExamCard({ exam, attemptsCount = 0, onEdit, onView }: ExamCardProps) {
  return (
    <Card className="border-2 border-black/10 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="truncate">{exam.title}</CardTitle>
          <span
            className={`text-sm px-3 py-1 rounded-full border ${
              exam.status === "published"
                ? "bg-black text-white"
                : "bg-black/5 text-black"
            }`}
          >
            {exam.status}
          </span>
        </div>
        <CardDescription className="text-muted-foreground">
          {exam.subject}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-muted-foreground">
              <Timer className="h-4 w-4 mr-2" />
              {exam.duration} mins
            </div>
            <div className="flex items-center text-muted-foreground">
              <FileText className="h-4 w-4 mr-2" />
              {exam.total_marks} marks
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              {attemptsCount} attempts
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {formatDate(exam.created_at)}
            </div>
          </div>

          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                className="flex-1 border-2 border-black hover:bg-black/5"
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            {onView && (
              <Button
                className="flex-1 bg-black text-white hover:bg-black/90"
                onClick={onView}
              >
                View
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
