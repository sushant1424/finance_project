import { cn } from '@/lib/utils';

const GRADE_COLORS = {
  A: 'text-success',
  B: 'text-primary',
  C: 'text-warning',
  D: 'text-orange-500',
  F: 'text-danger',
};

export default function ScoreRing({ score = 0, grade = 'C', size = 120, className }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-2" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className={GRADE_COLORS[grade] ?? 'text-primary'}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold tabular-nums text-foreground">{score}</p>
        <p className={cn('text-xs font-semibold', GRADE_COLORS[grade])}>Grade {grade}</p>
      </div>
    </div>
  );
}
