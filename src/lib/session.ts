/**
 * Session management types for AI-REP system
 */

export type InterviewStage =
  | "demographics"
  | "role_nomination"
  | "triad_comparison"
  | "rating"
  | "report";

export interface Demographics {
  age?: number;
  gender?: string;
  occupation?: string;
  city?: string;
  hometown?: string;
  marital_status?: string;
  has_children?: boolean;
  is_student?: boolean;
  education_level?: string;
}

export interface RoleNomination {
  roleId: number | string;
  roleName: string;
  definition: string;
  personName: string; // User-filled actual person name
}

export interface Construct {
  id: string;
  leftPole: string;
  rightPole: string;
  triadIndex: number;
  source: "user";
}

export interface RatingEntry {
  constructId: string;
  roleId: number | string;
  score: number; // 1-7
}

export interface SessionData {
  id: string;
  createdAt: string;
  stage: InterviewStage;
  demographics: Demographics;
  roles: RoleNomination[];
  constructs: Construct[];
  ratings: RatingEntry[];
  messages: ChatMessage[];
  triadIndex: number;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export function createSession(): SessionData {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    stage: "demographics",
    demographics: {},
    roles: [],
    constructs: [],
    ratings: [],
    messages: [],
    triadIndex: 0,
  };
}
