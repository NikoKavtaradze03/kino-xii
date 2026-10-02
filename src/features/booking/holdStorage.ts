// Kept per tab, so a refresh in the middle of checkout can resume the countdown.
const key = (sessionId: number) => `kino.hold.${sessionId}`

export const holdStorage = {
  get: (sessionId: number) => sessionStorage.getItem(key(sessionId)),
  set: (sessionId: number, holdId: string) => sessionStorage.setItem(key(sessionId), holdId),
  clear: (sessionId: number) => sessionStorage.removeItem(key(sessionId)),
}
