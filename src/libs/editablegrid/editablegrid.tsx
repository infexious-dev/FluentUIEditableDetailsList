// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { ConstrainMode, IColumn, IDetailsHeaderProps } from 'office-ui-fabric-react/lib/components/DetailsList/DetailsList.types';
import { DetailsList } from 'office-ui-fabric-react/lib/components/DetailsList/DetailsList';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import {
    DetailsListLayoutMode,
    Selection,
    IDetailsColumnRenderTooltipProps,
} from 'office-ui-fabric-react/lib/DetailsList';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { IconButton } from '@fluentui/react/lib/components/Button/IconButton/IconButton';
import { DefaultButton, PrimaryButton, Dropdown, IDropdownOption, DialogFooter, Announced, Dialog, SpinButton, DatePicker, ScrollablePane, ScrollbarVisibility, Sticky, StickyPositionType, IRenderFunction, mergeStyles, Spinner, SpinnerSize, TagPicker, ITag, IBasePickerSuggestionsProps, IInputProps, HoverCard, HoverCardType, Link, Checkbox } from '@fluentui/react';
import { TextField } from '@fluentui/react/lib/TextField';
import { IColumnConfig } from '../types/columnconfigtype';
import { controlClass, dropdownStyles, GetDynamicSpanStyles, textFieldStyles } from './editablegridstyles';
import { Operation } from '../types/operation';
import { InitializeInternalGrid, InitializeInternalGridEditStructure, ResetGridRowID, ShallowCopyDefaultGridToEditGrid, ShallowCopyEditGridToDefaultGrid } from './editablegridinitialize';
import { EditControlType } from '../types/editcontroltype';
import { dateToISOLikeButLocal, DayPickerStrings } from './datepickerconfig';
import { ExportType } from '../types/exporttype';
import { ExportToCSVUtil, ExportToExcelUtil } from './gridexportutil';
import { EditType } from '../types/edittype';
import MessageDialog from './messagedialog';
import ColumnUpdateDialog from './columnupdatedialog';
import EditPanel from './editpanel';
import { ICallBackParams } from '../types/callbackparams';
import { EventEmitter, EventType } from '../eventemitter/EventEmitter';
import ColumnFilterDialog from './columnfilterdialog/columnfilterdialog';
import { IFilter } from '../types/filterstype';
import { applyGridColumnFilter, ConvertObjectToText, filterGridData, GetDefault, isColumnDataTypeSupportedForFilter, IsValidDataType, ParseType, deepClone, GetParsedFloat } from './helper';
import { IFilterItem, IFilterListProps, IGridColumnFilter } from '../types/columnfilterstype';
import FilterCallout from './columnfiltercallout/filtercallout';
import AddRowPanel from './addrowpanel';
import { Props } from '../types/editabledetailslistprops';
import PickerControl from './pickercontrol/picker';
import { ThemeProvider } from '@uifabric/foundation/lib/ThemeProvider';
import { Panel, PanelType } from '@fluentui/react';
import { DataType } from '../types/datatype';
import { DirectionalHint, ITooltipHostProps, TooltipDelay, TooltipHost } from '@fluentui/react';
import lodash from 'lodash';

interface SortOptions {
    key: string;
    isAscending: boolean;
    isEnabled: boolean;
}

interface IEventFilterList {
    columnKey: string;
    queryText: string;
}

