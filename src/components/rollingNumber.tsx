import { useEffect, useRef } from 'react';

export default function RollingNumber({ number }:{ number: number|string }) {
  const refs:any = useRef([]);

  useEffect(() => {
    const numStr = number.toString().split('');

    numStr.forEach((digit:any, i) => {
      const el:any = refs.current[i];

      if (el) {
        el.style.transform = `translateY(-${digit * 50}px)`;
      }
    });
  }, [number]);

  const digits = number.toString().split('');

  return (
    <div style={{ display: 'flex' }}>
      {digits.map((_digit, i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '50px',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: '6px',
          }}
        >
          <div
            ref={(el:any) => (refs.current[i] = el)}
            style={{
              position: 'absolute',
              transition: 'transform 0.45s ease-out',
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div
                key={n}
                style={{
                  height: '50px',
                  lineHeight: '50px',
                  textAlign: 'center',
                }}
              >
                {_digit !== '+' ? n : '+'}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
