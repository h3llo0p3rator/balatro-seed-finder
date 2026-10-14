import type { CSSProperties } from "react";
import { CATALOG } from "./engine.ts";
import type { Rarity } from "./engine.ts";
import { JOKER_SPRITES } from "./jokerSprites.ts";

export const RARITY_BY_NAME = new Map(CATALOG.map((joker) => [joker.name, joker.rarity]));

function spriteVars(name: string): { "--col": string; "--row": string } | null {
  const pos = JOKER_SPRITES[name];
  if (!pos) return null;
  return {
    "--col": String(pos[0]),
    "--row": String(pos[1]),
  };
}

export function JokerPick({
  name,
  rarity,
  selected = false,
  removable = false,
  onClick,
}: {
  name: string;
  rarity: Rarity;
  selected?: boolean;
  removable?: boolean;
  onClick: () => void;
}) {
  const vars = spriteVars(name);

  return (
    <button
      type="button"
      className={`joker-pick rarity-${rarity.toLowerCase()}${selected ? " selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="joker-card-wrap">
        {vars ? (
          <span
            className="joker-sprite"
            style={vars as CSSProperties}
            role="img"
            aria-label={name}
          />
        ) : (
          <span className="joker-sprite missing" role="img" aria-label={name} />
        )}
        {removable ? <span className="joker-remove">×</span> : null}
      </span>
      <span className="joker-name">{name}</span>
    </button>
  );
}
