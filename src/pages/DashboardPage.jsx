import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// FIXED: removed @ alias
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../integrations/api/client";
import { AppLayout } from "../components/AppLayout";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";

import {
  PlusCircle,
  Users,
  Brain,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Clock,
  Medal,
  AlertTriangle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function DashboardPage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [attemptsRes, quizzesRes] = await Promise.all([
          apiClient.getAttempts(),
          apiClient.getMyQuizzes(),
        ]);

        const allAttempts = Array.isArray(attemptsRes) ? attemptsRes : (attemptsRes?.attempts || attemptsRes?.data || []);
        setAttempts(allAttempts);
        setMyQuizzes(quizzesRes?.quizzes || []);

        // ✅ Use backend leaderboard instead of local calculation
      // ✅ ALWAYS use attempts (works for ALL users)
      const firstAttemptQuiz = allAttempts[0]?.quiz?.quizCode;

      if (firstAttemptQuiz) {
        const leaderboardRes = await apiClient.getLeaderboard(firstAttemptQuiz);
        const leaderboardData = leaderboardRes?.leaderboard || [];

        setLeaderboard(
          leaderboardData.slice(0, 5).map((entry, index) => ({
            rank: index + 1,
            name: entry.name || "Anonymous",
            score: entry.percentage,
          }))
        );

        const myEntry = leaderboardData.find(
          (entry) => entry.userId === user.id
        );

        setUserRank(
          myEntry ? leaderboardData.indexOf(myEntry) + 1 : null
        );
      }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, profile?.name]);

  const totalQuizzes = attempts.length;
  const totalCorrect = attempts.reduce(
    (sum, a) => sum + a.score,
    0
  );

  const totalQuestions = attempts.reduce(
    (sum, a) => sum + a.totalQuestions,
    0
  );

  const avgScore =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;

  const bestScore =
    attempts.length > 0
      ? Math.max(
          ...attempts.map((a) =>
            a.totalQuestions > 0
              ? Math.round((a.score / a.totalQuestions) * 100)
              : 0
          )
        )
      : 0;

  const chartData = attempts.map((a, i) => ({
    name: `Quiz ${i + 1}`,
    score:
      a.totalQuestions > 0
        ? Math.round((a.score / a.totalQuestions) * 100)
        : 0,
  }));

  const feedItems = [
    ...attempts.map(a => ({ 
      type: 'attempt', 
      date: new Date(a.completedAt), 
      data: a 
    })),
    ...myQuizzes.map(q => ({ 
      type: 'creation', 
      date: new Date(q.createdAt), 
      data: q 
    }))
  ].sort((a, b) => b.date - a.date).slice(0, 5);

  const stats = [
    {
      label: "Quizzes Attempted",
      value: attempts.length,
      icon: BookOpen,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Quizzes Created",
      value: myQuizzes.length,
      icon: PlusCircle,
      color: "bg-accent/10 text-accent",
    },
    {
      label: "Average Score",
      value: `${attempts.length > 0 ? Math.round((attempts.reduce((s, a) => s + a.score, 0) / attempts.reduce((s, a) => s + (a.totalQuestions || a.total_questions || 0), 0)) * 100) : 0}%`,
      icon: Target,
      color: "bg-secondary/10 text-secondary",
    },
    {
      label: "Current Rank",
      value: userRank ? `#${userRank}` : "—",
      icon: Trophy,
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Welcome back, {profile?.name || "Student"}!
          </h2>
          <p className="text-muted-foreground mt-1">
             {profile?.role === 'teacher' ? "Manage your classroom and track performance" : "Continue your learning journey today"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-2xl border-primary/5 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Unified Activity Feed */}
          <Card className="rounded-2xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedItems.length > 0 ? (
                  feedItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(item.type === 'creation' ? `/my-quizzes/${item.data.id}/results` : `/analytics`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          item.type === 'creation' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                        }`}>
                          {item.type === 'creation' ? <PlusCircle className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {item.type === 'creation' ? `Created: ${item.data.title}` : `Attempted: ${item.data.quiz?.title || 'Quiz'}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                         {item.type === 'attempt' ? (
                           <Badge variant="secondary" className="rounded-lg">
                             {Math.round((item.data.score / (item.data.totalQuestions || 1)) * 100)}%
                           </Badge>
                         ) : (
                           <span className="text-xs font-heading font-bold tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                             {item.data.quizCode}
                           </span>
                         )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <p className="text-sm">No recent activity</p>
                    <Button variant="link" size="sm" onClick={() => navigate("/create-quiz")}>Start by creating a quiz</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Card */}
          <Card className="rounded-2xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between rounded-xl bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-muted-foreground text-xs">#{entry.rank}</span>
                        <span className="font-medium text-sm">{entry.name}</span>
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary">{entry.score}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground italic text-sm">
                   Join a quiz to see rankings
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;