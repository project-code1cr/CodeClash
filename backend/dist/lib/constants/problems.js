"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextPracticeProblem = exports.getRandomPracticeProblem = exports.PRACTICE_PROBLEMS = exports.HARDCODED_PROBLEM = void 0;
exports.HARDCODED_PROBLEM = {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array where prices[i] is the price of a stock on day i. Find the maximum profit with one buy and one sell.",
    inputFormat: "prices = [7,1,5,3,6,4]",
    outputFormat: "5",
    constraints: [
        "1 <= prices.length <= 10^5",
        "0 <= prices[i] <= 10^4",
    ],
    examples: [
        {
            input: "prices = [7,1,5,3,6,4]",
            output: "5",
            explanation: "Buy at 1, sell at 6.",
        },
        {
            input: "prices = [7,6,4,3,1]",
            output: "0",
            explanation: "No profitable transaction exists.",
        },
    ],
};
exports.PRACTICE_PROBLEMS = [
    exports.HARDCODED_PROBLEM,
    {
        title: "Valid Parentheses",
        description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        inputFormat: "s = \"()[]{}\"",
        outputFormat: "true",
        constraints: [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only",
        ],
        examples: [
            {
                input: "s = \"()[]{}\"",
                output: "true",
                explanation: "All open brackets are closed in the correct order.",
            },
            {
                input: "s = \"(]\"",
                output: "false",
                explanation: "Bracket types do not match.",
            },
        ],
    },
    {
        title: "Best Time to Buy and Sell Stock",
        description: "You are given an array where prices[i] is the price of a stock on day i. Find the maximum profit with one buy and one sell.",
        inputFormat: "prices = [7,1,5,3,6,4]",
        outputFormat: "5",
        constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
        examples: [
            {
                input: "prices = [7,1,5,3,6,4]",
                output: "5",
                explanation: "Buy at 1, sell at 6.",
            },
            {
                input: "prices = [7,6,4,3,1]",
                output: "0",
                explanation: "No profitable transaction exists.",
            },
        ],
    },
    {
        title: "Contains Duplicate",
        description: "Given an integer array nums, return true if any value appears at least twice in the array.",
        inputFormat: "nums = [1,2,3,1]",
        outputFormat: "true",
        constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        examples: [
            {
                input: "nums = [1,2,3,1]",
                output: "true",
                explanation: "The element 1 appears twice.",
            },
            {
                input: "nums = [1,2,3,4]",
                output: "false",
                explanation: "All elements are distinct.",
            },
        ],
    },
    {
        title: "Palindrome Number",
        description: "Given an integer x, return true if x is a palindrome integer.",
        inputFormat: "x = 121",
        outputFormat: "true",
        constraints: ["-2^31 <= x <= 2^31 - 1"],
        examples: [
            {
                input: "x = 121",
                output: "true",
                explanation: "121 reads the same backward.",
            },
            {
                input: "x = -121",
                output: "false",
                explanation: "Negative sign makes it non-palindromic.",
            },
        ],
    },
];
const getRandomPracticeProblem = () => {
    const idx = Math.floor(Math.random() * exports.PRACTICE_PROBLEMS.length);
    return exports.PRACTICE_PROBLEMS[idx];
};
exports.getRandomPracticeProblem = getRandomPracticeProblem;
const getNextPracticeProblem = (usedTitles = []) => {
    const unseenProblems = exports.PRACTICE_PROBLEMS.filter((problem) => !usedTitles.includes(problem.title));
    const pool = unseenProblems.length > 0 ? unseenProblems : exports.PRACTICE_PROBLEMS;
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
};
exports.getNextPracticeProblem = getNextPracticeProblem;
//# sourceMappingURL=problems.js.map