const SortedSet = require('collections/sorted-set')
// const FastMap = require('collections/fast-map')
// const Combinatorics = require('js-combinatorics')
// const equal = require('array-equal')
const ndarray = require('ndarray')

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
  constructor (divisions) {
    this.divisions = divisions.map(division => { return new SortedSet(division) })
    this.state = this.initial()
  }

  initial () {
    let dimensions = this.divisions.map(x => x.length + 1)
    let locations = dimensions.reduce((a, b) => a * b, 1)
    return ndarray(new Int32Array([...Array(locations).keys()].map(x => 0)), dimensions)
  }

  get (point) {
    let normalized = this.indices(point)
    return this.state.get(...normalized)
  }

  set (point, state) {
    let normalized = this.indices(point)
    this.state.set(...normalized, state)

    return this
  }

  indices (point) {
    return point.map((coordinate, i) => {
      let index = this.divisions[i].indexOf(coordinate)

      if (index === -1) {
        const guess = this.divisions[i].findLeastGreaterThanOrEqual(coordinate)
        if (typeof guess === 'undefined') {
          index = this.divisions[i].length - 1
        } else {
          index = this.divisions[i].indexOf(guess.value)
        }
        return index
      } else {
        return index + 1
      }
    })
  }
}
