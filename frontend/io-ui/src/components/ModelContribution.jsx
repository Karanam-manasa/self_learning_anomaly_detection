import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from "recharts";

const ModelContribution = ({ result }) => {
  const ae = Math.max(Number(result?.autoencoder_error) || 0, 0);
  const ifs = Math.abs(Number(result?.isolation_forest_score) || 0);

  const data = [
    { name: "Autoencoder", value: ae },
    { name: "Isolation Forest", value: ifs },
  ];

  const COLORS = ["#3b82f6", "#22c55e"];
  const [activeIndex, setActiveIndex] = useState(-1);

  const RADIAN = Math.PI / 180;
  const renderInsideLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const pad = 26;
    const angle = (percent || 0) * Math.PI * 2;
    const micro = angle < 0.12;
    const small = !micro && percent < 0.08;
    const medium = !micro && percent >= 0.08 && percent < 0.15;
    const factor = micro ? 0.25 : small ? 0.38 : medium ? 0.46 : 0.55;
    let r = innerRadius + (outerRadius - innerRadius) * factor;
    r = Math.min(r, outerRadius - pad);
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    const value = Math.round((percent || 0) * 100);
    const percentSize = micro ? 10 : small ? 12 : medium ? 15 : 18;
    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        className="slice-label"
      >
        <tspan fontSize={percentSize} fontWeight="700">{value}%</tspan>
      </text>
    );
  };

  return (
    <div className="card">
      <h3>Model Contribution</h3>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart className="chart-glow">
            <defs>
              <radialGradient id="grad-0" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.2} />
                <stop offset="70%" stopColor={COLORS[0]} stopOpacity={0.6} />
                <stop offset="100%" stopColor={COLORS[0]} stopOpacity={1} />
              </radialGradient>
              <radialGradient id="grad-1" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor={COLORS[1]} stopOpacity={0.2} />
                <stop offset="70%" stopColor={COLORS[1]} stopOpacity={0.6} />
                <stop offset="100%" stopColor={COLORS[1]} stopOpacity={1} />
              </radialGradient>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.0" />
                <stop offset="50%" stopColor="#22c55e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={0}
              outerRadius={90}
              labelLine={false}
              label={renderInsideLabel}
              stroke="#0b1220"
              strokeWidth={2}
              activeIndex={activeIndex}
              activeShape={(props) => (
                <Sector {...props} outerRadius={props.outerRadius + 6} />
              )}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={`url(#grad-${index})`}
                />
              ))}
            </Pie>
            
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: COLORS[0] }}></span>
            Autoencoder
          </div>
          <div className="legend-item">
                        <span className="legend-swatch" style={{ background: COLORS[1] }}></span>
            Isolation Forest
          </div>
        </div>
      </div>
</div>
  );
};

export default ModelContribution;