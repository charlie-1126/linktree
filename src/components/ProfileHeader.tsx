import { useEffect, useState } from "react";

interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    global_name: string;
}

interface Activity {
    name: string;
    details?: string;
    state?: string;
}

interface LanyardResponse {
    success: boolean;
    data: {
        discord_user: DiscordUser;
        discord_status: "online" | "idle" | "dnd" | "offline";
        activities: Activity[];
    };
}

interface ProfileData {
    avatarUrl: string;
    username: string;
    statusColor: string;
    statusText: string;
}

const ATCODER_CACHE_KEY = "atcoder_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export function ProfileHeader() {
    const [data, setData] = useState<ProfileData | null>(null);

    useEffect(() => {
        // Discord 데이터 가져오기
        fetch("/api/discord")
            .then((res) => res.json())
            .then((json: LanyardResponse) => {
                if (json.success) {
                    const { discord_user, discord_status, activities } = json.data;

                    const avatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=128`;
                    const username = discord_user.global_name || discord_user.username;

                    const statusColors = {
                        online: "bg-green-500",
                        idle: "bg-yellow-500",
                        dnd: "bg-red-500",
                        offline: "bg-gray-500",
                    };

                    // Get custom status from activities
                    const customStatus = activities.find((activity) => activity.name === "Custom Status");
                    const statusText = customStatus?.state || "";

                    const profileData = {
                        avatarUrl,
                        username,
                        statusColor: statusColors[discord_status],
                        statusText,
                    };

                    setData(profileData);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch Discord data:", err);
            });

        // AtCoder 데이터 prefetch (백그라운드에서 캐싱)
        const prefetchAtcoder = async () => {
            try {
                const cached = localStorage.getItem(ATCODER_CACHE_KEY);
                if (cached) {
                    const { timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        return; // 캐시가 유효하면 skip
                    }
                }
            } catch (e) {
                // 캐시 체크 실패시 계속 진행
            }

            // AtCoder 데이터 fetch
            try {
                const username = "charlie1126";
                const proxyUrl = "https://api.allorigins.win/raw?url=";
                const historyUrl = encodeURIComponent(`https://atcoder.jp/users/${username}/history/json`);
                const historyRes = await fetch(`${proxyUrl}${historyUrl}`);

                if (!historyRes.ok) return;

                const contestHistory = await historyRes.json();

                let rating = 0;
                let maxRating = 0;
                let lastContestDate = "";

                if (contestHistory && contestHistory.length > 0) {
                    const latestContest = contestHistory[contestHistory.length - 1];
                    rating = latestContest.NewRating || 0;
                    maxRating = Math.max(...contestHistory.map((c: any) => c.NewRating || 0));
                    lastContestDate = new Date(latestContest.EndTime).toLocaleDateString("ko-KR");
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

                let currentRank = 30000;
                try {
                    const pageUrl = encodeURIComponent(`https://atcoder.jp/users/${username}`);
                    const pageRes = await fetch(`${proxyUrl}${pageUrl}`);
                    if (pageRes.ok) {
                        const html = await pageRes.text();
                        const rankMatch = html.match(/Rank\s*<\/th>\s*<td[^>]*>\s*([\d,]+)/i);
                        if (rankMatch && rankMatch[1]) {
                            currentRank = parseInt(rankMatch[1].replace(/,/g, ""));
                        }
                    }
                } catch (e) {
                    // Rank fetch 실패는 무시
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

                localStorage.setItem(
                    ATCODER_CACHE_KEY,
                    JSON.stringify({
                        data: atcoderInfo,
                        timestamp: Date.now(),
                    })
                );
            } catch (err) {
                console.error("Failed to prefetch AtCoder data:", err);
            }
        };

        prefetchAtcoder();
    }, []);

    if (!data) {
        return (
            <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6 animate-pulse">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#2a2a2a] ring-4 ring-[#2a2a2a]"></div>
                        <div className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-5 h-5 sm:w-7 sm:h-7 bg-gray-500 rounded-full border-4 border-[#1a1a1a]"></div>
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left">
                        <div className="h-8 sm:h-10 w-40 sm:w-52 bg-[#2a2a2a] rounded mb-2 sm:mb-3 mx-auto sm:mx-0"></div>
                        <div className="bg-[#0f0f0f] rounded-xl px-4 py-3">
                            <div className="h-4 sm:h-5 w-32 sm:w-48 bg-[#2a2a2a] rounded mx-auto sm:mx-0"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="relative flex-shrink-0">
                    <img
                        src={data.avatarUrl}
                        alt="Profile"
                        className="w-20 h-20 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#2a2a2a]"
                    />
                    <div
                        className={`absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-5 h-5 sm:w-7 sm:h-7 ${data.statusColor} rounded-full border-4 border-[#1a1a1a]`}
                    ></div>
                </div>

                <div className="flex-1 w-full text-center sm:text-left">
                    <h1 className="text-white text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">{data.username}</h1>
                    <div className="bg-[#0f0f0f] rounded-xl px-4 py-3">
                        <p className="text-gray-400 text-sm sm:text-base">{data.statusText}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
