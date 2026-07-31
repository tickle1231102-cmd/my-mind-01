"use client";

type WateringCanProps = {
  className?: string;
};

/**
 * 코드로 그린 귀여운 물뿌리개 + 물 주기 애니메이션.
 * 새싹/뿌리 캐릭터와 같은 몽글몽글 플랫 SVG 톤.
 */
export function WateringCan({ className = "" }: WateringCanProps) {
  return (
    <div className={`watering-can ${className}`} aria-hidden>
      <style>{`
        .watering-can {
          width: 3.25rem;
          height: 3.75rem;
          position: relative;
          filter: drop-shadow(0 6px 10px rgba(62, 52, 42, 0.18));
        }
        @media (min-width: 640px) {
          .watering-can {
            width: 3.75rem;
            height: 4.25rem;
          }
        }
        .wc-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
          display: block;
        }

        @keyframes wc-enter-pour {
          0% {
            opacity: 0;
            transform: translate(14px, -22px) rotate(-8deg) scale(0.7);
          }
          18% {
            opacity: 1;
            transform: translate(8px, -12px) rotate(-28deg) scale(0.92);
          }
          38% {
            opacity: 1;
            transform: translate(2px, -4px) rotate(-48deg) scale(1);
          }
          72% {
            opacity: 1;
            transform: translate(2px, -4px) rotate(-50deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-6px, 2px) rotate(-38deg) scale(0.92);
          }
        }
        @keyframes wc-wobble {
          0%, 100% { transform: rotate(0deg); }
          40% { transform: rotate(3deg); }
          70% { transform: rotate(-2deg); }
        }
        @keyframes wc-stream {
          0% { opacity: 0; stroke-dashoffset: 28; }
          20% { opacity: 0.9; }
          70% { opacity: 0.75; stroke-dashoffset: 0; }
          100% { opacity: 0; stroke-dashoffset: -8; }
        }
        @keyframes wc-drop {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          15% { opacity: 1; transform: translateY(2px) scale(1); }
          100% { opacity: 0; transform: translateY(26px) scale(0.85); }
        }
        @keyframes wc-splash {
          0% { opacity: 0; transform: scale(0.3); }
          40% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.4); }
        }

        .wc-motion {
          animation: wc-enter-pour 1.25s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
          transform-origin: 70% 40%;
        }
        .wc-body {
          transform-origin: 36px 28px;
          animation: wc-wobble 0.55s ease-in-out 0.35s 2;
        }
        .wc-stream {
          stroke-dasharray: 28;
          stroke-dashoffset: 28;
          animation: wc-stream 0.85s ease-in 0.38s forwards;
        }
        .wc-drop-1 { animation: wc-drop 0.75s ease-in 0.42s forwards; }
        .wc-drop-2 { animation: wc-drop 0.75s ease-in 0.55s forwards; }
        .wc-drop-3 { animation: wc-drop 0.75s ease-in 0.68s forwards; }
        .wc-splash {
          transform-origin: 18px 52px;
          animation: wc-splash 0.55s ease-out 0.85s forwards;
          opacity: 0;
        }
      `}</style>

      <div className="wc-motion">
        <svg
          className="wc-svg"
          viewBox="0 0 64 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wcBody" x1="20" y1="14" x2="52" y2="44">
              <stop offset="0%" stopColor="#FFE08A" />
              <stop offset="100%" stopColor="#F0C04A" />
            </linearGradient>
            <linearGradient id="wcSpout" x1="10" y1="22" x2="28" y2="34">
              <stop offset="0%" stopColor="#F6D56B" />
              <stop offset="100%" stopColor="#E0B84A" />
            </linearGradient>
          </defs>

          {/* water stream + drops (drawn in can's local coords near spout tip) */}
          <g>
            <path
              className="wc-stream"
              d="M14 34 C12 40 11 46 10 52"
              stroke="#8ec5e8"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0"
            />
            <circle className="wc-drop-1" cx="11" cy="38" r="2" fill="#8ec5e8" opacity="0" />
            <circle className="wc-drop-2" cx="9.5" cy="42" r="1.5" fill="#a3d4f0" opacity="0" />
            <circle className="wc-drop-3" cx="12" cy="45" r="1.2" fill="#b8dff7" opacity="0" />
            <g className="wc-splash">
              <circle cx="10" cy="54" r="3.5" fill="#8ec5e8" opacity="0.35" />
              <circle cx="6" cy="52" r="1.4" fill="#a3d4f0" />
              <circle cx="14" cy="53" r="1.2" fill="#b8dff7" />
              <circle cx="10" cy="56.5" r="1" fill="#8ec5e8" />
            </g>
          </g>

          <g className="wc-body">
            {/* handle */}
            <path
              d="M44 18 C54 16 58 24 56 32 C54 38 48 40 44 38"
              stroke="#D4A017"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* body */}
            <ellipse cx="36" cy="30" rx="14" ry="12" fill="url(#wcBody)" />
            <ellipse cx="36" cy="28" rx="10" ry="7" fill="#FFF3C4" opacity="0.55" />
            {/* rim */}
            <ellipse cx="36" cy="20" rx="11" ry="4" fill="#E8C04A" />
            <ellipse cx="36" cy="19.2" rx="8" ry="2.4" fill="#FFF8DC" opacity="0.65" />
            {/* spout */}
            <path
              d="M24 26 C18 24 12 26 10 30 C9 33 12 35 16 34 C20 33 24 30 26 28Z"
              fill="url(#wcSpout)"
            />
            <ellipse cx="11" cy="31" rx="2.2" ry="1.6" fill="#C9A227" />
            {/* cute face on can */}
            <circle cx="33" cy="30" r="1.1" fill="#5a4638" />
            <circle cx="39" cy="30" r="1.1" fill="#5a4638" />
            <path
              d="M34 33.2c1.2 1.2 2.8 1.2 4 0"
              stroke="#5a4638"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <circle cx="30" cy="32.5" r="1.3" fill="#e8a598" opacity="0.65" />
            <circle cx="42" cy="32.5" r="1.3" fill="#e8a598" opacity="0.65" />
          </g>
        </svg>
      </div>
    </div>
  );
}
