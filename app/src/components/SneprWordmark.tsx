import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface SneprWordmarkProps {
  height?: number;
  color?: string;
  style?: any;
}

export function SneprWordmark({ height = 28, color = '#101012', style }: SneprWordmarkProps) {
  const width = height * (220 / 64);
  return (
    <Svg
      viewBox="0 0 220 64"
      width={width}
      height={height}
      style={style}
    >
      <G
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* s */}
        <Path d="M32 22c-3-3-8-4-12-3s-6 5-4 8 6 3 11 4 10 2 11 6-3 8-9 9-13-1-15-4" />
        {/* n */}
        <Path d="M52 44V22" />
        <Path d="M52 28c3-5 8-7 13-6s9 5 9 11v11" />
        {/* e as open epsilon: three horizontal strokes */}
        <Path d="M88 22h20" />
        <Path d="M92 33h14" />
        <Path d="M88 44h20" />
        {/* p */}
        <Path d="M124 56V22" />
        <Path d="M124 26c4-4 10-5 15-3s8 7 8 12-3 10-8 12-11 1-15-3" />
        {/* r */}
        <Path d="M164 44V22" />
        <Path d="M164 28c2-4 6-6 11-6" />
      </G>
    </Svg>
  );
}
