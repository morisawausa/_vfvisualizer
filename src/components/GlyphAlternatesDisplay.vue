<template lang="html">
  <div class="glyph-alternates">
    <span v-bind:style="{'width': previewBoxWidth}" class="standard visualized-font">
      {{ glyph | unicode }}
    </span>
    <span class="name">
      {{ glyph.name }}
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
  cursor:pointer;

  .standard, .alternate, .name {
    width:25%;
    display: inline-block;
    font-size: 1.5em;
    float:left;
    text-align: center;
    border-right: 1px solid var(--font-color);
    padding:var(--control-block-padding);
    padding-right: 1.5em;
    &:last-child {
      border:none;
    }
  }

  .name {
    padding-top:1.4em;
    font-size: 1.2em;
  }

  &:hover {
    background-color: var(--active-color);
  }
}
</style>
