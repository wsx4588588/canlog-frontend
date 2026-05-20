import { Badge } from "@/components/ui/badge";
import { CatReaction } from "@/lib/types";

const REACTION_CONFIG: Record<
  CatReaction,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }
> = {
  [CatReaction.LOVED]: { label: "超愛吃", variant: "success" },
  [CatReaction.LIKED]: { label: "喜歡", variant: "default" },
  [CatReaction.NEUTRAL]: { label: "普通", variant: "secondary" },
  [CatReaction.DISLIKED]: { label: "不喜歡", variant: "outline" },
  [CatReaction.REFUSED]: { label: "拒吃", variant: "destructive" },
};

export function ReactionBadge({ reaction }: { reaction: CatReaction }) {
  const config = REACTION_CONFIG[reaction];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { REACTION_CONFIG };
