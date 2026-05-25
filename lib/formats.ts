export type FormatId =
  | "twitter_thread"
  | "linkedin_post"
  | "instagram_caption"
  | "newsletter"
  | "shorts_scripts"
  | "carousel_slides"
  | "reddit_post";

export interface FormatDef {
  id: FormatId;
  label: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind gradient
}

export const FORMATS: FormatDef[] = [
  {
    id: "twitter_thread",
    label: "X / Twitter thread",
    description: "8–12 punchy tweets with a strong hook",
    icon: "Hash",
    color: "from-sky-400 to-blue-600",
  },
  {
    id: "linkedin_post",
    label: "LinkedIn post",
    description: "Long-form, professional, story-driven",
    icon: "Briefcase",
    color: "from-blue-500 to-indigo-700",
  },
  {
    id: "instagram_caption",
    label: "Instagram caption",
    description: "Engaging caption with hashtags & CTA",
    icon: "Camera",
    color: "from-pink-500 via-fuchsia-500 to-orange-400",
  },
  {
    id: "newsletter",
    label: "Email newsletter",
    description: "Subject line + ready-to-send section",
    icon: "Mail",
    color: "from-emerald-400 to-teal-600",
  },
  {
    id: "shorts_scripts",
    label: "Shorts / Reels scripts",
    description: "3 vertical-video scripts (≤60s each)",
    icon: "Video",
    color: "from-rose-500 to-red-600",
  },
  {
    id: "carousel_slides",
    label: "Carousel slides",
    description: "8 swipeable slides for LinkedIn / IG",
    icon: "Layers",
    color: "from-amber-400 to-orange-600",
  },
  {
    id: "reddit_post",
    label: "Reddit post",
    description: "Title + body that survives Reddit's BS detector",
    icon: "Flame",
    color: "from-orange-500 to-rose-600",
  },
];

export const FORMAT_MAP: Record<FormatId, FormatDef> = FORMATS.reduce(
  (acc, f) => ({ ...acc, [f.id]: f }),
  {} as Record<FormatId, FormatDef>
);
