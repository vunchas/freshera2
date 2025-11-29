import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    primary: "bg-softGreen text-forestDark hover:bg-neon hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] shadow-lg font-bold",
    secondary: "bg-forestGreen text-white hover:bg-[#1e5731]",
    outline: "border-2 border-forestGreen text-forestGreen hover:bg-forestGreen hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;