'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, ChevronDown, Navigation } from 'lucide-react';

type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

interface Place {
  id: number;
  name: string;
  cuisine: string;
  distance: number;
  tier: Tier;
  whatToOrder: string[];
  address?: string;
}

interface OverpassNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; desc: string }> = {
  S: { label: 'S', color: '#ffffff', bg: 'linear-gradient(135deg,#7c3aed,#db2777)', desc: 'Excellent — specialises in healthy meals' },
  A: { label: 'A', color: '#fff',    bg: '#1db954', desc: 'Great — generally nutritious cuisine' },
  B: { label: 'B', color: '#fff',    bg: '#3b82f6', desc: 'Good — healthy options available' },
  C: { label: 'C', color: '#fff',    bg: '#f59e0b', desc: 'Mixed — choose carefully' },
  D: { label: 'D', color: '#fff',    bg: '#ef4444', desc: 'Caution — mostly calorie-dense options' },
};

function getTier(name: string, cuisine: string, amenity: string): Tier {
  const all = `${name} ${cuisine}`.toLowerCase();
  if (/salad|vegan|vegetarian|healthy|organic|superfood|acai|smoothie|wholegrain/.test(all)) return 'S';
  if (/japanese|sushi|sashimi|poke|vietnamese|pho|korean|bibimbap/.test(all))              return 'A';
  if (/thai|mediterranean|greek|lebanese|turkish|middle.?east/.test(all))                  return 'A';
  if (/chinese|cantonese|indian|malay|singaporean|hawker|hainanese/.test(all))             return 'B';
  if (amenity === 'cafe')                                                                    return 'B';
  if (/mcdonald|kfc|burger.?king|popeye|pizza|subway|wendy/.test(name.toLowerCase()))      return 'D';
  if (amenity === 'fast_food')                                                               return 'C';
  return 'C';
}

