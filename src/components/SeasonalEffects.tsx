import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SeasonalEffectsProps {
  effect: 'snow' | 'halloween' | 'valentine' | 'christmas' | 'songkran' | 'newyear' | 'goldenstar' | 'none' | undefined;
}

interface Particle {
  id: number;
  content: string;
  x: number; // percentage left (0-100)
  size: number; // font-size in px
  delay: number; // in seconds
  duration: number; // in seconds
  rotationStart: number;
  rotationEnd: number;
  scaleStart: number;
  scaleEnd: number;
  type: string;
}

export default function SeasonalEffects({ effect }: SeasonalEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!effect || effect === "none") {
      setParticles([]);
      return;
    }

    // Generate a set of particles based on the selected effect
    const count = effect === "newyear" ? 18 : 25; // Good balance of quantity and performance
    const newParticles: Particle[] = [];

    const getEffectContents = () => {
      switch (effect) {
        case "snow":
          return ["❄️", "❅", "❆", "❄️"];
        case "halloween":
          return ["🎃", "👻", "🦇", "🕸️", "🍬"];
        case "valentine":
          return ["❤️", "💖", "💕", "💘", "💝", "🌸"];
        case "christmas":
          return ["🎅", "🎄", "🎁", "🔔", "⛄", "🦌", "🌟"];
        case "songkran":
          return ["💦", "💧", "🫧", "🌊", "🔫"];
        case "newyear":
          return ["🎆", "🎇", "✨", "🎉", "🥳", "🌟", "🥂"];
        case "goldenstar":
          return ["✨", "⭐", "🌟", "💫", "✨"];
        default:
          return [];
      }
    };

    const contents = getEffectContents();
    if (contents.length === 0) return;

    for (let i = 0; i < count; i++) {
      const content = contents[Math.floor(Math.random() * contents.length)];
      newParticles.push({
        id: i,
        content,
        x: Math.random() * 100, // horizontal start position
        size: Math.random() * 16 + 12, // size between 12px and 28px
        delay: Math.random() * 8, // staggered start delays up to 8s
        duration: Math.random() * 6 + 6, // speed of movement (6s to 12s)
        rotationStart: Math.random() * 360,
        rotationEnd: Math.random() * 360 + 180 * (Math.random() > 0.5 ? 1 : -1),
        scaleStart: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        scaleEnd: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
        type: effect
      });
    }

    setParticles(newParticles);
  }, [effect]);

  if (!effect || effect === "none" || particles.length === 0) return null;

  // Decide how the motion should behave depending on effect type
  const getMotionProps = (p: Particle) => {
    switch (p.type) {
      case "snow":
      case "christmas":
        // Falling downwards with slight side-to-side sway
        return {
          initial: { 
            y: "-10vh", 
            x: `${p.x}vw`, 
            rotate: p.rotationStart, 
            scale: p.scaleStart,
            opacity: 0 
          },
          animate: {
            y: "110vh",
            x: [
              `${p.x}vw`, 
              `${p.x + (p.id % 2 === 0 ? 5 : -5)}vw`, 
              `${p.x}vw`
            ],
            rotate: p.rotationEnd,
            scale: p.scaleEnd,
            opacity: [0, 0.9, 0.9, 0]
          },
          transition: {
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }
        };

      case "valentine":
        // Floating upwards with fading and growing scale
        return {
          initial: { 
            y: "110vh", 
            x: `${p.x}vw`, 
            rotate: p.rotationStart, 
            scale: p.scaleStart,
            opacity: 0 
          },
          animate: {
            y: "-10vh",
            x: [
              `${p.x}vw`, 
              `${p.x + (p.id % 2 === 0 ? 3 : -3)}vw`, 
              `${p.x}vw`
            ],
            rotate: p.rotationEnd,
            scale: [p.scaleStart, p.scaleEnd * 1.3, p.scaleEnd * 0.8],
            opacity: [0, 0.9, 0.9, 0]
          },
          transition: {
            duration: p.duration + 2,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut"
          }
        };

      case "halloween":
        // Eerie drift in random directions (diagonal/floaty)
        const travelUp = p.id % 2 === 0;
        return {
          initial: { 
            y: travelUp ? "110vh" : "-10vh", 
            x: `${p.x}vw`, 
            rotate: p.rotationStart, 
            scale: p.scaleStart,
            opacity: 0 
          },
          animate: {
            y: travelUp ? "-10vh" : "110vh",
            x: [
              `${p.x}vw`, 
              `${(p.x + 15) % 100}vw`, 
              `${p.x}vw`
            ],
            rotate: p.rotationEnd,
            scale: p.scaleEnd,
            opacity: [0, 0.7, 0.7, 0]
          },
          transition: {
            duration: p.duration * 1.5,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }
        };

      case "songkran":
        // Diagonal splash, spraying from left to right bottom, or just diagonal raindrops/splashes
        return {
          initial: { 
            y: "-10vh", 
            x: `${p.x}vw`, 
            rotate: p.rotationStart, 
            scale: p.scaleStart * 0.5,
            opacity: 0 
          },
          animate: {
            y: "110vh",
            x: `${(p.x + 15) % 100}vw`, // slides right
            rotate: p.rotationEnd,
            scale: p.scaleEnd * 1.2,
            opacity: [0, 0.9, 0.9, 0]
          },
          transition: {
            duration: p.duration * 0.7, // falls faster
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }
        };

      case "newyear":
        // Sparkle/pulsing anywhere on the screen
        const randomY = (p.id * 5) % 90 + 5; // vertical positioning
        return {
          initial: { 
            y: `${randomY}vh`, 
            x: `${p.x}vw`, 
            scale: 0,
            opacity: 0 
          },
          animate: {
            scale: [0, p.scaleEnd * 1.5, p.scaleEnd, 0],
            opacity: [0, 1, 1, 0],
            rotate: [0, p.rotationEnd]
          },
          transition: {
            duration: p.duration * 0.4, // short lifespan
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }
        };

      case "goldenstar":
        // Gold dust drifting slowly downwards and twinkling
        return {
          initial: { 
            y: "-10vh", 
            x: `${p.x}vw`, 
            rotate: p.rotationStart, 
            scale: p.scaleStart * 0.5,
            opacity: 0 
          },
          animate: {
            y: "110vh",
            x: [
              `${p.x}vw`, 
              `${p.x + (p.id % 2 === 0 ? 5 : -5)}vw`, 
              `${p.x}vw`
            ],
            rotate: p.rotationEnd,
            scale: [p.scaleStart * 0.5, p.scaleEnd * 1.4, p.scaleStart * 0.3, p.scaleEnd * 1.3, p.scaleStart * 0.5],
            opacity: [0, 0.95, 0.25, 1, 0.25, 0.95, 0]
          },
          transition: {
            duration: p.duration * 1.3, // slow and elegant
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }
        };

      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={`${p.type}-${p.id}`}
            style={{
              position: "absolute",
              fontSize: p.size,
              filter: p.type === "snow" 
                ? "drop-shadow(0 0 4px rgba(255,255,255,0.8))" 
                : p.type === "goldenstar"
                ? "drop-shadow(0 0 8px rgba(250,204,21,0.85))"
                : "drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
            }}
            {...getMotionProps(p)}
          >
            {p.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
