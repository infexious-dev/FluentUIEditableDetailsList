# FluentUI Editable DetailsList

## Overview
Forks the main FluentUI Editable DetailsList to add new functionality

New updates include:

### New "EditableGrid" Features
>- "enablePanelEdit" prop on EditableGrid allows for editing all or custom fields (see below) for a selected grid row via an edit panel that **prepopulates** fields with current values. This acts similar to "enableBulkEdit" but is only allowed for one row selection and also prefills data.
>- "customEditPanelColumns" prop on EditableGrid allows user to define custom fields to show when editing rows via the panel. This affects both "enablePanelEdit" and "enableBulkEdit" options. This enables the grid to show a subset of the fields per item while the panel editing to show a larger subset - particularly useful when there are over 50 fields to edit, but we only want to actually display 10 fields in the grid.
>- Added "aboveStickyContent" and "belowStickyContent" props to EditableGrid. This provides ability to have above/below sticky content render in the grid. This is done via manipulation of the ScrollablePane ref. Above/Below content will apply padding to the ScrollablePane DIV element so rows don't become obstructed. This content can be dynamic - the grid will update the sticky content if you pass in a new HTMLDivElement.
>- Provided "prependRowEditActions" prop on EditableGrid when "enableRowEdit" is set to TRUE. This allows the "Actions" column to appear as the first column on the grid (rather than the last).
>- "EnableSaveText" prop added to EditableGrid which allows customisation of the "Submit" button text and arial-label.
>- Marquee Selection now optional in EditableGrid options. This is a way to get rid of the current "mouse drag" selection which doesn't select multiple rows anyways. use "enableMarqueeSelection".
>- New function "onGridReset" callback available to run after grid data is reset. Useful for clear search box text etc. Returns grid data.
>- "rowMuteOptions" added as an option. If property inside IRowMute "enableRowMute" is set to 'true', "Actions" column will provide ability for rows to be "muted" and "unmuted". By default, this will add a class to the row in question called "muted" and will set its opacity to "0.4". This will also trigger a grid update and muted rows will be logged as items which have had the **Operation** of **Mute**. Mute and umute classes are customisable - as is the default opacity applied. This functionality is meant to cover all use cases for both making a row less prominent and for marking rows as "hidden" for post-data manipulation.

### New "IColumnConfig" Features
>- "onCustomRender" prop on IColumnConfig allows for custom rendering of the column without breaking "editing" capabilities
>- Provided ability for columns (IColumnConfig) to have the "isSortedByDefault" prop. It allows the configured column to be sorted (including showing the sort indicator) when the grid is initially rendered.
>- ILinkOptions now has a new "isFocusable" prop which allows links in the grid to have their "data-is-focusable" controlled.

### Bug Fixes
>- Reset Data now properly updates currently selected item with changes.
>- "Filter" modal now correctly changes operators when switching between columns if the data type is the same between previous and new selected column. Otherwise, it will clear the current operator and force a new operator selection. (Example: going from "number" to "number" columns will retain the currently selected operator, but going from "number" to "string" will force user to select a new operator).
>- "onChange" on IColumnConfig no longer causes filtered items to reset to showing all grid data.
>- Made "Action" column buttons non-focusable so as not to set focus on them unintentially after editing cells has completed.
>- "Key" props added to controls in edit panel to stop console errors.
>- Operation enum was exported as "type" and therefore could not be used as intended. Removed "type" from index.tsx Operation export.

### Enhancements
>- Updated office-ui-fabric-react version to latest.
>- New "decimal" data type now allows up to 2 decimals via regex. Still strips commas and other alpha characters (except "."). Works same as "number" otherwise.
>- "Filter" modal now provides a better UX by showing/disabling dropdowns based on state.
>- "Filter" modal filter button will remain disabled until all inputs are filled to prevent null exceptions during runtime.
>- IColumnConfig can utilise inherited "className" and "headerClassName" props correctly from IColumn when rendering in EditableGrid.
>- IColumnConfig can now utilise inherited "isMultiline" prop correctly from IColumn and render a span which has "white-space: pre-line".
>- enableSave "Submit" button now only becomes enabled when the grid's state is "edited". Before, you could submit data without actual changes to the grid (i.e. no items being "dirty").
>- "Actions" buttons now render independently as long as at least one option is enabled (i.e. no longer dependent on "enableRowEdit" to be shown).
