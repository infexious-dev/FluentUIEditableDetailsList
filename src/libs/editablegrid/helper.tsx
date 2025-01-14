import lodash from "lodash";
import { ICellStyleRulesType } from "../types/cellstyleruletype";
import { IColumnConfig } from "../types/columnconfigtype";
import { IGridColumnFilter } from "../types/columnfilterstype";
import { DataType } from "../types/datatype";
import { dateOperatorEval, IFilter, numberOperatorEval, stringOperatorEval } from "../types/filterstype";

export const filterGridData = (data: any[], filters: IFilter[]): any[] => {
    var dataTmp: any[] = [...data];
    dataTmp.forEach((row) => {
        var isRowIncluded: boolean = true;
        filters.forEach((item) => {
            if (isRowIncluded) {
                var columnType = item.column.dataType;
                switch (columnType) {
                    case DataType.number:
                    case DataType.decimal:
                        isRowIncluded = isRowIncluded && numberOperatorEval(row[item.column.key], item.value, item.operator);
                        break;
                    case DataType.string:
                        isRowIncluded = isRowIncluded && stringOperatorEval(row[item.column.key], item.value, item.operator);
                        break;
                }
            }
        });

        if (isRowIncluded) {
            row._is_filtered_in_ = true;
        }
        else {
            row._is_filtered_in_ = false;
        }
    });

    return dataTmp;
}

export const applyGridColumnFilter = (data: any[], gridColumnFilterArr: IGridColumnFilter[]): any[] => {
    var dataTmp: any[] = [...data];
    if (gridColumnFilterArr.filter((item) => item.isApplied === true).length > 0) {
        dataTmp.map((row) => row._is_filtered_in_column_filter_ = true);
    }

    gridColumnFilterArr.filter((gridColumnFilter) => gridColumnFilter.isApplied === true).forEach((gridColumnFilter, index) => {
        dataTmp.filter((row) => row._is_filtered_in_column_filter_ === true).forEach((row, i) => {
            row._is_filtered_in_column_filter_ = gridColumnFilter.filterCalloutProps!.filterList.filter(a => a.isChecked === true).map(a => a.text).includes(row[gridColumnFilter.column.key]);
        });
    });

    return dataTmp;
}

export const isColumnDataTypeSupportedForFilter = (datatype: string | undefined): boolean => {
    switch (datatype) {
        case DataType.number:
        case DataType.decimal:
            return true;
        case DataType.string:
            return true;
        default:
            return false;
    }
}

export const IsValidDataType = (type: string | undefined, text: string): boolean => {
    var isValid = true;
    switch (type) {
        case DataType.number:
            isValid = !isNaN(Number(text));
            break;
        case DataType.decimal:
            let regex = new RegExp(/^[-]?((\d+)|(\.)|(\.\d+)|(\d+\.\d+)|(\d+\.))?$/, 'g');
            if (!regex.test(text)) {
                isValid = false;
            }
            break;
    }

    return isValid;
};

export const EvaluateRule = (dataType: string, cellValue: string | number | undefined, styleRule: ICellStyleRulesType | undefined): boolean => {
    if (!styleRule) {
        return false;
    }

    switch (dataType) {
        case DataType.number:
        case DataType.decimal:
            return numberOperatorEval(Number(cellValue), styleRule?.rule!.value as number, styleRule?.rule!.operator);
        case DataType.string:
            return stringOperatorEval(String(cellValue), styleRule?.rule!.value as string, styleRule?.rule!.operator)
        case DataType.date:
            return dateOperatorEval(new Date(String(cellValue)), new Date(styleRule?.rule!.value), styleRule?.rule!.operator);
        default:
            return false;
    }
}

export const ConvertObjectToText = (obj: any, columns: IColumnConfig[]): string => {
    var text: string = '';

    columns.forEach((col) => {
        text += (obj[col.key] == null ? '' : obj[col.key]) + "\t";
    });

    return text.substring(0, text.lastIndexOf('\t'));
}

export const ParseType = (type: string | undefined, text: string): any => {
    if (text.trim().length === 0) {
        return null;
    }

    switch (type) {
        case DataType.number:
            return Number(text);
        case DataType.decimal:
            // let regex = new RegExp(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/, 'g');
            return text
        case DataType.date:
            return Date.parse(text);
    }

    return text;
}

export const GetDefault = (type: string | undefined): any => {
    switch (type) {
        // case DataType.date:
        //     return new Date();
        default:
            return null;
    }
}

export const GetValue = (type: string | undefined, value: any): any => {
    switch (type) {
        // case DataType.date:
        //     return new Date(value);
        default:
            return value;
    }
}

export const GetParsedFloat = (value: any): number | null => {
    let _value: number | null = parseFloat(value);

    if (Number.isNaN(_value))
        _value = null

    return _value;
}

export const clone = (entity: any): any => {
    return lodash.clone(entity);
}

export const deepClone = (entity: any, customizer?: lodash.CloneDeepWithCustomizer<any>): any => {
    if (customizer)
        return lodash.cloneDeepWith(entity, customizer);
    else
        return lodash.cloneDeep(entity);
}
