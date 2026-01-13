const Card = ({ children, className = '', title, subtitle, ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-bold text-[#211551] mb-1" dir="rtl">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600" dir="rtl">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
