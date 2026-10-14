import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Select,
  Stack,
  Stat,
  Table,
  Text,
  TextInput,
  useCanvasState,
  useHostTheme,
  useMemo,
  useRef,
  useState,
} from "cursor/canvas";

type Rarity = "Common" | "Uncommon" | "Rare" | "Legendary";
type Hit = { name: string; edition: string; where: string; ante: number };
type ShopRow = { label: string; text: string; wanted: boolean };
type PackRow = { name: string; cards: string[]; wanted: boolean };
type AnteView = { ante: number; packs: PackRow[]; shop: ShopRow[] };
type Analysis = { seed: string; antes: AnteView[]; hits: Hit[] };
type SeedMatch = { seed: string; detail: string };

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
const LEGENDARY = ["Canio", "Triboulet", "Yorick", "Chicot", "Perkeo"];
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
const PRESETS: { label: string; names: string[] }[] = [
  { label: "Copy", names: ["Blueprint", "Brainstorm"] },
  { label: "Baron / Mime", names: ["Baron", "Mime"] },
  { label: "Photochad", names: ["Photograph", "Hanging Chad"] },
  { label: "Perkeo", names: ["Perkeo"] },
  { label: "Triboulet", names: ["Triboulet"] },
  { label: "Foil Blueprint", names: ["Blueprint"] },
];
const SEED_CHARS = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CATALOG: { name: string; rarity: Rarity }[] = [
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
function normalizeSeed(raw: string): string {
  return raw.toUpperCase().replace(/0/g, "O").replace(/[^A-Z1-9]/g, "").slice(0, 8);
}
function randomSeed(): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += SEED_CHARS[(Math.random() * 35) | 0];
  return s;
}

