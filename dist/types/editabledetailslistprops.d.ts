import { ConstrainMode } from "office-ui-fabric-react/lib/components/DetailsList";
import { IDetailsListProps } from "office-ui-fabric-react/lib/components/DetailsList/DetailsList";
import { IColumnConfig } from "./columnconfigtype";
import { IGridCopy } from "./gridcopytype";
import { IRowAddWithValues } from "./rowaddtype";
import { IRowMute } from "./rowmutetype";
export interface Props extends IDetailsListProps {
    id: number;
    items: any[];
    columns: IColumnConfig[];
    customEditPanelColumns?: IColumnConfig[];
    enableExport?: boolean;
    exportFileName?: string;
    enableSave?: boolean;
    enableSaveText?: string;
    enableRowEdit?: boolean;
    prependRowEditActions?: boolean;
    enableRowEditCancel?: boolean;
    rowMuteOptions?: IRowMute;
    enableColumnEdit?: boolean;
    enablePanelEdit?: boolean;
    enableBulkEdit?: boolean;
    enableCellEdit?: boolean;
    onGridInEditChange?: any;
    onGridStateEditedChange?: any;
    onGridSelectionChange?: any;
    onGridUpdate?: any;
    onGridSave?: any;
    onGridSort?: any;
    onGridFilter?: any;
    enableGridRowsDelete?: boolean;
    enableGridRowsAdd?: boolean;
    enableRowAddWithValues?: IRowAddWithValues;
    enableTextFieldEditMode?: boolean;
    enableTextFieldEditModeCancel?: boolean;
    enablePagination?: boolean;
    pageSize?: number;
    onExcelExport?: any;
    height?: string;
    width?: string;
    position?: string;
    constrainMode?: ConstrainMode;
    enableUnsavedEditIndicator?: boolean;
    enableGridReset?: boolean;
    onGridReset?: any;
    enableColumnFilterRules?: boolean;
    enableColumnFilters?: boolean;
    enableCommandBar?: boolean;
    enableSingleClickCellEdit?: boolean;
    onGridStatusMessageCallback?: any;
    gridCopyOptions?: IGridCopy;
    enableDefaultEditMode?: boolean;
    enableMarqueeSelection?: boolean;
    aboveStickyContent?: HTMLDivElement;
    belowStickyContent?: HTMLDivElement;
}
