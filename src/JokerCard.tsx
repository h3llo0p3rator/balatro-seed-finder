import { CATALOG } from "./engine.ts";
import type { Rarity } from "./engine.ts";

export const RARITY_BY_NAME = new Map(CATALOG.map((joker) => [joker.name, joker.rarity]));

const RARITY_INK: Record<Rarity, string> = {
  Common: "#009dff",
  Uncommon: "#4bc292",
  Rare: "#fe5f55",
  Legendary: "#b26cbb",
};

type Motif =
  | "jester"
  | "money"
  | "heart"
  | "spade"
  | "club"
  | "diamond"
  | "blueprint"
  | "brain"
  | "photo"
  | "chad"
  | "crown"
  | "mask"
  | "banana"
  | "egg"
  | "bus"
  | "moon"
  | "star"
  | "bone"
  | "cards"
  | "eye"
  | "fist"
  | "bottle"
  | "cat"
  | "ticket"
  | "dice"
  | "gem"
  | "ghost"
  | "rocket"
  | "sword"
  | "book"
  | "clock"
  | "smile"
  | "dna"
  | "potion"
  | "grid"
  | "half"
  | "ball"
  | "mountain"
  | "envelope"
  | "bean"
  | "bowl"
  | "stone"
  | "license"
  | "fire"
  | "family";

