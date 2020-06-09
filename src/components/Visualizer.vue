<template lang="html">
  <section id="visualizer" class="layout-region">
    <div
      id="visualizer-canvas"
      v-bind:style="alternateStyles">
      <div
        v-for="(row, index) in visualizerCells"
        v-bind:key="index"
        v-bind:style="{height: (row.height * 100) + '%', fontSize: getSizeForSequence}"
        class="visualizer-row">
        <div class="items">
            <div
              v-for="(cell, index) in row.cells"
              v-bind:key="index"
              class="grid-division visualized-font"
              v-bind:class="[
                (cell.x_pos + cell.width == 1) ? 'last-x' : '',
                (cell.y_pos + cell.height == 1) ? 'last-y' : '',
                `alternate-${cell.state}`
              ]"
              v-bind:style="{
                position: 'relative',
                width: (cell.width * 100) + '%',
                '--sequence': `var(--alternate-${cell.state})`
              }"
              @mousemove="coordinates($event, cell)"
              @click="toggleCellState($event, cell)">
              <span v-bind:style="{top: '0%', left: '0%'}" class="grid-glyph-background">
                <span v-bind:style="designSpacePoint(cell, cell.x_variation_setting, cell.y_variation_setting)" class="visualized-font grid-glyph"></span>
              </span>

              <span
                v-if="cell.x_pos + cell.width == 1"
                v-bind:style="{top: '0%', left: '100%'}" class="grid-glyph-background">
                <span v-bind:style="designSpacePoint(cell, cell.x_design_axis.max, cell.y_variation_setting)" class="visualized-font grid-glyph"></span>
              </span>

              <span
                v-if="cell.y_pos + cell.height == 1"
                v-bind:style="{top: '100%', left: '0%'}" class="grid-glyph-background">
                <span v-bind:style="designSpacePoint(cell, cell.x_variation_setting, cell.y_design_axis.max)" class="visualized-font grid-glyph"></span>
              </span>

              <span
                v-if="cell.x_pos + cell.width == 1 && cell.y_pos + cell.height == 1"
                v-bind:style="{top: '100%', left: '100%'}" class="grid-glyph-background">
                <span v-bind:style="designSpacePoint(cell, cell.x_design_axis.max, cell.y_design_axis.max)" class="visualized-font grid-glyph"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import {AXES, GLYPHLIST, CURRENT_AXIS_SETTINGS, CURRENT_SUBSTITUTION, CURRENT_SUBSTITUTION_INDEX, ALL_SUBSTITUTIONS, VALID_STYLISTIC_SETS, STATE_FOR_CELL} from '../store/getters.js'
import {ADD_NEW_SUBSTITUTION, ACTIVATE_SUBSTITUTION, SET_AXIS_DIMENSION_FOR_SUBSTITUTION, SET_AXIS_SUBDIVISIONS_FOR_SUBSTITUTION, SET_STATE_FOR_CELL} from '../store/mutations.js'

