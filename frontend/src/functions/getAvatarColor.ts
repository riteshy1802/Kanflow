const avatarColors = [
  "#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db",
  "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50",
  "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b",
  "#7f8c8d", "#95a5a6", "#bdc3c7", "#34495e", "#16a085",
  "#3b5998", "#8b9dc3", "#2c3e50", "#e74c3c", "#9b59b6",
  "#ff6f61", "#6c5ce7", "#00b894", "#0984e3", "#fd79a8",
  "#e17055", "#d63031", "#6c3483", "#5dade2", "#117864",
  "#1f618d", "#512e5f", "#154360", "#7b241c", "#0b5345"
];

export function getColorForName(name: string | null | undefined): string {
  if (!name) return avatarColors[0]; 
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}