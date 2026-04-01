import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import GlassCard, { bentoGlass } from '../components/GlassCard';

const CATEGORY_COLORS: Record<string, string> = {
  SPORTS:  '#34D399',
  CULTURE: '#A78BFA',
  FOOD:    '#FB923C',
  COFFEE:  '#F3D99A',
  MORE:    '#60A5FA',
};

const parseDateBadge = (whenTime: string): { day: string; month: string } => {
  if (!whenTime) return { day: '—', month: '—' };
  const parts = whenTime.split(' ');
  const month = (parts[0] ?? '').toUpperCase();
  const day = (parts[1] ?? '').replace(',', '').padStart(2, '0');
  return { day, month };
};

// Sticker-style avatar — white border + deterministic tilt
const AvatarBubble = ({
  participant,
  size = 28,
  rotation = 0,
}: {
  participant: any;
  size?: number;
  rotation?: number;
}) => {
  const avatarUrl = participant.profiles?.avatar_url
    ? supabase.storage.from('avatars').getPublicUrl(participant.profiles.avatar_url).data.publicUrl
    : null;
  const initial = participant.profiles?.full_name?.[0]?.toUpperCase() ?? '?';

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: '3px solid #E2D1B3',
      overflow: 'hidden', flexShrink: 0,
      backgroundColor: '#1A283D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: '700', color: '#F3D99A',
      transform: `rotate(${rotation}deg)`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      {avatarUrl
        ? <img src={avatarUrl} alt={initial} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initial
      }
    </div>
  );
};

const BERKELEY_SPOTS = [
  { spot: 'Free Speech Movement Café', icon: '☕', vibe: 'COFFEE' },
  { spot: 'The Glade', icon: '🌿', vibe: 'CHILL' },
  { spot: 'Moffitt Library', icon: '📚', vibe: 'STUDY' },
  { spot: "Bear's Lair", icon: '🍺', vibe: 'SOCIAL' },
];

