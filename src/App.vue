<template>
  <main id="app"
    v-bind:style="settings"
    >
    <!-- This module displays all of the controls
    for interacting with the visualization
    directly. -->
    <section id="visualizer-controls" class="layout-region">

      <FontUpload/>

      <div id="control-panel" class="control-panel">
        <AxisControl />
        <SubstitutionControl />
        <GlyphView />
      </div>
    </section>

    <Visualizer />

    <SubstitutionOutput />
  </main>
</template>

<script>
import {mapGetters} from 'vuex'
import {AXES, CURRENT_AXIS_SETTINGS} from './store/getters.js'
import FontUpload from './components/FontUpload'
import AxisControl from './components/AxisControl'
import SubstitutionControl from './components/SubstitutionControlPrivateUnicodes'
import GlyphView from './components/GlyphView'
import Visualizer from './components/Visualizer'
import SubstitutionOutput from './components/SubstitutionOutput'

export default {
  name: 'VariableFontVisualizer',
  components: {
    FontUpload, AxisControl, SubstitutionControl, GlyphView, Visualizer, SubstitutionOutput
  },
  methods: {

  },
  computed: {
    ...mapGetters({axisSettings: CURRENT_AXIS_SETTINGS, axes: AXES}),
    settings () {
      const axes = this.axes
      const settings = this.axisSettings
      return axes.map((axis, i) => { return `--axis-${axis.tag}-setting: ${settings[i]};` }).join(' ')
    }
  }
}
</script>

<style lang='scss'>
@import '@/styles/reset.scss';
@import '@/styles/fonts.scss';
@import '@/styles/typography.scss';
@import '@/styles/highlight.scss';

.centered {
  position: absolute;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
}

.button {
  color: var(--background-color);
  background-color: var(--font-color);

  &:hover {
    background-color: var(--hover-color);
  }
}

:root {
  --background-color: rgb(245,245,245);
  --darker-background-color: rgb(230,230,230);
  --font-color: rgb(25,25,25);

  // --background-color:rgb(25,25,25);
  // --font-color:rgb(235,235,235);

  --controls-width: 25vw;
  --control-block-padding: 1em;
  --control-block-padding-top: 1.5em;
  --control-block-element-spacing: 0.5em;
  --ui-input-color: var(--font-color);
  --ui-attention-color: lightblue;
  --ui-attention-background-color: lightblue;
  --ui-attention-font-color: darkblue;
  --active-color: magenta;
  --hover-color: pink;
  --slider-width: 60%;
  --component-margin: 0.5em;
  --grid-lines-color: transparent;
  --grid-hover-color: lightblue;
  --label-padding: 0.4em;

  --substitution-selector-height: 35vh;
  --substitution-icon-height: 30px;
  --substitution-icon-width: var(--substitution-icon-height);
  --substitution-box-min-height: 50px;
  --glyph-view-height: 14vh;

  --dimension-control-background-color: lightcyan;

  --syntax-tag-color: gray;
  --syntax-name-color: var(--font-color);
  --syntax-attr-color: var(--font-color);;
  --syntax-value-color: var(--active-color);
  --syntax-comment-color: gray;
}

body {
  width:100vw;
  height:100vh;
  overflow: hidden;
}

#visualizer-controls {
  position: absolute;
  width: var(--controls-width);
  margin: var(--component-margin);
  height: calc(100vh - 2 * var(--component-margin));
  font-family: "Dispatch Mono", monospace;
  color: var(--font-color);
}

#control-panel {
  position: static;
  display: block;
  width: 100%;
  height:auto;
}

</style>
