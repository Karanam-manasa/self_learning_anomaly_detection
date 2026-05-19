import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label, Cell } from 'recharts';
 
const ScoreDistributionChart = ({ results = [], threshold = 0 }) => {
    const numericThreshold = Number(threshold);
  const binData = () => {
    const bins = new Map();
    const binSize = 0.05;
    const binCount = 1 / binSize;
 
    for (let i = 0; i < binCount; i++) {
      const binStart = i * binSize;
      bins.set(binStart.toFixed(2), {
        score: binStart.toFixed(2),
        count: 0,
      });
    }
 
    results.forEach(d => {
      if (d.ensemble_score === 1) { // Handle edge case where score is exactly 1.0
        const binStart = (1 - binSize).toFixed(2);
        const bin = bins.get(binStart);
        if(bin) bin.count++;
      } else {
        const binStart = (Math.floor(d.ensemble_score * binCount) / binCount).toFixed(2);
        const bin = bins.get(binStart);
        if (bin) bin.count++;
      }
    });
 
    return Array.from(bins.values());
  };
 
  const data = binData();
  const maxCount = Math.max(...data.map(d => d.count));
  const yAxisDomainMax = maxCount > 0 ? maxCount * 1.1 : 1; // Add 10% padding, ensure at least 1
  const totalNormalRecords = results.filter(r => r.ensemble_score < numericThreshold).length;
  const totalAnomalyRecords = results.filter(r => r.ensemble_score >= numericThreshold).length;
  const COLORS = { Normal: '#3498db', Anomaly: '#e74c3c' };
  
  const totalRecordsInChart = data.reduce((sum, bin) => sum + bin.count, 0);
  const renderLegend = () => (
     <div style={{ textAlign: 'right', paddingBottom: '10px', color: '#ecf0f1', fontSize: '14px' }}>
      <span style={{ marginRight: '15px' }}>
        <span style={{ color: COLORS.Normal, marginRight: '5px' }}>■</span>
        Normal: {totalNormalRecords}
      </span>
      <span>
        <span style={{ color: COLORS.Anomaly, marginRight: '5px' }}>■</span>
       Anomalies: {totalAnomalyRecords}
      </span>
    </div>
  );
  return (
    <>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
            barGap={0}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#34495e" />
            <XAxis
              type="number"
              dataKey="score"
              domain={[0, 1]}
              ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
              tickFormatter={(tick) => tick.toFixed(1)}
              stroke="#bdc3c7"
              tickLine={false}
              axisLine={false}
              tick={{ dy: 10 }}
              padding={{ left: 20 }}
            >
              <Label value="Ensemble Anomaly Score" position="bottom" dy={30} fill='#bdc3c7' />
            </XAxis>
            <YAxis
              stroke="#bdc3c7"
              domain={[0, yAxisDomainMax]}
              allowDecimals={false}
              tickFormatter={(tick) => Math.floor(tick).toLocaleString()}
              ticks={[
                0, 
                Math.floor(yAxisDomainMax * 0.25), 
                Math.floor(yAxisDomainMax * 0.5), 
                Math.floor(yAxisDomainMax * 0.75), 
                Math.floor(yAxisDomainMax)
              ]}
              width={60}
              tick={{ dx: -5 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(136, 132, 216, 0.2)' }}
              contentStyle={{ backgroundColor: '#2c3e50', border: 'none' }}
              labelStyle={{ color: '#ecf0f1' }}
              formatter={(value, name, props) => [`${value} records`, null]}
              labelFormatter={(label) => `Score Range: ${label} - ${(parseFloat(label) + 0.05).toFixed(2)}`}
            />
            <Legend content={renderLegend} verticalAlign="top" />
            <Bar dataKey="count"> 
                {data.map((entry, index) => {
                    const binCenter = parseFloat(entry.score) + 0.025;
                    let color;
                    // DIAGNOSTIC: Force red for the "0.35" bin to test Cell fill prop
                    if (entry.score === "0.35") {
                        color = COLORS.Anomaly; 
                    } else {
                        color = binCenter < numericThreshold ? COLORS.Normal : COLORS.Anomaly;
                    }
                    return <Cell key={`cell-${index}`} fill={color} />;
                })}
            </Bar>
            {numericThreshold > 0 && (
              <ReferenceLine x={numericThreshold} stroke="#f1c40f" strokeDasharray="5 5" strokeWidth={2}>
                <Label value={`Threshold: ${numericThreshold.toFixed(2)}`} position="top" fill="#f1c40f" offset={5} />
              </ReferenceLine>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
    </>
  );
};
export default ScoreDistributionChart;
      
