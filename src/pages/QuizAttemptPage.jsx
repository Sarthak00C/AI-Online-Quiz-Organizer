import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

// FIXED: removed @ alias
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../integrations/api/client";
import { AppLayout } from "../components/AppLayout";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";

import { useToast } from "../hooks/use-toast";
import { Clock, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

function QuizAttemptPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REPLACE the entire fetchQuiz function
      const fetchQuiz = async () => {
      if (!quizId) {
        console.error("No quizId found in URL");
        return;
      }

      try {
        console.log("Fetching quiz with ID:", quizId);

        const [quizData, questionsData] = await Promise.all([
          apiClient.getQuiz(quizId),
          apiClient.getQuestions(quizId)
        ]);

        console.log("✅ Quiz Data received:", quizData);
        console.log("✅ Questions Data received:", questionsData);
        console.log("✅ Quiz Data received:", JSON.stringify(quizData, null, 2));
        console.log("✅ Questions Data received:", JSON.stringify(questionsData, null, 2));

        setQuiz(quizData.quiz);
        setTimeLeft(quizData.quiz.timeLimit * 60);

        // Set questions safely
        const questionsList = questionsData?.questions || questionsData || [];
        console.log("Final questions array length:", questionsList.length);

        setQuestions(questionsList.map(q => ({
          id: q.id,
          questionText: q.questionText || q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          orderIndex: q.orderIndex,
        })));

      } catch (err) {
        console.error("❌ Quiz fetch failed:", err.response?.data || err.message);
        toast({ title: "Error", description: "Failed to load quiz", variant: "destructive" });
        navigate("/join-quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  useEffect(() => {
    if (submitted || loading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, loading]);

  const handleSubmit = useCallback(async () => {
    if (submitted || !user || !quizId) return;

    setSubmitted(true);

    let correct = 0;

    const submittedAnswers = questions.map((q) => {
      const selectedAnswer = answers[q.id] ?? -1;

      if (selectedAnswer === q.correctAnswer) {
        correct++;
      }

      return {
        questionId: q.id,
        selectedAnswer,
      };
    });

    setScore(correct);

    try {
      await apiClient.submitAttempt(quizId, submittedAnswers);

      toast({
        title: "Quiz submitted!",
        description: `You scored ${correct}/${questions.length}`,
      });
    } catch (err) {
      toast({
        title: "Error submitting quiz",
        description: err.message,
        variant: "destructive",
      });
    }
  }, [submitted, user, quizId, questions, answers, toast]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (submitted) {
    const pct =
      questions.length > 0
        ? Math.round((score / questions.length) * 100)
        : 0;

    return (
      <AppLayout>
        <div className="max-w-lg mx-auto mt-12 text-center animate-fade-in">

          <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>

          <h2 className="font-heading text-3xl font-bold">
            Quiz Complete!
          </h2>

          <p className="text-muted-foreground mt-3 text-lg">
            You scored{" "}
            <span className="font-bold text-primary">
              {score}
            </span>{" "}
            out of{" "}
            <span className="font-bold">
              {questions.length}
            </span>
          </p>

          <div className="mt-4 mx-auto max-w-xs">
            <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
              <span>Accuracy</span>
              <span className="font-medium">{pct}%</span>
            </div>

            <Progress value={pct} className="h-3 rounded-full" />
          </div>

          <div className="mt-8 flex gap-3 justify-center">
            <Button
              onClick={() => navigate("/leaderboard")}
              className="rounded-xl"
            >
              View Leaderboard
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl"
            >
              Dashboard
            </Button>
          </div>

        </div>
      </AppLayout>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header: Title & Timer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              {quiz?.title || "Quiz Attempt"}
            </h2>
            <p className="text-muted-foreground">
              {quiz?.topic} • {questions.length} Questions
            </p>
          </div>

          <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 self-start md:self-auto">
            <Clock className={`h-5 w-5 ${timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary"}`} />
            <span className={`font-mono text-xl font-bold ${timeLeft < 60 ? "text-destructive" : "text-primary"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>{questions.length > 0 ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0}% Complete</span>
          </div>
          <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2 rounded-full" />
        </div>

        {/* Question Card */}
        <Card className="rounded-2xl shadow-soft border-primary/5 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl font-heading leading-relaxed">
              {currentQ?.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-4">
            <div className="grid gap-3">
              {currentQ?.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => setAnswers({ ...answers, [currentQ.id]: oIdx })}
                  className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${answers[currentQ.id] === oIdx
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-muted hover:border-primary/30 hover:bg-muted/50"
                    }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold transition-colors ${answers[currentQ.id] === oIdx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}>
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span className={`font-medium text-lg ${answers[currentQ.id] === oIdx ? "text-primary" : "text-foreground"
                    }`}>
                    {opt}
                  </span>
                  {answers[currentQ.id] === oIdx && (
                    <div className="absolute right-4">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="rounded-xl h-12 px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentIdx === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="rounded-xl h-12 px-8 font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Finish Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              className="rounded-xl h-12 px-6"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default QuizAttemptPage;