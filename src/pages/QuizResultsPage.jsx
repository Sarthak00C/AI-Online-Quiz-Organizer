import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../integrations/api/client";
import { AppLayout } from "../components/AppLayout";
import { useToast } from "../hooks/use-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Users,
  Target,
  Trophy,
  ArrowLeft,
  Calendar,
  CheckCircle2,
} from "lucide-react";

function QuizResultsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get Quiz Details
        const quizData = await apiClient.getQuiz(quizId);
        setQuiz(quizData.quiz);

        // 2. Get Leaderboard (Results)
        const leaderboardData = await apiClient.getLeaderboard(quizData.quiz.quizCode);
        setResults(leaderboardData.leaderboard || []);
      } catch (err) {
        console.error("Error loading results:", err);
        toast({
          title: "Error loading insights",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (quizId) loadData();
  }, [quizId, toast]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const avgAccuracy = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
    : 0;

  const topScore = results.length > 0 
    ? Math.max(...results.map(r => r.score))
    : 0;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/my-quizzes")}
              className="rounded-xl h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">
                Quiz Insights
              </h2>
              <p className="text-muted-foreground">
                Performance analysis for "{quiz?.title}"
              </p>
            </div>
          </div>
          
          <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quiz Code</span>
            <span className="font-heading font-bold text-primary tracking-widest">{quiz?.quizCode}</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl shadow-soft border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-soft border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
              <Target className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAccuracy}%</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-soft border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Score</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topScore}
                <span className="text-sm font-normal text-muted-foreground">/{quiz?.totalQuestions || results[0]?.totalQuestions || "?"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card className="rounded-2xl shadow-soft border-primary/5 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg font-heading">Attempt Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/20">
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead className="text-right">Completed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length > 0 ? (
                  results.map((result, idx) => (
                    <TableRow key={idx} className="hover:bg-primary/5 border-b border-muted/30">
                      <TableCell>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${
                          idx === 0 ? "bg-yellow-500/20 text-yellow-700" : 
                          idx === 1 ? "bg-slate-300 text-slate-700" :
                          idx === 2 ? "bg-orange-500/20 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {result.name || "Anonymous User"}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-primary">{result.score}</span>
                        <span className="text-muted-foreground">/{result.totalQuestions}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                          <span className="font-medium">{result.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <div className="flex items-center justify-end gap-1.5 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(result.completedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                      No attempts recorded for this quiz yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}

export default QuizResultsPage;
