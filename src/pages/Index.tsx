import { motion } from "framer-motion";
import { Upload, BookOpen, Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExamForm {
  subject: string;
  questionCount: string;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const form = useForm<ExamForm>();

  const onSubmit = async (data: ExamForm) => {
    setIsCreating(true);
    try {
      const { data: exam, error } = await supabase
        .from('exams')
        .insert({
          title: `${data.subject} Exam`,
          subject: data.subject,
          total_marks: parseInt(data.questionCount),
          duration: parseInt(data.duration),
          difficulty: data.difficulty,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true,
          status: 'active',
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Exam created",
        description: "Your exam has been created successfully. Redirecting to exam page..."
      });

      navigate(`/take/${exam.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container px-4 py-16 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-4">
            Welcome to ExamCraft AI
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Transform Your Learning Experience
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Create intelligent assessments from your study materials using advanced AI technology
          </p>
          <div className="space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="hover-lift">
                  <Plus className="mr-2 h-4 w-4" /> Create New Exam
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Exam</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter subject name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Questions</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select question count" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="30">30 Questions</SelectItem>
                              <SelectItem value="50">50 Questions</SelectItem>
                              <SelectItem value="80">80 Questions</SelectItem>
                              <SelectItem value="100">100 Questions</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="30">30 Minutes</SelectItem>
                              <SelectItem value="60">1 Hour</SelectItem>
                              <SelectItem value="90">1.5 Hours</SelectItem>
                              <SelectItem value="120">2 Hours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Start Exam"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button 
              size="lg" 
              variant="outline" 
              className="hover-lift"
              onClick={() => navigate('/upload')}
            >
              Upload PDF
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="hover-lift" 
              onClick={() => navigate('/results')}
            >
              View Results
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Upload className="w-6 h-6" />}
            title="Upload PDFs"
            description="Easily upload and manage your study materials"
            onClick={() => navigate('/upload')}
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Create Exams"
            description="AI-powered question generation from your content"
            onClick={() => navigate('/create')}
          />
          <FeatureCard
            icon={<Award className="w-6 h-6" />}
            title="Track Progress"
            description="Monitor your learning journey with detailed analytics"
            onClick={() => navigate('/results')}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8">
            <ol className="space-y-6">
              <Step number={1} title="Upload or Create">
                Upload your study materials or create an exam from scratch
              </Step>
              <Step number={2} title="Take the Test">
                Answer questions within the specified time limit
              </Step>
              <Step number={3} title="Get Results">
                Receive instant feedback and detailed analysis
              </Step>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, onClick }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  onClick: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    onClick={onClick}
    className="cursor-pointer"
  >
    <div className="p-6 glass-card hover-lift">
      <div className="rounded-full bg-primary/5 p-3 w-12 h-12 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </motion.div>
);

const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
  <li className="flex items-start">
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium mr-4">
      {number}
    </span>
    <div className="text-left">
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-muted-foreground">{children}</p>
    </div>
  </li>
);

export default Index;