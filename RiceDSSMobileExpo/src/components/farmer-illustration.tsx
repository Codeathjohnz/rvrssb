import React from "react";
import Svg, { Circle, Ellipse, Path, Rect, G } from "react-native-svg";


type Props = {
  size?: number;
};


// Original flat-vector illustration (not a photo) of a Filipino farmer
// wearing a salakot hat and holding a bundle of rice stalks.
export function FarmerIllustration({ size = 140 }: Props) {

  return (

    <Svg width={size} height={size} viewBox="0 0 200 200">

      <Circle cx="100" cy="104" r="92" fill="rgba(255,255,255,0.14)" />

      <Path d="M38 196 Q38 132 100 130 Q162 132 162 196 Z" fill="#F5F0E1" />
      <Path d="M38 196 Q38 132 100 130 Q100 132 78 150 Q52 168 46 196 Z" fill="#2E7D32" />
      <Path d="M162 196 Q162 132 100 130 Q100 132 122 150 Q148 168 154 196 Z" fill="#2E7D32" />

      <Rect x="87" y="100" width="26" height="28" rx="12" fill="#C98A5B" />

      <Circle cx="100" cy="84" r="36" fill="#D69A6C" />
      <Path d="M64 88 Q64 118 92 128 Q70 112 68 88 Z" fill="#C98A5B" opacity="0.5" />

      <Circle cx="87" cy="86" r="3.6" fill="#3E2723" />
      <Circle cx="113" cy="86" r="3.6" fill="#3E2723" />
      <Path d="M85 100 Q100 110 115 100" stroke="#3E2723" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Circle cx="76" cy="94" r="5" fill="#E8956B" opacity="0.55" />
      <Circle cx="124" cy="94" r="5" fill="#E8956B" opacity="0.55" />

      <Path d="M34 70 Q100 2 166 70 Q166 80 142 76 Q100 62 58 76 Q34 80 34 70 Z" fill="#D9A441" />
      <Ellipse cx="100" cy="72" rx="70" ry="13" fill="#C68A2E" />
      <Path d="M46 72 Q100 88 154 72" stroke="#A9701E" strokeWidth="2" fill="none" opacity="0.55" />
      <Circle cx="100" cy="28" r="5" fill="#A9701E" />

      <G>
        <Path d="M148 158 Q168 134 173 100" stroke="#8D6E33" strokeWidth="5" strokeLinecap="round" fill="none" />
        <Ellipse cx="174" cy="96" rx="5.5" ry="10" fill="#E8C468" />
        <Ellipse cx="182" cy="105" rx="5.5" ry="10" fill="#E8C468" transform="rotate(24 182 105)" />
        <Ellipse cx="165" cy="105" rx="5.5" ry="10" fill="#E8C468" transform="rotate(-24 165 105)" />
        <Ellipse cx="174" cy="114" rx="5.5" ry="10" fill="#F2D685" transform="rotate(4 174 114)" />
      </G>

    </Svg>

  );

}
