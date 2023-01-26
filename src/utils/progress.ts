export function progressBar(filled, size = 20) {
  const filled_blocks = Math.floor(Math.max(0, Math.min(filled, 1)) * size)
  console.log(filled, size, filled_blocks)
  return '🟩'.repeat(filled_blocks) + '⬜'.repeat(size - filled_blocks)
}
