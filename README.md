# _vfvisualizer
A visualizer and tool for setting up substitution rules for variable fonts

This is the interface prototype for a tool that helps you visualize the design space of a variable font and setup substitution rules.
Since this version is to mockup the interface, it’s currently limited to:
- choose the substitution between Q and Q.no_bar
- Magmatic Variable (minimum and maximum values of each axis are hard-coded)
- 2 axes (weight & width are hard-coded.) The idea is to allow toggling between multiple axes in the future.
- choose the number of steps or increments to display the design space grid, but the individual grid increment fields (steps) are not yet editable
- choose the formula used to display the design space grid

The interactive components aren’t fully fleshed out yet. There will be a fair amount of bugs / unexpected behavior, but this should give a design approach to the tool to play with.

## Breakpoints version
The breakpoints version allows you to define the design space with gridlines.
- You can use the subdivide the space to design the substitution areas on the X & Y.
- Once you’ve divied up the space, click the area to pull up the substitution menu and select the alternate glyph.
- The cursor indicates the design space coordinates.
- The gridlines are not draggable / resizable yet in this version
- The outputs do not populate in this version

## Area selection version
The area selection version allows you to define the design space by selecting the grid areas to substitute.

- Click to begin selecting (mouseover the grid to select), and click to end the selection.
- Select the substitution radio button or ⌘ + click to pull up the substitution menu and select the alternate glyph.
- Any additional selection areas won’t be added until you select a substitution for those areas.
- The numbers under input field indicates the design space coordinates. These fields are not yet editable but will eventually allow direct input and locking X / Y to target specific coordinates.
- Only one substitution area is currently supported
- The outputted rules are not yet editable from the box
