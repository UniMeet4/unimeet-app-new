import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Trophy, Palette, Utensils, Coffee, Grip,
  Zap, BookOpen, Sun, Music, Clock, Flame, Moon,
  Terminal, Radio, Home, MapPin, ShoppingBag,
  Mountain, Wind, ChefHat, Clock3,
} from 'lucide-react';
import DateTimePopover from '../components/popovers/DateTimePopover';
import LocationPopover from '../components/popovers/LocationPopover';
import GlassCard from '../components/GlassCard';

// ── Midnight Champagne palette ────────────────────────────────────────
const CHAMPAGNE  = '#E2D1B3';
const CHAMPAGNE2 = '#C5B496';
const SILVER     = '#8896A9';
const OBSIDIAN   = '#0A0C12';

// ── Main category definitions ─────────────────────────────────────────
const MAIN_CATEGORIES = [
  { label: 'SPORTS',  Icon: Trophy,   glowColor: '#34D399' },
  { label: 'CULTURE', Icon: Palette,  glowColor: '#A78BFA' },
  { label: 'FOOD',    Icon: Utensils, glowColor: '#FB923C' },
  { label: 'COFFEE',  Icon: Coffee,   glowColor: '#D4C49A' },
  { label: 'MORE',    Icon: Grip,     glowColor: CHAMPAGNE },
] as const;

// ── Berkeley vibes in the MORE drawer ────────────────────────────────
const BERKELEY_VIBES = [
  { label: 'GBC Run',       Icon: Zap,         color: CHAMPAGNE,  desc: 'Quick GBC run, who wants in? Meeting at Sproul in 10.' },
  { label: 'Library Grind', Icon: BookOpen,    color: '#60A5FA',  desc: 'Locking in at Moffitt or Doe. Studying together is just better.' },
  { label: 'Glade Chill',   Icon: Sun,         color: '#34D399',  desc: 'Posted up at the Glade. Bring snacks, vibes only.' },
  { label: 'Night Out',     Icon: Music,       color: '#A78BFA',  desc: 'Getting the night started. BYOB, text for the address.' },
  { label: 'Cram Sesh',     Icon: Clock,       color: '#F87171',  desc: 'Midterm szn is real. Grinding it out — join if you dare.' },
  { label: "Bear's Lair",   Icon: Flame,       color: '#FB923C',  desc: "Beers at Bear's Lair, the most Berkeley thing you can do." },
  { label: 'Moffitt Late',  Icon: Moon,        color: '#818CF8',  desc: 'Late-night Moffitt grind. Free level if you need quiet.' },
  { label: 'CS Grind',      Icon: Terminal,    color: '#22D3EE',  desc: 'Soda Hall energy. Pair programming or just suffering together.' },
  { label: 'Sproul Vibes',  Icon: Radio,       color: '#F472B6',  desc: "Something is always going down on Sproul. Come see what's up." },
  { label: 'FSM Café',      Icon: Coffee,      color: '#D4C49A',  desc: 'Free Speech Café is the move. Coffee, good reads, no midterms.' },
  { label: 'Dorm Hang',     Icon: Home,        color: '#4ADE80',  desc: 'Chilling in the dorms. Bring your Switch or just vibe out.' },
  { label: 'Top Dog',       Icon: MapPin,      color: '#FCD34D',  desc: 'Top Dog run after class. Who else is absolutely starving?' },
  { label: 'Cheeseboard',   Icon: ShoppingBag, color: '#FB7185',  desc: 'Cheeseboard pizza hour. Meet out front, first come first served.' },
  { label: 'Tilden Hike',   Icon: Mountain,    color: '#86EFAC',  desc: 'Tilden hike this weekend. Easy trail, great views, good people.' },
  { label: 'Straw Canyon',  Icon: Wind,        color: '#6EE7B7',  desc: 'Running Strawberry Canyon. All paces welcome, no judgment.' },
  { label: 'Bongo Burgers', Icon: ChefHat,     color: '#FCA5A5',  desc: 'Bongo Burger time. Best burgers near campus, no debate.' },
];

