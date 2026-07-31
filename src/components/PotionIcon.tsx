type PotionIconProps = {
  className?: string;
};

export function PotionIcon({ className = "h-5 w-5" }: PotionIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M10 3h4M10 3v4.2c0 .5-.16.97-.46 1.36L6.9 12.4A4 4 0 0 0 6 14.9v2.6A3.5 3.5 0 0 0 9.5 21h5A3.5 3.5 0 0 0 18 17.5v-2.6a4 4 0 0 0-.9-2.5l-2.64-3.84A2.3 2.3 0 0 1 14 7.2V3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 15.6c1.1.9 2.3 1.3 4.4 1.3s3.3-.4 4.4-1.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
