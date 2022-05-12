# FluentUI Editable DetailsList

## Overview
Forks the main FluentUI Editable DetailsList to add new functionality

New updates include:

### New "EditableGrid" Features
>- "enablePanelEdit" prop on EditableGrid allows for editing all or custom fields (see below) for a selected grid row via an edit panel that **prepopulates** fields with current values. This acts similar to "enableBulkEdit" but is only allowed for one row selection and also prefills data.
>- "customEditPanelColumns" prop on EditableGrid allows user to define custom fields to show when editing rows via the panel. This affects both "enablePanelEdit" and "enableBulkEdit" options. This enables the grid to show a subset of the fields per item while the panel editing to show a larger subset - particularly useful when there are over 50 fields to edit, but we only want to actually display 10 fields in the grid.
>- Added "aboveStickyContent" and "belowStickyContent" props to EditableGrid. This provides ability to have above/below sticky content render in the grid. This is done via manipulation of the ScrollablePane ref. Above/Below content will apply padding to the ScrollablePane DIV element so rows don't become obstructed.
>- Provided "prependRowEditActions" prop on EditableGrid when "enableRowEdit" is set to TRUE. This allows the "Actions" column to appear as the first column on the grid (rather than the last).
>- "EnableSaveText" prop added to EditableGrid which allows customisation of the "Submit" button text and arial-label.
>- Marquee Selection now optional in EditableGrid options. This is a way to get rid of the current "mouse drag" selection which doesn't select multiple rows anyways. use "enableMarqueeSelection".

### New "IColumnConfig" Features
>- "onCustomRender" prop on IColumnConfig allows for custom rendering of the column without breaking "editing" capabilities
>- Provided ability for columns (IColumnConfig) to have the "isSortedByDefault" prop. It allows the configured column to be sorted (including showing the sort indicator) when the grid is initially rendered.

### Bug Fixes
>- Reset Data now properly updates currently selected item with changes.
>- "Filter" modal now correctly changes operators when switching between columns if the data type is the same between previous and new selected column. Otherwise, it will clear the current operator and force a new operator selection. (Example: going from "number" to "number" columns will retain the currently selected operator, but going from "number" to "string" will force user to select a new operator).

### Enhancements
>- Updated office-ui-fabric-react version to latest.
>- "Number" input type now allows up to 2 decimals via regex. Still strips commas and other alpha characters (except ".").
>- "Filter" modal now provides a better UX by showing/disabling dropdowns based on state.
>- "Filter" modal filter button will remain disabled until all inputs are filled to prevent null exceptions during runtime.
>- Now IColumnConfig can utilise inherited "className" and "headerClassName" props correctly from IColumn when rendering in EditableGrid.
>- enableSave "Submit" button now only becomes enabled when the grid's state is "edited". Before, you could submit data without actual changes to the grid (i.e. no items being "dirty").
