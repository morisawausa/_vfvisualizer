<template>
  <!-- This element gets populated by the FontFileManager class
  after a file is dropped into the page. -->
  <div id="font-file-opener"
    class="file-opener"
    @dragstart.prevent="hoverOn"
    @dragover.prevent="hoverOn"
    @dragenter.prevent="hoverOn"
    @dragend.prevent="hoverOff"
    @dragleave.prevent="hoverOff"
    @drop.prevent="addFile"
    v-bind:class="{
      inactive: inactive,
      active: !inactive,
      hovering: hovering
    }">
    <div
      class="opener-message"
      v-if="inactive">
      <div class="intro-text">
        <h1 class="heading">Drag a variable font over this window.</h1>
        <h3 class="heading">The Variable Font Substitution Mapper</h3>
        <p>
          To get started, drag a variable font .ttf over this this window.
          This tool will try to parse the file and give you a visual interface for designing glyph substitution patterns (also known as OpenType <a target="_blank" href="https://docs.microsoft.com/en-us/typography/opentype/spec/features_pt#tag-rvrn">Required Variation Alternates</a>).
          Think about the dollar sign with and without the vertical bar.
          For more extensive documentation on using this tool check out <a target="_blank" href="https://github.com/morisawausa/_vfvisualizer">our repo on Github</a>.
        </p>
      </div>
      <div class="loading-icon">

      </div>
      <div class="credits-text tiny">
        <p>This tool was designed and developed by Marie Otsuka and Nic Schumann for <a target="_blank" href="https://occupantfonts.com">Occupant Fonts</a>.
          It is available for you to use under an Apache 2.0 license.</p>
      </div>
    </div>
    <div v-else>
      <ul class="font-meta">
        <li v-for="(data, index) in fontmeta" v-bind:key="index" class="font-meta-name meta-row">
          <span class="label">{{ data.name }}</span><span class="data">{{ data.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {INITIALIZE} from '../store/mutations.js'
import {META, GLYPHLIST} from '../store/getters.js'
import fontkit from 'fontkit'
const toBuffer = require('blob-to-buffer')

export default {
  data () {
    return {
      errored: false,
      hovering: false,
      font: null,
      file: null,
      node: null
    }
  },
  methods: {
    ...mapActions([INITIALIZE]),

    addFile (e) {
      this.file = e.dataTransfer.files[0]

      toBuffer(this.file, (err, buffer) => {
        if (err) {
          this.errored = true
        } else {
          try {
            this.font = fontkit.create(buffer)
            this.node.textContent = this.fontstyles()
            this.hovering = false
            this[INITIALIZE]({font: this.font, buffer: buffer})
          } catch (err) {
            this.errored = true
          }
        }
      })
    },

    fontstyles () {
      if (this.inactive) {
        return ''
      } else {
        const dataURL = URL.createObjectURL(this.file)

        // eslint-disable-next-line
        const fontFaceDeclaration = `@font-face {font-family: 'visualized-font'; src: url('${dataURL}');}`
        // eslint-disable-next-line
        const classDeclaration = `.visualized-font {font-family: 'visualized-font'; font-variation-settings: ${this.variationsettings()}}`

        return fontFaceDeclaration + ' ' + classDeclaration
      }
    },

    variationsettings () {
      let settings = []
      for (let tag in this.font.variationAxes) {
        settings.push(`"${tag}" var(--axis-${tag}-setting)`)
      }
      return settings.join(', ') + ';'
    },

    hoverOn () {
      this.hovering = true
    },

    hoverOff () {
      this.hovering = true
    }
  },
  computed: {
    ...mapGetters([META, GLYPHLIST]),

    inactive () {
      return this.font === null
    },
    fontmeta () {
      const meta = this[META]
      const glyphs = this[GLYPHLIST]

      return [
        {name: 'Font', value: meta.fullName},
        {name: 'Glyphs', value: meta.numGlyphs},
        {name: 'Axes', value: meta.numAxes},
        {name: 'Instances', value: meta.numInstances}
      ]
    }
  },
  mounted () {
    let style = document.createElement('style')
    style.type = 'text/css'
    style.appendChild(document.createTextNode(''))
    this.node = style.childNodes[0]
    document.head.appendChild(style)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.file-opener, #font-file-opener  {

  position: absolute;
  left: var(--component-margin);
  top:var(--component-margin);
  width: calc(100vw - 2.0 * var(--component-margin));
  height: calc(100vh - 2.0 * var(--component-margin));

  background-color: var(--background-color);
  color: var(--font-color);
  margin-bottom: var(--component-margin);
  border: 1px solid black;

  a {
    color:var(--active-color);
  }

  &.inactive {
    z-index: 10;
    // compensate for margin on the parent component.
    // This margin is only relevant when the component is active
    margin:calc(-1 * var(--component-margin));

    .opener-message {
      margin: 10vw;
        .intro-text {
          max-width: calc(min(500px, 100vw));

          // display: none;
          h1 {
            font-size: 4em;
            font-weight: bold;
            margin-bottom: 1em;
            line-height: 1.15em;
          }

          h3 {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 1em;
          }

          p {
            font-size: 1em;
            margin-bottom: 1em;
            line-height: 1.25em;
          }

          margin-bottom: 4em;

        }

        .credits-text {
          max-width: calc(min(500px, 100vw));
          line-height: 1.35em;
          // display: none;
        }

        .loading-icon {
          position: absolute;
          top:50%;
          left: 50%;
          transform: translate(-50%, -50%);

          width: 5vw;
          height: 5vw;

          border-radius: 2.5vw;
          background-color: var(--font-color);

          display:none;
        }

    }
  }

  &.hovering {
    border: 1px solid var(--active-color);
  }

  &.loading .opener-message .loading-icon {
    background-color: lightgreen;
  }

  &.errored {

  }

  &.active {
    position:static;
    width:100%;
    z-index: 0;
    height: auto;

    .font-meta {
      display: block;
      color: var(--font-color);
      padding: var(--control-block-padding);
      padding-top: var(--control-block-padding-top);

      .meta-row {
        padding-bottom: var(--control-block-padding);
        border-bottom: 1px solid var(--font-color);
        margin-bottom: 1em;
        width: 100%;

        .name {
          float:left;
        }
        .data {
          float: right;
        }

        &:last-child {
          border-bottom: none;
          margin-bottom:0;
          padding-bottom: calc(var(--control-block-padding) / 2);
        }
      }
    }

    .opener-message {
      border:1px solid red;
      // display: none;
    }

  }

}
</style>
