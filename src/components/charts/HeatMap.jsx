import { GOVERNORATES } from '../../data/constants';

const HeatMap = ({ data, height = 300 }) => {
  // data should be array of { governorateId, value }
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  // Get color intensity based on value - using teal/green gradient
  const getColor = (value) => {
    const intensity = value / maxValue;
    if (intensity >= 0.8) return 'bg-[#065f46]'; // dark teal
    if (intensity >= 0.6) return 'bg-[#047857]'; // teal
    if (intensity >= 0.4) return 'bg-[#10b981]'; // emerald
    if (intensity >= 0.2) return 'bg-[#6ee7b7]'; // light emerald
    return 'bg-[#d1fae5]'; // very light green
  };

  const getTextColor = (value) => {
    const intensity = value / maxValue;
    return intensity >= 0.4 ? 'text-white' : 'text-gray-700';
  };

  return (
    <div className="w-full" style={{ minHeight: height }}>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="text-sm text-gray-600">أقل</span>
        <div className="flex gap-1">
          <div className="w-6 h-4 bg-[#d1fae5] rounded"></div>
          <div className="w-6 h-4 bg-[#6ee7b7] rounded"></div>
          <div className="w-6 h-4 bg-[#10b981] rounded"></div>
          <div className="w-6 h-4 bg-[#047857] rounded"></div>
          <div className="w-6 h-4 bg-[#065f46] rounded"></div>
        </div>
        <span className="text-sm text-gray-600">أكثر</span>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {GOVERNORATES.map((gov) => {
          const govData = data.find(d => d.governorateId === gov.id);
          const value = govData?.value || 0;
          return (
            <div
              key={gov.id}
              className={`p-4 rounded-lg ${getColor(value)} ${getTextColor(value)} transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm`}
              title={`${gov.name}: ${value} حالة`}
            >
              <div className="text-center">
                <p className="font-bold text-lg">{value}</p>
                <p className="text-xs mt-1 truncate">{gov.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatMap;
