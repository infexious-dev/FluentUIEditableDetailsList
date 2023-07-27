# UPDATES IN THIS FORK

## Overview

Forks the main FluentUI Editable DetailsList to add new functionality

Updates include:

### New "EditableGrid" Features

>- "enablePanelEdit" prop on EditableGrid allows for editing all or custom fields (see below) for a selected grid row via an edit panel that **prepopulates** fields with current values. This acts similar to "enableBulkEdit" but is only allowed for one row selection and also prefills data.
>- "enableColumnEdit" prop on EditableGrid now prefills data.
>- "customEditPanelColumns" prop on EditableGrid allows user to define custom fields to show when editing rows via the panel. This affects both "enablePanelEdit" and "enableBulkEdit" options. This enables the grid to show a subset of the fields per item while the panel editing to show a larger subset - particularly useful when there are over 50 fields to edit, but we only want to actually display 10 fields in the grid.
>- "enableBulkEdit" now only works when there are two or more items selected in the grid.
>- Added "aboveStickyContent" and "belowStickyContent" props to EditableGrid. This provides ability to have above/below sticky content render in the grid. This is done via manipulation of the ScrollablePane ref. Above/Below content will apply padding to the ScrollablePane DIV element so rows don't become obstructed. This content can be dynamic - the grid will update the sticky content if you pass in a new HTMLDivElement.
>- Provided "prependRowEditActions" prop on EditableGrid when "enableRowEdit" is set to TRUE. This allows the "Actions" column to appear as the first column on the grid (rather than the last).
>- "EnableSaveText" prop added to EditableGrid which allows customisation of the "Submit" button text and arial-label.
>- Marquee Selection now optional in EditableGrid options. This is a way to get rid of the current "mouse drag" selection which doesn't select multiple rows anyways. use "enableMarqueeSelection".
>- New callback function "onGridReset" runs after grid data is reset. Useful for clear search box text etc. Returns backup grid data after it has been reset.
>- New callback function "onGridInEditChange" runs after grid's "in edit" state is changed. Useful to track if grid currently has fields that are being edited. Returns a boolean.
>- New callback function "onGridStateEditedChange" runs after grid "edited" state is changed. Useful to track data manipulation. Returns a boolean.
>- New callback function "onGridSort" runs after grid data is sorted. Returns sorted grid data as it is currently displayed and the column that is currently sorted by (as an "IColumn").
>- New callback function "onGridFilter" runs after grid data is filtered. Returns filtered grid data as it is currently displayed.
>- "rowMuteOptions" added as an option. If property inside IRowMute "enableRowMute" is set to 'true', "Actions" column will provide ability for rows to be "muted" and "unmuted". By default, this will add a class to the row in question called "muted" and will set its opacity to "0.2" and apply a grayscale filter. This will also trigger a grid update and muted rows will be logged as items which have had the **Operation** of **Mute**. This functionality is meant to cover all use cases for both making a row less prominent and for marking rows as "hidden" for post-data manipulation. As such, mute and umute classes applied to the row are customisable - as is the default opacity applied. Furthermore, the icon text of "Mute"/"Unmute" is customisable too.
>- Similar to the "onSearch" event emitter, added in "onFilter" to allow instant and custom filters outside the grid that target specific columns.
>- Added "customCommandBarItems" prop to EditableGrid. It allows the adding of custom Command Bar items.
>- Added "customCommandBarFarItems" prop to EditableGrid. It allows the adding of custom FAR Command Bar items (those items appear to the right of the grid toolbar).
>- Added "enableGridInEditIndicator" prop which allows an edit icon to appear when the grid is in edit mode.

### New "IColumnConfig" Features

>- "onCustomRender" prop on IColumnConfig allows for custom rendering of the column without breaking "editing" capabilities
>- Provided ability for columns (IColumnConfig) to have the "isSortedByDefault" prop. It allows the configured column to be sorted by default by showing the sort indicator when the grid is initially rendered. Note: this does not dynamically sort the grid, just a visual indicator of the current data and how it is sorted when grid initialises.
>- ILinkOptions now has a new "isFocusable" prop which allows links in the grid to have their "data-is-focusable" controlled.
>- Added "Checkbox" control to column's "inputType" (use via EditControlType enum). Use this to render a boolean-type field as a checkbox.
>- "dropdownValues" prop on IColumnConfig can now be a function that returns IDropdownOption[]. It accepts an "item" parameter so tailor-made dropdown options for an item are possible based on any its other properties.
>- "editableOnlyInPanel" prop on IColumnConfig allows the column to only be editable in the panel (i.e. when the "Edit Panel" is open) when the "editable" prop is "true". "editable", "editableOnlyInPanel", and not "editable" columns on the grid now have CSS classes of "editable", "editable-panel-only", and "non-editable", respectively.
>- "panelEditDisabledUntil" prop on IColumnConfig allows custom disabling of fields in the add/edit panels based on other values.

