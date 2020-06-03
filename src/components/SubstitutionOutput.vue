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
          class="design-space-format-button format-button"
          v-bind:class="{'active': visible == 'ttx'}"
          @click="toTTX">
          <span class="centered">.ttx</span>
        </div>

        <div
          class="control-button format-button">
          <span class="centered">Copy Table</span>
        </div>

        <div
          @click="toggleActive"
          class="close-button control-button format-button">
          <span class="centered">Close</span>
        </div>
      </div>

      <div class="table-output-frame xml">
        <pre><code v-html="(active) ? table() : ''"></code></pre>
        <div class="feather"></div>
      </div>

      <div class="table-output-options">
        <div v-if="visible == 'designspace'" class="text-body">
          <p>
            This is documentation for the .designspace output.
          </p>
        </div>
        <div v-else class="text-body">
          <div class="ttx-base-indices">
            <div class="scripts-offset-index">
              <input
                @input="updateScriptsIndex"
                class="ttx-offset-input"
                type="number"
                min="0"
                v-bind:value="ttx_scripts_index" />
            </div>

            <div class="features-offset-index">
              <input
                @input="updateFeaturesIndex"
                class="ttx-offset-input"
                type="number"
                min="0"
                v-bind:value="ttx_features_index" />
            </div>

            <div class="lookups-offset-index">
              <input
                @input="updateLookupsIndex"
                class="ttx-offset-input"
                type="number"
                min="0"
                v-bind:value="ttx_lookups_index" />
            </div>

            <div class="variations-offset-index">
              <input
                @input="updateVariationsIndex"
                class="ttx-offset-input"
                type="number"
                min="0"
                v-bind:value="ttx_feature_variations_index" />
            </div>
          </div>
          <p>
            This is documentation for the .ttx output.
          </p>
        </div>
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
      visible: 'designspace',
      ttx_scripts_index: 0,
      ttx_features_index: 0,
      ttx_lookups_index: 0,
      ttx_feature_variations_index: 0
    }
  },
  methods: {
    updateScriptsIndex(e) {
      this.ttx_scripts_index = parseInt(e.target.value)
    },
    updateFeaturesIndex(e) {
      this.ttx_features_index = parseInt(e.target.value)
    },
    updateLookupsIndex(e) {
      this.ttx_lookups_index = parseInt(e.target.value)
    },
    updateVariationsIndex(e) {
      this.ttx_feature_variations_index = parseInt(e.target.value)
    },
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

        let output = ttxTable(axes, cells, {
          scripts: this.ttx_scripts_index,
          features: this.ttx_features_index,
          lookups: this.ttx_lookups_index,
          variations: this.ttx_feature_variations_index
        }).join('\n\n')
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
    }),
    instructions () {
      if (this.visible == DESIGNSPACE) {

      } else if (this.visible == TTX) {

      }
    }
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

    .format-button {
      position: relative;
      float:left;
      height:var(--substitution-box-min-height);
      border-right:1px solid var(--font-color);
      border-bottom: 1px solid var(--font-color);
    }

    .design-space-format-button {
      width:32.5%;

      &.active {
        border-bottom: none;
      }
    }

    .control-button {
      width: 17.5%;

      &:last-child {
        border-right:none;
      }
    }
  }

  pre {
    max-width: 90%;
    height: calc(100vh - 2 * var(--substitution-box-min-height) - 4 * var(--component-margin) + 1px);
    padding:1em;
    padding-bottom:5%;
    margin:5% 10% 5% 10%;

  }

  .table-output-frame {
    position: relative;
    float:left;
    width: 65%;
    border-right:1px solid var(--font-color);
    overflow:scroll;
  }

  .table-output-options {
    position: relative;
    float:left;
    width: 35%;
    overflow-y:scroll;

    .text-body {
      max-width: 90%;
      height: calc(100vh - 2 * var(--substitution-box-min-height) - 4 * var(--component-margin) + 1px);
      padding:1em;
      padding-bottom:5%;
      margin:5% 10% 5% 10%;
    }
  }

  .feather {
    position: absolute;
    bottom:0;
    width:100%;
    height:2vh;
  }

  // for highlight.js styles, see variables in App.vue.

</style>
