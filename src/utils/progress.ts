export function progressBar(filled, size = 20, filledIcon = '🟩', emptyIcon = '⬜') {
  return filledIcon.repeat(filled) + emptyIcon.repeat(Math.max(0, size - filled))
}
