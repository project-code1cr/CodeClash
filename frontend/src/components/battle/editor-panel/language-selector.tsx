import { Button } from "@/components/ui/button";
import {
  ProgrammingLanguage,
  useBattleArenaStore,
} from "@/store/useBattleArenaStore";
import { FileCode, Play, Send } from "lucide-react";

export default function LanguageSelector() {
  const {
    language,
    setLanguage,
    roomInfo,
    isRunning,
    setIsRunning,
    setOutput,
    setActiveTab,
    setShowPrivateActions,
  } = useBattleArenaStore();

  const languageOptions: Array<{ label: string; value: ProgrammingLanguage }> =
    [
      { label: "JavaScript", value: "javascript" },
      { label: "C++", value: "cpp" },
      { label: "Java", value: "java" },
    ];

  const runCode = () => {
    setIsRunning(true);
    setActiveTab("output");

    // Simulate running code
    setTimeout(() => {
      setOutput(`Running test cases...

Test 1: nums = [2,7,11,15], target = 9
Expected: [0,1]
Output: [0,1]
✓ Passed

Test 2: nums = [3,2,4], target = 6
Expected: [1,2]
Output: [1,2]
✓ Passed

All test cases passed!`);
      setIsRunning(false);
    }, 1500);
  };

  const submitCode = () => {
    setIsRunning(true);
    setShowPrivateActions(false);
    setTimeout(() => {
      setOutput(`Submitting solution...

Running all test cases...

Test 1: ✓ Passed (2ms)
Test 2: ✓ Passed (1ms)
Test 3: ✓ Passed (3ms)
Test 4: ✓ Passed (2ms)
Test 5: ✓ Passed (1ms)
...
Test 50: ✓ Passed (2ms)

🎉 All 50 test cases passed!
Runtime: 52ms (faster than 89%)
Memory: 42.1 MB (less than 67%)`);
      setIsRunning(false);
      setActiveTab("output");

      if (roomInfo?.isPrivate) {
        setShowPrivateActions(true);
      }
    }, 2000);
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
