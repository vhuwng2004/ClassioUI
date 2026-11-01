const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
  [/Android/, "Android"],
  [/iPhone|iPad/, "iOS"],
  [/Mac OS X/, "macOS"],
  [/Windows/, "Windows"],
  [/Linux/, "Linux"],
];

const match = (rules: [RegExp, string][], userAgent: string) =>
  rules.find(([pattern]) => pattern.test(userAgent))?.[1];

/** Tên thiết bị gửi kèm khi đăng nhập, ví dụ "Chrome on macOS". */
export function getDeviceName(): string | undefined {
  const { userAgent } = navigator;
  const browser = match(BROWSERS, userAgent);
  const system = match(SYSTEMS, userAgent);
  return browser && system ? `${browser} on ${system}` : (browser ?? system);
}
