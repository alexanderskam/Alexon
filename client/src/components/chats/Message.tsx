import { useEffect, useRef, type FC } from 'react';

interface IProps {
    fromMe: boolean;
    text: string;
    date: string;
    _id: string;
    onDelete: (id: string) => void;
    onCheck: (id: string) => void;
    isChecked: boolean;
}

const Message: FC<IProps> = ({
    fromMe,
    text,
    date,
    _id,
    onDelete,
    isChecked,
    onCheck,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const checkedRef = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (
                    !fromMe &&
                    !isChecked &&
                    !checkedRef.current &&
                    entry.isIntersecting
                ) {
                    checkedRef.current = true;
                    onCheck(_id);
                }
            },
            {
                threshold: 0.6,
            },
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [_id, fromMe, isChecked, onCheck]);
    return (
        <div
            ref={ref}
            className={`group relative w-fit max-w-[70%] p-2 rounded-lg m-2 ${
                fromMe ? 'bg-green-300 ml-auto' : 'bg-white'
            }`}
        >
            {fromMe && (
                <button
                    onClick={() => onDelete(_id)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 
                               bg-red-500 text-white text-xs px-2 py-1 rounded 
                               transition cursor-pointer"
                >
                    ✕
                </button>
            )}
            {fromMe && !isChecked && (
                <div className="absolute -left-4 bg-blue-500 px-1 py-1 rounded "></div>
            )}
            <p className="wrap-break-word">{text}</p>
            <p className="text-xs text-gray-600 text-right">
                {new Date(date).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </p>
        </div>
    );
};

export default Message;
