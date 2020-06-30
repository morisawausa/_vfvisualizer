<template>
  <!-- This element gets populated by the FontFileManager class
  after a file is dropped into the page. -->
  <div class="axes-interface">
    <div
      class="axis"
      v-for="(axis, index) in axes"
      v-bind:class="{assigned: !axisIsUnassigned(axis, index)}"
      v-bind:id="axis.tag"
      v-bind:data-axis-control-for="axis.tag"
      v-bind:key="index">
        <div class="axis-name-box">
          <span class='axis-name-label'>
          {{axis.tag}}
          </span>
        </div>
        <div class="axis-data-box">
          <div v-if="axisIsUnassigned(axis, index)" class="axis-input-box">
            <span class="axis-min-label">{{axis.min}}</span>

              <input
                class="axis-selector"
                type="range"
                v-bind:for="axis.tag"
                v-bind:min="axis.min"
                v-bind:max="axis.max"
                v-bind:value="axisSettings[index]"
                @input="axisChange($event, axis, index)"
              />


            <input
              class="axis-value-input"
              type="number"
              v-bind:for="axis.tag"
              v-bind:min="axis.min"
              v-bind:max="axis.max"
              v-bind:value="axisSettings[index]"
              @change="axisChange($event, axis, index)"
            />
            <span class="axis-max-label">{{axis.max}}</span>
            <span class="axis-selector-box">
              <span
                v-for="(percentage, index) in divisions(axis, index)"
                v-bind:style="{left: (percentage * 100) + '%'}"
                v-bind:key="index"
                class="division-marker">
              </span>
            </span>
          </div>
          <div class="axis-demo-box">
            <span
              v-for="(data, index) in demoGlyphs(axis)"
              class="axis-demo-box-value visualized-font"
              v-bind:key="index"
              v-bind:style="data">
              a <!-- change to active substitution primary glyph -->
            </span>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {AXES, CURRENT_AXIS_SETTINGS, CURRENT_SUBSTITUTION} from '../store/getters.js'
import {UPDATE_AXIS_VALUE} from '../store/mutations.js'

export default {
  data () {
    return {
    }
  },
  methods: {
    ...mapActions([UPDATE_AXIS_VALUE]),
    axisChange (event, axis, index) {
      const value = parseInt(event.target.value)
      this[UPDATE_AXIS_VALUE]({index, value})
    },
    demoGlyphs (axis) {
      const examples = 5
      return Array.from(Array(examples).keys()).map(i => {
        let t = i / (examples - 1)
        let value = Math.floor((axis.max - axis.min) * t + axis.min)
        let setting = `--axis-${axis.tag}-setting`
        return {
          [setting]: value,
          'width': (100 / examples) + '%'
        }
      })
    },
    axisIsUnassigned (axis, index) {
      let substitution = this.currentSubstitution;
      return (typeof substitution !== 'undefined')
        && substitution.x != index
        && substitution.y != index
        && substitution.divisions[index].length > 0
    },
    getAssignedAxis (axis, index) {
      let sub = this.currentSubstitution;
      if (typeof sub === 'undefined') { return ''; }
      if (index == sub.x && index == sub.y) { return 'x,y'; }
      if (index == sub.x ) { return 'x'; }
      if (index == sub.y ) { return 'y'; }
    },
    divisions (axis, index) {
      return (typeof this.currentSubstitution !== 'undefined')
           ? [0].concat(this.currentSubstitution.divisions[index]).concat([1])
           : [];
    }
  },
  computed: {
    ...mapGetters({
      axes: AXES,
      axisSettings: CURRENT_AXIS_SETTINGS,
      currentSubstitution: CURRENT_SUBSTITUTION
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.axes-interface {
  display: block;
  width:100%;

  background-color: var(--background-color);
  margin-bottom: var(--component-margin);

  .axis {
    background-color: var(--background-color);
    overflow: auto;

    .axis-name-box {
      position: relative;
      // display: none;
      height:82px;
      width:10%;
      float:left;

      border-top: 1px solid var(--font-color);
      border-left: 1px solid var(--font-color);

      .axis-name-label {
        position: absolute;
        top:50%;
        left:50%;
        display: block;
        text-align: center;
        width:10%;
        transform:translate(-100%,50%)rotate(-90deg);
        white-space: nowrap;
      }
    }

    &:last-child .axis-name-box {
      border-bottom: 1px solid var(--font-color);
    }

    .axis-data-box {
      display: inline-block;
      width: 90%;
      border: 1px solid var(--font-color);
      float:left;
    }

    &.assigned {
      --size: 55px;
      height:var(--size);

      .axis-name-box {
        height:var(--size);
        .axis-name-label {
          transform:translate(-100%,60%)rotate(-90deg);
        }
      }

      .axis-demo-box {
        padding-top:1.2em;
        height: var(--size);
        border-bottom: 1px solid var(--background-color);
      }

    }

    .axis-input-box {
      display: inline-block;
      height: 40px;
      width: 100%;
      padding: .8em;
    }

    .axis-min-label, .axis-max-label {
      display: inline-block;
      padding-top: .25em;
    }

    .axis-min-label {
      position: relative;
      left:0px;
      top:2%;
      width:10%;
      text-align: left;
    }

    .axis-max-label {
      position: relative;
      left:5%;
      top:2%;
      width:10%;
      text-align: right;
    }

    .axis-selector {
      -webkit-appearance:none;
      width:var(--slider-width);
      background: transparent;
      cursor:pointer;
      margin-top: 0px;
      position: relative;
      top:-12%;
      z-index: 100;

      &:focus { outline:none; }
      &::-ms-track {
        width:100%;
        cursor:pointer;
        background:transparent;
        border-color:transparent;
        color:transparent;
      }

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        background-color: var(--ui-input-color);
        width: 10px;
        height: 24px;
        border-radius: 2.5px;
        border: 2px solid var(--background-color);
        transform:translateY(-50%);
        margin-top: 1px;
        z-index:100;
      }

      &::-webkit-slider-runnable-track {
        background-color: var(--font-color);
        height: 2px;
      }
    }

    .axis-value-input {
      position: relative;
      left:-7px;

      width: 18%;
      font-family: "Dispatch Mono", monospace;
      color:black;
      border:1px solid var(--font-color);
      border-radius: 2.5px;
      outline:none;
      background-color: var(--ui-attention-color);
    }

    .axis-selector-box {
      position: absolute;
      left:calc(25%);
      height:40px;
      width:32%;
    }

    .division-marker {
      position: absolute;
      top:50%;
      background-color:gray;
      width:2px;
      height:4px;
      transform:translate(-50%, -100%);
      &:first-child, &:last-child {
        display: none;
      }
    }
  }

  .axis-demo-box {
    display: inline-block;
    width: 100%;
    height: 40px;
    padding: 0.5em;
    background-color: var(--font-color);
  }

  .axis-demo-box-value {
    display: inline-block;
    text-align: center;
    font-size: 2.2em;
    color: var(--background-color);
  }
}

</style>
