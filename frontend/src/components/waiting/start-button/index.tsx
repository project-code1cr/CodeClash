"use client";
import { AnimatePresence, motion } from "motion/react";
import { useWaitingRoomStore } from "@/store/useWaitingRoomStore";
import { RoomAccessor } from "@/utils/accessors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function StartButton({ roomId }: { roomId: string }) {
  const { canStart, isCreator, activeUsers, roomInfo } = useWaitingRoomStore();
  const roomAccessor = new RoomAccessor();
  const { startMatch } = roomAccessor;
  const [questionCount, setQuestionCount] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [starting, setStarting] = useState(false);

  const handleStartMatch = async () => {
    if (starting || !isCreator || !status) return;

    try {
      setStarting(true);
      const safeDurationMinutes = Number.isFinite(durationMinutes)
        ? Math.min(120, Math.max(1, Math.floor(durationMinutes)))
        : 15;

      const response = await startMatch(roomId, {
        questionCount: isPrivate ? questionCount : undefined,
        durationMinutes: isPrivate ? safeDurationMinutes : undefined,
      });

      if (response.error) {
        toast.error(response.error);
      }
    } finally {
      setStarting(false);
    }
  };

  const status = canStart();
  const active = activeUsers();
  const isPrivate = Boolean(roomInfo?.isPrivate);

  return (
    <AnimatePresence mode="wait">
      {status && isCreator ? (
        <motion.div
          key="start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {isPrivate && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                {[1, 3, 5].map((count) => (
                  <Button
                    key={count}
                    variant={questionCount === count ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuestionCount(count)}
                    className="rounded-full"
                  >
                    {count} Question{count > 1 ? "s" : ""}
                  </Button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2">
                {[5, 10, 15, 20].map((minutes) => (
                  <Button
                    key={minutes}
                    variant={durationMinutes === minutes ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDurationMinutes(minutes)}
                    className="rounded-full"
                  >
                    {minutes} min
                  </Button>
                ))}
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value || 1))}
                  className="w-22 h-9 text-center"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleStartMatch}
            disabled={starting}
            className="h-14 px-12 bg-linear-to-r from-primary to-accent hover:opacity-90 text-primary-foreground rounded-xl font-medium text-lg shadow-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            {isPrivate ? "Start Solo Match" : "Start Match"}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="waiting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Zap className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-muted-foreground">
            {isPrivate
              ? "Ready when you are. Start your private timer anytime."
              : active.length < 2
              ? "Waiting for opponent to join..."
              : "Waiting for creator to start..."}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
