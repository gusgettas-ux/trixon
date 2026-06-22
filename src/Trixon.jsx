import React, { useState, useEffect, useMemo } from "react";
import { useSharedState } from "./supabase.js";

/* =====================================================================
   TRIXON — Home Bar Manager
   A single-file React app. Speakeasy / high-end hotel aesthetic.
   - Admin: Inventory, Recipes, Queue, Share Menu (QR)
   - Guest: Elegant menu (name + description only), request a drink
   - Persistence: Supabase (shared across all devices, realtime sync)
   ===================================================================== */

/* ----------------------------- Theme ------------------------------ */
const T = {
  bg: "#1c1813",
  bg2: "#241f17",
  panel: "rgba(255,255,255,0.05)",
  border: "#3d3120",
  borderHi: "#4d3f28",
  gold: "#d4af5a",
  goldBright: "#f0d490",
  goldDim: "#a07f3f",
  goldDeep: "#c89a42",
  cream: "#e6d6b8",
  text: "#b09a76",
  danger: "#c0392b",
  dangerBright: "#e74c3c",
};

/* Small reusable button styles for inventory tiles */
const qtyBtn = {
  background: "transparent",
  border: `1px solid ${T.borderHi}`,
  color: T.gold,
  width: 24,
  height: 24,
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "'Space Mono', monospace",
  fontSize: 14,
  lineHeight: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
const miniBtn = {
  background: "transparent",
  border: `1px solid ${T.border}`,
  color: T.goldDim,
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "'Space Mono', monospace",
  fontSize: 9,
  letterSpacing: 1,
  textTransform: "uppercase",
  padding: "5px 8px",
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Space+Mono:wght@400;700&display=swap";

/* ----------------------- Inventory categories --------------------- */
/* Grouped options for the full-bar dropdown. */
const CATEGORY_GROUPS = [
  {
    group: "Whiskey",
    items: [
      "Bourbon",
      "Rye Whiskey",
      "Tennessee Whiskey",
      "Scotch (Blended)",
      "Scotch (Single Malt)",
      "Irish Whiskey",
      "Japanese Whisky",
      "Canadian Whisky",
      "Other Whiskey",
    ],
  },
  {
    group: "Agave Spirits",
    items: ["Tequila Blanco", "Tequila Reposado", "Tequila Añejo", "Mezcal", "Other Agave"],
  },
  {
    group: "Rum",
    items: [
      "White / Silver Rum",
      "Gold Rum",
      "Dark / Black Rum",
      "Spiced Rum",
      "Aged / Añejo Rum",
      "Rhum Agricole",
      "Cachaça",
      "Overproof Rum",
    ],
  },
  {
    group: "Gin",
    items: ["London Dry Gin", "Old Tom Gin", "Plymouth Gin", "Navy Strength Gin", "Genever", "Flavored Gin"],
  },
  {
    group: "Vodka",
    items: ["Vodka (Plain)", "Citrus Vodka", "Flavored Vodka", "Potato Vodka"],
  },
  {
    group: "Brandy",
    items: ["Cognac", "Armagnac", "Brandy", "Calvados / Apple Brandy", "Pisco", "Grappa", "Eau de Vie"],
  },
  {
    group: "Other Spirits",
    items: ["Absinthe", "Aquavit", "Soju", "Baijiu", "Everclear / Neutral", "Other Spirit"],
  },
  {
    group: "Liqueurs & Cordials",
    items: [
      "Triple Sec / Curaçao",
      "Cointreau",
      "Grand Marnier",
      "Maraschino",
      "Amaretto",
      "Coffee Liqueur",
      "Cream / Irish Cream",
      "Elderflower",
      "Crème de Cassis",
      "Crème de Violette",
      "Crème de Menthe",
      "Crème de Cacao",
      "Peach / Apricot",
      "Melon",
      "Sloe Gin",
      "Falernum",
      "Allspice Dram",
      "Chartreuse (Green)",
      "Chartreuse (Yellow)",
      "Bénédictine",
      "Drambuie",
      "Sambuca",
      "Limoncello",
      "Pimm's",
      "Other Liqueur",
    ],
  },
  {
    group: "Amari & Aperitifs",
    items: [
      "Campari",
      "Aperol",
      "Fernet",
      "Averna",
      "Montenegro",
      "Cynar",
      "Nonino",
      "Suze / Gentian",
      "Other Amaro",
    ],
  },
  {
    group: "Fortified & Wine",
    items: [
      "Sweet Vermouth",
      "Dry Vermouth",
      "Blanc / Bianco Vermouth",
      "Lillet",
      "Cocchi Americano",
      "Sherry (Fino)",
      "Sherry (Oloroso)",
      "Sherry (Other)",
      "Port",
      "Madeira",
      "Marsala",
      "Red Wine",
      "White Wine",
      "Rosé",
      "Champagne / Sparkling",
      "Prosecco / Cava",
    ],
  },
  {
    group: "Beer & Cider",
    items: ["Lager", "Pilsner", "IPA / Pale Ale", "Stout / Porter", "Wheat Beer", "Sour / Saison", "Non-Alc Beer", "Cider", "Hard Seltzer"],
  },
  {
    group: "Juices",
    items: [
      "Lime Juice",
      "Lemon Juice",
      "Orange Juice",
      "Grapefruit Juice",
      "Pineapple Juice",
      "Cranberry Juice",
      "Tomato Juice",
      "Apple Juice",
      "Pomegranate Juice",
      "Passion Fruit",
      "Other Juice",
    ],
  },
  {
    group: "Sodas & Carbonated",
    items: [
      "Club Soda / Seltzer",
      "Tonic Water",
      "Cola",
      "Diet Cola",
      "Lemon-Lime Soda",
      "Ginger Beer",
      "Ginger Ale",
      "Grapefruit Soda",
      "Sparkling Water",
      "Energy Drink",
      "Other Soda",
    ],
  },
  {
    group: "Non-Carbonated Mixers",
    items: [
      "Coconut Cream / Milk",
      "Heavy Cream / Half & Half",
      "Milk",
      "Cold Brew / Coffee",
      "Espresso",
      "Hot Coffee",
      "Tea",
      "Iced Tea",
      "Lemonade",
      "Sour Mix",
      "Bloody Mary Mix",
      "Margarita Mix",
      "Other Mixer",
    ],
  },
  {
    group: "Syrups & Sweeteners",
    items: [
      "Simple Syrup",
      "Rich / Demerara Syrup",
      "Honey Syrup",
      "Agave Nectar",
      "Maple Syrup",
      "Grenadine",
      "Orgeat",
      "Falernum Syrup",
      "Cinnamon Syrup",
      "Vanilla Syrup",
      "Ginger Syrup",
      "Raspberry / Berry Syrup",
      "Passion Fruit Syrup",
      "Flavored Syrup",
      "Sugar Cubes",
      "Superfine Sugar",
    ],
  },
  {
    group: "Bitters & Tinctures",
    items: [
      "Angostura / Aromatic",
      "Orange Bitters",
      "Peychaud's",
      "Chocolate / Mole Bitters",
      "Walnut Bitters",
      "Celery Bitters",
      "Grapefruit Bitters",
      "Cardamom Bitters",
      "Saline / Salt Tincture",
      "Other Bitters",
    ],
  },
  {
    group: "Garnishes",
    items: [
      "Limes",
      "Lemons",
      "Oranges",
      "Grapefruit",
      "Maraschino Cherries",
      "Luxardo Cherries",
      "Olives",
      "Cocktail Onions",
      "Fresh Mint",
      "Fresh Basil",
      "Rosemary",
      "Cucumber",
      "Jalapeño",
      "Ginger (Fresh)",
      "Edible Flowers",
      "Citrus Peels / Twists",
    ],
  },
  {
    group: "Rims & Spices",
    items: ["Salt", "Flavored / Smoked Salt", "Sugar (Rim)", "Tajín / Chili", "Cinnamon", "Nutmeg", "Black Pepper", "Other Spice"],
  },
  {
    group: "Pantry & Extras",
    items: [
      "Egg (White / Whole)",
      "Aquafaba",
      "Hot Sauce",
      "Worcestershire",
      "Coconut Water",
      "Coffee Beans",
      "Whipped Cream",
      "Ice (Specialty)",
      "Other",
    ],
  },
];
/* Flat list of the top-level groups, used for filtering inventory. */
const CATEGORY_FILTER_ORDER = CATEGORY_GROUPS.map((g) => g.group);
/* Map a specific category back to its parent group. */
function parentGroup(category) {
  for (const g of CATEGORY_GROUPS) if (g.items.includes(category)) return g.group;
  return "Other";
}

/* --------------------------- Seed data ---------------------------- */
const SEED_BOTTLES = [
  { id: "b1", name: "Bulleit Bourbon", category: "Bourbon", level: 75, order: false },
  { id: "b2", name: "Hendrick's Gin", category: "London Dry Gin", level: 22, order: true },
  { id: "b3", name: "Campari", category: "Campari", level: 60, order: false },
  { id: "b4", name: "Sweet Vermouth", category: "Sweet Vermouth", level: 40, order: false },
  { id: "b5", name: "Stella Artois", category: "Lager", level: 90, order: false },
  { id: "b6", name: "Athletic Free Wave Hazy IPA", category: "IPA / Pale Ale", level: 100, order: false },
];

const SEED_RECIPES = [
  {
    id: "r1",
    name: "Old Fashioned",
    tag: "Classic · Stirred",
    group: "Classics",
    description:
      "Bourbon coaxed open with a whisper of sugar and bitters, finished with a flamed orange twist. Timeless, warming, unhurried.",
    ingredients: [
      { name: "Bulleit Bourbon", amount: "2 oz" },
      { name: "Simple Syrup", amount: "¼ oz" },
      { name: "Angostura Bitters", amount: "2 dashes" },
      { name: "Orange Peel", amount: "1 twist" },
    ],
    notes: "Stir 30s over a single large cube. Express the peel over the surface.",
    available: true,
  },
  {
    id: "r2",
    name: "Negroni",
    tag: "Aperitivo · Stirred",
    group: "Classics",
    description:
      "Equal parts gin, Campari, and sweet vermouth — bittersweet, ruby-red, and endlessly elegant. The perfect prelude to an evening.",
    ingredients: [
      { name: "Hendrick's Gin", amount: "1 oz" },
      { name: "Campari", amount: "1 oz" },
      { name: "Sweet Vermouth", amount: "1 oz" },
      { name: "Orange Peel", amount: "1 twist" },
    ],
    notes: "Stir, strain over ice. Garnish with a wide orange peel.",
    available: true,
  },
];

/* ------------------------- QR generation -------------------------- */
/* Use a lightweight public QR image endpoint. Swappable later. */
function qrUrl(data, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&color=d4af5a&bgcolor=1c1813&data=${encodeURIComponent(
    data
  )}`;
}

/* ============================ Monogram ============================ */
function Monogram({ size = 44 }) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="47" stroke={T.gold} strokeWidth="1.5" opacity="0.5" />
        <circle cx="50" cy="50" r="42" stroke={T.goldDim} strokeWidth="0.75" opacity="0.6" />
        {/* H */}
        <g stroke={T.goldBright} strokeWidth="3" strokeLinecap="round">
          <line x1="33" y1="34" x2="33" y2="66" />
          <line x1="67" y1="34" x2="67" y2="66" />
          <line x1="33" y1="50" x2="67" y2="50" />
        </g>
        {/* T overlay */}
        <g stroke={T.gold} strokeWidth="3.4" strokeLinecap="round" opacity="0.95">
          <line x1="35" y1="30" x2="65" y2="30" />
          <line x1="50" y1="30" x2="50" y2="72" />
        </g>
      </svg>
    </div>
  );
}

/* ============================ Shared UI =========================== */
function Card({ children, style }) {
  return (
    <div
      style={{
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderTop: `1px solid ${T.borderHi}`,
        padding: 20,
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: T.goldDeep,
        marginBottom: 18,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {children}
      <span
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(to right, ${T.goldDeep}44, transparent)`,
        }}
      />
    </div>
  );
}

