import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../data/constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200" dir="rtl">
        <p className="font-bold text-[#211551] mb-1">{label}</p>
        <p className="text-gray-600">
          العدد: <span className="font-bold text-[#211551]">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const LineChart = ({
  data,
  dataKey,
  nameKey = 'name',
  lineColor = CHART_COLORS.blue,
  height = 300,
  showGrid = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
        <XAxis 
          dataKey={nameKey} 
          tick={{ fill: '#374151', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={lineColor} stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={lineColor}
          strokeWidth={2}
          fill="url(#colorGradient)"
          dot={{ fill: lineColor, r: 4, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2, fill: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
