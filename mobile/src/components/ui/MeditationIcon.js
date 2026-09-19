import Svg, { Circle, Path } from "react-native-svg";

function Leaf({ x, y, rotation, color }) {
  return (
    <Path
      d="M0 -8 C 5 -6, 5 6, 0 8 C -5 6, -5 -6, 0 -8 Z"
      fill={color}
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
    />
  );
}

function Sprig({ side, color }) {
  const dir = side === "left" ? -1 : 1;
  const leaves = [0, 1, 2, 3, 4].map((i) => ({
    x: dir * (10 + i * 3),
    y: -30 + i * 15,
    rotation: dir * (35 - i * 4),
  }));
  return (
    <>
      {leaves.map((l, i) => (
        <Leaf key={i} x={l.x} y={l.y} rotation={l.rotation} color={color} />
      ))}
    </>
  );
}

export default function MeditationIcon({ size = 100, color = "#8B7BFF" }) {
  return (
    <Svg width={size} height={size} viewBox="-50 -50 100 100" fill="none">
      <Sprig side="left" color={color} />
      <Sprig side="right" color={color} />

      {/* head */}
      <Circle cx="0" cy="-18" r="8" fill={color} />
      {/* torso */}
      <Path d="M-9 -6 C -9 -14, 9 -14, 9 -6 L 11 10 C 6 14, -6 14, -11 10 Z" fill={color} />
      {/* crossed legs */}
      <Path
        d="M-11 10 C -20 12, -22 20, -14 22 C -6 24, 0 20, 0 20 C 0 20, 6 24, 14 22 C 22 20, 20 12, 11 10 C 6 16, -6 16, -11 10 Z"
        fill={color}
      />
      {/* arms resting on knees */}
      <Path d="M-9 -4 C -16 -2, -19 6, -16 12 C -14 14, -11 13, -11 10 Z" fill={color} />
      <Path d="M9 -4 C 16 -2, 19 6, 16 12 C 14 14, 11 13, 11 10 Z" fill={color} />
    </Svg>
  );
}
