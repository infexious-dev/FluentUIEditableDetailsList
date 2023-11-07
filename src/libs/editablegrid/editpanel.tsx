// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Checkbox, DatePicker, Dropdown, IDropdownOption, ITag, Label, PrimaryButton, Stack, TextField } from "@fluentui/react";
import React, { useEffect, useState } from "react";
import { IColumnConfig } from "../types/columnconfigtype";
import { DataType } from "../types/datatype";
import { EditControlType } from "../types/editcontroltype";
import { DayPickerStrings } from "./datepickerconfig";
import { controlClass, stackStyles, textFieldStyles, verticalGapStackTokens } from "./editablegridstyles";
import { GetDefault, GetParsedFloat, GetValue, IsValidDataType, ParseType } from "./helper";
import PickerControl from "./pickercontrol/picker";
import { DefaultButton } from "@fluentui/react";

interface Props {
    onDismiss: () => any;
    onChange: any;
    columnConfigurationData: IColumnConfig[];
    isBulk: boolean;
    selectedItem: any;
}

const EditPanel = (props: Props) => {
    const updateObj: any = {};
    const [columnValuesObj, setColumnValuesObj] = useState<any>(null);

    useEffect(() => {
        let tmpColumnValuesObj: any = {};
        props.columnConfigurationData.filter(x => x.editable === true).forEach((column, index) => {
            tmpColumnValuesObj[column.key] = {
                'value': props.isBulk ? GetDefault(column.dataType) : props.selectedItem ? GetValue(column.dataType, props.selectedItem[column.key]) : GetDefault(column.dataType),
                'isChanged': false,
                'error': null,
                'dataType': column.dataType
            };
        })
        setColumnValuesObj(tmpColumnValuesObj);
    }, [props.columnConfigurationData, props.selectedItem]);

    const SetObjValues = (key: string, value: any, isChanged: boolean = true, errorMessage: string | null = null): void => {
        setColumnValuesObj({ ...columnValuesObj, [key]: { 'value': value, 'isChanged': isChanged, 'error': errorMessage, 'dataType': columnValuesObj[key]?.dataType } })
    }

    const onDropDownChange = (event: React.FormEvent<HTMLDivElement>, selectedDropdownItem: IDropdownOption | undefined, item: any): void => {
        SetObjValues(item.key, selectedDropdownItem?.text);
    }

    const onCheckboxChange = (checked: boolean | undefined, item: any): void => {
        SetObjValues(item.key, checked);
    }

    const onTextUpdate = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string, column: IColumnConfig): void => {
        if (!IsValidDataType(column.dataType, text)) {
            SetObjValues((ev.target as Element).id, text, false, `Data should be of type '${column.dataType}'`);
            return;
        }

        SetObjValues((ev.target as Element).id, ParseType(column.dataType, text));
    };

    const onPanelSubmit = (): void => {
        var objectKeys = Object.keys(columnValuesObj);
        objectKeys.forEach((objKey) => {
            if (columnValuesObj[objKey]['isChanged']) {
                let value = columnValuesObj[objKey]['value'];

                if (columnValuesObj[objKey]['dataType'] === DataType.decimal)
                    value = GetParsedFloat(value);

                updateObj[objKey] = value
            }
        });

        props.onChange(updateObj);
    };

    const onCellDateChange = (date: Date | null | undefined, item: any): void => {
        SetObjValues(item.key, date);
    };

    const onCellPickerTagListChanged = (cellPickerTagList: ITag[] | undefined, item: any): void => {
        if (cellPickerTagList && cellPickerTagList[0] && cellPickerTagList[0].name)
            SetObjValues(item.key, cellPickerTagList[0].name);
        else
            SetObjValues(item.key, '');
    }

    const createFields = (): any[] => {
        let tmpRenderObj: any[] = [];
        props.columnConfigurationData.filter(x => x.editable === true && x.dataType !== DataType.calculated).forEach((column) => {
            switch (column.inputType) {
                case EditControlType.Date:
                    tmpRenderObj.push(<DatePicker
                        key={column.key}
                        label={column.text}
                        disabled={column.panelEditDisabledUntil ? column.panelEditDisabledUntil(columnValuesObj, column) : false}
                        strings={DayPickerStrings}
                        placeholder="Select a date..."
                        ariaLabel="Select a date"
                        onSelectDate={(date) => onCellDateChange(date, column)}
                        value={columnValuesObj[column.key].value ? new Date(columnValuesObj[column.key].value) : undefined}
                    />);
                    break;
                case EditControlType.Picker:
                    tmpRenderObj.push(<div key={column.key}>
                        <span className={controlClass.pickerLabel}>{column.text}</span>
                        <PickerControl
                            arialabel={column.text}
                            selectedItemsLimit={1}
                            disabled={column.panelEditDisabledUntil ? column.panelEditDisabledUntil(columnValuesObj, column) : false}
                            defaultTags={columnValuesObj[column.key].value ? [columnValuesObj[column.key].value] : undefined}
                            pickerTags={column.pickerOptions?.pickerTags ?? []}
                            minCharLimitForSuggestions={2}
                            onTaglistChanged={(selectedItem: ITag[] | undefined) => onCellPickerTagListChanged(selectedItem, column)}
                            pickerDescriptionOptions={column.pickerOptions?.pickerDescriptionOptions}
                        /></div>);
                    break;
                case EditControlType.DropDown:
                    var selectedKey = null;
                    var sanitisedColumnItem: any = {};

                    Object.keys(columnValuesObj).forEach((key) => {
                        sanitisedColumnItem[key] = columnValuesObj[key].value;
                    });

                    (typeof column.dropdownValues === 'function' ? column.dropdownValues(sanitisedColumnItem) as IDropdownOption[] : column.dropdownValues ?? [])?.map((option) => {
                        if (option.text === columnValuesObj[column.key].value) {
                            selectedKey = option.key
                        }
                    });

                    tmpRenderObj.push(
                        <Dropdown
                            key={column.key}
                            label={column.text}
                            disabled={column.panelEditDisabledUntil ? column.panelEditDisabledUntil(columnValuesObj, column) : false}
                            options={typeof column.dropdownValues === 'function' ? column.dropdownValues(sanitisedColumnItem) as IDropdownOption[] : column.dropdownValues ?? []}
                            selectedKey={selectedKey || null}
                            onChange={(ev, selected) => onDropDownChange(ev, selected, column)}
                        />
                    );
                    break;
                case EditControlType.Checkbox:
                    tmpRenderObj.push(
                        <div key={column.key}>
                            <Label>{column.text}</Label>
                            <Checkbox
                                styles={{ root: { marginTop: 0 } }}
                                disabled={!column.editable || (column.panelEditDisabledUntil ? column.panelEditDisabledUntil(columnValuesObj, column) : false)}
                                checked={columnValuesObj[column.key].value || false}
                                onChange={(ev, checked) => onCheckboxChange(checked, column)}
                            />
                        </div>
                    );
                    break;
                case EditControlType.MultilineTextField:
                    tmpRenderObj.push(<TextField
                        key={column.key}
                        errorMessage={columnValuesObj[column.key].error}
                        name={column.text}
                        disabled={column.panelEditDisabledUntil ? column.panelEditDisabledUntil(columnValuesObj, column) : false}
                        multiline={true}
                        rows={1}
                        id={column.key}
                        label={column.text}
                        styles={textFieldStyles}
                        onChange={(ev, text) => onTextUpdate(ev, text!, column)}
                        value={columnValuesObj[column.key].value || ''}
                    />);
                    break;
                default:
                    tmpRenderObj.push(<TextField
                        key={column.key}
                        errorMessage={columnValuesObj[column.key].error}
                        name={column.text}
                        disabled={column.panelEditDisabledUntil ? column.panelEditDisabledUntil(columnValuesObj, column) : false}
                        id={column.key}
                        label={column.text}
                        styles={textFieldStyles}
                        onChange={(ev, text) => onTextUpdate(ev, text!, column)}
                        value={columnValuesObj[column.key].value || ''}
                    />);
                    break;
            }
        });
        return tmpRenderObj;
    }

    return (
        <>
            <Stack tokens={verticalGapStackTokens} styles={{ root: { marginTop: 20 } }}>
                {columnValuesObj && createFields()}
            </Stack>
            <Stack horizontal disableShrink styles={stackStyles}>
                <DefaultButton
                    text="Cancel"
                    className={controlClass.cancelStylesEditpanel}
                    onClick={props.onDismiss}
                />
                <PrimaryButton
                    text="Save To Grid"
                    className={controlClass.submitStylesEditpanel}
                    onClick={onPanelSubmit}
                    allowDisabledFocus
                    disabled={(columnValuesObj && Object.keys(columnValuesObj).some(k => columnValuesObj[k] && columnValuesObj[k].error && columnValuesObj[k].error.length > 0)) || false}
                />
            </Stack>
        </>
    );
};

export default EditPanel;
