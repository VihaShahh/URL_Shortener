import { TagIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

const tones = [
  "border-[#decff3] bg-[#f2ebfb] text-[#69439b]",
  "border-[#efcfb4] bg-[#fff0e3] text-[#9b5227]",
  "border-[#bdded1] bg-[#e7f4ee] text-[#286d53]",
  "border-[#c6d5f1] bg-[#eaf0fc] text-[#385ca2]",
  "border-[#edc9d6] bg-[#fbeaf0] text-[#9d3e61]",
  "border-[#ded9ac] bg-[#f6f2da] text-[#75661e]"
];

export function Tag({ label }: { label: string }) {
  let hash = 2166136261;
  for (const character of label.trim().toLowerCase()) {
    hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619) >>> 0;
  }
  hash = (hash ^ (hash >>> 16)) >>> 0;

  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium leading-5", tones[hash % tones.length])}>
      <TagIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="break-all">{label}</span>
    </span>
  );
}

export function TagList({ tags, className }: { tags: string[]; className?: string }) {
  const labels = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  if (!labels.length) return null;

  return (
    <ul aria-label="Tags" className={cn("flex flex-wrap gap-1.5", className)}>
      {labels.map((label) => <li key={label} className="max-w-full"><Tag label={label} /></li>)}
    </ul>
  );
}
