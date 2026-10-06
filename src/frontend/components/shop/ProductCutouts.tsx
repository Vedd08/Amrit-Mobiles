import React from "react";

export function SmartwatchCutout({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Deep Anodized Titanium Case Gradient */}
        <linearGradient id="watch-case" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(74, 78, 88)" />
          <stop offset="35%" stopColor="rgb(42, 45, 53)" />
          <stop offset="70%" stopColor="rgb(24, 26, 31)" />
          <stop offset="100%" stopColor="rgb(11, 12, 14)" />
        </linearGradient>
        {/* Chamfered Bezel Highlight */}
        <linearGradient id="bezel-rim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(138, 145, 160)" />
          <stop offset="50%" stopColor="rgb(59, 63, 74)" />
          <stop offset="100%" stopColor="rgb(106, 112, 126)" />
        </linearGradient>
        {/* OLED Retina Screen Depth */}
        <radialGradient id="oled-screen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(20, 24, 36)" />
          <stop offset="70%" stopColor="rgb(8, 10, 14)" />
          <stop offset="100%" stopColor="rgb(2, 3, 5)" />
        </radialGradient>
        {/* Glass Specular Glare */}
        <linearGradient id="glass-glare" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="45%" stopColor="white" stopOpacity="0.05" />
          <stop offset="45.1%" stopColor="white" stopOpacity="0.0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.0" />
        </linearGradient>
        {/* Carbon Strap Mesh Pattern */}
        <pattern id="carbon-strap" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0h4v4H0zM4 4h4v4H4z" fill="rgb(27, 29, 34)" />
          <path d="M4 0h4v4H4zM0 4h4v4H0z" fill="rgb(18, 20, 24)" />
        </pattern>
        {/* Activity Ring Neon Gradients */}
        <linearGradient id="ring-danger" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(255, 30, 67)" />
          <stop offset="100%" stopColor="rgb(255, 82, 113)" />
        </linearGradient>
        <linearGradient id="ring-lime" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(0, 229, 255)" />
          <stop offset="100%" stopColor="rgb(0, 255, 102)" />
        </linearGradient>
      </defs>

      {/* Top Telescopic Strap */}
      <g transform="rotate(-25 300 300)">
        {/* Shadow under strap */}
        <rect x="220" y="20" width="160" height="190" rx="16" fill="black" fillOpacity="0.35" />
        {/* Textured Strap Body */}
        <path d="M224 40 C 224 30, 376 30, 376 40 L 366 210 L 234 210 Z" fill="url(#carbon-strap)" stroke="rgb(45, 49, 57)" strokeWidth="2" />
        {/* Strap grooves & adjustment slots */}
        <rect x="270" y="60" width="60" height="10" rx="5" fill="rgb(10, 11, 13)" stroke="rgb(45, 49, 57)" strokeWidth="1.5" />
        <rect x="270" y="90" width="60" height="10" rx="5" fill="rgb(10, 11, 13)" stroke="rgb(45, 49, 57)" strokeWidth="1.5" />
        <rect x="270" y="120" width="60" height="10" rx="5" fill="rgb(10, 11, 13)" stroke="rgb(45, 49, 57)" strokeWidth="1.5" />
        <rect x="270" y="150" width="60" height="10" rx="5" fill="rgb(10, 11, 13)" stroke="rgb(45, 49, 57)" strokeWidth="1.5" />

        {/* Bottom Telescopic Strap */}
        <path d="M234 390 L 366 390 L 376 560 C 376 570, 224 570, 224 560 Z" fill="url(#carbon-strap)" stroke="rgb(45, 49, 57)" strokeWidth="2" />
        {/* Titanium Buckle Hardware */}
        <rect x="260" y="470" width="80" height="24" rx="6" fill="url(#bezel-rim)" stroke="#111" strokeWidth="2" />
        <rect x="294" y="466" width="12" height="32" rx="4" fill="rgb(107, 113, 126)" />

        {/* Watch Chassis (Titanium Casing) */}
        <rect x="150" y="160" width="300" height="280" rx="64" fill="url(#watch-case)" stroke="url(#bezel-rim)" strokeWidth="4" />
        
        {/* Digital Crown & Side Button (Right Side) */}
        <rect x="448" y="210" width="14" height="60" rx="6" fill="url(#bezel-rim)" stroke="rgb(28, 30, 36)" strokeWidth="2" />
        <line x1="450" y1="220" x2="460" y2="220" stroke="#111" strokeWidth="2" />
        <line x1="450" y1="230" x2="460" y2="230" stroke="#111" strokeWidth="2" />
        <line x1="450" y1="240" x2="460" y2="240" stroke="#111" strokeWidth="2" />
        <line x1="450" y1="250" x2="460" y2="250" stroke="#111" strokeWidth="2" />
        <line x1="450" y1="260" x2="460" y2="260" stroke="#111" strokeWidth="2" />
        
        <rect x="448" y="295" width="10" height="48" rx="4" fill="rgb(58, 62, 72)" stroke="rgb(28, 30, 36)" strokeWidth="1.5" />

        {/* Action Button (Left Side - Vibrant Orange/Red) */}
        <rect x="142" y="230" width="8" height="55" rx="4" fill="rgb(255, 85, 0)" stroke="rgb(28, 30, 36)" strokeWidth="1.5" />

        {/* Sapphire Crystal Bezel Rim */}
        <rect x="166" y="176" width="268" height="248" rx="54" fill="rgb(6, 7, 9)" stroke="rgb(43, 47, 58)" strokeWidth="2" />
        
        {/* OLED Retina Screen Display Area */}
        <rect x="174" y="184" width="252" height="232" rx="46" fill="url(#oled-screen)" />

        {/* === SCREEN UI CONTENT (Mature, Professional Telemetry) === */}
        <g transform="translate(174, 184)">
          <text x="24" y="32" fill="rgb(255, 82, 113)" fontSize="13" fontWeight="900" fontFamily="sans-serif">68 BPM ♥</text>
          <text x="180" y="32" fill="rgb(0, 255, 102)" fontSize="13" fontWeight="800" fontFamily="sans-serif">100% ⚡</text>
          
          <circle cx="126" cy="116" r="64" stroke="rgb(28, 33, 46)" strokeWidth="12" fill="none" />
          <path d="M 126 52 A 64 64 0 1 1 68 144" stroke="url(#ring-lime)" strokeWidth="12" strokeLinecap="round" fill="none" />
          
          <circle cx="126" cy="116" r="48" stroke="rgb(28, 33, 46)" strokeWidth="10" fill="none" />
          <path d="M 126 68 A 48 48 0 1 1 92 148" stroke="url(#ring-danger)" strokeWidth="10" strokeLinecap="round" fill="none" />

          <circle cx="126" cy="116" r="6" fill="rgb(255, 255, 255)" />
          <line x1="126" y1="116" x2="160" y2="84" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <line x1="126" y1="116" x2="110" y2="150" stroke="rgb(160, 168, 186)" strokeWidth="4" strokeLinecap="round" />
          <line x1="126" y1="116" x2="126" y2="70" stroke="rgb(255, 85, 0)" strokeWidth="2" strokeLinecap="round" />

          <text x="126" y="210" fill="white" fontSize="26" fontWeight="900" textAnchor="middle" letterSpacing="2" fontFamily="sans-serif">10:09</text>
          <text x="126" y="226" fill="rgb(120, 130, 154)" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="2" fontFamily="sans-serif">SURAT // 24°C</text>
        </g>

        {/* Curved Glass Specular Glare Overlay */}
        <rect x="174" y="184" width="252" height="232" rx="46" fill="url(#glass-glare)" pointerEvents="none" />
      </g>
    </svg>
  );
}

