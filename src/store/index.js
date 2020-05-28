import Vue from 'vue'
import Vuex from 'vuex'
const Combinatorics = require('js-combinatorics')

const DEFAULT_SUBDIVISIONS = 5

import {
  META,
  GLYPHLIST,
  AXES,
  ALL_SUBSTITUTIONS,
  CURRENT_SUBSTITUTION,
  CURRENT_SUBSTITUTION_INDEX,
  CURRENT_AXIS_SETTINGS,
  VALID_STYLISTIC_SETS,
  STATE_FOR_CELL,
  SUBSTITUTION_RECTS
} from './getters.js'

import {
  INITIALIZE,
  UPDATE_AXIS_VALUE,
  ADD_NEW_SUBSTITUTION,
  DELETE_SUBSTITUTION,
  ACTIVATE_SUBSTITUTION,
  SET_AXIS_DIMENSION_FOR_SUBSTITUTION,
  SET_AXIS_SUBDIVISIONS_FOR_SUBSTITUTION,
  UPDATE_SEQUENCE_FOR_SUBSTITUTION,
  SET_STATE_FOR_CELL
} from './mutations.js'

import {linear} from './scales.js'

import {Hypercube} from './hypercube.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ui: {
      substitution: -1,
      axisValues: []
    },
    meta: {
      fullName: '',
      familyName: '',
      subfamilyName: '',
      copyright: '',
      stylisticSets: [],
      version: 0,
      numGlyphs: 0,
      numAxes: 0,
      numInstances: 0
    },
    axes: [],
    glyphs: [],
    substitutions: []
  },
  getters: {
    // Constant Getters
    [META] (state, getters) {
      return state.meta
    },
    [GLYPHLIST] (state, getters) {
      return state.glyphs
    },
    [AXES] (state, getters) {
      return state.axes
    },
    [ALL_SUBSTITUTIONS] (state, getters) {
      return state.substitutions
    },
    [CURRENT_SUBSTITUTION] (state, getters) {
      return state.substitutions[state.ui.substitution]
    },
    [CURRENT_SUBSTITUTION_INDEX] (state, getters) {
      return state.ui.substitution
    },
    [CURRENT_AXIS_SETTINGS] (state, getters) {
      return state.ui.axisValues
    },
    [VALID_STYLISTIC_SETS] (state, getters) {
      return state.meta.stylisticSets
    },
    // Parametrized Getters
    [STATE_FOR_CELL] (state, getters) {
      return (substitutionIndex, point) => {
        let substitution = state.substitutions[substitutionIndex]
        if (typeof substitution === 'undefined') { return 0 }
        return substitution.state.get(point)
      }
    },

    [SUBSTITUTION_RECTS] (state, getters) {
      return () => {
        let subs = state.substititions.map(substitution => {
          let hypercube = substitution.state
          let divisions = hypercube.divisions.map(division => division.map(i => i))

          // Generate all possible indices into this hypercube.
          let indices = Combinatorics.cartesianProduct(...hypercube.state.shape.map(length => {
            return [...Array(length).keys()]
          })).toArray()

          // Generate all of the bounded regions inside the hypercube.
          // This gets all non-default cells.
          let cells = indices.map(index => {
            let bounds = index.map((component, i) => {
              let dimension = divisions[i]
              let lower = dimension[component - 1] || 0
              let upper = dimension[component] || 1
              return [lower, upper]
            })

            let coordinates = bounds.map(pair => {
              return pair.map(bound => bound * 2 - 1)
            })

            let state = hypercube.state.get(...index)

            return { bounds, coordinates, state }
          }).filter(x => x.state !== 0);

          return substitution.glyphs.slice(1).map((target_glyph, i) => {

            let target_state = i + 1
            let cells_for_target = cells.filter(x => x.state === target_state)

            return {
              substitution: {glyphs: [substitution.glyphs[0], target_glyph]},
              cells: cells_for_target
            }
          })
        });

        return subs.reduce((a, b) => a.concat(b), [])
      }
    }
  },
  mutations: {
    /**
     * The initialize action is the first action on loading a new
     * font into the application. It extracts the relevant glyph and
     * variations data from the typeface, and sets it up for rendering.
     */
    [INITIALIZE] (state, font) {
      /**
       * To initialize, we start by mapping across the available
       * Unicode points on the font, and getting Glyph objects for
       * each one. We match that  with the glyph name, which is something
       * We're goint to want the user to search for later.
       */
      state.glyphs = font.characterSet.map(pt => {
        return font.glyphForCodePoint(pt)
      })

      let axesData = []

      for (var axisTag in font.variationAxes) {
        let axisData = font.variationAxes[axisTag]
        axisData.tag = axisTag
        axesData.push(axisData)
      }

      state.axes = axesData
      state.ui.axisValues = axesData.map(axis => { return axis.default })

      // TODO: Add handling for variable fonts with less than 2 axes.

      let variationsData = []

      for (var variationName in font.namedVariations) {
        let variationData = font.namedVariations[variationName]
        variationData.name = variationName
        variationsData.push(variationData)
      }

      state.instances = variationsData

      state.meta = {
        postscriptName: font.postscriptName,
        fullName: font.fullName,
        familyName: font.familyName,
        subfamilyName: font.subfamilyName,
        copyright: font.copyright,
        version: font.version,
        numGlyphs: font.numGlyphs,
        numAxes: axesData.length,
        numInstances: variationsData.length
      }

      state.meta.stylisticSets = ['default'].concat(font.availableFeatures.filter(
        feature => {
          const start = feature.indexOf('ss')
          if (start === -1) { return false }
          try {
            let index = parseInt(feature.slice(start + 2))
            return index >= 20
          } catch (e) {
            return false
          }
        }
      ))
    },
    /**
     * This action updates a single axis value to a new value
     * Primarily, this action responds to the sliders in the
     * axis control by updating the current design-point we're
     * looking at.
     */
    [UPDATE_AXIS_VALUE] (state, {index, value}) {
      const axisValues = state.ui.axisValues
      axisValues[index] = value
      state.ui = {...state.ui, axisValues: axisValues}
    },
    /**
     * This action pushes a new substutition object onto the substitutions array
     * Given a glyph object
     */
    [ADD_NEW_SUBSTITUTION] (state, {glyphs}) {
      const substitutions = state.substitutions
      const divisions = state.axes.map(axis => linear(DEFAULT_SUBDIVISIONS))
      const newSubstitution = {
        glyphs: glyphs,
        divisions: divisions,
        x: 0,
        y: 1,
        left_sequence: '',
        right_sequence: '',
        state: new Hypercube(divisions)
      }
      const newLength = substitutions.push(newSubstitution)

      state.substititions = substitutions
      state.ui.substitution = newLength - 1
    },
    /**
     * This action deletes the substitution specified by the given
     * index from the application.
     */
    [DELETE_SUBSTITUTION] (state, {substitutionIndex}) {
      return ''
    },
    /**
     * This action changes the current substitution index to a specified value.
     * passing an index of -1 to this action deactivates all substititions
     */
    [ACTIVATE_SUBSTITUTION] (state, {index}) {
      state.ui.substitution = index
    },
    /**
     * This action updates the dimension for a specific design axis and
     * specific substitition. The substition and design axis are represented
     * as indices into the substitions list and axis list, respectively, while
     * the dimension of visualization is specified by a stirng name, either "x" or "y".
     */
    [SET_AXIS_DIMENSION_FOR_SUBSTITUTION] (state, {substitutionIndex, axisIndex, dimensionName}) {
      let substitutions = state.substitutions
      let substititionToUpdate = substitutions[substitutionIndex]

      substititionToUpdate[dimensionName] = axisIndex

      substitutions[substitutionIndex] = substititionToUpdate

      state.substitutions = substitutions
    },

    /**
     * This action updates the subdivision structure on a given axis to
     * the sequence passed to the action. Subdivision structures represent a
     * list of locations on the line between 0 and 1, each location represents
     * a cut point. The end points 0 and 1 are not included.
     * For example, a n equally-spaced, four subdivision structure is represented
     * as the array [0.25, 0.50, 0.75], indicating the three locations between 0
     * and 1 in which to divide the plane.
     */
    [SET_AXIS_SUBDIVISIONS_FOR_SUBSTITUTION] (state, {substitutionIndex, subdivisions, dimensionName}) {
      let substitutions = state.substitutions
      let substititionToUpdate = substitutions[substitutionIndex]
      let axisIndex = substititionToUpdate[dimensionName]
      let divisions = substititionToUpdate.divisions

      divisions[axisIndex] = subdivisions
      substititionToUpdate.divisions = [...divisions]
      substititionToUpdate.state = new Hypercube(substititionToUpdate.divisions)

      substitutions[substitutionIndex] = substititionToUpdate

      state.substitutions = [...substitutions]
    },

    /**
     * This action updates the flanking sequences of a substitution (that is, the
     * designer-set glyphs that accompany the glyph being substituted for proofing purposes.)
     */
    [UPDATE_SEQUENCE_FOR_SUBSTITUTION] (state, {substitutionIndex, leftSequence, rightSequence}) {
      let substitutions = state.substitutions
      let substitution = substitutions[substitutionIndex]

      substitution.left_sequence = leftSequence
      substitution.right_sequence = rightSequence

      substitutions[substitutionIndex] = substitution
      state.substitutions = [...substitutions]
    },

    /**
     * this action updates a single cell state for a given n-d cell in the
     * specified substitution.
     */
    [SET_STATE_FOR_CELL] (state, {substitutionIndex, point, cellState}) {
      let substitutions = state.substitutions
      let substitution = substitutions[substitutionIndex]

      substitution.state.set(point, cellState)

      substitutions[substitutionIndex] = substitution

      state.substitutions = [...substitutions]
    }
  },
  actions: {
    [INITIALIZE] ({commit}, font) {
      commit(INITIALIZE, font)
    },
    [UPDATE_AXIS_VALUE] ({commit}, payload) {
      commit(UPDATE_AXIS_VALUE, payload)
    },
    [ADD_NEW_SUBSTITUTION] ({commit}, payload) {
      commit(ADD_NEW_SUBSTITUTION, payload)
    },
    [ACTIVATE_SUBSTITUTION] ({commit}, payload) {
      commit(ACTIVATE_SUBSTITUTION, payload)
    }
  }
})
