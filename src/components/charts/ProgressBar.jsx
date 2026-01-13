const ProgressBar = ({ value, max = 100, label, color = 'primary', showValue = true }) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-[#211551]',
    success: 'bg-[#40C676]',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="w-full" dir="rtl">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showValue && (
            <span className="text-sm font-semibold text-[#211551]">
              {value}% / {max}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