export function HeadphoneCutout({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Brushed Anodized Gunmetal Aluminum */}
        <linearGradient id="hp-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(110, 117, 130)" />
          <stop offset="40%" stopColor="rgb(53, 57, 66)" />
          <stop offset="80%" stopColor="rgb(27, 30, 36)" />
          <stop offset="100%" stopColor="rgb(15, 16, 20)" />
        </linearGradient>
        {/* Polished Chrome Telescopic Rods */}
        <linearGradient id="chrome-rod" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(180, 187, 200)" />
          <stop offset="50%" stopColor="rgb(255, 255, 255)" />
          <stop offset="100%" stopColor="rgb(119, 125, 139)" />
        </linearGradient>
        {/* Plush Matte Acoustic Foam */}
        <radialGradient id="hp-foam" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgb(42, 46, 56)" />
          <stop offset="70%" stopColor="rgb(17, 19, 23)" />
          <stop offset="100%" stopColor="rgb(6, 7, 10)" />
        </radialGradient>
        {/* Vibrant Crimson Ring */}
        <linearGradient id="hp-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(255, 30, 60)" />
          <stop offset="100%" stopColor="rgb(194, 0, 33)" />
        </linearGradient>
      </defs>

      <g transform="translate(0, 20)">
        {/* Deep Ground Contact Shadow */}
        <ellipse cx="300" cy="520" rx="170" ry="24" fill="black" fillOpacity="0.45" filter="blur(10px)" />

        {/* ── MECHANICAL ASSEMBLY (Zero-Gap Integrated Engineering) ── */}
        
        {/* 1. Left Chrome Telescopic Extension Rod (Extending from headband inside earcup assembly) */}
        <rect x="132" y="240" width="16" height="90" rx="8" fill="url(#chrome-rod)" stroke="#111" strokeWidth="1.5" />
        
        {/* 2. Right Chrome Telescopic Extension Rod (Extending from headband inside earcup assembly) */}
        <rect x="452" y="240" width="16" height="90" rx="8" fill="url(#chrome-rod)" stroke="#111" strokeWidth="1.5" />

        {/* 3. Headband Arch (Matte Silicon & Aluminum Chassis) */}
        <path
          d="M 140 260 C 140 90, 460 90, 460 260"
          stroke="url(#hp-metal)"
          strokeWidth="46"
          strokeLinecap="round"
          fill="none"
        />
        {/* Inner Cushion Arch */}
        <path
          d="M 152 250 C 160 115, 440 115, 448 250"
          stroke="rgb(20, 23, 30)"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />
        {/* Crimson Stitching Trim */}
        <path
          d="M 165 240 C 175 130, 425 130, 435 240"
          stroke="url(#hp-red)"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
        />
        
        {/* Hinge Clamping Collars (Locking Rods to Headband) */}
        <rect x="126" y="244" width="28" height="18" rx="6" fill="url(#hp-metal)" stroke="rgb(14, 16, 21)" strokeWidth="2" />
        <rect x="446" y="244" width="28" height="18" rx="6" fill="url(#hp-metal)" stroke="rgb(14, 16, 21)" strokeWidth="2" />

        {/* 4. Left Earcup Assembly (Mechanically interlocked onto rod at y=290 to y=440) */}
        <g>
          {/* Anodized Outer Cup Chassis */}
          <ellipse cx="140" cy="365" rx="55" ry="76" fill="url(#hp-metal)" stroke="rgb(62, 67, 79)" strokeWidth="3" shadow-lg="true" />
          {/* Hinge Pivot Block connecting rod to cup top */}
          <rect x="130" y="284" width="20" height="26" rx="6" fill="url(#hp-metal)" stroke="rgb(10, 11, 14)" strokeWidth="2" />
          <circle cx="140" cy="297" r="4" fill="rgb(180, 187, 200)" stroke="#000" strokeWidth="1" />
          
          {/* Anodized Crimson Accent Chamfer Rim */}
          <ellipse cx="144" cy="365" rx="46" ry="66" fill="none" stroke="url(#hp-red)" strokeWidth="4" />
          {/* Acoustic Memory Foam Cushion Ring */}
          <ellipse cx="148" cy="365" rx="38" ry="56" fill="url(#hp-foam)" stroke="rgb(26, 28, 34)" strokeWidth="2" />
          {/* Interior Speaker Driver Mesh */}
          <ellipse cx="152" cy="365" rx="20" ry="34" fill="rgb(7, 8, 10)" />
          <text x="152" y="370" fill="rgb(59, 64, 78)" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">L</text>
        </g>

        {/* 5. Right Earcup Assembly (Mechanically interlocked onto rod at y=290 to y=440) */}
        <g>
          {/* Anodized Outer Cup Chassis */}
          <ellipse cx="460" cy="365" rx="55" ry="76" fill="url(#hp-metal)" stroke="rgb(62, 67, 79)" strokeWidth="3" shadow-lg="true" />
          {/* Hinge Pivot Block connecting rod to cup top */}
          <rect x="450" y="284" width="20" height="26" rx="6" fill="url(#hp-metal)" stroke="rgb(10, 11, 14)" strokeWidth="2" />
          <circle cx="460" cy="297" r="4" fill="rgb(180, 187, 200)" stroke="#000" strokeWidth="1" />
          
          {/* Anodized Crimson Accent Chamfer Rim */}
          <ellipse cx="456" cy="365" rx="46" ry="66" fill="none" stroke="url(#hp-red)" strokeWidth="4" />
          {/* Acoustic Memory Foam Cushion Ring */}
          <ellipse cx="452" cy="365" rx="38" ry="56" fill="url(#hp-foam)" stroke="rgb(26, 28, 34)" strokeWidth="2" />
          {/* Interior Speaker Driver Mesh */}
          <ellipse cx="448" cy="365" rx="20" ry="34" fill="rgb(7, 8, 10)" />
          <text x="448" y="370" fill="rgb(59, 64, 78)" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">R</text>
        </g>
      </g>
    </svg>
  );
}

