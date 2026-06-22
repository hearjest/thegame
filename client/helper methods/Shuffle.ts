import { nextInt } from "./rng"

function shuffle<T>(arr: T[], rngState: number): { result: T[]; nextState: number } {
  const result = [...arr]
  let state = rngState
  for (let i = result.length - 1; i > 0; i--) {
    const r = nextInt(state, 0, i)
    state = r.nextState       
    const j = r.value
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return { result, nextState: state }
}

export { shuffle }