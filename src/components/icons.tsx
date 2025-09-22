import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.5 15.5c.3-.3.5-.7.5-1.1V12h-2v2.4c0 .4.2.8.5 1.1l1.5 1.5" />
      <path d="M4 11V8a4 4 0 0 1 4-4h4" />
      <path d="M5 11H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1" />
      <path d="M19.3 14.5A4.5 4.5 0 0 1 15 20H8a4 4 0 0 1-4-4V8" />
      <path d="M12 2v2" />
      <path d="M18 6V5" />
      <path d="M22 10h-1" />
    </svg>
  );
}
