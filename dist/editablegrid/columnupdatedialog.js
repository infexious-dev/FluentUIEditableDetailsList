var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Checkbox, DatePicker, DefaultButton, Dialog, DialogFooter, Dropdown, Label, mergeStyleSets, PrimaryButton, Stack, TextField } from "office-ui-fabric-react";
import React, { useEffect, useState } from "react";
import { EditControlType } from "../types/editcontroltype";
import { DayPickerStrings } from "./datepickerconfig";
import { GetDefault, GetValue, IsValidDataType, ParseType } from "./helper";
import PickerControl from "./pickercontrol/picker";
import { controlClass } from "./editablegridstyles";
var ColumnUpdateDialog = function (props) {
    var localControlClass = mergeStyleSets({
        inputClass: {
            display: 'block',
            width: '100%'
        },
        dialogClass: {
            padding: 20
        }
    });
    var textFieldStyles = { fieldGroup: {} };
    var _a = __read(useState(''), 2), gridColumn = _a[0], setGridColumn = _a[1];
    var _b = __read(useState(null), 2), columnValuesObj = _b[0], setcolumnValuesObj = _b[1];
    var stackTokens = { childrenGap: 10 };
    var dropdownStyles = {
        dropdown: { width: '100%' },
    };
    useEffect(function () {
        var tmpColumnValuesObj = {};
        props.columnConfigurationData.filter(function (x) { return x.editable == true; }).forEach(function (item, index) {
            tmpColumnValuesObj[item.key] = {
                //'value': GetDefault(item.dataType),
                'value': props.selectedItem ? GetValue(item.dataType, props.selectedItem[item.key]) : GetDefault(item.dataType),
                'isChanged': false,
                'error': null
            };
        });
        setcolumnValuesObj(tmpColumnValuesObj);
    }, [props.columnConfigurationData]);
    var SetObjValues = function (key, value, isChanged, errorMessage) {
        var _a;
        if (isChanged === void 0) { isChanged = true; }
        if (errorMessage === void 0) { errorMessage = null; }
        setcolumnValuesObj(__assign(__assign({}, columnValuesObj), (_a = {}, _a[key] = { 'value': value, 'isChanged': isChanged, 'error': errorMessage }, _a)));
    };
    var onTextUpdate = function (ev, text, column) {
        if (!IsValidDataType(column === null || column === void 0 ? void 0 : column.dataType, text)) {
            SetObjValues(ev.target.id, text, false, "Data should be of type '" + column.dataType + "'");
            return;
        }
        SetObjValues(ev.target.id, ParseType(column.dataType, text));
    };
    var _c = __read(React.useState(_jsx(_Fragment, {}, void 0)), 2), inputFieldContent = _c[0], setInputFieldContent = _c[1];
    var onSelectDate = function (date, item) {
        SetObjValues(item.key, date);
    };
    var onCellPickerTagListChanged = function (cellPickerTagList, item) {
        if (cellPickerTagList && cellPickerTagList[0] && cellPickerTagList[0].name)
            SetObjValues(item.key, cellPickerTagList[0].name);
        else
            SetObjValues(item.key, '');
    };
    var onDropDownChange = function (event, selectedDropdownItem, item) {
        SetObjValues(item.key, selectedDropdownItem === null || selectedDropdownItem === void 0 ? void 0 : selectedDropdownItem.text);
    };
    var onCheckboxChange = function (checked, item) {
        SetObjValues(item.key, checked);
    };
    var onSelectGridColumn = function (event, item) {
        setGridColumn(item.key.toString());
    };
    var closeDialog = React.useCallback(function () {
        if (props.onDialogCancel) {
            props.onDialogCancel();
        }
        setInputFieldContent(undefined);
    }, []);
    var saveDialog = function () {
        if (props.onDialogSave) {
            var columnValuesObjTmp = {};
            var objectKeys = Object.keys(columnValuesObj);
            var BreakException = {};
            try {
                objectKeys.forEach(function (objKey) {
                    if (columnValuesObj[objKey]['isChanged']) {
                        columnValuesObjTmp[objKey] = columnValuesObj[objKey]['value'];
                        throw BreakException;
                    }
                });
            }
            catch (e) {
                // if (e !== BreakException) throw e;
            }
            props.onDialogSave(columnValuesObjTmp);
        }
        setInputFieldContent(undefined);
    };
    var createDropDownOptions = function () {
        var dropdownOptions = [];
        props.columnConfigurationData.forEach(function (item, index) {
            if (item.editable == true) {
                dropdownOptions.push({ key: item.key, text: item.text });
            }
        });
        return dropdownOptions;
    };
    var options = createDropDownOptions();
    var GetInputFieldContent = function () {
        var _a, _b, _c, _d, _e, _f;
        var column = props.columnConfigurationData.filter(function (x) { return x.key == gridColumn; });
        if (column.length > 0) {
            var item_1 = column[0];
            switch (item_1.inputType) {
                case EditControlType.Date:
                    return (_jsx(DatePicker, { label: item_1.text, strings: DayPickerStrings, placeholder: "Select a date...", ariaLabel: "Select a date", onSelectDate: function (date) { return onSelectDate(date, item_1); }, value: columnValuesObj[item_1.key].value }, item_1.key));
                case EditControlType.Picker:
                    return (_jsxs("div", { children: [_jsx("span", __assign({ className: controlClass.pickerLabel }, { children: item_1.text }), void 0), _jsx(PickerControl, { arialabel: item_1.text, selectedItemsLimit: 1, defaultTags: columnValuesObj[item_1.key].value ? [columnValuesObj[item_1.key].value] : undefined, pickerTags: (_b = (_a = item_1.pickerOptions) === null || _a === void 0 ? void 0 : _a.pickerTags) !== null && _b !== void 0 ? _b : [], minCharLimitForSuggestions: 2, onTaglistChanged: function (selectedItem) { return onCellPickerTagListChanged(selectedItem, item_1); }, pickerDescriptionOptions: (_c = item_1.pickerOptions) === null || _c === void 0 ? void 0 : _c.pickerDescriptionOptions }, void 0)] }, item_1.key));
                case EditControlType.DropDown:
                    var selectedKey = null;
                    var sanitisedColumnItem = {};
                    Object.keys(columnValuesObj).forEach(function (key) {
                        sanitisedColumnItem[key] = columnValuesObj[key].value;
                    });
                    (_e = (typeof item_1.dropdownValues === 'function' ? item_1.dropdownValues(sanitisedColumnItem) : (_d = item_1.dropdownValues) !== null && _d !== void 0 ? _d : [])) === null || _e === void 0 ? void 0 : _e.map(function (option) {
                        if (option.text === columnValuesObj[item_1.key].value) {
                            selectedKey = option.key;
                        }
                    });
                    return (_jsx(Dropdown, { label: item_1.text, options: typeof item_1.dropdownValues === 'function' ? item_1.dropdownValues(sanitisedColumnItem) : (_f = item_1.dropdownValues) !== null && _f !== void 0 ? _f : [], onChange: function (ev, selected) { return onDropDownChange(ev, selected, item_1); }, selectedKey: selectedKey || null, placeholder: !selectedKey ? "Enter '" + item_1.text + "'..." : '' }, void 0));
                case EditControlType.Checkbox:
                    return (_jsxs("div", { children: [_jsx(Label, { children: item_1.text }, void 0), _jsx(Checkbox, { styles: { root: { marginTop: 0 } }, disabled: !item_1.editable, checked: columnValuesObj[item_1.key].value || false, onChange: function (ev, checked) { return onCheckboxChange(checked, item_1); } }, void 0)] }, item_1.key));
                case EditControlType.MultilineTextField:
                    return (_jsx(TextField, { errorMessage: columnValuesObj[item_1.key].error, className: localControlClass.inputClass, multiline: true, rows: 1, placeholder: "Enter '" + item_1.text + "'...", id: item_1.key, styles: textFieldStyles, onChange: function (ev, text) { return onTextUpdate(ev, text, item_1); }, value: columnValuesObj[item_1.key].value || '' }, void 0));
                default:
                    return (_jsx(TextField, { errorMessage: columnValuesObj[item_1.key].error, className: localControlClass.inputClass, placeholder: "Enter '" + item_1.text + "'...", onChange: function (ev, text) { return onTextUpdate(ev, text, item_1); }, styles: textFieldStyles, id: item_1.key, value: columnValuesObj[item_1.key].value || '' }, void 0));
            }
        }
        return (_jsx(_Fragment, {}, void 0));
    };
    return (_jsx(Dialog, __assign({ hidden: !inputFieldContent, onDismiss: closeDialog, closeButtonAriaLabel: "Close" }, { children: _jsxs(Stack, __assign({ grow: true, verticalAlign: "space-between", tokens: stackTokens }, { children: [_jsx(Stack.Item, __assign({ grow: 1 }, { children: _jsx(Dropdown, { placeholder: "Select the Column", options: options, styles: dropdownStyles, onChange: onSelectGridColumn }, void 0) }), void 0), _jsx(Stack.Item, __assign({ grow: 1 }, { children: GetInputFieldContent() }), void 0), _jsx(Stack.Item, { children: _jsxs(DialogFooter, __assign({ className: localControlClass.inputClass }, { children: [_jsx(PrimaryButton
                            // eslint-disable-next-line react/jsx-no-bind
                            , { 
                                // eslint-disable-next-line react/jsx-no-bind
                                onClick: saveDialog, text: "Save", disabled: (gridColumn) ? (columnValuesObj[gridColumn].error != null && columnValuesObj[gridColumn].error.length > 0) : false }, void 0), _jsx(DefaultButton, { onClick: closeDialog, text: "Cancel" }, void 0)] }), void 0) }, void 0)] }), void 0) }), void 0));
};
export default ColumnUpdateDialog;