function analyzeSeed(seed: string, maxAnte: number, shopSlots: number, wanted: string[]): Analysis {
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

function seedHasWanted(seed: string, wanted: string[], maxAnte: number, shopSlots: number, matchAll: boolean): Hit[] | null {
  const { hits } = analyzeSeed(seed, maxAnte, shopSlots, wanted);
  const names = new Set(hits.map((h) => h.name));
  const ok = matchAll ? wanted.every((n) => names.has(n)) : wanted.some((n) => names.has(n));
  return ok ? hits : null;
}

function describeHits(wanted: string[], hits: Hit[]): string {
  return wanted
    .map((name) => {
      const hit = hits.find((h) => h.name === name);
      if (!hit) return `${name} (not in range)`;
      return `${formatJoker(hit.name, hit.edition)} — ${hit.where}`;
    })
    .join(" · ");
}

export default function BalatroSeedFinder() {
  const theme = useHostTheme();
  const [selected, setSelected] = useCanvasState<string[]>("selected", ["Blueprint"]);
  const [query, setQuery] = useCanvasState("query", "");
  const [rarity, setRarity] = useCanvasState<string>("rarity", "All");
  const [maxAnte, setMaxAnte] = useCanvasState("maxAnte", "2");
  const [shopSlots, setShopSlots] = useCanvasState("shopSlots", "10");
  const [matchMode, setMatchMode] = useCanvasState("matchMode", "all");
  const [maxSeeds, setMaxSeeds] = useCanvasState("maxSeeds", "100000");
  const [seedInput, setSeedInput] = useCanvasState("seedInput", "DFRU5D52");
  const [matches, setMatches] = useCanvasState<SeedMatch[]>("matches", []);
  const [copied, setCopied] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [scanned, setScanned] = useState(0);
  const [status, setStatus] = useState("");
  const abortRef = useRef(false);

  const anteN = Number(maxAnte);
  const slotsN = Number(shopSlots);
  const seed = normalizeSeed(seedInput) || "DFRU5D52";
  const analysis = useMemo(
    () => analyzeSeed(seed, anteN, slotsN, selected),
    [seed, anteN, slotsN, selected],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((j) => {
      if (rarity !== "All" && j.rarity !== rarity) return false;
      if (q && !j.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, rarity]);

  const legendaryWanted = selected.some((n) => (LEGENDARY as string[]).includes(n));

  function toggleJoker(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }

  function copySeed(value: string) {
    void navigator.clipboard?.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1200);
  }

  function stopSearch() {
    abortRef.current = true;
    setSearching(false);
  }

  function startSearch() {
    if (selected.length === 0 || searching) return;
    abortRef.current = false;
    setSearching(true);
    setScanned(0);
    setMatches([]);
    setStatus("Searching…");
    const want = [...selected];
    const matchAll = matchMode === "all";
    const limit = Number(maxSeeds);
    const found: SeedMatch[] = [];
    let i = 0;

    const chunk = () => {
      if (abortRef.current) {
        setStatus(`Stopped after ${i.toLocaleString()} seeds.`);
        setSearching(false);
        return;
      }
      const start = performance.now();
      while (performance.now() - start < 45 && i < limit && found.length < 8) {
        const s = randomSeed();
        const hits = seedHasWanted(s, want, anteN, slotsN, matchAll);
        i++;
        if (hits) found.push({ seed: s, detail: describeHits(want, hits) });
      }
      setScanned(i);
      setMatches([...found]);
      if (found.length >= 8 || i >= limit) {
        setSearching(false);
        setStatus(
          found.length === 0
            ? `No matches in ${i.toLocaleString()} seeds. Try fewer jokers, more antes, or a longer search.`
            : `Found ${found.length} seed${found.length === 1 ? "" : "s"} in ${i.toLocaleString()} tries.`,
        );
        return;
      }
      window.requestAnimationFrame(chunk);
    };
    window.requestAnimationFrame(chunk);
  }

  return (
    <Stack gap={22} style={{ maxWidth: 980 }}>
      <Stack gap={6}>
        <H1>Balatro seed finder</H1>
        <Text tone="secondary">
          Pick the jokers you want. The finder walks Balatro 1.0.1+ shop, Buffoon pack, and The Soul
          queues (Red Deck, White Stake, completed profile) using the same LuaJIT streams the game does.
        </Text>
      </Stack>

      <Row gap={20} wrap>
        <Stat value={selected.length} label="Wanted jokers" />
        <Stat value={analysis.hits.filter((h) => selected.includes(h.name)).length} label={`Hits in ${seed}`} />
        {scanned > 0 ? <Stat value={scanned.toLocaleString()} label="Seeds scanned" /> : null}
        {matches.length > 0 ? (
          <Stat value={matches.length} label="Matching seeds" tone="success" />
        ) : null}
      </Row>

      <Stack gap={10}>
        <H2>Wanted jokers</H2>
        <Row gap={8} wrap>
          {PRESETS.map((p) => (
            <Pill
              key={p.label}
              active={p.names.every((n) => selected.includes(n)) && selected.length === p.names.length}
              onClick={() => setSelected(p.names)}
            >
              {p.label}
            </Pill>
          ))}
        </Row>
        {selected.length > 0 ? (
          <Row gap={6} wrap>
            {selected.map((name) => (
              <Pill key={name} active onClick={() => toggleJoker(name)}>
                {name} ×
              </Pill>
            ))}
          </Row>
        ) : null}
        <Row gap={8} align="center" wrap>
          <TextInput value={query} onChange={setQuery} placeholder="Filter jokers…" style={{ width: 220 }} />
          {(["All", "Common", "Uncommon", "Rare", "Legendary"] as const).map((r) => (
            <Pill key={r} active={rarity === r} onClick={() => setRarity(r)}>
              {r}
            </Pill>
          ))}
        </Row>
        {visible.length > 0 ? (
          <div
            style={{
              maxHeight: 220,
              overflow: "auto",
              border: `1px solid ${theme.stroke.tertiary}`,
              borderRadius: 6,
              padding: 8,
            }}
          >
            <Row gap={6} wrap>
              {visible.map((j) => (
                <Pill key={j.name} active={selected.includes(j.name)} onClick={() => toggleJoker(j.name)}>
                  {j.name}
                </Pill>
              ))}
            </Row>
          </div>
        ) : null}
      </Stack>

      <Stack gap={10}>
        <H2>Search</H2>
        <Grid columns={4} gap={10}>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Antes to scan</Text>
            <Select
              value={maxAnte}
              onChange={setMaxAnte}
              options={[
                { value: "1", label: "Ante 1" },
                { value: "2", label: "Antes 1–2" },
                { value: "4", label: "Antes 1–4" },
                { value: "8", label: "Antes 1–8" },
              ]}
            />
          </Stack>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Shop slots / ante</Text>
            <Select
              value={shopSlots}
              onChange={setShopSlots}
              options={[
                { value: "4", label: "4 (shop + 1 reroll)" },
                { value: "6", label: "6 (2 rerolls)" },
                { value: "10", label: "10 (4 rerolls)" },
                { value: "16", label: "16 (7 rerolls)" },
              ]}
            />
          </Stack>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Match</Text>
            <Select
              value={matchMode}
              onChange={setMatchMode}
              options={[
                { value: "all", label: "All selected" },
                { value: "any", label: "Any selected" },
              ]}
            />
          </Stack>
          <Stack gap={4}>
            <Text size="small" tone="secondary">Max seeds</Text>
            <Select
              value={maxSeeds}
              onChange={setMaxSeeds}
              options={[
                { value: "25000", label: "25,000" },
                { value: "100000", label: "100,000" },
                { value: "250000", label: "250,000" },
                { value: "1000000", label: "1,000,000" },
              ]}
            />
          </Stack>
        </Grid>
        <Row gap={8} align="center">
          <Button variant="primary" onClick={startSearch} disabled={searching || selected.length === 0}>
            Find seeds
          </Button>
          {searching ? (
            <Button variant="ghost" onClick={stopSearch}>Stop</Button>
          ) : null}
          {status ? <Text tone="secondary">{status}</Text> : null}
        </Row>
        {legendaryWanted ? (
          <Callout tone="info" title="Legendary jokers">
            Canio, Triboulet, Yorick, Chicot, and Perkeo only appear from The Soul in Arcana or Spectral
            packs (~0.3% per card). Searching more antes helps a lot.
          </Callout>
        ) : null}
      </Stack>

      {matches.length > 0 ? (
        <Stack gap={8}>
          <H2>Matching seeds</H2>
          <Table
            headers={["Seed", "Where they appear"]}
            rows={matches.map((m) => [
              <Row key={m.seed} gap={8} align="center">
                <Text weight="semibold">{m.seed}</Text>
                <Button variant="ghost" onClick={() => copySeed(m.seed)}>
                  {copied === m.seed ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSeedInput(m.seed);
                  }}
                >
                  Analyze
                </Button>
              </Row>,
              m.detail,
            ])}
          />
        </Stack>
      ) : null}

      <Divider />

      <Stack gap={10}>
        <Row gap={8} align="end">
          <Stack gap={4} style={{ flex: 1 }}>
            <H2>Inspect a seed</H2>
            <Text tone="secondary" size="small">
              Paste a seed, or use <Code>DFRU5D52</Code> — first Buffoon pack is Foil Blueprint.
            </Text>
          </Stack>
          <TextInput
            value={seedInput}
            onChange={(v) => setSeedInput(v.toUpperCase())}
            placeholder="SEED"
            style={{ width: 160 }}
          />
        </Row>

        <Card>
          <CardHeader trailing="Red Deck · White Stake">
            {analysis.seed}
          </CardHeader>
          <CardBody>
            <Stack gap={16}>
              {analysis.antes.map((a) => (
                <Stack key={a.ante} gap={8}>
                  <H3>Ante {a.ante}</H3>
                  <Grid columns={2} gap={12}>
                    <Stack gap={6}>
                      <Text size="small" weight="semibold">Packs</Text>
                      {a.packs.map((p, idx) => (
                        <Text key={`${p.name}-${idx}`} tone={p.wanted ? "primary" : "secondary"}>
                          {p.name}: {p.cards.join(" · ")}
                        </Text>
                      ))}
                    </Stack>
                    <Stack gap={6}>
                      <Text size="small" weight="semibold">Shop queue</Text>
                      {a.shop.map((row, idx) => (
                        <Text key={`${row.label}-${idx}`} tone={row.wanted ? "primary" : "secondary"}>
                          {row.label}: {row.text}
                        </Text>
                      ))}
                    </Stack>
                  </Grid>
                </Stack>
              ))}
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      <Callout tone="neutral" title="What this does and does not simulate">
        Shop joker slots, Buffoon packs, editions, and The Soul to legendary are generated from the
        real seed streams. Consumable names, playing-card packs, tags, Judgement, and already-bought
        lockouts are not applied — queues are the natural offer order if you have not already taken
        that joker. Confirm anything important in-game before a serious run.
      </Callout>
    </Stack>
  );
}
