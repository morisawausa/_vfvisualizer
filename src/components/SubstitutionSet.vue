<template lang="html">
  <div class="substitution-set-view">
    <div
      class="visualized-font substituted-glyph"
      v-bind:class="`alternate-${index}`"
      v-for="(glyph, index) in glyphset"
      v-bind:style="{'width': width}"
      v-bind:key="index">
      <span
        class="rendered centered">
          <span class="centered">{{ glyph | unicode }}</span>
      </span>
      <span
        v-if="index < glyphset.length - 1"
        class="substitution-arrow centered">
        <span class="centered">&rarr;</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    glyphset: Array
  },
  methods: {
    offset (index) {
      return (100 * (index + 1) / this.glyphset.length) + '%'
    }
  },
  computed: {
    width () {
      return (100 / this.glyphset.length) + '%';
    },
  }
}
</script>

<style lang="scss" scoped>
  .substitution-set-view {
    height: var(--substitution-box-min-height);
    border-bottom: 1px solid var(--font-color);
    overflow: hidden;
  }
  .substituted-glyph {
    position: relative;
    float: left;
    width: 50%;
    height: var(--substitution-box-min-height);
    border-right: 1px solid var(--font-color);

    font-size: 1.5rem;

    .rendered {
      --size: calc(var(--substitution-box-min-height) - 15px);
      height: var(--size);
      width:var(--size);
      border-radius: calc(var(--size) / 2);
      text-align: center;
    }

    &:last-child {
      border-right: none;
    }
  }
  .substitution-arrow {
    position: absolute;
    background-color:var(--background-color);
    color:var(--font-color);
    width: 20px;
    height:20px;
    border:1px solid vaR(--font-color);
    border-radius: 10px;
    left: 100%;
    font-size: .8rem;
    font-family:"Dispatch Mono", monospace;
    z-index: 100;
  }
</style>
