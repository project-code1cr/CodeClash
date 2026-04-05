import { ROOM_STATUS } from "../constants";

export interface CreateRoomRes {
  roomId?: string;
  creatorId?: string;
  roomCode?: string;
  isPrivate?: boolean;
  error?: string;
}

export interface CreateRoomPayload {
  isPrivate?: boolean;
}

export interface GetRoomInfoRes {
  roomId?: string;
  users?: string[];
  roomCode?: string;
  isPrivate?: boolean;
  privateQuestionCount?: number;
  privateCurrentQuestion?: number;
  privateSolvedCount?: number;
  status?: ROOM_STATUS;
  creatorId?: string;
  problem?: any;
  startTime?: number;
  duration?: number;
  timeRemaining?: number;
  hasSubmitted?: boolean;
  winner?: string;
  submissions?: any;
  endTime?: number;
  error: string;
}

export interface JoinRoomRes {
  roomId: string;
  users: string[];
  isPrivate?: boolean;
  status: ROOM_STATUS;
  creatorId: string;
  problem: any;
  startTime: number;
  duration: number;
  timeRemaining: number;
  hasSubmitted: boolean;
  winner: string;
  submissions: any;
  endTime: number;
  error: string;
}

export interface StartMatchRes {
  error?: string;
  success?: boolean;
}

export interface NextPrivateQuestionRes {
  success?: boolean;
  done?: boolean;
  roomId?: string;
  problem?: any;
  privateQuestionCount?: number;
  privateCurrentQuestion?: number;
  privateSolvedCount?: number;
  error?: string;
}

export interface EndPrivateMatchRes {
  success?: boolean;
  solvedCount?: number;
  totalQuestions?: number;
  error?: string;
}

export interface ForfeitMatchRes {
  success?: boolean;
  winner?: string;
  error?: string;
}

export interface MatchEndedRes {
  winner?: string;
  endedBy?: string;
  reason?: string;
  endTime?: number;
}

export interface MatchStartedRes {
  problem: any;
  isPrivate?: boolean;
  privateQuestionCount?: number;
  privateCurrentQuestion?: number;
  privateSolvedCount?: number;
  startTime: number;
  duration: number;
  endTime: number;
}
