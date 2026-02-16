// Dedicated rank badge component with premium styling for all numeric ranks (1..N)
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  // Top 3 ranks get special trophy/medal styling with visible numbers
  if (rank === 1) {
    return (
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30 border-2 border-yellow-300">
        <Trophy className="w-6 h-6 text-yellow-950 absolute" />
        <span className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 rounded-full bg-yellow-950 text-yellow-100 text-xs font-bold border border-yellow-300">
          1
        </span>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-lg shadow-gray-400/30 border-2 border-gray-200">
        <Medal className="w-6 h-6 text-gray-800 absolute" />
        <span className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-gray-100 text-xs font-bold border border-gray-200">
          2
        </span>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-lg shadow-amber-600/30 border-2 border-amber-400">
        <Award className="w-6 h-6 text-amber-950 absolute" />
        <span className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-950 text-amber-100 text-xs font-bold border border-amber-400">
          3
        </span>
      </div>
    );
  }

  // Ranks 4+ get attractive numbered badges with gradient styling
  return (
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border-2 border-primary/30 shadow-md">
      <span className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
        {rank}
      </span>
    </div>
  );
}
