import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../integrations/api/client";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  BookOpen,
  Copy,
  Trash2,
  ExternalLink,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function MyQuizzesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await apiClient.getMyQuizzes();
        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        toast({
          title: "Error loading quizzes",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchQuizzes();
  }, [user, toast]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: `Quiz code ${code} copied to clipboard.`,
    });
  };

  const deleteQuiz = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz? This will also remove all attempts and questions.")) {
      return;
    }

    try {
      await apiClient.deleteQuiz(id);
      setQuizzes(quizzes.filter((q) => q.id !== id));
      toast({ title: "Quiz deleted successfully" });
    } catch (err) {
      toast({
        title: "Error deleting quiz",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (quiz) => {
    try {
      await apiClient.updateQuiz(quiz.id, { isActive: !quiz.isActive });
      setQuizzes(
        quizzes.map((q) =>
          q.id === quiz.id ? { ...q, isActive: !q.isActive } : q
        )
      );
      toast({
        title: `Quiz ${!quiz.isActive ? "activated" : "deactivated"}`,
      });
    } catch (err) {
      toast({
        title: "Error updating status",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              My Quizzes
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage and share your created quizzes
            </p>
          </div>
          <Button onClick={() => navigate("/create-quiz")} className="rounded-xl font-bold">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Quiz
          </Button>
        </div>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="rounded-2xl shadow-soft hover:shadow-md transition-all border-primary/5 flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={quiz.isActive ? "default" : "secondary"}
                      className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold"
                    >
                      {quiz.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="font-heading text-xl leading-tight">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {quiz.topic} • {quiz.difficulty}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="bg-muted/50 rounded-xl p-3 flex items-center justify-between border border-primary/5">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">
                        Quiz Code
                      </p>
                      <p className="font-heading font-bold text-lg tracking-widest text-primary">
                        {quiz.quizCode}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyCode(quiz.quizCode)}
                      className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-muted/30 grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg h-9 text-xs"
                    onClick={() => toggleStatus(quiz)}
                  >
                    {quiz.isActive ? (
                      <><XCircle className="mr-1.5 h-3.5 w-3.5" /> Deactivate</>
                    ) : (
                      <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Activate</>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg h-9 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteQuiz(quiz.id)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="rounded-xl h-10 font-bold"
                    onClick={() => navigate(`/my-quizzes/${quiz.id}/results`)}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Insights
                  </Button>

                  <Button
                    className="rounded-xl h-10 font-bold"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Launch
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed border-2 py-20 text-center bg-muted/20">
            <CardContent>
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">No quizzes created yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                Start by creating your first quiz manually or with the help of AI!
              </p>
              <Button onClick={() => navigate("/create-quiz")} className="rounded-xl font-bold">
                <PlusCircle className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export default MyQuizzesPage;