export function SmartphoneCutout({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Natural Titanium Edge Railing */}
        <linearGradient id="phone-titanium" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(156, 153, 146)" />
          <stop offset="50%" stopColor="rgb(120, 117, 109)" />
          <stop offset="100%" stopColor="rgb(82, 80, 74)" />
        </linearGradient>
        {/* Deep Matte Frosted Glass Rear */}
        <radialGradient id="phone-back-glass" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgb(58, 56, 52)" />
          <stop offset="100%" stopColor="rgb(30, 28, 26)" />
        </radialGradient>
        {/* Sapphire Camera Lens Specular */}
        <radialGradient id="sapphire-lens" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgb(31, 54, 92)" />
          <stop offset="50%" stopColor="rgb(11, 19, 33)" />
          <stop offset="100%" stopColor="rgb(3, 6, 10)" />
        </radialGradient>
        {/* Iridescent Lens Ring Glare */}
        <linearGradient id="lens-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(65, 105, 225)" />
          <stop offset="50%" stopColor="rgb(147, 112, 219)" />
          <stop offset="100%" stopColor="rgb(0, 250, 154)" />
        </linearGradient>
      </defs>

      <g transform="rotate(15 300 300)">
        {/* Realistic Contact Shadow */}
        <rect x="150" y="80" width="280" height="520" rx="54" fill="black" fillOpacity="0.45" filter="blur(12px)" />

        {/* Outer Forged Titanium Chassis Frame */}
        <rect x="160" y="60" width="280" height="520" rx="52" fill="url(#phone-titanium)" stroke="rgb(179, 176, 168)" strokeWidth="2.5" />
        
        {/* Antenna Band Gaps */}
        <line x1="160" y1="130" x2="164" y2="130" stroke="#333" strokeWidth="4" />
        <line x1="436" y1="130" x2="440" y2="130" stroke="#333" strokeWidth="4" />
        <line x1="160" y1="510" x2="164" y2="510" stroke="#333" strokeWidth="4" />
        <line x1="436" y1="510" x2="440" y2="510" stroke="#333" strokeWidth="4" />

        {/* Side Titanium Volume Buttons */}
        <rect x="156" y="170" width="4" height="42" rx="2" fill="url(#phone-titanium)" stroke="rgb(74, 72, 67)" strokeWidth="1" />
        <rect x="156" y="225" width="4" height="42" rx="2" fill="url(#phone-titanium)" stroke="rgb(74, 72, 67)" strokeWidth="1" />
        {/* Side Power Button */}
        <rect x="440" y="200" width="4" height="65" rx="2" fill="url(#phone-titanium)" stroke="rgb(74, 72, 67)" strokeWidth="1" />

        {/* Rear Matte Textured Frosted Glass Panel */}
        <rect x="166" y="66" width="268" height="508" rx="46" fill="url(#phone-back-glass)" stroke="rgb(43, 41, 38)" strokeWidth="2" />

        {/* Pro Camera Plateau Bump */}
        <rect x="186" y="86" width="135" height="135" rx="32" fill="rgb(46, 44, 41)" stroke="rgb(82, 80, 75)" strokeWidth="2" shadow-md="true" />
        
        {/* Main 48MP Sapphire Camera Module (Top Left) */}
        <circle cx="222" cy="122" r="26" fill="rgb(74, 72, 67)" stroke="rgb(126, 122, 113)" strokeWidth="3" />
        <circle cx="222" cy="122" r="21" fill="url(#sapphire-lens)" stroke="url(#lens-ring)" strokeWidth="1.5" />
        <circle cx="216" cy="116" r="5" fill="white" fillOpacity="0.6" />
        <circle cx="222" cy="122" r="8" fill="rgb(10, 11, 14)" />

        {/* Telephoto 5x Sapphire Camera Module (Bottom Left) */}
        <circle cx="222" cy="185" r="26" fill="rgb(74, 72, 67)" stroke="rgb(126, 122, 113)" strokeWidth="3" />
        <circle cx="222" cy="185" r="21" fill="url(#sapphire-lens)" stroke="url(#lens-ring)" strokeWidth="1.5" />
        <circle cx="216" cy="179" r="5" fill="white" fillOpacity="0.6" />
        <circle cx="222" cy="185" r="8" fill="rgb(10, 11, 14)" />

        {/* Ultra-Wide Sapphire Camera Module (Right Center) */}
        <circle cx="284" cy="153" r="26" fill="rgb(74, 72, 67)" stroke="rgb(126, 122, 113)" strokeWidth="3" />
        <circle cx="284" cy="153" r="21" fill="url(#sapphire-lens)" stroke="url(#lens-ring)" strokeWidth="1.5" />
        <circle cx="278" cy="147" r="4" fill="white" fillOpacity="0.6" />
        <circle cx="284" cy="153" r="7" fill="rgb(10, 11, 14)" />

        {/* LiDAR Scanner & TrueTone Flash */}
        <circle cx="284" cy="104" r="9" fill="rgb(255, 248, 220)" stroke="rgb(211, 192, 137)" strokeWidth="2" />
        <circle cx="284" cy="104" r="5" fill="rgb(255, 165, 0)" fillOpacity="0.8" />
        
        {/* LiDAR Black Diamond Sensor */}
        <circle cx="284" cy="202" r="9" fill="rgb(12, 13, 16)" stroke="rgb(58, 56, 52)" strokeWidth="2" />
        <circle cx="284" cy="202" r="3" fill="rgb(28, 31, 43)" />

        {/* Center Brand Emblem (Sleek Geometric Logo) */}
        <circle cx="300" cy="330" r="18" fill="none" stroke="rgb(94, 91, 84)" strokeWidth="3" />
        <circle cx="300" cy="330" r="8" fill="rgb(94, 91, 84)" />

        {/* Specular Diagonal Light Glare over back glass */}
        <path d="M 166 66 L 330 66 L 166 230 Z" fill="white" fillOpacity="0.06" pointerEvents="none" />
      </g>
    </svg>
  );
}

