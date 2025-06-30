export const avatarCharacters = (name: string | undefined | null) => {
  if (!name || typeof name !== "string") return "";
  const avatar = name.trim().split(" ");
  if (avatar.length === 0) return "";
  if (avatar.length === 1) {
    return avatar[0].slice(0, 2).toUpperCase();
  }
  const firstInitial = avatar[0]?.[0] || "";
  const lastInitial = avatar[avatar.length - 1]?.[0] || "";
  return (firstInitial + lastInitial).toUpperCase();
};
