const events = [
  {
    id: "wild-boss",
    title: "野圖 Boss 輪值",
    description: "野圖守衛者進入高掉落時段，副本結算額外給予金幣與體力。",
    reward: { gold: 88, energy: 10 },
    modifier: "Boss 掉落 +18%"
  },
  {
    id: "league-night",
    title: "職業聯賽夜戰",
    description: "競技模式積分池提升，AI 對手會更偏向進攻陣容。",
    reward: { gold: 64, energy: 6 },
    modifier: "競技積分 +12%"
  },
  {
    id: "guild-supply",
    title: "公會補給線",
    description: "AI 隊友完成遠征補給，公會派遣獎勵提高。",
    reward: { gold: 72, energy: 12 },
    modifier: "公會派遣 +20%"
  }
];

const names = ["寒煙", "流木", "晨星", "鐵壁", "藍橋", "微光", "輪轉槍線", "草堂新秀"];

export default async () => {
  const now = new Date();
  const eventIndex = Math.floor(now.getUTCHours() / 8) % events.length;
  const seed = now.getUTCDate() + now.getUTCHours();
  const leaderboard = names
    .map((name, index) => ({
      name,
      rating: 980 + ((seed * 37 + index * 83) % 460)
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return Response.json({
    serverTime: now.toISOString(),
    season: `第 ${Math.max(1, now.getUTCMonth() + 1)} 賽季`,
    event: {
      ...events[eventIndex],
      windowId: `${events[eventIndex].id}-${now.toISOString().slice(0, 10)}-${eventIndex}`
    },
    leaderboard,
    message: "資料由 Netlify Function 即時產生"
  });
};

export const config = {
  path: ["/api/game-state", "/.netlify/functions/game-state"]
};
