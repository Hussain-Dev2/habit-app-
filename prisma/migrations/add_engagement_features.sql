-- Create tables for new engagement features

-- Daily Challenges
CREATE TABLE IF NOT EXISTS "DailyChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "DailyChallenge_date_idx" ON "DailyChallenge"("date");

-- Challenge Completions
CREATE TABLE IF NOT EXISTS "ChallengeCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "reward" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeCompletion_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "DailyChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ChallengeCompletion_userId_challengeId_key" ON "ChallengeCompletion"("userId", "challengeId");
CREATE INDEX IF NOT EXISTS "ChallengeCompletion_userId_idx" ON "ChallengeCompletion"("userId");

-- Community Posts
CREATE TABLE IF NOT EXISTS "CommunityPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'text',
    "metadata" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "CommunityPost_userId_idx" ON "CommunityPost"("userId");
CREATE INDEX IF NOT EXISTS "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- Community Post Likes (One like per user per post)
CREATE TABLE IF NOT EXISTS "CommunityPostLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CommunityPostLike_postId_userId_key" ON "CommunityPostLike"("postId", "userId");
CREATE INDEX IF NOT EXISTS "CommunityPostLike_userId_idx" ON "CommunityPostLike"("userId");
CREATE INDEX IF NOT EXISTS "CommunityPostLike_postId_idx" ON "CommunityPostLike"("postId");

-- Mini Games Scores
CREATE TABLE IF NOT EXISTS "GameScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "pointsEarned" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "GameScore_userId_gameType_idx" ON "GameScore"("userId", "gameType");
CREATE INDEX IF NOT EXISTS "GameScore_gameType_score_idx" ON "GameScore"("gameType", "score");
