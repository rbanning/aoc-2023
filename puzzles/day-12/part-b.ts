const cache = {};

export function trimStart(str) {
  return str.startsWith(".") ? str.split(/(?<=\.)(?=[^.])/).slice(1).join("") : str;
}

export function findCombinations(row: string, groups: number[]) {
  const line = row + " " + groups.join(",");
  if (cache[line]) return cache[line];
  if (groups.length <= 0) return Number(!row.includes("#"));
  if (row.length - groups.reduce((a, b) => a + b) - groups.length + 1 < 0) return 0;
  const damagedOrUnknown = !row.slice(0, groups[0]).includes(".");
  if (row.length == groups[0]) return Number(damagedOrUnknown);
  return cache[line] ??= (row[0] != "#" ? findCombinations(trimStart(row.slice(1)), groups) : 0) +
      (damagedOrUnknown && row[groups[0]] != "#" ? findCombinations(trimStart(row.slice(groups[0] + 1)), groups.slice(1)) : 0);
}