import React from 'react';
import { motion } from 'framer-motion';

const orbitColors = [
  '#22c55e', // green
  '#f97316', // orange
  '#a855f7', // purple
  '#3b82f6', // blue
  '#ec4899', // pink
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#ef4444', // red
];

export default function OrbitVisualization({ subscriptions = [], totalYearly = 0 }) {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
  const displaySubs = activeSubscriptions.slice(0, 8);

  return (
    <div className="relative w-full aspect-square max-w-[320px] mx-auto">
      {/* Orbit rings */}
      <div className="absolute inset-[15%] rounded-full border border-white/5" />
      <div className="absolute inset-[30%] rounded-full border border-white/5" />
      <div className="absolute inset-[45%] rounded-full border border-white/10" />
      
      {/* Orbiting dots */}
      {displaySubs.map((sub, index) => {
        const angle = (index * 360) / displaySubs.length;
        const radius = 42; // percentage from center
        const duration = 20 + index * 5;
        const color = sub.color || orbitColors[index % orbitColors.length];
        
        return (
          <motion.div
            key={sub.id}
            className="absolute w-10 h-10 -ml-5 -mt-5"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className="absolute rounded-full flex items-center justify-center shadow-lg cursor-pointer group"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: color,
                transform: `translateX(${radius * 2.4}px)`,
                boxShadow: `0 0 20px ${color}40`,
              }}
              whileHover={{ scale: 1.2 }}
              animate={{
                rotate: [-angle, -angle - 360],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {sub.icon_url ? (
                <img 
                  src={sub.icon_url} 
                  alt={sub.name} 
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {sub.name?.charAt(0).toUpperCase()}
                </span>
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {sub.name}
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Ambient particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}