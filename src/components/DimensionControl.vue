<template lang="html">
  <div class="susbtitution-axis-control flex-height-container">

    <div class="dimension-name">{{ dimensionName }} dimension</div>

    <div class="dimension-display-selector dimension-selector">
      <div class="dimension-display-label dimension-label">
        <span class="centered">Axis</span>
      </div>
      <ul class="design-axis-selector flex-height-container">
        <li
          v-for="(axis, index) in axes"
          class="axis-label"
          v-bind:class="{active: isActiveAxis(index, dimensionName)}"
          v-bind:key="index"
          @click="activateAxisOnDimension($event, index, dimensionName)">
          <div class="axis-name"><span class="centered">{{axis.tag}}</span></div>
        </li>
      </ul>
    </div>

    <div class="dimension-scale-selector dimension-selector">
      <div class="dimension-display-label dimension-label">
        <span class="centered">Divisions</span>
      </div>
      <div class="divisions-input-field">
        <input
          type="number"
          v-bind:name="dimensionName + '-divisions-input'"
          class="divisions-input"
          min="1"
          max="20"
          v-bind:default="dimensionDivisions"
          v-bind:value="dimensionDivisions"
          @change.prevent="changeDivision($event, dimensionName)"
          @input.prevent="updateDivisionCount"/>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dimensionName: String,
    axes: Array,
    substitution: Object,
    isActiveAxis: Function,
    activateAxisOnDimension: Function,
    updateSubstitutionSubdivisions: Function
  },
  data () {
    return {
      divisions: 0
    }
  },
  methods: {
    updateDivisionCount (e) {
      this.divisions = e.target.value
    },
    changeDivision(e, dimensionName) {
      this.divisions = e.target.value
      this.updateSubstitutionSubdivisions(e, this.divisions, dimensionName)
    }
  },
  computed: {
    dimensionDivisions () {
      let activeAxis = this.substitution[this.dimensionName]
      let subdivisions = this.substitution.divisions[activeAxis]
      return subdivisions.length + 1
    }
  }
}
</script>

<style lang="scss" scoped>
.susbtitution-axis-control {
  overflow: auto;
  flex: 1;

  .dimension-name {
    position: relative;
    font-family: "Dispatch";
    // font-weight: 700;
    background-color:var(--dimension-control-background-color);
    padding:var(--label-padding);
    width: 100%;
    float: left;
    border-bottom: 1px solid var(--font-color);
  }
  .dimension-display-selector{
    flex: 1;
  }
  .dimension-selector {
    display:block;
    border-bottom: 1px solid var(--font-color);
    width:100%;
    overflow: auto;

    .dimension-label {
      position: relative;
      height: 100%;
      // height:var(--substitution-box-min-height);
      display: block;
      width: 50%;
      float:left;
      text-align: center;
      border-right:1px solid var(--font-color);
    }

    .design-axis-selector {
      position: relative;
      width: 50%;
      float: left;
      // display: block;
      min-height:var(--substitution-box-min-height);
      z-index:0;

      .axis-label {
        flex: 1;
        position: relative;
        // height:calc(var(--substitution-box-min-height) / 3);
        padding:var(--label-padding);
        background-color: var(--background-color);
        text-align: center;
        cursor:pointer;

        &:hover {
          background-color: var(--hover-color);
        }

        &.active {
          background-color: var(--active-color);
          color:var(--background-color);
          cursor:auto;
        }
      }
    }
  }

  .divisions-input-field {
    position: relative;
    display: block;
    width: 50%;
    overflow:auto;

    .divisions-input {
      font-family: "Dispatch Mono", monospace;
      background-color: var(--ui-attention-color);
      width: 100%;
      padding:0;
      padding-left:var(--label-padding);
      min-height:var(--substitution-box-min-height);
      outline:none;
      border:none;
      border-right:1px solid var(--font-color);
      height: var(--substitution-box-min-height);
      text-align: center;
      float:left;
    }
  }
}
</style>
