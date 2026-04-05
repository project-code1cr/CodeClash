"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBattleArenaStore } from "@/store/useBattleArenaStore";
import { RoomAccessor } from "@/utils/accessors";
import { CheckCircle2, Clock, User } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RoomHeader() {
  const { timeRemaining, roomInfo, opponentStatus } = useBattleArenaStore();
  const roomAccessor = new RoomAccessor();
  const { getTimerColor, formatTime, forfeitMatch } = roomAccessor;
  const router = useRouter();
  const [ending, setEnding] = useState(false);

  const onEndMatch = async () => {
    if (!roomInfo?.roomId || ending) return;

    const shouldEnd = window.confirm(
      "End this match now? This will forfeit your current match."
    );
    if (!shouldEnd) return;

    try {
      setEnding(true);
      const response = await forfeitMatch(roomInfo.roomId);
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Match ended.");
      router.push("/");
    } finally {
      setEnding(false);
    }
  };

  return (
    <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <Image
          src="/images/icon-2.png"
          height={50}
          width={50}
          alt="logo-image"
        />
        <div className="h-6 w-px bg-border/50" />
        <span className="text-sm text-muted-foreground font-mono">
          Room: {roomInfo?.roomCode}
        </span>
      </div>

      {/* Timer */}
      <motion.div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 ${getTimerColor(timeRemaining!)}`}
        animate={timeRemaining! <= 60 ? { scale: [1, 1.02, 1] } : {}}
        transition={{
          duration: 0.5,
          repeat: timeRemaining! <= 60 ? Infinity : 0,
        }}
      >
        <Clock className="w-4 h-4" />
        <span className="font-mono font-semibold text-lg">
          {timeRemaining ? (
            formatTime(timeRemaining)
          ) : (
            <Skeleton className="h-5 w-12 bg-muted-foreground" />
          )}
        </span>
      </motion.div>

      {/* Opponent status */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onEndMatch}
          disabled={ending}
          className="border-red-400/40 text-red-300 hover:bg-red-500/10 hover:text-red-200"
        >
          End Match
        </Button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/30">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Opponent</span>
          <div className="flex items-center gap-1.5">
            {opponentStatus === "typing" && (
              <motion.div
                className="flex gap-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}
            {opponentStatus === "submitted" && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            {opponentStatus === "idle" && (
              <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
