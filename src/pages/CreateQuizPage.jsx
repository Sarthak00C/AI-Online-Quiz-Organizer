import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";

// FIXED: removed @ alias
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../integrations/api/client";
import { AppLayout } from "../components/AppLayout";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { useToast } from "../hooks/use-toast";

import { 
  Plus, 
  Trash2, 
  Edit,  
  Sparkles, 
  Loader2 
} from "lucide-react";

function CreateQuizPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchParams] = useSearchParams();
  const isAI = searchParams.get("ai") === "true";

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [timeLimit, setTimeLimit] = useState(30);

  const [questions, setQuestions] = useState([
    { question_text: "", options: ["", "", "", ""], correct_answer: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question_text: "", options: ["", "", "", ""], correct_answer: 0 },
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);

    try {
      const data = await apiClient.generateQuiz(
        aiPrompt,
        "",        // don't send topic separately, let the prompt drive it
        difficulty,
        5
      );

      if (data?.questions) {
        const mapped = data.questions.map((q) => ({
          question_text: q.question,
          options: q.options,
          correct_answer: q.correctAnswer ?? 0,
        }));

        setQuestions(mapped);

        if (data.title) setTitle(data.title);
        if (data.topic) setTopic(data.topic);

        toast({
          title: "AI generated questions!",
          description: `${mapped.length} questions created.`,
        });
      }
    } catch (err) {
      toast({
        title: "AI generation failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const quizResponse = await apiClient.createQuiz(
        title,
        topic,
        difficulty,
        timeLimit
      );

      const quizId = quizResponse.quiz.id;

      const questionsToInsert = questions.map((q) => ({
        questionText: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
      }));

      await apiClient.addQuestions(quizId, questionsToInsert);

      toast({
        title: "Quiz created!",
        description: `Quiz code: ${quizResponse.quiz.quizCode}. Share it with your students!`,
      });

      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Error creating quiz",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Create Quiz
          </h2>
          <p className="text-muted-foreground mt-1">
            Build a quiz manually or generate with AI
          </p>
        </div>

        {/* AI Section */}
        <Card className="border-primary/20 bg-primary/5 rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Quiz Generator
            </CardTitle>
            <CardDescription>
              Describe a topic and let AI create questions for you
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Textarea
              placeholder="e.g. Generate 5 multiple choice questions about World War II..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
            />

            <Button
              onClick={generateWithAI}
              disabled={aiLoading || !aiPrompt.trim()}
            >
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quiz Details */}
        <Card className="rounded-2xl shadow-card overflow-hidden">
          <CardHeader>
            <CardTitle className="font-heading">Quiz Settings</CardTitle>
            <CardDescription>Basic information about your quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. World History Midterm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border-primary/10 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g. History"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="rounded-xl border-primary/10 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="rounded-xl border-primary/10">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (mins)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                  className="rounded-xl border-primary/10 focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Slabs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">Questions</h3>
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {questions.length} Question{questions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {questions.map((q, qIdx) => (
            <Card key={qIdx} className="group transition-all hover:shadow-md border-primary/5 rounded-2xl relative">
              <CardHeader className="pb-3 border-b border-muted/30">
                <div className="flex items-center justify-between">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeQuestion(qIdx)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter your question here..."
                    value={q.question_text}
                    onChange={(e) => updateQuestion(qIdx, "question_text", e.target.value)}
                    className="min-h-[80px] rounded-xl border-primary/10 focus:border-primary text-lg font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Option {oIdx + 1}</Label>
                        <button
                          type="button"
                          onClick={() => updateQuestion(qIdx, "correct_answer", oIdx)}
                          className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                            q.correct_answer === oIdx 
                            ? "bg-green-100 text-green-700 font-bold border border-green-200" 
                            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent"
                          }`}
                        >
                          {q.correct_answer === oIdx ? "Correct Answer" : "Mark Correct"}
                        </button>
                      </div>
                      <Input
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        className={`rounded-xl transition-all ${
                          q.correct_answer === oIdx 
                          ? "border-green-500/50 bg-green-50/10 focus-visible:ring-green-500" 
                          : "border-primary/10 focus:border-primary"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addQuestion}
            className="w-full h-16 border-dashed rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all border-2 group"
          >
            <Plus className="mr-2 h-5 w-5 text-primary group-hover:scale-125 transition-transform" />
            <span className="font-bold">Add Question</span>
          </Button>

          <div className="pt-6 border-t border-muted/30">
            <Button
              onClick={handleSubmit}
              disabled={loading || !title || !topic || questions.some(q => !q.question_text)}
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Quiz...
                </>
              ) : (
                "Create Quiz"
              )}
            </Button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

export default CreateQuizPage;