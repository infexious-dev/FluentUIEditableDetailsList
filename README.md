# FluentUI Editable DetailsList

## Overview
Forks the main FluentUI Editable DetailsList to add new functionality

New features include:
>- onCustomRender on IColumnConfig to allow for custom rendering of the column without breaking "editing" capabilities
>- enablePanelEdit on EditableGrid to allow for editing all or custom fields (see below) for a selected grid row via an edit panel that prepopulates fields with current values. This acts similar to "enableBulkEdit" but is only allowed for one row selection and also prefills data.
>- customEditPanelColumns on EditableGrid allows user to define custom fields to show when editing rows via the panel. This affects both "enablePanelEdit" and "enableBulkEdit" options. This enables the grid to show a subset of the fields per item while the panel editing to show a larger subset - particularly useful when there are over 50 fields to edit, but we only want to actually display 10 fields in the grid.
>- enableSave "Submit" button now only becomes enabled when the grid's state is "edited". Before, you could submit data without actual changes to the grid (i.e. no items being "dirty").
>- TEMPORARY enableSave "Submit" button text temporarily changed to "Save to SharePoint" until we extend options to allow for text/icon customisation of some of these grid toolbar buttons.
