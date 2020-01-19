# node-terminal-menu
Simple menu widgets for the terminal, in JavaScript.

Two widgets are provided:
- A vertical menu, using one line per option
- A tabular menu, displaying options in a specified number of columns

The widgets expect keyboard events to be handled by the
[keypress](https://github.com/TooTallNate/keypress) module, which must
be set up by the application. See the examples for more details.


# Installation
As usual with node:
```
npm install node-terminal-menu --save
```

# Examples
See the code examples in the `tests` directory.

# Usage

## Vertical menu
```
const { verticalMenu } = require('node-terminal-menu')

let menuKeyHandler = verticalMenu(config)
```

**Config object**:
- **options**: required - an array of strings with the list of menu options to display.
- **done**: required - a callback function that will be invoked when the user selects an option. The option index will be passed as a parameter to the callback.
- **selection**: optional - the preselected menu item. Defaults to 0.

The call to `verticalMenu` returns a key event listener that can be used to listen to `keypress` events. That way, when the user presses arrow keys, the listener will update the menu selection accordingly, and when the user presses *return* or *escape*, the **done** callback will be invoked.

## Table menu
```
const { tableMenu } = require('node-terminal-menu')

let menuKeyHandler = tableMenu(config)
```

**Config object**:
- **options**: required - an array of strings with the list of menu options to display.
- **done**: required - a callback function that will be invoked when the user selects an option. The option index will be passed as a parameter to the callback.
- **columns**: required - the number of columns in the table.
- **columnWidth**: required - the width of each column.
- **selection**: optional - the preselected menu item. Defaults to 0.

The call to `tableMenu` returns a key event listener, with the same behavior as the call to `verticalMenu`.

## Computing the table menu layout

The **columns** and **columnWidth** properties can be provided by the user, or can be computed via the `computeTableLayout` helper function:

```
let [ columns, columnWidth ] = computeTableLayout(options)
```

The function takes the array of options and computes the number of columns and their width, based on the width of the options and the terminal width in characters. It supports two optional parameters:
- **gap**: the separation between columns - defaults to 2
- **totalWidth**: the table width - defaults to the number of columns of the terminal
