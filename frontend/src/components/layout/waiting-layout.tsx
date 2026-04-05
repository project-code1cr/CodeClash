"use client";
import { getSocket } from "@/lib/socket";
import { useWaitingRoomStore } from "@/store/useWaitingRoomStore";
import { RoomAccessor } from "@/utils/accessors";
import { MatchStartedRes } from "@/utils/types/room";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import toast from "react-hot-toast";

export default function WaitingLayout({
  roomId,
  children,
}: Readonly<{
  children: ReactNode;
  roomId: string;
}>) {
  const { setRoomInfo, updateRoomInfo, addUser, setIsCreator, setCountdown } =
    useWaitingRoomStore();
  const roomAccessor = new RoomAccessor();
  const { getRoomInfo } = roomAccessor;
  const router = useRouter();

  useEffect(() => {
    // Clear any stale overlay value from a previous waiting-room session.
    setCountdown(null);
  }, [setCountdown]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const startCountdownToBattle = (startTime: number) => {
      const updateCountdown = () => {
        const remaining = Math.ceil((startTime - Date.now()) / 1000);
        setCountdown(Math.max(0, remaining));
      };

      updateCountdown();
      interval = setInterval(updateCountdown, 200);

      const delay = Math.max(0, startTime - Date.now());
      timeout = setTimeout(() => {
        if (interval) clearInterval(interval);
        setCountdown(null);
        router.push("/battle/" + roomId);
      }, delay);
    };

    async function getRoomData() {
      const response = await getRoomInfo(roomId);

      if (response.error) {
        toast.error(response.error);
        return;
      }
      setRoomInfo(response);

      if (response.status === "active" && response.startTime) {
        startCountdownToBattle(response.startTime);
      }

      const creatorId = localStorage.getItem("room_creator");
      if (creatorId === response.creatorId) setIsCreator(true);
    }

    getRoomData();

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [roomId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const socket = getSocket();

    const startCountdownToBattle = (startTime: number) => {
      const updateCountdown = () => {
        const remaining = Math.ceil((startTime - Date.now()) / 1000);
        setCountdown(Math.max(0, remaining));
      };

      updateCountdown();
      interval = setInterval(updateCountdown, 200);

      const delay = Math.max(0, startTime - Date.now());
      timeout = setTimeout(() => {
        if (interval) clearInterval(interval);
        setCountdown(null);
        router.push("/battle/" + roomId);
      }, delay);
    };

    socket.on("user_joined", (userId: string) => {
      addUser(userId);
    });

    socket.on("match_started", (data: MatchStartedRes) => {
      const { startTime } = data;
      updateRoomInfo((prev) =>
        prev
          ? {
              ...prev,
              problem: data.problem,
              isPrivate: data.isPrivate,
              privateQuestionCount: data.privateQuestionCount,
              privateCurrentQuestion: data.privateCurrentQuestion,
              privateSolvedCount: data.privateSolvedCount,
            }
          : prev
      );

      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      startCountdownToBattle(startTime);
    });

    return () => {
      socket.off("user_joined");
      socket.off("match_started");
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [addUser, roomId, router, setCountdown, updateRoomInfo]);

  return <>{children}</>;
}
