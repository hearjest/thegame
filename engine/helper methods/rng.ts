function nextRandom(state: number): { value: number; nextState: number } {
  let s = state | 0
  s = (s + 0x6D2B79F5) | 0
  let t = Math.imul(s ^ (s >>> 15), 1 | s)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296 
  return { value, nextState: s }
}

function nextInt(state: number, min: number, max: number): { value: number; nextState: number } {
  const { value, nextState } = nextRandom(state)
  const lo = Math.ceil(min)
  const hi = Math.floor(max)
  return { value: Math.floor(value * (hi - lo + 1)) + lo, nextState }
}

export { nextRandom, nextInt }