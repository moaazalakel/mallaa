import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../data/constants';

const COLORS = [
  '#211551', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const total = payload[0].payload.total || 1;
    const percent = ((payload[0].value / total) * 100).toFixed(1);
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200" dir="rtl">
        <p className="font-bold text-[#211551] mb-1">{payload[0].name}</p>
        <p className="text-gray-600">العدد: <span className="font-bold">{payload[0].value}</span></p>
        <p className="text-gray-500 text-sm">النسبة: <span className="font-bold">{percent}%</span></p>
      </div>
    );
  }
  return null;
};

const PieChart = ({ 
  data, 
  dataKey = 'value', 
  nameKey = 'name', 
  colors = COLORS, 
  height = 300,
  outerRadius = 80,
}) => {
  const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          dataKey={dataKey}
          nameKey={nameKey}
          paddingAngle={2}
        >
          {dataWithTotal.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          iconType="circle"
          iconSize={10}
          formatter={(value) => <span style={{ color: '#374151', fontSize: '12px', marginRight: '8px' }}>{value}</span>}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;
