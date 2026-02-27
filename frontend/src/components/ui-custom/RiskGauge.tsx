interface RiskGaugeProps {
  score: number;
  size?: number;
}

export default function RiskGauge({ score, size = 140 }: RiskGaugeProps) {
  const radius = 50;
  const circumference = Math.PI * radius; // half circle
  const dashOffset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "#ef4444" : score >= 60 ? "#f59e0b" : score >= 40 ? "#0ea5e9" : "#22d3ee";
  const label = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  const labelColor = score >= 80 ? "text-destructive" : score >= 60 ? "text-warning" : score >= 40 ? "text-primary" : "text-success";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox="0 0 120 75">
        {/* Background arc */}
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke="hsl(220 13% 18%)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease", filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        {/* Score text */}
        <text x="60" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Inter">
          {score}
        </text>
      </svg>
      <span className={`text-xs font-bold tracking-wider ${labelColor}`}>{label} RISK</span>
    </div>
  );
}
