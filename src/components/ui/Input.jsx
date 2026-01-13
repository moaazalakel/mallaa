const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#211551] focus:border-transparent outline-none ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        dir="rtl"
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600" dir="rtl">{error}</p>}
    </div>
  );
};

export default Input;
