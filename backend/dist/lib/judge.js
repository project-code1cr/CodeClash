"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.judgeSubmission = void 0;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const PISTON_URL = process.env.PISTON_URL?.trim();
const PISTON_COMPILE_TIMEOUT_MS = Number(process.env.PISTON_COMPILE_TIMEOUT_MS || 20000);
const PISTON_RUN_TIMEOUT_MS = Number(process.env.PISTON_RUN_TIMEOUT_MS || 8000);
const LOCAL_CPP_COMPILE_TIMEOUT_MS = Number(process.env.LOCAL_CPP_COMPILE_TIMEOUT_MS || 25000);
const LOCAL_RUN_TIMEOUT_MS = Number(process.env.LOCAL_RUN_TIMEOUT_MS || 8000);
const LANGUAGE_RUNTIME = {
    javascript: {
        language: "javascript",
        version: process.env.PISTON_JS_VERSION || "18.15.0",
    },
    cpp: {
        language: "cpp",
        version: process.env.PISTON_CPP_VERSION || "10.2.0",
    },
    java: {
        language: "java",
        version: process.env.PISTON_JAVA_VERSION || "15.0.2",
    },
};
const PROBLEM_SPECS = {
    "Two Sum": {
        methodName: "twoSum",
        returnType: "intArray",
        tests: [
            { args: [[2, 7, 11, 15], 9], expected: [0, 1], ignoreOrder: true },
            { args: [[3, 2, 4], 6], expected: [1, 2], ignoreOrder: true },
            { args: [[3, 3], 6], expected: [0, 1], ignoreOrder: true },
        ],
    },
    "Valid Parentheses": {
        methodName: "isValid",
        returnType: "bool",
        tests: [
            { args: ["()[]{}"], expected: true },
            { args: ["(]"], expected: false },
            { args: ["([{}])"], expected: true },
        ],
    },
    "Best Time to Buy and Sell Stock": {
        methodName: "maxProfit",
        returnType: "int",
        tests: [
            { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
            { args: [[7, 6, 4, 3, 1]], expected: 0 },
            { args: [[2, 4, 1]], expected: 2 },
        ],
    },
    "Contains Duplicate": {
        methodName: "containsDuplicate",
        returnType: "bool",
        tests: [
            { args: [[1, 2, 3, 1]], expected: true },
            { args: [[1, 2, 3, 4]], expected: false },
            { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
        ],
    },
    "Palindrome Number": {
        methodName: "isPalindrome",
        returnType: "bool",
        tests: [
            { args: [121], expected: true },
            { args: [-121], expected: false },
            { args: [10], expected: false },
        ],
    },
};
const normalizeValue = (value, ignoreOrder = false) => {
    if (Array.isArray(value)) {
        const normalized = ignoreOrder
            ? [...value].sort((a, b) => Number(a) - Number(b))
            : value;
        return JSON.stringify(normalized);
    }
    if (typeof value === "string") {
        return value.trim();
    }
    return JSON.stringify(value);
};
const mapExecutionFailure = (text) => {
    if (/time limit|timed out|timeout/i.test(text))
        return "TLE";
    if (/memory limit|out of memory|bad_alloc|cannot allocate/i.test(text))
        return "MLE";
    return "RUNTIME_ERROR";
};
const mapCommandErrorToVerdict = (text) => {
    if (/syntaxerror|compile|error:/i.test(text))
        return "COMPILATION_ERROR";
    return mapExecutionFailure(text);
};
const runCommand = (command, args, options) => {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(command, args, {
            cwd: options?.cwd,
            stdio: ["ignore", "pipe", "pipe"],
            shell: false,
        });
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        const timer = options?.timeoutMs
            ? setTimeout(() => {
                timedOut = true;
                child.kill("SIGKILL");
            }, options.timeoutMs)
            : null;
        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        child.on("error", (error) => {
            if (timer)
                clearTimeout(timer);
            reject(error);
        });
        child.on("close", (code) => {
            if (timer)
                clearTimeout(timer);
            if (timedOut) {
                resolve({
                    stdout,
                    stderr: `${stderr}\nExecution timed out`,
                    code: 124,
                });
                return;
            }
            resolve({ stdout, stderr, code: code ?? 1 });
        });
    });
};
const serializeArg = (arg, lang) => {
    if (typeof arg === "string") {
        return JSON.stringify(arg);
    }
    if (typeof arg === "number" || typeof arg === "boolean") {
        return String(arg);
    }
    if (Array.isArray(arg)) {
        if (lang === "javascript")
            return JSON.stringify(arg);
        if (lang === "java")
            return `new int[]{${arg.join(",")}}`;
        return `vector<int>{${arg.join(",")}}`;
    }
    return "null";
};
const buildJavascriptProgram = (code, methodName, args) => {
    const argsText = args.map((arg) => serializeArg(arg, "javascript")).join(", ");
    return `${code}
const __solution = typeof Solution !== "undefined" ? new Solution() : null;
const __fn = __solution && typeof __solution.${methodName} === "function"
  ? __solution.${methodName}.bind(__solution)
  : (typeof ${methodName} === "function" ? ${methodName} : null);
if (!__fn) {
  throw new Error("Method ${methodName} not found");
}
const __result = __fn(${argsText});
console.log(JSON.stringify(__result));`;
};
const buildCppProgram = (code, methodName, args, returnType) => {
    const cppArgDeclarations = [];
    const cppCallArgs = [];
    args.forEach((arg, index) => {
        if (Array.isArray(arg)) {
            const varName = `arg${index}`;
            cppArgDeclarations.push(`  vector<int> ${varName}{${arg.join(",")}};`);
            cppCallArgs.push(varName);
            return;
        }
        cppCallArgs.push(serializeArg(arg, "cpp"));
    });
    const argsText = cppCallArgs.join(", ");
    const printResult = returnType === "intArray"
        ? `for (size_t i = 0; i < result.size(); ++i) {
    cout << result[i];
    if (i + 1 < result.size()) cout << ",";
  }`
        : returnType === "bool"
            ? `cout << (result ? "true" : "false");`
            : `cout << result;`;
    return `#include <bits/stdc++.h>
using namespace std;
${code}
int main() {
  Solution sol;
${cppArgDeclarations.join("\n")}
  auto result = sol.${methodName}(${argsText});
  ${printResult}
  return 0;
}`;
};
const buildJavaProgram = (code, methodName, args, returnType) => {
    const argsText = args.map((arg) => serializeArg(arg, "java")).join(", ");
    const printResult = returnType === "intArray"
        ? "System.out.println(Arrays.toString(result));"
        : returnType === "bool"
            ? "System.out.println(result ? \"true\" : \"false\");"
            : "System.out.println(result);";
    return `import java.util.*;
${code}
class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    var result = sol.${methodName}(${argsText});
    ${printResult}
  }
}`;
};
const parseProgramOutput = (raw, returnType) => {
    const trimmed = raw.trim();
    if (returnType === "int") {
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? trimmed : parsed;
    }
    if (returnType === "bool") {
        return trimmed.toLowerCase() === "true";
    }
    if (returnType === "intArray") {
        const clean = trimmed.replace(/[\[\]\s]/g, "");
        if (!clean)
            return [];
        return clean.split(",").map((token) => Number(token));
    }
    return trimmed;
};
const executeOnPiston = async (lang, sourceCode) => {
    if (!PISTON_URL) {
        throw new Error("Judge provider is not configured (PISTON_URL missing)");
    }
    const runtime = LANGUAGE_RUNTIME[lang];
    const response = await fetch(PISTON_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: sourceCode }],
            compile_timeout: PISTON_COMPILE_TIMEOUT_MS,
            run_timeout: PISTON_RUN_TIMEOUT_MS,
        }),
    });
    if (!response.ok) {
        throw new Error(`Judge API request failed (${response.status})`);
    }
    const data = (await response.json());
    if (data.message || data.error) {
        throw new Error(data.message || data.error || "Judge provider rejected request");
    }
    if (!data.run && !data.compile) {
        throw new Error("Judge provider returned an invalid response payload");
    }
    return {
        stdout: data.run?.stdout || "",
        stderr: data.run?.stderr || data.run?.output || "",
        compileOutput: data.compile?.stderr || data.compile?.output || data.compile?.stdout || "",
        code: typeof data.run?.code === "number" ? data.run.code : 0,
    };
};
const executeLocally = async (lang, sourceCode) => {
    const tempDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), "codeclash-judge-"));
    try {
        if (lang === "javascript") {
            const filePath = path_1.default.join(tempDir, "Main.js");
            fs_1.default.writeFileSync(filePath, sourceCode, "utf8");
            const run = await runCommand("node", [filePath], {
                timeoutMs: LOCAL_RUN_TIMEOUT_MS,
            });
            return {
                stdout: run.stdout,
                stderr: run.stderr,
                compileOutput: "",
                code: run.code,
            };
        }
        if (lang === "cpp") {
            const srcPath = path_1.default.join(tempDir, "main.cpp");
            const binPath = process.platform === "win32"
                ? path_1.default.join(tempDir, "main.exe")
                : path_1.default.join(tempDir, "main");
            fs_1.default.writeFileSync(srcPath, sourceCode, "utf8");
            const compile = await runCommand("g++", [srcPath, "-std=c++17", "-O2", "-o", binPath], { timeoutMs: LOCAL_CPP_COMPILE_TIMEOUT_MS });
            if (compile.code !== 0) {
                return {
                    stdout: "",
                    stderr: "",
                    compileOutput: compile.stderr || compile.stdout,
                    code: compile.code,
                };
            }
            const run = await runCommand(binPath, [], { timeoutMs: LOCAL_RUN_TIMEOUT_MS });
            return {
                stdout: run.stdout,
                stderr: run.stderr,
                compileOutput: "",
                code: run.code,
            };
        }
        throw new Error("Java judge unavailable locally. Configure PISTON_URL to run Java submissions.");
    }
    finally {
        fs_1.default.rmSync(tempDir, { recursive: true, force: true });
    }
};
const executeProgram = async (lang, sourceCode) => {
    if (lang === "java") {
        return executeOnPiston(lang, sourceCode);
    }
    if (!PISTON_URL) {
        return executeLocally(lang, sourceCode);
    }
    try {
        return await executeOnPiston(lang, sourceCode);
    }
    catch {
        // Local fallback is useful for development when remote judge is down/blocked.
        return executeLocally(lang, sourceCode);
    }
};
const judgeSubmission = async (problem, code, language) => {
    if (!problem?.title) {
        return {
            verdict: "INTERNAL_ERROR",
            details: "Problem metadata unavailable.",
        };
    }
    const spec = PROBLEM_SPECS[problem.title];
    if (!spec) {
        return {
            verdict: "INTERNAL_ERROR",
            details: `No judge specification found for problem: ${problem.title}`,
        };
    }
    for (let idx = 0; idx < spec.tests.length; idx += 1) {
        const test = spec.tests[idx];
        let sourceCode = "";
        if (language === "javascript") {
            sourceCode = buildJavascriptProgram(code, spec.methodName, test.args);
        }
        else if (language === "cpp") {
            sourceCode = buildCppProgram(code, spec.methodName, test.args, spec.returnType);
        }
        else {
            sourceCode = buildJavaProgram(code, spec.methodName, test.args, spec.returnType);
        }
        try {
            const result = await executeProgram(language, sourceCode);
            if (result.compileOutput.trim()) {
                const compileText = result.compileOutput.trim();
                const compileVerdict = /time limit|timed out|timeout/i.test(compileText)
                    ? "TLE"
                    : "COMPILATION_ERROR";
                return {
                    verdict: compileVerdict,
                    details: compileText,
                    failedCase: idx + 1,
                };
            }
            if (result.code !== 0) {
                const failureText = (result.stderr || result.stdout || "Execution failed").trim();
                return {
                    verdict: mapCommandErrorToVerdict(failureText),
                    details: failureText,
                    failedCase: idx + 1,
                };
            }
            const actual = parseProgramOutput(result.stdout, spec.returnType);
            const expected = test.expected;
            const normalizedActual = normalizeValue(actual, Boolean(test.ignoreOrder));
            const normalizedExpected = normalizeValue(expected, Boolean(test.ignoreOrder));
            if (normalizedActual !== normalizedExpected) {
                return {
                    verdict: "WRONG_ANSWER",
                    details: `Test ${idx + 1} failed. Expected ${normalizedExpected}, got ${normalizedActual}.`,
                    failedCase: idx + 1,
                };
            }
        }
        catch (error) {
            return {
                verdict: "INTERNAL_ERROR",
                details: error instanceof Error
                    ? error.message
                    : "Failed to evaluate submission.",
                failedCase: idx + 1,
            };
        }
    }
    return {
        verdict: "ACCEPTED",
        details: `All ${spec.tests.length} test cases passed.`,
    };
};
exports.judgeSubmission = judgeSubmission;
//# sourceMappingURL=judge.js.map