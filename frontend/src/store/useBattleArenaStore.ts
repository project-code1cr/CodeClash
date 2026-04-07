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

const genericTemplateByLanguage: Record<ProgrammingLanguage, string> = {
  javascript: `function solve(input) {
  // Write your solution here
  
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
  // Write your solution here
};`,
  java: `import java.util.*;

class Solution {
  // Write your solution here
}`,
};

const problemTemplates: Record<
  string,
  Record<ProgrammingLanguage, string>
> = {
  "Two Sum": {
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
  },
  "Best Time to Buy and Sell Stock": {
    javascript: `function maxProfit(prices) {
  // Write your solution here
  
}`,
    cpp: `#include <vector>
using namespace std;

class Solution {
public:
  int maxProfit(vector<int>& prices) {
    // Write your solution here
    return 0;
  }
};`,
    java: `import java.util.*;

class Solution {
  public int maxProfit(int[] prices) {
    // Write your solution here
    return 0;
  }
}`,
  },
  "Valid Parentheses": {
    javascript: `function isValid(s) {
  // Write your solution here
  
}`,
    cpp: `#include <string>
using namespace std;

class Solution {
public:
  bool isValid(string s) {
    // Write your solution here
    return false;
  }
};`,
    java: `import java.util.*;

class Solution {
  public boolean isValid(String s) {
    // Write your solution here
    return false;
  }
}`,
  },
  "Contains Duplicate": {
    javascript: `function containsDuplicate(nums) {
  // Write your solution here
  
}`,
    cpp: `#include <vector>
using namespace std;

class Solution {
public:
  bool containsDuplicate(vector<int>& nums) {
    // Write your solution here
    return false;
  }
};`,
    java: `import java.util.*;

class Solution {
  public boolean containsDuplicate(int[] nums) {
    // Write your solution here
    return false;
  }
}`,
  },
  "Palindrome Number": {
    javascript: `function isPalindrome(x) {
  // Write your solution here
  
}`,
    cpp: `class Solution {
public:
  bool isPalindrome(int x) {
    // Write your solution here
    return false;
  }
};`,
    java: `class Solution {
  public boolean isPalindrome(int x) {
    // Write your solution here
    return false;
  }
}`,
  },
};

const getTemplateByProblem = (
  title?: string
): Record<ProgrammingLanguage, string> => {
  if (!title) return defaultCodeByLanguage;
  return problemTemplates[title] || genericTemplateByLanguage;
};

interface BattleArenaState {
  // Room data
  roomInfo: GetRoomInfoRes | null;
  setRoomInfo: (info: GetRoomInfoRes | null) => void;
  updateRoomInfo: (
    updater: (prev: GetRoomInfoRes | null) => GetRoomInfoRes | null
  ) => void;
  applyProblemTemplate: (title?: string) => void;

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

  applyProblemTemplate: (title) =>
    set((state) => {
      const nextTemplates = getTemplateByProblem(title);
      return {
        codeByLanguage: nextTemplates,
        code: nextTemplates[state.language],
      };
    }),

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
