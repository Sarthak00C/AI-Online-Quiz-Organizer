import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Brain,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  Users,
  CheckCircle2,
  Trophy,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [quizCode, setQuizCode] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (quizCode.trim()) {
      navigate(`/join-quiz?code=${quizCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Brain className="h-6 w-6" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">
              Evalve AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hidden font-medium sm:flex"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              className="rounded-xl px-6 font-bold"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 -z-10 h-full w-full opacity-30">
            <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-400 blur-[120px] animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-400 blur-[120px] animate-pulse delay-700"></div>
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Powered by Gemini 1.5 Flash
              </span>
            </div>

            <h1 className="font-heading text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent leading-[1.1]">
              Elevate Your Learning <br />
              <span className="text-primary">with AI Quizzes</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed sm:text-xl">
              The ultimate organizer for students and teachers. Generate complex
              multi-topic quizzes in seconds, compete on global leaderboards,
              and master any subject with real-time AI insights.
            </p>

            <div className="mx-auto max-w-md space-y-4 sm:flex sm:items-center sm:gap-4 sm:space-y-0">
              <form
                onSubmit={handleJoin}
                className="flex flex-1 items-center gap-2 rounded-2xl bg-muted p-1 border shadow-soft"
              >
                <Input
                  placeholder="Enter Quiz Code"
                  className="border-0 bg-transparent h-12 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 font-bold tracking-widest text-lg px-4 uppercase"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                />
                <Button type="submit" className="h-12 rounded-xl px-6 font-bold">
                  Join Quiz
                </Button>
              </form>
            </div>
            
            <p className="mt-4 text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">
              Instant Access • No Credit Card Required
            </p>
          </div>
        </section>

        {/* Features Slab Grid */}
        <section className="py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                Master Any Topic Faster
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Discover a suite of tools designed to transform how you create and participate in educational challenges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group rounded-3xl border bg-background p-8 shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Generation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Leverage Google Gemini 1.5 to create high-quality multiple choice questions based on any prompt or topic in under 10 seconds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-3xl border bg-background p-8 shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                   Beautiful charts powered by Recharts visualize your performance, accuracy trends, and areas for improvement.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-3xl border bg-background p-8 shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Trophy className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Leaderboards</h3>
                <h3 className="text-xl font-bold mb-3">Rankings</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Compete with peers in real-time. Share your quiz codes and watch the leaderboard evolve as students submit their attempts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <h2 className="font-heading text-4xl font-bold leading-tight">
                  Design, Deploy, <br />
                  <span className="text-primary">and Dominate.</span>
                </h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-lg">Create with AI</h4>
                      <p className="text-muted-foreground text-sm">Enter a topic and let our AI engine handle the question drafting, options, and correctness.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-lg">Share Instant Codes</h4>
                      <p className="text-muted-foreground text-sm">Every quiz gets a unique, shareable code. No login required for students to join the fun.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-lg">Analyze Performance</h4>
                      <p className="text-muted-foreground text-sm">Teachers get deep insights into student performance while students track their own growth.</p>
                    </div>
                  </div>
                </div>

                <Button className="rounded-2xl h-14 px-8 font-bold text-lg group shadow-xl shadow-primary/20" onClick={() => navigate("/signup")}>
                  Start Building Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="flex-1 relative">
                <div className="aspect-square w-full rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-dashed border-primary/20 p-8 flex items-center justify-center">
                   <div className="space-y-4 w-full">
                      {[1,2,3].map(i => (
                        <div key={i} className="bg-background rounded-2xl p-4 shadow-soft border flex items-center gap-4 animate-slide-up" style={{animationDelay: `${i*100}ms`}}>
                          <div className={`h-8 w-8 rounded-lg ${i===1 ? 'bg-green-100 text-green-700' : 'bg-muted'} flex items-center justify-center`}>
                            {i===1 ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{width: `${100-i*20}%`}}></div>
                            </div>
                            <div className="h-2 w-2/3 bg-muted rounded-full"></div>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
                {/* Decorative Stats Card */}
                <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-background rounded-2xl p-6 shadow-2xl border flex flex-col items-center animate-bounce-slow">
                   <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
                   <span className="text-2xl font-black">1.2k+</span>
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Students Today</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 bg-primary/5">
           <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
             <h2 className="font-heading text-3xl font-bold mb-16">Built for Everyone</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-soft">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">For Teachers</h3>
                  <p className="text-muted-foreground">Automate evaluation, track classroom progress, and keep students engaged with interactive competitions.</p>
                </div>
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-soft">
                    <Target className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">For Students</h3>
                  <p className="text-muted-foreground">Turn study time into a game. Join any challenge instantly and see where you stand on the global leaderboard.</p>
                </div>
             </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="rounded-[40px] bg-primary px-10 py-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-[80px]"></div>
               
               <h2 className="font-heading text-4xl font-bold mb-4">Ready to Level Up?</h2>
               <p className="mx-auto max-w-xl text-lg text-primary-foreground/80 mb-10">
                 Join thousands of users who are already using Evalve AI to dominate their subjects.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-white text-primary hover:bg-white/90 font-bold text-lg" onClick={() => navigate("/signup")}>
                    Create Free Account
                  </Button>
                  <Button className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-primary-foreground/10 text-white hover:bg-primary-foreground/20 border border-white/20 font-bold text-lg" onClick={() => navigate("/login")}>
                    Existing User? Log In
                  </Button>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold">Evalve AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Evalve-Tech. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
