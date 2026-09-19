import type { SVGProps } from "react";



export type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
viewBox: "0 0 24 24",
fill: "none",
stroke: "currentColor",
strokeWidth: 1.75,
strokeLinecap: "round" as const,
strokeLinejoin: "round" as const,
"aria-hidden": true,
focusable: "false",
};

export function GridIcon(props: IconProps) {
return (
    <svg {...baseProps} {...props}>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
);
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 5.5h16v10H10.5L6 19v-3.5H4z" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M15.5 5.5c1.4.3 2.5 1.6 2.5 3.1s-1.1 2.8-2.5 3.1" />
      <path d="M15 14c2.4.4 4.5 2.2 4.5 5" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 20.5s6.5-6.1 6.5-11A6.5 6.5 0 0 0 5.5 9.5c0 4.9 6.5 11 6.5 11Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.8" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 16v-4.5A6 6 0 0 1 12 5.5a6 6 0 0 1 6 6V16" />
      <path d="M4.5 16h15" />
      <path d="M10.2 19a1.9 1.9 0 0 0 3.6 0" />
    </svg>
  );
}

export function GraduationCapIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M2.5 9.5 12 5l9.5 4.5-9.5 4.5-9.5-4.5Z" />
      <path d="M6.5 11.6v4c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4" />
      <path d="M21 9.5v5.2" />
    </svg>
  );
}

export function ReportIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6.5 3.5h8l3 3v14h-11Z" />
      <path d="M14.5 3.5v3h3" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="15.2" x2="15" y2="15.2" />
      <line x1="9" y1="18.4" x2="12.5" y2="18.4" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4.8 8.5A8 8 0 1 1 4 13" />
      <path d="M4.8 4.5v4h4" />
      <path d="M12 8.5v4l3 2" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={2} {...props}>
      <path d="M9 6.5 14.5 12 9 17.5" />
    </svg>
  );
}
