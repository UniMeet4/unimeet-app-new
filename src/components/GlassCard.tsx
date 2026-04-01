import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

// ── Midnight Champagne — Specular Highlight Glass ─────────────────────
// The gradient border uses the padding-box / border-box background trick
// so it works correctly with border-radius. The 135° angle concentrates
// the highlight on the top-left corner, mimicking real glass catching light.
export const bentoGlass: CSSProperties = {
  background:
    'linear-gradient(rgba(30,41,59,0.45), rgba(30,41,59,0.45)) padding-box, ' +
    'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0) 60%) border-box',
  border: '1px solid transparent',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  borderRadius: '24px',
  // Ambient lift shadow — gives each card depth even at rest
  boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
  // Required for absolutely-positioned corner labels
  position: 'relative',
};

// Tiny technical label style — shared constant so it's easy to tune globally
const cornerLabelStyle: CSSProperties = {
  position: 'absolute',
  bottom: '10px',
  right: '12px',
  fontSize: '7px',
  fontWeight: '600',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(136,150,169,0.28)',
  fontFamily: '"Courier New", Courier, monospace',
  userSelect: 'none',
  pointerEvents: 'none',
  lineHeight: 1,
};

interface GlassCardProps {
  children: ReactNode;
  /** Extra inline styles — merged on top of bentoGlass (overrides allowed) */
  style?: CSSProperties;
  onClick?: () => void;
  /** Enable the y: -5 lift + soft champagne glow on hover. Default: true */
  hover?: boolean;
  className?: string;
  /**
   * Optional micro technical label rendered in the bottom-right corner.
   * e.g. 'BERKELEY // CA' or 'REF // 001'
   */
  corner?: string;
}

/**
 * Midnight Champagne luxury glass card.
 *
 * Border: specular highlight (top-left only) via gradient border technique.
 * Hover: lifts 5px + adds a broad soft white-gold emission haze.
 * corner: optional 7px monospace label in the bottom-right (high-end detail).
 */
const GlassCard = ({ children, style, onClick, hover = true, className, corner }: GlassCardProps) => (
  <motion.div
    className={className}
    onClick={onClick}
    whileHover={hover ? {
      y: -5,
      boxShadow:
        '0 12px 36px rgba(0,0,0,0.45), ' +
        '0 0 30px rgba(226,209,179,0.09)',
      transition: { duration: 0.2, ease: 'easeOut' },
    } : undefined}
    style={{ ...bentoGlass, ...style }}
  >
    {children}
    {corner && <span style={cornerLabelStyle}>{corner}</span>}
  </motion.div>
);

export default GlassCard;
