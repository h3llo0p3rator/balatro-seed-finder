export type Rarity = "Common" | "Uncommon" | "Rare" | "Legendary";
export type Hit = { name: string; edition: string; where: string; ante: number };
export type ShopRow = { label: string; text: string; wanted: boolean };
export type PackRow = { name: string; cards: string[]; wanted: boolean };
export type AnteView = { ante: number; packs: PackRow[]; shop: ShopRow[] };
export type Analysis = { seed: string; antes: AnteView[]; hits: Hit[] };
export type SeedMatch = { seed: string; detail: string };

const COMMON = [
  "Joker", "Greedy Joker", "Lusty Joker", "Wrathful Joker", "Gluttonous Joker",
  "Jolly Joker", "Zany Joker", "Mad Joker", "Crazy Joker", "Droll Joker",
  "Sly Joker", "Wily Joker", "Clever Joker", "Devious Joker", "Crafty Joker",
  "Half Joker", "Credit Card", "Banner", "Mystic Summit", "8 Ball", "Misprint",
  "Raised Fist", "Chaos the Clown", "Scary Face", "Abstract Joker",
  "Delayed Gratification", "Gros Michel", "Even Steven", "Odd Todd", "Scholar",
  "Business Card", "Supernova", "Ride the Bus", "Egg", "Runner", "Ice Cream",
  "Splash", "Blue Joker", "Faceless Joker", "Green Joker", "Superposition",
  "To Do List", "Cavendish", "Red Card", "Square Joker", "Riff-raff", "Photograph",
  "Reserved Parking", "Mail-In Rebate", "Hallucination", "Fortune Teller",
  "Juggler", "Drunkard", "Golden Joker", "Popcorn", "Walkie Talkie", "Smiley Face",
  "Golden Ticket", "Swashbuckler", "Hanging Chad", "Shoot the Moon",
];
const UNCOMMON = [
  "Joker Stencil", "Four Fingers", "Mime", "Ceremonial Dagger", "Marble Joker",
  "Loyalty Card", "Dusk", "Fibonacci", "Steel Joker", "Hack", "Pareidolia",
  "Space Joker", "Burglar", "Blackboard", "Sixth Sense", "Constellation", "Hiker",
  "Card Sharp", "Madness", "Séance", "Vampire", "Shortcut", "Hologram", "Cloud 9",
  "Rocket", "Midas Mask", "Luchador", "Gift Card", "Turtle Bean", "Erosion",
  "To the Moon", "Stone Joker", "Lucky Cat", "Bull", "Diet Cola", "Trading Card",
  "Flash Card", "Spare Trousers", "Ramen", "Seltzer", "Castle", "Mr. Bones",
  "Acrobat", "Sock and Buskin", "Troubadour", "Certificate", "Smeared Joker",
  "Throwback", "Rough Gem", "Bloodstone", "Arrowhead", "Onyx Agate", "Glass Joker",
  "Showman", "Flower Pot", "Merry Andy", "Oops! All 6s", "The Idol",
  "Seeing Double", "Matador", "Satellite", "Cartomancer", "Astronomer", "Bootstraps",
];
const RARE = [
  "DNA", "Vagabond", "Baron", "Obelisk", "Baseball Card", "Ancient Joker", "Campfire",
  "Blueprint", "Wee Joker", "Hit the Road", "The Duo", "The Trio", "The Family",
  "The Order", "The Tribe", "Stuntman", "Invisible Joker", "Brainstorm",
  "Driver's License", "Burnt Joker",
];
export const LEGENDARY = ["Canio", "Triboulet", "Yorick", "Chicot", "Perkeo"];
const FRESH_RUN = new Set([
  "Cavendish", "Stone Joker", "Steel Joker", "Glass Joker", "Golden Ticket", "Lucky Cat",
]);
const PACKS = [
  { name: "Arcana Pack", kind: "arcana", size: 3, weight: 4 },
  { name: "Jumbo Arcana Pack", kind: "arcana", size: 5, weight: 2 },
  { name: "Mega Arcana Pack", kind: "arcana", size: 5, weight: 0.5 },
  { name: "Celestial Pack", kind: "celestial", size: 3, weight: 4 },
  { name: "Jumbo Celestial Pack", kind: "celestial", size: 5, weight: 2 },
  { name: "Mega Celestial Pack", kind: "celestial", size: 5, weight: 0.5 },
  { name: "Standard Pack", kind: "standard", size: 3, weight: 4 },
  { name: "Jumbo Standard Pack", kind: "standard", size: 5, weight: 2 },
  { name: "Mega Standard Pack", kind: "standard", size: 5, weight: 0.5 },
  { name: "Buffoon Pack", kind: "buffoon", size: 2, weight: 1.2 },
  { name: "Jumbo Buffoon Pack", kind: "buffoon", size: 4, weight: 0.6 },
  { name: "Mega Buffoon Pack", kind: "buffoon", size: 4, weight: 0.15 },
  { name: "Spectral Pack", kind: "spectral", size: 2, weight: 0.6 },
  { name: "Jumbo Spectral Pack", kind: "spectral", size: 4, weight: 0.3 },
  { name: "Mega Spectral Pack", kind: "spectral", size: 4, weight: 0.07 },
];
const SEED_CHARS = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const CATALOG: { name: string; rarity: Rarity }[] = [
  ...COMMON.map((name) => ({ name, rarity: "Common" as const })),
  ...UNCOMMON.map((name) => ({ name, rarity: "Uncommon" as const })),
  ...RARE.map((name) => ({ name, rarity: "Rare" as const })),
  ...LEGENDARY.map((name) => ({ name, rarity: "Legendary" as const })),
];

