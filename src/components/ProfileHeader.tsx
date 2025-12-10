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

export function ProfileHeader() {
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
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
          const customStatus = activities.find(
            (activity) => activity.name === "Custom Status"
          );
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
          <h1 className="text-white text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
            {data.username}
          </h1>
          <div className="bg-[#0f0f0f] rounded-xl px-4 py-3">
            <p className="text-gray-400 text-sm sm:text-base">
              {data.statusText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
