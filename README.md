# FluentUI Editable DetailsList

## Overview
Forks the main FluentUI Editable DetailsList to add new functionality

Updates include:

### New "EditableGrid" Features
>- "enablePanelEdit" prop on EditableGrid allows for editing all or custom fields (see below) for a selected grid row via an edit panel that **prepopulates** fields with current values. This acts similar to "enableBulkEdit" but is only allowed for one row selection and also prefills data.
>- "customEditPanelColumns" prop on EditableGrid allows user to define custom fields to show when editing rows via the panel. This affects both "enablePanelEdit" and "enableBulkEdit" options. This enables the grid to show a subset of the fields per item while the panel editing to show a larger subset - particularly useful when there are over 50 fields to edit, but we only want to actually display 10 fields in the grid.
>- Added "aboveStickyContent" and "belowStickyContent" props to EditableGrid. This provides ability to have above/below sticky content render in the grid. This is done via manipulation of the ScrollablePane ref. Above/Below content will apply padding to the ScrollablePane DIV element so rows don't become obstructed. This content can be dynamic - the grid will update the sticky content if you pass in a new HTMLDivElement.
>- Provided "prependRowEditActions" prop on EditableGrid when "enableRowEdit" is set to TRUE. This allows the "Actions" column to appear as the first column on the grid (rather than the last).
>- "EnableSaveText" prop added to EditableGrid which allows customisation of the "Submit" button text and arial-label.
>- Marquee Selection now optional in EditableGrid options. This is a way to get rid of the current "mouse drag" selection which doesn't select multiple rows anyways. use "enableMarqueeSelection".
>- New callback function "onGridReset" runs after grid data is reset. Useful for clear search box text etc. Returns backup grid data after it has been reset.
>- New callback function "onGridEditStateChange" runs after grid edit state is changed. Useful to track data manipulation. Returns a boolean.
>- New callback function "onGridSort" runs after grid data is sorted. Returns sorted grid data as it is currently displayed and the column that is currently sorted by (as an "IColumn").
>- New callback function "onGridFilter" runs after grid data is filtered. Returns filtered grid data as it is currently displayed.
>- "rowMuteOptions" added as an option. If property inside IRowMute "enableRowMute" is set to 'true', "Actions" column will provide ability for rows to be "muted" and "unmuted". By default, this will add a class to the row in question called "muted" and will set its opacity to "0.2" and apply a grayscale filter. This will also trigger a grid update and muted rows will be logged as items which have had the **Operation** of **Mute**. This functionality is meant to cover all use cases for both making a row less prominent and for marking rows as "hidden" for post-data manipulation. As such, mute and umute classes applied to the row are customisable - as is the default opacity applied. Furthermore, the icon text of "Mute"/"Unmute" is customisable too. 

### New "IColumnConfig" Features
>- "onCustomRender" prop on IColumnConfig allows for custom rendering of the column without breaking "editing" capabilities
>- Provided ability for columns (IColumnConfig) to have the "isSortedByDefault" prop. It allows the configured column to be sorted by default by showing the sort indicator when the grid is initially rendered. Note: this does not dynamically sort the grid, just a visual indicator of the current data and how it is sorted when grid initialises. 
>- ILinkOptions now has a new "isFocusable" prop which allows links in the grid to have their "data-is-focusable" controlled.
>- Added "Checkbox" control to column's "inputType" (use via EditControlType enum). Use this to render a boolean-type field as a checkbox.

### Bug Fixes
>- Reset Data now properly updates currently selected item with changes.
>- "Filter" modal now correctly changes operators when switching between columns if the data type is the same between previous and new selected column. Otherwise, it will clear the current operator and force a new operator selection. (Example: going from "number" to "number" columns will retain the currently selected operator, but going from "number" to "string" will force user to select a new operator).
>- Made "Action" column buttons non-focusable so as not to set focus on them unintentially after editing cells has completed.
>- "Key" props added to controls in edit panel to stop console errors.
>- Operation enum was exported as "type" and therefore could not be used as intended. Removed "type" from index.tsx Operation export.
>- Having data with a "prototype" method will no longer cause grid to crash of grid reset if method is used during rendering.

### Enhancements
>- Updated office-ui-fabric-react version to latest.
>- Added exported enum "DataType" that acts as a string. This can be used in the "IColumnConfig" prop "dataType" to easily know data types available. Currently contains 'string', 'number', 'decimal', 'date', and 'calculated'. "calculated" data types do not appear in edit panels regardless of their "editable" state. Useful when adding new row data but a column exists only as a calculation/amalgamation of other column data.
>- "Filter" modal now provides a better UX by showing/disabling dropdowns based on state.
>- "Filter" modal filter button will remain disabled until all inputs are filled to prevent null exceptions during runtime.
>- IColumnConfig can utilise inherited "className" and "headerClassName" props correctly from IColumn when rendering in EditableGrid.
>- IColumnConfig can now utilise inherited "isMultiline" prop correctly from IColumn and render a span which has "white-space: pre-line".
>- enableSave "Submit" button now only becomes enabled when the grid's state is "edited". Before, you could submit data without actual changes to the grid (i.e. no items being "dirty").
>- "Actions" buttons now render independently as long as at least one option is enabled (i.e. no longer dependent on "enableRowEdit" to be shown).
>- Back up grid data is now copied via a deep copy mechanism, copying the object as is, including prototype methods in the tree.
>- Back up grid data is sorted in the background when a column's sorting is triggered. This way, resetting grid data is able to keep the correct and current sort state that the grid is in.

### Experimental
>- New "decimal" data type now allows up to 2 decimals via regex. Still strips commas and other alpha characters (except "."). Works same as "number" otherwise.

### New Bugs and Issues (newly introduced)
>- "Decimal" data type will return a string if the inputted value contains one period and no decimals ("81.") or contains one period and exactly one decimal ("81.0").

### Existing Bugs and Issues (from original code)
>- "onChange" on IColumnConfig causes filtered items to reset filtered state, thus showing all grid data.
>- "onChange" on IColumnConfig does not deeply copy grid data causing "prototype" methods to get lost.
>- Adding a row, either blank or with data, does not use deeply copied grid data causing "prototype" methods to get lost.
