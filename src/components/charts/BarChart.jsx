import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '../../data/constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200" dir="rtl">
        <p className="font-bold text-[#211551] mb-1">{label}</p>
        <p className="text-gray-600">
          القيمة: <span className="font-bold text-[#211551]">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const BarChart = ({
  data,
  dataKey,
  nameKey = 'name',
  barColor = CHART_COLORS.blue,
  height = 300,
  horizontal = false,
  showGrid = true,
  maxValue: maxValueProp,
  xAxisAngle,
  xAxisHeight,
}) => {
  // Horizontal bar chart using Recharts with RTL labels outside on right
  if (horizontal) {
    const safeData = Array.isArray(data) ? data : [];
    const computedMax = Math.max(
      1,
      ...safeData.map((d) => {
        const v = Number(d?.[dataKey]);
        return Number.isFinite(v) ? v : 0;
      })
    );
    const maxValue = Number.isFinite(Number(maxValueProp)) && Number(maxValueProp) > 0 ? Number(maxValueProp) : computedMax;

    // Keep row alignment deterministic (label always matches its bar)
    // Reserve vertical space for the optional 0–100 axis so items don't get clipped.
    const axisHeight = maxValue === 100 ? 34 : 0;
    const verticalPadding = 10; // breathing room
    const availableHeight = Math.max(120, height - axisHeight - verticalPadding);
    const count = Math.max(1, safeData.length);
    const rowHeight = Math.max(28, Math.floor(availableHeight / count));
    const barHeight = Math.max(14, Math.min(22, rowHeight - 8));

    return (
      <div className="w-full" style={{ height }} dir="rtl">
        <div style={{ height: height - axisHeight }} className="flex flex-col justify-start">
          {safeData.map((item, index) => {
          const raw = Number(item?.[dataKey]);
          const value = Number.isFinite(raw) ? raw : 0;
          const pct = Math.max(0, Math.min(100, (value / maxValue) * 100));

          return (
            <div
              key={`${item?.[nameKey] ?? index}`}
              className="flex items-start gap-3"
              style={{ minHeight: rowHeight }}
            >
              {/* Bar (to the left), grows from right-to-left */}
              <div
                className="flex-1 min-w-0 bg-gray-100 rounded relative overflow-hidden shrink-0"
                style={{ height: barHeight }}
              >
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden="true">
                    <div className="h-full w-full border-t border-b border-dashed border-gray-200" />
                  </div>
                )}
                <div
                  className="absolute right-0 top-0 h-full rounded transition-[width] duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: barColor,
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-semibold">
                  {value}
                </span>
              </div>

              {/* Label (outside, on the right) – full text, wrap up to 2 lines */}
              <div
                className="min-w-52 max-w-60 text-right text-sm text-gray-700 font-medium leading-snug wrap-break-word line-clamp-2"
                title={item?.[nameKey]}
              >
                {item?.[nameKey]}
              </div>
            </div>
          );
          })}
        </div>

        {/* Optional fixed-scale axis (useful for 0–100 KPIs) */}
        {maxValue === 100 && (
          <div className="flex items-center gap-3" style={{ height: axisHeight }}>
            <div className="flex-1 relative h-6">
              <div className="absolute inset-x-0 top-2 border-t border-dashed border-gray-200" />
              <div className="absolute right-0 top-3 text-xs text-gray-500">0</div>
              <div className="absolute right-1/4 top-3 text-xs text-gray-500 -translate-x-1/2">25</div>
              <div className="absolute right-1/2 top-3 text-xs text-gray-500 -translate-x-1/2">50</div>
              <div className="absolute right-3/4 top-3 text-xs text-gray-500 -translate-x-1/2">75</div>
              <div className="absolute left-0 top-3 text-xs text-gray-500">100</div>
            </div>
            <div className="min-w-52 max-w-60" />
          </div>
        )}
      </div>
    );
  }

  // Vertical bar chart (default)
  const angle = typeof xAxisAngle === 'number' ? xAxisAngle : -45;
  const xHeight = typeof xAxisHeight === 'number' ? xAxisHeight : angle === 0 ? 36 : 60;
  const bottomMargin = angle === 0 ? 36 : 60;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: bottomMargin }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
        <XAxis
          dataKey={nameKey}
          tick={{ fill: '#374151', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          angle={angle}
          textAnchor={angle === 0 ? 'middle' : 'end'}
          interval={0}
          height={xHeight}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(33, 21, 81, 0.1)' }} />
        <Bar
          dataKey={dataKey}
          fill={barColor}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={barColor} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
