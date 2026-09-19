import Svg, { Circle, Path, Line } from "react-native-svg";

export default function CompassIcon({ size = 34, color = "#8B7BFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="19" stroke={color} strokeWidth="2.5" />
      <Line x1="24" y1="7" x2="24" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="24" y1="37" x2="24" y2="41" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="7" y1="24" x2="11" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="37" y1="24" x2="41" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M30 18L25.5 25.5L18 30L22.5 22.5L30 18Z" fill={color} />
    </Svg>
  );
}
