# Variable Font Visualizer
**Current Version: 0.8.9, in development.**
**[Current Deployed Version Available Here.](https://morisawausa.github.io/_vfvisualizer/)**


This tool provides a design space visualizer and font variation substitution manager for `.ttf` variable fonts. The tool helps with setting up glyph substitutions that depend on the design space region. It can build substititions for many different glyphs visually. Once you're done setting up substititions, the tool will generate a `<rules>` element that you can paste into a `.designspace` file.

## Terminology

The variable font visualizer is intended to help you generate OpenType feature variations. These rules determine how glyphs should be substituted depending on coordinates in designspace.

### Substitutions
A substitution is a group of glyphs that represent the same unicode point. When that unicode is requested, the glyph that is rendered depends on the current variation settings of the font.

A substitutions has a default glyph and  any number of substitutes, which are swapped in at different regions in designspace. As a table, a substitution looks something like this.

|  | Default | Substitute 1 | ... | Substitute N |
| - | --- | --- | --- | --- |
| **Glyph** | `won` | `won.sub_bar1` | ... |  `won.sub_barN`|
| **Region** | *Region 0* | *Region 1*  | ... | *Region N* |

### Substitutions with Subordinates

Oftentimes, we want multiple substitutions to follow the same pattern of regions. The visualizer supports associating multiple substitutions together as "subordinates".

|  | Default | Substitute |
| - | --- | --- |
| **Glyph** | `Q` | `Q.sub_bar` |
| **Glyph** | `Oslash` | `Oslash.sub_bar` |
| **Glyph** | `oslash` | `oslash.sub_bar` |
| **Glyph** | `Oslashacute` | `Oslashacute.sub_bar` |
| **Glyph** | `oslashacute` | `oslashacute.sub_bar` |
| **Region** | *Region 1* | *Region 2* |

Just like regular substitutions, substitutions with subordinates can have any number of glyphs. The catch is, each subordinate must have **the same** number of glyphs, whatever that number is.

## Glyph Naming Conventions

**NOTE: These naming conventions are suggestions, and are not currently implemented.**

It's possible to set up and manage all your substitutions and subordinates through the visualizer interface.  However, this can be a time consuming process in itself. Because of this, the visualizer provides some naming conventions The variable font visualizer will automatically generate susbtitution and subordinate sets for you, if you name your substitution glyphs in the following parts. Each of the parts is joined together with a separator. We use a period (`.`).

|   | Base Glyph Name | Tag | Substitution Class | Instance |
| - | - | - | - | - |
| **Pattern** | *Base Glyph Name* | `sub` | *Class Name* | *Name or Number*
| **`Q.sub.bar`** | `Q` | `sub` | `bar` |
| **`Oslash.sub.bar`** | `Oslash` | `sub` | `bar` |
| **`won.sub.bar.1`** | `won` | `sub` | `bar` | `1`
| **`won.sub.bar.2`** | `won` | `sub` | `bar` | `2`
| **Notes** | This is the name of the glyph for which this substitution applies. | This tag identifies this glyph as a substitution. All substitution glyphs have this tag, which makes them easily searchable. | The class name is an arbitrary identifier that groups substitutions that should follow the same pattern together. | The instance identifier is a unique per-base-glyph, and allows for multipls substitutions per base-glyph. If there is only one substitute for the base glyph in the class, no instance id is needed.

Substitutions are grouped together as subordinates under two conditions:

1. The two substitutions have the same Substitution Class (the `bar` in the examples above), and
2. The two substitions have the same number of substitutes.

If these two conditions hold, then the susbtitutions will be grouped together as subordinates. If either of them does not hold, then the substitutions will not be grouped together.

As a caveat: If you use this notation, then no other glyph names in your project should contain `.sub.` as a substring in their names. Hopefully this isn't too arduous of a restriction 😊.






## Using the tool

There are two different ways to use this tool to build substitutions for font binaries. One way is to work with a set of `.ufo` files tied together by a `.designspace` file. The other method is to work directly with binary `.ttf` data by using the `ttx` tool. We greatly prefer the `.designspace` method, so that's what we prefer.

### The `.glyphs` via `.designspace` Method

There are a few steps that you need to take in order to use the visualizer:

1. Preparing your `.glyphs` file with private unicode assignments.
2. Installing tools (only need to do this once).
3. Generating a `.designspace` representation of your `.glyphs` file.
4. Generating a visualizer-compatible `.ttf` file.
5. Updating the `.designspace` file with the visualizer output.
6. Compiling the final, production-ready `.ttf` file.

We'll go through each of these steps in detail here.

#### 1. Preparing your Source file

In order to find the alternate glyphs that you want to use in substitutions, you need to assign them to unicode values. This lets the browser render them, and ensures that they'll be searchable by glyph name in the visualizer interface. Luckily, we can assign these glyphs to "private unicodes" that aren't assigned to key bindings by default. This means you won't be able to type them, but they'll show up in the visualizer, and the web browser will be able to render them.

[Private unicodes](http://www.unicode.org/faq/private_use.html#:~:text=There%20are%20three%20ranges%20of,Private%20Use%20Area%20(PUA).) are just unicode values in the range `E000` to `FF8F`, giving us **6,400** possible substitution glyphs. If you need more than 6,400 substitution glyphs, there are more private unicode ranges further out in "unicode space" – although if you're managing thousands of substitutions, this might not be the best tool for you.

You're free to assign any of these values to each of your substitution glyphs. It doesn't matter which. [(In fact, we have a script in the "Strings" that assignes random, private unicodes to the selected glyphs.)](https://github.com/morisawausa/_GlyphsScripts/blob/master/Strings/Assign%20Private%20Unicodes.py)

Cyrus also recommends a consistent naming convention for your substitution glyphs. He uses `{glyph name}.sub_bar` for most glyphs with this kind of behavior. This also makes it easy to search for substitutions, by searching for "sub" or "bar" in the visualizer.


#### 2. Installing Tools

You might not have the required commands for building `.ufo` files and font binaries installed right now. You can install all the required tools (`glyphs2ufo` and `fontmake`) by installing the `fontmake` package. To do this, open your terminal and run:

```sh
pip3 install fontmake
```

This will add both of these tools to your system, and make them accessible from your terminal.

#### 3. Generating a `.designspace`

Next, we need to generate a `.designspace` file with `.ufo` files for each master. This is pretty easy with the `glyphs2ufo` tool, a [command line tool](https://github.com/daltonmaag/glyphs2ufo) which does exactly what it sounds like.

To start, you need to navigate to your project folder. To do this, find the folder in Finder. Type `cd ` (with a space after) into your terminal, and then drag the folder icon into the terminal. You should get something like this:

```sh
cd path/to/my/project/folder
```

with some long filesystem path to the folder you dragged. Hit enter to go to that folder in your terminal.

Now that you're in the proper folder in your terminal, we can run the `glyphs2ufo` command. Type:

```sh
glyphs2ufo GlyphsFile.glyphs -m ufos
```

This will generate a set of `.ufo` files and a `.designspace` file, and put them into an new folder called `ufos` in your current directory.

*Note: theoretically, it should be possible to roundtrip back to a glyphs file from your designspace file. So, after you paste the `<rules>` output from your designspace file, you might be able to bring those rules back into glyphs, and export from there. However, I have not tested this, and do not know how well this kind of roundtrip works. So, it's best to generate substitutions as the last step in your process.*


#### 4. Generating a `.ttf`

The VF visualizer works with font binaries, so we need to generate a variable `.ttf` file. We can do this with the library [`fontmake`](https://github.com/googlefonts/fontmake) from Google. `fontmake` glues together a bunch of different utilities into a single swiss-army knife.

`glyphs2ufo` generated a new folder called `ufos` for us, with all of our masters and designspace file in it. To move to that new folder, type:

```sh
cd ufos
```

Now that you're in the right folder, go ahead and build a `.ttf` for the visualizer:

```sh
fontmake -m DesignspaceFile.designspace -o variable --no-production-names
```

This command eats a `.designspace` file, and tries to compile it into a TrueType variable font. The `--no-production-names` flag specifies that we don't want to rename any of our glyphs to AGL-standards-compliant glyph names. This is important, otherwise the `<rules>` table the visualizer generates will have unicode identifiers, rather than names, for certain glyphs, and the `.designspace` file won't understand these. The final `.ttf` we build will have production names, don't worry.

If everything works properly, this command will create a new folder called `variable_ttf`, which will contain the compiled `.ttf`. That's the file that you can drag into the visualizer. If you want to open the `ufos` folder to see the new files in Finder, you can type:

```sh
open .
```

In the terminal. This should open up a finder window with the current folder. From there, you can drag the file into the visualizer: [here](https://morisawausa.github.io/_vfvisualizer).

#### 5. Generating Rules

Use the visualizer to generate rules. (Textual walkthrough coming soon!)

#### 6. Updating the `.designspace`

Once you have a `<rules>` table generated and ready to go, you can copy and paste it into the `.designspace` file. I usually paste the `<rules>` XML element into the file near the top: right below the `</axes>` tag.

#### 7. Generating the production `.ttf`

Now we're ready to compile the final `.ttf` file with all of our feature variations and substitutions. WE can use `fontmake` again:

```sh
$ fontmake -m UpdatedDesignspaceFile.designspace -o variable
```

This time, we'll have `fontmake` rename our glyphs to their production names.

At this point, you should be ready to drag the file into a testing tool like FontGoggles and check to see if your feature variations and substitutions are working properly.


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
|   | 0.9.0 | UI | Button States | Make the Button States more legible with hover, etc.
|   | 0.9.0 | UI | Generate Table | Make the generate table button larger and clearer as this is a significant process step.
| ✅| 0.9.0 | Functionality | Delete Substitutions| Self Explanitory
| ✅| 0.9.0 | Functionality | >2 Substitutions | You should be able to apply multiple substitions to the same base glyph in one design space map.  
| ✅| 0.9.0 | Functionality | >1 Substitution Set per Map | You should be able to assign multiple substitution pairs to the same design space substitution map.
| ✅ | 0.9.0 | Functionality | Autopopulate | There should be some basic intelligence built in to the substitution system to generate substitutions based on suffixes. For example, a substitution for `{x}` to `{x}.sub_{y}` should automatically be set up in the grid when you load a font. **Note:** Naming conventions must be determined ahead of time and thought through for this feature to be anything other than annoying.
| ✅ | 0.9.0 | UI | Subs | Add colored background to the glyphs in the substitution pane to help communicate where different subs apply.
|   | 0.9.0 | UI | Output | Add controls to output pane. Finesse styling.
| ✅ | 0.9.0 | UI | Arrows | Make sure the arrows are differentiated. For example, the arrows to send glyphs to the grid could be different from the substitution order.
| ✅ | 0.9.0 | UI | Borders | Make sure the borders are consistent (review AxisControl component).
| ✅ | 0.9.0 | UI | Metadata | Remove Unicode Count from font metadata. Remove extra line from Font Metadata Component.
|   | 1.0.0 | Functionality | No duplicates | remove assigned glyphs from the searchable glyphs list.
|   | 1.0.0 | Functionality | Axis Labels | Axes should have a labelling system which shows which axis is assigned to which planar dimension, and also allows for draggable subdivisions.
|   | 1.0.0 | Functionality | Error Handling | You should get a nice error message if you drag a non-variable, non-`.ttf` file into the visualizer.
|   | 1.0.0 | Documentation | Walkthrough | Descriptions of how to use each feature, embedded into the application as tuturial text or help screens.
|   | ~1.0.0~ | ~Functionality~ | ~Existing `GSUB`~ | ~Make it easier to add a generated `GSUB` table to a pre-existing GSUB table.~
|   | 1.0.0 | Functionality | Undo button | Self Explanitory
|   | 1.0.0 | UI | Testing | Review app at different screen sizes, and number of axes.
|   | 1.0.0 | UI | Color | Use the OCC color palette where relevant. This may require a version of the color pallette that works for tools, rather than brand collateral.

### Version 1.1.0

| Done | Version | Category | Feature | Description |
| --- | --- | --- | --- | --- |
|   | 1.1.0 | UI | Keyboard Shortcuts | Add keyboard shortcuts for new substitution, and toggle subordinates.
|   | 1.1.0 | Optimization | Generated Cells | Optimize generated cells so as to minimize the total number of cells.
|   | 1.1.0 | Functionality | Zoom the grid | Make it easy to zoom and pan on the visualizer grid for more detail (maybe).
|   | 1.1.0 | UI | Dark Mode | Make an `occupantfonts.com`-esque dark mode toggle.
|   | 1.1.0 | Functionality | Show instances | Show where instances are located in the grid as an overlay
|   | 1.1.0 | UI | Drag | Click and drag to toggle state on multiple grid cells at once, like the prototype.


### Version 1.2.0

| Done | Version | Category | Feature | Description |
| --- | --- | --- | --- | --- |
|   | 1.2.0 | Functionality | Re-subdivision | Allow the number of grid divisions to be changed without destroying the state of the visualizer.
|   | 1.2.0 | Functionality | Custom Naming Conventions | Build an interface to allow folks to set their own naming conventions for autopopulation of substitutions and subordinates.


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

## Resources

This is just a list of links to prior work that's been done on the subject.

- [Overview of Feature Variations](https://github.com/irenevl/variable-fonts-with-feature-variations). This is a super useful resource that walks through manually making feature variations with the GSUB table. Basically, it's this process that we're trying to improve a bit.

### AGL Glyph Name Replacements

The [Adobe Glyph List](https://github.com/adobe-type-tools/agl-specification) specification provides a list of standard glyph names. The Glyphs software automatically [normalizes your glyphnames to this specification](https://glyphsapp.com/tutorials/getting-your-glyph-names-right). This is great for standards compliance, but bad for glyph discovery in the visualizer (which asks you to specify glyphs by name). In general, most of your basic Latin, Greek, and Cyrillic glyph names will be fine, if you're following the spec. However, many symbols get converted to their unicode identifiers. This means that to set up substitutions for these glyphs, you have to search for their unicode identifiers, rather than their internal glyph names. To find `won`, you have to search for `uni20A9`.

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
