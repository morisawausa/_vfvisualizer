<template lang="html">
  <div id="subordinate-control" v-bind:class="{active: active}">

    <div class="primary">
      <div class="header">
        primary
      </div>
      <SubstitutionSet v-bind:glyphset="primary" />
    </div>

    <div class="subordinates">
      <div
        v-if="subordinates.length > 0"
        class="header">
        subordinates
      </div>
      <div
        v-for="(sequence, index) in subordinates"
        v-bind:index="index"
        class="subordinate">
        <SubstitutionSet v-bind:glyphset="sequence" />
        <div class="buttons">
          <div
            @click="deleteSubordinateFromSubstitution(index)"
            class="delete-button subordinate-button">
            <span class="centered">&#x232b;</span>
          </div>

          <div
            @click="swapSubordinateInSubstitution(index)"
            class="swap-button subordinate-button">
            <span class="centered">&#x21f5;</span>
          </div>

          <div
            v-if="inactive(index)"
            @click="activateSubordinateInGrid(index)"
            class="activate-button subordinate-button">
            <span class="centered">+</span>
          </div>

          <div
            v-else
            @click="deactivateSubordinateInGrid(index)"
            class="deactivate-button subordinate-button">
            <span class="centered">-</span>
          </div>

        </div>
      </div>
    </div>

    <div class="new-subordinate" v-if="glyphset.length > 0">
      <div class="header">
        new subordinate
      </div>
      <div>
        <SubstitutionSet v-bind:glyphset="glyphset" />
      </div>
    </div>

    <div class="search-box">
      <input
        class="glyph-selector"
        type="text"
        name=""
        value=""
        placeholder="Search glyphs"
        @input.prevent="getGlyphs" />
      <ul
        v-if="results.length > 0"
        v-bind:class="{'unpopulated': glyphset.length == 0}"
        class="search-results-list">
        <li
          class="glyph-search-result"
          v-for="(glyph, index) in results"
          v-if="valid(glyph)"
          v-bind:key="index"
          @click="addGlyphToGlyphset(glyph)">

          <div class="glyph-name">{{glyph.name}}<span class="indicator">choose &rarr;</span></div>
          <GlyphAlternatesDisplay v-bind:glyph="glyph" v-bind:stylisticSets="[]" previewBoxWidth="10%"/>
        </li>
      </ul>
    </div>
    <!-- <div class="subordinate-buttons">
      <div class="add-button">
        Add
      </div>
    </div> -->
  </div>
</template>

<script>
import {mapGetters, mapActions, mapMutations} from 'vuex'
import FuzzySearch from 'fuzzy-search'

import {
  AXES,
  GLYPHLIST,
  CURRENT_SUBSTITUTION,
  CURRENT_SUBSTITUTION_INDEX,
  ALL_SUBSTITUTIONS,
  VALID_STYLISTIC_SETS } from '../store/getters.js'

import {
  ADD_SUBORDINATE_TO_SUBSTITUTION,
  REMOVE_SUBORDINATE_FROM_SUBSTITUTION,
  SWAP_SUBORDINATE_AND_PRIMARY,
  ACTIVATE_SUBORDINATE_IN_GRID,
  DEACTIVATE_SUBORDINATE_IN_GRID} from '../store/mutations.js'

import SubstitutionSet from './SubstitutionSet.vue';
import GlyphAlternatesDisplay from './GlyphAlternatesDisplay.vue';

