const SortedSet = require('collections/sorted-set')
const ndarray = require('ndarray')
const DEBUG = false

export function makeRect (divisions) {
  if (divisions.length === 0) {
    return 0
  } else {
    let firstDim = divisions[0]
    return firstDim.map(entries => {
      return makeRect(divisions.slice(1))
    })
  }
}

export class Hypercube {
  constructor (divisions, array=null, shape=null) {
    this.divisions = divisions.map(division => { return new SortedSet(division) })
    this.state = this.initial(array, shape)
  }

  initial (array, shape) {
    console.log(array, shape);
    if (array == null || shape == null) {
      let dimensions = this.divisions.map(x => x.length + 1)
      let locations = dimensions.reduce((a, b) => a * b, 1)
      return ndarray(new Int32Array([...Array(locations).keys()].map(x => 0)), dimensions)
    } else {
      return ndarray(new Int32Array(array), shape)
    }

  }

  get (point) {
    let normalized = this.indices(point)
    return this.state.get(...normalized)
  }

  set (point, state) {
    let normalized = this.indices(point, DEBUG)

    if (DEBUG) {console.log(`h input:`, normalized)}

    this.state.set(...normalized, state)

    return this
  }

  indices (point, debug=false) {
    return point.map((coordinate, i) => {
      let index = this.divisions[i].indexOf(coordinate)

      if (debug) {console.log(`h normalization: passed coordinate (${i}): ${coordinate}`)}
      if (debug) {console.log(`h normalization: index? (${i}): ${index}`)}

      if (index === -1) {
        const guess = this.divisions[i].findLeastGreaterThanOrEqual(coordinate)

        if (typeof guess === 'undefined') {
          index = this.divisions[i].length
        } else {
          if (debug) {console.log(guess)}
          if (debug) {console.log(`h normalization: guessed index (${i}): ${guess.value}`)}
          index = this.divisions[i].indexOf(guess.value)
          if (debug) {console.log(`h normalization: found index (${i}): ${index}`)}
        }
        return index
      } else {
        return index + 1
      }
    })
  }
}