export default {
  data () {
    return {

    }
  },
  methods: {
    ...mapMutations({
      setCellState: SET_STATE_FOR_CELL
    }),
    toggleCellState (event, cell) {
      let newState = (cell.state + 1) % this.currentSubstitution.glyphs.length
      let preview = document.getElementById('GlyphView-preview-visualization')

      this.setCellState({
        substitutionIndex: this.currentSubstitutionIndex,
        point: cell.point,
        cellState: newState
      })

      preview.style.setProperty('--sequence', `var(--alternate-${newState})`)
    },
    designSpacePoint (cell, x_setting, y_setting) {
      if (cell.x_design_axis.tag !== cell.y_design_axis.tag) {
        return {
          [`--axis-${cell.x_design_axis.tag}-setting`]: x_setting,
          [`--axis-${cell.y_design_axis.tag}-setting`]: y_setting
        }
      } else {
        return {
          [`--axis-${cell.x_design_axis.tag}-setting`]: y_setting
        }
      }
    },
    getVisualizedPosition (setting, x_pos, y_pos, substitution) {
      let local = [...setting]

      local[substitution.x] = x_pos
      local[substitution.y] = y_pos

      return local
    },
    coordinates(event, cell) {
      // NOTE: Crappy DOM State Modifications are not the way to go with VUE,
      // But since we're not depending on this for state, it seems okay for now.
      let substitution = this.currentSubstitution
      let stylisticSets = this.stylisticSets
      let axes = this.axes

      let bounding = document.getElementById('visualizer-canvas').getBoundingClientRect()
      let preview = document.getElementById('GlyphView-preview-visualization')

      axes.forEach(axis => {
        preview.style.removeProperty(`--axis-${axis.tag}-setting`)
      })

      let x = (event.clientX - bounding.x) / bounding.width
      let y = (event.clientY - bounding.y) / bounding.height

      let xAxis = axes[substitution.x]
      let yAxis = axes[substitution.y]

      preview.style.setProperty(`--axis-${xAxis.tag}-setting`, Math.floor((x * (xAxis.max - xAxis.min)) + xAxis.min))
      preview.style.setProperty(`--axis-${yAxis.tag}-setting`, Math.floor((y * (yAxis.max - yAxis.min)) + yAxis.min))
      preview.style.setProperty(`--sequence`, `var(--alternate-${cell.state})`)
    }
  },
  computed: {
    ...mapGetters({
      axes: AXES,
      substitutions: ALL_SUBSTITUTIONS,
      currentSubstitution: CURRENT_SUBSTITUTION,
      currentSubstitutionIndex: CURRENT_SUBSTITUTION_INDEX,
      currentAxisSetting: CURRENT_AXIS_SETTINGS,
      glyphlist: GLYPHLIST,
      stylisticSets: VALID_STYLISTIC_SETS,
      stateForCell: STATE_FOR_CELL
    }),
    normalizedAxisSetting () {
      let setting = this.currentAxisSetting
      let axes = this.axes

      return setting.map((a, i) => {
        return (a - axes[i].min) / (axes[i].max - axes[i].min)
      });
    },
    visualizerCells () {
      let cells = []
      let substitution = this.currentSubstitution
      let axes = this.axes
      let setting = this.normalizedAxisSetting

      if (typeof substitution !== 'undefined' && typeof axes !== 'undefined') {
        let ys = substitution.divisions[substitution.y]
        let xs = substitution.divisions[substitution.x]

        for (let j = 0, y_pos = 0; j <= ys.length; j += 1) {
          let next_y_pos = (typeof ys[j] !== "undefined") ? ys[j] : 1
          let height = next_y_pos - y_pos

          cells.push([])
          let row = []

          for (let i = 0, x_pos = 0; i <= xs.length; i += 1) {

            let next_x_pos = (typeof xs[i] !== "undefined") ? xs[i] : 1
            let width = next_x_pos - x_pos

            let x_axis = axes[substitution.x]
            let y_axis = axes[substitution.y]

            let x_variation_setting = x_pos*(x_axis.max - x_axis.min) + x_axis.min;
            let y_variation_setting = y_pos*(y_axis.max - y_axis.min) + y_axis.min;

            const point = this.getVisualizedPosition(setting, x_pos, y_pos, substitution)

            row.push({
              x_pos: x_pos,
              y_pos: y_pos,
              width: width,
              height: height,
              x_grid_index: i,
              y_grid_index: j,
              x_design_axis: x_axis,
              y_design_axis: y_axis,
              x_variation_setting: x_variation_setting,
              y_variation_setting: y_variation_setting,
              point: point,
              glyph: substitution.default,
              state: this.stateForCell(this.currentSubstitutionIndex, point)
            })

            x_pos = next_x_pos
          }

          cells.push({height: height, cells: row})

          y_pos = next_y_pos
        }
      }
      return cells;
    },
    textSequence () {
      let substitution = this.currentSubstitution
      if (typeof substitution !== "undefined") {
        return '\"' +
                substitution.left_sequence +
                this.$options.filters.unicode(substitution.default) +
                substitution.right_sequence +
                '\"'
      } else {
        return ""
      }
    },
    getSizeForSequence () {
      let substitution = this.currentSubstitution
      let sequence = substitution.left_sequence + substitution.right_sequence
      return (4 * Math.pow(0.8, sequence.length + substitution.active_subordinates.length)) + 'vw'
    },
    alternateStyles () {
      let current = this.currentSubstitution
      if (typeof current !== 'undefined') {
        return current.glyphs.map((glyph, i) => {
          const active_runs = current.active_subordinates.map(j => current.subordinates[j])
          const active_glyphs = [glyph].concat(active_runs.map(run => run[i]))
          const unicodes = active_glyphs.map(glyph => this.$options.filters.unicode(glyph))

          return `--alternate-${i}: "${ current.left_sequence + unicodes.join('') + current.right_sequence }";`
        }).join(' ')
      } else {
        return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#visualizer {
  --visualizer-width: calc( 100vw - var(--controls-width) - 2 * var(--component-margin));
  position: absolute;
  left: calc(var(--controls-width) + 2 * var(--component-margin));
  width: var(--visualizer-width);
  height: 100vh;

  transition:all;
  transition-duration: .2s;

  font-family: "visualized-font", sans-serif;
}


#visualizer-canvas {
  --base-offset-vh: 20vh;
  --base-offset-vw: 20vw;
  --sequence: "A";

  --size: min(calc(100vh - var(--base-offset-vh)), calc(var(--visualizer-width) - var(--base-offset-vw)));
  position: absolute;
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);

  width: var(--size);
  height: var(--size);
}

.visualizer-row {
  display: flex;
}

.items {
  display: flex;
  flex: 1;
}

.grid-division {
  border-top: 1px solid var(--grid-lines-color);
  border-left: 1px solid var(--grid-lines-color);
  cursor:pointer;

  &:hover {
    border: 1px solid var(--grid-hover-color);
  }
  &.ss20 {
    background-color: var(--grid-hover-color);
  }
}

.grid-glyph-background {
  position: absolute;
  top: 0;
  left: 0;
  width: .5vw;
  height: .5vw;
  border-radius: 50%;
  transform: translate(-50%,-50%);
  background-color: transparent;
}

.grid-glyph {
  position: absolute;
  top:50%;
  left:50%;
  transform: translate(-50%,-50%);
  // font-size: 4vw;

  &:before {
    content: var(--sequence);
  }
}

.last-x {
  border-right: 1px solid var(--grid-lines-color);
}

.last-y {
  border-bottom: 1px solid var(--grid-lines-color);
}

.x-axis {
  width: 100%;
  height: 20px;
  position: absolute;
  top: calc(100% + var(--base-offset-vh) / 4);
  left:0;
  border: 1px solid red;
}

.axis-division {
  --position: 0%;
  --length: 0%;

  position: absolute;
  background-color: yellow;

  &:hover {
      background-color: red;
  }
}

.x-axis-division {
  left: var(--position);
  width: var(--length);
  height: 10px;
}
</style>
