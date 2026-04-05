"use client";
import { getSocket } from "@/lib/socket";
import { useBattleArenaStore } from "@/store/useBattleArenaStore";
import { RoomAccessor } from "@/utils/accessors";
import { MatchEndedRes } from "@/utils/types/room";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
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

  useEffect(() => {
    async function getRoomData() {
      const response = await getRoomInfo(roomId);

      if (response.error) {
        toast.error(response.error);
        router.push("/join");
        return;
      }

      setRoomInfo(response);
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
      if (data.reason === "forfeit") {
        toast("Match ended by player.");
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

  return <>{children}</>;
}
