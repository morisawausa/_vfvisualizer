<template lang="html">
  <div class="glyph-alternates">
    <span v-bind:style="{'width': previewBoxWidth}" class="standard visualized-font">
      {{ glyph | unicode }}
    </span>
    <span
      class="alternate visualized-font"
      v-for="(set, index) in stylisticSets"
      v-bind:key="index"
      v-bind:class="set"
      v-bind:style="{'width': previewBoxWidth}">
      {{ glyph | unicode }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    glyph: Object,
    previewBoxWidth: String,
    stylisticSets: Array
  }
}
</script>

<style lang="scss" scoped>
.glyph-alternates {
  width: 100%;
  overflow: auto;
  background-color: var(--darker-background-color);
  border-bottom:1px solid vaR(--font-color);

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
</style>
