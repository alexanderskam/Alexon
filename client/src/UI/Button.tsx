import type { FC, MouseEventHandler, ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    className?: string;
}

const Button: FC<ButtonProps> = ({ children, ...props }) => {
    const { onClick, disabled, className } = props;

    return (
        <button
            className={`
                flex items-center justify-center gap-2
                rounded-2xl
                px-4 py-2
                bg-gray-100 dark:bg-[#2a2f3a]
                text-gray-900 dark:text-white
                border border-transparent
                cursor-pointer
                transition-all duration-200 ease-in-out
                hover:bg-gray-200 dark:hover:bg-[#343b4a]
                active:scale-[0.97]
                focus:outline-none focus:ring-2 focus:ring-sky-500/30
                disabled:opacity-50 disabled:cursor-not-allowed ${className ? className : ''}
            `}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
