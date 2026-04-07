import { getSocket } from "@/lib/socket";
import {
  CreateRoomPayload,
  CreateRoomRes,
  EndPrivateMatchRes,
  ForfeitMatchRes,
  GetRoomInfoRes,
  JoinRoomRes,
  NextPrivateQuestionRes,
  RunCodeRes,
  SubmitCodeRes,
  StartMatchRes,
} from "../types/room";
import type { ProgrammingLanguage } from "@/store/useBattleArenaStore";

export class RoomAccessor {
  private emitWithAck = <TResponse>(
    event: string,
    payload?: unknown
  ): Promise<TResponse> => {
    const socket = getSocket();

    return new Promise((resolve, reject) => {
      socket.timeout(10000).emit(event, payload ?? {}, (err: Error | null, response: TResponse) => {
        if (err) {
          reject(
            new Error(
              "Could not connect to the server. Please check backend URL and CORS settings."
            )
          );
          return;
        }

        const responseError = (response as { error?: string } | undefined)?.error;
        if (responseError) {
          reject(new Error(responseError));
          return;
        }

        resolve(response);
      });
    });
  };

  public createRoom = (payload: CreateRoomPayload = {}): Promise<CreateRoomRes> => {
    return this.emitWithAck<CreateRoomRes>("create_room", payload).then(
      (response) => {
        if (response.creatorId) {
          localStorage.setItem("room_creator", response.creatorId);
        }

        return response;
      }
    );
  };

  public getRoomInfo = (roomId: string): Promise<GetRoomInfoRes> => {
    return this.emitWithAck<GetRoomInfoRes>("get_room_info", { roomId });
  };

  public joinRoom = async (roomCode: string): Promise<JoinRoomRes> => {
    return this.emitWithAck<JoinRoomRes>("join_room", { roomCode });
  };

  public startMatch = async (
    roomId: string,
    options?: { questionCount?: number; durationMinutes?: number }
  ): Promise<StartMatchRes> => {
    return this.emitWithAck<StartMatchRes>("start_match", {
      roomId,
      questionCount: options?.questionCount,
      durationMinutes: options?.durationMinutes,
    });
  };

  public nextPrivateQuestion = async (
    roomId: string
  ): Promise<NextPrivateQuestionRes> => {
    return this.emitWithAck<NextPrivateQuestionRes>("next_private_question", {
      roomId,
    });
  };

  public endPrivateMatch = async (roomId: string): Promise<EndPrivateMatchRes> => {
    return this.emitWithAck<EndPrivateMatchRes>("end_private_match", {
      roomId,
    });
  };

  public forfeitMatch = async (roomId: string): Promise<ForfeitMatchRes> => {
    return this.emitWithAck<ForfeitMatchRes>("forfeit_match", { roomId });
  };

  public submitCode = async (
    roomId: string,
    code: string,
    language: ProgrammingLanguage
  ): Promise<SubmitCodeRes> => {
    return this.emitWithAck<SubmitCodeRes>("submit_code", {
      roomId,
      code,
      language,
    });
  };

  public runCode = async (
    roomId: string,
    code: string,
    language: ProgrammingLanguage
  ): Promise<RunCodeRes> => {
    return this.emitWithAck<RunCodeRes>("run_code", {
      roomId,
      code,
      language,
    });
  };

  public getTimerColor = (timeRemaining: number) => {
    if (timeRemaining && timeRemaining <= 60) return "text-red-500";
    if (timeRemaining && timeRemaining <= 180) return "text-yellow-500";
    return "text-foreground";
  };

  public formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
}
