import { IProblem } from "../types";
export type JudgeLanguage = "javascript" | "cpp" | "java";
export type JudgeVerdict = "ACCEPTED" | "WRONG_ANSWER" | "COMPILATION_ERROR" | "RUNTIME_ERROR" | "TLE" | "MLE" | "INTERNAL_ERROR";
interface JudgeResult {
    verdict: JudgeVerdict;
    details: string;
    failedCase?: number;
}
export declare const judgeSubmission: (problem: IProblem | undefined, code: string, language: JudgeLanguage) => Promise<JudgeResult>;
export {};
//# sourceMappingURL=judge.d.ts.map