const PI = Math.PI;
const MASK64 = 0xffffffffffffffffn;
const bitBuf = new ArrayBuffer(8);
const f64 = new Float64Array(bitBuf);
const u64 = new BigUint64Array(bitBuf);

function floatToBits(d: number): bigint {
  f64[0] = d;
  return u64[0];
}
function bitsToFloat(n: bigint): number {
  u64[0] = n;
  return f64[0];
}
function fract(x: number): number {
  return x - Math.floor(x);
}
function pseudohash(str: string): number {
  let num = 1;
  for (let i = str.length - 1; i >= 0; i--) {
    num = fract((1.1239285023 / num) * str.charCodeAt(i) * PI + PI * (i + 1));
  }
  return num;
}
function round13(x: number): number {
  return Number.parseFloat(Math.abs(x).toFixed(13));
}
function tausStep(z: bigint, sl: number, sr: number, k: number, sl2: number): bigint {
  z &= MASK64;
  const left = ((((z << BigInt(sl)) & MASK64) ^ z) >> BigInt(sr)) & MASK64;
  const right = ((z & ((-1n << BigInt(k)) & MASK64)) << BigInt(sl2)) & MASK64;
  return (left ^ right) & MASK64;
}
function randint(state: bigint[]): bigint {
  let r = 0n;
  state[0] = tausStep(state[0], 31, 45, 1, 18); r ^= state[0];
  state[1] = tausStep(state[1], 19, 30, 6, 28); r ^= state[1];
  state[2] = tausStep(state[2], 24, 48, 9, 7); r ^= state[2];
  state[3] = tausStep(state[3], 21, 39, 17, 8); r ^= state[3];
  return r;
}
function randomseed(d: number): bigint[] {
  const state = [0n, 0n, 0n, 0n];
  let r = 0x11090601;
  for (let i = 0; i < 4; i++) {
    const m = 1n << BigInt(r & 255);
    r >>>= 8;
    d = d * 3.14159265358979323846 + 2.7182818284590452354;
    let u = floatToBits(d);
    if (u < m) u += m;
    state[i] = u;
  }
  for (let i = 0; i < 10; i++) randint(state);
  return state;
}
function lRandom(state: bigint[]): number {
  return bitsToFloat((randint(state) & 4503599627370495n) | 4607182418800017408n) - 1;
}
function lRandint(state: bigint[], min: number, max: number): number {
  return Math.floor(lRandom(state) * (max - min + 1)) + min;
}

type Inst = {
  seed: string;
  hashedSeed: number;
  streams: Map<string, { value: number }>;
  locked: Set<string>;
  firstPack: boolean;
};

function createInstance(seed: string): Inst {
  return {
    seed,
    hashedSeed: pseudohash(seed),
    streams: new Map(),
    locked: new Set(FRESH_RUN),
    firstPack: false,
  };
}
function getSeed(inst: Inst, key: string): number {
  let s = inst.streams.get(key);
  if (!s) {
    s = { value: pseudohash(key + inst.seed) };
    inst.streams.set(key, s);
  }
  s.value = Math.abs(round13(fract(2.134453429141 + s.value * 1.72431234)));
  return (s.value + inst.hashedSeed) / 2;
}
function rngFloat(inst: Inst, key: string): number {
  return lRandom(randomseed(getSeed(inst, key)));
}
function rngInt(inst: Inst, key: string, min: number, max: number): number {
  return lRandint(randomseed(getSeed(inst, key)), min, max);
}
function pickFrom(inst: Inst, key: string, pool: string[]): string {
  return pool[rngInt(inst, key, 1, pool.length) - 1];
}
function editionOf(roll: number): string {
  if (roll > 0.997) return "Negative";
  if (roll > 0.994) return "Polychrome";
  if (roll > 0.98) return "Holographic";
  if (roll > 0.96) return "Foil";
  return "None";
}
function nextJoker(inst: Inst, source: string, ante: number): { name: string; edition: string } {
  let rarity = 1;
  let pool = COMMON;
  if (source === "sou") {
    rarity = 4;
    pool = LEGENDARY;
  } else if (source === "wra" || source === "rta") {
    rarity = 3;
    pool = RARE;
  } else if (source === "uta") {
    rarity = 2;
    pool = UNCOMMON;
  } else if (source !== "rif") {
    const roll = rngFloat(inst, `rarity${ante}${source}`);
    if (roll > 0.95) {
      rarity = 3;
      pool = RARE;
    } else if (roll > 0.7) {
      rarity = 2;
      pool = UNCOMMON;
    }
  }
  const base = rarity === 4 ? "Joker4" : `Joker${rarity}${source}${ante}`;
  let name = pickFrom(inst, base, pool);
  let n = 1;
  while (inst.locked.has(name) && rarity !== 4) {
    name = pickFrom(inst, `${base}_resample${n + 1}`, pool);
    if (++n > 80) break;
  }
  return { name, edition: editionOf(rngFloat(inst, `edi${source}${ante}`)) };
}
function nextPack(inst: Inst, ante: number): { name: string; kind: string; size: number } {
  if (ante <= 2 && !inst.firstPack) {
    inst.firstPack = true;
    return { name: "Buffoon Pack", kind: "buffoon", size: 2 };
  }
  let poll = rngFloat(inst, `shop_pack${ante}`) * 22.42;
  let weight = 0;
  for (const p of PACKS) {
    weight += p.weight;
    if (weight >= poll) return p;
  }
  return PACKS[PACKS.length - 1];
}
function soulType(kind: string): string | null {
  if (kind === "arcana") return "Tarot";
  if (kind === "celestial") return "Planet";
  if (kind === "spectral") return "Spectral";
  return null;
}
function shopLabel(slot: number): string {
  if (slot < 2) return "Open shop";
  return `Reroll ${Math.floor((slot - 2) / 2) + 1}`;
}
function formatJoker(name: string, edition: string): string {
  return edition === "None" ? name : `${edition} ${name}`;
}
export function normalizeSeed(raw: string): string {
  return raw.toUpperCase().replace(/0/g, "O").replace(/[^A-Z1-9]/g, "").slice(0, 8);
}
export function randomSeed(): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += SEED_CHARS[(Math.random() * 35) | 0];
  return s;
}

