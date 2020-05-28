<template>
  <!-- This element gets populated by the FontFileManager class
  after a file is dropped into the page. -->
  <div class="axes-interface">
    <div
      class="axis"
      v-for="(axis, index) in axes"
      v-bind:id="axis.tag"
      v-bind:data-axis-control-for="axis.tag"
      v-bind:key="index">
        <div class="axis-name-box">
          <span class='axis-name-label'>{{axis.tag}}</span>
        </div>
        <div class="axis-data-box">
          <div class="axis-input-box">
            <span class="axis-min-label">{{axis.min}}</span>
            <input
              class="axis-selector"
              type="range"
              v-bind:for="axis.tag"
              v-bind:min="axis.min"
              v-bind:max="axis.max"
              v-bind:value="axis.default"
              @input="axisChange($event, axis, index)"
            />
            <span class="axis-max-label">{{axis.max}}</span>
          </div>
          <div class="axis-demo-box">
            <span
              v-for="(data, index) in demoGlyphs(axis)"
              class="axis-demo-box-value visualized-font"
              v-bind:key="index"
              v-bind:style="data">
              a
            </span>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {AXES} from '../store/getters.js'
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
    }

  },
  computed: {
    ...mapGetters({axes: AXES})
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

      border: 1px solid var(--font-color);

      .axis-name-label {
        position: absolute;
        top:50%;
        left:50%;
        display: block;
        text-align: center;
        width:10%;
        transform:translate(-100%,50%)rotate(-90deg);
      }
    }

    .axis-data-box {
      display: inline-block;
      width: 90%;
      border: 1px solid var(--font-color);
      float:left;
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
      text-align: left;
      margin-right: 20px;
      float:left;
    }

    .axis-max-label {
      text-align: right;
      margin-left: 20px;
      float:right;
    }

    .axis-selector {
      -webkit-appearance:none;
      width:var(--slider-width);
      background: transparent;
      cursor:pointer;
      margin-top: 6px;

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
      }

      &::-webkit-slider-runnable-track {
        background-color: var(--font-color);
        height: 2px;
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