function GoldButton({ children, onClick, subtle, danger, style }) {
  const c = danger ? T.danger : T.goldDeep;
  return (
    <button
      onClick={onClick}
      style={{
        background: subtle ? "transparent" : `${c}22`,
        border: `1px solid ${c}${subtle ? "55" : "88"}`,
        color: danger ? T.dangerBright : T.goldBright,
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        letterSpacing: 2,
        textTransform: "uppercase",
        padding: "8px 14px",
        cursor: "pointer",
        transition: "all 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${c}33`)}
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = subtle ? "transparent" : `${c}22`)
      }
    >
      {children}
    </button>
  );
}

function Bottle({ level }) {
  const low = level <= 25;
  return (
    <div style={{ width: 22, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div
        style={{
          width: 7,
          height: 13,
          background: T.border,
          border: `1px solid ${T.borderHi}`,
          borderBottom: "none",
          borderRadius: "2px 2px 0 0",
        }}
      />
      <div
        style={{
          width: 22,
          height: 46,
          background: "#221a10",
          border: `1px solid ${T.borderHi}`,
          borderRadius: "0 0 3px 3px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            width: "100%",
            height: `${level}%`,
            background: low
              ? `linear-gradient(to top, ${T.danger}, ${T.dangerBright})`
              : `linear-gradient(to top, ${T.goldDeep}, ${T.goldBright})`,
            transition: "height 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ============================ Inventory =========================== */
function Inventory({ bottles, setBottles }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", level: 100, qty: 1 });
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const update = (id, patch) =>
    setBottles((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id) => setBottles((bs) => bs.filter((b) => b.id !== id));
  const add = () => {
    if (!form.name.trim()) return;
    setBottles((bs) => [
      ...bs,
      {
        id: "b" + Date.now(),
        name: form.name,
        category: form.category,
        level: Number(form.level),
        qty: Number(form.qty) || 1,
        order: false,
      },
    ]);
    setForm({ name: "", category: "", level: 100, qty: 1 });
    setAdding(false);
  };

  // Which top-level groups are actually present in the bar
  const presentGroups = CATEGORY_FILTER_ORDER.filter((g) =>
    bottles.some((b) => parentGroup(b.category) === g)
  );
  const filterChips = ["All", ...presentGroups];

  // Search + category filter
  const q = search.trim().toLowerCase();
  const matches = bottles.filter((b) => {
    const inCat = filter === "All" || parentGroup(b.category) === filter;
    const inSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.category || "").toLowerCase().includes(q);
    return inCat && inSearch;
  });

  // Auto-group the visible bottles under their category headers
  const groups = CATEGORY_FILTER_ORDER.map((groupName) => ({
    groupName,
    items: matches.filter((b) => parentGroup(b.category) === groupName),
  })).filter((g) => g.items.length > 0);
  const uncategorized = matches.filter((b) => !b.category);
  if (uncategorized.length) groups.push({ groupName: "Uncategorized", items: uncategorized });

  // One inventory row (original look)
  const Row = ({ b }) => {
    const low = b.level <= 25;
    return (
      <Card key={b.id}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Bottle level={b.level} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 17,
                color: T.cream,
                marginBottom: 2,
              }}
            >
              {b.name}
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: T.goldDim,
                marginBottom: 8,
              }}
            >
              {b.category || "Uncategorized"}
            </div>
            <div
              style={{
                height: 4,
                background: "#2c2415",
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${b.level}%`,
                  borderRadius: 3,
                  background: low
                    ? `linear-gradient(to right, ${T.danger}, ${T.dangerBright})`
                    : `linear-gradient(to right, ${T.goldDeep}, ${T.goldBright})`,
                  transition: "width 0.4s",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                color: low ? T.dangerBright : T.goldDim,
              }}
            >
              {b.level}%{low ? " — Running Low" : ""}
            </div>
          </div>
          {/* Quantity on hand */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <FieldLabel>On hand</FieldLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => update(b.id, { qty: Math.max(0, (b.qty ?? 1) - 1) })} style={qtyBtn}>−</button>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: T.cream, minWidth: 18, textAlign: "center" }}>
                {b.qty ?? 1}
              </span>
              <button onClick={() => update(b.id, { qty: (b.qty ?? 1) + 1 })} style={qtyBtn}>+</button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <input
            type="range"
            min="0"
            max="100"
            value={b.level}
            onChange={(e) => update(b.id, { level: Number(e.target.value) })}
            style={{ flex: 1, minWidth: 120, accentColor: T.gold }}
          />
          <GoldButton
            subtle={!b.order}
            onClick={() => update(b.id, { order: !b.order })}
            style={b.order ? { borderColor: T.goldBright } : {}}
          >
            {b.order ? "⚑ On List" : "+ Order"}
          </GoldButton>
          <GoldButton subtle danger onClick={() => remove(b.id)}>
            ✕
          </GoldButton>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <SectionLabel>Inventory</SectionLabel>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <input
          value={search}
          placeholder="Search your bar…"
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#15110b",
            border: `1px solid ${T.borderHi}`,
            color: T.cream,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 17,
            padding: "10px 14px",
            outline: "none",
            boxSizing: "border-box",
            borderRadius: 6,
          }}
        />
      </div>

      {/* Category filter chips */}
      {filterChips.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {filterChips.map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                style={{
                  background: active ? `${T.goldDeep}22` : "transparent",
                  border: `1px solid ${active ? T.goldDeep : T.border}`,
                  color: active ? T.goldBright : T.goldDim,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  padding: "5px 10px",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {matches.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 20px",
            color: T.goldDim,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 17,
          }}
        >
          {q ? `No matches for "${search}".` : "Nothing here yet."}
        </div>
      )}

      {/* Auto-grouped rows under category headers */}
      {groups.map((g) => (
        <div key={g.groupName} style={{ marginBottom: 8 }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: T.gold,
              marginBottom: 10,
              paddingBottom: 4,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {g.groupName} <span style={{ color: T.goldDim }}>· {g.items.length}</span>
          </div>
          {g.items.map((b) => (
            <Row key={b.id} b={b} />
          ))}
        </div>
      ))}

      {adding ? (
        <Card>
          <Field label="Bottle Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <CategorySelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <div style={{ marginBottom: 14 }}>
            <FieldLabel>Level — {form.level}%</FieldLabel>
            <input
              type="range"
              min="0"
              max="100"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
              style={{ width: "100%", accentColor: T.gold }}
            />
          </div>
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <FieldLabel>Quantity on hand</FieldLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setForm({ ...form, qty: Math.max(0, form.qty - 1) })} style={qtyBtn}>−</button>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: T.cream, minWidth: 20, textAlign: "center" }}>
                {form.qty}
              </span>
              <button onClick={() => setForm({ ...form, qty: form.qty + 1 })} style={qtyBtn}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <GoldButton onClick={add}>Save Bottle</GoldButton>
            <GoldButton subtle onClick={() => setAdding(false)}>
              Cancel
            </GoldButton>
          </div>
        </Card>
      ) : (
        <GoldButton onClick={() => setAdding(true)} style={{ width: "100%", padding: "14px" }}>
          + Add Bottle
        </GoldButton>
      )}

      {/* Shopping list — grouped by category, with check-off to remove */}
      {bottles.some((b) => b.order) && (
        <Card style={{ marginTop: 24, borderLeft: `2px solid ${T.gold}` }}>
          <SectionLabel>Shopping List</SectionLabel>
          {CATEGORY_FILTER_ORDER.map((groupName) => {
            const items = bottles.filter((b) => b.order && parentGroup(b.category) === groupName);
            if (items.length === 0) return null;
            return (
              <div key={groupName} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: T.gold,
                    marginBottom: 8,
                    paddingBottom: 4,
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  {groupName}
                </div>
                {items.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "6px 0",
                    }}
                  >
                    <button
                      onClick={() => update(b.id, { order: false })}
                      title="Mark as bought"
                      style={{
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                        border: `1px solid ${T.goldDeep}`,
                        background: "transparent",
                        color: T.gold,
                        cursor: "pointer",
                        borderRadius: 3,
                        fontSize: 11,
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✓
                    </button>
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 17,
                        color: T.cream,
                      }}
                    >
                      {b.name}
                      <span
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          color: T.goldDim,
                          marginLeft: 8,
                        }}
                      >
                        {b.category}
                      </span>
                    </span>
                    <span
                      style={{
                        color: b.level <= 25 ? T.dangerBright : T.goldDim,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 11,
                      }}
                    >
                      {b.level}%
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: 14,
              color: T.goldDim,
              marginTop: 4,
            }}
          >
            Tap ✓ to mark an item as bought and clear it from the list.
          </div>
        </Card>
      )}
    </div>
  );
}

/* ----------------------- Small form helpers ----------------------- */
function FieldLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: T.goldDim,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }) {
  const shared = {
    width: "100%",
    background: "#15110b",
    border: `1px solid ${T.border}`,
    color: T.cream,
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 17,
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <FieldLabel>{label}</FieldLabel>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ ...shared, resize: "vertical" }}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={shared}
        />
      )}
    </div>
  );
}

/* Grouped <select> for choosing an inventory category. */
function CategorySelect({ value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <FieldLabel>Type</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "#15110b",
          border: `1px solid ${T.border}`,
          color: T.cream,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 17,
          padding: "10px 12px",
          outline: "none",
          boxSizing: "border-box",
          appearance: "none",
          cursor: "pointer",
        }}
      >
        <option value="">Select a type…</option>
        {CATEGORY_GROUPS.map((g) => (
          <optgroup key={g.group} label={g.group} style={{ color: T.gold, background: T.bg2 }}>
            {g.items.map((item) => (
              <option key={item} value={item} style={{ color: T.cream, background: T.bg2 }}>
                {item}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}


/* ============================= Recipes ============================ */
function Recipes({ recipes, setRecipes }) {
  const [editing, setEditing] = useState(null); // recipe id or "new"
  const blank = {
    id: "",
    name: "",
    tag: "",
    group: "",
    description: "",
    glass: "",
    method: "",
    ingredients: [{ name: "", amount: "" }],
    notes: "",
    tastingNotes: "",
    rating: 0,
    featured: false,
    available: true,
  };
  const [draft, setDraft] = useState(blank);
  const [search, setSearch] = useState("");
  const [scaleFor, setScaleFor] = useState({}); // recipeId -> multiplier for batch view

  const startNew = () => {
    setDraft({ ...blank, id: "r" + Date.now() });
    setEditing("new");
  };
  const startEdit = (r) => {
    setDraft(JSON.parse(JSON.stringify({
      group: "", glass: "", method: "", tastingNotes: "", rating: 0, featured: false, ...r,
    })));
    setEditing(r.id);
  };
  const save = () => {
    if (!draft.name.trim()) return;
    setRecipes((rs) => {
      const exists = rs.some((r) => r.id === draft.id);
      return exists ? rs.map((r) => (r.id === draft.id ? draft : r)) : [...rs, draft];
    });
    setEditing(null);
  };
  const remove = (id) => setRecipes((rs) => rs.filter((r) => r.id !== id));

  // Move a recipe up/down within the master ordered list
  const move = (id, dir) =>
    setRecipes((rs) => {
      const i = rs.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= rs.length) return rs;
      const copy = [...rs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  // Existing group names for the datalist suggestions
  const existingGroups = [...new Set(recipes.map((r) => r.group).filter(Boolean))];

  // Scale an amount string like "1.5 oz" or "¾ oz" by a multiplier
  const scaleAmount = (amount, mult) => {
    if (!amount || mult === 1) return amount;
    const frac = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125 };
    let s = String(amount);
    // Replace unicode fractions with decimals for parsing
    let normalized = s;
    Object.keys(frac).forEach((f) => { normalized = normalized.replace(f, frac[f]); });
    const m = normalized.match(/(\d*\.?\d+(?:\s*\/\s*\d+)?)/);
    if (!m) return amount; // nothing numeric (e.g. "2 dashes" still scales below)
    let num = m[1];
    if (num.includes("/")) {
      const [a, b] = num.split("/").map((x) => parseFloat(x));
      num = a / b;
    } else {
      num = parseFloat(num);
    }
    const scaled = num * mult;
    // Round nicely
    const rounded = Math.round(scaled * 100) / 100;
    return s.replace(/(\d*\.?\d+(?:\s*\/\s*\d+)?|[½¼¾⅓⅔⅛])/, String(rounded));
  };

  const setIng = (i, patch) =>
    setDraft((d) => ({
      ...d,
      ingredients: d.ingredients.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)),
    }));
  const addIng = () => setDraft((d) => ({ ...d, ingredients: [...d.ingredients, { name: "", amount: "" }] }));
  const removeIng = (i) =>
    setDraft((d) => ({ ...d, ingredients: d.ingredients.filter((_, idx) => idx !== i) }));

  if (editing) {
    return (
      <div>
        <SectionLabel>{editing === "new" ? "New Recipe" : "Edit Recipe"}</SectionLabel>
        <Card>
          <Field label="Drink Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field
            label="Tag (e.g. Classic · Stirred)"
            value={draft.tag}
            onChange={(v) => setDraft({ ...draft, tag: v })}
          />

          {/* Group with autocomplete from existing groups */}
          <div style={{ marginBottom: 14 }}>
            <FieldLabel>Group / Section (e.g. Summer Drinks)</FieldLabel>
            <input
              value={draft.group}
              list="trixon-groups"
              placeholder="Type a new group or pick an existing one…"
              onChange={(e) => setDraft({ ...draft, group: e.target.value })}
              style={{
                width: "100%",
                background: "#15110b",
                border: `1px solid ${T.border}`,
                color: T.cream,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 17,
                padding: "10px 12px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <datalist id="trixon-groups">
              {existingGroups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>

          <Field
            label="Guest Description"
            value={draft.description}
            onChange={(v) => setDraft({ ...draft, description: v })}
            placeholder="How it reads on the menu…"
            multiline
          />

          {/* Glassware & method */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <FieldLabel>Glass</FieldLabel>
              <select
                value={draft.glass}
                onChange={(e) => setDraft({ ...draft, glass: e.target.value })}
                style={{
                  width: "100%", background: "#15110b", border: `1px solid ${T.border}`,
                  color: T.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: 16,
                  padding: "9px 10px", outline: "none", boxSizing: "border-box", appearance: "none",
                  cursor: "pointer", marginBottom: 14,
                }}
              >
                <option value="">—</option>
                {["Rocks / Old Fashioned", "Highball / Collins", "Coupe", "Martini / Cocktail", "Wine", "Flute", "Nick & Nora", "Copper Mug", "Hurricane", "Tiki / Mug", "Shot", "Pint"].map((g) => (
                  <option key={g} value={g} style={{ background: T.bg2 }}>{g}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>Method</FieldLabel>
              <select
                value={draft.method}
                onChange={(e) => setDraft({ ...draft, method: e.target.value })}
                style={{
                  width: "100%", background: "#15110b", border: `1px solid ${T.border}`,
                  color: T.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: 16,
                  padding: "9px 10px", outline: "none", boxSizing: "border-box", appearance: "none",
                  cursor: "pointer", marginBottom: 14,
                }}
              >
                <option value="">—</option>
                {["Shaken", "Stirred", "Built in glass", "Blended", "Muddled", "Rolled", "Thrown", "Frozen / Slushi"].map((m) => (
                  <option key={m} value={m} style={{ background: T.bg2 }}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <FieldLabel>Ingredients & Measurements</FieldLabel>
          {draft.ingredients.map((ing, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={ing.name}
                placeholder="Ingredient"
                onChange={(e) => setIng(i, { name: e.target.value })}
                style={{
                  flex: 2,
                  background: "#15110b",
                  border: `1px solid ${T.border}`,
                  color: T.cream,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  padding: "8px 10px",
                  outline: "none",
                }}
              />
              <input
                value={ing.amount}
                placeholder="Amount"
                onChange={(e) => setIng(i, { amount: e.target.value })}
                style={{
                  flex: 1,
                  background: "#15110b",
                  border: `1px solid ${T.border}`,
                  color: T.gold,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  padding: "8px 10px",
                  outline: "none",
                }}
              />
              <GoldButton subtle danger onClick={() => removeIng(i)} style={{ padding: "4px 10px" }}>
                ✕
              </GoldButton>
            </div>
          ))}
          <GoldButton subtle onClick={addIng} style={{ marginBottom: 16 }}>
            + Ingredient
          </GoldButton>

          <Field
            label="Bartender Notes (admin only)"
            value={draft.notes}
            onChange={(v) => setDraft({ ...draft, notes: v })}
            multiline
          />

          <Field
            label="Tasting Notes (admin only)"
            value={draft.tastingNotes}
            onChange={(v) => setDraft({ ...draft, tastingNotes: v })}
            placeholder="How did it turn out? Tweaks for next time…"
            multiline
          />

          {/* Star rating */}
          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Your Rating</FieldLabel>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setDraft({ ...draft, rating: draft.rating === n ? 0 : n })}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 24,
                    color: n <= draft.rating ? T.goldBright : T.border,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ★
                </button>
              ))}
              {draft.rating > 0 && (
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: T.goldDim, marginLeft: 6 }}>
                  {draft.rating}/5
                </span>
              )}
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: T.text,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16,
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
              style={{ accentColor: T.gold, width: 16, height: 16 }}
            />
            ⭐ Feature this on the guest menu (pinned to top)
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: T.text,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16,
              marginBottom: 16,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={draft.available}
              onChange={(e) => setDraft({ ...draft, available: e.target.checked })}
              style={{ accentColor: T.gold, width: 16, height: 16 }}
            />
            Show on guest menu
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <GoldButton onClick={save}>Save Recipe</GoldButton>
            <GoldButton subtle onClick={() => setEditing(null)}>
              Cancel
            </GoldButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel>Recipes</SectionLabel>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <input
          value={search}
          placeholder="Search recipes…"
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#15110b",
            border: `1px solid ${T.borderHi}`,
            color: T.cream,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 17,
            padding: "10px 14px",
            outline: "none",
            boxSizing: "border-box",
            borderRadius: 6,
          }}
        />
      </div>

      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: 15,
          color: T.goldDim,
          marginBottom: 18,
        }}
      >
        Use ▲ ▼ to arrange the running order. Grouped drinks appear under their
        headers on the guest menu in this order.
      </div>

      {(() => {
        // Filter by search first
        const sq = search.trim().toLowerCase();
        const pool = !sq
          ? recipes
          : recipes.filter(
              (r) =>
                r.name.toLowerCase().includes(sq) ||
                (r.group || "").toLowerCase().includes(sq) ||
                (r.tag || "").toLowerCase().includes(sq) ||
                (r.ingredients || []).some((i) => (i.name || "").toLowerCase().includes(sq))
            );
        // Build ordered group sections preserving master list order.
        const order = [];
        const seen = new Set();
        pool.forEach((r) => {
          const g = r.group || "More Cocktails";
          if (!seen.has(g)) {
            seen.add(g);
            order.push(g);
          }
        });
        if (pool.length === 0) {
          return (
            <div style={{ textAlign: "center", padding: "32px 20px", color: T.goldDim, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17 }}>
              No recipes match "{search}".
            </div>
          );
        }
        return order.map((g) => {
          const inGroup = pool.filter((r) => (r.group || "More Cocktails") === g);
          return (
            <div key={g} style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: 16,
                  color: T.gold,
                  textAlign: "center",
                  letterSpacing: 1,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span style={{ flex: 1, height: 1, background: `${T.goldDeep}44` }} />
                {g}
                <span style={{ flex: 1, height: 1, background: `${T.goldDeep}44` }} />
              </div>
              {inGroup.map((r) => {
                const idx = recipes.findIndex((x) => x.id === r.id);
                return (
                  <Card key={r.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 22,
                            color: T.goldBright,
                            marginBottom: 2,
                          }}
                        >
                          {r.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 10,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            color: T.goldDim,
                            marginBottom: 12,
                          }}
                        >
                          {r.tag} {!r.available && "· Hidden"}
                        </div>
                      </div>
                      {/* Move up/down */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <button
                          onClick={() => move(r.id, -1)}
                          disabled={idx === 0}
                          style={{
                            background: "transparent",
                            border: `1px solid ${T.border}`,
                            color: idx === 0 ? "#3a2e18" : T.gold,
                            cursor: idx === 0 ? "default" : "pointer",
                            padding: "2px 8px",
                            fontSize: 11,
                          }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => move(r.id, 1)}
                          disabled={idx === recipes.length - 1}
                          style={{
                            background: "transparent",
                            border: `1px solid ${T.border}`,
                            color: idx === recipes.length - 1 ? "#3a2e18" : T.gold,
                            cursor: idx === recipes.length - 1 ? "default" : "pointer",
                            padding: "2px 8px",
                            fontSize: 11,
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: "italic",
                        fontSize: 16,
                        color: T.text,
                        lineHeight: 1.5,
                        marginBottom: 10,
                      }}
                    >
                      {r.description}
                    </div>

                    {/* Glass · Method · Rating · Featured badges */}
                    {(r.glass || r.method || r.rating > 0 || r.featured) && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
                        {r.featured && (
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: T.goldBright, border: `1px solid ${T.goldDeep}`, borderRadius: 3, padding: "2px 7px" }}>
                            ⭐ Featured
                          </span>
                        )}
                        {r.glass && (
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: T.goldDim }}>
                            🥃 {r.glass}
                          </span>
                        )}
                        {r.method && (
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: T.goldDim }}>
                            · {r.method}
                          </span>
                        )}
                        {r.rating > 0 && (
                          <span style={{ fontSize: 12, color: T.goldBright, letterSpacing: 1 }}>
                            {"★".repeat(r.rating)}<span style={{ color: T.border }}>{"★".repeat(5 - r.rating)}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Batch scaling control */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: T.goldDim }}>
                        Batch:
                      </span>
                      {[1, 2, 4, 6, 12].map((mult) => {
                        const active = (scaleFor[r.id] || 1) === mult;
                        return (
                          <button
                            key={mult}
                            onClick={() => setScaleFor((s) => ({ ...s, [r.id]: mult }))}
                            style={{
                              background: active ? `${T.goldDeep}22` : "transparent",
                              border: `1px solid ${active ? T.goldDeep : T.border}`,
                              color: active ? T.goldBright : T.goldDim,
                              fontFamily: "'Space Mono', monospace",
                              fontSize: 10,
                              padding: "3px 8px",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                          >
                            ×{mult}
                          </button>
                        );
                      })}
                    </div>

                    {r.ingredients.map((ing, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: `1px solid #2c2415`,
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 16,
                          color: T.text,
                        }}
                      >
                        {ing.name}
                        <span style={{ color: T.gold, fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
                          {scaleAmount(ing.amount, scaleFor[r.id] || 1)}
                        </span>
                      </div>
                    ))}

                    {r.notes && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 12px",
                          background: "rgba(180,132,42,0.06)",
                          borderLeft: `2px solid ${T.goldDeep}`,
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 15,
                          fontStyle: "italic",
                          color: T.goldDim,
                        }}
                      >
                        {r.notes}
                      </div>
                    )}

                    {r.tastingNotes && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.02)",
                          borderLeft: `2px solid ${T.borderHi}`,
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 14,
                          fontStyle: "italic",
                          color: T.text,
                        }}
                      >
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: 1, textTransform: "uppercase", color: T.goldDim, display: "block", marginBottom: 4 }}>
                          Tasting Notes
                        </span>
                        {r.tastingNotes}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <GoldButton subtle onClick={() => startEdit(r)}>
                        Edit
                      </GoldButton>
                      <GoldButton subtle danger onClick={() => remove(r.id)}>
                        Delete
                      </GoldButton>
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        });
      })()}

      <GoldButton onClick={startNew} style={{ width: "100%", padding: 14 }}>
        + Add Recipe
      </GoldButton>
    </div>
  );
}