// ── Sub-category chips ────────────────────────────────────────────────
const CATEGORY_CHIPS: Record<string, string[]> = {
  SPORTS:  ['Tennis', 'Hiking', 'Basketball', 'Running', 'Gym', 'Volleyball'],
  CULTURE: ['Museum', 'Theater', 'Art Show', 'Poetry', 'Film', 'Exhibition'],
  FOOD:    ['Brunch', 'Dinner', 'Late Night', 'Café', 'Takeout', 'Picnic'],
  COFFEE:  ['Study', 'Catch-up', 'Work Sesh', 'Morning', 'Collab', 'Reading'],
  MORE:    ['Dorm Hang', 'Sproul', 'Top Dog', 'Tilden', 'Library', 'Rooftop'],
};

// ── Mock live moves ───────────────────────────────────────────────────
const MOCK_LIVE_MOVES = [
  { id: 'l1', status: 'Heading to GBC — who wants boba? 🧋', location: 'SOUTHSIDE', heat: 12, timeAgo: '3m', author: 'Priya' },
  { id: 'l2', status: 'Locked in at Moffitt 4th floor, DM if you need a spot 📚', location: 'CAMPUS', heat: 5, timeAgo: '8m', author: 'Marcus' },
  { id: 'l3', status: 'Free Speech Café after lecture — come through ☕', location: 'DOWNTOWN', heat: 21, timeAgo: '14m', author: 'Aisha' },
  { id: 'l4', status: 'Weather is too good, posted at the Glade 🌞', location: 'GLADE', heat: 8, timeAgo: '22m', author: 'Jake' },
];