const VibeSkeletonEmpty = () => (
  <div>
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <motion.p
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ margin: 0, fontSize: '14px', color: '#64748b', fontStyle: 'italic', fontWeight: '600' }}
      >
        Looking for the vibe...
      </motion.p>
    </div>
    <div className="bento-grid">
      {BERKELEY_SPOTS.map((s, i) => (
        <div key={i} style={{ ...bentoGlass, borderRadius: '32px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(226,209,179,0.05)', border: '1px solid rgba(226,209,179,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              {s.icon}
            </div>
            <span style={{ backgroundColor: 'rgba(226,209,179,0.06)', border: '1px solid rgba(226,209,179,0.15)', borderRadius: '20px', padding: '4px 10px', fontSize: '10px', fontWeight: '800', color: 'rgba(226,209,179,0.4)' }}>
              {s.vibe}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'rgba(255,255,255,0.18)', marginBottom: '8px' }}>{s.spot}</div>
            <div className="bento-skeleton" style={{ height: '12px', borderRadius: '8px', marginBottom: '5px' }} />
            <div className="bento-skeleton" style={{ height: '12px', borderRadius: '8px', width: '60%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex' }}>
              {[0, 1, 2].map(j => (
                <div key={j} className="bento-skeleton" style={{ width: '28px', height: '28px', borderRadius: '50%', marginLeft: j > 0 ? -8 : 0 }} />
              ))}
            </div>
            <div className="bento-skeleton" style={{ width: '74px', height: '34px', borderRadius: '12px' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div style={{
    ...bentoGlass,
    borderRadius: '32px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="bento-skeleton" style={{ width: '52px', height: '52px', borderRadius: '16px' }} />
      <div className="bento-skeleton" style={{ width: '68px', height: '22px', borderRadius: '20px' }} />
    </div>
    <div>
      <div className="bento-skeleton" style={{ height: '18px', borderRadius: '8px', marginBottom: '8px', width: '75%' }} />
      <div className="bento-skeleton" style={{ height: '13px', borderRadius: '8px', marginBottom: '4px' }} />
      <div className="bento-skeleton" style={{ height: '13px', borderRadius: '8px', width: '55%' }} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
      <div style={{ display: 'flex' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="bento-skeleton" style={{
            width: '28px', height: '28px', borderRadius: '50%',
            marginLeft: i > 0 ? -8 : 0,
          }} />
        ))}
      </div>
      <div className="bento-skeleton" style={{ width: '74px', height: '34px', borderRadius: '12px' }} />
    </div>
  </div>
);

const EventsTab = () => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url),
          activity_participants(user_id, profiles:user_id(full_name, avatar_url))
        `)
        .order('created_at', { ascending: false });

      if (error) console.error('EventsTab fetch error:', error);
      setEvents(data ?? []);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const handleJoin = async (eventId: string) => {
    if (!user || joining) return;
    setJoining(eventId);

    // Optimistic update
    setEvents(prev => prev.map(e => e.id !== eventId ? e : {
      ...e,
      activity_participants: [
        ...(e.activity_participants ?? []),
        { user_id: user.id, profiles: { full_name: profile?.full_name ?? null, avatar_url: profile?.avatar_url ?? null } },
      ],
    }));

    const { error } = await supabase
      .from('activity_participants')
      .insert({ activity_id: eventId, user_id: user.id });

    if (error) {
      setEvents(prev => prev.map(e => e.id !== eventId ? e : {
        ...e,
        activity_participants: (e.activity_participants ?? []).filter((p: any) => p.user_id !== user.id),
      }));
      console.error('Join error:', error);
    }

    setJoining(null);
  };

  const handleLeave = async (eventId: string) => {
    if (!user || joining) return;
    setJoining(eventId);

    // Optimistic update
    setEvents(prev => prev.map(e => e.id !== eventId ? e : {
      ...e,
      activity_participants: (e.activity_participants ?? []).filter((p: any) => p.user_id !== user.id),
    }));

    const { error } = await supabase
      .from('activity_participants')
      .delete()
      .eq('activity_id', eventId)
      .eq('user_id', user.id);

    if (error) {
      setEvents(prev => prev.map(e => e.id !== eventId ? e : {
        ...e,
        activity_participants: [
          ...(e.activity_participants ?? []),
          { user_id: user.id, profiles: { full_name: profile?.full_name ?? null, avatar_url: profile?.avatar_url ?? null } },
        ],
      }));
      console.error('Leave error:', error);
    }

    setJoining(null);
  };

  return (
    <div>
      {/* SEARCH BAR — Berkeley Blue glass */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{
          flex: 1, ...bentoGlass,
          borderRadius: '16px', padding: '12px 16px',
          color: '#64748b', fontSize: '14px',
        }}>
          🔍 Search events...
        </div>
        <div style={{
          ...bentoGlass,
          borderRadius: '16px', padding: '12px 14px',
          display: 'flex', alignItems: 'center',
        }}>📅</div>
      </div>

      {/* SECTION HEADER — bold italic California Gold */}
      <span style={{
        fontSize: '14px', fontWeight: '900', fontStyle: 'italic',
        color: '#E2D1B3', letterSpacing: '0.12em',
        display: 'block', marginBottom: '16px',
      }}>
        UPCOMING EVENTS
      </span>

      {/* SKELETON LOADING */}
      {loading && (
        <div className="bento-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && events.length === 0 && <VibeSkeletonEmpty />}

      {!loading && events.length > 0 && (
        <div className="bento-grid">
          {events.map((event) => {
            const { day, month } = parseDateBadge(event.when_time);
            const color = CATEGORY_COLORS[event.category] ?? '#60A5FA';
            const creator = event.profiles?.full_name ?? 'Someone';
            const participants: any[] = event.activity_participants ?? [];
            const isJoined = participants.some((p: any) => p.user_id === user?.id);
            const isActing = joining === event.id;
            const facepile = participants.slice(0, 4);
            const overflow = participants.length - 4;

            return (
              <GlassCard
                key={event.id}
                hover={false}
                style={{
                  borderRadius: '32px',
                  padding: '20px',
                  // Obsidian base + specular shimmer; champagne border when joined
                  background: isJoined
                    ? 'linear-gradient(rgba(5,6,8,0.94), rgba(5,6,8,0.94)) padding-box, linear-gradient(135deg, rgba(226,209,179,0.65) 0%, rgba(226,209,179,0.1) 55%) border-box'
                    : 'linear-gradient(rgba(5,6,8,0.92), rgba(5,6,8,0.92)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 30%, transparent 58%) border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {/* TOP ROW: date badge + category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    background:
                      'linear-gradient(rgba(0,30,65,0.6), rgba(0,30,65,0.6)) padding-box, ' +
                      'linear-gradient(135deg, rgba(253,181,21,0.4) 0%, rgba(253,181,21,0) 60%) border-box',
                    border: '1px solid transparent',
                    borderRadius: '14px',
                    width: '52px', height: '52px',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{day}</span>
                    <span style={{ fontSize: '9px', fontWeight: '900', color: '#FDB515', letterSpacing: '0.5px', marginTop: '2px' }}>{month}</span>
                  </div>

                  <span style={{
                    fontSize: '10px', fontWeight: '800', color,
                    backgroundColor: `${color}1A`,
                    padding: '4px 10px', borderRadius: '20px',
                    border: `1px solid ${color}30`,
                  }}>
                    {event.category}
                  </span>
                </div>

                {/* TITLE + META */}
                <div>
                  <h4 className="line-clamp-2" style={{
                    margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800',
                    color: '#fff', lineHeight: '1.35',
                  }}>
                    {event.description}
                  </h4>
                  <p className="line-clamp-2" style={{
                    margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5',
                  }}>
                    📍 {event.where_location}{event.when_time ? ` · 🕒 ${event.when_time}` : ''} · by {creator}
                  </p>
                </div>

                {/* BOTTOM: Sticker Facepile + Join/Leave */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                  {/* Sticker-style facepile */}
                  {participants.length === 0 ? (
                    <span style={{ fontSize: '11px', color: '#475569' }}>No one joined yet</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {facepile.map((p: any, i: number) => (
                          <div key={p.user_id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: facepile.length - i }}>
                            <AvatarBubble
                              participant={p}
                              size={28}
                              rotation={(i % 3 - 1) * 3}
                            />
                          </div>
                        ))}
                        {overflow > 0 && (
                          <div style={{
                            marginLeft: -10, zIndex: 0,
                            width: 28, height: 28, borderRadius: '50%',
                            border: '3px solid #E2D1B3',
                            backgroundColor: '#1A283D',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '9px', fontWeight: '800', color: '#94A3B8',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          }}>
                            +{overflow}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#475569' }}>
                        {participants.length} joined
                      </span>
                    </div>
                  )}

                  {/* Join / Leave button */}
                  <motion.button
                    onClick={() => isJoined ? handleLeave(event.id) : handleJoin(event.id)}
                    disabled={isActing}
                    whileHover={!isActing ? { scale: 1.04, transition: { duration: 0.15 } } : undefined}
                    whileTap={!isActing ? { scale: 0.97 } : undefined}
                    style={{
                      padding: '9px 16px', borderRadius: '14px', flexShrink: 0,
                      fontSize: '12px', fontWeight: '800', letterSpacing: '0.04em',
                      cursor: isActing ? 'default' : 'pointer',
                      border: 'none',
                      background: isJoined
                        ? 'rgba(226,209,179,0.08)'
                        : 'linear-gradient(180deg, #E2D1B3 0%, #C5B496 100%)',
                      color: isJoined ? '#E2D1B3' : '#0A0C12',
                      outline: isJoined ? '1px solid rgba(226,209,179,0.25)' : 'none',
                      opacity: isActing ? 0.55 : 1,
                      boxShadow: isJoined ? 'none' : '0 6px 20px rgba(226,209,179,0.28)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isActing ? '···' : isJoined ? '✓ Joined' : 'Join Move'}
                  </motion.button>

                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsTab;
