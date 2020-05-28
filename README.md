# Variable Font Visualizer
**Version: 0.9.0, in development.**


This tool provides a design space visualizer and font variation substitution manager for OpenType variable fonts. The tool helps with setting up glyph substitutions that depend on the design space region. It can build substititions for many different glyphs visually. Once you're done setting up substititions, the tool will generate a `<GSUB>` element that you can paste into a `.ttx` file, or a `<rules>` element that you can paste into a `.designspace` file.

## Using the tool

### Getting Set Up

Generating susbtitutions requires making the glyphs you want to substitute visible to the application. To do this, we use `private unicode` ranges.

Each substitution should have a base glyph that's being substituted. This base glyph should be assigned a unicode value corresponding to the character's code point. So if your base glyph is `Q`, you would assign it unicode `U+0051`, like normal. If you had a substitution for `Q`, say `Q.NO_BAR` for narrower and heavier points in the design space, you would assign this glyph a private unicode value (it doesn't matter which one). Private Unicodes start at `U+E000`. Assigning it a unicode value, makes the substitution visible to the visualizer.

Once you've done this for all of the substitions you have, you're ready to move on to the next step.



## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
# No unit tests are implemented for the current version.
npm run unit

# run e2e tests
# No end-to-end tests are implemented for the current version.
npm run e2e

# run all tests
# No tests are implemented for the current version.
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Roadmap
	- make grid subdivisions draggable.
	- add delete button to remove substitutions.
	- add better keyboard shortcuts for updating divisions
	- error handling for non-variable .ttf files.
	- add tutorials and help screens.
	- documentation!
	- finesse interactions, and ui.

- Version 1.1
	- optimize generated rectangles
	- add the ability to zoom in on the grid?
	- dark mode?

- Version 1.2
	- allow for grid re-subdivision

## Known Issues

### Font Size Reduction on Proof Strings

The process for fitting test strings to the appropriate width is pretty janky. It just involves calculating a constant scale factor that depends only on the number of characters in the test string. It works fine (and is performant) for short test strings, but it certainly won't work for longer words. This tool isn't really meant as a word proofing tool, so seems okay (for now). See `GlyphView.vue` and `Visualizer.vue` for instances.

```js
Math.pow(.85, sequence.length)
```

Used by `GlyphView.vue` for the design-point preview.


```js
Math.pow(.75, sequence.length)
```

Used by `Visualizer.vue` for the size of the glyphs in the visualizer canvas.



## GSUB

### `.ttf` Version

```xml
<LookupList>
  <!-- LookupCount=1 -->
  <Lookup index="0">
    <LookupType value="1"/>
    <LookupFlag value="0"/>
    <!-- SubTableCount=1 -->
    <SingleSubst index="0" Format="2">
      <Substitution in="Oslash" out="Oslash.NO_BAR"/>
      <Substitution in="Q" out="Q.NO_BAR"/>
    </SingleSubst>
  </Lookup>
</LookupList>
<FeatureVariations>
  <Version value="0x00010000"/>
  <!-- FeatureVariationCount=4 -->
  <FeatureVariationRecord index="0">
    <ConditionSet>
      <!-- ConditionCount=2 -->
      <ConditionTable index="0" Format="1">
        <AxisIndex value="1"/>
        <FilterRangeMinValue value="-1.0"/>
        <FilterRangeMaxValue value="-0.526"/>
      </ConditionTable>
      <ConditionTable index="1" Format="1">
        <AxisIndex value="0"/>
        <FilterRangeMinValue value="-0.888"/>
        <FilterRangeMaxValue value="1.0"/>
      </ConditionTable>
    </ConditionSet>
    <FeatureTableSubstitution>
      <Version value="0x00010000"/>
      <!-- SubstitutionCount=1 -->
      <SubstitutionRecord index="0">
        <FeatureIndex value="0"/>
        <Feature>
          <!-- LookupCount=1 -->
          <LookupListIndex index="0" value="0"/>
        </Feature>
      </SubstitutionRecord>
    </FeatureTableSubstitution>
  </FeatureVariationRecord>
  <FeatureVariationRecord index="1">
    <ConditionSet>
      <!-- ConditionCount=2 -->
      <ConditionTable index="0" Format="1">
        <AxisIndex value="1"/>
        <FilterRangeMinValue value="-0.524"/>
        <FilterRangeMaxValue value="0.398"/>
      </ConditionTable>
      <ConditionTable index="1" Format="1">
        <AxisIndex value="0"/>
        <FilterRangeMinValue value="-0.124"/>
        <FilterRangeMaxValue value="1.0"/>
      </ConditionTable>
    </ConditionSet>
    <FeatureTableSubstitution>
      <Version value="0x00010000"/>
      <!-- SubstitutionCount=1 -->
      <SubstitutionRecord index="0">
        <FeatureIndex value="0"/>
        <Feature>
          <!-- LookupCount=1 -->
          <LookupListIndex index="0" value="0"/>
        </Feature>
      </SubstitutionRecord>
    </FeatureTableSubstitution>
  </FeatureVariationRecord>

  <FeatureVariationRecord index="2">
    <ConditionSet>
      <!-- ConditionCount=2 -->
      <ConditionTable index="0" Format="1">
        <AxisIndex value="1"/>
        <FilterRangeMinValue value="0.4"/>
        <FilterRangeMaxValue value="0.798"/>
      </ConditionTable>
      <ConditionTable index="1" Format="1">
        <AxisIndex value="0"/>
        <FilterRangeMinValue value="0.5"/>
        <FilterRangeMaxValue value="1.0"/>
      </ConditionTable>
    </ConditionSet>

    <FeatureTableSubstitution>
      <Version value="0x00010000"/>
      <!-- SubstitutionCount=1 -->
      <SubstitutionRecord index="0">
        <FeatureIndex value="0"/>
        <Feature>
          <!-- LookupCount=1 -->
          <LookupListIndex index="0" value="0"/>
        </Feature>
      </SubstitutionRecord>
    </FeatureTableSubstitution>

  </FeatureVariationRecord>

  <FeatureVariationRecord index="3">
    <ConditionSet>
      <!-- ConditionCount=2 -->
      <ConditionTable index="0" Format="1">
        <AxisIndex value="1"/>
        <FilterRangeMinValue value="0.8"/>
        <FilterRangeMaxValue value="1.0"/>
      </ConditionTable>
      <ConditionTable index="1" Format="1">
        <AxisIndex value="0"/>
        <FilterRangeMinValue value="0.8"/>
        <FilterRangeMaxValue value="1.0"/>
      </ConditionTable>
    </ConditionSet>
    <FeatureTableSubstitution>
      <Version value="0x00010000"/>
      <!-- SubstitutionCount=1 -->
      <SubstitutionRecord index="0">
        <FeatureIndex value="0"/>
        <Feature>
          <!-- LookupCount=1 -->
          <LookupListIndex index="0" value="0"/>
        </Feature>
      </SubstitutionRecord>
    </FeatureTableSubstitution>

  </FeatureVariationRecord>


</FeatureVariations>
```

### `.designspace` Version

```xml
<rules>
  <rule name="Qbar+Oslashbar">
    <conditionset>
      <condition name="weight" minimum="56" maximum="1000"/>
      <condition name="width" minimum="0" maximum="237"/>
    </conditionset>
    <conditionset>
      <condition name="weight" minimum="438" maximum="1000"/>
      <condition name="width" minimum="238" maximum="699"/>
    </conditionset>
    <conditionset>
      <condition name="weight" minimum="750" maximum="1000"/>
      <condition name="width" minimum="700" maximum="899"/>
    </conditionset>
    <conditionset>
      <condition name="weight" minimum="900" maximum="1000"/>
      <condition name="width" minimum="900" maximum="1000"/>
    </conditionset>
    <sub name="Q" with="Q.NO_BAR"/>
    <sub name="Oslash" with="Oslash.NO_BAR"/>
  </rule>
</rules>
```
