export type PlayerProgress = {
  points: number;
  completedQuizIds: string[];
  unlockedHeritageIds: string[];
  unlockedBadgeIds: string[];
  awardedQuestionIds: string[];
};

export const PROGRESS_KEY = "jeux-gagnants:progress:v1";

export const EMPTY_PROGRESS: PlayerProgress = {
  points: 0,
  completedQuizIds: [],
  unlockedHeritageIds: [],
  unlockedBadgeIds: [],
  awardedQuestionIds: [],
};

export function getProgress(): PlayerProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;

  try {
    const saved = window.localStorage.getItem(PROGRESS_KEY);
    if (!saved) return EMPTY_PROGRESS;

    const parsed = JSON.parse(saved) as Partial<PlayerProgress>;
    return {
      points: typeof parsed.points === "number" ? parsed.points : 0,
      completedQuizIds: Array.isArray(parsed.completedQuizIds) ? parsed.completedQuizIds : [],
      unlockedHeritageIds: Array.isArray(parsed.unlockedHeritageIds) ? parsed.unlockedHeritageIds : [],
      unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds) ? parsed.unlockedBadgeIds : [],
      awardedQuestionIds: Array.isArray(parsed.awardedQuestionIds) ? parsed.awardedQuestionIds : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function awardQuestion(current: PlayerProgress, questionId: string, points: number): PlayerProgress {
  if (current.awardedQuestionIds.includes(questionId)) return current;

  return {
    ...current,
    points: current.points + points,
    awardedQuestionIds: [...current.awardedQuestionIds, questionId],
  };
}

export function completeQuiz(current: PlayerProgress, id: string, points: number): PlayerProgress {
  if (current.completedQuizIds.includes(id)) return current;

  return {
    ...current,
    points: current.points + points,
    completedQuizIds: [...current.completedQuizIds, id],
    unlockedHeritageIds: [...new Set([...current.unlockedHeritageIds, id])],
    unlockedBadgeIds: [...new Set([...current.unlockedBadgeIds, `gardien-${id}`])],
  };
}

export function saveProgress(progress: PlayerProgress) {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event("jeux-gagnants:progress-updated"));
}
