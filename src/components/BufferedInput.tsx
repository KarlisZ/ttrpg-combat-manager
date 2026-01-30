import { useEffect, useState } from 'react';
import { parseMathExpression } from '../utils/mathParser';

export const BufferedInput = ({ value, onChange, ariaLabel, className }: { value: number, onChange: (val: number) => void, ariaLabel?: string, className?: string }) => {
    const [buffer, setBuffer] = useState<string>(value.toString());

    useEffect(() => {
        setBuffer(value.toString());
    }, [value]);

    return (
        <input
            type="text"
            aria-label={ariaLabel}
            className={className}
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            onBlur={() => {
                const num = parseMathExpression(buffer);
                onChange(num);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.currentTarget.blur();
                }
            }}
        />
    );
};
