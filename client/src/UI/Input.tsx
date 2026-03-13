import type { ChangeEventHandler, FC } from 'react';

interface InputProps {
    autofocus?: boolean;
    id?: string;
    className?: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

const Input: FC<InputProps> = ({ ...props }) => {
    const { placeholder, onChange, value, type, id, autofocus, className } =
        props;
    return (
        <input
            className={`
              w-full
              px-4 py-3
              pr-12
              text-sm
              bg-gray-100 dark:bg-[#2a2f3a]
              text-gray-900 dark:text-white
              rounded-2xl
              outline-none
              transition-all duration-200
              border border-transparent
              focus:border-sky-500
              focus:bg-white dark:focus:bg-[#343b4a]
              focus:ring-2 focus:ring-sky-500/30
              placeholder:text-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
              }
              ${className}
            `}
            autoFocus={autofocus}
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
};

export default Input;
