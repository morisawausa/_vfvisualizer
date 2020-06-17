# Roadmap

*This document outlines our roadmap for future development.*

## Version 1.0.0

| Done | Version | Category | Feature | Description |
| --- | --- | --- | --- | --- |
| ✅| 0.9.0 | UI | Button States | Make the Button States more legible with hover, etc.
| ✅| 0.9.0 | UI | Generate Table | Make the generate table button larger and clearer as this is a significant process step.
| ✅| 0.9.0 | UI | Copy Table Button | Make sure the copy table button actually copies the table...
| ✅| 0.9.0 | Functionality | Delete Substitutions| Self Explanitory
| ✅| 0.9.0 | Functionality | >2 Substitutions | You should be able to apply multiple substitions to the same base glyph in one design space map.  
| ✅| 0.9.0 | Functionality | >1 Substitution Set per Map | You should be able to assign multiple substitution pairs to the same design space substitution map.
| ✅ | 0.9.0 | Functionality | Autopopulate | There should be some basic intelligence built in to the substitution system to generate substitutions based on suffixes. For example, a substitution for `{x}` to `{x}.sub_{y}` should automatically be set up in the grid when you load a font. **Note:** Naming conventions must be determined ahead of time and thought through for this feature to be anything other than annoying.
| ✅ | 0.9.0 | UI | Subs | Add colored background to the glyphs in the substitution pane to help communicate where different subs apply.
|   | 0.9.0 | UI | Output | Add controls to output pane. Finesse styling.
| ✅ | 0.9.0 | UI | Arrows | Make sure the arrows are differentiated. For example, the arrows to send glyphs to the grid could be different from the substitution order.
| ✅ | 0.9.0 | UI | Borders | Make sure the borders are consistent (review AxisControl component).
| ✅ | 0.9.0 | UI | Metadata | Remove Unicode Count from font metadata. Remove extra line from Font Metadata Component.
|   | 1.0.0 | UI | Glyph Selection | Refine the UI for the glyph selections. Make is smaller, and get rid of the dumb 'choose' thing.
|   | 1.0.0 | UI | Axis Location Input | Add a UI Input Field for manual input into the axis positions sliders, to make it easier to jump to a location.
|   | 1.0.0 | UI | Disable Active Axis Sliders  | Make sure axes that are assigend to grid dimensions have their axis controls sliders disabled or grayed out.
|   | 1.0.0 | Functionality | Show instances | Show where instances are located in the grid as an overlay
|   | 1.0.0 | Functionality | No duplicates | remove assigned glyphs from the searchable glyphs list.
|   | 1.0.0 | Functionality | Saved States | As you work, your progress should be serialized and saved to any available persistance layer, like `LocalStorage`. When you drop a font you were previously working on into the visualizer, the same state should be loaded.
|   | 1.0.0 | Functionality | Error Handling | You should get a nice error message if you drag a non-variable, non-`.ttf` file into the visualizer.
|   | 1.0.0 | Documentation | Walkthrough | Descriptions of how to use each feature, embedded into the application as tuturial text or help screens.
|   | 1.0.0 | Documentation | Landing Screen | Redesign landing screen so it makes a bit more sense with the rest of the application.
|   | ~1.0.0~ | ~Functionality~ | ~Existing `GSUB`~ | ~Make it easier to add a generated `GSUB` table to a pre-existing GSUB table.~

## Version 1.1.0

| Done | Version | Category | Feature | Description |
| --- | --- | --- | --- | --- |
|   | 1.1.0 | Functionality | Axis Labels | Axes should have a labelling system which shows which axis is assigned to which planar dimension, and also allows for draggable subdivisions.
|   | 1.1.0 | UI | Keyboard Shortcuts | Add keyboard shortcuts for new substitution, and toggle subordinates.
|   | 1.1.0 | Optimization | Generated Cells | Optimize generated cells so as to minimize the total number of cells.
|   | 1.1.0 | Functionality | Zoom the grid | Make it easy to zoom and pan on the visualizer grid for more detail (maybe).
|   | 1.1.0 | UI | Testing | Review app at smaller screen-heights (it breaks right now).
|   | 1.1.0 | UI | Color | Use the OCC color palette where relevant. This may require a version of the color pallette that works for tools, rather than brand collateral.
|   | 1.1.0 | UI | Dark Mode | Make an `occupantfonts.com`-esque dark mode toggle.
|   | 1.1.0 | UI | Drag | Click and drag to toggle state on multiple grid cells at once, like the prototype.
|   | 1.1.0 | Functionality | Undo button | Self Explanitory

## Version 1.2.0

| Done | Version | Category | Feature | Description |
| --- | --- | --- | --- | --- |
|   | 1.2.0 | Functionality | Re-subdivision | Allow the number of grid divisions to be changed without destroying the state of the visualizer.
|   | 1.2.0 | Functionality | Custom Naming Conventions | Build an interface to allow folks to set their own naming conventions for autopopulation of substitutions and subordinates.
