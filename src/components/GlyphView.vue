<template lang="html">
  <!-- This element renders a management interface for
  displaying all of the substitutions that are available
  for the typeface. -->
  <div
    class="glyph-view"
    v-bind:style="alternateStyles">
    <div
      id="GlyphView-preview-visualization"
      class="visualized-font sequence-for-point"
      v-bind:style="{'fontSize': previewSize, '--sequence': 'var(--alternate-0)'}">
    </div>
    <div class="proof-string-inputs">
      <input
        id="prefix-input"
        class="proof-string-input"
        type="text"
        name=""
        @input="updatePrefix"
        v-bind:placeholder="(hasActiveSubstutution) ? 'Before...' : ''"
        v-bind:disabled="!hasActiveSubstutution"
        v-bind:value="leftSequence">
      <input
        id="suffix-input"
        class="proof-string-input"
        type="text"
        name=""
        @input="updateSuffix"
        v-bind:placeholder="(hasActiveSubstutution) ? 'After...' : ''"
        v-bind:disabled="!hasActiveSubstutution"
        v-bind:value="rightSequence">
    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import {AXES, GLYPHLIST, CURRENT_SUBSTITUTION, CURRENT_SUBSTITUTION_INDEX, ALL_SUBSTITUTIONS, VALID_STYLISTIC_SETS} from '../store/getters.js'
import {UPDATE_SEQUENCE_FOR_SUBSTITUTION} from '../store/mutations.js'

export default {
  data () {
    return {}
  },
  methods: {
    ...mapMutations({
      updateSequence: UPDATE_SEQUENCE_FOR_SUBSTITUTION
    }),
    updatePrefix (event) {
      this.updateSequence({
        substitutionIndex: this.currentSubstitutionIndex,
        leftSequence: event.target.value,
        rightSequence: this.currentSubstitution.right_sequence
      })
    },
    updateSuffix (event) {
      this.updateSequence({
        substitutionIndex: this.currentSubstitutionIndex,
        leftSequence: this.currentSubstitution.left_sequence,
        rightSequence: event.target.value
      })
    },
  },
  computed: {
    ...mapGetters({
      axes: AXES,
      substitutions: ALL_SUBSTITUTIONS,
      currentSubstitution: CURRENT_SUBSTITUTION,
      currentSubstitutionIndex: CURRENT_SUBSTITUTION_INDEX,
      glyphlist: GLYPHLIST,
      stylisticSets: VALID_STYLISTIC_SETS
    }),
    textSequence () {
      let substitution = this.currentSubstitution
      if (typeof substitution !== "undefined") {
        return '\"' +
                substitution.left_sequence +
                this.$options.filters.unicode(substitution.glyphs[0]) +
                substitution.right_sequence +
                '\"'
      } else {
        return ""
      }
    },
    hasActiveSubstutution () {
      return typeof this.currentSubstitution !== 'undefined'
    },
    previewSize () {
      // NOTE: Hacky fitting strategy, but reasonably performant.
      let current = this.currentSubstitution

      if (typeof current !== 'undefined') {
        let sequence = current.left_sequence + current.right_sequence
        let length = sequence.length + current.active_subordinates.length
        let sf = Math.pow(.85, length)
        return (9 * sf) + 'em';
      }

      return '1em';

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
    },
    leftSequence () {
      let current = this.currentSubstitution

      return (typeof current !== 'undefined') ? current.left_sequence : '';
    },
    rightSequence () {
      let current = this.currentSubstitution

      return (typeof current !== 'undefined') ? current.right_sequence : '';
    }
  }
}
</script>

<style lang="scss" scoped>

  .glyph-view {
    border: 1px solid var(--font-color);
    height: auto;
  }

  .sequence-for-point {
    position: relative;
    width: 100%;
    height: var(--glyph-view-height);

    &:before {
      content: var(--sequence);
      position: absolute;
      top:50%;
      left:50%;
      transform: translate(-50%,-50%);


      display:block;
      text-align: center;

      // font-size: 10em;
    }
  }

  .proof-string-inputs {
    width: 100%;
    border-top: 1px solid var(--font-color);
    overflow: auto;
  }

  .proof-string-input {
    float:left;
    height: var(--substitution-box-min-height);
    outline:none;
    padding:0;
    width:calc(var(--controls-width) / 2 - 2px);
    border:0;
    text-align: center;
    font-family: "Dispatch Mono", monospace;
    background-color:var(--background-color);
  }

  #prefix-input {
    border-right:1px solid var(--font-color);
  }
</style>
