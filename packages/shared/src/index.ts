export function formatHandle(handle: string): string {
  if (handle.startsWith("@")) {
    return handle;
  }

  return `@${handle}`;
}
