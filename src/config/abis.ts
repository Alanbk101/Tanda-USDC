export const TANDA_ABI = [
  {
    type: "function",
    name: "depositCurrentWeek",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "depositForWeek",
    inputs: [{ name: "weekIndex", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getCurrentWeekIndex",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCurrentMonthIndex",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getParticipantPaymentStatus",
    inputs: [{ name: "participant", type: "address" }],
    outputs: [
      { name: "isActive", type: "bool" },
      { name: "turn", type: "uint256" },
      { name: "weeksPaid", type: "uint256" },
      { name: "currentWeek", type: "uint256" },
      { name: "banned", type: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "hasPaidWeek",
    inputs: [
      { name: "participant", type: "address" },
      { name: "weekIndex", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "WeeklyDeposit",
    inputs: [
      { name: "groupId", type: "uint256", indexed: true },
      { name: "participant", type: "address", indexed: true },
      { name: "weekIndex", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  }
] as const;

export const USDC_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  }
] as const;
