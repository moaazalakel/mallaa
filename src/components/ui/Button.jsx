const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#211551] text-white hover:bg-[#3b2e79] focus:ring-[#211551]',
    secondary: 'bg-[#3b2e79] text-white hover:bg-[#211551] focus:ring-[#3b2e79]',
    success: 'bg-[#40C676] text-white hover:bg-[#35a862] focus:ring-[#40C676]',
    outline: 'border-2 border-[#211551] text-[#211551] hover:bg-[#211551] hover:text-white focus:ring-[#211551]',
    ghost: 'text-[#211551] hover:bg-gray-100 focus:ring-[#211551]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
