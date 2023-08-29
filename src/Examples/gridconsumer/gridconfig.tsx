// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { NumberAndDateOperators, StringOperators } from "../../libs/types/cellstyleruletype";
import { IColumnConfig } from "../../libs/types/columnconfigtype";
import { EditControlType } from "../../libs/types/editcontroltype";
import { CellHover } from "./hoverComponent";
import { DataType } from "../../libs/types/datatype";
import { IDetailsColumnStyles } from "office-ui-fabric-react";

const headerStyle: Partial<IDetailsColumnStyles> = { cellTitle: { backgroundColor: "rgb(0, 120, 212)", color: "#fff" }, sortIcon: { color: '#fff' } };

export const GridColumnConfig: IColumnConfig[] =
    [
        {
            key: 'id',
            name: 'ID',
            text: 'ID',
            editable: false,
            dataType: DataType.number,
            minWidth: 40,
            maxWidth: 80,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            applyColumnFilter: true,
            disableSort: false,
            isSortedByDefault: true,
            styles: headerStyle
        },
        {
            key: 'check',
            name: 'Check',
            text: 'Check',
            editable: true,
            minWidth: 50,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            applyColumnFilter: true,
            disableSort: false,
            inputType: EditControlType.Checkbox
        },
        {
            key: 'customerhovercol',
            name: 'Custom Hover Column',
            text: 'Custom Hover Column',
            editable: false,
            dataType: 'string',
            minWidth: 150,
            maxWidth: 150,
            isResizable: true,
            includeColumnInExport: false,
            includeColumnInSearch: false,
            applyColumnFilter: false,
            disableSort: true,
            hoverComponentOptions: { enable: true, hoverChildComponent: <CellHover customProps={{ someProp: '' }} /> }
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
            editableOnlyInPanel: true,
            dataType: 'number',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            applyColumnFilter: true
        },
        {
            key: 'nameage',
            name: 'Name // Age',
            text: 'Name // Age',
            editable: false,
            dataType: DataType.calculated,
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            applyColumnFilter: true,
            //onCustomRender: (item: GridItemsType) => { return item.getNameAndAge() },
        },
        {
            key: 'designation',
            name: 'Designation',
            text: 'Designation',
            editable: true,
            dataType: 'string',
            minWidth: 100,
            maxWidth: 100,
            editableOnlyInPanel: true,
            panelEditDisabledUntil: (item: any) => {
                return item?.salary?.value < 50000
            },
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
            dataType: DataType.decimal,
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            includeColumnInExport: false,
            includeColumnInSearch: true,
            applyColumnFilter: true,
            cellStyleRule: {
                enable: true,
                rule: {
                    operator: NumberAndDateOperators.LESSTHAN,
                    value: 50000
                },
                whenTrue: { textColor: '#EF5350', fontWeight: 'bold' },
                whenFalse: { textColor: '#9CCC65' }
            },
            onCustomRender: (item) => { return <div>{item.salary !== null && item.salary !== undefined ? "$" + item.salary : null}</div> }
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
            dropdownValues: (item: any) => { // function type dropdown values
                return ([
                    { key: 'other', text: item?.name ? item.name + ' dropdown' : '' },
                    { key: 'weekly', text: 'Weekly' },
                    { key: 'biweekly', text: 'Bi-Weekly' },
                    { key: 'monthly', text: 'Monthly' }
                ])
            },
            // dropdownValues:
            //     [
            //         { key: 'weekly', text: 'Weekly1' },
            //         { key: 'biweekly', text: 'Bi-Weekly' },
            //         { key: 'monthly', text: 'Monthly' }
            //     ]
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
                pickerTags: ['Employment Type1', 'EMployment Type2', 'Employment Type3', 'Employment Type4', 'Employment Type5', 'Employment Type6', 'Employment Type7', 'Employment Type8', 'Employment Type9', 'Employment Type10', 'Employment Type11', 'Employment Type12'],
                minCharLimitForSuggestions: 2,
                tagsLimit: 1,
                pickerDescriptionOptions: {
                    enabled: true,
                    values: [
                        { key: 'Employment Type1', description: 'Employment Type1 Description' },
                        { key: 'EMployment Type2', description: 'Employment Type2 Description' },
                        { key: 'Employment Type3', description: 'Employment Type3 Description' },
                        { key: 'Employment Type4', description: 'Employment Type4 Description' },
                        { key: 'Employment Type5', description: 'Employment Type5 Description' },
                        { key: 'Employment Type6', description: 'Employment Type6 Description' },
                        { key: 'Employment Type7', description: 'Employment Type7 Description' },
                        { key: 'Employment Type8', description: 'Employment Type8 Description' },
                        { key: 'Employment Type9', description: 'Employment Type9 Description' },
                        { key: 'Employment Type10', description: 'Employment Type10 Description' },
                        { key: 'Employment Type11', description: 'Employment Type11 Description' },
                        { key: 'Employment Type12', description: 'Employment Type12 Description' },
                    ]
                },
                suggestionsRule: StringOperators.STARTSWITH
            }
        },
        {
            key: 'employeelink',
            name: 'Employee Profile Link',
            text: 'Employee Profile Link',
            editable: false,
            dataType: DataType.string,
            minWidth: 150,
            maxWidth: 150,
            isResizable: true,
            includeColumnInExport: false,
            includeColumnInSearch: false,
            inputType: EditControlType.Link,
            linkOptions: {
                onClick: () => {     // onClick takes higher precedence over href. If both are enabled, the grid will trigger onClick
                    alert('clicked')
                },
                isFocusable: false,
                //href: 'https://www.bing.com/', 
                disabled: false
            }
        }
    ];

export const GridColumnConfigCustomPanelEdit: IColumnConfig[] =
    [
        {
            key: 'dateofjoining',
            name: 'Date of Joining',
            text: 'Date of Joining',
            editable: true,
            dataType: DataType.date,
            minWidth: 150,
            maxWidth: 150,
            isResizable: true,
            includeColumnInExport: true,
            includeColumnInSearch: true,
            inputType: EditControlType.Date
        }
    ];

export class GridItemsType {
    id: number;
    check: boolean;
    customerhovercol: string;
    name: string;
    age: number;
    designation: string | undefined;
    salary: number;
    dateofjoining: string;
    payrolltype: string;
    employmenttype: string;
    employeelink: string;
    hiddenstring?: string;

    // public getNameAndAge(): string {
    //     return this.name + ' with ' + this.age + ' years of age';
    // };
};