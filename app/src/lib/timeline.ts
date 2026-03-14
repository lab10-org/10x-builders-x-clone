export function buildHomeTimelineTitle(postCount: number): string {
  if (postCount <= 0) {
    return "Inicio";
  }

  return `Inicio · ${postCount} posts`;
}
