import { ICellStyleRulesType } from "../types/cellstyleruletype";
import { IColumnConfig } from "../types/columnconfigtype";
import { IGridColumnFilter } from "../types/columnfilterstype";
import { IFilter } from "../types/filterstype";
export declare const filterGridData: (data: any[], filters: IFilter[]) => any[];
export declare const applyGridColumnFilter: (data: any[], gridColumnFilterArr: IGridColumnFilter[]) => any[];
export declare const isColumnDataTypeSupportedForFilter: (datatype: string | undefined) => boolean;
export declare const IsValidDataType: (type: string | undefined, text: string) => boolean;
export declare const EvaluateRule: (datatType: string, cellValue: string | number | undefined, styleRule: ICellStyleRulesType | undefined) => boolean;
export declare const ConvertObjectToText: (obj: any, columns: IColumnConfig[]) => string;
export declare const ParseType: (type: string | undefined, text: string) => any;
export declare const GetDefault: (type: string | undefined) => any;
export declare const GetValue: (type: string | undefined, value: any) => any;
