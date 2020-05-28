
/**
 * This file defines scales to be used to organize
 * the X and Y dimensions for visualization.
 */

export function linear (divisions) {
  return [...Array(divisions - 1).keys()].map(x => {
    return (x + 1) / divisions
  })
}

export function lucas (divisions) {
  return [...Array(divisions - 1).keys()].map(i => {
    let max = 1000
    let radicand = Math.pow(max, i)
    return Math.pow(radicand, 1 / (divisions - 1)) / 1000
  })
}

export function impallari (divisions) {
  return [0.5]
}
