import { create } from "zustand";
import { GetRoomInfoRes } from "@/utils/types/room";

type OpponentStatus = "typing" | "idle" | "submitted";
type ActiveTab = "problem" | "output";
export type ProgrammingLanguage = "javascript" | "cpp" | "java";

const defaultCodeByLanguage: Record<ProgrammingLanguage, string> = {
  javascript: `function twoSum(nums, target) {
  // Write your solution here
  
}`,
  cpp: `#include <vector>
using namespace std;

class Solution {
public:
  vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
    return {};
  }
};`,
  java: `import java.util.*;

class Solution {
  public int[] twoSum(int[] nums, int target) {
    // Write your solution here
    return new int[]{};
  }
}`,
};

interface BattleArenaState {
  // Room data
  roomInfo: GetRoomInfoRes | null;
  setRoomInfo: (info: GetRoomInfoRes | null) => void;
  updateRoomInfo: (
    updater: (prev: GetRoomInfoRes | null) => GetRoomInfoRes | null
  ) => void;

  // Code editor
  language: ProgrammingLanguage;
  setLanguage: (language: ProgrammingLanguage) => void;
  code: string;
  setCode: (code: string) => void;
  codeByLanguage: Record<ProgrammingLanguage, string>;

  // Timer
  timeRemaining: number | null;
  setTimeRemaining: (time: number) => void;

  // Opponent
  opponentStatus: OpponentStatus;
  setOpponentStatus: (status: OpponentStatus) => void;

  // Output
  output: string;
  setOutput: (output: string) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  showPrivateActions: boolean;
  setShowPrivateActions: (show: boolean) => void;

  // UI
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Actions
  resetStore: () => void;
}

const initialState = {
  roomInfo: null,
  language: "javascript" as ProgrammingLanguage,
  codeByLanguage: defaultCodeByLanguage,
  code: defaultCodeByLanguage.javascript,
  timeRemaining: null,
  opponentStatus: "typing" as OpponentStatus,
  output: "",
  isRunning: false,
  showPrivateActions: false,
  activeTab: "problem" as ActiveTab,
};

export const useBattleArenaStore = create<BattleArenaState>((set, get) => ({
  ...initialState,

  setRoomInfo: (info) => set({ roomInfo: info }),

  updateRoomInfo: (updater) =>
    set((state) => ({
      roomInfo: updater(state.roomInfo),
    })),

  setLanguage: (language) =>
    set((state) => ({
      language,
      code: state.codeByLanguage[language],
    })),

  setCode: (code) =>
    set((state) => ({
      code,
      codeByLanguage: {
        ...state.codeByLanguage,
        [state.language]: code,
      },
    })),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  setOpponentStatus: (status) => set({ opponentStatus: status }),

  setOutput: (output) => set({ output }),

  setIsRunning: (running) => set({ isRunning: running }),

  setShowPrivateActions: (show) => set({ showPrivateActions: show }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  resetStore: () => {
    const state = get();
    set({
      ...initialState,
      codeByLanguage: {
        ...defaultCodeByLanguage,
        [state.language]: state.codeByLanguage[state.language],
      },
      language: state.language,
      code: state.codeByLanguage[state.language],
    });
  },
}));
