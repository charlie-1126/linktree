import { Music2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SekaiData {
  playerRating: number;
  bestTier: string;
  bestSeason: string;
  best39: Array<{
    song: string;
    difficulty: string;
    level: string;
    constant: number;
    rating: number;
    albumUrl: string;
    rank: string;
  }>;
}

const defaultBest39Songs: Array<{
  song: string;
  difficulty: string;
  level: number;
  score: number;
  rank: string;
  albumUrl: string;
}> = [];

function getRankColor(rank: string) {
  switch (rank) {
    case "AP":
      return "bg-gradient-to-r from-purple-300 to-sky-300";
    case "FC":
      return "bg-gradient-to-r from-pink-300 to-pink-400";
    case "C":
      return "bg-gradient-to-r from-yellow-300 to-yellow-400";
    case "UL":
      return "bg-white";
    default:
      return "bg-gradient-to-r from-gray-400 to-gray-500";
  }
}

const SEKAI_CACHE_KEY = "sekai_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export function ProjectSekai() {
  const [sekaiData, setSekaiData] = useState<SekaiData | null>(null);

  useEffect(() => {
    // 캐시 확인
    const cachedData = localStorage.getItem(SEKAI_CACHE_KEY);
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();

        // 캐시가 5분 이내라면 캐시 사용
        if (now - timestamp < CACHE_DURATION) {
          setSekaiData(data);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cache:", e);
      }
    }

    // 캐시가 없거나 만료되었으면 API 요청
    fetch("/api/sekai")
      .then((res) => res.json())
      .then((data) => {
        setSekaiData(data);

        // 캐시에 저장
        localStorage.setItem(
          SEKAI_CACHE_KEY,
          JSON.stringify({
            data: data,
            timestamp: Date.now(),
          })
        );
      })
      .catch((err) => {
        console.error("Failed to fetch Sekai data:", err);
        // Use default data on error
        setSekaiData({
          playerRating: 16.82,
          bestTier: "Master 1",
          bestSeason: "2024 Nov",
          best39: defaultBest39Songs.map((song, index) => ({
            song: song.song,
            difficulty: song.difficulty,
            level: song.level.toString(),
            constant: 0,
            rating: 0,
            albumUrl: song.albumUrl,
            rank: song.rank,
          })),
        });
      });
  }, []);

  if (!sekaiData) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500"></div>
          <div className="h-5 sm:h-6 w-32 bg-[#2a2a2a] rounded"></div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-4 h-20"></div>
          <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-4 h-20"></div>
          <div className="bg-[#0f0f0f] rounded-xl p-2 sm:p-4 h-20"></div>
        </div>

        <div className="mb-3">
          <div className="h-4 w-20 bg-[#2a2a2a] rounded mb-2"></div>
        </div>

        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0f0f0f] rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3"
            >
              <div className="w-6 sm:w-8 h-3 bg-[#2a2a2a] rounded"></div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#2a2a2a]"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#2a2a2a] rounded w-3/4"></div>
                <div className="h-3 bg-[#2a2a2a] rounded w-1/2"></div>
              </div>
              <div className="w-12 h-6 bg-[#2a2a2a] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Format season for mobile display
  const formatSeason = (season: string) => {
    return season
      .replace("SUMMER", "SUM")
      .replace("WINTER", "WIN")
      .replace("SPRING", "SPR")
      .replace("AUTUMN", "AUT")
      .replace("FALL", "FAL");
  };

  const sekaiStats = [
    {
      label: "Player Rating",
      value: Math.round(sekaiData.playerRating).toString(),
    },
    { label: "Best Tier", value: sekaiData.bestTier },
    {
      label: "Season",
      value: sekaiData.bestSeason,
      mobileValue: formatSeason(sekaiData.bestSeason),
    },
  ];

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Music2 size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
        </div>
        <h2 className="text-white text-lg sm:text-xl font-semibold">
          Project Sekai
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {sekaiStats.map((stat) => (
          <div key={stat.label} className="bg-[#0f0f0f] rounded-xl p-2 sm:p-4">
            <div className="text-gray-400 text-xs font-medium mb-1 sm:mb-2">
              {stat.label}
            </div>
            <div className="text-white text-sm sm:text-lg font-bold">
              <span className="sm:hidden">
                {stat.mobileValue || stat.value}
              </span>
              <span className="hidden sm:inline">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Best 39 */}
      <div>
        <h3 className="text-white text-sm font-semibold mb-2 sm:mb-3">
          Best 39
        </h3>

        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 sm:pr-2">
          {sekaiData.best39.map((song, index) => (
            <div
              key={index}
              className="bg-[#0f0f0f] rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 hover:bg-[#252525] transition-colors"
            >
              <div className="text-gray-500 text-xs font-medium w-6 sm:w-8 flex-shrink-0">
                #{index + 1}
              </div>

              {song.albumUrl && (
                <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#2a2a2a] overflow-hidden flex items-center justify-center">
                  <img
                    src={song.albumUrl}
                    alt={song.song}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs pointer-events-none">
                    🎵
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="text-white text-xs sm:text-sm font-medium truncate">
                  {song.song}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {song.difficulty} LV.{song.level} ({song.constant.toFixed(1)})
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                <div
                  className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-md ${getRankColor(
                    song.rank
                  )} font-bold text-center min-w-[28px] sm:min-w-[32px]`}
                >
                  {song.rank}
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round(song.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
