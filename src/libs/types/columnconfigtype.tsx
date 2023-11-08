// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn } from 'office-ui-fabric-react/lib/components/DetailsList/DetailsList.types';
import { IDropdownOption } from "office-ui-fabric-react";
import { CalculationType } from "./calculationtype";
import { ICellStyleRulesType, StringOperators } from './cellstyleruletype';
import { EditControlType } from "./editcontroltype";

export interface IColumnConfig extends IColumn {
    key: string;
    text: string;
    editable?: boolean;
    editableOnlyInPanel?: boolean;
    panelEditDisabledUntil?: (item?: any, column?: IColumn) => boolean;
    dataType?: string;
    isResizable?: boolean;
    includeColumnInExport?: boolean;
    includeColumnInSearch?: boolean;
    inputType?: EditControlType;
    calculatedColumn?: { type: CalculationType, fields: any[] };
    onChange?: any;
    maxLength?: number;
    applyColumnFilter?: boolean;
    cellStyleRule?: ICellStyleRulesType;
    dropdownValues?: IDropdownOption[] | ((item?: any) => any);
    pickerOptions?: IPickerOptions;
    disableSort?: boolean;
    hoverComponentOptions?: IHoverOptions;
    linkOptions?: ILinkOptions;
    onCustomRender?: (item?: any, index?: number, column?: IColumn) => any;
    isSortedByDefault?: boolean;
    toggleOnText?: string;
    toggleOffText?: string;
};

export interface ILinkOptions {
    href?: string;
    onClick?: any;
    disabled?: boolean;
    isFocusable?: boolean;
}

export interface IHoverOptions {
    enable?: boolean;
    hoverChildComponent?: JSX.Element;
}

export interface IPickerOptions {
    tagsLimit?: number;
    minCharLimitForSuggestions?: number;
    pickerTags: string[];
    pickerDescriptionOptions?: IPickerDescriptionOption;
    suggestionsRule?: StringOperators;
}

export interface IPickerDescriptionOption {
    enabled: boolean;
    values: IPickerTagDescription[];
}

export interface IPickerTagDescription {
    key: string;
    description: string;
}