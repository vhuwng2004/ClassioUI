import { createLucideIcon } from "lucide-react";

// Lucide đã vẽ lại icon key với vòng tròn ở trên phải; Figma vẫn dùng bản vòng tròn ở dưới trái.
export const KeyIcon = createLucideIcon("key", [
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "ring" }],
  ["path", { d: "m21 2-2 2", key: "tip" }],
  ["path", { d: "M15.5 7.5l3 3L22 7l-3-3", key: "teeth" }],
  ["path", { d: "M11.39 11.61 15.5 7.5", key: "shaft" }],
]);
