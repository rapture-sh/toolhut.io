import { Badge } from "~/components/ui/badge";
import { TAG_STYLES } from "~/lib/tools/tag-styles";
import type { ToolTag } from "~/lib/tools/types";
import { cn } from "~/lib/utils";

interface TagChipProps {
  tag: ToolTag;
  className?: string;
}

/** A tag, written the way the mark is drawn: #dev. */
export function TagChip({ tag, className }: TagChipProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-0.5 border-transparent font-normal",
        TAG_STYLES[tag],
        className,
      )}
    >
      <span className="font-mono" aria-hidden="true">
        #
      </span>
      {tag}
    </Badge>
  );
}
