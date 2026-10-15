import type { CSSProperties } from "react";
import { CATALOG } from "./engine.ts";
import type { Rarity } from "./engine.ts";
import { JOKER_SOUL_SPRITES, JOKER_SPRITES } from "./jokerSprites.ts";

export const RARITY_BY_NAME = new Map(CATALOG.map((joker) => [joker.name, joker.rarity]));

function spriteVars(pos: readonly [number, number], kind: "card" | "soul"): CSSProperties {
  if (kind === "soul") {
    return {
      "--soul-col": pos[0],
      "--soul-row": pos[1],
    } as CSSProperties;
  }
  return {
    "--col": pos[0],
    "--row": pos[1],
  } as CSSProperties;
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
  const pos = JOKER_SPRITES[name];
  const soul = JOKER_SOUL_SPRITES[name];

  return (
    <button
      type="button"
      className={`joker-pick rarity-${rarity.toLowerCase()}${selected ? " selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="joker-card-wrap">
        {pos ? (
          <span className="joker-sprite" style={spriteVars(pos, "card")} role="img" aria-label={name}>
            {soul ? <span className="joker-soul" style={spriteVars(soul, "soul")} /> : null}
          </span>
        ) : (
          <span className="joker-sprite missing" role="img" aria-label={name} />
        )}
        {removable ? <span className="joker-remove">×</span> : null}
      </span>
      <span className="joker-name">{name}</span>
    </button>
  );
}
