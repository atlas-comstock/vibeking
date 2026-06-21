export type TrendingInput = {
  likeCount: number;
  viewCount: number;
  createdAt: Date;
  now?: Date;
};

export function computeTrendingScore(input: TrendingInput): number {
  const now = input.now ?? new Date();
  const ageHours = Math.max(
    0,
    (now.getTime() - input.createdAt.getTime()) / (1000 * 60 * 60),
  );
  const likes = Math.log1p(Math.max(0, input.likeCount));
  const views = Math.log1p(Math.max(0, input.viewCount));
  const recency = Math.exp(-ageHours / 48);
  return 0.4 * likes + 0.3 * views + 0.3 * recency;
}