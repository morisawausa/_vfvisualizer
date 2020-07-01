# Variable Font Visualizer
**Current Version: 0.9.0, in development.**
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

It's possible to set up and manage all your substitutions and subordinates through the visualizer interface.  However, this can be a time consuming process in itself. Because of this, the visualizer provides some naming conventions The variable font visualizer will automatically generate susbtitution and subordinate sets for you, if you name your substitution glyphs in the following parts. Each of the parts is joined together with a separator. We use a period (`.`) to start off the string, and then underscores (`_`) inside it.

|   | Base Glyph Name | Tag | Substitution Class | Instance (optional) |
| - | - | - | - | - |
| **Pattern** | `{glyph}` | `sub` | `{class}` | `{id}`
| **`Q.sub_bar`** | `Q` | `sub` | `bar` |
| **`Oslash.sub_bar`** | `Oslash` | `sub` | `bar` |
| **`won.sub_bar_1`** | `won` | `sub` | `bar` | `1`
| **`won.sub_bar_2`** | `won` | `sub` | `bar` | `2`
| **Notes** | This is the name of the glyph for which this substitution applies. | This tag identifies this glyph as a substitution. All substitution glyphs have this tag, which makes them easily searchable. | The class name is an arbitrary identifier that groups substitutions that should follow the same pattern together. | The instance identifier is a unique per-base-glyph, and allows for multipls substitutions per base-glyph. If there is only one substitute for the base glyph in the class, no instance id is needed.

Substitutions are grouped together as subordinates under two conditions:

1. The two substitutions have the same Substitution Class (the `bar` in the examples above), and
2. The two substitions have the same number of substitutes.

If these two conditions hold, then the susbtitutions will be grouped together as subordinates. If either of them does not hold, then the substitutions will not be grouped together.

As a caveat: If you use this notation, then no other glyph names in your project should contain `.sub_` (this is the string our preprocessor uses to identify substitutions) as a substring in their names. Hopefully this isn't too arduous of a restriction 😊.






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


#### 4. Preparing and Cleaning your `.designspace`

When your `.designspace` file comes out of `glyphs2ufo`, it's not always 100% ready for the visualizer. Depending on the settings of your Glyphs file, the `glyph2ufo` tool will attempt to remap your axis coordinates to standard coordinates specified by the OpenType spec.

For example, if you have a `wght` axis ranging from `0` to `1000`, the tool will attempt to remap this axes to `[100, 900]`.

This is a problem for us, since we need to specify our substitituions in terms of the coordinate system we defined (`0` to `1000`), not some other one. To make sure of this, we'll need to modify the `<axes>` element in the `.designspace` file.

When we generates a three axis variable font (containing Weight masters, Width masters, and virtual X-height masters) from Glyphs, we got a `.designspace` file with the following axis tag:

```xml
<axes>
  <axis tag="wght" name="Weight" minimum="100" maximum="900" default="492.307692">
    <map input="100" output="0"/>
    <map input="200" output="125"/>
    <map input="300" output="250"/>
    <map input="500" output="510"/>
    <map input="700" output="825"/>
    <map input="900" output="1000"/>
  </axis>
  <axis tag="wdth" name="Width" minimum="50" maximum="200" default="100">
    <map input="50" output="0"/>
    <map input="75" output="250"/>
    <map input="100" output="500"/>
    <map input="125" output="750"/>
    <map input="200" output="1000"/>
  </axis>
  <axis tag="xhgt" name="Xheight" minimum="0" maximum="0" default="0"/>
</axes>
```

Notice that our range for the weight and width axes, both `0` to `1000`, have been replaced by the OpenType Spec recommended values. These recommended values are specified in the minimum and maximum of each `<axis>` tag, and the mapping from our range to the recommended range is implemented with `<map>` tags.

The key thing to know here is that these `<map>` elements are applied only after all other data in the `.designspace` file has been specified. The positions of masters and instances, as well as the location of feature variations, are specified in the **original range**, `0` to `1000`, not the mapped range of `100` to `900` (in the case of weight). The visualizer needs to produce features in the original range, not the mapped range.

To do this, we can just delete the `<map>` elements and make sure the `<axis>` tags have the original ranges. If you like, you can keep the mapped table for later, and paste it back in after you've generated the sequence. To prepare for the visualizer, we updated the table above to the following one:

```xml
<axes>
  <axis tag="wght" name="Weight" minimum="0" maximum="1000" default="500" />
  <axis tag="wdth" name="Width" minimum="0" maximum="1000" default="500"/>
  <axis tag="xhgt" name="Xheight" minimum="0" maximum="100" default="0"/>
</axes>
```

Now that the mapping is removed, the visualizer will generate features using the correct, original coordinate system for the axes.

##### A Note About Virtual Masters

While you're doing this, it's a good idea to check the ranges on your axis tags, too. If you're using virtual masters to implement axes in Glyphs, the export process can sometimes collapse these axes onto *no* range, which causes `.ttf` compilation to fail.

When we generated an `xhgt` axis using virtual masters the result axis in the `.designspace` file was specified as going from `0` to `0`, when we wanted `0` to `100`. A quick change in the `<axis>` tag for that axis solved the problem.


#### 5. Generating a `.ttf`

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

#### 6. Generating Rules

Use the visualizer to generate rules. (Textual walkthrough coming soon!)

#### 7. Updating the `.designspace`

Once you have a `<rules>` table generated and ready to go, you can copy and paste it into the `.designspace` file. I usually paste the `<rules>` XML element into the file near the top: right below the `</axes>` tag.

#### 8. Generating the production `.ttf`

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

### AGL Glyph Name Replacements

**Update:** This is irrellevant if you're using the designspace method discussed above. Using the `--no-production-names` flag with `fontmake` will avoid converting your glyph names to production names, which is essential for using the designspace method..

~The [Adobe Glyph List](https://github.com/adobe-type-tools/agl-specification) specification provides a list of standard glyph names. The Glyphs software automatically [normalizes your glyphnames to this specification](https://glyphsapp.com/tutorials/getting-your-glyph-names-right). This is great for standards compliance, but bad for glyph discovery in the visualizer (which asks you to specify glyphs by name). In general, most of your basic Latin, Greek, and Cyrillic glyph names will be fine, if you're following the spec. However, many symbols get converted to their unicode identifiers. This means that to set up substitutions for these glyphs, you have to search for their unicode identifiers, rather than their internal glyph names. To find `won`, you have to search for `uni20A9`.~


## Resources

This is just a list of links to prior work that's been done on the subject.

- [Overview of Feature Variations](https://github.com/irenevl/variable-fonts-with-feature-variations). This is a super useful resource that walks through manually making feature variations with the GSUB table. Basically, it's this process that we're trying to improve a bit.