### Bug Fixes

>- Reset Data now properly updates currently selected item with changes.
>- "Filter" modal now correctly changes operators when switching between columns if the data type is the same between previous and new selected column. Otherwise, it will clear the current operator and force a new operator selection. (Example: going from "number" to "number" columns will retain the currently selected operator, but going from "number" to "string" will force user to select a new operator).
>- Made "Action" column buttons non-focusable so as not to set focus on them unintentially after editing cells has completed.
>- "Key" props added to controls in Edit and Add panels to stop console errors.
>- Operation enum was exported as "type" and therefore could not be used as intended. Removed "type" from index.tsx Operation export.
>- Having data with a "prototype" method will no longer cause grid to crash of grid reset if method is used during rendering.

### Enhancements

>- Updated office-ui-fabric-react version to latest.
>- Changed some import from office-ui-fabric-react to @fluentui/react to get the latest benefits.
>- Added exported enum "DataType" that acts as a string. This can be used in the "IColumnConfig" prop "dataType" to easily know data types available. Currently contains 'string', 'number', 'decimal', 'date', and 'calculated'. "calculated" data types do not appear in edit panels regardless of their "editable" state. Useful when adding new row data but a column exists only as a calculation/amalgamation of other column data.
>- "Filter" modal now provides a better UX by showing/disabling dropdowns based on state.
>- "Filter" modal filter button will remain disabled until all inputs are filled to prevent null exceptions during runtime.
>- IColumnConfig can utilise inherited "className" and "headerClassName" props correctly from IColumn when rendering in EditableGrid.
>- IColumnConfig can utilise inherited "styles" prop correctly from IColumn when rendering in EditableGrid.
>- IColumnConfig can now utilise inherited "isMultiline" prop correctly from IColumn and render a span which has "white-space: pre-line".
>- enableSave "Submit" button now only becomes enabled when the grid's state is "edited". Before, you could submit data without actual changes to the grid (i.e. no items being "dirty").
>- "Actions" buttons now render independently as long as at least one option is enabled (i.e. no longer dependent on "enableRowEdit" to be shown).
>- Back up grid data is now copied via a deep copy mechanism, copying the object as is, including prototype methods in the tree.
>- Back up grid data is sorted in the background when a column's sorting is triggered. This way, resetting grid data is able to keep the correct and current sort state that the grid is in.
>- EditableGrid now utilises supplied "theme".
>- Removed redundant NPM packages. Now works in React 17+ too.
>- Add/Edit panels styles updated.
>- Add/Edit panels now have a "Cancel" button.
>- Add/Edit panels now "block" user interaction (i.e. no "light" dismiss). This means the user can no longer accidentally click away from the panel to close it and potentially lose data.
>- Top-level spans that are rendered in the grid (when not editing) now have a CSS class of "span-value" for easier targetting.

### Experimental

>- New "decimal" data type now allows up to 10 decimals via regex. Still strips commas and other alpha characters (except ".")

### Gotchas

>- With the newly added functionality of having dropdown values on the IColumnConfig object to be populated with a function, this means bulk updating items' dropdowns will lead to blank values if the dropdown values are based off of other item properties.

### New Bugs and Issues (newly introduced)

>- "Muted" rows cannot be edited but can be selected and can trigger "Edit Item", "Bulk Edit", and "Update Column"
>- When using Dropdowns within the grid with the newly introduced function to populate "options", the Grid's "Edit Mode" will not dynamically update other dependent dropdowns.

### Existing Bugs and Issues (from original code)

>- "onChange" on IColumnConfig causes filtered items to reset filtered state, thus showing all grid data.
>- "onChange" on IColumnConfig does not deeply copy grid data causing "prototype" methods to get lost.
>- Adding a row, either blank or with data, does not use deeply copied grid data causing "prototype" methods to get lost.

---

# Original

# FluentUI Editable DetailsList

## Overview

FluentUI is a great UI library with some really cool controls, all adhering to Accessibility Standards.

DetailsList control of FluidUI is great when your requirement is a read-only grid. However, it does not offer any in-place editability functionality just yet.

