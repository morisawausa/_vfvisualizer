<template lang="html">
  <section id="visualizer-output" class="layout-region">
  <!-- The output from the visualizer's current state
  is continuously update here. -->
    <div
      v-if="!active"
      @click="toggleActive"
      class="activate-output-button">
      Generate Table
    </div>

    <div id="table-output"
      v-bind:class="{'active': active}">

      <div class="button-row">
        <div
          class="design-space-format-button format-button ui-button"
          v-bind:class="{'active': visible == 'designspace'}"
          @click="toDesignspace">
          <span class="centered">.designspace</span>
        </div>

        <div
          class="design-space-format-button"
          v-bind:class="{'active': visible == 'ttx'}"
          @click="toTTX">
          <span class="centered">.ttx</span>
        </div>

        <div
          class="design-space-format-button">
          <span class="centered">Copy Table</span>
        </div>

        <div
          @click="toggleActive"
          class="close-button design-space-format-button">
          <span class="centered">Close</span>
        </div>
      </div>

      <div class="table-output-frame xml">
        <pre><code v-html="(active) ? table() : ''"></code></pre>
        <div class="feather"></div>
      </div>
    </div>
  </section>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import {ttxTable, designspaceTable} from '../store/tables'
import {AXES, GLYPHLIST, CURRENT_AXIS_SETTINGS, CURRENT_SUBSTITUTION, CURRENT_SUBSTITUTION_INDEX, ALL_SUBSTITUTIONS, VALID_STYLISTIC_SETS, STATE_FOR_CELL, SUBSTITUTION_RECTS} from '../store/getters.js'
import {ADD_NEW_SUBSTITUTION, ACTIVATE_SUBSTITUTION, SET_AXIS_DIMENSION_FOR_SUBSTITUTION, SET_AXIS_SUBDIVISIONS_FOR_SUBSTITUTION, SET_STATE_FOR_CELL} from '../store/mutations.js'

const hljs = require('highlight.js/lib/core');
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))

const DESIGNSPACE = 'designspace'
const TTX = 'ttx'

export default {
  data () {
    return {
      active: false,
      visible: 'designspace'
    }
  },
  methods: {
    toggleActive () {
      this.active = !this.active;
    },
    toTTX () {
      this.visible = TTX
    },
    toDesignspace () {
      this.visible = DESIGNSPACE
    },
    table () {
      let axes = this.axes
      let cells = this.substitutionRects()

      if (this.visible === DESIGNSPACE) {

        let output = designspaceTable(axes, cells).join('\n\n')
        return hljs.highlight('xml', output).value

      } else if (this.visible === TTX) {

        let output = ttxTable(axes, cells).join('\n\n')
        return hljs.highlight('xml', output).value

      }
    },
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
      stateForCell: STATE_FOR_CELL,
      substitutionRects: SUBSTITUTION_RECTS
    })
  }
}
</script>

<style lang="scss" scoped>

  .activate-output-button {
    position: absolute;
    top:var(--component-margin);
    right:var(--component-margin);
    background-color: var(--font-color);
    color:var(--background-color);
    min-width: var(--substitution-icon-width);
    padding: var(--component-margin);
    font-family: "Dispatch Mono", monospace;
  }

  #table-output {
      position: absolute;
      top: var(--component-margin);
      left: calc(var(--controls-width) + 2 * var(--component-margin));
      width: calc(100vw - var(--controls-width) - 3 * var(--component-margin));
      height: calc(100vh - 2 * var(--component-margin));

      background-color: var(--background-color);
      border: 1px solid var(--font-color);

      font-family: "Dispatch Mono", monospace;

      transform:translate(200%, 0%);
      transition: transform .4s;

      &.active {
        transform:translate(0%, 0%);
      }
  }

  .button-row {
    width: 100%;
    overflow:auto;

    .design-space-format-button {
      position: relative;
      float:left;
      width:25%;
      height:var(--substitution-box-min-height);
      border-right:1px solid var(--font-color);
      border-bottom: 1px solid var(--font-color);

      &:last-child {
        border-right:none;
      }

      &.active {
        border-bottom: none;
      }
    }
  }

  pre {
    max-width: 80%;
    max-height: 50vh;
    padding:1em;
    padding-bottom:5%;
    margin:5% 10% 5% 10%;

  }

  .table-output-frame {
    position: relative;
    border-bottom:1px solid var(--font-color);
    overflow:scroll;
  }

  .feather {
    position: absolute;
    bottom:0;
    width:100%;
    height:2vh;
  }

  // for highlight.js styles, see variables in App.vue.

</style>