function hashName(name: string): number {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function motifFor(name: string): Motif {
  const key = name.toLowerCase();
  const exact: Record<string, Motif> = {
    joker: "jester",
    "greedy joker": "money",
    "lusty joker": "heart",
    "wrathful joker": "spade",
    "gluttonous joker": "club",
    blueprint: "blueprint",
    brainstorm: "brain",
    photograph: "photo",
    "hanging chad": "chad",
    baron: "crown",
    mime: "mask",
    "gros michel": "banana",
    cavendish: "banana",
    egg: "egg",
    "ride the bus": "bus",
    "shoot the moon": "moon",
    "to the moon": "rocket",
    supernova: "star",
    constellation: "star",
    astronomer: "star",
    "mr. bones": "bone",
    "raised fist": "fist",
    drunkard: "bottle",
    "diet cola": "bottle",
    seltzer: "bottle",
    "lucky cat": "cat",
    "golden ticket": "ticket",
    "oops! all 6s": "dice",
    "rough gem": "gem",
    bloodstone: "gem",
    "onyx agate": "gem",
    "glass joker": "gem",
    "sixth sense": "ghost",
    séance: "ghost",
    rocket: "rocket",
    swashbuckler: "sword",
    "ceremonial dagger": "sword",
    scholar: "book",
    "delayed gratification": "clock",
    "smiley face": "smile",
    "scary face": "smile",
    dna: "dna",
    perkeo: "potion",
    "joker stencil": "grid",
    "half joker": "half",
    "8 ball": "ball",
    "mystic summit": "mountain",
    "mail-in rebate": "envelope",
    "turtle bean": "bean",
    ramen: "bowl",
    popcorn: "bowl",
    "ice cream": "bowl",
    "stone joker": "stone",
    "marble joker": "stone",
    "driver's license": "license",
    campfire: "fire",
    "burnt joker": "fire",
    "the duo": "family",
    "the trio": "family",
    "the family": "family",
    "the order": "family",
    "the tribe": "family",
    canio: "sword",
    triboulet: "jester",
    yorick: "bone",
    chicot: "jester",
    "credit card": "money",
    "golden joker": "money",
    bull: "money",
    "business card": "cards",
    "trading card": "cards",
    "flash card": "cards",
    "loyalty card": "cards",
    "baseball card": "cards",
    "red card": "cards",
    "blue joker": "cards",
    "card sharp": "cards",
    "faceless joker": "mask",
    "midas mask": "mask",
    hologram: "ghost",
    "invisible joker": "ghost",
    "square joker": "grid",
    "wee joker": "jester",
    "ancient joker": "stone",
    obelisk: "stone",
    castle: "stone",
    stuntman: "ball",
    acrobat: "ball",
    juggler: "ball",
    matador: "sword",
    luchador: "mask",
    "seeing double": "eye",
    hallucination: "eye",
    pareidolia: "eye",
    "fortune teller": "eye",
    cartomancer: "cards",
    showman: "jester",
    "chaos the clown": "jester",
    "flower pot": "bowl",
    "gift card": "ticket",
    certificate: "license",
    satellite: "star",
    "space joker": "star",
    "cloud 9": "star",
    "hit the road": "bus",
    runner: "bus",
    bootstraps: "ticket",
    "spare trousers": "ticket",
    "walkie talkie": "ball",
    splash: "bowl",
    erosion: "stone",
    dusk: "moon",
    shortcut: "cards",
    hack: "cards",
    fibonacci: "star",
    blackboard: "grid",
    "steel joker": "grid",
    vampire: "heart",
    misprint: "grid",
    banner: "ticket",
    "to do list": "ticket",
    "reserved parking": "ticket",
    superposition: "cards",
    "green joker": "club",
    "abstract joker": "grid",
    "even steven": "diamond",
    "odd todd": "spade",
    "riff-raff": "family",
    "four fingers": "fist",
    "sock and buskin": "mask",
    troubadour: "jester",
    "smeared joker": "cards",
    throwback: "ticket",
    "merry andy": "smile",
    "the idol": "crown",
    arrowhead: "spade",
    burglar: "mask",
    madness: "brain",
    vagabond: "cards",
  };
  if (exact[key]) return exact[key];
  if (key.includes("jolly") || key.includes("zany") || key.includes("mad") || key.includes("crazy") || key.includes("droll")) {
    return "smile";
  }
  if (key.includes("sly") || key.includes("wily") || key.includes("clever") || key.includes("devious") || key.includes("crafty")) {
    return "cards";
  }
  return "jester";
}

function palette(name: string, rarity: Rarity): { paper: string; art: string; ink: string; accent: string } {
  const hash = hashName(name);
  const artChoices = ["#2b3340", "#3a241f", "#1e3340", "#2a2a38", "#24352b", "#40241f"];
  return {
    paper: "#f7f1e4",
    art: artChoices[hash % artChoices.length],
    ink: RARITY_INK[rarity],
    accent: ["#f3b958", "#fe5f55", "#009dff", "#4bc292", "#ff9a00", "#b26cbb"][hash % 6],
  };
}

function Art({ name, rarity }: { name: string; rarity: Rarity }) {
  const motif = motifFor(name);
  const colors = palette(name, rarity);
  const mark = name.replace(/[^A-Z]/gi, "").slice(0, 2).toUpperCase() || "J";

  return (
    <svg className="joker-art" viewBox="0 0 140 190" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`shine-${hashName(name)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="140" height="190" rx="12" fill={colors.paper} />
      <rect x="7" y="7" width="126" height="176" rx="8" fill="none" stroke="#2a3034" strokeWidth="3" />
      <rect x="12" y="12" width="116" height="132" rx="6" fill={colors.art} />
      {motif === "blueprint" ? (
        <g>
          <path d="M20 20h100M20 44h100M20 68h100M20 92h100M20 116h100M32 16v124M56 16v124M80 16v124M104 16v124" stroke="#7ad7ff" strokeWidth="1.2" opacity="0.45" />
          <rect x="34" y="38" width="48" height="64" rx="4" fill="none" stroke="#7ad7ff" strokeWidth="3" />
          <rect x="58" y="54" width="48" height="64" rx="4" fill="none" stroke="#f3b958" strokeWidth="3" />
        </g>
      ) : motif === "brain" ? (
        <g fill="none" stroke={colors.accent} strokeWidth="6" strokeLinecap="round">
          <path d="M40 88c0-28 20-40 30-40s18 8 22 8 18-12 28 4 4 40-8 52-28 18-42 10-30-8-30-34z" />
          <path d="M52 84c12-10 24 6 36-4 10-8 22 2 28 10" />
        </g>
      ) : motif === "photo" ? (
        <g>
          <rect x="30" y="34" width="80" height="88" rx="4" fill="#f4e7c8" />
          <rect x="38" y="42" width="64" height="52" fill="#6ec6ff" />
          <circle cx="58" cy="62" r="10" fill="#f3b958" />
          <path d="M38 86l18-14 16 12 12-8 18 16H38z" fill="#2a3940" />
        </g>
      ) : motif === "chad" ? (
        <g>
          <rect x="32" y="28" width="76" height="100" fill="#f4e7c8" />
          <circle cx="58" cy="52" r="8" fill={colors.art} />
          <circle cx="82" cy="52" r="8" fill={colors.art} />
          <circle cx="58" cy="78" r="8" fill={colors.art} />
          <rect x="74" y="70" width="18" height="22" fill={colors.accent} />
        </g>
      ) : motif === "money" ? (
        <g>
          <circle cx="70" cy="78" r="36" fill={colors.accent} />
          <text x="70" y="92" textAnchor="middle" fontSize="42" fontWeight="700" fill="#3a2a10">$</text>
        </g>
      ) : motif === "heart" ? (
        <path d="M70 118c-28-22-40-40-40-56 0-16 12-26 26-26 8 0 14 4 14 10 0-6 6-10 14-10 14 0 26 10 26 26 0 16-12 34-40 56z" fill="#f03464" />
      ) : motif === "spade" ? (
        <path d="M70 28c24 28 36 44 36 60 0 14-10 22-22 22h-8v18h-12v-18h-8c-12 0-22-8-22-22 0-16 12-32 36-60z" fill="#403995" />
      ) : motif === "club" ? (
        <g fill="#235955">
          <circle cx="70" cy="52" r="18" />
          <circle cx="50" cy="76" r="18" />
          <circle cx="90" cy="76" r="18" />
          <rect x="64" y="78" width="12" height="36" />
        </g>
      ) : motif === "diamond" ? (
        <path d="M70 28l32 50-32 50L38 78z" fill="#f06b3f" />
      ) : motif === "crown" ? (
        <path d="M28 96l16-36 18 22 18-30 18 30 14-18 10 32H28z" fill={colors.accent} />
      ) : motif === "mask" ? (
        <g>
          <ellipse cx="70" cy="78" rx="40" ry="28" fill="#f7f1e4" />
          <ellipse cx="54" cy="76" rx="8" ry="10" fill={colors.art} />
          <ellipse cx="86" cy="76" rx="8" ry="10" fill={colors.art} />
        </g>
      ) : motif === "banana" ? (
        <path d="M46 40c28 4 52 28 52 62-18-4-34-8-40-24-6-14-8-28-12-38z" fill="#f3b958" />
      ) : motif === "egg" ? (
        <ellipse cx="70" cy="80" rx="28" ry="38" fill="#f7f1e4" />
      ) : motif === "bus" ? (
        <g fill={colors.accent}>
          <rect x="24" y="58" width="92" height="44" rx="8" />
          <rect x="32" y="66" width="22" height="16" fill="#7ad7ff" />
          <rect x="60" y="66" width="22" height="16" fill="#7ad7ff" />
          <circle cx="44" cy="108" r="8" fill="#2a3034" />
          <circle cx="96" cy="108" r="8" fill="#2a3034" />
        </g>
      ) : motif === "moon" ? (
        <g>
          <circle cx="70" cy="78" r="34" fill="#f4e7c8" />
          <circle cx="84" cy="70" r="26" fill={colors.art} />
        </g>
      ) : motif === "star" ? (
        <path d="M70 30l12 28h30l-24 18 10 30-28-18-28 18 10-30-24-18h30z" fill={colors.accent} />
      ) : motif === "bone" ? (
        <g fill="#f7f1e4">
          <rect x="36" y="70" width="68" height="16" rx="8" />
          <circle cx="36" cy="66" r="10" />
          <circle cx="36" cy="90" r="10" />
          <circle cx="104" cy="66" r="10" />
          <circle cx="104" cy="90" r="10" />
        </g>
      ) : motif === "cards" ? (
        <g>
          <rect x="36" y="40" width="44" height="64" rx="4" fill="#f7f1e4" transform="rotate(-14 58 72)" />
          <rect x="58" y="36" width="44" height="64" rx="4" fill={colors.accent} transform="rotate(10 80 68)" />
        </g>
      ) : motif === "eye" ? (
        <g>
          <ellipse cx="70" cy="78" rx="40" ry="22" fill="#f7f1e4" />
          <circle cx="70" cy="78" r="12" fill={colors.accent} />
          <circle cx="70" cy="78" r="5" fill="#1b1f22" />
        </g>
      ) : motif === "fist" ? (
        <path d="M44 96c0-20 12-36 28-36 6 0 10 4 14 4s10-6 16 2 4 20-2 28-20 22-36 18-20-4-20-16z" fill="#e8b48a" />
      ) : motif === "bottle" ? (
        <path d="M62 28h16v18l12 10v70H50V56l12-10z" fill={colors.accent} />
      ) : motif === "cat" ? (
        <g fill={colors.accent}>
          <circle cx="70" cy="84" r="28" />
          <path d="M46 70l8-28 16 18zM94 70l-8-28-16 18z" />
        </g>
      ) : motif === "ticket" ? (
        <rect x="28" y="58" width="84" height="44" rx="8" fill={colors.accent} />
      ) : motif === "dice" ? (
        <g>
          <rect x="40" y="48" width="60" height="60" rx="8" fill="#f7f1e4" />
          <circle cx="56" cy="64" r="5" fill="#1b1f22" />
          <circle cx="84" cy="64" r="5" fill="#1b1f22" />
          <circle cx="70" cy="78" r="5" fill="#1b1f22" />
          <circle cx="56" cy="92" r="5" fill="#1b1f22" />
          <circle cx="84" cy="92" r="5" fill="#1b1f22" />
        </g>
      ) : motif === "gem" ? (
        <path d="M40 56h60l-12 20 18 36H34l18-36z" fill={colors.accent} />
      ) : motif === "ghost" ? (
        <path d="M46 118c0-40 8-72 24-72s24 32 24 72l-10-10-14 12-12-12z" fill="#dfe7ff" />
      ) : motif === "rocket" ? (
        <path d="M70 28c18 22 20 44 16 70l-16 20-16-20c-4-26-2-48 16-70z" fill={colors.accent} />
      ) : motif === "sword" ? (
        <path d="M68 24h4l6 78h-16zM50 100h40v10H50z" fill={colors.accent} />
      ) : motif === "book" ? (
        <g>
          <rect x="36" y="40" width="68" height="80" rx="4" fill="#f7f1e4" />
          <rect x="36" y="40" width="10" height="80" fill={colors.accent} />
        </g>
      ) : motif === "clock" ? (
        <g>
          <circle cx="70" cy="78" r="32" fill="#f7f1e4" />
          <path d="M70 56v24l16 10" stroke="#1b1f22" strokeWidth="4" fill="none" />
        </g>
      ) : motif === "smile" ? (
        <g>
          <circle cx="70" cy="78" r="34" fill={colors.accent} />
          <circle cx="58" cy="70" r="4" fill="#1b1f22" />
          <circle cx="82" cy="70" r="4" fill="#1b1f22" />
          <path d="M54 88c8 10 24 10 32 0" stroke="#1b1f22" strokeWidth="4" fill="none" />
        </g>
      ) : motif === "dna" ? (
        <path d="M46 32c28 20 48 20 48 40s-20 20-48 40 48 20 48 40" stroke={colors.accent} strokeWidth="6" fill="none" />
      ) : motif === "potion" ? (
        <path d="M60 28h20v20l16 16v60H44V64l16-16z" fill="#b26cbb" />
      ) : motif === "grid" ? (
        <g stroke={colors.accent} strokeWidth="4" fill="none">
          <rect x="34" y="36" width="72" height="84" />
          <path d="M34 64h72M34 92h72M58 36v84M82 36v84" />
        </g>
      ) : motif === "half" ? (
        <g>
          <circle cx="70" cy="78" r="34" fill="#f7f1e4" />
          <path d="M70 44a34 34 0 0 1 0 68z" fill={colors.accent} />
        </g>
      ) : motif === "ball" ? (
        <g>
          <circle cx="70" cy="78" r="34" fill="#111" />
          <circle cx="70" cy="78" r="14" fill="#f7f1e4" />
          <text x="70" y="84" textAnchor="middle" fontSize="16" fontWeight="700" fill="#111">8</text>
        </g>
      ) : motif === "mountain" ? (
        <path d="M20 128l36-64 18 28 16-20 30 56z" fill={colors.accent} />
      ) : motif === "envelope" ? (
        <path d="M30 56h80v52H30zM30 56l40 28 40-28" fill={colors.accent} stroke="#1b1f22" />
      ) : motif === "bean" ? (
        <ellipse cx="70" cy="80" rx="24" ry="38" fill="#7d4b2a" transform="rotate(-20 70 80)" />
      ) : motif === "bowl" ? (
        <path d="M32 70h76l-10 40H42z" fill={colors.accent} />
      ) : motif === "stone" ? (
        <path d="M40 50h60l10 50-18 28H50L32 98z" fill="#9aa3a8" />
      ) : motif === "license" ? (
        <rect x="24" y="60" width="92" height="52" rx="6" fill={colors.accent} />
      ) : motif === "fire" ? (
        <path d="M70 36c18 22 28 34 28 54 0 22-14 34-28 34s-28-12-28-34c0-12 10-22 16-28 2 12 10 16 12 8z" fill="#fe5f55" />
      ) : motif === "family" ? (
        <g fill={colors.accent}>
          <circle cx="48" cy="70" r="12" />
          <circle cx="70" cy="62" r="14" />
          <circle cx="94" cy="70" r="12" />
          <path d="M28 118c4-28 18-36 42-36s38 8 42 36z" />
        </g>
      ) : (
        <g>
          <circle cx="70" cy="72" r="28" fill="#f7f1e4" />
          <path d="M42 58c8-18 20-22 28-10 8-12 20-8 28 10" fill={colors.accent} />
          <path d="M48 118c4-24 14-32 22-32s18 8 22 32z" fill="#f7f1e4" />
        </g>
      )}
      <text x="28" y="36" fontSize="16" fontWeight="700" fill={colors.accent} opacity="0.9">
        {mark[0]}
      </text>
      <text x="112" y="132" fontSize="16" fontWeight="700" fill={colors.accent} opacity="0.9" textAnchor="middle">
        {mark[0]}
      </text>
      <rect x="12" y="148" width="116" height="28" rx="6" fill={colors.ink} />
      <text x="70" y="167" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        {name.length > 16 ? `${name.slice(0, 15)}…` : name}
      </text>
      <rect width="140" height="190" rx="12" fill={`url(#shine-${hashName(name)})`} />
    </svg>
  );
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
  return (
    <button
      type="button"
      className={`joker-pick${selected ? " selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="joker-card-wrap">
        <Art name={name} rarity={rarity} />
        {removable ? <span className="joker-remove">×</span> : null}
      </span>
      <span className="joker-name">{name}</span>
    </button>
  );
}
