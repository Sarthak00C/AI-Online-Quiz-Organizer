import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../integrations/api/client";
import { AppLayout } from "../components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { TrendingUp, Target, BookOpen } from "lucide-react";

function AnalyticsPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user) return;
      try {
        const res = await apiClient.getAttempts();
        const data = Array.isArray(res) ? res : (res?.attempts || res?.data || []);
        setAttempts(data);
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [user]);

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + (a.totalQuestions || a.total_questions || 0), 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const scoreHistory = attempts.map((a, i) => {
    const total = a.totalQuestions || a.total_questions || 0;
    return {
      name: `Quiz ${i + 1}`,
      score: total > 0 ? Math.round((a.score / total) * 100) : 0,
    };
  });

  const pieData = [
    { name: "Correct", value: totalCorrect },
    { name: "Wrong", value: totalQuestions - totalCorrect },
  ];

  const COLORS = ["hsl(var(--chart-correct))", "hsl(var(--chart-wrong))"];

  const stats = [
    { label: "Quizzes Taken", value: totalAttempts, icon: BookOpen, bg: "bg-primary/10 text-primary" },
    { label: "Accuracy", value: `${accuracy}%`, icon: Target, bg: "bg-accent/10 text-accent" },
    { label: "Total Score", value: `${totalCorrect}/${totalQuestions}`, icon: TrendingUp, bg: "bg-secondary/10 text-secondary" },
  ];

  return (
  <AppLayout>
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold tracking-tight">
          Performance Analytics
        </h2>
        <p className="text-muted-foreground mt-1">
          Track your quiz performance over time
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.bg}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Trend Card */}
        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scoreHistory.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                      contentStyle={{ 
                        borderRadius: "12px", 
                        border: "none", 
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" 
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]} 
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground italic text-sm">
                No history available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accuracy Distribution Card */}
        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Overall Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalQuestions > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: "12px", 
                        border: "none", 
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs font-medium text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground italic text-sm">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  </AppLayout>
);
}

export default AnalyticsPage;