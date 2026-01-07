import React from 'react';
import { motion } from 'framer-motion';

const orbitColors = [
  '#06b6d4', // cyan
  '#22d3ee', // teal
  '#3b82f6', // blue
  '#a855f7', // purple
  '#14b8a6', // teal-500
  '#0ea5e9', // sky-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan
];

export default function OrbitVisualization({ subscriptions = [], totalYearly = 0 }) {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
  const displaySubs = activeSubscriptions.slice(0, 8);

  return (
    <div className="relative w-full aspect-square max-w-[320px] mx-auto">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl" />
      
      {/* Orbit rings - submarine sonar style */}
      <div className="absolute inset-[15%] rounded-full border border-cyan-500/10 shadow-inner shadow-cyan-500/5" />
      <div className="absolute inset-[30%] rounded-full border border-cyan-500/20 shadow-inner shadow-cyan-500/10" />
      <div className="absolute inset-[45%] rounded-full border border-cyan-500/30 shadow-inner shadow-cyan-500/20" />
      
      {/* Center content - submarine radar display */}
      <div className="absolute inset-[35%] flex flex-col items-center justify-center text-center z-10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-full border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
        <span className="text-4xl font-bold bg-gradient-to-b from-white to-cyan-200 bg-clip-text text-transparent">
          {activeSubscriptions.length}
        </span>
        <span className="text-xs text-white/60 mt-1">Active</span>
        <div className="mt-2 px-3 py-1 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30">
          <span className="text-sm font-medium text-cyan-400">
            ${totalYearly.toLocaleString()}
          </span>
          <span className="text-xs text-cyan-300/70 ml-1">/yr</span>
        </div>
      </div>

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

      {/* Ambient particles - underwater bubbles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/40 shadow-lg shadow-cyan-400/50"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 2, 1],
            y: [-5, 5, -5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}