export function EarbudCutout({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bud-case" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgb(64, 69, 82)" />
          <stop offset="60%" stopColor="rgb(30, 32, 39)" />
          <stop offset="100%" stopColor="rgb(11, 12, 14)" />
        </radialGradient>
      </defs>
      <g transform="rotate(-12 250 250)">
        {/* Case Drop Shadow */}
        <ellipse cx="250" cy="410" rx="140" ry="24" fill="black" fillOpacity="0.4" filter="blur(8px)" />
        {/* Charging Case Body */}
        <rect x="110" y="140" width="280" height="220" rx="100" fill="url(#bud-case)" stroke="rgb(82, 87, 102)" strokeWidth="3" />
        {/* Cap Separation Line & Hinge Chrome */}
        <line x1="110" y1="230" x2="390" y2="230" stroke="rgb(8, 9, 11)" strokeWidth="4" />
        <rect x="220" y="226" width="60" height="8" rx="3" fill="rgb(136, 143, 158)" />
        {/* Glowing Green LED Status */}
        <circle cx="250" cy="290" r="5" fill="rgb(0, 255, 102)" filter="drop-shadow(0px 0px 6px rgb(0, 255, 102))" />
        {/* Left Floating Earbud */}
        <g transform="matrix(0.9, 0.4, -0.4, 0.9, 80, -20)">
          <ellipse cx="140" cy="110" rx="36" ry="46" fill="url(#bud-case)" stroke="rgb(82, 87, 102)" strokeWidth="2.5" />
          <path d="M 140 150 L 130 220 C 128 230, 145 235, 148 220 L 160 150 Z" fill="rgb(28, 30, 36)" stroke="rgb(64, 69, 82)" strokeWidth="2" />
          <ellipse cx="125" cy="95" rx="16" ry="24" fill="rgb(5, 6, 7)" />
          <circle cx="150" cy="115" r="4" fill="rgb(255, 30, 67)" />
        </g>
      </g>
    </svg>
  );
}

