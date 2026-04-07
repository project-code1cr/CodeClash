'use client';
import { motion } from "motion/react";
import {
  Timer,
  Copy,
  Play,
  Trophy,
  Users,
  User,
  Check,
  Code2,
  Moon,
  Sun,
  LayoutGrid,
  BarChart3,
  CreditCard,
  Wallet,
} from "lucide-react";

export default function ProductPreview() {
  return (
    <section className="relative py-8 pb-32 overflow-hidden">
      {/* Spotlight from bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[150%] pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-t from-primary/10 via-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Preview Container */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-premium">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-border/50 via-border/20 to-transparent p-px">
              <div className="w-full h-full rounded-2xl bg-card" />
            </div>

            <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">
                    CodeClash Match Room
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-lg hover:bg-secondary/50 flex items-center justify-center transition-colors">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-secondary/50 flex items-center justify-center transition-colors">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <div className="w-14 border-r border-border/30 py-4 flex flex-col items-center gap-2">
                  {[LayoutGrid, Users, Timer, Code2, Trophy].map(
                    (Icon, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          i === 0
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.button>
                    )
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Room Setup Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="bg-secondary/30 rounded-2xl p-5 border border-border/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                            <Users className="h-3 w-3 text-primary" />
                          </div>
                          Room Ready
                        </div>
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Copy className="h-3 w-3" />
                          Copy Code
                        </div>
                      </div>
                      <div className="text-2xl font-mono font-semibold text-foreground mb-2 tracking-[0.2em]">
                        A7K3P2
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400" />
                          You joined as creator
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accent" />
                          Opponent connected
                        </p>
                      </div>
                    </motion.div>

                    {/* Match Config Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="bg-secondary/30 rounded-2xl p-5 border border-border/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
                            <Play className="h-3 w-3 text-accent" />
                          </div>
                          Match Config
                        </div>
                        <span className="text-xs text-primary font-medium">
                          Private Match
                        </span>
                      </div>
                      <div className="text-2xl font-semibold text-foreground mb-2">
                        3 Questions
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Difficulty: Mixed</p>
                        <p>Timer: 15:00</p>
                        <p>Language: JavaScript</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Active Match Preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 bg-secondary/30 rounded-2xl p-5 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                          <Code2 className="h-3 w-3 text-primary" />
                        </div>
                        Live Duel
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                        </span>
                        Live
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            Y
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            You
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Solved 2 / 3
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-mono font-semibold text-accent">
                          07:41
                        </div>
                        <p className="text-xs text-muted-foreground">
                          remaining
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-foreground text-sm text-right">
                            Opponent
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Check className="h-3 w-3 text-green-400" />{" "}
                            Passed all tests
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-accent">
                            O
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Result</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-400 font-medium">
                        <Trophy className="h-3 w-3" />
                        Winner by fastest submit
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground text-sm mt-8"
          >
            Create room | invite opponent | solve live | submit | instant result.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
