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
  private getEventTimeoutMs = (event: string): number => {
    switch (event) {
      case "run_code":
      case "submit_code":
        // Judge/provider cold starts can exceed 10s.
        return 45000;
      default:
        return 15000;
    }
  };

  private buildSocketError = (event: string, err: Error | null): Error => {
    const base = err?.message || "Socket request failed";
    if (/timeout/i.test(base)) {
      return new Error(
        `Request timed out for ${event}. Backend or judge may be waking up. Please retry in a few seconds.`
      );
    }

    return new Error(`${base} (event: ${event})`);
  };

  private emitWithAck = <TResponse>(
    event: string,
    payload?: unknown
  ): Promise<TResponse> => {
    const socket = getSocket();
    const timeoutMs = this.getEventTimeoutMs(event);

    return new Promise((resolve, reject) => {
      socket
        .timeout(timeoutMs)
        .emit(event, payload ?? {}, (err: Error | null, response: TResponse) => {
        if (err) {
          reject(this.buildSocketError(event, err));
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
