
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

/**
 * Axes are always interpreted in user coordinates.
 * So bounds should be interpreted as a percentage across user coordinates,
 * This mapping is implemented in the following function.
 */
export function percent2user (bounds, axis) {
  return bounds.map((bound) => {return (axis.max - axis.min) * bound + axis.min})
}

/**
 * Once we have user coordinates, it's easy to map them to normal coordinates
 * according to the OpenType spec.
 */
export function user2norm (bounds, axis) {
  return bounds.map((bound) => {
    if (bound <= axis.default) {
      if (axis.default == axis.min) { return 0 }

      return (bound - axis.min) / (axis.default - axis.min) - 1
    } else {
      if (axis.max == axis.default) { return 1 }

      return (bound - axis.default) / (axis.max - axis.default)
    }
  })
}
