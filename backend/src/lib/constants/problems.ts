import { IProblem } from "../../types";

export const HARDCODED_PROBLEM: IProblem = {
  title: "Two Sum",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  inputFormat: "nums = [2,7,11,15], target = 9",
  outputFormat: "[0,1]",
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists"
  ],
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation:"Because nums[1] + nums[2] == 6, we return [1,2]."
    }
  ],
};

export const PRACTICE_PROBLEMS: IProblem[] = [
  HARDCODED_PROBLEM,
  {
    title: "Valid Parentheses",
    description:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
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
    description:
      "You are given an array where prices[i] is the price of a stock on day i. Find the maximum profit with one buy and one sell.",
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
    description:
      "Given an integer array nums, return true if any value appears at least twice in the array.",
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
    description:
      "Given an integer x, return true if x is a palindrome integer.",
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

export const getRandomPracticeProblem = (): IProblem => {
  const idx = Math.floor(Math.random() * PRACTICE_PROBLEMS.length);
  return PRACTICE_PROBLEMS[idx];
};