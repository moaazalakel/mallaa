const KPICard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => {
  const colors = {
    primary: 'bg-[#211551] text-white',
    success: 'bg-[#40C676] text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
  };

  return (
    <div className={`${colors[color]} rounded-xl p-6 shadow-lg`} dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium opacity-90">{title}</h3>
        {Icon && <Icon size={24} className="opacity-80" />}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
      {trend && (
        <div className="mt-2 text-xs opacity-80">
          {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

export default KPICard;
