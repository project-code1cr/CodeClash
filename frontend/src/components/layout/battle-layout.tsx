"use client";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { useBattleArenaStore } from "@/store/useBattleArenaStore";
import { RoomAccessor } from "@/utils/accessors";
import { ROOM_STATUS } from "@/utils/constants";
import { MatchEndedRes } from "@/utils/types/room";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function BattleLayout({
  children,
  roomId,
}: Readonly<{
  children: ReactNode;
  roomId: string;
}>) {
  const {
    roomInfo,
    timeRemaining,
    setRoomInfo,
    updateRoomInfo,
    setOpponentStatus,
    setTimeRemaining,
    setShowPrivateActions,
    setOutput,
  } = useBattleArenaStore();
  const router = useRouter();
  const roomAccessor = new RoomAccessor();
  const { getRoomInfo } = roomAccessor;
  const [soloSummary, setSoloSummary] = useState<{
    solvedCount: number;
    totalQuestions: number;
  } | null>(null);
  const [exitCountdown, setExitCountdown] = useState(10);

  const socketId = useMemo(() => getSocket().id, []);

  useEffect(() => {
    if (!soloSummary) return;

    setExitCountdown(10);
    const interval = setInterval(() => {
      setExitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [soloSummary, router]);

  useEffect(() => {
    async function getRoomData() {
      const response = await getRoomInfo(roomId);

      if (response.error) {
        toast.error(response.error);
        router.push("/join");
        return;
      }

      setRoomInfo(response);

      if (
        response.status === ROOM_STATUS.FINISHED &&
        response.isPrivate
      ) {
        setSoloSummary({
          solvedCount: response.privateSolvedCount || 0,
          totalQuestions: response.privateQuestionCount || 1,
        });
        return;
      }

      if (response.status === ROOM_STATUS.FINISHED) {
        toast("Match already ended.");
        router.push("/");
      }
    }

    getRoomData();
  }, [roomId]);

  useEffect(() => {
    if (!roomInfo?.startTime || !roomInfo?.duration) return;

    const interval = setInterval(() => {
      const time = Math.floor((Date.now() - roomInfo.startTime!) / 1000);
      const remaining = Math.max(0, roomInfo.duration! - time);
      setTimeRemaining(remaining);

      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [roomInfo]);

  useEffect(() => {
    if (timeRemaining !== 0 || soloSummary) return;

    let cancelled = false;
    let attempts = 0;

    async function syncTimeoutState() {
      if (cancelled) return;
      attempts += 1;

      const response = await roomAccessor.getRoomInfo(roomId);
      if (cancelled || response.error) return;

      if (response.status !== ROOM_STATUS.FINISHED) {
        if (attempts < 8) {
          setTimeout(syncTimeoutState, 1200);
          return;
        }

        toast("Time up. Ending match...");
        router.push("/");
        return;
      }

      if (response.isPrivate) {
        setSoloSummary({
          solvedCount: response.privateSolvedCount || 0,
          totalQuestions: response.privateQuestionCount || 1,
        });
      } else {
        toast("Time up. Match ended.");
        router.push("/");
      }
    }

    syncTimeoutState();

    return () => {
      cancelled = true;
    };
  }, [roomId, router, soloSummary, timeRemaining]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("opponent_submitted", () => {
      setOpponentStatus("submitted");
    });

    socket.on("private_question_updated", (data) => {
      updateRoomInfo((prev) =>
        prev
          ? {
              ...prev,
              problem: data.problem,
              privateQuestionCount: data.privateQuestionCount,
              privateCurrentQuestion: data.privateCurrentQuestion,
              privateSolvedCount: data.privateSolvedCount,
            }
          : prev
      );
      setShowPrivateActions(false);
      setOutput("");
    });

    socket.on("private_match_ended", (data) => {
      toast.success(
        `Private match ended. Solved ${data.solvedCount}/${data.totalQuestions}`
      );
      router.push("/");
    });

    socket.on("match_ended", (data: MatchEndedRes) => {
      if (data.isPrivate) {
        setSoloSummary({
          solvedCount: data.solvedCount || 0,
          totalQuestions: data.totalQuestions || 1,
        });
        return;
      }

      if (data.reason === "forfeit") {
        toast("Match ended by player.");
      } else if (data.reason === "timeout") {
        const didWin = socketId && data.winner === socketId;
        if (data.winner === "draw") {
          toast("Time up. Match ended in a draw.");
        } else {
          toast.success(didWin ? "Time up. You won." : "Time up. Opponent won.");
        }
      } else {
        toast.success("Match ended.");
      }
      router.push("/");
    });

    return () => {
      socket.off("opponent_submitted");
      socket.off("private_question_updated");
      socket.off("private_match_ended");
      socket.off("match_ended");
    };
  }, []);

  return (
    <>
      {children}
      {soloSummary && (
        <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-xl border border-border/60 bg-card/80 p-6 text-center space-y-4">
            <h2 className="text-2xl font-semibold">Session Complete</h2>
            <p className="text-muted-foreground">
              You solved <span className="font-semibold text-foreground">{soloSummary.solvedCount}</span> out of <span className="font-semibold text-foreground">{soloSummary.totalQuestions}</span> questions.
            </p>
            <p className="text-sm text-muted-foreground">
              Exiting in {exitCountdown}s
            </p>
            <Button onClick={() => router.push("/")}>Exit Now</Button>
          </div>
        </div>
      )}
    </>
  );
}