This component(Editable DetailsList) is a wrapper over the existing DetailsList that makes in-place editability work like a dream(among many other new features).

Some of the features of the Editable Grid are:-
>
>- Single Cell Edit (in-place)
>- Single Row Edit (in-place)
>- Single Column Edit
>- Multi-Column, multi-row edit (Bulk Edit)
>- Full Edit (Edit Mode)
>- Grid Copy
>- Row Copy
>- Sorting
>- Deleting Rows
>- Adding Rows
>- Ability to Plug In Custom Component for Cell Hover
>- Default Data Export (to Excel, CSV)
>- Implement Custom Export functionality
>- Callback hook to recieve grid data in the consuming component(for Save etc.)
>- Support for various controls in grid in-place edit like TextField, Multiline TextField, DatePicker (Support for Dropdown will be released soon)
>- Flexibility to implement onChange callback on any cell value change (For cases like calculating summation of a column etc)
>- Length Validations during edit
>- Type Validations during edit
>- Rule-Based Cell Styling
>- In-built support for controls like TextField, Multiline-Textfield, Picker, Dropdown, Calendar
>- The component is completely Accessible

## Demo

[Fluent UI Editable DetailsList Demo](https://editabledetailslist.azurewebsites.net)

## Clone & Run

- clone the repository on your local machine.
- open the project
- open terminal and change directory to your project path
- type '***npm install***'
- after the installation is complete, type '***npm start***'

This starts the project on port 3000 and you are ready to play around with the Editable DetailsList

## NPM Install

    npm i fluentui-editable-grid

## Usage

    import { DetailsListLayoutMode, mergeStyles, mergeStyleSets, SelectionMode, TextField } from '@fluentui/react';
    import { EditableGrid, EditControlType, IColumnConfig, EventEmitter, EventType, NumberAndDateOperators } from 'fluentui-editable-grid';
    import { Fabric } from 'office-ui-fabric-react';
    import * as React from 'react';
    import { useState } from 'react';

    const Consumer = () => {
        const classNames = mergeStyleSets({
            controlWrapper: {
            display: 'flex',
            flexWrap: 'wrap',
            }
        });
      
    const [items, setItems] = useState<any[]>([]);
    const columns: IColumnConfig[] = [
        {
            key: 'id',
            name: 'ID',
            text: 'ID',
            editable: false,
            dataType: 'number',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            applyColumnFilter: true,
            disableSort: true
        },
        {
            key: 'customerhovercol',
            name: 'Custom Hover Column',
            text: 'Custom Hover Column',
            editable: true,
            dataType: 'string',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: false,
            includeColumnInSearch: false,
            applyColumnFilter: false,
            disableSort: true,
            hoverComponentOptions: { enable:true, hoverChildComponent: <CellHover customProps={{ someProp: '' }} /> }
        },
        {
            key: 'name',
            name: 'Name',
            text: 'Name',
            editable: true,
            dataType: 'string',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            applyColumnFilter: true
        },
        {
            key: 'age',
            name: 'Age',
            text: 'Age',
            editable: true,
            dataType: 'number',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            applyColumnFilter: true
        },
        {
            key: 'designation',
            name: 'Designation',
            text: 'Designation',
            editable: true,
            dataType: 'string',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            inputType: EditControlType.MultilineTextField,
            applyColumnFilter: true
        },
        {
            key: 'salary',
            name: 'Salary',
            text: 'Salary',
            editable: true,
            dataType: 'number',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: false,
            includeColumnInSearch: true,
            maxLength:5,
            applyColumnFilter: true,
            cellStyleRule: { 
                enable: true, 
                rule: { 
                    operator : NumberAndDateOperators.LESSTHAN, 
                    value: 50000 
                }, 
                whenTrue: { textColor: '#EF5350', fontWeight: 'bold' },
                whenFalse: { textColor: '#9CCC65' }
            }
        },
        {
            key: 'dateofjoining',
            name: 'Date of Joining',
            text: 'Date of Joining',
            editable: true,
            dataType: 'date',
            minWidth: 150,
            maxWidth: 150,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            inputType: EditControlType.Date
        },
        {
            key: 'payrolltype',
            name: 'Payroll Type',
            text: 'Payroll Type',
            editable: true,
            dataType: 'string',
            minWidth: 150,
            maxWidth: 150,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            inputType: EditControlType.DropDown,
            dropdownValues: [
                { key: 'weekly', text: 'Weekly' },
                { key: 'biweekly', text: 'Bi-Weekly' },
                { key: 'monthly', text: 'Monthly' }
            ]
        },
        {
            key: 'employmenttype',
            name: 'Employment Type',
            text: 'Employment Type',
            editable: true,
            dataType: 'string',
            minWidth: 200,
            maxWidth: 200,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            inputType: EditControlType.Picker,
            pickerOptions: {
                pickerTags: ['Employment Type1', 'Employment Type2', 'Employment Type3', 'Employment Type4', 'Employment Type5', 'Employment Type6', 'Employment Type7', 'Employment Type8', 'Employment Type9', 'Employment Type10', 'Employment Type11', 'Employment Type12'],
                minCharLimitForSuggestions: 2,
                tagsLimit: 1,
                pickerDescriptionOptions: { 
                    enabled: true, 
                    values: [
                        { key: 'Employment Type1', description: 'Employment Type1 Description'},
                        { key: 'Employment Type2', description: 'Employment Type2 Description'},
                        { key: 'Employment Type3', description: 'Employment Type3 Description'},
                        { key: 'Employment Type4', description: 'Employment Type4 Description'},
                        { key: 'Employment Type5', description: 'Employment Type5 Description'},
                        { key: 'Employment Type6', description: 'Employment Type6 Description'},
                        { key: 'Employment Type7', description: 'Employment Type7 Description'},
                        { key: 'Employment Type8', description: 'Employment Type8 Description'},
                        { key: 'Employment Type9', description: 'Employment Type9 Description'},
                        { key: 'Employment Type10', description: 'Employment Type10 Description'},
                        { key: 'Employment Type11', description: 'Employment Type11 Description'},
                        { key: 'Employment Type12', description: 'Employment Type12 Description'},
                ] },
                suggestionsRule: StringOperators.STARTSWITH
            }
        }
    ];

    const SetDummyData = () : void => {
        const dummyData = [
            {
                id: "1",
                customerhovercol: 'Hover Me',
                name: "Name1",
                age:32,
                designation:'Designation1',
                salary:57000,
                dateofjoining:'2010-04-01T14:57:10',
                payrolltype: 'Weekly',
                employmenttype: 'Employment Type11'
            },
            {
                id: "2",
                customerhovercol: 'Hover Me',
                name: "Name2",
                age:27,
                designation:'Designation2',
                salary:42000,
                dateofjoining:'2014-06-09T14:57:10',
                payrolltype: 'Monthly',
                employmenttype: 'Employment Type4'
            },
            {
                id: "3",
                customerhovercol: 'Hover Me',
                name: "Name3",
                age:35,
                designation:'Designation3',
                salary:75000,
                dateofjoining:'2005-07-02T14:57:10',
                payrolltype: 'Weekly',
                employmenttype: 'Employment Type7'
            },
            {
                id: "4",
                customerhovercol: 'Hover Me',
                name: "Name4",
                age:30,
                designation:'Designation4',
                salary:49000,
                dateofjoining:'2019-04-01T14:57:10',
                payrolltype: 'Bi-Weekly',
                employmenttype: 'Employment Type2'
            }
        ];
        setItems(dummyData);
    }

    React.useEffect(() => {
        SetDummyData();
    }, []);

    return (
        <Fabric>
            <div className={classNames.controlWrapper}>
                <TextField placeholder='Search Grid' className={mergeStyles({ width: '60vh', paddingBottom:'10px' })} onChange={(event) => EventEmitter.dispatch(EventType.onSearch, event)}/>
            </div>
            <EditableGrid
                id={1}
                columns={columns}
                items={items}
                enableCellEdit={true}
                enableExport={true}
                enableTextFieldEditMode={true}
                enableTextFieldEditModeCancel={true}
                enableGridRowsDelete={true}
                enableGridRowsAdd={true}
                height={'70vh'}
                width={'140vh'}
                position={'relative'}
                enableUnsavedEditIndicator={true}
                //onGridSave={onGridSave}
                enableGridReset={true}
                enableColumnFilters={true}
                enableColumnFilterRules={true}
                enableRowAddWithValues={{enable : true, enableRowsCounterInPanel : true}}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.multiple}
                enableRowEdit={true}
                enableRowEditCancel={true}
                enableBulkEdit={true}
                enableColumnEdit={true}
                enableSave={true}
            />
        </Fabric>
    );
    };

    export default Consumer;

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

---

*For more details please check out [Fluent UI Editable DetailsList Wiki](https://github.com/microsoft/FluentUIEditableDetailsList/wiki).*
