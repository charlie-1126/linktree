import { MessageCircle, Github, Gamepad2, Code2, Award, Instagram, Youtube, Mail } from 'lucide-react';

const socialLinks = [
  {
    name: 'Discord',
    username: 'gagtwe',
    icon: MessageCircle,
    color: 'from-indigo-500 to-blue-500',
    link: 'https://discord.com/users/719063773389914219'
  },
  {
    name: 'Steam',
    username: 'gagtwe',
    icon: Gamepad2,
    color: 'from-blue-600 to-blue-800',
    link: 'https://steamcommunity.com/id/gagtwe/'
    },
    {
    name: 'GitHub',
    username: '@charlie-1126',
    icon: Github,
    color: 'from-gray-700 to-gray-900',
    link: 'https://github.com/charlie-1126'
  },
  {
    name: 'Email',
    username: 'charlie869599@gmail.com',
    icon: Mail,
    color: 'from-slate-600 to-slate-700',
    link: 'mailto:charlie869599@gmail.com'
  },
  {
    name: 'solved.ac',
    username: 'charlie1126',
    icon: Code2,
    color: 'from-emerald-500 to-green-600',
    link: 'https://solved.ac/profile/charlie1126'
  },
  {
    name: 'AtCoder',
    username: 'charlie1126',
    icon: Award,
    color: 'from-cyan-500 to-blue-600',
    link: 'https://atcoder.jp/users/charlie1126'
    },
  {
    name: 'YouTube',
    username: '@gagtwe',
    icon: Youtube,
    color: 'from-red-600 to-red-700',
    link: 'https://www.youtube.com/@gagtwe'
  },
  {
    name: 'Instagram',
    username: '@gagtwe',
    icon: Instagram,
    color: 'from-pink-500 to-purple-500',
    link: 'https://www.instagram.com/gagtwe/'
  },
];

export function SocialLinks() {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
      <h2 className="text-white text-lg sm:text-xl font-semibold mb-4 sm:mb-5">Links</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#0f0f0f] rounded-xl hover:bg-[#252525] transition-all"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-400 text-xs font-medium">{social.name}</div>
                <div className="text-white text-sm truncate">{social.username}</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