export default {
  props: {
    active: Boolean
  },
  components: {
    SubstitutionSet, GlyphAlternatesDisplay
  },
  data () {
    return {
      results: [],
      glyphset: [],
    }
  },
  methods: {
    ...mapMutations({
      addSubordinate: ADD_SUBORDINATE_TO_SUBSTITUTION,
      deleteSubordinate: REMOVE_SUBORDINATE_FROM_SUBSTITUTION,
      swapSubordinate: SWAP_SUBORDINATE_AND_PRIMARY,
      activateSubordinate: ACTIVATE_SUBORDINATE_IN_GRID,
      deactivateSubordinate: DEACTIVATE_SUBORDINATE_IN_GRID
    }),
    getGlyphs (e) {
      const val = e.target.value
      if (val !== '') {
        const results = this.fuzzyFinder.search(val)
        const sorted = results.sort((a, b) => a.name.length - b.name.length).slice(0, 10)
        this.results = sorted
      } else {
        this.results = []
      }
    },
    valid (glyph) {
      // TODO: More sophisticated filtering here.
      let current = this.currentSubstitution
      let notInList = this.glyphset.reduce((a, b) => a && (b.name !== glyph.name), true)

      let needsAdditionalGlyphs = (typeof current !== 'undefined') ? this.glyphset.length < current.glyphs.length : true;

      return notInList && needsAdditionalGlyphs
    },
    inactive (index) {
      let current = this.currentSubstitution
      return current.active_subordinates.indexOf(index) === -1;
    },
    addGlyphToGlyphset (glyph) {
      this.glyphset.push(glyph)

      if (this.glyphset.length === this.currentSubstitution.glyphs.length) {
        this.addSubordinate({
          substitutionIndex: this.currentSubstitutionIndex,
          glyphset: this.glyphset
        })

        this.glyphset = []
        this.results = []
      }
    },
    deleteSubordinateFromSubstitution (index) {
      this.deleteSubordinate({
        substitutionIndex: this.currentSubstitutionIndex,
        subordinateIndex: index
      })
    },
    swapSubordinateInSubstitution (index) {
      this.swapSubordinate({
        substitutionIndex: this.currentSubstitutionIndex,
        subordinateIndex: index
      })
    },
    activateSubordinateInGrid (index) {
      this.activateSubordinate({
        substitutionIndex: this.currentSubstitutionIndex,
        subordinateIndex: index
      })
    },
    deactivateSubordinateInGrid (index) {
      this.deactivateSubordinate({
        substitutionIndex: this.currentSubstitutionIndex,
        subordinateIndex: index
      })
    },
  },
  computed: {
    ...mapGetters({
      currentSubstitution: CURRENT_SUBSTITUTION,
      currentSubstitutionIndex: CURRENT_SUBSTITUTION_INDEX,
      glyphlist: GLYPHLIST
    }),
    primary () {
      let current = this.currentSubstitution;

      if (typeof current !== 'undefined') {
        return current.glyphs
      }

      return []
    },
    subordinates () {
      let current = this.currentSubstitution;

      if (typeof current !== 'undefined') {
        return current.subordinates
      }

      return []
    },
    fuzzyFinder () {
      const glyphs = this.glyphlist
      return new FuzzySearch(glyphs, ['name'], {caseSensitive: true})
    }

  }
}
</script>

<style lang="scss" scoped>
#subordinate-control {
  position: absolute;
  width:80%;
  border:1px solid var(--font-color);
  background-color: var(--background-color);
  left: -200%;
  z-index: 100;
  max-height: 60vh;
  overflow-y: hidden;

  &.active {
    left: calc(100% + var(--component-margin));
  }

  .subordinate {
    position: relative;

    .buttons {
      display: none;
      position: absolute;
      right:0;
      margin-right: 1em;
      transform: translateY(-50%);

      .subordinate-button {
        position: relative;
        display: inline-block;
        background-color: var(--font-color);
        color:var(--background-color);
        width:20px;
        height: 20px;
        border-radius: 10px;

        cursor: pointer;
      }
    }

    &:hover .buttons {
      display: block;

      .deactivate-button {
        color:var(--font-color);
        background-color: var(--active-color);
      }
    }
  }

  .glyph-selector {
    width: calc(100% - 2 * 0.5em);
    height: calc( var(--substitution-box-min-height) / 2);
    outline: none;
    background-color: var(--ui-attention-background-color);
    color: var(--ui-attention-font-color);
    font-family: "Dispatch Mono", monospace;
    border: none;
    border-bottom: 1px solid var(--font-color);
    padding: .5em;
  }

  .header {
    padding: 0.5em;
    border-bottom:1px solid var(--font-color);
    background-color: var(--dimension-control-background-color)
  }

  .search-results-list {
    max-height: 60vh;
    overflow-y: scroll;
  }

  .glyph-search-result {
    width: 100%;

    .glyph-name {
      position: relative;
      width: 100%;
      padding:calc(var(--control-block-padding) / 2);
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
      background-color: var(--darker-background-color);
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
</style>