/* ============================== Queue ============================= */
function Queue({ queue, setQueue }) {
  const remove = (id) => setQueue((q) => q.filter((item) => item.id !== id));

  return (
    <div>
      <SectionLabel>Drink Queue</SectionLabel>
      {queue.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: T.goldDim,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 18,
          }}
        >
          The bar is quiet. No requests yet.
        </div>
      )}
      {queue.map((item, i) => (
        <Card key={item.id} style={{ borderLeft: `2px solid ${T.gold}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 30,
                color: T.goldDeep,
                width: 32,
                textAlign: "center",
                lineHeight: 1,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: T.cream }}>
                {item.drink}
                {item.custom && (
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: "'Space Mono', monospace",
                      color: T.goldDim,
                      marginLeft: 8,
                      letterSpacing: 1,
                    }}
                  >
                    CUSTOM
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: T.goldDim,
                }}
              >
                — {item.guest}
              </div>
            </div>
            <GoldButton onClick={() => remove(item.id)}>✓ Done</GoldButton>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* =========================== Share Menu =========================== */
function ShareMenu({ guestUrl }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div>
      <SectionLabel>Share Menu</SectionLabel>
      <Card style={{ textAlign: "center", padding: "32px 20px" }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 18,
            color: T.text,
            marginBottom: 24,
          }}
        >
          Let guests scan to browse your menu and request a cocktail.
        </div>
        <div
          style={{
            display: "inline-block",
            padding: 16,
            border: `1px solid ${T.borderHi}`,
            background: T.bg,
          }}
        >
          <img src={qrUrl(guestUrl, 220)} alt="Menu QR code" width={220} height={220} />
        </div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: T.goldDim,
            marginTop: 20,
            wordBreak: "break-all",
          }}
        >
          {guestUrl}
        </div>
        <div style={{ marginTop: 16 }}>
          <GoldButton onClick={copy}>{copied ? "✓ Copied" : "Copy Link"}</GoldButton>
        </div>
      </Card>

      <Card style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: T.goldDim,
            marginBottom: 8,
          }}
        >
          Printable Card
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            color: T.text,
            fontStyle: "italic",
          }}
        >
          Use your browser's Print function on the guest menu screen to print a branded
          card for your bar. (When hosted live, this becomes a one-tap PDF.)
        </div>
      </Card>
    </div>
  );
}

/* ===================== What Can I Make? (admin) =================== */
/* Normalize an ingredient/bottle name for loose matching. */
function normalizeName(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
/* Common garnishes/basics we assume are always on hand. */
const ASSUMED_ON_HAND = [
  "ice", "water", "orange peel", "lemon peel", "lime", "lemon", "orange",
  "garnish", "twist", "cherry", "salt", "sugar", "mint",
];
function isAssumed(ingredientName) {
  const n = normalizeName(ingredientName);
  return ASSUMED_ON_HAND.some((a) => n.includes(a));
}
/* Does the bar have this ingredient in stock? Loose, smart-ish match. */
function haveIngredient(ingredientName, inStock) {
  const need = normalizeName(ingredientName);
  if (!need) return true;
  if (isAssumed(ingredientName)) return true;
  const needWords = need.split(" ").filter((w) => w.length > 2);
  return inStock.some((b) => {
    const have = normalizeName(b.name);
    const haveCat = normalizeName(b.category);
    // direct contains either way
    if (have.includes(need) || need.includes(have)) return true;
    // category match (e.g. recipe says "Bourbon", bottle category "Whiskey / Bourbon")
    if (haveCat && (haveCat.includes(need) || need.includes(haveCat))) return true;
    // shared significant word (e.g. "Gin" in "Hendrick's Gin")
    return needWords.some((w) => have.includes(w) || haveCat.includes(w));
  });
}

function MakeableDrinks({ recipes, setRecipes, bottles }) {
  const inStock = bottles.filter((b) => (b.level ?? 0) > 0);

  // Evaluate each saved recipe
  const evaluated = recipes.map((r) => {
    const missing = (r.ingredients || []).filter((ing) => !haveIngredient(ing.name, inStock));
    return { recipe: r, missing };
  });
  const ready = evaluated.filter((e) => e.missing.length === 0);
  const almost = evaluated.filter((e) => e.missing.length === 1);

  // AI suggestions state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResults, setAiResults] = useState(null);
  const [savedNames, setSavedNames] = useState([]); // names added to Recipes this session
  const [focus, setFocus] = useState(""); // optional theme for guided AI suggestions

  // Add an AI suggestion into the saved Recipes list
  const saveToRecipes = (d) => {
    const ingredients = (Array.isArray(d.ingredients) ? d.ingredients : []).map((line) => {
      // Split a line like "1.5 oz Bourbon" into amount + name (best effort)
      const m = String(line).match(/^([\d.\/\s]+(?:oz|ml|dash(?:es)?|tsp|tbsp|cup|part(?:s)?|splash|barspoon)?\.?)\s+(.*)$/i);
      if (m) return { amount: m[1].trim(), name: m[2].trim() };
      return { name: String(line).trim(), amount: "" };
    });
    const newRecipe = {
      id: "r" + Date.now() + Math.floor(Math.random() * 1000),
      name: d.name,
      tag: "AI Suggestion",
      group: "AI Suggestions",
      description: d.tagline || "",
      ingredients: ingredients.length ? ingredients : [{ name: "", amount: "" }],
      notes: d.build || "",
      available: false, // hidden from guest menu until you review/enable it
    };
    setRecipes((rs) => {
      if (rs.some((r) => r.name.toLowerCase() === d.name.toLowerCase())) return rs; // avoid dupes
      return [...rs, newRecipe];
    });
    setSavedNames((s) => (s.includes(d.name) ? s : [...s, d.name]));
  };

  const alreadyInRecipes = (name) =>
    savedNames.includes(name) || recipes.some((r) => r.name.toLowerCase() === name.toLowerCase());

  const askAI = async (focus = "") => {
    setAiLoading(true);
    setAiError("");
    setAiResults(null);
    const inventory = inStock.map((b) => `${b.name}${b.category ? ` (${b.category})` : ""}`);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventory, focus }),
      });
      if (!res.ok) {
        let msg = `Request failed (status ${res.status}).`;
        try {
          const j = await res.json();
          if (j && j.error) msg = j.error;
        } catch {}
        if (res.status === 500 && msg.includes("missing")) {
          msg = "AI isn't set up yet — add your Anthropic API key in Vercel to enable suggestions.";
        }
        throw new Error(msg);
      }
      const data = await res.json();
      const parsed = data.suggestions;
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Couldn't read the AI's suggestions. Try again.");
      }
      setAiResults(parsed);
    } catch (e) {
      setAiError(e.message || "Something went wrong reaching the AI.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <SectionLabel>What Can I Make?</SectionLabel>

      {/* Ready to make (from your recipes) */}
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: T.gold,
          marginBottom: 10,
        }}
      >
        Ready Now <span style={{ color: T.goldDim }}>· from your recipes · {ready.length}</span>
      </div>
      {ready.length === 0 && (
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: T.goldDim, marginBottom: 16 }}>
          Nothing fully in stock yet — add bottles or recipes, or try the AI ideas below.
        </div>
      )}
      {ready.map(({ recipe }) => (
        <Card key={recipe.id}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: T.goldBright }}>
            {recipe.name}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: T.goldDim, marginTop: 2 }}>
            {recipe.tag}
          </div>
        </Card>
      ))}

      {/* Almost (missing 1) */}
      {almost.length > 0 && (
        <>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: T.gold,
              margin: "20px 0 10px",
            }}
          >
            Almost — Missing One <span style={{ color: T.goldDim }}>· {almost.length}</span>
          </div>
          {almost.map(({ recipe, missing }) => (
            <Card key={recipe.id}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: T.cream }}>
                {recipe.name}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: T.dangerBright, marginTop: 4 }}>
                Need: {missing.map((m) => m.name).join(", ")}
              </div>
            </Card>
          ))}
        </>
      )}

      {/* AI suggestions */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: T.gold,
            marginBottom: 8,
          }}
        >
          AI Ideas <span style={{ color: T.goldDim }}>· beyond your recipes</span>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: T.goldDim, marginBottom: 14 }}>
          Ask AI to suggest cocktails you could make from what's in stock right now.
        </div>

        <GoldButton onClick={() => askAI("")} style={{ width: "100%", padding: 14 }}>
          {aiLoading ? "Thinking…" : "✨ Ask AI for Ideas"}
        </GoldButton>

        {/* Guided suggestions with a custom focus/theme */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px dashed ${T.border}`,
          }}
        >
          <FieldLabel>Or focus the ideas on a theme</FieldLabel>
          <input
            value={focus}
            placeholder="e.g. summer drinks, dinner party, smoky & bold, low-ABV…"
            onChange={(e) => setFocus(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && focus.trim() && !aiLoading) askAI(focus.trim());
            }}
            style={{
              width: "100%",
              background: "#15110b",
              border: `1px solid ${T.borderHi}`,
              color: T.cream,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16,
              padding: "10px 14px",
              outline: "none",
              boxSizing: "border-box",
              borderRadius: 6,
              marginBottom: 10,
            }}
          />
          <GoldButton
            onClick={() => focus.trim() && askAI(focus.trim())}
            style={{ width: "100%", padding: 14, opacity: focus.trim() ? 1 : 0.5 }}
          >
            {aiLoading ? "Thinking…" : "✨ Ask with Focus"}
          </GoldButton>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: T.goldDim, marginTop: 8 }}>
            Tell the AI a vibe, occasion, season, or flavor and it'll tailor the suggestions to your stock.
          </div>
        </div>

        {aiError && (
          <Card style={{ marginTop: 14, borderLeft: `2px solid ${T.danger}` }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: T.dangerBright }}>
              {aiError}
            </div>
          </Card>
        )}

        {aiResults &&
          aiResults.map((d, i) => (
            <Card key={i} style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: T.goldBright }}>
                {d.name}
              </div>
              {d.tagline && (
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: T.text, marginTop: 4, marginBottom: 8 }}>
                  {d.tagline}
                </div>
              )}
              {Array.isArray(d.ingredients) &&
                d.ingredients.map((ing, j) => (
                  <div
                    key={j}
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 15,
                      color: T.cream,
                      padding: "2px 0",
                    }}
                  >
                    {ing}
                  </div>
                ))}
              {d.build && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    background: "rgba(180,132,42,0.06)",
                    borderLeft: `2px solid ${T.goldDeep}`,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontSize: 15,
                    color: T.goldDim,
                  }}
                >
                  {d.build}
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                {alreadyInRecipes(d.name) ? (
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      color: T.goldDim,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    ✓ Saved to Recipes
                  </div>
                ) : (
                  <GoldButton onClick={() => saveToRecipes(d)}>+ Save to Recipes</GoldButton>
                )}
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

