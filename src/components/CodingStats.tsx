import { Code2, Target, Zap, Trophy, Calendar, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface SolvedacData {
  tier: number;
  rating: number;
  solvedCount: number;
  rank: number;
  maxStreak: number;
}

interface AtcoderData {
  rating: number;
  rank: string;
  maxRating: number;
  currentRank: number;
  contests: number;
  lastContestDate: string;
  recentContests: Array<{
    name: string;
    rank: number;
    performance: number;
    userOldRating: number;
    userNewRating: number;
    userRatingChange: number;
    contestEndTime: string;
  }>;
}

const getTierName = (tier: number): string => {
  const tiers = [
    "Unrated",
    "Bronze V",
    "Bronze IV",
    "Bronze III",
    "Bronze II",
    "Bronze I",
    "Silver V",
    "Silver IV",
    "Silver III",
    "Silver II",
    "Silver I",
    "Gold V",
    "Gold IV",
    "Gold III",
    "Gold II",
    "Gold I",
    "Platinum V",
    "Platinum IV",
    "Platinum III",
    "Platinum II",
    "Platinum I",
    "Diamond V",
    "Diamond IV",
    "Diamond III",
    "Diamond II",
    "Diamond I",
    "Ruby V",
    "Ruby IV",
    "Ruby III",
    "Ruby II",
    "Ruby I",
    "Master",
  ];
  return tiers[tier] || "Unrated";
};

const getTierColor = (tier: number): string => {
  if (tier >= 11 && tier <= 15) return "from-yellow-500 to-amber-500"; // Gold
  if (tier >= 16 && tier <= 20) return "from-green-400 to-green-500"; // Platinum
  if (tier >= 21 && tier <= 25) return "from-sky-400 to-sky-600"; // Diamond
  if (tier >= 6 && tier <= 10) return "from-gray-400 to-gray-600"; // Silver
  if (tier >= 1 && tier <= 5) return "from-amber-700 to-orange-800"; // Bronze
  if (tier >= 26 && tier <= 30) return "from-rose-500 to-rose-600"; // Ruby
  if (tier >= 31) return "from-sky-300 to-purple-500"; // Master
  return "from-gray-600 to-gray-700";
};

const getRankColor = (rank: string): string => {
  if (rank === "Red") return "from-red-500 to-red-600";
  if (rank === "Orange") return "from-orange-500 to-orange-600";
  if (rank === "Yellow") return "from-yellow-400 to-yellow-500";
  if (rank === "Blue") return "from-blue-500 to-blue-600";
  if (rank === "Cyan") return "from-cyan-400 to-cyan-500";
  if (rank === "Green") return "from-green-500 to-green-600";
  if (rank === "Brown") return "from-amber-700 to-amber-800";
  return "from-gray-400 to-gray-600";
};

const SOLVEDAC_CACHE_KEY = "solvedac_cache";
const ATCODER_CACHE_KEY = "atcoder_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export function CodingStats() {
  const [solvedacData, setSolvedacData] = useState<SolvedacData | null>(null);
  const [atcoderData, setAtcoderData] = useState<AtcoderData | null>(null);

  useEffect(() => {
    // solved.ac 캐시 확인
    const cachedSolvedac = localStorage.getItem(SOLVEDAC_CACHE_KEY);
    if (cachedSolvedac) {
      try {
        const { data, timestamp } = JSON.parse(cachedSolvedac);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setSolvedacData(data);
        } else {
          fetchSolvedac();
        }
      } catch (e) {
        fetchSolvedac();
      }
    } else {
      fetchSolvedac();
    }

    function fetchSolvedac() {
      fetch("/api/solvedac")
        .then((res) => res.json())
        .then((data) => {
          const solvedacInfo = {
            tier: data.tier,
            rating: data.rating,
            solvedCount: data.solvedCount,
            rank: data.rank,
            maxStreak: data.maxStreak,
          };
          setSolvedacData(solvedacInfo);
          localStorage.setItem(
            SOLVEDAC_CACHE_KEY,
            JSON.stringify({
              data: solvedacInfo,
              timestamp: Date.now(),
            })
          );
        })
        .catch((err) => console.error("Failed to fetch solved.ac:", err));
    }

    // AtCoder 캐시 확인
    const cachedAtcoder = localStorage.getItem(ATCODER_CACHE_KEY);
    if (cachedAtcoder) {
      try {
        const { data, timestamp } = JSON.parse(cachedAtcoder);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setAtcoderData(data);
          return;
        }
      } catch (e) {
        // 캐시 파싱 실패시 API 요청
      }
    }

    // Fetch AtCoder data via CORS proxy
    const fetchAtcoderData = async () => {
      try {
        const username = "charlie1126";
        const proxyUrl = "https://api.allorigins.win/raw?url=";

        // Fetch contest history via proxy
        const historyUrl = encodeURIComponent(
          `https://atcoder.jp/users/${username}/history/json`
        );
        const historyRes = await fetch(`${proxyUrl}${historyUrl}`);

        if (!historyRes.ok) throw new Error("Failed to fetch AtCoder history");

        const contestHistory = await historyRes.json();

        let rating = 0;
        let maxRating = 0;
        let lastContestDate = "";

        if (contestHistory && contestHistory.length > 0) {
          const latestContest = contestHistory[contestHistory.length - 1];
          rating = latestContest.NewRating || 0;
          maxRating = Math.max(
            ...contestHistory.map((c: any) => c.NewRating || 0)
          );
          lastContestDate = new Date(latestContest.EndTime).toLocaleDateString(
            "ko-KR"
          );
        }

        const getRank = (r: number) => {
          if (r >= 2800) return "Red";
          if (r >= 2400) return "Orange";
          if (r >= 2000) return "Yellow";
          if (r >= 1600) return "Blue";
          if (r >= 1200) return "Cyan";
          if (r >= 800) return "Green";
          if (r >= 400) return "Brown";
          return "Gray";
        };

        const recentContests = contestHistory.map((contest: any) => ({
          name: contest.ContestName || "",
          rank: contest.Place || 0,
          userOldRating: contest.OldRating || 0,
          userNewRating: contest.NewRating || 0,
          userRatingChange: (contest.NewRating || 0) - (contest.OldRating || 0),
          performance: contest.Performance || 0,
          contestEndTime: contest.EndTime || "",
        }));

        // Try to get current rank via proxy (optional, may fail)
        let currentRank = 30000;
        try {
          const pageUrl = encodeURIComponent(
            `https://atcoder.jp/users/${username}`
          );
          const pageRes = await fetch(`${proxyUrl}${pageUrl}`);

          if (pageRes.ok) {
            const html = await pageRes.text();
            const rankMatch = html.match(
              /Rank\s*<\/th>\s*<td[^>]*>\s*([\d,]+)/i
            );

            if (rankMatch && rankMatch[1]) {
              currentRank = parseInt(rankMatch[1].replace(/,/g, ""));
            }
          }
        } catch (e) {
          console.warn("Failed to fetch rank:", e);
        }

        const atcoderInfo = {
          rating: rating || 0,
          rank: getRank(rating),
          maxRating: maxRating || 0,
          currentRank: currentRank,
          contests: contestHistory.length || 0,
          lastContestDate: lastContestDate || "",
          recentContests: recentContests || [],
        };

        setAtcoderData(atcoderInfo);

        // 캐시에 저장
        localStorage.setItem(
          ATCODER_CACHE_KEY,
          JSON.stringify({
            data: atcoderInfo,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.error("Failed to fetch AtCoder:", err);
      }
    };

    fetchAtcoderData();
  }, []);
  if (!solvedacData || !atcoderData) {
    return (
      <div className="space-y-4 sm:space-y-5">
        {/* solved.ac Skeleton */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2a2a2a]"></div>
            <div className="h-5 sm:h-6 w-24 bg-[#2a2a2a] rounded"></div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="h-10 w-32 bg-[#2a2a2a] rounded-xl"></div>
            <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-[#0f0f0f] rounded-xl p-3 h-20"></div>
              <div className="bg-[#0f0f0f] rounded-xl p-3 h-20"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-[#0f0f0f] rounded-xl p-3 sm:p-4 h-24"></div>
            <div className="bg-[#0f0f0f] rounded-xl p-3 sm:p-4 h-24"></div>
          </div>
        </div>

        {/* AtCoder Skeleton */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2a2a2a]"></div>
            <div className="h-5 sm:h-6 w-24 bg-[#2a2a2a] rounded"></div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="h-10 w-24 bg-[#2a2a2a] rounded-xl"></div>
            <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-3 h-20"></div>
              <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-3 h-20"></div>
              <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-3 h-20"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="bg-[#0f0f0f] rounded-xl p-3 sm:p-4 h-24"></div>
            <div className="bg-[#0f0f0f] rounded-xl p-3 sm:p-4 h-24"></div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-32 bg-[#2a2a2a] rounded"></div>
            <div className="space-y-2">
              <div className="bg-[#0f0f0f] rounded-xl p-3 h-24"></div>
              <div className="bg-[#0f0f0f] rounded-xl p-3 h-24"></div>
              <div className="bg-[#0f0f0f] rounded-xl p-3 h-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* solved.ac Section */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
            <Code2 size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
          </div>
          <h2 className="text-white text-lg sm:text-xl font-semibold">
            solved.ac
          </h2>
        </div>

        {/* Tier Badge */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div
            className={`px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r ${getTierColor(
              solvedacData.tier
            )} text-center sm:text-left flex-shrink-0`}
          >
            <span className="text-white font-bold text-base sm:text-lg">
              {getTierName(solvedacData.tier)}
            </span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-[#0f0f0f] rounded-xl p-3">
              <div className="text-gray-400 text-xs font-medium mb-1">
                Rating
              </div>
              <div className="text-white text-base sm:text-lg font-semibold">
                {solvedacData.rating}
              </div>
            </div>
            <div className="bg-[#0f0f0f] rounded-xl p-3">
              <div className="text-gray-400 text-xs font-medium mb-1">Rank</div>
              <div className="text-white text-base sm:text-lg font-semibold">
                #{solvedacData.rank.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-[#0f0f0f] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-sky-400 sm:w-4 sm:h-4" />
              <div className="text-gray-400 text-xs font-medium">Solved</div>
            </div>
            <div className="text-white text-xl sm:text-2xl font-bold">
              {solvedacData.solvedCount}
            </div>
          </div>
          <div className="bg-[#0f0f0f] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-orange-400 sm:w-4 sm:h-4" />
              <div className="text-gray-400 text-xs font-medium">
                Max Streak
              </div>
            </div>
            <div className="text-white text-xl sm:text-2xl font-bold">
              {solvedacData.maxStreak}
              <span className="text-sm text-gray-400 ml-1">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* AtCoder Section */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
            <Trophy size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
          </div>
          <h2 className="text-white text-lg sm:text-xl font-semibold">
            AtCoder
          </h2>
        </div>

        {/* Rank Badge */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div
            className={`px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r ${getRankColor(
              atcoderData.rank
            )} text-center sm:text-left flex-shrink-0`}
          >
            <span className="text-white font-bold text-base sm:text-lg">
              {atcoderData.rank}
            </span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-3">
              <div className="text-gray-400 text-xs font-medium mb-1">
                Rating
              </div>
              <div className="text-white text-sm sm:text-lg font-semibold">
                {atcoderData.rating}
              </div>
            </div>
            <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-3">
              <div className="text-gray-400 text-xs font-medium mb-1">
                Highest
              </div>
              <div className="text-white text-sm sm:text-lg font-semibold">
                {atcoderData.maxRating}
              </div>
            </div>
            <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-3">
              <div className="text-gray-400 text-xs font-medium mb-1">Rank</div>
              <div className="text-white text-sm sm:text-lg font-semibold">
                #{atcoderData.currentRank.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="bg-[#0f0f0f] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-green-400 sm:w-4 sm:h-4" />
              <div className="text-gray-400 text-xs font-medium">Contests</div>
            </div>
            <div className="text-white text-xl sm:text-2xl font-bold">
              {atcoderData.contests}
            </div>
          </div>
          <div className="bg-[#0f0f0f] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-blue-400 sm:w-4 sm:h-4" />
              <div className="text-gray-400 text-xs font-medium">
                Last Contest
              </div>
            </div>
            <div className="text-white text-base sm:text-lg font-bold">
              {atcoderData.lastContestDate}
            </div>
          </div>
        </div>

        {/* Recent Contests */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-2 sm:mb-3">
            Recent Contests
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 sm:pr-2">
            {[...atcoderData.recentContests].reverse().map((contest, index) => {
              const timeAgo = getRelativeTime(contest.contestEndTime);
              const ratingChangeColor =
                contest.userRatingChange >= 0
                  ? "text-green-400"
                  : "text-red-400";
              const ratingChangeSign = contest.userRatingChange >= 0 ? "+" : "";

              return (
                <div key={index} className="bg-[#0f0f0f] rounded-xl p-3">
                  <div className="text-white text-xs sm:text-sm font-medium mb-2">
                    {contest.name}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs mb-1">
                    <span className="text-gray-400">
                      Rank:{" "}
                      <span className="text-white font-semibold">
                        {contest.rank}
                      </span>
                    </span>
                    <span className="text-gray-400">
                      Performance:{" "}
                      <span className="text-cyan-400 font-semibold">
                        {contest.performance}
                      </span>
                    </span>
                    <span className="text-gray-400">
                      Rating:{" "}
                      <span className="text-white font-semibold">
                        {contest.userOldRating}
                      </span>{" "}
                      →{" "}
                      <span className="text-white font-semibold">
                        {contest.userNewRating}
                      </span>{" "}
                      <span className={`font-semibold ${ratingChangeColor}`}>
                        ({ratingChangeSign}
                        {contest.userRatingChange})
                      </span>
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs">{timeAgo}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return `${months}개월 전`;
  } else if (diffDays > 0) {
    return `${diffDays}일 전`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}분 전`;
  } else {
    return "방금 전";
  }
}
