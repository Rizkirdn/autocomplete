export function levenshteinDistance(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function fuzzySearch(query, items, maxDistance = 3) {
  return items
    .map(item => ({ ...item, distance: levenshteinDistance(query, item.text) }))
    .filter(item => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

export function didYouMean(query, items) {
  if (!query) return null;
  let best = null, bestDist = Infinity;
  for (let item of items) {
    const dist = levenshteinDistance(query, item.text);
    if (dist < bestDist && dist > 0 && dist <= 3) {
      bestDist = dist;
      best = item.text;
    }
  }
  return best;
}