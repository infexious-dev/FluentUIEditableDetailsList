// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Checkbox, DatePicker, DefaultButton, Dialog, DialogFooter, Dropdown, IDropdownOption, IDropdownStyles, IStackTokens, ITag, ITextFieldStyles, Label, mergeStyleSets, PrimaryButton, Stack, TextField } from "@fluentui/react";
import React, { useEffect, useState } from "react";
import { IColumnConfig } from "../types/columnconfigtype";
import { EditControlType } from "../types/editcontroltype";
import { DayPickerStrings } from "./datepickerconfig";
import { GetDefault, GetParsedFloat, GetValue, IsValidDataType, ParseType } from "./helper";
import PickerControl from "./pickercontrol/picker";
import { controlClass } from "./editablegridstyles";
import { DataType } from "../types/datatype";

interface Props {
    columnConfigurationData: IColumnConfig[];
    onDialogCancel?: any;
    onDialogSave?: any;
    selectedItem: any;
}

const ColumnUpdateDialog = (props: Props) => {
    const localControlClass = mergeStyleSets({
        inputClass: {
            display: 'block',
            width: '100%'
        },
        dialogClass: {
            padding: 20
        }
    });

    const textFieldStyles: Partial<ITextFieldStyles> = { fieldGroup: {} };

    const [gridColumn, setGridColumn] = useState('');
    const [columnValuesObj, setcolumnValuesObj] = useState<any>(null);

    const stackTokens: IStackTokens = { childrenGap: 10 };
    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdown: { width: '100%' },
    };

    useEffect(() => {
        let tmpColumnValuesObj: any = {};
        props.columnConfigurationData.filter(x => x.editable == true && !x.editableOnlyInPanel).forEach((column, index) => {
            tmpColumnValuesObj[column.key] = {
                //'value': GetDefault(item.dataType),
                'value': props.selectedItem ? GetValue(column.dataType, props.selectedItem[column.key]) : GetDefault(column.dataType),
                'isChanged': false,
                'error': null,
                'dataType': column.dataType
            };
        })
        setcolumnValuesObj(tmpColumnValuesObj);
    }, [props.columnConfigurationData]);

    const SetObjValues = (key: string, value: any, isChanged: boolean = true, errorMessage: string | null = null): void => {
        setcolumnValuesObj({ ...columnValuesObj, [key]: { 'value': value, 'isChanged': isChanged, 'error': errorMessage, 'dataType': columnValuesObj[key]?.dataType } })
    }

    const onTextUpdate = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string, column: IColumnConfig): void => {
        if (!IsValidDataType(column?.dataType, text)) {
            SetObjValues((ev.target as Element).id, text, false, `Data should be of type '${column.dataType}'`)
            return;
        }

        SetObjValues((ev.target as Element).id, ParseType(column.dataType, text));
    };

    const [inputFieldContent, setInputFieldContent] = React.useState<JSX.Element | undefined>(
        <></>
    );

    const onSelectDate = (date: Date | null | undefined, item: any): void => {
        SetObjValues(item.key, date);
    };

    const onCellPickerTagListChanged = (cellPickerTagList: ITag[] | undefined, item: any): void => {
        if (cellPickerTagList && cellPickerTagList[0] && cellPickerTagList[0].name)
            SetObjValues(item.key, cellPickerTagList[0].name);
        else
            SetObjValues(item.key, '');
    }

    const onDropDownChange = (event: React.FormEvent<HTMLDivElement>, selectedDropdownItem: IDropdownOption | undefined, item: any): void => {
        SetObjValues(item.key, selectedDropdownItem?.text);
    }

    const onCheckboxChange = (checked: boolean | undefined, item: any): void => {
        SetObjValues(item.key, checked);
    }

    const onSelectGridColumn = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption | undefined): void => {
        setGridColumn(item!.key.toString());
    };

    const closeDialog = React.useCallback((): void => {
        if (props.onDialogCancel) {
            props.onDialogCancel();
        }

        setInputFieldContent(undefined)
    }, []);

    const saveDialog = (): void => {
        if (props.onDialogSave) {
            var columnValuesObjTmp: any = {};
            var objectKeys = Object.keys(columnValuesObj);
            var BreakException = {};
            try {
                objectKeys.forEach((objKey) => {
                    if (columnValuesObj[objKey]['isChanged']) {
                        let value = columnValuesObj[objKey]['value'];

                        if (columnValuesObj[objKey]['dataType'] === DataType.decimal)
                            value = GetParsedFloat(value);

                        columnValuesObjTmp[objKey] = value;
                        throw BreakException;
                    }
                });
            } catch (e) {
                // if (e !== BreakException) throw e;
            }

            props.onDialogSave(columnValuesObjTmp);
        }

        setInputFieldContent(undefined);
    };

    const createDropDownOptions = (): IDropdownOption[] => {
        let dropdownOptions: IDropdownOption[] = [];
        props.columnConfigurationData.forEach((item, index) => {
            if (item.editable == true && !item.editableOnlyInPanel) {
                dropdownOptions.push({ key: item.key, text: item.text });
            }
        });

        return dropdownOptions;
    }

    const options = createDropDownOptions();

    const GetInputFieldContent = (): JSX.Element => {
        var column = props.columnConfigurationData.filter(x => x.key == gridColumn);
        if (column.length > 0) {
            let item = column[0];
            switch (item.inputType) {
                case EditControlType.Date:
                    return (<DatePicker
                        key={item.key}
                        label={item.text}
                        strings={DayPickerStrings}
                        placeholder="Select a date..."
                        ariaLabel="Select a date"
                        onSelectDate={(date) => onSelectDate(date, item)}
                        value={columnValuesObj[item.key].value}
                    />);
                case EditControlType.Picker:
                    return (<div key={item.key}>
                        <span className={controlClass.pickerLabel}>{item.text}</span>
                        <PickerControl
                            arialabel={item.text}
                            selectedItemsLimit={1}
                            defaultTags={columnValuesObj[item.key].value ? [columnValuesObj[item.key].value] : undefined}
                            pickerTags={item.pickerOptions?.pickerTags ?? []}
                            minCharLimitForSuggestions={2}
                            onTaglistChanged={(selectedItem: ITag[] | undefined) => onCellPickerTagListChanged(selectedItem, item)}
                            pickerDescriptionOptions={item.pickerOptions?.pickerDescriptionOptions}
                        /></div>);
                case EditControlType.DropDown:
                    var selectedKey = null;
                    var sanitisedColumnItem: any = {};

                    Object.keys(columnValuesObj).forEach((key) => {
                        sanitisedColumnItem[key] = columnValuesObj[key].value;
                    });

                    (typeof item.dropdownValues === 'function' ? item.dropdownValues(sanitisedColumnItem) as IDropdownOption[] : item.dropdownValues ?? [])?.map((option) => {
                        if (option.text === columnValuesObj[item.key].value) {
                            selectedKey = option.key
                        }
                    });

                    return (
                        <Dropdown
                            label={item.text}
                            options={typeof item.dropdownValues === 'function' ? item.dropdownValues(sanitisedColumnItem) as IDropdownOption[] : item.dropdownValues ?? []}
                            onChange={(ev, selected) => onDropDownChange(ev, selected, item)}
                            selectedKey={selectedKey || null}
                            placeholder={!selectedKey ? `Enter '${item.text}'...` : ''}
                        />
                    );
                case EditControlType.Checkbox:
                    return (
                        <div key={item.key}>
                            <Label>{item.text}</Label>
                            <Checkbox
                                styles={{ root: { marginTop: 0 } }}
                                disabled={!item.editable}
                                checked={columnValuesObj[item.key].value || false}
                                onChange={(ev, checked) => onCheckboxChange(checked, item)}
                            />
                        </div>
                    );
                case EditControlType.MultilineTextField:
                    return (<TextField
                        errorMessage={columnValuesObj[item.key].error}
                        className={localControlClass.inputClass}
                        multiline={true}
                        rows={1}
                        placeholder={`Enter '${item.text}'...`}
                        id={item.key}
                        styles={textFieldStyles}
                        onChange={(ev, text) => onTextUpdate(ev, text!, item)}
                        value={columnValuesObj[item.key].value || ''}
                    />);
                default:
                    return (
                        <TextField
                            errorMessage={columnValuesObj[item.key].error}
                            className={localControlClass.inputClass}
                            placeholder={`Enter '${item.text}'...`}
                            onChange={(ev, text) => onTextUpdate(ev, text!, item)}
                            styles={textFieldStyles}
                            id={item.key}
                            value={columnValuesObj[item.key].value || ''}
                        />
                    );
            }
        }

        return (<></>);
    }

    return (
        <Dialog hidden={!inputFieldContent} onDismiss={closeDialog} closeButtonAriaLabel="Close">
            <Stack grow verticalAlign="space-between" tokens={stackTokens}>
                <Stack.Item grow={1}>
                    <Dropdown
                        placeholder="Select the Column"
                        options={options}
                        styles={dropdownStyles}
                        onChange={onSelectGridColumn}
                    />
                </Stack.Item>
                <Stack.Item grow={1}>
                    {GetInputFieldContent()}
                </Stack.Item>
                <Stack.Item>
                    <DialogFooter className={localControlClass.inputClass}>
                        <PrimaryButton
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={saveDialog}
                            text="Save"
                            disabled={(gridColumn) ? (columnValuesObj[gridColumn].error != null && columnValuesObj[gridColumn].error.length > 0) : false}
                        />
                        <DefaultButton onClick={closeDialog} text="Cancel" />
                    </DialogFooter>
                </Stack.Item>
            </Stack>
        </Dialog>
    );
};

export default ColumnUpdateDialog;