function getWhatToOrder(name: string, cuisine: string): string[] {
  const all = `${name} ${cuisine}`.toLowerCase();
  if (/japanese|sushi/.test(all))          return ['Sashimi or nigiri (skip tempura)', 'Miso soup', 'Edamame starter'];
  if (/korean/.test(all))                  return ['Bibimbap with less gochujang', 'Sundubu jjigae', 'Vegetable banchan'];
  if (/vietnamese|pho/.test(all))          return ['Pho clear broth (not spicy)', 'Fresh spring rolls', 'Bun noodle dishes'];
  if (/thai/.test(all))                    return ['Tom yum clear (not coconut)', 'Grilled protein', 'Papaya salad'];
  if (/chinese|cantonese/.test(all))       return ['Steamed dishes over fried', 'Clear soup noodles', 'Stir-fried veg'];
  if (/indian/.test(all))                  return ['Dal or lentil dishes', 'Tandoori items', 'Raita as side'];
  if (/malay|singaporean|hawker/.test(all))return ['Yong tau foo clear soup', 'Steamed chicken rice', 'Economy rice + veg'];
  if (/salad|vegan|vegetarian/.test(all))  return ['Any bowl or salad', 'Dressing on the side', 'Add a protein topping'];
  return ['Grilled over fried', 'Ask for sauces on the side', 'Swap white rice for brown if available'];
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180, φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function PlaceCard({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);
  const t = TIER_CONFIG[place.tier];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start gap-3 p-4 text-left">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base font-bold"
          style={{ background: t.bg, color: t.color }}>
          {t.label}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight mb-0.5 truncate" style={{ color: 'var(--text-1)' }}>
            {place.name}
          </p>
          <div className="flex items-center gap-2">
            {place.cuisine && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                {place.cuisine.split(';')[0]}
              </span>
            )}
            <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
              {place.distance < 1000 ? `${Math.round(place.distance)}m` : `${(place.distance / 1000).toFixed(1)}km`}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`transition-transform shrink-0 mt-1 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-3)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="pt-3">
                <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-3)' }}>
                  TIER {place.tier} · {t.desc}
                </p>
                <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>What to order:</p>
                <ul className="space-y-1">
                  {place.whatToOrder.map(tip => (
                    <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                      <span style={{ color: 'var(--accent)' }}>·</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const TIER_FILTERS: (Tier | 'all')[] = ['all', 'S', 'A', 'B', 'C', 'D'];

export default function NearbyPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Tier | 'all'>('all');
  const [searched, setSearched] = useState(false);

  const findNearby = useCallback(async () => {
    setLoading(true); setError(''); setSearched(false);

    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;

      const query = `[out:json][timeout:20];(node["amenity"~"restaurant|food_court|fast_food|cafe|hawker_centre"](around:1500,${lat},${lng}););out body;`;
      const resp = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      if (!resp.ok) throw new Error('Could not fetch nearby places');
      const json = await resp.json();

      const nodes: OverpassNode[] = json.elements ?? [];
      const parsed: Place[] = nodes
        .filter(n => n.tags?.name)
        .map(n => {
          const name    = n.tags?.name ?? 'Unknown';
          const cuisine = n.tags?.cuisine ?? '';
          const amenity = n.tags?.amenity ?? '';
          const dist    = haversine(lat, lng, n.lat, n.lon);
          const tier    = getTier(name, cuisine, amenity);
          return {
            id: n.id,
            name,
            cuisine,
            distance: dist,
            tier,
            whatToOrder: getWhatToOrder(name, cuisine),
            address: [n.tags?.['addr:housenumber'], n.tags?.['addr:street']].filter(Boolean).join(' ') || undefined,
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 30);

      setPlaces(parsed);
      setSearched(true);
    } catch (e) {
      if (e instanceof GeolocationPositionError) {
        setError('Location access denied. Please allow location in your browser settings.');
      } else {
        setError(e instanceof Error ? e.message : 'Failed to find nearby places.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = filter === 'all' ? places : places.filter(p => p.tier === filter);

  const tierCounts = TIER_FILTERS.slice(1).reduce((acc, t) => {
    acc[t as Tier] = places.filter(p => p.tier === t).length;
    return acc;
  }, {} as Record<Tier, number>);

  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-1)' }}>
          Nearby Healthy Eats
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Restaurants within 1.5 km, rated by nutrition potential
        </p>
      </div>

      <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-3)' }}>TIER GUIDE</p>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(TIER_CONFIG) as [Tier, typeof TIER_CONFIG[Tier]][]).map(([tier, cfg]) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
                style={{ background: cfg.bg, color: cfg.color }}>{tier}</div>
              <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{cfg.desc.split(' — ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={findNearby} disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: 'var(--accent)' }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
        {loading ? 'Finding nearby places…' : 'Find near me'}
      </button>

      {error && (
        <div className="p-3 rounded-lg text-sm border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {searched && (
        <div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {TIER_FILTERS.map(t => {
              const active = filter === t;
              const count = t === 'all' ? places.length : tierCounts[t as Tier];
              return (
                <button key={t} onClick={() => setFilter(t)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active
                      ? (t === 'all' ? 'var(--accent)' : TIER_CONFIG[t as Tier].bg)
                      : 'var(--surface-2)',
                    color: active ? '#fff' : 'var(--text-2)',
                  }}>
                  {t === 'all' ? `All (${count})` : `${t} (${count})`}
                </button>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center rounded-xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <MapPin size={28} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                {places.length === 0 ? 'No restaurants found within 1.5 km' : `No ${filter}-tier places nearby`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(p => <PlaceCard key={p.id} place={p} />)}
            </div>
          )}
        </div>
      )}

      {!searched && !loading && (
        <div className="py-16 flex flex-col items-center gap-3 text-center rounded-xl border"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <MapPin size={32} style={{ color: 'var(--text-3)' }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>Tap to find healthy options near you</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Uses your device location — not stored anywhere</p>
          </div>
        </div>
      )}
    </div>
  );
}
