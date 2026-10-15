import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  CATALOG,
  LEGENDARY,
  analyzeSeed,
  describeHits,
  normalizeSeed,
  randomSeed,
  seedHasWanted,
} from "./engine.ts";
import type { SeedMatch } from "./engine.ts";
import { JokerPick, RARITY_BY_NAME } from "./JokerCard.tsx";

const RARITIES = ["All", "Common", "Uncommon", "Rare", "Legendary"] as const;

function useStoredState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(`balatro-seed-finder:${key}`);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(`balatro-seed-finder:${key}`, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={active ? "pill active" : "pill"} onClick={onClick}>
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function App() {
  const [selected, setSelected] = useStoredState<string[]>("selected", ["Blueprint"]);
  const [query, setQuery] = useStoredState("query", "");
  const [rarity, setRarity] = useStoredState<string>("rarity", "All");
  const [maxAnte, setMaxAnte] = useStoredState("maxAnte", "2");
  const [shopSlots, setShopSlots] = useStoredState("shopSlots", "10");
  const [matchMode, setMatchMode] = useStoredState("matchMode", "all");
  const [maxSeeds, setMaxSeeds] = useStoredState("maxSeeds", "100000");
  const [seedInput, setSeedInput] = useStoredState("inspectSeed", "");
  const [matches, setMatches] = useStoredState<SeedMatch[]>("matches", []);
  const [copied, setCopied] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [scanned, setScanned] = useState(0);
  const [status, setStatus] = useState("");
  const abortRef = useRef(false);

  const anteN = Number(maxAnte);
  const slotsN = Number(shopSlots);
  const seed = normalizeSeed(seedInput);
  const analysis = useMemo(
    () => (seed ? analyzeSeed(seed, anteN, slotsN, selected) : null),
    [seed, anteN, slotsN, selected],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((joker) => {
      if (rarity !== "All" && joker.rarity !== rarity) return false;
      if (q && !joker.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, rarity]);

  const legendaryWanted = selected.some((name) => LEGENDARY.includes(name));
  const hitCount = analysis ? analysis.hits.filter((hit) => selected.includes(hit.name)).length : 0;

  function toggleJoker(name: string) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  }

  function copySeed(value: string) {
    void navigator.clipboard?.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied((current) => (current === value ? null : current)), 1200);
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
        const next = randomSeed();
        const hits = seedHasWanted(next, want, anteN, slotsN, matchAll);
        i++;
        if (hits) found.push({ seed: next, detail: describeHits(want, hits) });
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
    <main className="page">
      <header className="hero">
        <h1>
          <span>Balatro</span>
          <small>seed finder</small>
        </h1>
        <p className="lede">
          Pick the jokers you want. The finder walks Balatro 1.0.1+ shop, Buffoon pack, and The Soul
          queues using the same LuaJIT streams the game does.
        </p>
      </header>

      <section className="stats" aria-label="Search stats">
        <div className="stat">
          <strong>{selected.length}</strong>
          <span>Wanted jokers</span>
        </div>
        {seed ? (
          <div className="stat">
            <strong>{hitCount}</strong>
            <span>Hits in {seed}</span>
          </div>
        ) : null}
        {scanned > 0 ? (
          <div className="stat">
            <strong>{scanned.toLocaleString()}</strong>
            <span>Seeds scanned</span>
          </div>
        ) : null}
        {matches.length > 0 ? (
          <div className="stat success">
            <strong>{matches.length}</strong>
            <span>Matching seeds</span>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2>Wanted jokers</h2>
        {selected.length > 0 ? (
          <div className="selected-jokers">
            {selected.map((name) => (
              <JokerPick
                key={name}
                name={name}
                rarity={RARITY_BY_NAME.get(name) ?? "Common"}
                selected
                removable
                onClick={() => toggleJoker(name)}
              />
            ))}
          </div>
        ) : (
          <p className="muted">Pick cards from the collection below.</p>
        )}
        <div className="row filters">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter jokers…"
            aria-label="Filter jokers"
          />
          {RARITIES.map((item) => (
            <Pill key={item} active={rarity === item} onClick={() => setRarity(item)}>
              {item}
            </Pill>
          ))}
        </div>
        {visible.length > 0 ? (
          <div className="catalog">
            {visible.map((joker) => (
              <JokerPick
                key={joker.name}
                name={joker.name}
                rarity={joker.rarity}
                selected={selected.includes(joker.name)}
                onClick={() => toggleJoker(joker.name)}
              />
            ))}
          </div>
        ) : (
          <p className="muted">No jokers match that filter.</p>
        )}
      </section>

      <section className="panel">
        <h2>Search</h2>
        <div className="fields">
          <Field
            label="Antes to scan"
            value={maxAnte}
            onChange={setMaxAnte}
            options={[
              { value: "1", label: "Ante 1" },
              { value: "2", label: "Antes 1–2" },
              { value: "4", label: "Antes 1–4" },
              { value: "8", label: "Antes 1–8" },
            ]}
          />
          <Field
            label="Shop slots / ante"
            value={shopSlots}
            onChange={setShopSlots}
            options={[
              { value: "4", label: "4 (shop + 1 reroll)" },
              { value: "6", label: "6 (2 rerolls)" },
              { value: "10", label: "10 (4 rerolls)" },
              { value: "16", label: "16 (7 rerolls)" },
            ]}
          />
          <Field
            label="Match"
            value={matchMode}
            onChange={setMatchMode}
            options={[
              { value: "all", label: "All selected" },
              { value: "any", label: "Any selected" },
            ]}
          />
          <Field
            label="Max seeds"
            value={maxSeeds}
            onChange={setMaxSeeds}
            options={[
              { value: "25000", label: "25,000" },
              { value: "100000", label: "100,000" },
              { value: "250000", label: "250,000" },
              { value: "1000000", label: "1,000,000" },
            ]}
          />
        </div>
        <div className="row actions">
          <button type="button" className="primary" onClick={startSearch} disabled={searching || selected.length === 0}>
            Find seeds
          </button>
          {searching ? (
            <button type="button" className="ghost" onClick={stopSearch}>
              Stop
            </button>
          ) : null}
          {status ? <p className="muted">{status}</p> : null}
        </div>
        {legendaryWanted ? (
          <aside className="callout info">
            <strong>Legendary jokers</strong>
            <p>
              Canio, Triboulet, Yorick, Chicot, and Perkeo only appear from The Soul in Arcana or Spectral
              packs (~0.3% per card). Searching more antes helps a lot.
            </p>
          </aside>
        ) : null}
      </section>

      {matches.length > 0 ? (
        <section className="panel">
          <h2>Matching seeds</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Seed</th>
                  <th>Where they appear</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.seed}>
                    <td>
                      <div className="seed-cell">
                        <strong>{match.seed}</strong>
                        <button type="button" className="ghost" onClick={() => copySeed(match.seed)}>
                          {copied === match.seed ? "Copied" : "Copy"}
                        </button>
                        <button type="button" className="secondary" onClick={() => setSeedInput(match.seed)}>
                          Analyze
                        </button>
                      </div>
                    </td>
                    <td>{match.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="panel inspect">
        <div className="inspect-head">
          <div>
            <h2>Inspect a seed</h2>
            <p className="muted">Paste a seed to see packs and the shop queue.</p>
          </div>
          <input
            className="seed-input"
            value={seedInput}
            onChange={(event) => setSeedInput(event.target.value.toUpperCase())}
            placeholder="SEED"
            aria-label="Seed"
          />
        </div>
        {analysis ? (
          <article className="card">
            <header>
              <h3>{analysis.seed}</h3>
              <span>Red Deck · White Stake</span>
            </header>
            {analysis.antes.map((ante) => (
              <div key={ante.ante} className="ante">
                <h4>Ante {ante.ante}</h4>
                <div className="ante-grid">
                  <div>
                    <p className="column-label">Packs</p>
                    {ante.packs.map((pack, index) => (
                      <p key={`${pack.name}-${index}`} className={pack.wanted ? "hit" : "muted"}>
                        {pack.name}: {pack.cards.join(" · ")}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="column-label">Shop queue</p>
                    {ante.shop.map((row, index) => (
                      <p key={`${row.label}-${index}`} className={row.wanted ? "hit" : "muted"}>
                        {row.label}: {row.text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </article>
        ) : (
          <p className="muted inspect-empty">No seed yet. Type one above, or click Analyze on a match.</p>
        )}
      </section>
    </main>
  );
}