export function analyzeSeed(seed: string, maxAnte: number, shopSlots: number, wanted: string[]): Analysis {
  const inst = createInstance(seed);
  const hits: Hit[] = [];
  const want = new Set(wanted);
  const antes: AnteView[] = [];
  if (!Number.isFinite(inst.hashedSeed)) {
    return { seed, antes: [], hits: [] };
  }
  for (let ante = 1; ante <= maxAnte; ante++) {
    const packs: PackRow[] = [];
    const shop: ShopRow[] = [];
    for (let p = 0; p < 2; p++) {
      const pack = nextPack(inst, ante);
      const cards: string[] = [];
      let packWanted = false;
      if (pack.kind === "buffoon") {
        const seen: string[] = [];
        for (let i = 0; i < pack.size; i++) {
          const j = nextJoker(inst, "buf", ante);
          if (!inst.locked.has(j.name)) inst.locked.add(j.name);
          seen.push(j.name);
          const text = formatJoker(j.name, j.edition);
          cards.push(text);
          if (want.has(j.name)) packWanted = true;
          hits.push({ ...j, where: `Ante ${ante} ${pack.name}`, ante });
        }
        for (const name of seen) inst.locked.delete(name);
        for (const name of FRESH_RUN) inst.locked.add(name);
      } else {
        const st = soulType(pack.kind);
        if (st) {
          for (let i = 0; i < pack.size; i++) {
            if (rngFloat(inst, `soul_${st}${ante}`) > 0.997) {
              const j = nextJoker(inst, "sou", ante);
              const text = `The Soul → ${formatJoker(j.name, j.edition)}`;
              cards.push(text);
              if (want.has(j.name)) packWanted = true;
              hits.push({ ...j, where: `Ante ${ante} ${pack.name} (The Soul)`, ante });
            }
          }
        }
        if (cards.length === 0) cards.push(pack.kind === "standard" ? "playing cards" : pack.kind);
      }
      packs.push({ name: pack.name, cards, wanted: packWanted });
    }
    for (let s = 0; s < shopSlots; s++) {
      const t = rngFloat(inst, `cdt${ante}`) * 28;
      const label = shopLabel(s);
      if (t < 20) {
        const j = nextJoker(inst, "sho", ante);
        hits.push({ ...j, where: `Ante ${ante} ${label.toLowerCase()}`, ante });
        shop.push({
          label,
          text: formatJoker(j.name, j.edition),
          wanted: want.has(j.name),
        });
      } else if (t < 24) {
        shop.push({ label, text: "Tarot", wanted: false });
      } else {
        shop.push({ label, text: "Planet", wanted: false });
      }
    }
    antes.push({ ante, packs, shop });
  }
  return { seed, antes, hits };
}

export function seedHasWanted(
  seed: string,
  wanted: string[],
  maxAnte: number,
  shopSlots: number,
  matchAll: boolean,
): Hit[] | null {
  const { hits } = analyzeSeed(seed, maxAnte, shopSlots, wanted);
  const names = new Set(hits.map((h) => h.name));
  const ok = matchAll ? wanted.every((n) => names.has(n)) : wanted.some((n) => names.has(n));
  return ok ? hits : null;
}

export function describeHits(wanted: string[], hits: Hit[]): string {
  return wanted
    .map((name) => {
      const hit = hits.find((h) => h.name === name);
      if (!hit) return `${name} (not in range)`;
      return `${formatJoker(hit.name, hit.edition)} — ${hit.where}`;
    })
    .join(" · ");
}
