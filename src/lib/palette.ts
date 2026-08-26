export function hueFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 33 + id.charCodeAt(i)) >>> 0;
  return hash % 360;
}

export function cardTint(id: string) {
  const hue = hueFromId(id);
  return {
    background: `linear-gradient(155deg, oklch(0.38 0.14 ${hue}) 0%, oklch(0.2 0.07 ${(hue + 48) % 360}) 58%, oklch(0.14 0.04 ${(hue + 90) % 360}) 100%)`,
  };
}

export const ROW_ACCENT: Record<string, string> = {
  th: "from-rose-400 to-amber-300",
  news: "from-sky-400 to-cyan-300",
  sports: "from-lime-400 to-emerald-300",
  jp: "from-pink-400 to-violet-300",
  kr: "from-fuchsia-400 to-rose-300",
  entertainment: "from-amber-300 to-orange-400",
  us: "from-blue-400 to-indigo-300",
  music: "from-violet-400 to-fuchsia-300",
  id: "from-red-400 to-rose-300",
  documentary: "from-teal-300 to-sky-400",
  education: "from-yellow-300 to-amber-400",
};
