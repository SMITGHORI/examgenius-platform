
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";

export const HowItWorks = () => {
  return (
    <Card className="border-2 border-black/10">
      <CardHeader>
        <CardTitle>How it works</CardTitle>
        <CardDescription>
          Learn how we process your PDF to create exam questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <div className="bg-black/5 w-12 h-12 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-medium">1. Upload PDF</h3>
            <p className="text-sm text-muted-foreground">
              Upload your PDF document containing the course material or content
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-black/5 w-12 h-12 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-medium">2. Process Content</h3>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes the content and extracts key information
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-black/5 w-12 h-12 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-medium">3. Generate Questions</h3>
            <p className="text-sm text-muted-foreground">
              Questions are automatically generated based on the content
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