const EditableGrid = (props: Props) => {
    const [editMode, setEditMode] = React.useState(false);
    const [isOpenForEdit, setIsOpenForEdit] = React.useState(false);
    const [isBulkPanelEdit, setIsBulkPanelEdit] = React.useState<boolean>(false);
    const dismissPanelForEdit = React.useCallback(() => setIsOpenForEdit(false), []);
    const [isOpenForAdd, setIsOpenForAdd] = React.useState(false);
    const dismissPanelForAdd = React.useCallback(() => setIsOpenForAdd(false), []);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [gridData, setGridData] = React.useState<any[]>([]);
    const [defaultGridData, setDefaultGridData] = React.useState<any[]>([]);
    const [backupDefaultGridData, setBackupDefaultGridData] = React.useState<any[]>([]);
    const [activateCellEdit, setActivateCellEdit] = React.useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectionDetails, setSelectionDetails] = React.useState('');
    const [selectedItems, setSelectedItems] = React.useState<any[]>();
    const [cancellableRows, setCancellableRows] = React.useState<any[]>([]);
    const [selectionCount, setSelectionCount] = React.useState(0);
    const [selectedIndices, setSelectedIndices] = React.useState<number[]>([]);
    const [isGridInEdit, setIsGridInEdit] = React.useState(false);
    const [isGlobalEditEnabled, setIsGlobalEditEnabled] = React.useState(true);
    const [dialogContent, setDialogContent] = React.useState<JSX.Element | undefined>(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [announced, setAnnounced] = React.useState<JSX.Element | undefined>(undefined);
    const [isUpdateColumnClicked, setIsUpdateColumnClicked] = React.useState(false);
    const [isColumnFilterClicked, setIsColumnFilterClicked] = React.useState(false);
    const [showSpinner] = React.useState(false);
    const [isGridStateEdited, setIsGridStateEdited] = React.useState(false);
    //const defaultTag : ITag[] = [{name: 'Designation == \'Designation1\'', key:'kushal'}];
    const [defaultTag, setDefaultTag] = React.useState<ITag[]>([]);
    const [filteredColumns, setFilteredColumns] = React.useState<IColumnConfig[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [filterStore, setFilterStore] = React.useState<IFilter[]>([]);
    const gridColumnFilterArrRef: any = React.useRef<IGridColumnFilter[]>([]);
    const [filterCalloutComponent, setFilterCalloutComponent] = React.useState<JSX.Element | undefined>(undefined);
    const [showFilterCallout, setShowFilterCallout] = React.useState(false);
    const [messageDialogProps, setMessageDialogProps] = React.useState({
        visible: false,
        message: '',
        subMessage: ''
    });
    const [sortColObj, setSortColObj] = React.useState<SortOptions>({ key: '', isAscending: false, isEnabled: false });
    const [hasRenderedStickyContent, setHasRenderedStickyContent] = React.useState<boolean>(false);
    const [aboveContentHeight, setAboveContentHeight] = React.useState<number>();
    const [belowContentHeight, setBelowContentHeight] = React.useState<number>();
    const SpinRef: any = React.createRef();
    const filterStoreRef: any = React.useRef<IFilter[]>([]);

    const _selection: Selection = new Selection({
        onSelectionChanged: () => setSelectionDetails(_getSelectionDetails()),
    });

    const eventFilterList = React.useRef<IEventFilterList[]>([]);
    const eventSearchQuery = React.useRef<string>("");

    function onFilterHandler(data: { columnKey: string; queryText: string; }) {
        if (data.columnKey) {
            const searchableColumn = props.columns.filter(x => x.key === data.columnKey)[0];

            let _columnKey = data.columnKey;
            if (searchableColumn)
                _columnKey = searchableColumn.key;

            let searchableColumns: string[] = [];
            if (eventSearchQuery.current && eventSearchQuery.current !== "")
                searchableColumns = props.columns.filter(x => x.includeColumnInSearch === true).map(x => x.key);

            const searchResult: any[] = [...defaultGridData];
            const index = eventFilterList.current.findIndex(filter => filter.columnKey === _columnKey);

            if (data.queryText) {
                // add to or update filter list
                if (index === -1) {
                    eventFilterList.current.push({
                        columnKey: _columnKey,
                        queryText: data.queryText
                    });
                } else { // column exists in filter list
                    eventFilterList.current[index].queryText = data.queryText;
                }
            }
            else {
                // remove from filter list
                if (index !== -1)
                    eventFilterList.current.splice(index, 1);
            }

            searchResult.filter(item => {
                try {
                    let filteredIn = true;

                    eventFilterList.current.forEach(filter => {
                        // filter out item if it null/undefined or if it is not found
                        if ((item[filter.columnKey] === undefined || item[filter.columnKey] === null)
                            || !item[filter.columnKey].toString().toLowerCase().includes(filter.queryText.trim().toLowerCase()))
                            filteredIn = false;
                    });

                    // now check event emitter search
                    if (filteredIn && eventSearchQuery.current && eventSearchQuery.current !== "") {
                        const BreakException = {};
                        try {
                            searchableColumns.forEach(column => {
                                filteredIn = item[column] && item[column].toString().toLowerCase() && item[column].toString().toLowerCase().includes(eventSearchQuery.current.trim().toLowerCase());

                                if (filteredIn)
                                    throw BreakException;
                            });
                        } catch (e) {
                            // silently continue...
                        }
                    }

                    item._is_filtered_in_grid_search_ = filteredIn;
                } catch (e) {
                    // silently continue...
                }
            });

            CheckOnFilter();
            setDefaultGridData(searchResult);
        }
    }

    function onSearchHandler(event: any) {
        if (event && event.target) {

            const queryText = event.target.value;
            if (queryText) {
                eventSearchQuery.current = queryText;
                const searchableColumns = props.columns.filter(x => x.includeColumnInSearch === true).map(x => x.key);
                const searchResult: any[] = [...defaultGridData];
                searchResult.filter(
                    (item) => {
                        const BreakException = {};
                        try {
                            searchableColumns.forEach(column => {
                                let filteredIn = item[column] && item[column].toString().toLowerCase() && item[column].toString().toLowerCase().includes(queryText.trim().toLowerCase());

                                // now check event emitter filters
                                if (filteredIn) {
                                    eventFilterList.current.forEach(filter => {
                                        if (!item[filter.columnKey].toString().toLowerCase().includes(filter.queryText.trim().toLowerCase()))
                                            filteredIn = false;
                                    });
                                }

                                item._is_filtered_in_grid_search_ = filteredIn;

                                if (filteredIn)
                                    throw BreakException;
                            });
                        } catch (e) {
                            // if (e !== BreakException) throw e;
                        }
                    }
                );
                CheckOnFilter();
                setDefaultGridData(searchResult);
            } else {
                eventSearchQuery.current = "";
                const gridDataTmp: any[] = [...defaultGridData];
                gridDataTmp.forEach(item => {
                    let filteredIn = true;

                    // ensure to respect event filters
                    eventFilterList.current.forEach(filter => {
                        if (!item[filter.columnKey]?.toString().toLowerCase().includes(filter.queryText.trim().toLowerCase()))
                            filteredIn = false;
                    });

                    item._is_filtered_in_grid_search_ = filteredIn;
                });
                setDefaultGridData(gridDataTmp);
            }
        } else {
            const gridDataTmp: any[] = [...defaultGridData];
            gridDataTmp.forEach(item => {
                let filteredIn = true;

                // ensure to respect event filters
                eventFilterList.current.forEach(filter => {
                    if (!item[filter.columnKey].toString().toLowerCase().includes(filter.queryText.trim().toLowerCase()))
                        filteredIn = false;
                });

                item._is_filtered_in_grid_search_ = filteredIn;
            });
            setDefaultGridData(gridDataTmp);
        }
    }

    React.useEffect(() => {
        EventEmitter.subscribe(EventType.onSearch, onSearchHandler);
        EventEmitter.subscribe(EventType.onFilter, onFilterHandler);
        return function cleanup() {
            EventEmitter.unsubscribe(EventType.onSearch, onSearchHandler);
            EventEmitter.unsubscribe(EventType.onFilter, onFilterHandler);
        };
    });

    React.useEffect(() => {
        if (props && props.items) {
            const data: any[] = InitializeInternalGrid(props.items, props.rowCanEditCheck);
            setIsGlobalEditEnabled(data.filter(item => item._can_edit_row_ === false).length !== data.length);
            setGridData(data);
            setBackupDefaultGridData(deepClone(data));
            setGridEditState(false);
            SetGridItems(data);
        }
    }, [props.items]);

    // useEffect(() => {
    //     console.log('Cancellable Rows');
    //     console.log(cancellableRows);
    // }, [cancellableRows]);

    React.useEffect(() => {
        const CheckOnUpdate = async () => {
            if (defaultGridData.filter(x => x._grid_row_operation_ !== Operation.None).length > 0)
                await onGridUpdate();
        };

        CheckOnUpdate();
    }, [defaultGridData]);

    React.useEffect(() => {
        UpdateGridEditStatus();
        //console.log('activate cell edit');
        //console.log(activateCellEdit);
        if (props.enableDefaultEditMode) {
            setDefaultGridData(ShallowCopyEditGridToDefaultGrid(defaultGridData, activateCellEdit));
        }
    }, [activateCellEdit]);

    React.useEffect(() => {
        //alert('IsGridInEdit: ' + isGridInEdit);
    }, [isGridInEdit]);

    React.useEffect(() => {
        SetFilteredGridData(getFilterStoreRef());
    }, [filteredColumns]);

    React.useEffect(() => {
        if (filterCalloutComponent) {
            setShowFilterCallout(true);
        }
    }, [filterCalloutComponent]);

    function onGridSave(): void {
        if (props.onGridSave) {
            props.onGridSave(defaultGridData);
        }
    }

    async function onGridUpdate(): Promise<void> {
        if (props.onGridUpdate)
            await props.onGridUpdate(defaultGridData);
    }

    function UpdateGridEditStatus(): void {
        let gridEditStatus: boolean = false;
        const BreakException = {};

        try {
            activateCellEdit.forEach((item) => {
                gridEditStatus = gridEditStatus || item.isActivated;
                if (gridEditStatus) {
                    throw BreakException;
                }

                const objectKeys = Object.keys(item.properties);
                objectKeys.filter(key => key !== '_grid_row_id_' && key !== '_grid_row_operation_').forEach((objKey) => {
                    gridEditStatus = gridEditStatus || item['properties'][objKey]['activated'];
                    if (gridEditStatus) {
                        throw BreakException;
                    }
                });
            });
        } catch (e) {
            // if (e !== BreakException) throw e;
        }

        if ((!isGridInEdit && gridEditStatus) || (isGridInEdit && !gridEditStatus)) {
            setIsGridInEdit(gridEditStatus);
            onGridInEditChange(gridEditStatus);
        }
    }

    function SetGridItems(data: any[]): void {
        data = ResetGridRowID(data);
        setDefaultGridData(data);
        setActivateCellEdit(InitializeInternalGridEditStructure(data));
    }

    function setGridEditMode(editMode: boolean): void {
        setEditMode(editMode);
        onGridInEditChange(editMode);
    }

    function setGridEditState(editState: boolean): void {
        if (isGridStateEdited !== editState) {
            setIsGridStateEdited(editState);
            onGridStateEditedChange(editState);
        }
    }

    async function onGridInEditChange(gridInEdit: boolean): Promise<void> {
        if (props.onGridInEditChange) {
            await props.onGridInEditChange(gridInEdit);
        }
    }

    async function onGridStateEditedChange(editState: boolean): Promise<void> {
        if (props.onGridStateEditedChange) {
            await props.onGridStateEditedChange(editState);
        }
    }

    function SetFilteredGridData(filters: IFilter[]): void {
        const filteredData = filterGridData(defaultGridData, filters);
        const activateCellEditTmp = ShallowCopyDefaultGridToEditGrid(defaultGridData, activateCellEdit);
        CheckOnFilter();
        setDefaultGridData(filteredData);
        setActivateCellEdit(activateCellEditTmp);
        setGridData(filteredData);
    }

    /* #region [Grid Bulk Update Functions] */
    const onEditPanelChange = (item: any): void => {
        let defaultGridDataTmp = UpdateBulkData(item, defaultGridData);
        dismissPanelForEdit();
        setIsBulkPanelEdit(false);

        defaultGridDataTmp = CheckBulkUpdateOnChangeCallBack(item, defaultGridDataTmp);

        SetGridItems(defaultGridDataTmp);
    };
    /* #endregion */

    /* #region [Grid Column Update Functions] */
    function UpdateBulkData(data: any, defaultGridDataArr: any[]): any[] {
        const newDefaultGridData = [...defaultGridDataArr];

        selectedItems!.forEach((item) => {
            newDefaultGridData.filter((x => x._grid_row_id_ === item._grid_row_id_)).map((row => {
                const objectKeys = Object.keys(data);
                objectKeys.forEach((objKey) => {
                    row[objKey] = data[objKey];
                    if (row._grid_row_operation_ !== Operation.Add) {
                        row._grid_row_operation_ = Operation.Update;
                    }
                });

                return row;
            }));
        });

        setSelectedItems(selectedItems);
        setGridEditState(true);
        return newDefaultGridData;
    }

    function CheckBulkUpdateOnChangeCallBack(data: any, defaultGridDataTmp: any[]): any[] {
        const columns: IColumnConfig[] = [];
        const columnsToFilter: IColumnConfig[] = props.customEditPanelColumns ? props.customEditPanelColumns : props.columns;
        for (const key in data) {
            const column = columnsToFilter.filter((item) => item.key === key)[0];
            if (column && column.onChange) {
                columns.push(column);
            }
        }

        columns.forEach((column) => {
            defaultGridDataTmp = CheckCellOnChangeCallBack(defaultGridDataTmp, selectedItems!.map(item => item._grid_row_id_), column);
        });

        return defaultGridDataTmp;
    }

    function UpdateGridColumnData(data: any): void {

        let defaultGridDataTmp = UpdateBulkData(data, defaultGridData);

        CloseColumnUpdateDialog();

        defaultGridDataTmp = CheckBulkUpdateOnChangeCallBack(data, defaultGridDataTmp);
        SetGridItems(defaultGridDataTmp);
        UpdateSelectedItems(defaultGridDataTmp);
    }

    function CloseColumnUpdateDialog(): void {
        setIsUpdateColumnClicked(false);
    }

    function ShowColumnUpdate(): void {
        setIsUpdateColumnClicked(s => !s);
    }
    /* #endregion */

    /* #region [Grid Row Add Functions] */
    const CloseRenameDialog = React.useCallback((): void => {
        setDialogContent(undefined);
    }, []);

    const GetDefaultRowObject = (rowCount: number): any[] => {
        const addedRows: any[] = [];
        let _new_grid_row_id_ = Math.max.apply(Math, defaultGridData.map(function (o) { return o._grid_row_id_; }));

        for (let i = 1; i <= rowCount; i++) {
            const obj: any = {};
            props.columns.forEach(item => {
                obj[item.key] = GetDefault(item.dataType)
            })

            obj._grid_row_id_ = ++_new_grid_row_id_;
            obj._grid_row_operation_ = Operation.Add;
            obj._is_filtered_in_ = true;
            obj._is_filtered_in_grid_search_ = true;
            obj._is_filtered_in_column_filter_ = true;
            obj._is_muted_ = false;
            obj._can_edit_row_ = true;
            addedRows.push(obj);
        }

        return addedRows;
    };

    const AddRowsToGrid = (): void => {
        const updateItemName = (): void => {
            if (SpinRef && SpinRef.current.value) {
                setDialogContent(undefined);
                setAnnounced(<Announced message="Rows Added" aria-live="assertive" />);

                const rowCount = parseInt(SpinRef.current.value, 10);
                const addedRows = GetDefaultRowObject(rowCount);
                const newGridData = [...defaultGridData, ...addedRows];
                setGridEditState(true);
                SetGridItems(newGridData);
            }
        };

        setDialogContent(
            <>
                <SpinButton
                    componentRef={SpinRef}
                    defaultValue="0"
                    label={'Row Count:'}
                    min={0}
                    max={100}
                    step={1}
                    incrementButtonAriaLabel={'Increase value by 1'}
                    decrementButtonAriaLabel={'Decrease value by 1'}
                />
                <DialogFooter>
                    <DefaultButton
                        onClick={() => setDialogContent(undefined)}
                        text="Cancel"
                    />
                    <PrimaryButton
                        // eslint-disable-next-line react/jsx-no-bind
                        onClick={updateItemName}
                        text="Save"
                    />
                </DialogFooter>
            </>,
        );
    }

    const onAddPanelChange = (item: any, noOfRows: number): void => {
        dismissPanelForAdd();
        if (noOfRows < 1) {
            return;
        }

        const addedRows = GetDefaultRowObject(noOfRows);
        if (Object.keys(item).length > 0) {
            addedRows.map((row) => {
                const objectKeys = Object.keys(item);
                objectKeys.forEach((key) => {
                    row[key] = item[key];
                })

                return row;
            });
        }

        const newGridData = [...defaultGridData];
        addedRows.forEach((row, index) => newGridData.splice(index, 0, row));
        setGridEditState(true);
        SetGridItems(newGridData);
    };
    /* #endregion */

    /* #region [Grid Row Delete Functions] */
    const ShowMessageDialog = (message: string, subMessage: string): void => {
        setMessageDialogProps({
            visible: true,
            message: message,
            subMessage: subMessage
        });
    }

    const CloseMessageDialog = (): void => {
        setMessageDialogProps({
            visible: false,
            message: '',
            subMessage: ''
        });
    };

    const DeleteSelectedRows = (): void => {

        const defaultGridDataTmp = [...defaultGridData];

        selectedItems!.forEach((item) => {
            defaultGridDataTmp.filter((x => x._grid_row_id_ === item._grid_row_id_)).map((x => x._grid_row_operation_ = Operation.Delete));
        });

        setGridEditState(true);
        SetGridItems(defaultGridDataTmp);
    }
    /* #endregion */

    /* #region [Grid Export Functions] */
    const getExportableData = (): any[] => {
        const exportableColumns = props.columns.filter(x => x.includeColumnInExport === true);

        const exportableData: any[] = [];
        let exportableObj: any = {};
        if (!selectedItems || selectedItems.length === 0) {
            defaultGridData.filter(item => item._grid_row_operation_ !== Operation.Delete && item._is_filtered_in_ && item._is_filtered_in_column_filter_ && item._is_filtered_in_grid_search_).forEach((item1) => {
                exportableColumns.forEach((item2) => {
                    exportableObj[item2.text] = item1[item2.key];
                });
                exportableData.push(exportableObj);
                exportableObj = {};
            });
        }
        else {
            selectedItems!.forEach((sel) => {
                defaultGridData.filter(item => item._grid_row_operation_ !== Operation.Delete && item._is_filtered_in_ && item._is_filtered_in_column_filter_ && item._is_filtered_in_grid_search_).forEach((item1) => {
                    if (sel._grid_row_id_ === item1._grid_row_id_) {
                        exportableColumns.forEach((item2) => {
                            exportableObj[item2.text] = item1[item2.key];
                        });
                        exportableData.push(exportableObj);
                        exportableObj = {};
                    }
                });
            });
        }

        return exportableData;
    }

    const ExportToCSV = (dataRows: any[], fileName: string): void => {
        if (!props.onExcelExport) {
            ExportToCSVUtil(dataRows, fileName);
        }
        else {
            props.onExcelExport(ExportType.CSV);
        }
    };

    const ExportToExcel = (dataRows: any[], fileName: string): void => {
        if (!props.onExcelExport) {
            ExportToExcelUtil(dataRows, fileName);
        }
        else {
            props.onExcelExport(ExportType.XLSX);
        }
    };

    const onExportClick = (type: ExportType): void => {
        const fileName = props.exportFileName != null && props.exportFileName.length > 0 ? props.exportFileName : 'ExcelExport';
        switch (type) {
            case ExportType.XLSX:
                ExportToExcel(getExportableData(), fileName + '.xlsx');
                break;
            case ExportType.CSV:
                ExportToCSV(getExportableData(), fileName + '.csv');
                break;
        }
    };
    /* #endregion */

    /* #region [Grid Cell Edit Functions] */
    const SaveSingleCellValue = (key: string, rowNum: number, defaultGridDataArr: any[]): any[] => {
        const defaultGridDataTmp = [...defaultGridDataArr];
        const internalRowNumDefaultGrid = defaultGridDataTmp.findIndex((row) => row._grid_row_id_ === rowNum);
        const internalRowNumActivateGrid = activateCellEdit.findIndex((row) => row['properties']['_grid_row_id_']['value'] === rowNum);

        const column = props.columns.find(column => column.key === key);
        let dataType: DataType | undefined = undefined;
        let value = activateCellEdit[internalRowNumActivateGrid]['properties'][key]['value'];

        if (column && column.dataType)
            dataType = column.dataType as DataType;

        if (dataType === DataType.decimal)
            value = GetParsedFloat(value);

        defaultGridDataTmp[internalRowNumDefaultGrid][key] = value;

        if (defaultGridDataTmp[internalRowNumDefaultGrid]['_grid_row_operation_'] !== Operation.Add) {
            defaultGridDataTmp[internalRowNumDefaultGrid]['_grid_row_operation_'] = Operation.Update;
        }
        return defaultGridDataTmp;
    };

    const onCellValueChange = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string, item: {}, row: number, key: string, column: IColumnConfig): void => {
        if (!IsValidDataType(column.dataType, text)) {
            const activateCellEditTmp = [...activateCellEdit];
            activateCellEditTmp[row]['properties'][key]['error'] = `Value not '${column.dataType}'`;
            setActivateCellEdit(activateCellEditTmp);
            return;
        }

        setGridEditState(true);

        const activateCellEditTmp: any[] = [];
        activateCellEdit.forEach((item, index) => {
            if (row === index) {
                item.properties[key].value = ParseType(column.dataType, text);
                item.properties[key].error = null;
            }

            activateCellEditTmp.push(item);
        });

        if (column.onChange) {
            HandleColumnOnChange(activateCellEditTmp, row, column);
        }

        //ShallowCopyEditGridToDefaultGrid(defaultGridData, activateCellEditTmp);
        setActivateCellEdit(activateCellEditTmp);
    };

    const CheckCellOnChangeCallBack = (defaultGridDataTmp: any[], row: Number[], column: IColumnConfig): any[] => {
        const callbackRequestparams: ICallBackParams = {
            data: defaultGridDataTmp,
            rowindex: row,
            triggerkey: column.key,
            activatetriggercell: false
        };

        const defaultGridBck: any[] = [...defaultGridDataTmp];
        defaultGridDataTmp = column.onChange(callbackRequestparams);
        if (!defaultGridDataTmp)
            defaultGridDataTmp = defaultGridBck;
        return defaultGridDataTmp;
    };

    const onDoubleClickEvent = (key: string, rowNum: number, activateCurrentCell: boolean): void => {
        EditCellValue(key, rowNum, activateCurrentCell);
    }

    const onCellPickerDoubleClickEvent = (key: string, rowNum: number, activateCurrentCell: boolean): void => {
        EditCellValue(key, rowNum, activateCurrentCell);
    }

    const onDropdownDoubleClickEvent = (key: string, rowNum: number, activateCurrentCell: boolean): void => {
        EditCellValue(key, rowNum, activateCurrentCell);
    }

    const onKeyDownEvent = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, column: IColumnConfig, rowNum: number, activateCurrentCell: boolean): void => {
        if (event.key === "Enter") {
            if (!activateCellEdit[rowNum].isActivated) {
                EditCellValue(column.key, rowNum, activateCurrentCell);
                event.preventDefault();
            }
        }
    }

    const onCellDateChange = (date: Date | null | undefined, item1: {}, row: number, column: IColumnConfig): void => {
        setGridEditState(true);

        const activateCellEditTmp: any[] = [];
        activateCellEdit.forEach((item, index) => {
            if (row === index) {
                item.properties[column.key].value = dateToISOLikeButLocal(date);
            }

            activateCellEditTmp.push(item);
        });

        if (column.onChange) {
            HandleColumnOnChange(activateCellEditTmp, row, column);
        }

        setActivateCellEdit(activateCellEditTmp);
    };

    const onCellPickerTagListChanged = (cellPickerTagList: ITag[] | undefined, row: number, column: IColumnConfig): void => {
        setGridEditState(true);

        const activateCellEditTmp: any[] = [];
        activateCellEdit.forEach((item, index) => {
            if (row === index) {
                item.properties[column.key].value = '';
                if (cellPickerTagList && cellPickerTagList.length > 0) {
                    cellPickerTagList!.forEach((tag) => {
                        item.properties[column.key].value += tag.name + ';';
                    });
                }

                const str: string = item.properties[column.key].value;
                item.properties[column.key].value = str.length > 0 ? str.substring(0, str.length - 1) : str;
            }

            activateCellEditTmp.push(item);
        });

        if (column.onChange) {
            HandleColumnOnChange(activateCellEditTmp, row, column);
        }

        setActivateCellEdit(activateCellEditTmp);
    }

    const onDropDownChange = (event: React.FormEvent<HTMLDivElement>, selectedDropdownItem: IDropdownOption | undefined, row: number, column: IColumnConfig): void => {
        setGridEditState(true);

        const activateCellEditTmp: any[] = [];
        activateCellEdit.forEach((item, index) => {
            if (row === index) {
                item.properties[column.key].value = selectedDropdownItem?.text;
            }

            activateCellEditTmp.push(item);
        });

        if (column.onChange) {
            HandleColumnOnChange(activateCellEditTmp, row, column);
        }

        setActivateCellEdit(activateCellEditTmp);
    };

    const onCheckboxChange = (checked: boolean | undefined, row: number, column: IColumnConfig, item: any): void => {
        setGridEditState(true);

        const activateCellEditTmp: any[] = [];
        activateCellEdit.forEach((item, index) => {
            if (row === index) {
                item.properties[column.key].value = checked;
            }

            activateCellEditTmp.push(item);
        });

        if (column.onChange) {
            HandleColumnOnChange(activateCellEditTmp, row, column);
        }

        HandleCellOnClick(props, column, EditCellValue, row, item);

        EditCellValue(column.key, row, false);

        setActivateCellEdit(activateCellEditTmp);
    };

    const ChangeCellState = (key: string, rowNum: number, activateCurrentCell: boolean, activateCellEditArr: any[]): any[] => {
        const activateCellEditTmp = [...activateCellEditArr];
        activateCellEditTmp[rowNum]['properties'][key]['activated'] = activateCurrentCell;
        activateCellEditTmp[rowNum]['properties'][key]['error'] = !activateCurrentCell ? null : activateCellEditTmp[rowNum]['properties'][key]['error'];
        return activateCellEditTmp;
    };

    const EditCellValue = (key: string, rowNum: number, activateCurrentCell: boolean): void => {
        const activateCellEditTmp: any[] = ChangeCellState(key, rowNum, activateCurrentCell, activateCellEdit);
        setActivateCellEdit(activateCellEditTmp);

        if (!activateCurrentCell) {
            const defaultGridDataTmp: any[] = SaveSingleCellValue(key, rowNum, defaultGridData);
            setDefaultGridData(defaultGridDataTmp);
        }
    }

    const HandleColumnOnChange = (activateCellEditTmp: any[], row: number, column: IColumnConfig): void => {
        const arr: any[] = [];
        activateCellEditTmp.forEach((item) => {
            const rowObj: any = {};
            const objectKeys = Object.keys(item.properties);
            objectKeys.forEach((objKey) => {
                rowObj[objKey] = item.properties[objKey].value;
            });
            arr.push(rowObj);
        });

        const defaultGridDataTmp = CheckCellOnChangeCallBack(arr, [row], column);
        setDefaultGridData(defaultGridDataTmp);
        activateCellEditTmp = ShallowCopyDefaultGridToEditGrid(defaultGridDataTmp, activateCellEditTmp);
    }
    /* #endregion */

    /* #region [Grid Row Edit Functions] */
    function canEditRowsBasedOnCheck(items: any[]): boolean {
        let canEdit = true;

        for (let i = 0; i < items?.length; i++) {
            if (!items[i]._can_edit_row_) {
                canEdit = false;
                break;
            }
        }

        return canEdit;
    }

    function ChangeRowState(item: any, rowNum: number, enableTextField: boolean): any[] {
        let activateCellEditTmp: any[] = [...activateCellEdit];
        const objectKeys = Object.keys(item);
        const canEditRow = item._can_edit_row_;
        objectKeys.filter(key => key !== '_grid_row_id_' && key !== '_grid_row_operation_').forEach((objKey) => {
            if (canEditRow)
                activateCellEditTmp = ChangeCellState(objKey, rowNum, enableTextField, activateCellEditTmp);
        });

        if (canEditRow)
            activateCellEditTmp[rowNum]['isActivated'] = enableTextField;

        return activateCellEditTmp;
    }

    const SaveRowValue = (item: any, rowNum: number, defaultGridDataArr: any[]): any[] => {
        let defaultGridDataTmp = [...defaultGridDataArr];

        const objectKeys = Object.keys(item);
        objectKeys.filter(key => key !== '_grid_row_id_' && key !== '_grid_row_operation_').forEach((objKey) => {
            //defaultGridDataTmp[rowNum][objKey] = activateCellEdit[rowNum]['properties'][objKey]['value'];
            defaultGridDataTmp = SaveSingleCellValue(objKey, rowNum, defaultGridData);
        });

        return defaultGridDataTmp;
    };

    const ShowRowEditMode = (item: any, rowNum: number, enableTextField: boolean): void => {
        if (enableTextField) {
            setCancellableRows(cancellableRows => [...cancellableRows, item]);
        }
        else {
            setCancellableRows(cancellableRows.filter(row => row._grid_row_id_ !== item._grid_row_id_));
        }

        const activateCellEditTmp: any[] = ChangeRowState(item, rowNum, enableTextField);

        setActivateCellEdit(activateCellEditTmp);

        if (!enableTextField) {
            const defaultGridDataTmp: any[] = SaveRowValue(item, rowNum, defaultGridData);
            setDefaultGridData(defaultGridDataTmp);
        }
    }

    // const CancelRowEditMode = (item : any, rowNum : number) : void => {
    //     debugger;
    //     // SetGridItems(defaultGridData);
    //     const activateCellEditTmp : any[] = ChangeRowState(item, rowNum, false);
    //     activateCellEditTmp = RevertRowEditValues(rowNum, activateCellEditTmp);

    //     setActivateCellEdit(activateCellEditTmp);
    //     setDefaultGridData(defaultGridData);
    // }

    const CancelRowEditMode = (item: any, rowNum: number): void => {
        //SetGridItems(defaultGridData);
        let activateCellEditTmp: any[] = ChangeRowState(item, rowNum, false);
        activateCellEditTmp = RevertRowEditValues(rowNum, activateCellEditTmp);

        setActivateCellEdit(activateCellEditTmp);
        //setDefaultGridData(defaultGridData);
        //setDefaultGridData(ShallowCopyEditGridToDefaultGrid(defaultGridData, activateCellEditTmp));
    }

    const RevertRowEditValues = (rowNum: number, activateCellEditArr: any): any[] => {
        const activateCellEditTmp = [...activateCellEditArr];
        //const baseRow = defaultGridData.filter(x => x._grid_row_id_ == rowNum)[0];
        const baseRow = cancellableRows.filter(x => x._grid_row_id_ === rowNum)[0];
        const objectKeys = Object.keys(baseRow);
        const targetRow = activateCellEditTmp.filter(x => x.properties['_grid_row_id_'].value === rowNum)[0];
        objectKeys.forEach((objKey) => {
            if ([objKey !== '_grid_row_id_']) {
                targetRow['properties'][objKey]['value'] = baseRow[objKey];
            }
        });

        setCancellableRows(cancellableRows.filter(row => row._grid_row_id_ !== rowNum));
        return activateCellEditTmp;
    }
    /* #endregion */

    /* #region [Grid Edit Mode Functions] */
    const ShowGridEditMode = (): void => {
        const newEditModeValue = !editMode;
        if (newEditModeValue) {
            setCancellableRows(defaultGridData);
        }
        else {
            setCancellableRows([]);
        }
        let activateCellEditTmp: any[] = [];
        let defaultGridDataTmp: any[] = [];

        defaultGridData.forEach((item) => {
            activateCellEditTmp = ChangeRowState(item, item['_grid_row_id_'], newEditModeValue);
        });

        setActivateCellEdit(activateCellEditTmp);

        if (!newEditModeValue) {
            defaultGridData.forEach((item) => {
                defaultGridDataTmp = SaveRowValue(item, item['_grid_row_id_'], defaultGridData);
            });
            setDefaultGridData(defaultGridDataTmp);
        }

        setGridEditMode(newEditModeValue);
    }

    const CancelGridEditMode = (): void => {
        SetGridItems(cancellableRows);
        setCancellableRows([]);
        setGridEditMode(false);
    }
    /* #endregion */

    /* #region [Grid Copy Functions] */

    const CopyGridRows = (): void => {
        if (selectedIndices.length === 0) {
            ShowMessageDialog(
                "No Rows Selected",
                "Please select some rows to perform this operation"
            );
            return;
        }

        let copyText: string = '';
        selectedItems!.forEach(i => {
            copyText += ConvertObjectToText(defaultGridData.filter(x => x['_grid_row_id_'] === i['_grid_row_id_'])[0], props.columns) + '\r\n';
        });

        navigator.clipboard.writeText(copyText).then(function () {
            if (props.onGridStatusMessageCallback)
                props.onGridStatusMessageCallback(selectedIndices.length + ` ${selectedIndices.length === 1 ? 'row' : 'rows'} copied to clipboard`);
        }, function () {
            /* clipboard write failed */
        });
    }

    const HandleRowCopy = (rowNum: number): void => {
        navigator.clipboard.writeText(ConvertObjectToText(defaultGridData[rowNum], props.columns)).then(function () {
            if (props.onGridStatusMessageCallback)
                props.onGridStatusMessageCallback('1 row copied to clipboard');
        }, function () {
            /* clipboard write failed */
        });
    }

    /* #endregion */

    const RowSelectOperations = (type: EditType): boolean => {
        switch (type) {
            case EditType.ColumnPanelEdit:
                if (selectedIndices.length === 1) {
                    setIsOpenForEdit(true);
                    setIsBulkPanelEdit(false);
                }
                else {
                    ShowMessageDialog('No Row Selected', 'Please select a row to perform this operation');
                }
                break;
            case EditType.BulkEdit:
                if (selectedIndices.length > 0) {
                    setIsOpenForEdit(true);
                    setIsBulkPanelEdit(true);
                }
                else {
                    ShowMessageDialog('No Rows Selected', 'Please select some rows to perform this operation');
                }
                break;
            case EditType.ColumnEdit:
                if (selectedIndices.length > 0) {
                    ShowColumnUpdate();
                }
                else {
                    ShowMessageDialog('No Rows Selected', 'Please select some rows to perform this operation');
                    return false;
                }
                break;
            case EditType.AddRow:
                AddRowsToGrid();
                //toggleHideDialog;
                break;
            case EditType.DeleteRow:
                if (selectedIndices.length > 0) {
                    DeleteSelectedRows();
                }
                else {
                    ShowMessageDialog('No Rows Selected', 'Please select some rows to perform this operation');
                }
                break;
            case EditType.ColumnFilter:
                ShowColumnFilterDialog();
                break;
            case EditType.AddRowWithData:
                setIsOpenForAdd(true);
                break;
        }

        return true;
    }

    const UpdateSelectedItems = (items: Array<any>): void => {
        if (selectedIndices.length) {
            const itemsSelected: Array<any> = [];

            setSelectedItems(selectedIndices.map((index) => {
                itemsSelected.push(items[index]);
            }));

            setSelectedItems(itemsSelected);
        }
    }

    const ResetGridData = (): void => {
        const deeplyCopiedData = deepClone(backupDefaultGridData);

        defaultGridData.filter(item => item._is_muted_ === true).forEach((item) => {
            deeplyCopiedData.find((findItem: any) => findItem.id === item.id)._is_muted_ = true;
        });

        setGridEditState(false);
        ClearFilters();
        SetGridItems(deeplyCopiedData);
        UpdateSelectedItems(backupDefaultGridData);
        onGridReset(deeplyCopiedData);
    };

    const onGridReset = async (data: Array<any>): Promise<void> => {
        if (props.onGridReset) {
            await props.onGridReset(data);
        }
    };

    /* #region [Column Click] */
    const onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn, index: number) => {
        ev.preventDefault();
        ShowFilterForColumn(column, index);
    }

    const onColumnContextMenu = (column: IColumn | undefined) => {
        //ev!.preventDefault();
        const newColumns: IColumn[] = GridColumns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column!.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
            if (newCol === currColumn) {
                currColumn.isSortedDescending = !currColumn.isSortedDescending;
                currColumn.isSorted = true;
            } else {
                newCol.isSorted = false;
                newCol.isSortedDescending = true;
            }
        });

        const newItems = _orderBy(defaultGridData, currColumn.fieldName!, currColumn.isSortedDescending);
        SetGridItems(newItems);

        const newItemsBackup = _orderBy(backupDefaultGridData, currColumn.fieldName!, currColumn.isSortedDescending);
        setBackupDefaultGridData(newItemsBackup);

        setSortColObj({ key: column!.key, isAscending: !currColumn.isSortedDescending, isEnabled: true });
        onGridSort(newItems, currColumn);
    }

    function _orderBy(items: any[], columnKey: string, isSortedDescending?: boolean): any[] {
        return lodash.orderBy(items, [
            item => {
                let value = item[columnKey];

                if (typeof value === 'string')
                    value = value.toLowerCase()

                return value
            }], [isSortedDescending ? 'desc' : 'asc'])
    }

    const onGridSort = async (data: Array<any>, column: IColumn): Promise<void> => {
        if (props.onGridSort) {
            const sortedData = data.filter(x => x._grid_row_operation_ !== Operation.Delete && x._is_filtered_in_ && x._is_filtered_in_column_filter_ && x._is_filtered_in_grid_search_);
            await props.onGridSort(sortedData, column);
        }
    };
    /* #endregion */

    /* #region [Column Filter] */
    const CheckOnFilter = async () => {
        const filteredData: Array<any> = defaultGridData.filter(x => x._grid_row_operation_ !== Operation.Delete && x._is_filtered_in_ && x._is_filtered_in_column_filter_ && x._is_filtered_in_grid_search_);
        await onGridFilter(filteredData);
    };

    const onGridFilter = async (data: Array<any>): Promise<void> => {
        if (props.onGridFilter) {
            await props.onGridFilter(data);
        }
    };

    const getFilterStoreRef = (): IFilter[] => {
        return filterStoreRef.current;
    };

    const setFilterStoreRef = (value: IFilter[]): void => {
        filterStoreRef.current = value;
    };

    const clearFilterStoreRef = (): void => {
        filterStoreRef.current = [];
    }

    const CloseColumnFilterDialog = (): void => {
        setIsColumnFilterClicked(false);
    };

    const ShowColumnFilterDialog = (): void => {
        setIsColumnFilterClicked(s => !s);
    };

    const onFilterApplied = (filter: IFilter): void => {
        const tags: ITag[] = [...defaultTag];
        tags.push({
            name: '\'' + filter.column.key + '\' ' + filter.operator + ' ' + '\'' + filter.value + '\'',
            key: filter.column.key
        })

        const filterStoreTmp: IFilter[] = getFilterStoreRef();;
        filterStoreTmp.push(filter);
        setFilterStoreRef(filterStoreTmp);
        setFilteredColumns(filteredColumns => [...filteredColumns, filter.column]);
        setDefaultTag(tags);
        CloseColumnFilterDialog();
    }

    const ClearFilters = (): void => {
        setDefaultTag([]);
        clearFilterStoreRef();
        setFilteredColumns([]);
    }

    const onFilterTagListChanged = React.useCallback((tagList: ITag[] | undefined): void => {

        if (tagList != null && tagList.length === 0) {
            ClearFilters();
            return;
        }

        const filterStoreTmp: IFilter[] = [];
        tagList!.forEach((item) => {
            const storeRow = getFilterStoreRef().filter((val) => val.column.key === item.key);
            if (storeRow.length > 0) {
                filterStoreTmp.push(storeRow[0]);
            }
        });

        setFilterStoreRef(filterStoreTmp);
        const filteredColumnsTmp: IColumnConfig[] = props.columns.filter((item) => tagList!.filter((val) => val.key === item.key).length > 0);
        setFilteredColumns(filteredColumnsTmp);
        setDefaultTag(tagList!);
    }, []);

    const onFilterChanged = React.useCallback((): ITag[] => {
        const emptyITag: ITag[] = [];
        return emptyITag;
    }, []);

    const getTextFromItem = (item: ITag): string => {
        return item.name;
    }

    const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
        suggestionsHeaderText: 'Suggested tags',
        noResultsFoundText: 'No item tags found',
    };

    const inputProps: IInputProps = {
        'aria-label': 'Tag Picker',
    };
    /* #endregion [Column Filter] */

    /* #region [Grid Column Filter] */
    const onFilterApply = (filter: IFilterListProps): void => {
        UpdateColumnFilterValues(filter);
        const GridColumnFilterArr: IGridColumnFilter[] = getColumnFiltersRef();
        const filteredData = applyGridColumnFilter(defaultGridData, GridColumnFilterArr);
        CheckOnFilter();
        getColumnFiltersRefForColumnKey(filter.columnKey).isApplied = filter.filterList.filter(i => i.isChecked).length > 0 && filter.filterList.filter(i => i.isChecked).length < filter.filterList.length ? true : false;
        const activateCellEditTmp = ShallowCopyDefaultGridToEditGrid(defaultGridData, activateCellEdit);
        setDefaultGridData(filteredData);
        setActivateCellEdit(activateCellEditTmp);
        setGridData(filteredData);
        setFilterCalloutComponent(undefined);
    }

    const UpdateColumnFilterValues = (filter: IFilterListProps): void => {
        const gridColumnFilter: IGridColumnFilter = getColumnFiltersRefForColumnKey(filter.columnKey);
        gridColumnFilter.filterCalloutProps!.filterList = filter.filterList;
        gridColumnFilter.isHidden = true;
        gridColumnFilter.isApplied = true;
    }

    const ShowFilterForColumn = (column: IColumn, index: number): void => {
        const filter: IGridColumnFilter = getColumnFiltersRefAtIndex(index);
        filter.isHidden = !filter.isHidden;
        if (filter.isHidden) {
            setFilterCalloutComponent(undefined);
            return;
        }

        const filters: IGridColumnFilter[] = getColumnFiltersRef();
        filters.filter((item) => item.index !== filter.index && item.column.key !== filter.column.key)
            .map((item) => item.isHidden = true);

        filter.filterCalloutProps!.filterList = GetUniqueColumnValues(column, filter.filterCalloutProps!.filterList);

        setFilterCalloutComponent(<FilterCallout onCancel={() => { setFilterCalloutComponent(undefined) }} onApply={onFilterApply} columnKey={filter.filterCalloutProps!.columnKey} columnName={filter.filterCalloutProps!.columnName} filterList={filter.filterCalloutProps!.filterList} columnClass={filter.filterCalloutProps!.columnClass} />);
    }

    const GetUniqueColumnValues = (column: IColumn, prevFilters: IFilterItem[]): IFilterItem[] => {
        const uniqueVals: string[] = [...new Set(defaultGridData.filter((x) => (x._grid_row_operation_ !== Operation.Delete) && (x._is_filtered_in_column_filter_ === true) && (x._is_filtered_in_grid_search_ === true))
            .map(item => item[column.fieldName!]))];
        const hiddenUniqueVals: string[] = [...new Set(defaultGridData.filter((x) => (x._grid_row_operation_ !== Operation.Delete) && ((x._is_filtered_in_column_filter_ === false) || (x._is_filtered_in_grid_search_ === false)))
            .map(item => item[column.fieldName!]))];

        let filterItemArr: IFilterItem[] = [];
        if (!prevFilters || prevFilters.length === 0) {
            filterItemArr = uniqueVals.map((item) => {
                return { text: item, isChecked: true }
            })
        }
        else {
            filterItemArr = uniqueVals.map((item) => {
                const filters: IFilterItem[] = prevFilters.filter((i) => i.text === item);
                return { text: item, isChecked: filters.length > 0 ? filters[0].isChecked : true }
            });
        }

        return [...filterItemArr, ...hiddenUniqueVals.filter(i => !uniqueVals.includes(i)).map(i => {
            return { text: i, isChecked: false }
        })];
    }

    const getColumnFiltersRef = (): IGridColumnFilter[] => {
        return gridColumnFilterArrRef.current;
    };

    const getColumnFiltersRefAtIndex = (index: number): IGridColumnFilter => {
        return gridColumnFilterArrRef.current[index];
    };

    const getColumnFiltersRefForColumnKey = (key: string): IGridColumnFilter => {
        const gridColumnFilterArr: IGridColumnFilter[] = [...gridColumnFilterArrRef.current];
        return gridColumnFilterArr.filter((item) => item.column.key === key)[0];
    };

    // const setColumnFiltersRefAtIndex = (index: number, filter: IGridColumnFilter): void => {
    //     gridColumnFilterArrRef.current[index] = filter;
    // };

    const setColumnFiltersRef = (value: IGridColumnFilter[]): void => {
        gridColumnFilterArrRef.current = value;
    };

    // const clearColumnFiltersRef = (): void => {
    //     gridColumnFilterArrRef.current = [];
    // }
    /* #endregion [Grid Column Filter] */

    const CreateColumnConfigs = (): IColumn[] => {

        const columnConfigs: IColumn[] = [];
        const columnFilterArrTmp: IGridColumnFilter[] = [];

        props.columns.forEach((column, index) => {
            const colHeaderClassName = 'id-' + props.id + '-col-' + index;
            const colKey = 'col' + index;
            const isDataTypeSupportedForFilter: boolean = isColumnDataTypeSupportedForFilter(column.dataType);

            if (column.isSortedByDefault && sortColObj.key === '') {
                setSortColObj({ key: colKey, isAscending: column.isSortedDescending ? !column.isSortedDescending : true, isEnabled: true });
            }

            columnConfigs.push({
                key: colKey,
                name: column.text,
                className: `${column.className ? column.className : ''}`,
                headerClassName: `${colHeaderClassName} ${column.headerClassName}`,
                styles: column.styles,
                ariaLabel: column.ariaLabel ? column.ariaLabel : column.text,
                fieldName: column.key,
                isResizable: true,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                onRenderHeader: column.onRenderHeader,
                onColumnContextMenu: !column.disableSort && !(isGridInEdit || editMode) ? (col, ev) => onColumnContextMenu(col) : undefined,
                onColumnClick: !(isGridInEdit || editMode) && (isDataTypeSupportedForFilter && column.applyColumnFilter && props.enableColumnFilters) ? (ev, col) => onColumnClick(ev, col, index) : undefined,
                //data: item.dataType,
                isSorted: sortColObj.isEnabled && sortColObj.key === colKey,
                isSortedDescending: !(sortColObj.isEnabled && sortColObj.key === colKey) || !sortColObj.isAscending,
                isFiltered: (isDataTypeSupportedForFilter && column.applyColumnFilter && props.enableColumnFilters && (getColumnFiltersRef() && getColumnFiltersRef().length > 0 && getColumnFiltersRef().filter(i => i.column.key === column.key).length > 0 && getColumnFiltersRef().filter(i => i.column.key === column.key)[0].isApplied)) ? true : false,
                sortAscendingAriaLabel: 'Sorted A to Z',
                sortDescendingAriaLabel: 'Sorted Z to A',
                isMultiline: column.isMultiline,
                onRender: column.onRender ? column.onRender : (item, rowNum) => {
                    rowNum = Number(item['_grid_row_id_']);
                    const _shouldRenderSpan = shouldRenderSpan();
                    const isEditableInGrid = item._can_edit_row_ && column.editable;
                    const isEditableInPanelOnly = isEditableInGrid && column.editableOnlyInPanel;
                    const rowInEdit = activateCellEdit && activateCellEdit[Number(item['_grid_row_id_'])!] && activateCellEdit[Number(item['_grid_row_id_'])!]['isActivated'];
                    const tooltipText =
                        props.cellEditTooltip?.showTooltip && !rowInEdit && !editMode && isEditableInGrid && !isEditableInPanelOnly && column.inputType !== EditControlType.Checkbox ?
                            _shouldRenderSpan ?
                                props.enableSingleClickCellEdit ?
                                    "Click to edit" :
                                    "Double-click to edit"
                                : props.enableSingleClickCellEdit ?
                                    "Click to stop editing" :
                                    "Double-click to stop editing"
                            : props.cellEditTooltip?.showTooltip && isEditableInPanelOnly ?
                                "Editing disabled for this value on the grid. Please click on \"Edit Item\" to edit it."
                                : "";

                    const tooltipHostProps: ITooltipHostProps = {
                        delay: TooltipDelay.zero,
                        hostClassName: `cell-value ${isEditableInGrid ? "editable" : "non-editable"} ${isEditableInPanelOnly ? "editable-panel-only" : ""}`,
                        className: mergeStyles({
                            pointerEvents: 'none'
                        }),
                        styles: {
                            root: { display: props.alignCellsMiddle ? 'flex' : 'inline-block', width: '100%', height: '100%', alignItems: props.alignCellsMiddle ? 'center' : undefined }

                        },
                        calloutProps: { gapSpace: 5 },
                        directionalHint: props.cellEditTooltip?.tooltipDirectionalHint ? props.cellEditTooltip.tooltipDirectionalHint : props.alignCellsMiddle ? DirectionalHint.leftCenter : DirectionalHint.leftTopEdge,
                        content: tooltipText
                    }

                    switch (column.inputType) {
                        case EditControlType.MultilineTextField:
                            return <TooltipHost {...tooltipHostProps} >{
                                _shouldRenderSpan
                                    ?
                                    (column?.hoverComponentOptions?.enable ?
                                        (<HoverCard
                                            type={HoverCardType.plain}
                                            plainCardProps={{
                                                onRenderPlainCard: () => onRenderPlainCard(column, rowNum!, item),
                                            }}
                                            instantOpenOnClick
                                        >
                                            {RenderMultilineTextFieldSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined)}
                                        </HoverCard>)
                                        :
                                        (RenderMultilineTextFieldSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined))
                                    )

                                    :
                                    (<TextField
                                        errorMessage={activateCellEdit[rowNum!]['properties'][column.key].error}
                                        label={item.text}
                                        ariaLabel={column.key}
                                        multiline={true}
                                        rows={1}
                                        styles={textFieldStyles}
                                        onChange={(ev, text) => onCellValueChange(ev, text!, item, rowNum!, column.key, column)}
                                        autoFocus={!props.enableDefaultEditMode && !editMode && !(activateCellEdit && activateCellEdit[Number(item['_grid_row_id_'])!] && activateCellEdit[Number(item['_grid_row_id_'])!]['isActivated'])}
                                        value={activateCellEdit[rowNum!]['properties'][column.key].value}
                                        onDoubleClick={() => !activateCellEdit[rowNum!].isActivated ? onDoubleClickEvent(column.key, rowNum!, false) : null}
                                        maxLength={column.maxLength != null ? column.maxLength : 10000}
                                    />)
                            }</TooltipHost>
                        case EditControlType.Date:
                            return <TooltipHost {...tooltipHostProps} >{
                                _shouldRenderSpan
                                    ?
                                    (column?.hoverComponentOptions?.enable ?
                                        (<HoverCard
                                            type={HoverCardType.plain}
                                            plainCardProps={{
                                                onRenderPlainCard: () => onRenderPlainCard(column, rowNum!, item),
                                            }}
                                            instantOpenOnClick
                                        >
                                            {RenderDateSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined)}
                                        </HoverCard>)
                                        :
                                        (RenderDateSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined))
                                    )
                                    :
                                    (<DatePicker
                                        strings={DayPickerStrings}
                                        placeholder="Select a date..."
                                        ariaLabel={column.key}
                                        className={mergeStyles({
                                            'div[class^="statusMessage"]': {
                                                marginTop: props.alignCellsMiddle ? 0 : undefined
                                            }
                                        })}
                                        value={activateCellEdit[rowNum!].properties[column.key].value ? new Date(activateCellEdit[rowNum!].properties[column.key].value) : undefined}
                                        onSelectDate={(date) => onCellDateChange(date, item, rowNum!, column)}
                                        onDoubleClick={() => !activateCellEdit[rowNum!].isActivated ? onDoubleClickEvent(column.key, rowNum!, false) : null}
                                    />)
                            }</TooltipHost>
                        case EditControlType.DropDown:
                            return <TooltipHost {...{ ...tooltipHostProps, ...{ hostClassName: tooltipHostProps.hostClassName + ' row-' + rowNum! + '-col-' + index } }} >{
                                _shouldRenderSpan
                                    ?
                                    (column?.hoverComponentOptions?.enable ?
                                        (<HoverCard
                                            type={HoverCardType.plain}
                                            plainCardProps={{
                                                onRenderPlainCard: () => onRenderPlainCard(column, rowNum!, item),
                                            }}
                                            instantOpenOnClick
                                        >
                                            {RenderDropdownSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined)}
                                        </HoverCard>)
                                        :
                                        (RenderDropdownSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined))
                                    )

                                    :
                                    (<Dropdown
                                        ariaLabel={column.key}
                                        placeholder={(typeof column.dropdownValues === 'function' ? column.dropdownValues(item) as IDropdownOption[] : column.dropdownValues ?? [])?.filter(x => x.text === item[column.key])[0]?.text ?? 'Select an option'}
                                        options={typeof column.dropdownValues === 'function' ? column.dropdownValues(item) as IDropdownOption[] : column.dropdownValues ?? []}
                                        styles={dropdownStyles}
                                        dropdownWidth={'auto'}
                                        onChange={(ev, selectedItem) => onDropDownChange(ev, selectedItem, rowNum!, column)}
                                        onDoubleClick={() => !activateCellEdit[rowNum!].isActivated ? onDropdownDoubleClickEvent(column.key, rowNum!, false) : null}
                                    />)
                            }</TooltipHost>
                        case EditControlType.Picker:
                            return <TooltipHost {...tooltipHostProps} >{
                                _shouldRenderSpan
                                    ?
                                    (column?.hoverComponentOptions?.enable ?
                                        (<HoverCard
                                            type={HoverCardType.plain}
                                            plainCardProps={{
                                                onRenderPlainCard: () => onRenderPlainCard(column, rowNum!, item),
                                            }}
                                            instantOpenOnClick
                                        >
                                            {RenderPickerSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined)}
                                        </HoverCard>)
                                        :
                                        (RenderPickerSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined))
                                    )
                                    :
                                    (<span onDoubleClick={() => !activateCellEdit[rowNum!].isActivated ? onCellPickerDoubleClickEvent(column.key, rowNum!, false) : null}>
                                        <PickerControl
                                            arialabel={column.key}
                                            selectedItemsLimit={column.pickerOptions?.tagsLimit}
                                            pickerTags={column.pickerOptions?.pickerTags ?? []}
                                            defaultTags={item[column.key] ? item[column.key].split(";") : []}
                                            minCharLimitForSuggestions={column.pickerOptions?.minCharLimitForSuggestions}
                                            onTaglistChanged={(selectedItem: ITag[] | undefined) => onCellPickerTagListChanged(selectedItem, rowNum!, column)}
                                            pickerDescriptionOptions={column.pickerOptions?.pickerDescriptionOptions}
                                            suggestionRule={column.pickerOptions?.suggestionsRule}
                                        />
                                    </span>)
                            }</TooltipHost>
                        case EditControlType.Checkbox:
                            let isCheckboxDisabled: boolean = false;

                            isCheckboxDisabled = !props.enableCellEdit || !column.editable || column.editableOnlyInPanel || item._is_muted_ || !item._can_edit_row_;

                            if (column.editable && !column.editableOnlyInPanel && props.enableRowEdit && (activateCellEdit && activateCellEdit[Number(item['_grid_row_id_'])!] && activateCellEdit[Number(item['_grid_row_id_'])!]['isActivated'])) {
                                isCheckboxDisabled = false;
                            }

                            return <TooltipHost {...tooltipHostProps} >{
                                (column?.hoverComponentOptions?.enable ?
                                    (<HoverCard
                                        type={HoverCardType.plain}
                                        plainCardProps={{
                                            onRenderPlainCard: () => onRenderPlainCard(column, rowNum!, item),
                                        }}
                                        instantOpenOnClick
                                    >
                                        <Checkbox
                                            inputProps={{
                                                // @ts-ignore
                                                "data-is-focusable": false
                                            }}
                                            ariaLabel={column.key}
                                            disabled={isCheckboxDisabled}
                                            checked={activateCellEdit[rowNum!].properties[column.key].value || false}
                                            onChange={(ev, checked) => onCheckboxChange(checked, rowNum!, column, item)}
                                        />
                                    </HoverCard>)
                                    :
                                    <Checkbox
                                        inputProps={{
                                            // @ts-ignore
                                            "data-is-focusable": false
                                        }}
                                        ariaLabel={column.key}
                                        disabled={isCheckboxDisabled}
                                        checked={activateCellEdit[rowNum!].properties[column.key].value || false}
                                        onChange={(ev, checked) => onCheckboxChange(checked, rowNum!, column, item)}
                                    />
                                )
                            }</TooltipHost>
                        case EditControlType.Link:
                            return <span className='span-value'>{
                                (column?.hoverComponentOptions?.enable ?
                                    (<HoverCard
                                        type={HoverCardType.plain}
                                        plainCardProps={{
                                            onRenderPlainCard: () => onRenderPlainCard(column, rowNum!, item),
                                        }}
                                        instantOpenOnClick
                                    >
                                        {RenderLinkSpan(props, index, rowNum, column, item, EditCellValue)}
                                    </HoverCard>)
                                    :
                                    (RenderLinkSpan(props, index, rowNum, column, item, EditCellValue))
                                )
                            }</span>
                        default:
                            return <TooltipHost {...tooltipHostProps} >{
                                _shouldRenderSpan
                                    ?
                                    (column?.hoverComponentOptions?.enable ?
                                        (<HoverCard
                                            type={HoverCardType.plain}
                                            plainCardProps={{
                                                onRenderPlainCard: () => onRenderPlainCard(column, rowNum!, item),
                                            }}
                                            instantOpenOnClick
                                        >
                                            {RenderTextFieldSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined)}
                                        </HoverCard>)
                                        : (RenderTextFieldSpan(props, index, rowNum, column, item, EditCellValue, column.onCustomRender ? column.onCustomRender(item, index, column) : undefined))
                                    )
                                    :
                                    (<TextField
                                        errorMessage={activateCellEdit[rowNum!]['properties'][column.key].error}
                                        label={item.text}
                                        ariaLabel={column.key}
                                        styles={textFieldStyles}
                                        onChange={(ev, text) => onCellValueChange(ev, text!, item, rowNum!, column.key, column)}
                                        autoFocus={!props.enableDefaultEditMode && !editMode && !(activateCellEdit?.[Number(item['_grid_row_id_'])!]?.['isActivated'])}
                                        onDoubleClick={() => !activateCellEdit[rowNum!].isActivated ? onDoubleClickEvent(column.key, rowNum!, false) : null}
                                        value={activateCellEdit[rowNum!]['properties'][column.key].value}
                                        onKeyDown={(event) => onKeyDownEvent(event, column, rowNum!, false)}
                                        maxLength={column.maxLength != null ? column.maxLength : 1000}
                                    />)}</TooltipHost>
                    }

                    function shouldRenderSpan() {
                        return ((!column.editable || column.editableOnlyInPanel || item._is_muted_) || (!props.enableDefaultEditMode && !(activateCellEdit?.[rowNum!]?.isActivated) && !(activateCellEdit?.[rowNum!]?.['properties'][column.key]?.activated)));
                    }
                }
            });

            if (getColumnFiltersRef().length === 0) {
                columnFilterArrTmp.push({
                    index: index,
                    column: column,
                    isApplied: false,
                    isHidden: true,
                    filterCalloutProps: {
                        columnKey: column.key,
                        columnClass: colHeaderClassName,
                        columnName: column.text,
                        filterList: []
                    }
                });
            }
        });

        if (getColumnFiltersRef().length === 0) {
            setColumnFiltersRef(columnFilterArrTmp);
        }

        if (props.enableRowEdit || props.gridCopyOptions?.enableRowCopy || props.rowMuteOptions?.enableRowMute) {
            let minWidth: number = 50,
                maxWidth: number = 75,
                buttonNumber: number = 0;

            if (props.enableRowEdit)
                buttonNumber++;
            if (props.gridCopyOptions?.enableRowCopy)
                buttonNumber++;
            if (props.rowMuteOptions?.enableRowMute)
                buttonNumber++;

            switch (buttonNumber) {
                case 1:
                    minWidth = 75;
                    maxWidth = 100;
                    break;
                case 2:
                    minWidth = 100;
                    maxWidth = 125;
                    break;
                case 3:
                    minWidth = 125;
                    maxWidth = 150;
                    break;
                default:
                    break;
            }

            if (props.prependRowEditActions) {
                maxWidth += 0;
            }

            const actionsColumn: IColumnConfig = {
                key: 'action',
                text: 'Actions',
                name: 'Actions',
                ariaLabel: 'Actions',
                fieldName: 'action',
                isResizable: true,
                minWidth: minWidth,
                maxWidth: maxWidth,
                className: `actions-cell ${props.alignCellsMiddle ? mergeStyles({
                    display: 'flex !important',
                    alignItems: 'center'
                }) : undefined}`,
                onRender: (item) => (
                    <>
                        {
                            props.enableRowEdit && isGlobalEditEnabled ?
                                (activateCellEdit && activateCellEdit[Number(item['_grid_row_id_'])!] && activateCellEdit[Number(item['_grid_row_id_'])!]['isActivated'])
                                    ?
                                    <>
                                        <IconButton data-is-focusable={false} disabled={editMode || item._is_muted_} onClick={() => ShowRowEditMode(item, Number(item['_grid_row_id_'])!, false)} iconProps={{ iconName: 'Save' }} title={'Save'}></IconButton>
                                        {props.enableRowEditCancel
                                            ?
                                            <IconButton data-is-focusable={false} disabled={editMode || item._is_muted_} onClick={() => CancelRowEditMode(item, Number(item['_grid_row_id_'])!)} iconProps={{ iconName: 'RemoveFilter' }} title={'Cancel'}></IconButton>
                                            :
                                            null
                                        }
                                    </>
                                    :
                                    <>
                                        {!props.enableDefaultEditMode &&
                                            <TooltipHost calloutProps={{ gapSpace: 5 }} content={!item._is_muted_ && item._can_edit_row_ ? "Edit" : ""}>
                                                <IconButton data-is-focusable={false} disabled={item._is_muted_ || !item._can_edit_row_} onClick={() => ShowRowEditMode(item, Number(item['_grid_row_id_'])!, true)} iconProps={{ iconName: 'Edit' }} ></IconButton>
                                            </TooltipHost>
                                        }
                                    </> : null
                        }

                        {
                            props.rowMuteOptions?.enableRowMute ?
                                <TooltipHost calloutProps={{ gapSpace: 5 }} content={!(activateCellEdit && activateCellEdit[Number(item['_grid_row_id_'])!] && activateCellEdit[Number(item['_grid_row_id_'])!]['isActivated']) ?

                                    item._is_muted_ ? props.rowMuteOptions?.rowUnmuteText ? props.rowMuteOptions.rowUnmuteText : 'Unmute' : props.rowMuteOptions.rowMuteText ? props.rowMuteOptions.rowMuteText : 'Mute'


                                    : ""}>
                                    <IconButton
                                        disabled={activateCellEdit && activateCellEdit[Number(item['_grid_row_id_'])!] && activateCellEdit[Number(item['_grid_row_id_'])!]['isActivated']}
                                        data-is-focusable={false}
                                        onClick={() => {
                                            const defaultGridDataTmp = [...defaultGridData];

                                            defaultGridDataTmp.filter((x => x._grid_row_id_ === item._grid_row_id_)).forEach((
                                                x => {
                                                    x._is_muted_ = !x._is_muted_;
                                                    x._grid_row_operation_ = x._is_muted_ ? Operation.Mute : item._can_edit_row_ ? Operation.Update : Operation.None
                                                }
                                            ));

                                            //setGridEditState(true);
                                            SetGridItems(defaultGridDataTmp);
                                        }} iconProps={{ iconName: `${item._is_muted_ ? 'RedEye' : 'Hide'}` }}></IconButton>
                                </TooltipHost>
                                : null
                        }

                        {
                            props.gridCopyOptions?.enableRowCopy && isGlobalEditEnabled ?
                                <TooltipHost calloutProps={{ gapSpace: 5 }} content={!item._is_muted_ && item._can_edit_row_ ? "Copy row" : ""}>
                                    <IconButton
                                        disabled={item._is_muted_ || !item._can_edit_row_}
                                        data-is-focusable={false}
                                        onClick={() => HandleRowCopy(Number(item['_grid_row_id_'])!)}
                                        iconProps={{ iconName: "Copy" }}
                                    ></IconButton>
                                </TooltipHost>
                                : null
                        }
                    </>
                ),
            };

            if (isGlobalEditEnabled || (!isGlobalEditEnabled && props.rowMuteOptions?.enableRowMute))
                props.prependRowEditActions ? columnConfigs.unshift(actionsColumn) : columnConfigs.push(actionsColumn);
        }

        return columnConfigs;
    };

    const CreateCommandBarItemProps = (): ICommandBarItemProps[] => {
        const commandBarItems: ICommandBarItemProps[] = [];

        props.customCommandBarItems?.forEach(commandBarItem => {
            commandBarItems.push(commandBarItem);
        });

        if (props.enableExport) {
            commandBarItems.push({
                id: 'export',
                key: 'exportGrid',
                text: 'Export',
                ariaLabel: 'Export',
                disabled: isGridInEdit || editMode,
                cacheKey: 'myCacheKey',
                iconProps: { iconName: 'Download' },
                subMenuProps: {
                    items: [
                        {
                            key: 'exportToExcel',
                            text: 'Excel Export',
                            iconProps: { iconName: 'ExcelDocument' },
                            onClick: () => onExportClick(ExportType.XLSX)
                        },
                        {
                            key: 'exportToCSV',
                            text: 'CSV Export',
                            iconProps: { iconName: 'LandscapeOrientation' },
                            onClick: () => onExportClick(ExportType.CSV)
                        }
                    ],
                }
            });
        }

        if (props.enableColumnFilterRules) {
            commandBarItems.push({
                id: 'columnfilter',
                key: 'columnFilters',
                text: 'Filter',
                ariaLabel: 'Filter',
                disabled: isGridInEdit || editMode,
                cacheKey: 'myColumnFilterCacheKey',
                iconProps: { iconName: 'Filter' },
                subMenuProps: {
                    items: [
                        {
                            key: 'columnFilter',
                            text: 'Column Filter',
                            iconProps: { iconName: 'Filter' },
                            onClick: () => RowSelectOperations(EditType.ColumnFilter)
                        },
                        {
                            key: 'clearFilters',
                            text: 'Clear Filters',
                            iconProps: { iconName: 'ClearFilter' },
                            onClick: () => ClearFilters()
                        }
                    ],
                }
            });
        }

        if (!props.enableDefaultEditMode && props.enableTextFieldEditMode && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'editmode',
                key: 'editmode',
                disabled: isGridInEdit && !editMode,
                text: !editMode ? "Edit Mode" : "Save Edits",
                iconProps: { iconName: !editMode ? "Edit" : "Save" },
                onClick: () => ShowGridEditMode()
            });
        }

        if (!props.enableDefaultEditMode && props.enableTextFieldEditModeCancel && editMode) {
            commandBarItems.push({
                key: 'editmodecancel',
                disabled: isGridInEdit && !editMode,
                text: "Cancel",
                iconProps: { iconName: "Cancel" },
                //onClick: () => {SetGridItems(defaultGridData); setEditMode(false)}
                onClick: () => { CancelGridEditMode() }
            });
        }

        if (props.enablePanelEdit && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'enablepaneledit',
                key: 'enablepaneledit',
                text: "Edit Item",
                disabled: isGridInEdit || editMode || selectionCount === 0 || selectionCount > 1 || (selectedItems?.length ? !selectedItems[0]?._can_edit_row_ : false),
                iconProps: { iconName: "DoubleColumnEdit" },
                onClick: () => RowSelectOperations(EditType.ColumnPanelEdit)
            });
        }

        if (props.enableBulkEdit && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'bulkedit',
                key: 'bulkedit',
                text: "Bulk Edit",
                disabled: isGridInEdit || editMode || selectionCount === 0 || selectionCount === 1 || (selectedItems?.length ? !canEditRowsBasedOnCheck(selectedItems) : false),
                iconProps: { iconName: "TripleColumnEdit" },
                onClick: () => RowSelectOperations(EditType.BulkEdit)
            });
        }

        if (props.enableColumnEdit && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'updatecolumn',
                key: 'updatecolumn',
                disabled: isGridInEdit || editMode || selectionCount === 0 || (selectedItems?.length ? !selectedItems[0]?._can_edit_row_ : false),
                text: !isUpdateColumnClicked ? "Update Column" : "Save Column Update",
                iconProps: { iconName: "SingleColumnEdit" },
                onClick: () => RowSelectOperations(EditType.ColumnEdit)
            });
        }

        if (props.gridCopyOptions && props.gridCopyOptions.enableGridCopy && isGlobalEditEnabled) {
            commandBarItems.push({
                key: "copy",
                text: "Copy",
                disabled: isGridInEdit || editMode || selectionCount === 0,
                iconProps: { iconName: "Copy" },
                onClick: () => CopyGridRows(),
            });
        }

        if (props.enableGridRowsAdd && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'addrows',
                key: 'addrows',
                text: "Add Rows",
                disabled: isGridInEdit || editMode,
                iconProps: { iconName: "AddTo" },
                onClick: () => RowSelectOperations(EditType.AddRow)
            });
        }

        if (props.enableRowAddWithValues && props.enableRowAddWithValues.enable && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'addrowswithdata',
                key: 'addrowswithdata',
                text: "Add Rows with Data",
                disabled: isGridInEdit || editMode,
                iconProps: { iconName: "AddToShoppingList" },
                onClick: () => RowSelectOperations(EditType.AddRowWithData)
            });
        }

        if (props.enableGridRowsDelete && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'deleterows',
                key: 'deleterows',
                text: "Delete Rows",
                disabled: isGridInEdit || editMode || selectionCount === 0,
                iconProps: { iconName: "DeleteRows" },
                onClick: () => RowSelectOperations(EditType.DeleteRow)
            });
        }

        if (props.enableSave === true && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'submit',
                key: 'submit',
                text: props.enableSaveText ? props.enableSaveText : "Submit",
                ariaLabel: props.enableSaveText ? props.enableSaveText : "Submit",
                disabled: isGridInEdit || !isGridStateEdited,
                iconProps: { iconName: 'Save' },
                className: 'commandbar-save',
                onClick: () => onGridSave(),
            });
        }

        if (props.enableGridReset && isGlobalEditEnabled) {
            commandBarItems.push({
                id: 'resetgrid',
                key: 'resetGrid',
                disabled: (isGridInEdit || editMode) || !isGridStateEdited,
                text: "Reset Data",
                iconProps: { iconName: "Refresh" },
                className: 'commandbar-reset',
                onClick: () => ResetGridData()
            });
        }

        return commandBarItems;
    };

    const CreateCommandBarFarItemProps = (): ICommandBarItemProps[] => {

        const commandBarItems: ICommandBarItemProps[] = [];

        props.customCommandBarFarItems?.forEach(commandBarItem => {
            commandBarItems.push(commandBarItem);
        });

        if ((isGridInEdit || editMode) && props.enableGridInEditIndicator)
            commandBarItems.push({
                id: 'edit',
                key: 'edit',
                text: 'Grid is being edited',
                // This needs an ariaLabel since it's icon-only
                ariaLabel: 'Edit info',
                iconOnly: true,
                buttonStyles: { root: { cursor: 'default' } },
                iconProps: { iconName: 'Edit' }
            })


        if (isGridStateEdited && props.enableUnsavedEditIndicator && (props.enableRowEdit || props.enableCellEdit || props.enableBulkEdit || props.enableColumnEdit || props.enableTextFieldEditMode))
            commandBarItems.push({
                id: 'info',
                key: 'info',
                text: `Grid has unsaved data. Click on ${props.enableSaveText ? '"' + props.enableSaveText + '"' : '"Submit"'} to save`,
                // This needs an ariaLabel since it's icon-only
                ariaLabel: 'Info',
                iconOnly: true,
                buttonStyles: { root: { cursor: 'default' } },
                iconProps: { iconName: 'SaveTemplate' }
            })


        commandBarItems.push({
            key: "filteredrecs",
            text: `${defaultGridData.filter(
                (x) =>
                    x._grid_row_operation_ !== Operation.Delete &&
                    x._is_filtered_in_ === true &&
                    x._is_filtered_in_grid_search_ === true &&
                    x._is_filtered_in_column_filter_ === true
            ).length}/${defaultGridData.length}`,
            // This needs an ariaLabel since it's icon-only
            ariaLabel: "Filtered Records",
            iconOnly: false,
            buttonStyles: { root: { cursor: 'default' } },
            iconProps: { iconName: "PageListFilter" }
        });

        return commandBarItems;
    };

    const GridColumns = CreateColumnConfigs();
    const CommandBarItemProps = CreateCommandBarItemProps();
    const CommandBarFarItemProps = CreateCommandBarFarItemProps();
    function _getSelectionDetails(): string {
        const count = _selection.getSelectedCount();
        setSelectionCount(count);
        setSelectedItems(_selection.getSelection())
        setSelectedIndices(_selection.getSelectedIndices());
        if (props.onGridSelectionChange) {
            props.onGridSelectionChange(_selection.getSelection());
        }

        switch (count) {
            case 0:
                return 'No items selected';
            case 1:
                return '1 item selected: ';
            default:
                return `${count} items selected`;
        }
    }

    const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
        if (!props) {
            return null;
        }
        const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> = tooltipHostProps => (
            <TooltipHost {...tooltipHostProps as any} />
        );
        return (
            <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
                {defaultRender!({
                    ...props,
                    onRenderColumnHeaderTooltip,
                })}
            </Sticky>
        );
    };

    const onRenderPlainCard = (column: IColumnConfig, rowNum: number, rowData: any): JSX.Element => {
        return (
            <div className={controlClass.plainCard}>
                {React.cloneElement(column.hoverComponentOptions!.hoverChildComponent!, { column: column, rowNum: rowNum, rowData: rowData })}
            </div>
        );
    };

    /* #region [Span Renders] */
    const RenderLinkSpan = (props: Props, index: number, rowNum: number, column: IColumnConfig, item: any, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void): React.ReactNode => {
        return <span
            id={`id-${props.id}-col-${index}-row-${rowNum}`}
            className={GetDynamicSpanStyles(column, item[column.key], props)}
            onClick={HandleCellOnClick(props, column, EditCellValue, rowNum, item)}
            onDoubleClick={HandleCellOnDoubleClick(props, column, EditCellValue, rowNum, item)}
        >
            {
                column.linkOptions?.onClick
                    ?
                    <Link data-is-focusable={column.linkOptions.isFocusable !== undefined ? column.linkOptions.isFocusable : true} target="_blank" disabled={column.linkOptions?.disabled || item._is_muted_} underline onClick={() => {
                        const params: ICallBackParams = { rowindex: [rowNum], data: defaultGridData, triggerkey: column.key, activatetriggercell: false };
                        column.linkOptions!.onClick(params);
                    }}>{item[column.key]}</Link>
                    :
                    <Link data-is-focusable={column?.linkOptions?.isFocusable !== undefined ? column.linkOptions.isFocusable : true} target="_blank" disabled={column.linkOptions?.disabled || item._is_muted_} underline href={column.linkOptions?.href}>{item[column.key]}</Link>
            }
        </span>;
    }

    const RenderTextFieldSpan = (props: Props, index: number, rowNum: number, column: IColumnConfig, item: any, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, customRender?: React.ReactNode): React.ReactNode => {
        return RenderSpan(props, index, rowNum, column, item, HandleCellOnClick, EditCellValue, HandleCellOnDoubleClick, customRender);
    }

    const RenderPickerSpan = (props: Props, index: number, rowNum: number, column: IColumnConfig, item: any, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, customRender?: React.ReactNode): React.ReactNode => {
        return RenderSpan(props, index, rowNum, column, item, HandleCellOnClick, EditCellValue, HandleCellOnDoubleClick, customRender);
    }

    const RenderDropdownSpan = (props: Props, index: number, rowNum: number, column: IColumnConfig, item: any, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, customRender?: React.ReactNode): React.ReactNode => {
        return RenderSpan(props, index, rowNum, column, item, HandleCellOnClick, EditCellValue, HandleCellOnDoubleClick, customRender);
    }

    const RenderDateSpan = (props: Props, index: number, rowNum: number, column: IColumnConfig, item: any, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, customRender?: React.ReactNode): React.ReactNode => {
        return <span
            id={`id-${props.id}-col-${index}-row-${rowNum}`}
            className={GetDynamicSpanStyles(column, item[column.key], props)}
            onClick={HandleCellOnClick(props, column, EditCellValue, rowNum, item)}
            onDoubleClick={HandleCellOnDoubleClick(props, column, EditCellValue, rowNum, item)}
        >
            {item && item[column.key] ? customRender ? customRender : (new Date(item[column.key])).toDateString() : null}
        </span>;
    }

    const RenderMultilineTextFieldSpan = (props: Props, index: number, rowNum: number, column: IColumnConfig, item: any, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, customRender?: React.ReactNode): React.ReactNode => {
        return RenderSpan(props, index, rowNum, column, item, HandleCellOnClick, EditCellValue, HandleCellOnDoubleClick, customRender);
    }

    const RenderSpan = (props: Props, index: number, rowNum: number, column: IColumnConfig, item: any,
        HandleCellOnClick: (props: Props, column: IColumnConfig, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, rowNum: number, item: any) => React.MouseEventHandler<HTMLSpanElement> | undefined,
        EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void,
        HandleCellOnDoubleClick: (props: Props, column: IColumnConfig, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, rowNum: number, item: any) => React.MouseEventHandler<HTMLSpanElement> | undefined,
        customRender?: React.ReactNode): React.ReactNode => {
        return <span
            id={`id-${props.id}-col-${index}-row-${rowNum}`}
            className={GetDynamicSpanStyles(column, item[column.key], props)}
            onClick={HandleCellOnClick(props, column, EditCellValue, rowNum, item)}
            onDoubleClick={HandleCellOnDoubleClick(props, column, EditCellValue, rowNum, item)}
            style={{ whiteSpace: column.isMultiline || column.inputType === EditControlType.MultilineTextField ? 'pre-line' : 'normal' }}
        >
            {customRender ? customRender : item[column.key]}
        </span>;
    }
    /* #endregion */

    /* #region [Utilities] */
    function HandleCellOnDoubleClick(props: Props, column: IColumnConfig, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, rowNum: number, item: any): React.MouseEventHandler<HTMLSpanElement> | undefined {
        return () => (props.enableCellEdit === true && column.editable === true && !column.editableOnlyInPanel && !props.enableSingleClickCellEdit && !item._is_muted_ && item._can_edit_row_)
            ?
            EditCellValue(column.key, rowNum!, true)
            :
            null;
    }

    function HandleCellOnClick(props: Props, column: IColumnConfig, EditCellValue: (key: string, rowNum: number, activateCurrentCell: boolean) => void, rowNum: number, item: any): React.MouseEventHandler<HTMLSpanElement> | undefined {
        return () => (props.enableCellEdit === true && column.editable === true && !column.editableOnlyInPanel && props.enableSingleClickCellEdit && !item._is_muted_ && item._can_edit_row_)
            ? EditCellValue(column.key, rowNum!, true)
            : null;
    }
    /* #endregion */


    const scrollablePaneRef = React.createRef<any>();


    React.useEffect(() => {
        if (scrollablePaneRef?.current) {
            if (!hasRenderedStickyContent) {
                const sticky: Sticky = scrollablePaneRef.current._stickies.entries().next().value[0];

                if (sticky) {
                    if (props.aboveStickyContent) {
                        const aboveStickyContent = props.aboveStickyContent;
                        aboveStickyContent.classList.add("grid-above-sticky-content");
                        if (!hasRenderedStickyContent) {
                            scrollablePaneRef.current._addToStickyContainer(sticky, scrollablePaneRef.current._stickyAboveRef.current, aboveStickyContent);
                        }

                        // oportunistic height set if element is seen in DOM
                        setAboveContentHeight(aboveStickyContent.offsetHeight);
                    }

                    if (props.belowStickyContent) {
                        const belowStickyContent = props.belowStickyContent;
                        belowStickyContent.classList.add("grid-below-sticky-content");
                        if (!hasRenderedStickyContent) {
                            scrollablePaneRef.current._addToStickyContainer(sticky, scrollablePaneRef.current._stickyBelowRef.current, belowStickyContent);
                        }

                        // oportunistic height set if element is seen in DOM
                        setBelowContentHeight(belowStickyContent.offsetHeight);
                    }

                    setHasRenderedStickyContent(true);
                }
            } else if (props.aboveStickyContent || props.belowStickyContent) {
                const sticky: Sticky = scrollablePaneRef.current._stickies.entries().next().value[0];

                if (props.aboveStickyContent) {
                    let isSameNode: boolean = true;
                    const aboveStickyElement = document.querySelector(".grid-above-sticky-content");

                    if (!props.aboveStickyContent.isEqualNode(aboveStickyElement)) {
                        isSameNode = false;
                        const aboveStickyContent = props.aboveStickyContent;
                        aboveStickyContent.classList.add("grid-above-sticky-content");

                        if (!aboveStickyElement) {
                            scrollablePaneRef.current._addToStickyContainer(sticky, scrollablePaneRef.current._stickyAboveRef.current, aboveStickyContent);
                        } else {
                            aboveStickyElement.replaceWith(aboveStickyContent);
                        }
                    }

                    if (!aboveContentHeight || !isSameNode) {
                        if (aboveStickyElement) {
                            setAboveContentHeight(aboveStickyElement.getBoundingClientRect().height);
                        }
                    }
                }

                if (props.belowStickyContent) {
                    let isSameNode: boolean = true;
                    const belowStickyElement = document.querySelector(".grid-below-sticky-content");

                    if (!props.belowStickyContent.isEqualNode(belowStickyElement)) {
                        isSameNode = false;
                        const belowStickyContent = props.belowStickyContent;
                        belowStickyContent.classList.add("grid-below-sticky-content");

                        if (!belowStickyElement) {
                            scrollablePaneRef.current._addToStickyContainer(sticky, scrollablePaneRef.current._stickyBelowRef.current, belowStickyContent);
                        } else {
                            belowStickyElement.replaceWith(belowStickyContent);
                        }
                    }

                    if (!belowContentHeight || !isSameNode) {
                        if (belowStickyElement) {
                            setBelowContentHeight(belowStickyElement.getBoundingClientRect().height);
                        }
                    }
                }
            }
        }
    }, [scrollablePaneRef, props.aboveStickyContent, props.belowStickyContent])

    const checkboxCellClassName = mergeStyles({
        '.ms-DetailsRow-check': {
            height: props.alignCellsMiddle ? '100%' : undefined
        }
    })

    return (
        <ThemeProvider theme={props.theme}>
            <Panel
                isOpen={isOpenForEdit}
                onDismiss={dismissPanelForEdit}
                isLightDismiss={false}
                headerText="Edit Grid Data"
                closeButtonAriaLabel="Close"
                type={PanelType.smallFixedFar}
            >
                <EditPanel
                    onDismiss={dismissPanelForEdit}
                    onChange={onEditPanelChange}
                    columnConfigurationData={props.customEditPanelColumns ? props.customEditPanelColumns : props.columns}
                    isBulk={isBulkPanelEdit}
                    selectedItem={selectedItems && selectedItems.length === 1 ? selectedItems[0] : null}
                />
            </Panel>

            {props.enableRowAddWithValues && props.enableRowAddWithValues.enable
                ?
                <Panel
                    isOpen={isOpenForAdd}
                    onDismiss={dismissPanelForAdd}
                    isLightDismiss={false}
                    headerText="Add Rows"
                    closeButtonAriaLabel="Close"
                    type={PanelType.smallFixedFar}
                >
                    <AddRowPanel
                        onDismiss={dismissPanelForAdd}
                        onChange={onAddPanelChange}
                        columnConfigurationData={props.customEditPanelColumns ? props.customEditPanelColumns : props.columns}
                        enableRowsCounterField={props.enableRowAddWithValues.enableRowsCounterInPanel}
                    />
                </Panel>
                :
                null
            }


            {defaultTag.length > 0 ?
                <TagPicker
                    onResolveSuggestions={onFilterChanged}
                    getTextFromItem={getTextFromItem}
                    pickerSuggestionsProps={pickerSuggestionsProps}
                    inputProps={inputProps}
                    selectedItems={defaultTag}
                    onChange={onFilterTagListChanged}
                /> : null}

            {props.enableCommandBar === undefined || props.enableCommandBar === true ? <CommandBar
                items={CommandBarItemProps}
                ariaLabel="Command Bar"
                farItems={CommandBarFarItemProps}
            /> : null}
            {showSpinner ?
                <Spinner label="Updating..." ariaLive="assertive" labelPosition="right" size={SpinnerSize.large} />
                :
                null
            }

            {showFilterCallout && filterCalloutComponent}
            <div className={mergeStyles({ height: props.height != null ? props.height : '70vh', width: props.width != null ? props.width : '130vh', position: 'relative', backgroundColor: 'white', })}>
                <ScrollablePane styles={{ contentContainer: { paddingTop: aboveContentHeight, paddingBottom: belowContentHeight } }} componentRef={scrollablePaneRef} scrollbarVisibility={ScrollbarVisibility.auto}>
                    <MarqueeSelection isDraggingConstrainedToRoot={true} selection={_selection} isEnabled={props.enableMarqueeSelection !== undefined ? props.enableMarqueeSelection : true} >
                        <DetailsList
                            compact={true}
                            items={defaultGridData.length > 0 ? defaultGridData.filter((x) => (x._grid_row_operation_ !== Operation.Delete) && (x._is_filtered_in_ === true) && (x._is_filtered_in_grid_search_ === true) && (x._is_filtered_in_column_filter_ === true)) : []}
                            columns={GridColumns}
                            selectionMode={props.selectionMode}
                            // layoutMode={props.layoutMode}
                            // constrainMode={props.constrainMode}
                            layoutMode={DetailsListLayoutMode.fixedColumns}
                            constrainMode={ConstrainMode.unconstrained}
                            selection={_selection}
                            setKey="none"
                            onRenderDetailsHeader={onRenderDetailsHeader}
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            ariaLabelForSelectionColumn="Toggle selection"
                            checkButtonAriaLabel="Row checkbox"
                            ariaLabel={props.ariaLabel}
                            ariaLabelForGrid={props.ariaLabelForGrid}
                            ariaLabelForListHeader={props.ariaLabelForListHeader}
                            cellStyleProps={props.cellStyleProps}
                            checkboxCellClassName={`${checkboxCellClassName} ${props.checkboxCellClassName ? props.checkboxCellClassName : ''}`}
                            checkboxVisibility={props.checkboxVisibility}
                            className={`${mergeStyles({
                                fontSize: '1em'
                            })} ${props.className}`}
                            columnReorderOptions={props.columnReorderOptions}
                            componentRef={props.componentRef}
                            disableSelectionZone={props.disableSelectionZone}
                            dragDropEvents={props.dragDropEvents}
                            enableUpdateAnimations={props.enableUpdateAnimations}
                            enterModalSelectionOnTouch={props.enterModalSelectionOnTouch}
                            getCellValueKey={props.getCellValueKey}
                            getGroupHeight={props.getGroupHeight}
                            getKey={props.getKey}
                            getRowAriaDescribedBy={props.getRowAriaDescribedBy}
                            getRowAriaLabel={props.getRowAriaLabel}
                            groupProps={props.groupProps}
                            groups={props.groups}
                            indentWidth={props.indentWidth}
                            initialFocusedIndex={props.initialFocusedIndex}
                            isHeaderVisible={props.isHeaderVisible}
                            isPlaceholderData={props.isPlaceholderData}
                            listProps={props.listProps}
                            minimumPixelsForDrag={props.minimumPixelsForDrag}
                            onActiveItemChanged={props.onActiveItemChanged}
                            onColumnHeaderClick={props.onColumnHeaderClick}
                            onColumnHeaderContextMenu={props.onColumnHeaderContextMenu}
                            onColumnResize={props.onColumnResize}
                            onDidUpdate={props.onDidUpdate}
                            onItemContextMenu={props.onItemContextMenu}
                            onItemInvoked={props.onItemInvoked}
                            onRenderCheckbox={props.onRenderCheckbox}
                            onRenderDetailsFooter={props.onRenderDetailsFooter}
                            onRenderItemColumn={props.onRenderItemColumn}
                            onRenderMissingItem={props.onRenderMissingItem}
                            onRenderRow={(rowProps, defaultRender) => {
                                const rowInEdit = activateCellEdit && activateCellEdit[Number(rowProps?.item['_grid_row_id_'])!] && activateCellEdit[Number(rowProps?.item['_grid_row_id_'])!]['isActivated'];

                                return <>
                                    {
                                        rowProps && defaultRender ?
                                            props.rowMuteOptions?.enableRowMute ?
                                                defaultRender({
                                                    ...rowProps,
                                                    className: `${rowInEdit ? 'row-edit' : ''} ${rowProps?.item._is_muted_ ? props.rowMuteOptions?.rowMuteClass ? props.rowMuteOptions.rowMuteClass : 'muted' : props.rowMuteOptions?.rowUnmuteClass ? props.rowMuteOptions.rowUnmuteClass : ''}`,
                                                    styles: {
                                                        root:
                                                        {
                                                            fontSize: '0.8571428571428571em',
                                                            ".ms-DetailsRow-cell:not(.actions-cell)": {
                                                                opacity: rowProps?.item._is_muted_ ? props.rowMuteOptions?.rowMuteOpacity ? `${props.rowMuteOptions.rowMuteOpacity}` : '.2' : '',
                                                                filter: rowProps?.item._is_muted_ ? 'grayscale(100%)' : 'none'
                                                            }

                                                        }
                                                    }
                                                })
                                                : defaultRender({
                                                    ...rowProps,
                                                    className: `${rowInEdit ? 'row-edit' : ''}`,
                                                    styles: {
                                                        root: {
                                                            fontSize: '0.8571428571428571em'
                                                        }
                                                    }
                                                }) : null

                                    }
                                </>
                            }}
                            onRowDidMount={props.onRowDidMount}
                            onRowWillUnmount={props.onRowWillUnmount}
                            onShouldVirtualize={props.onShouldVirtualize}
                            rowElementEventMap={props.rowElementEventMap}
                            selectionPreservedOnEmptyClick={props.selectionPreservedOnEmptyClick}
                            selectionZoneProps={props.selectionZoneProps}
                            shouldApplyApplicationRole={props.shouldApplyApplicationRole}
                            styles={props.styles}
                            useFastIcons={props.useFastIcons}
                            usePageCache={props.usePageCache}
                            useReducedRowRenderer={props.useReducedRowRenderer}
                            viewport={props.viewport}
                        />
                    </MarqueeSelection>
                </ScrollablePane>
            </div>
            <Dialog hidden={!dialogContent} onDismiss={CloseRenameDialog} closeButtonAriaLabel="Close">
                {dialogContent}
            </Dialog>
            {messageDialogProps.visible
                ?
                <MessageDialog
                    message={messageDialogProps.message}
                    subMessage={messageDialogProps.subMessage}
                    onDialogClose={CloseMessageDialog}
                />
                :
                null}

            {props.enableColumnEdit && isUpdateColumnClicked ?
                <ColumnUpdateDialog
                    columnConfigurationData={props.columns}
                    onDialogCancel={CloseColumnUpdateDialog}
                    onDialogSave={UpdateGridColumnData}
                    selectedItem={selectedItems && selectedItems.length === 1 ? selectedItems[0] : null}
                />
                :
                null
            }

            {props.enableColumnFilterRules && isColumnFilterClicked ?
                <ColumnFilterDialog
                    columnConfigurationData={props.columns.filter((item) => filteredColumns.indexOf(item) < 0 && isColumnDataTypeSupportedForFilter(item.dataType))}
                    onDialogCancel={CloseColumnFilterDialog}
                    onDialogSave={onFilterApplied}
                    gridData={defaultGridData}
                />
                :
                null
            }
        </ThemeProvider>
    );
};

export default EditableGrid;
