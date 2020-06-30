<template>
  <!-- This element renders a management interface for
  displaying all of the substitutions that are available
  for the typeface. -->
  <div class="substitutions-interface">
    <div class="substitution-selector">
      <ul class="substitutions-list">
        <li
          v-for="(substitution, index) in substitutions"
          v-bind:key="index"
          class="substutition-icon">
          <span
            v-bind:class="{'active': index === currentSubstitutionIndex}"
            @click="goToSubstitution($event, index)"
            class="substitution-button glyph-icon visualized-font">
              <span class="centered">{{substitution.glyphs[0] | unicode}}</span>
              <span v-if="substitution.subordinates.length > 0" class="subordinates-count">
                <span class="centered">{{substitution.subordinates.length + 1}}</span>
              </span>
          </span>
        </li>
      </ul>
      <div class="add-substitution-button-box">
        <button
          @click="newSubstitution"
          class="add-substitution-button"
          v-bind:disabled="!currentSubstitutionExists"
          v-bind:class="{active: !currentSubstitutionExists}">
        </button>
      </div>
    </div>
    <div class="substitution-control">
      <!-- Shows if no substitition is active, or the new substitution button is pushed -->

      <div
        v-if="!currentSubstitutionExists"
        class="new-substitution-input">
        <SubstitutionSet
          v-if="glyphset.length > 0"
          v-bind:glyphset="glyphset" />
        <input
          class="glyph-selector"
          type="text"
          name=""
          value=""
          placeholder="Enter Glyph Name Here"
          @input.prevent="getGlyphs" />
        <ul
          v-if="hasSearchResults"
          v-bind:class="{'unpopulated': glyphset.length == 0}"
          class="search-results-list">
          <li
            class="glyph-search-result"
            v-for="(glyph, index) in results"
            v-if="notInList(glyph)"
            v-bind:key="index"
            @click="selectGlyphAlternates($event, glyph)">

            <GlyphAlternatesDisplay v-bind:glyph="glyph" v-bind:stylisticSets="stylisticSets" v-bind:previewBoxWidth="previewBoxWidth"/>
          </li>
        </ul>
        <div v-else class="empty-results" v-bind:class="{'unpopulated': glyphset.length == 0}">
          <span class="empty-message"><span class="text">No Glyphs to Display</span></span>
        </div>
        <div class="submit-buttons">
          <div
            @click="resetGlyphset"
            v-bind:class="{disabled: glyphset.length == 0}"
            class="reset-glyphset submit-button">
            <span class="centered">Reset</span>
          </div>
          <div
            @click="generateSubstitution"
            v-bind:class="{disabled: glyphset.length < 2}"
            class="create-substitution submit-button">
            <span class="centered">Create</span>
          </div>
        </div>
      </div>


      <!-- Shows if a substitition is currently active -->
      <div
        v-else
        class="current-substitution-data">
        <SubordinateControl v-bind:active="subordinatesActive" />

        <div
          @click="toggleSubordinatesPane"
          class="current-substitution-alternates">
          <div
            class="subordinate-toggle"
            v-bind:class="{active: subordinatesActive}">
            <span class="centered">&#x2630;</span>
          </div>
          <SubstitutionSet v-bind:glyphset="currentSubstitution.glyphs" />
        </div>
        <div class="dimension-controls">
          <DimensionControl
            dimensionName="x"
            v-bind:substitution="currentSubstitution"
            v-bind:axes="axes"
            v-bind:isActiveAxis="isActiveAxis"
            v-bind:activateAxisOnDimension="activateAxisOnDimension"
            v-bind:updateSubstitutionSubdivisions="updateSubstitutionSubdivisions"/>
          <DimensionControl
            dimensionName="y"
            v-bind:substitution="currentSubstitution"
            v-bind:axes="axes"
            v-bind:isActiveAxis="isActiveAxis"
            v-bind:activateAxisOnDimension="activateAxisOnDimension"
            v-bind:updateSubstitutionSubdivisions="updateSubstitutionSubdivisions"/>
          </div>
          <div class="submit-buttons">
            <div
              @click="removeSubstitution"
              class="reset-glyphset submit-button">
              <span class="centered">Delete</span>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions, mapMutations} from 'vuex'
import {AXES, GLYPHLIST, ASSIGNED_GLYPHS, CURRENT_SUBSTITUTION, CURRENT_SUBSTITUTION_INDEX, ALL_SUBSTITUTIONS, VALID_STYLISTIC_SETS} from '../store/getters.js'
import {ADD_NEW_SUBSTITUTION, DELETE_SUBSTITUTION, ACTIVATE_SUBSTITUTION, SET_AXIS_DIMENSION_FOR_SUBSTITUTION, SET_AXIS_SUBDIVISIONS_FOR_SUBSTITUTION} from '../store/mutations.js'
import {linear} from '../store/scales.js'

import GlyphAlternatesDisplay from './GlyphAlternatesDisplay.vue'
import DimensionControl from './DimensionControl.vue'
import SubstitutionSet from './SubstitutionSet.vue'
import SubordinateControl from './SubordinateControl.vue'

