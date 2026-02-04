import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../data/constants';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200" dir="rtl">
        <p className="font-bold text-[#211551] mb-1">{payload[0].payload.name}</p>
        <p className="text-gray-600">
          النتيجة: <span className="font-bold text-[#211551]">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom tick component to position labels well outside the graph to avoid overlap
const CustomTick = ({ payload, x, y, cx, cy }) => {
  const radius = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
  const labelOffset = 42; // Push labels out so they don't overlap the polygon
  const newRadius = radius + labelOffset;
  const angle = Math.atan2(y - cy, x - cx);
  const newX = cx + newRadius * Math.cos(angle);
  const newY = cy + newRadius * Math.sin(angle);
  return (
    <text
      x={newX}
      y={newY}
      fill="#374151"
      fontSize={10}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {payload.value}
    </text>
  );
};

const RadarChart = ({
  data,
  dataKey = 'value',
  nameKey = 'name',
  color = CHART_COLORS.teal,
  height = 350,
  domain = [0, 100],
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart
        data={data}
        margin={{ top: 48, right: 58, bottom: 48, left: 58 }}
        cx="50%"
        cy="50%"
        outerRadius="52%"
      >
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey={nameKey}
          tick={<CustomTick />}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={90}
          domain={domain}
          tick={{ fill: '#9ca3af', fontSize: 9 }}
          tickCount={5}
          axisLine={false}
        />
        <Radar
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;