/* =========================== Guest View =========================== */
function GuestView({ recipes, bottles = [], addToQueue, barName }) {
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const menu = recipes.filter((r) => r.available);
  // Beer & Cider in stock (level > 0) become requestable bottle options
  const beers = bottles.filter((b) => parentGroup(b.category) === "Beer & Cider" && b.level > 0);

  const order = (drinkName, isCustom = false) => {
    if (!name.trim()) return;
    addToQueue({
      id: "q" + Date.now(),
      guest: name.trim(),
      drink: drinkName,
      custom: isCustom,
      time: Date.now(),
    });
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2600);
    setCustom("");
    setShowCustom(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(180,132,42,0.1) 0%, transparent 55%)`,
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Monogram size={56} />
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 40,
              fontWeight: 700,
              color: T.goldBright,
              letterSpacing: 1,
            }}
          >
            {barName}
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: 17,
              color: T.goldDim,
              marginTop: 2,
            }}
          >
            — Cocktail Menu —
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${T.goldDeep}66, transparent)`,
            margin: "28px 0",
          }}
        />

        {/* Name capture */}
        <div style={{ marginBottom: 28 }}>
          <FieldLabel>Your Name</FieldLabel>
          <input
            value={name}
            placeholder="Enter your name to order"
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              background: "#15110b",
              border: `1px solid ${T.borderHi}`,
              color: T.goldBright,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              padding: "12px 14px",
              outline: "none",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          />
        </div>

        {confirmed && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              marginBottom: 20,
              background: "rgba(180,132,42,0.12)",
              border: `1px solid ${T.goldDeep}`,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: 18,
              color: T.goldBright,
            }}
          >
            Your order has been sent to the bar. Enjoy, {name}.
          </div>
        )}

        {/* Menu — featured pinned first, then grouped with section headers */}
        {(() => {
          const featured = menu.filter((r) => r.featured);
          const rest = menu.filter((r) => !r.featured);
          const order2 = [];
          const seen = new Set();
          rest.forEach((r) => {
            const g = r.group || "More Cocktails";
            if (!seen.has(g)) {
              seen.add(g);
              order2.push(g);
            }
          });
          // Featured counts as a section for header purposes
          const single = order2.length <= 1 && featured.length === 0;

          const sections = [];
          if (featured.length > 0) {
            sections.push({ key: "__featured", label: "✨ Featured Tonight", items: featured, always: true });
          }
          order2.forEach((g) => {
            sections.push({ key: g, label: g, items: rest.filter((r) => (r.group || "More Cocktails") === g) });
          });

          return sections.map((section) => {
            const g = section.label;
            const inGroup = section.items;
            const showHeader = section.always || !single;
            return (
              <div key={section.key}>
                {showHeader && (
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: "italic",
                      fontSize: 18,
                      color: T.gold,
                      textAlign: "center",
                      letterSpacing: 1,
                      margin: "30px 0 6px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <span style={{ flex: 1, height: 1, background: `${T.goldDeep}44` }} />
                    {g}
                    <span style={{ flex: 1, height: 1, background: `${T.goldDeep}44` }} />
                  </div>
                )}
                {inGroup.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "22px 0",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 24,
                          color: T.goldBright,
                          marginBottom: 4,
                        }}
                      >
                        {r.name}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: T.goldDim,
                        marginBottom: 10,
                      }}
                    >
                      {r.tag}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 17,
                        color: T.text,
                        lineHeight: 1.55,
                        marginBottom: 14,
                      }}
                    >
                      {r.description}
                    </div>
                    <GoldButton onClick={() => order(r.name)}>Request This</GoldButton>
                  </div>
                ))}
              </div>
            );
          });
        })()}

        {/* Beer, Cider & Seltzer — pulled from in-stock inventory */}
        {beers.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 18,
                color: T.gold,
                textAlign: "center",
                letterSpacing: 1,
                margin: "30px 0 6px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ flex: 1, height: 1, background: `${T.goldDeep}44` }} />
              Beer, Cider &amp; Seltzer
              <span style={{ flex: 1, height: 1, background: `${T.goldDeep}44` }} />
            </div>
            {beers.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: "18px 0",
                  borderBottom: `1px solid ${T.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 21,
                      color: T.goldBright,
                    }}
                  >
                    {b.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: T.goldDim,
                      marginTop: 2,
                    }}
                  >
                    {b.category}
                  </div>
                </div>
                <GoldButton onClick={() => order(b.name)}>Request This</GoldButton>
              </div>
            ))}
          </div>
        )}

        {/* Custom */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          {showCustom ? (
            <div>
              <Field
                label="Custom Request"
                value={custom}
                onChange={setCustom}
                placeholder="What would you like?"
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <GoldButton onClick={() => custom.trim() && order(custom.trim(), true)}>
                  Send Request
                </GoldButton>
                <GoldButton subtle onClick={() => setShowCustom(false)}>
                  Cancel
                </GoldButton>
              </div>
            </div>
          ) : (
            <GoldButton subtle onClick={() => setShowCustom(true)}>
              + Request Something Else
            </GoldButton>
          )}
        </div>

        {!name.trim() && (
          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: 15,
              color: T.goldDim,
            }}
          >
            Enter your name above to place an order.
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================= Admin ============================== */
function AdminView({ state, setters, guestUrl, onPreviewGuest }) {
  const [tab, setTab] = useState("inventory");
  const tabs = [
    { id: "inventory", label: "Inventory" },
    { id: "recipes", label: "Recipes" },
    { id: "make", label: "Make" },
    { id: "queue", label: "Queue" },
    { id: "share", label: "Share" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(28,24,19,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${T.border}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Monogram size={40} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: T.goldBright,
              lineHeight: 1,
            }}
          >
            {state.barName}
          </div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: T.goldDim,
            }}
          >
            Admin
          </div>
        </div>
        <GoldButton subtle onClick={onPreviewGuest}>
          Guest View
        </GoldButton>
      </div>

      {/* Queue badge / tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "16px 24px 0",
          maxWidth: 640,
          margin: "0 auto",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          const badge = t.id === "queue" && state.queue.length > 0 ? ` (${state.queue.length})` : "";
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: active ? `${T.goldDeep}22` : "transparent",
                border: `1px solid ${active ? T.goldDeep : T.border}`,
                color: active ? T.goldBright : T.goldDim,
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              {t.label}
              {badge}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px" }}>
        {tab === "inventory" && <Inventory bottles={state.bottles} setBottles={setters.setBottles} />}
        {tab === "recipes" && <Recipes recipes={state.recipes} setRecipes={setters.setRecipes} />}
        {tab === "make" && <MakeableDrinks recipes={state.recipes} setRecipes={setters.setRecipes} bottles={state.bottles} />}
        {tab === "queue" && <Queue queue={state.queue} setQueue={setters.setQueue} />}
        {tab === "share" && <ShareMenu guestUrl={guestUrl} />}
      </div>
    </div>
  );
}

/* ============================== App =============================== */
export default function App() {
  const [bottles, setBottles] = useSharedState("bottles", SEED_BOTTLES);
  const [recipes, setRecipes] = useSharedState("recipes", SEED_RECIPES);
  const [queue, setQueue] = useSharedState("queue", []);
  const barName = "Trixon";

  // Determine view from URL hash (so QR can point to #guest)
  const [view, setView] = useState(() =>
    typeof window !== "undefined" && window.location.hash.includes("guest") ? "guest" : "admin"
  );

  useEffect(() => {
    const onHash = () => setView(window.location.hash.includes("guest") ? "guest" : "admin");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const guestUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://trixon.app/#guest";
    return window.location.origin + window.location.pathname + "#guest";
  }, []);

  const addToQueue = (item) => setQueue((q) => [...q, item]);

  // Load fonts
  useEffect(() => {
    if (document.getElementById("trixon-fonts")) return;
    const l = document.createElement("link");
    l.id = "trixon-fonts";
    l.rel = "stylesheet";
    l.href = FONTS_HREF;
    document.head.appendChild(l);
  }, []);

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", background: T.bg, minHeight: "100vh" }}>
      {view === "guest" ? (
        <div>
          <GuestView recipes={recipes} bottles={bottles} addToQueue={addToQueue} barName={barName} />
          <button
            onClick={() => {
              window.location.hash = "";
              setView("admin");
            }}
            style={{
              position: "fixed",
              bottom: 16,
              right: 16,
              background: "rgba(28,24,19,0.9)",
              border: `1px solid ${T.border}`,
              color: T.goldDim,
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            ← Admin
          </button>
        </div>
      ) : (
        <AdminView
          state={{ bottles, recipes, queue, barName }}
          setters={{ setBottles, setRecipes, setQueue }}
          guestUrl={guestUrl}
          onPreviewGuest={() => {
            window.location.hash = "guest";
            setView("guest");
          }}
        />
      )}
    </div>
  );
}