export function ConsoleCutout({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="console-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(248, 250, 252)" />
          <stop offset="50%" stopColor="rgb(216, 222, 233)" />
          <stop offset="100%" stopColor="rgb(138, 146, 166)" />
        </linearGradient>
        <linearGradient id="console-core" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(15, 17, 23)" />
          <stop offset="100%" stopColor="rgb(3, 4, 6)" />
        </linearGradient>
      </defs>
      <g transform="translate(20, 20)">
        {/* Shadow */}
        <ellipse cx="250" cy="440" rx="160" ry="24" fill="black" fillOpacity="0.45" filter="blur(10px)" />
        
        {/* Center Jet Black Core with LED Glow */}
        <rect x="185" y="50" width="130" height="370" rx="20" fill="url(#console-core)" stroke="rgb(34, 37, 48)" strokeWidth="2" />
        {/* Vibrant Blue Ambient Ventilation LED */}
        <line x1="250" y1="55" x2="250" y2="415" stroke="rgb(0, 162, 255)" strokeWidth="6" filter="drop-shadow(0px 0px 12px rgb(0, 162, 255))" />

        {/* Left Architectural Sculpted White Wing */}
        <path d="M 130 45 Q 210 200, 130 425 L 180 425 Q 240 200, 180 50 Z" fill="url(#console-body)" stroke="rgb(255, 255, 255)" strokeWidth="2" />
        
        {/* Right Architectural Sculpted White Wing */}
        <path d="M 370 45 Q 290 200, 370 425 L 320 425 Q 260 200, 320 50 Z" fill="url(#console-body)" stroke="rgb(255, 255, 255)" strokeWidth="2" />

        {/* Floating Dual Wireless Controller */}
        <g transform="translate(180, 280) rotate(-15)">
          <path d="M 10 30 C 10 0, 70 -10, 110 30 C 150 -10, 210 0, 210 30 C 210 80, 180 110, 160 110 C 140 110, 130 70, 110 70 C 90 70, 80 110, 60 110 C 40 110, 10 80, 10 30 Z" fill="rgb(21, 24, 33)" stroke="rgb(58, 63, 80)" strokeWidth="2" />
          <circle cx="65" cy="45" r="14" fill="rgb(8, 9, 12)" stroke="rgb(74, 80, 100)" strokeWidth="2" />
          <circle cx="155" cy="65" r="14" fill="rgb(8, 9, 12)" stroke="rgb(74, 80, 100)" strokeWidth="2" />
          <rect x="145" y="30" width="8" height="8" rx="2" fill="rgb(255, 30, 67)" />
          <rect x="165" y="30" width="8" height="8" rx="2" fill="rgb(0, 255, 102)" />
          <rect x="155" y="20" width="8" height="8" rx="2" fill="rgb(0, 162, 255)" />
          <rect x="155" y="40" width="8" height="8" rx="2" fill="rgb(255, 199, 0)" />
          <path d="M 85 25 H 135 V 50 H 85 Z" fill="rgb(8, 10, 14)" stroke="rgb(0, 162, 255)" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}

export function VRCutout({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vr-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(42, 45, 55)" />
          <stop offset="50%" stopColor="rgb(17, 19, 24)" />
          <stop offset="100%" stopColor="rgb(5, 6, 8)" />
        </linearGradient>
      </defs>
      <g transform="translate(10, 40)">
        {/* Contact Shadow */}
        <ellipse cx="240" cy="360" rx="180" ry="28" fill="black" fillOpacity="0.4" filter="blur(10px)" />
        {/* Headband Strap */}
        <path d="M 40 180 C 20 80, 460 80, 440 180 L 410 220 C 430 130, 50 130, 70 220 Z" fill="rgb(59, 64, 78)" stroke="rgb(82, 87, 102)" strokeWidth="2" />
        {/* Front Laminated Curved Glass Goggles */}
        <rect x="60" y="150" width="360" height="160" rx="80" fill="url(#vr-glass)" stroke="rgb(93, 99, 117)" strokeWidth="3" />
        {/* Internal Optical Tracking Sensors & Laser Strip */}
        <rect x="110" y="218" width="260" height="6" rx="3" fill="rgb(0, 255, 102)" filter="drop-shadow(0px 0px 10px rgb(0, 255, 102))" />
        <circle cx="140" cy="220" r="16" fill="rgb(8, 9, 12)" stroke="rgb(63, 68, 82)" strokeWidth="2" />
        <circle cx="140" cy="220" r="8" fill="rgb(26, 32, 44)" stroke="rgb(0, 255, 102)" strokeWidth="1.5" />
        <circle cx="340" cy="220" r="16" fill="rgb(8, 9, 12)" stroke="rgb(63, 68, 82)" strokeWidth="2" />
        <circle cx="340" cy="220" r="8" fill="rgb(26, 32, 44)" stroke="rgb(0, 255, 102)" strokeWidth="1.5" />
        {/* Glass Glare Reflection */}
        <path d="M 70 160 Q 240 200, 410 160 Q 240 180, 70 160 Z" fill="white" fillOpacity="0.15" />
      </g>
    </svg>
  );
}

export function SpeakerCutout({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="spk-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(62, 68, 82)" />
          <stop offset="30%" stopColor="rgb(27, 30, 38)" />
          <stop offset="70%" stopColor="rgb(18, 20, 25)" />
          <stop offset="100%" stopColor="rgb(8, 9, 12)" />
        </linearGradient>
      </defs>
      <g transform="translate(10, 20)">
        {/* Shadow */}
        <ellipse cx="250" cy="430" rx="110" ry="24" fill="black" fillOpacity="0.45" filter="blur(10px)" />
        {/* Acoustic Woven Cylinder Tower */}
        <rect x="140" y="80" width="220" height="340" rx="54" fill="url(#spk-body)" stroke="rgb(74, 80, 96)" strokeWidth="2" />
        {/* Top OLED Siri Waveform Touchplate */}
        <ellipse cx="250" cy="90" rx="95" ry="20" fill="rgb(8, 10, 14)" stroke="rgb(43, 48, 60)" strokeWidth="2" />
        <ellipse cx="250" cy="90" rx="60" ry="12" fill="none" stroke="rgb(0, 162, 255)" strokeWidth="3" filter="drop-shadow(0px 0px 8px rgb(0, 162, 255))" />
        <ellipse cx="250" cy="90" rx="35" ry="7" fill="rgb(0, 229, 255)" filter="drop-shadow(0px 0px 6px rgb(0, 229, 255))" />
        {/* Speaker Acoustic Pattern Lines */}
        <line x1="160" y1="140" x2="340" y2="140" stroke="rgb(34, 38, 48)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="160" y1="180" x2="340" y2="180" stroke="rgb(34, 38, 48)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="160" y1="220" x2="340" y2="220" stroke="rgb(34, 38, 48)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="160" y1="260" x2="340" y2="260" stroke="rgb(34, 38, 48)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="160" y1="300" x2="340" y2="300" stroke="rgb(34, 38, 48)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="160" y1="340" x2="340" y2="340" stroke="rgb(34, 38, 48)" strokeWidth="2" strokeDasharray="4 4" />
      </g>
    </svg>
  );
}