import FuzzySearch from 'fuzzy-search'

export default {
  data () {
    return {
      results: [],
      glyphset: [],
      subordinatesActive: false
    }
  },
  components: {
    GlyphAlternatesDisplay, DimensionControl, SubstitutionSet, SubordinateControl
  },
  methods: {
    ...mapMutations({
      activateAxis: SET_AXIS_DIMENSION_FOR_SUBSTITUTION,
      addNewSubstitution: ADD_NEW_SUBSTITUTION,
      activateSubstitution: ACTIVATE_SUBSTITUTION,
      deleteSubstitution: DELETE_SUBSTITUTION,
      setAxisDimensionForCurrentSubstitution: SET_AXIS_DIMENSION_FOR_SUBSTITUTION,
      setAxisSubdivisionsForCurrentSubstitution: SET_AXIS_SUBDIVISIONS_FOR_SUBSTITUTION,
    }),
    selectGlyphAlternates (e, glyph) {
      this.glyphset.push(glyph)
    },
    toggleSubordinatesPane () {
      this.subordinatesActive = !this.subordinatesActive
    },
    resetGlyphset () {
      this.glyphset = []
    },
    generateSubstitution () {
      if (this.glyphset.length >= 2) {
        this.addNewSubstitution({glyphs: this.glyphset})
        this.glyphset = []
        this.results = []
      }
    },
    goToSubstitution (e, index) {
      this.activateSubstitution({index: index})
    },
    newSubstitution () {
      this.glyphset = []
      this.results = []
      this.activateSubstitution({index: -1})
    },
    getGlyphs (e) {
      const val = e.target.value
      if (val !== '') {
        const results = this.fuzzyFinder.search(val)
        const sorted = results.sort((a, b) => a.name.length - b.name.length);
        const filtered = sorted.filter(g => typeof this.activeIndex[g.name] === 'undefined');
        this.results = filtered.slice(0, 10)
      } else {
        this.results = []
      }
    },
    isActiveAxis (axisIndex, dimensionName) {
      let substitution = this.currentSubstitution
      return substitution[dimensionName] === axisIndex
    },
    activateAxisOnDimension (e, axisIndex, dimensionName) {
      this.activateAxis({
        substitutionIndex: this.currentSubstitutionIndex,
        axisIndex: axisIndex,
        dimensionName: dimensionName
      })
    },
    updateSubstitutionSubdivisions (e, divisions, dimensionName) {
      this.setAxisSubdivisionsForCurrentSubstitution({
        substitutionIndex: this.currentSubstitutionIndex,
        subdivisions: linear(divisions),
        dimensionName: dimensionName
      })
    },
    notInList (glyph) {
      return this.glyphset.reduce((a, b) => a && (b.name !== glyph.name), true)
    },
    removeSubstitution () {
      this.deleteSubstitution({
        substitutionIndex: this.currentSubstitutionIndex
      })
    }
  },
  computed: {
    ...mapGetters({
      axes: AXES,
      substitutions: ALL_SUBSTITUTIONS,
      currentSubstitution: CURRENT_SUBSTITUTION,
      currentSubstitutionIndex: CURRENT_SUBSTITUTION_INDEX,
      glyphlist: GLYPHLIST,
      assignedGlyphs: ASSIGNED_GLYPHS,
      stylisticSets: VALID_STYLISTIC_SETS
    }),
    currentSubstitutionExists () {
      return typeof this.currentSubstitution !== 'undefined'
    },
    fuzzyFinder () {
      const glyphs = this.glyphlist
      return new FuzzySearch(glyphs, ['name'], {caseSensitive: true})
    },
    hasSearchResults () {
      return this.results.length > 0
    },
    totalAvailableSets () {
      return this.stylisticSets.length
    },
    previewBoxWidth () {
      return `width: ${(100 / (this.totalAvailableSets + 1)) + '%'};`
    },
    activeIndex () {
      let active = {};
      this.assignedGlyphs.forEach(glyph => { active[glyph.name] = true; })
      return active;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.substitutions-interface {
  width:100%;
  border: 1px solid var(--font-color);
  margin-bottom: var(--component-margin);
  overflow: hidden;

  .substitution-selector {
    width: 20%;
    min-height: calc(var(--substitution-selector-height) + var(--substitution-box-min-height));
    border-right: 1px solid var(--font-color);
    float:left;

    .substitutions-list {
      width:100%;
      height: var(--substitution-selector-height);
      overflow-y: scroll;
    }

    .add-substitution-button-box, .substutition-icon {
      position: relative;
      width:100%;
      height: var(--substitution-box-min-height);
    }

    .add-substitution-button-box {
      border-top:1px solid var(--font-color);
    }

    .add-substitution-button {
      position: absolute;
      width:var(--substitution-icon-width);
      height:var(--substitution-icon-height);
      border-radius: calc(var(--substitution-icon-width) / 2);
      top:50%;
      left:50%;
      background-color: var(--font-color);
      transform:translate(-50%,-50%);
      outline:none;
      border:none;
      cursor:pointer;

      &:hover{
        background-color: var(--active-color);
      }

      &:before {
        content: "+";
        position: absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        font-size: 2em;
        color:var(--background-color);
      }
    }

    .glyph-icon {
      position: absolute;
      width:var(--substitution-icon-width);
      height:var(--substitution-icon-height);
      border-radius: calc(var(--substitution-icon-width) / 2);
      top:50%;
      left:50%;
      background-color: var(--font-color);
      color:var(--background-color);
      transform:translate(-50%,-50%);
      outline:none;
      cursor:pointer;

      .subordinates-count {
        position: absolute;
        right:-5px;
        font-size:.7em;
        width:15px;
        height:15px;
        border:1px solid var(--font-color);
        border-radius: 7px;
        background-color:var(--background-color);
        color:var(--font-color);

      }

      &.active, &:hover {
        background-color: var(--active-color);
        .subordinates-count {
          background-color: var(--active-color);
          color:var(--background-color);
          border-color:var(--background-color);
        }
      }
    }
  }

  .substitution-control {
    width:80%;
    height: 100%;
    float: left;

    .current-substitution-data {
      .current-substitution-alternates {
        cursor:pointer;

        .subordinate-toggle {
          position: absolute;
          display:none;
          right:-10px;
          z-index:200;
          width:20px;
          height:20px;
          border-radius: 10px;
          background-color: var(--font-color);
          color:var(--background-color);
          transform: translateY(75%);
          transition:right .2s;

          &.active {
            right:-13px;
            display: block;
            background-color: var(--active-color);
            color:var(--font-color);
          }
        }

        &:hover .subordinate-toggle {
          display: block;
        }
      }
    }

    .glyph-selector {
      width: calc(100% - 2 * 0.5em);
      height: var(--substitution-box-min-height);
      outline: none;
      background-color: var(--ui-attention-background-color);
      color: var(--ui-attention-font-color);
      font-family: "Dispatch Mono", monospace;
      border: none;
      border-bottom: 1px solid var(--font-color);
      padding: .5em;
    }

    .empty-results {
      width: 100%;
      min-height: calc(var(--substitution-selector-height) - 2 * var(--substitution-box-min-height) - var(--control-block-padding) - 2px);
      position: relative;

      &.unpopulated {
        min-height: calc(var(--substitution-selector-height) - var(--substitution-box-min-height) - var(--control-block-padding) - 2px);
      }

      .empty-message {
        position: absolute;
        top: 50%;
        left:50%;
        width: 80%;
        transform:translateX(-50%);
        text-align: center;
        color:var(--darker-background-color);
      }
    }

    .search-results-list {
      height: calc(var(--substitution-selector-height) - 2 * var(--substitution-box-min-height) - var(--control-block-padding) - 2px);
      overflow-y: scroll;

      &.unpopulated {
        height: calc(var(--substitution-selector-height) - var(--substitution-box-min-height) - var(--control-block-padding) - 2px);
      }

    }

    .submit-buttons {
      height: var(--substitution-box-min-height);
      border-top:1px solid var(--font-color);
      overflow:auto;
      background-color: var(--background-color);

      .submit-button {
        height: var(--substitution-box-min-height);
        cursor: pointer;
        position: relative;
        float:left;
        width:50%;

        &:hover {
          color:var(--ui-attention-font-color);
          background-color: var(--ui-attention-background-color);
        }

        &:first-child {
          border-right: 1px solid var(--font-color);
        }
      }

      .disabled {
        color:var(--ui-disabled-color);

        &:hover {
          cursor:auto;
          background-color: inherit;
          color:var(--ui-disabled-color);
        }
      }
    }

    .glyph-search-result {
      width: 100%;
      border-bottom: 1px solid var(--font-color);

      .glyph-name {
        position: relative;
        width: 100%;
        padding:var(--control-block-padding);
        border-bottom: 1px solid var(--font-color);

        .indicator {
          position: absolute;
          right: 0%;
          top: 50%;
          display: none;
          background-color: var(--ui-attention-color);
          color: var(--ui-attention-font-color);
          padding: 0.125em;
          border-radius: 0.125em;
          border: 1px solid var(--ui-attention-font-color);
          transform: translate(-10%,-50%);
        }

      }
      .glyph-alternates {
        width: 100%;
        overflow: auto;
        border-bottom:1px solid var(--font-color);

        .standard, .alternate {
          display: inline-block;
          font-size: 1.5em;
          float:left;
          text-align: center;
          border-right: 1px solid var(--font-color);
          padding:var(--control-block-padding);
          &:last-child {
            border:none;
          }
        }
      }

      &:hover {
        & .glyph-name .indicator {
          display: block;
        }
      }
    }
  }

  .current-substitution-name {
    padding:var(--control-block-padding);
    border-bottom: 1px solid var(--font-color);
  }

  .dimension-controls {
    height: calc(var(--substitution-selector-height)  - var(--substitution-box-min-height));

  }
}
</style>
