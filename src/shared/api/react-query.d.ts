import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      /** Identical for every visitor, so it is kept when the signed-in user changes. */
      sessionIndependent?: boolean
    }
  }
}
