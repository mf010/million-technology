import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  index?: number;
}

export default function StatCard({ label, value, icon, color = 'text-primary', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-[#1E272E]/60 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 hover:bg-[#1E272E]/80 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
