import { Checkbox, DatePicker, Dropdown, IDropdownOption, ITag, Label, Position, PrimaryButton, SpinButton, Stack, TextField } from "@fluentui/react";
import React, { useEffect, useState } from "react";
import { IColumnConfig } from "../types/columnconfigtype";
import { DataType } from "../types/datatype";
import { EditControlType } from "../types/editcontroltype";
import { DayPickerStrings } from "./datepickerconfig";
import { controlClass, stackStyles, textFieldStyles, verticalGapStackTokens } from "./editablegridstyles";
import { GetDefault, GetParsedFloat, IsValidDataType, ParseType } from "./helper";
import PickerControl from "./pickercontrol/picker";
import { DefaultButton } from "@fluentui/react";

interface Props {
    onDismiss: () => any;
    onChange: any;
    columnConfigurationData: IColumnConfig[];
    enableRowsCounterField?: boolean;
}

const AddRowPanel = (props: Props) => {
    let AddSpinRef: any = React.createRef();

    const updateObj: any = {};
    const [columnValuesObj, setColumnValuesObj] = useState<any>(null);

    useEffect(() => {
        let tmpColumnValuesObj: any = {};
        props.columnConfigurationData.forEach((column, index) => {
            tmpColumnValuesObj[column.key] = { 'value': GetDefault(column.dataType), 'isChanged': false, 'error': null, 'dataType': column.dataType };
        })
        setColumnValuesObj(tmpColumnValuesObj);
    }, [props.columnConfigurationData]);

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

        props.onChange(updateObj, props.enableRowsCounterField ? AddSpinRef.current.value : 1);
    };

    const onCellPickerTagListChanged = (cellPickerTagList: ITag[] | undefined, item: any): void => {
        if (cellPickerTagList && cellPickerTagList[0] && cellPickerTagList[0].name)
            SetObjValues(item.key, cellPickerTagList[0].name);
        else
            SetObjValues(item.key, '');
    }

    const onCellDateChange = (date: Date | null | undefined, item: any): void => {
        SetObjValues(item.key, date);
    };

    const createFields = (): any[] => {
        let tmpRenderObj: any[] = [];
        props.columnConfigurationData.filter(x => x.dataType !== DataType.calculated).forEach(column => {
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
                        //value={props != null && props.panelValues != null ? new Date(props.panelValues[item.key]) : new Date()}
                        value={new Date()}
                    />);
                    break;
                case EditControlType.Picker:
                    tmpRenderObj.push(<div key={column.key}>
                        <span className={controlClass.pickerLabel}>{column.text}</span>
                        <PickerControl
                            arialabel={column.text}
                            selectedItemsLimit={1}
                            disabled={column.panelEditDisabledUntil ? column.panelEditDisabledUntil(columnValuesObj, column) : false}
                            pickerTags={column.pickerOptions?.pickerTags ?? []}
                            minCharLimitForSuggestions={2}
                            onTaglistChanged={(selectedItem: ITag[] | undefined) => onCellPickerTagListChanged(selectedItem, column)}
                            pickerDescriptionOptions={column.pickerOptions?.pickerDescriptionOptions}
                        /></div>);
                    break;
                case EditControlType.DropDown:
                    tmpRenderObj.push(
                        <Dropdown
                            key={column.key}
                            disabled={column.panelEditDisabledUntil ? column.panelEditDisabledUntil(columnValuesObj, column) : false}
                            label={column.text}
                            options={typeof column.dropdownValues === 'function' ? column.dropdownValues() as IDropdownOption[] : column.dropdownValues ?? []}
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

        if (props.enableRowsCounterField) {
            tmpRenderObj.push(
                <SpinButton
                    key="addrows-counterfield"
                    componentRef={AddSpinRef}
                    label="# of Rows to Add"
                    labelPosition={Position.top}
                    defaultValue="1"
                    min={0}
                    max={100}
                    step={1}
                    incrementButtonAriaLabel="Increase value by 1"
                    decrementButtonAriaLabel="Decrease value by 1"
                    styles={{ spinButtonWrapper: { width: 75 } }}
                />
            );
        }

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
                    disabled={columnValuesObj && Object.keys(columnValuesObj).some(k => columnValuesObj[k] && columnValuesObj[k].error && columnValuesObj[k].error.length > 0) || false}
                />
            </Stack>
        </>
    );
};

export default AddRowPanel;