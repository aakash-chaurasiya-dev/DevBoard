// User type shared between frontend and backend
// Important: password is intentionally not included here
export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Standup type shared between frontend and backend
// Represents a user's daily work update
export interface Standup {
  id: string;
  userId: string;
  did: string;
  plan: string;
  blockers?: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Goal status values used by the goal board
// These should match the Prisma GoalStatus enum
export type GoalStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

// Goal type shared between frontend and backend
// Represents a user's private coding goal
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  status: GoalStatus;
  progressPercent: number;
  targetDate?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Snippet visibility values
// These should match the Prisma Visibility enum
export type Visibility = 'PUBLIC' | 'PRIVATE';

// Snippet type shared between frontend and backend
// Represents a reusable code snippet
export interface Snippet {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  code: string;
  language: string;
  tags: string[];
  visibility: Visibility;
  starCount: number;
  forkOf?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Notification type values
// These should match the Prisma NotificationType enum
export type NotificationType =
  | 'SNIPPET_STARRED'
  | 'SNIPPET_FORKED'
  | 'STANDUP_COMMENTED';

// Notification type shared between frontend and backend
// Represents an in-app notification received by a user
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  entityId?: string | null;
  entityType?: string | null;
  createdAt: string;
}

// Standard successful API response wrapper
// All successful API responses should follow this structure
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Standard API error response wrapper
// All backend errors should follow this structure
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Standard paginated API response wrapper
// Used for feeds, snippets, notifications, and other list pages
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}