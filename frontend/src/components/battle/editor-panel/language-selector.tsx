import { Button } from "@/components/ui/button";
import {
  ProgrammingLanguage,
  useBattleArenaStore,
} from "@/store/useBattleArenaStore";
import { RoomAccessor } from "@/utils/accessors";
import { FileCode, Play, Send } from "lucide-react";
import toast from "react-hot-toast";

type LocalVerdict =
  | "ACCEPTED"
  | "COMPILATION_ERROR"
  | "TYPE_ERROR"
  | "RUNTIME_ERROR"
  | "TLE"
  | "MLE";

type JudgeVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "COMPILATION_ERROR"
  | "RUNTIME_ERROR"
  | "TLE"
  | "MLE"
  | "INTERNAL_ERROR";

const formatVerdict = (verdict: LocalVerdict, details: string) => {
  const label: Record<LocalVerdict, string> = {
    ACCEPTED: "Accepted",
    COMPILATION_ERROR: "Compilation Error",
    TYPE_ERROR: "Type Error",
    RUNTIME_ERROR: "Runtime Error",
    TLE: "Time Limit Exceeded (TLE)",
    MLE: "Memory Limit Exceeded (MLE)",
  };

  return `Verdict: ${label[verdict]}\n\n${details}`;
};

const formatJudgeVerdict = (verdict: JudgeVerdict, details?: string, failedCase?: number) => {
  const label: Record<JudgeVerdict, string> = {
    ACCEPTED: "Accepted",
    WRONG_ANSWER: "Wrong Answer",
    COMPILATION_ERROR: "Compilation Error",
    RUNTIME_ERROR: "Runtime Error",
    TLE: "Time Limit Exceeded (TLE)",
    MLE: "Memory Limit Exceeded (MLE)",
    INTERNAL_ERROR: "Internal Error",
  };

  const caseText = typeof failedCase === "number" ? `Failed Case: ${failedCase}\n\n` : "";
  return `Verdict: ${label[verdict]}\n\n${caseText}${details || "No additional details."}`;
};

const detectCommonErrors = (
  sourceCode: string,
  lang: ProgrammingLanguage
): { verdict: LocalVerdict; details: string } | null => {
  const code = sourceCode.trim();

  if (!code) {
    return {
      verdict: "COMPILATION_ERROR",
      details: "Empty submission. Please write code before running/submitting.",
    };
  }

  const tlePattern = /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/i;
  if (tlePattern.test(code)) {
    return {
      verdict: "TLE",
      details:
        "Potential infinite loop detected (`while(true)` or `for(;;)`). Ensure your loop has a valid exit condition.",
    };
  }

  const mlePattern =
    /new\s+Array\s*\(\s*(?:\d{8,}|1e8|1e9)\s*\)|vector<[^>]+>\s+\w+\s*\(\s*(?:\d{8,}|1e8|1e9)\s*\)|malloc\s*\(\s*(?:\d{8,}|1e8|1e9)\s*\)/i;
  if (mlePattern.test(code)) {
    return {
      verdict: "MLE",
      details:
        "Very large memory allocation pattern detected. Consider optimizing space usage.",
    };
  }

  const obviousTypePattern =
    /int\s+\w+\s*\([^)]*\)\s*\{[\s\S]*return\s+false\s*;|boolean\s+\w+\s*\([^)]*\)\s*\{[\s\S]*return\s+0\s*;/i;
  if ((lang === "cpp" || lang === "java") && obviousTypePattern.test(code)) {
    return {
      verdict: "TYPE_ERROR",
      details:
        "Possible return-type mismatch detected (e.g., returning `false` from `int` function).",
    };
  }

  if (lang === "javascript") {
    try {
      // Syntax-level validation only (no execution).
      // eslint-disable-next-line no-new-func
      new Function(code);
    } catch (error: unknown) {
      return {
        verdict: "COMPILATION_ERROR",
        details:
          error instanceof Error
            ? error.message
            : "JavaScript syntax error detected.",
      };
    }
  }

  return null;
};

export default function LanguageSelector() {
  const {
    language,
    setLanguage,
    roomInfo,
    code,
    isRunning,
    setIsRunning,
    setOutput,
    setActiveTab,
    setShowPrivateActions,
  } = useBattleArenaStore();
  const roomAccessor = new RoomAccessor();

  const languageOptions: Array<{ label: string; value: ProgrammingLanguage }> =
    [
      { label: "JavaScript", value: "javascript" },
      { label: "C++", value: "cpp" },
      { label: "Java", value: "java" },
    ];

  const runCode = async () => {
    if (!roomInfo?.roomId) {
      toast.error("Room not found");
      return;
    }

    setIsRunning(true);
    setActiveTab("output");

    const localIssue = detectCommonErrors(code, language);
    if (localIssue) {
      setOutput(formatVerdict(localIssue.verdict, localIssue.details));
      setIsRunning(false);
      return;
    }

    try {
      const response = await roomAccessor.runCode(roomInfo.roomId, code, language);

      if (!response.verdict) {
        setOutput("Verdict unavailable.");
        return;
      }

      setOutput(
        formatJudgeVerdict(response.verdict, response.details, response.failedCase)
      );

      if (response.verdict === "ACCEPTED") {
        toast.success("Run: Accepted");
      }
    } catch (error: unknown) {
      setOutput(
        formatJudgeVerdict(
          "INTERNAL_ERROR",
          error instanceof Error ? error.message : "Failed to run code."
        )
      );
      toast.error(error instanceof Error ? error.message : "Failed to run code");
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!roomInfo?.roomId) {
      toast.error("Room not found");
      return;
    }

    setIsRunning(true);
    setActiveTab("output");
    setShowPrivateActions(false);

    const localIssue = detectCommonErrors(code, language);
    if (localIssue) {
      setOutput(formatVerdict(localIssue.verdict, localIssue.details));
      toast.error(localIssue.verdict.replace("_", " "));
      setIsRunning(false);
      return;
    }

    try {
      const response = await roomAccessor.submitCode(roomInfo.roomId, code, language);

      if (!response.verdict) {
        setOutput("Verdict unavailable.");
        return;
      }

      setOutput(
        formatJudgeVerdict(response.verdict, response.details, response.failedCase)
      );

      if (response.verdict === "ACCEPTED" && roomInfo.isPrivate) {
        setShowPrivateActions(true);
      }

      if (response.verdict === "ACCEPTED") {
        toast.success("Submission accepted");
      } else {
        toast.error(response.verdict.replaceAll("_", " "));
      }
    } catch (error: unknown) {
      const errText = error instanceof Error ? error.message : "Submission failed.";

      if (/time limit|timeout/i.test(errText)) {
        setOutput(formatVerdict("TLE", errText));
      } else if (/memory limit|out of memory|heap/i.test(errText)) {
        setOutput(formatVerdict("MLE", errText));
      } else if (/type error/i.test(errText)) {
        setOutput(formatVerdict("TYPE_ERROR", errText));
      } else {
        setOutput(formatVerdict("RUNTIME_ERROR", errText));
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to submit code"
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-12 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <FileCode className="w-4 h-4 text-yellow-500" />
        {languageOptions.map((option) => (
          <Button
            key={option.value}
            variant={language === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage(option.value)}
            className="h-8"
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={runCode}
          disabled={isRunning}
          className="border-border/50"
        >
          <Play className="w-4 h-4 mr-1" />
          Run
        </Button>
        <Button
          size="sm"
          onClick={submitCode}
          disabled={isRunning}
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="w-4 h-4 mr-1" />
          Submit
        </Button>
      </div>
    </div>
  );
}
