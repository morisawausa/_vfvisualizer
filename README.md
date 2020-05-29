# Variable Font Visualizer
**Current Version: 0.8.8, in development.**


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
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Roadmap

*This section outlines our roadmap for future development.*

### Version 1.0.0

| Done | Version | Category | Feature | Description |
| --- | --- | --- | --- | --- |
| | 0.9.0 | UI | Button States | Make the Button States more legible with hover, etc.
| ✅| 0.9.0 | Functionality | Delete Substitutions| Self Explanitory
| ✅ | 0.9.0 | Functionality | >2 Substitutions | You should be able to apply multiple substitions to the same base glyph in one design space map.  
| | 0.9.0 | Functionality | >1 Substitution Set per Map | You should be able to assign multiple substitution pairs to the same design space substitution map.
| | 1.0.0 | Functionality | Drag Subdivisions | You should be able to drag the axis subdivisions freely to resize and reposition the grid.
| | 1.0.0 | Functionality | Error Handling | You should get a nice error message if you drag a non-variable, non-`.ttf` file into the visualizer.
| | 1.0.0 | Documentation | Walkthrough | Descriptions of how to use each feature, embedded into the application as tuturial text or help screens.
| | 1.0.0 | Functionality | Existing `GSUB` | Make it easier to add a generated `GSUB` table to a pre-existing GSUB table.
| | 1.0.0 | UI | Testing | Review app at different screen sizes, and number of axes.

### Version 1.1.0

| Done | Version | Category | Feature | Description |
| --- | --- | --- | --- | --- |
| | 1.1.0 | Optimization | Generated Cells | Optimize generated cells so as to minimize the total number of cells.
| | 1.1.0 | Functionality | Zoom the grid | Make it easy to zoom and pan on the visualizer grid for more detail (maybe).
| | 1.1.0 | UI | Dark Mode | Make an `occupantfonts.com`-esque dark mode toggle.


### Version 1.2.0

| Done | Version | Category | Feature | Description |
| --- | --- | --- | --- | --- |
| | 1.2.0 | Functionality | Re-subdivision | Allow the number of grid divisions to be changed without destroying the state of the visualizer.


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
