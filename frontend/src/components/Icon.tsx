import type { SVGProps } from "react";

const paths: Record<string, string> = {
  home: "M4 11.5 12 4l8 7.5M6 10v9.5h5V15h2v4.5h5V10",
  wallet: "M4 7.5h14a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12M16 13.5h3",
  "arrow-down": "M12 4v14m0 0-5-5m5 5 5-5",
  "arrow-up": "M12 20V6m0 0-5 5m5-5 5 5",
  handshake: "M2 12l4-4 4 3 4-3 4 4M2 12l3 5h4l1-2m10-3-3 5h-4l-1-2",
  sack: "M9 4h6l2 5c1.5 2 2 4.5 2 6.5A5 5 0 0 1 14 20h-4a5 5 0 0 1-5-5c0-2 .5-4.5 2-6.5l2-4.5Z",
  file: "M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5",
  log: "M4 6h16M4 12h16M4 18h10",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 20c0-3 3-5.5 7-5.5s7 2.5 7 5.5m1-5.5c3.2.3 5 2.6 5 5.5",
  "chevron-down": "m6 9 6 6 6-6",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m5 14 5-5-5-5m5 5H9",
  bell: "M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Zm3.5 9.5a2.5 2.5 0 0 0 5 0",
  calendar: "M4 5.5h16v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-14Zm0 4h16M8 3v4m8-4v4",
  check: "m4 12.5 5 5L20 6",
  plus: "M12 4v16M4 12h16",
  search: "M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm9.5 15.5-5.4-5.4",
  filter: "M3 5h18M6 12h12M10 19h4",
  download: "M12 3.5v12m0 0-4-4m4 4 4-4M4 19.5h16",
  "x-circle": "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM9 9l6 6m0-6-6 6",
  "alert-triangle": "M12 4 2.5 20h19L12 4Zm0 6.5v4m0 3h.01",
  clock: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 7.5V12l3 2",
  edit: "M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m8.5-8h-2m-13 0h-2m14.36-6.36-1.42 1.42M6.56 17.44l-1.42 1.42m12.72 0-1.42-1.42M6.56 6.56 5.14 5.14",
  copy: "M8 8h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm-3 8H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
  eye: "M2 12S5.5 5.5 12 5.5 22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Zm10 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  "eye-off":
    "M3 3l18 18M10.6 5.6A11 11 0 0 1 12 5.5c6.5 0 10 6.5 10 6.5a15 15 0 0 1-3.2 3.9M6.5 6.7C3.8 8.5 2 12 2 12s3.5 6.5 10 6.5c1.3 0 2.5-.2 3.6-.6M9.9 9.9a3.5 3.5 0 0 0 4.6 4.6",
};

export function Icon({
  name,
  className,
  ...props
}: { name: keyof typeof paths } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