// ── Helpers ───────────────────────────────────────────────────────────
const hexToRgba = (hex: string, alpha: number) => {
  const c = hex.replace('#', '');
  return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${alpha})`;
};

// Recessed input background — deep charcoal carved into the glass surface
const recessedInput: React.CSSProperties = {
  background:
    'linear-gradient(#060709, #060709) padding-box, ' +
    'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 40%, transparent 60%) border-box',
  border: '1px solid transparent',
};

// ── Component ─────────────────────────────────────────────────────────
const DiscoveryTab = ({ handlePost, posts = [] }: any) => {
  // --- EXPAND STATE ---
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  // --- FORM STATE ---
  const [selectedCategory, setSelectedCategory] = useState('SPORTS');
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [description, setDescription] = useState('');
  const [repeat, setRepeat] = useState('One-time');
  const [guestCount, setGuestCount] = useState(2);

  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [vibeAccentColor, setVibeAccentColor] = useState(CHAMPAGNE);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocPicker, setShowLocPicker] = useState(false);

  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [durationPop, setDurationPop] = useState(false);
  const [guestPop, setGuestPop] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded) {
      const t = setTimeout(() => setIsSettled(true), 600);
      return () => clearTimeout(t);
    }
    setIsSettled(false);
  }, [isExpanded]);

  useEffect(() => {
    setDurationPop(true);
    const t = setTimeout(() => setDurationPop(false), 250);
    return () => clearTimeout(t);
  }, [duration]);

  useEffect(() => {
    setGuestPop(true);
    const t = setTimeout(() => setGuestPop(false), 250);
    return () => clearTimeout(t);
  }, [guestCount]);

  const durationGlow = duration > 1
    ? `0 0 ${Math.round(8 + Math.min(duration - 1, 5) * 3)}px ${hexToRgba(CHAMPAGNE, 0.1 + Math.min(duration - 1, 5) * 0.05)}`
    : 'none';
  const guestGlow = guestCount > 2
    ? `0 0 ${Math.round(8 + Math.min(guestCount - 2, 6) * 3)}px ${hexToRgba(CHAMPAGNE, 0.1 + Math.min(guestCount - 2, 6) * 0.05)}`
    : 'none';

  const handleSelectCategory = (label: string) => {
    setSelectedCategory(label);
    setVibeAccentColor(CHAMPAGNE);
    setSelectedChip(null);
  };

  const handleSelectVibe = (vibe: typeof BERKELEY_VIBES[number]) => {
    setSelectedCategory(vibe.label);
    setDescription(vibe.desc);
    setVibeAccentColor(vibe.color);
    setShowMoreDrawer(false);
    setSelectedChip(null);
  };

  const generateDescription = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Write a fun, concise 2-sentence activity description for a university social app. Be casual and inviting. Return only the description text, no extra formatting.' },
            { role: 'user', content: aiPrompt },
          ],
          max_tokens: 100,
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) { setDescription(text); setAiMode(false); setAiPrompt(''); }
    } catch {
      alert('Failed to generate description. Check your OpenAI API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const onPublish = () => {
    if (!description || !when || !where) {
      alert('Please fill in the When, Where, and Description!');
      return;
    }
    handlePost({ category: selectedCategory, duration, when_time: when, where_location: where, description, repeat_type: repeat, max_guests: guestCount });
    setDescription(''); setWhen(''); setWhere(''); setAiPrompt('');
    setVibeAccentColor(CHAMPAGNE);
    setIsExpanded(false);
  };

  const toggleExpanded = () => setIsExpanded(v => !v);

  // --- STYLE UTILITIES ---
  const fieldFocusStyle = (field: string, openOverride = false): React.CSSProperties => {
    if (!openOverride && focusedField !== field) return {};
    return {
      background:
        `linear-gradient(rgba(30,41,70,0.72), rgba(30,41,70,0.72)) padding-box, ` +
        `linear-gradient(135deg, ${hexToRgba(CHAMPAGNE, 0.45)} 0%, ${hexToRgba(CHAMPAGNE, 0.12)} 35%, transparent 62%) border-box`,
      border: '1px solid transparent',
      boxShadow: `0 0 0 2px ${hexToRgba(CHAMPAGNE, 0.09)}, 0 4px 18px rgba(0,0,0,0.32)`,
      transition: 'box-shadow 0.2s, background 0.2s',
    };
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '9px', fontWeight: '900', color: SILVER,
    letterSpacing: '0.12em', display: 'block', marginBottom: '8px',
    textTransform: 'uppercase',
  };

  const stepperBtn: React.CSSProperties = {
    background: 'none', border: 'none', color: SILVER,
    fontSize: '20px', cursor: 'pointer', lineHeight: 1,
    padding: '0 4px', fontWeight: '300',
  };

  const modeTabStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: '8px',
    fontSize: '11px', fontWeight: '700', cursor: 'pointer',
    backgroundColor: active ? CHAMPAGNE : 'transparent',
    color: active ? OBSIDIAN : SILVER,
    transition: 'all 0.15s',
  });

  const publishBg = vibeAccentColor === CHAMPAGNE
    ? `linear-gradient(180deg, ${CHAMPAGNE} 0%, ${CHAMPAGNE2} 100%)`
    : vibeAccentColor;
  const publishShadow = `0 10px 30px ${hexToRgba(vibeAccentColor, 0.28)}, 0 1px 0 rgba(255,255,255,0.12) inset`;
  const publishHoverShadow = `0 18px 44px ${hexToRgba(vibeAccentColor, 0.5)}, 0 1px 0 rgba(255,255,255,0.15) inset`;

  const activeVibe = BERKELEY_VIBES.find(v => v.label === selectedCategory);

  const liveMoves = posts.length > 0
    ? posts.map((p: any) => ({
        id: p.id,
        status: p.description ?? '',
        location: (p.where_location ?? 'CAMPUS').toUpperCase().slice(0, 14),
        heat: Math.max(1, (p.activity_participants?.length ?? 0) * 3),
        timeAgo: `${Math.max(0, Math.floor((Date.now() - new Date(p.created_at).getTime()) / 60000))}m`,
        author: p.profiles?.full_name?.split(' ')[0] ?? 'Someone',
      }))
    : MOCK_LIVE_MOVES;

  // Active category color for chip borders (use glowColor of selected main cat, or vibeAccentColor)
  const activeCatColor = MAIN_CATEGORIES.find(c => c.label === selectedCategory)?.glowColor ?? vibeAccentColor;
  const chips = CATEGORY_CHIPS[selectedCategory] ?? CATEGORY_CHIPS.MORE;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* ── POST A MOVE FAB BAR ──────────────────────────────────── */}
      <GlassCard hover={false} style={{ padding: '0' }}>
        <div
          onClick={toggleExpanded}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', cursor: 'pointer' }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${CHAMPAGNE} 0%, ${CHAMPAGNE2} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: '14px',
          }}>✏️</div>
          <span style={{
            flex: 1, fontSize: '14px', fontStyle: 'italic', fontWeight: isExpanded ? '600' : '400',
            color: isExpanded ? '#EDE8DF' : SILVER, transition: 'color 0.2s',
          }}>
            Post a Move...
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              width: '28px', height: '28px', borderRadius: '8px',
              backgroundColor: hexToRgba(CHAMPAGNE, isExpanded ? 0.18 : 0.10),
              border: `1px solid ${hexToRgba(CHAMPAGNE, 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: CHAMPAGNE, fontSize: '20px', fontWeight: '300', lineHeight: '26px',
            }}
          >+</motion.div>
        </div>
      </GlassCard>

      {/* ── EXPANDABLE FORM ──────────────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
            style={{ overflow: isSettled ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >

            {/* ── CATEGORY CARD ─────────────────────────────────── */}
            <GlassCard hover={false} style={{ padding: '20px' }} corner="BERKELEY // CA">
              <span style={{
                fontSize: '13px', fontWeight: '900', fontStyle: 'italic',
                color: CHAMPAGNE, letterSpacing: '0.12em', display: 'block', marginBottom: '14px',
              }}>
                WHAT'S THE VIBE?
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {MAIN_CATEGORIES.map(({ label, Icon, glowColor }) => {
                  const isActive = selectedCategory === label || (label === 'MORE' && !!activeVibe);
                  const isMore = label === 'MORE';
                  return (
                    <motion.div
                      key={label}
                      onClick={() => isMore ? setShowMoreDrawer(true) : handleSelectCategory(label)}
                      whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                      whileTap={{ scale: isMore ? 0.9 : 0.93 }}
                      style={{
                        textAlign: 'center', cursor: 'pointer',
                        // 20% opacity tint when active — Tinted Glass effect
                        backgroundColor: isActive ? hexToRgba(glowColor, 0.20) : 'rgba(20, 27, 46, 0.55)',
                        borderRadius: '20px', padding: '12px 4px 10px',
                        boxShadow: isActive
                          ? `inset 0 1px 0 ${hexToRgba(glowColor, 0.5)}, inset 0 0 0 1px ${hexToRgba(glowColor, 0.2)}, 0 0 20px ${hexToRgba(glowColor, 0.18)}`
                          : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30px', marginBottom: '7px' }}>
                        {isActive && (
                          <div style={{
                            position: 'absolute', width: '48px', height: '48px', borderRadius: '50%',
                            background: hexToRgba(glowColor, 0.18), filter: 'blur(16px)',
                            top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
                          }} />
                        )}
                        <div style={{ position: 'relative', filter: isActive ? `drop-shadow(0 0 5px ${glowColor})` : 'none', transition: 'filter 0.2s ease' }}>
                          <Icon size={isActive ? 20 : 17} stroke={isActive ? glowColor : SILVER} strokeWidth={1.4} fill="none" />
                        </div>
                      </div>
                      <div style={{ fontSize: '8px', fontWeight: '700', color: isActive ? glowColor : SILVER, letterSpacing: '0.5px', transition: 'color 0.2s ease' }}>
                        {isMore && activeVibe ? activeVibe.label.slice(0, 7).toUpperCase() : label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Active vibe badge */}
              <AnimatePresence>
                {activeVibe && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      backgroundColor: hexToRgba(activeVibe.color, 0.1),
                      borderRadius: '12px', padding: '8px 12px',
                      boxShadow: `inset 0 1px 0 ${hexToRgba(activeVibe.color, 0.25)}`,
                    }}
                  >
                    <activeVibe.Icon size={13} stroke={activeVibe.color} strokeWidth={1.5} fill="none" />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: activeVibe.color }}>{activeVibe.label}</span>
                    <span style={{ fontSize: '11px', color: SILVER, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      — {activeVibe.desc}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── SUB-CATEGORY CHIPS ─────────────────────────── */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '7px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
                {chips.map((chip) => {
                  const isChipActive = selectedChip === chip;
                  return (
                    <motion.div
                      key={chip}
                      onClick={() => setSelectedChip(isChipActive ? null : chip)}
                      whileTap={{ scale: 0.93 }}
                      style={{
                        flexShrink: 0,
                        padding: '5px 13px',
                        borderRadius: '99px',
                        fontSize: '11px', fontWeight: '700',
                        cursor: 'pointer',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        background: isChipActive
                          ? hexToRgba(activeCatColor, 0.14)
                          : 'rgba(8,10,16,0.7)',
                        border: `1px solid ${hexToRgba(isChipActive ? activeCatColor : CHAMPAGNE, isChipActive ? 0.55 : 0.16)}`,
                        color: isChipActive ? activeCatColor : SILVER,
                        transition: 'all 0.15s ease',
                        boxShadow: isChipActive
                          ? `0 0 12px ${hexToRgba(activeCatColor, 0.15)}, inset 0 1px 0 ${hexToRgba(activeCatColor, 0.2)}`
                          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {chip}
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            {/* ── WHEN + DURATION ROW ───────────────────────────────── */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 108px', gap: '10px',
              position: 'relative', zIndex: showDatePicker ? 50 : undefined,
            }}>
              <GlassCard
                hover={!showDatePicker}
                style={{ padding: '16px', position: 'relative', overflow: 'visible', ...recessedInput, ...fieldFocusStyle('when', showDatePicker) }}
              >
                <span style={labelStyle}>WHEN</span>
                <div
                  onClick={() => { setShowDatePicker(!showDatePicker); setShowLocPicker(false); }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Clock3 size={15} stroke={SILVER} strokeWidth={1.4} fill="none" style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '13px', fontWeight: when ? '500' : '400',
                    color: when ? '#EDE8DF' : SILVER,
                    flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {when || 'Pick a time'}
                  </span>
                </div>
                {showDatePicker && <DateTimePopover onDone={(val: string) => { setWhen(val); setShowDatePicker(false); }} />}
              </GlassCard>

              <GlassCard hover={false} style={{ padding: '16px 12px', ...recessedInput }}>
                <span style={labelStyle}>DURATION</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={() => setDuration(d => Math.max(1, d - 1))} style={stepperBtn}>−</button>
                  <span style={{
                    fontSize: '15px', color: CHAMPAGNE, fontWeight: '700',
                    minWidth: '34px', textAlign: 'center', display: 'inline-block',
                    transform: durationPop ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: durationGlow,
                    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
                  }}>
                    {duration}h
                  </span>
                  <button onClick={() => setDuration(d => d + 1)} style={stepperBtn}>+</button>
                </div>
              </GlassCard>
            </div>

            {/* ── WHERE + GUESTS ROW ────────────────────────────────── */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 108px', gap: '10px',
              position: 'relative', zIndex: showLocPicker ? 50 : undefined,
            }}>
              <GlassCard
                hover={!showLocPicker}
                style={{ padding: '16px', position: 'relative', minWidth: 0, overflow: 'visible', ...recessedInput, ...fieldFocusStyle('where', showLocPicker) }}
              >
                <span style={labelStyle}>WHERE</span>
                <div
                  onClick={() => { setShowLocPicker(!showLocPicker); setShowDatePicker(false); }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <MapPin size={15} stroke={SILVER} strokeWidth={1.4} fill="none" style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '13px', fontWeight: where ? '500' : '400',
                    color: where ? '#EDE8DF' : SILVER,
                    flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {where || 'Pick a spot'}
                  </span>
                </div>
                {showLocPicker && <LocationPopover onSelect={(val: string) => { setWhere(val); setShowLocPicker(false); }} />}
              </GlassCard>

              <GlassCard hover={false} style={{ padding: '16px 12px', ...recessedInput }}>
                <span style={labelStyle}>GUESTS</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={() => setGuestCount(c => Math.max(1, c - 1))} style={stepperBtn}>−</button>
                  <span style={{
                    fontSize: '15px', color: CHAMPAGNE, fontWeight: '700',
                    minWidth: '34px', textAlign: 'center', display: 'inline-block',
                    transform: guestPop ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: guestGlow,
                    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
                  }}>
                    {guestCount}
                  </span>
                  <button onClick={() => setGuestCount(c => c + 1)} style={stepperBtn}>+</button>
                </div>
              </GlassCard>
            </div>

            {/* ── DESCRIPTION CARD ─────────────────────────────────── */}
            <GlassCard hover={false} style={{ padding: '18px', position: 'relative', zIndex: 10, ...fieldFocusStyle('desc') }} corner="REF // 001">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>DESCRIPTION</span>
                <div style={{
                  display: 'flex', gap: '3px',
                  backgroundColor: 'rgba(20, 27, 46, 0.6)', borderRadius: '10px', padding: '3px',
                }}>
                  <button onClick={() => setAiMode(false)} style={{ ...modeTabStyle(!aiMode), border: 'none' }}>✏️ Write</button>
                  <button onClick={() => setAiMode(true)} style={{ ...modeTabStyle(aiMode), border: 'none' }}>✨ AI</button>
                </div>
              </div>

              {aiMode ? (
                <>
                  <textarea
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onFocus={() => setFocusedField('desc')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Describe your activity idea..."
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      backgroundColor: 'rgba(20, 27, 46, 0.5)',
                      border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px',
                      padding: '14px', color: '#EDE8DF', minHeight: '72px',
                      outline: 'none', fontSize: '14px', resize: 'none', marginBottom: '12px',
                    }}
                  />
                  <button
                    onClick={generateDescription}
                    disabled={aiLoading || !aiPrompt.trim()}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '14px', border: 'none',
                      background: aiLoading || !aiPrompt.trim()
                        ? 'rgba(20, 27, 46, 0.5)'
                        : `linear-gradient(180deg, ${CHAMPAGNE} 0%, ${CHAMPAGNE2} 100%)`,
                      color: aiLoading || !aiPrompt.trim() ? SILVER : OBSIDIAN,
                      fontWeight: '800', cursor: aiLoading ? 'not-allowed' : 'pointer', fontSize: '13px',
                      opacity: !aiPrompt.trim() ? 0.5 : 1, transition: 'all 0.2s',
                    }}
                  >
                    {aiLoading ? '✨ Generating...' : '✨ Generate Description'}
                  </button>
                </>
              ) : (
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onFocus={() => setFocusedField('desc')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="What's the plan?"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    backgroundColor: 'transparent', border: 'none', outline: 'none',
                    color: '#EDE8DF', fontSize: '14px', resize: 'none', minHeight: '80px', lineHeight: '1.6',
                  }}
                />
              )}
            </GlassCard>

            {/* ── REPEAT CARD ───────────────────────────────────────── */}
            <GlassCard hover={false} style={{ padding: '18px' }} corner="SCH // 001">
              <span style={labelStyle}>REPEAT</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['One-time', 'Daily', 'Weekly'].map((type) => (
                  <motion.div
                    key={type}
                    onClick={() => setRepeat(type)}
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '8px 18px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      backgroundColor: repeat === type ? hexToRgba(CHAMPAGNE, 0.12) : 'rgba(20, 27, 46, 0.5)',
                      color: repeat === type ? CHAMPAGNE : SILVER,
                      boxShadow: repeat === type
                        ? `inset 0 1px 0 ${hexToRgba(CHAMPAGNE, 0.25)}, 0 0 12px ${hexToRgba(CHAMPAGNE, 0.1)}`
                        : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {type}
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* ── PUBLISH BUTTON ────────────────────────────────────── */}
            <motion.button
              onClick={onPublish}
              whileHover={{ scale: 1.02, y: -3, boxShadow: publishHoverShadow, transition: { duration: 0.2, ease: 'easeOut' } }}
              whileTap={{ scale: 0.98, y: 0 }}
              style={{
                width: '100%', color: OBSIDIAN,
                border: 'none', padding: '17px', borderRadius: '20px',
                fontWeight: '800', cursor: 'pointer', fontSize: '15px', letterSpacing: '0.06em',
                background: publishBg,
                boxShadow: publishShadow,
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            >
              Publish Activity →
            </motion.button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIVE FEED ────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: SILVER, letterSpacing: '0.15em' }}>LIVE MOVES</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <motion.div
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34D399' }}
            />
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#34D399', letterSpacing: '0.08em' }}>LIVE</span>
          </div>
        </div>

        {liveMoves.map((move: any) => {
          const heat = move.heat ?? 0;
          const intensity = Math.min(heat / 25, 1);
          const glowAlpha = 0.04 + intensity * 0.22;
          const glowBlur = 8 + Math.round(intensity * 28);

          return (
            <GlassCard
              key={move.id}
              hover={false}
              style={{
                padding: '16px 18px',
                marginBottom: '10px',
                boxShadow: `0 0 ${glowBlur}px ${hexToRgba(CHAMPAGNE, glowAlpha)}, 0 4px 16px rgba(0,0,0,0.28)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: CHAMPAGNE }}>{move.author}</span>
                <span style={{ fontSize: '10px', color: SILVER }}>· {move.timeAgo}</span>
              </div>
              <p style={{ fontSize: '17px', fontWeight: '800', color: '#EDE8DF', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                {move.status}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  backgroundColor: OBSIDIAN,
                  border: `1px solid ${hexToRgba(CHAMPAGNE, 0.38)}`,
                  borderRadius: '99px', padding: '3px 10px',
                  fontSize: '9px', fontWeight: '900',
                  color: CHAMPAGNE, letterSpacing: '0.18em',
                }}>
                  {move.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: '700', color: CHAMPAGNE }}>
                  🔥 {heat}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── MORE DRAWER ───────────────────────────────────────── */}
      <AnimatePresence>
        {showMoreDrawer && (
          <>
            <motion.div
              key="more-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreDrawer(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(10,12,18,0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 100,
              }}
            />
            <motion.div
              key="more-drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              style={{
                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 101,
                backgroundColor: 'rgba(14, 18, 30, 0.97)',
                backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '28px 28px 0 0',
                boxShadow: `inset 0 1px 0 ${hexToRgba(CHAMPAGNE, 0.25)}, inset 1px 0 0 rgba(255,255,255,0.06), inset -1px 0 0 rgba(255,255,255,0.06)`,
                padding: '0 20px 40px', maxHeight: '78vh', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.12)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', fontStyle: 'italic', color: CHAMPAGNE, letterSpacing: '0.12em' }}>
                  BERKELEY VIBES
                </span>
                <motion.button
                  onClick={() => setShowMoreDrawer(false)}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                    border: 'none', color: SILVER, borderRadius: '10px', padding: '6px 14px',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  Done
                </motion.button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {BERKELEY_VIBES.map((vibe) => {
                  const isSelected = selectedCategory === vibe.label;
                  return (
                    <motion.div
                      key={vibe.label}
                      onClick={() => handleSelectVibe(vibe)}
                      whileHover={{ y: -4, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.92 }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '6px', cursor: 'pointer',
                        backgroundColor: isSelected ? hexToRgba(vibe.color, 0.20) : 'rgba(20, 27, 46, 0.5)',
                        borderRadius: '18px', padding: '14px 6px 10px',
                        boxShadow: isSelected
                          ? `inset 0 1px 0 ${hexToRgba(vibe.color, 0.45)}, inset 0 0 0 1px ${hexToRgba(vibe.color, 0.18)}, 0 0 18px ${hexToRgba(vibe.color, 0.2)}`
                          : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                        transition: 'all 0.15s ease', minHeight: '72px',
                      }}
                    >
                      <div style={{ filter: isSelected ? `drop-shadow(0 0 5px ${vibe.color})` : 'none', transition: 'filter 0.2s' }}>
                        <vibe.Icon size={18} stroke={isSelected ? vibe.color : SILVER} strokeWidth={1.4} fill="none" />
                      </div>
                      <span style={{
                        fontSize: '8px', fontWeight: '700', color: isSelected ? vibe.color : SILVER,
                        letterSpacing: '0.4px', textAlign: 'center', lineHeight: '1.2',
                      }}>
                        {vibe.label.toUpperCase()}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DiscoveryTab;
