// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Checkbox, DetailsListLayoutMode, DirectionalHint, Fabric, FontIcon, IButtonProps, IStackTokens, Link, mergeStyles, mergeStyleSets, SelectionMode, Stack, TeachingBubble, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { useState } from 'react';
import EditableGrid from '../../libs/editablegrid/editablegrid';
// import { ICallBackParams } from '../../libs/types/callbackparams';
import { IColumnConfig } from '../../libs/types/columnconfigtype';
import { GridColumnConfig, GridItemsType } from './gridconfig';
import { EventEmitter, EventType } from '../../libs/eventemitter/EventEmitter.js';
import { Operation } from '../../libs/types/operation';
import { ITeachingBubbleConfig, teachingBubbleConfig } from './teachingbubbleconfig';
import { useBoolean } from '@fluentui/react-hooks';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ComboBox, PrimaryButton } from '@fluentui/react';
import _ from 'lodash';

interface GridConfigOptions {
    enableCellEdit: boolean;
    enableRowEdit: boolean;
    enableRowEditCancel: boolean;
    enablePanelEdit: boolean;
    enableBulkEdit: boolean;
    enableColumnEdit: boolean;
    enableExport: boolean;
    enableTextFieldEditMode: boolean;
    enableTextFieldEditModeCancel: boolean;
    enableGridRowsDelete: boolean;
    enableGridRowsAdd: boolean;
    enableColumnFilterRules: boolean;
    enableRowAddWithValues: boolean;
    enableGridCopy: boolean;
    enableRowCopy: boolean;
    enableUnsavedEditIndicator: boolean;
    enableSave: boolean;
    enableGridReset: boolean;
    enableColumnFilters: boolean;
    enableDefaultEditMode: boolean;
    enableMarqueeSelection: boolean;
    enableRowMute: boolean;
    prependRowEditActions: boolean;
}

const Consumer = () => {

    const [items, setItems] = useState<GridItemsType[]>([]);
    const [gridInEdit, setGridInEdit] = React.useState<boolean>(false);
    const [teachingBubbleVisible, { toggle: toggleTeachingBubbleVisible }] = useBoolean(true);
    const [teachingBubblePropsConfig, setTeachingBubblePropsConfig] = useState<ITeachingBubbleConfig>({ id: 0, config: { ...teachingBubbleConfig[0], footerContent: `1 of ${teachingBubbleConfig.length}` } });
    const [gridConfigOptions, setGridConfigOptions] = useState<GridConfigOptions>({
        enableCellEdit: true,
        enableRowEdit: true,
        enableRowEditCancel: true,
        enablePanelEdit: true,
        enableBulkEdit: true,
        enableColumnEdit: true,
        enableExport: true,
        enableTextFieldEditMode: true,
        enableTextFieldEditModeCancel: true,
        enableGridRowsDelete: true,
        enableGridRowsAdd: true,
        enableColumnFilterRules: true,
        enableRowAddWithValues: true,
        enableGridCopy: true,
        enableRowCopy: true,
        enableUnsavedEditIndicator: true,
        enableSave: true,
        enableGridReset: true,
        enableColumnFilters: true,
        enableDefaultEditMode: false,
        enableMarqueeSelection: false,
        enableRowMute: true,
        prependRowEditActions: false
    });

    // filters
    const [gridSearchText, setGridSearchText] = useState("");
    const [nameFilterKey, setNameFilterKey] = useState<string | number | null>(null);
    const [ageFilter, setAgeFilter] = useState("");
    const [designationFilter, setDesignationFilter] = useState("");
    const [hiddenStringFilter, setHiddenStringFilter] = useState("");

    const classNames = mergeStyleSets({
        controlWrapper: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        detailsDiv: {
            border: '3px solid black',
            margin: '5px'
        },
        detailsValues: {
            color: '#0078d4'
        },
        checkbox: {
            width: '250px'
        }
    });

    const gapStackTokens: IStackTokens = {
        childrenGap: 10,
        padding: 2,
    };

    const iconClass = mergeStyles({
        fontSize: 20,
        margin: "0px 0px 0px 30px"
    });

    const onTeachingBubbleNavigation = (direction: string) => {
        let teachingProps;
        let currentId;

        switch (direction) {
            case 'previous':
                teachingProps = teachingBubbleConfig[teachingBubblePropsConfig.id - 1];
                currentId = teachingBubblePropsConfig.id - 1;
                teachingProps.footerContent = `${currentId + 1} of ${teachingBubbleConfig.length}`;
                setTeachingBubblePropsConfig({ id: currentId, config: teachingProps })
                break;
            case 'next':
                teachingProps = teachingBubbleConfig[teachingBubblePropsConfig.id + 1];
                currentId = teachingBubblePropsConfig.id + 1;
                teachingProps.footerContent = `${currentId + 1} of ${teachingBubbleConfig.length}`;
                setTeachingBubblePropsConfig({ id: currentId, config: teachingProps })
                break;
            case 'close':
                teachingProps = teachingBubbleConfig[0];
                teachingProps.footerContent = `1 of ${teachingBubbleConfig.length}`;
                setTeachingBubblePropsConfig({ id: 0, config: teachingProps });
                toggleTeachingBubbleVisible();
                break;
        }
    }

    const nextBubbleProps: IButtonProps = {
        children: 'Next',
        onClick: () => onTeachingBubbleNavigation('next'),
    };

    const previousBubbleProps: IButtonProps = {
        children: 'Previous',
        onClick: () => onTeachingBubbleNavigation('previous'),
    };
    const closeButtonProps: IButtonProps = {
        children: 'Close',
        onClick: () => onTeachingBubbleNavigation('close'),
    };

    // const GetRandomDate = (start: Date, end: Date): Date => {
    //     var diff = end.getTime() - start.getTime();
    //     var new_diff = diff * Math.random();
    //     var date = new Date(start.getTime() + new_diff);
    //     return date;
    // }

    const GetRandomInt = (min: number, max: number): number => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const SetDummyData = (): void => {
        var dummyData: GridItemsType[] = []
        for (var i = 1; i <= 100; i++) {
            var randomInt = GetRandomInt(1, 3);
            let newDummyData = new GridItemsType();

            newDummyData.id = i;
            newDummyData.check = !!GetRandomInt(0, 1);
            newDummyData.toggle = !!GetRandomInt(0, 1);
            newDummyData.customerhovercol = 'Hover Me';
            newDummyData.name = 'Name' + GetRandomInt(1, 10);
            newDummyData.age = GetRandomInt(20, 40);
            newDummyData.designation = randomInt % 2 === 0 ? 'Designation' + GetRandomInt(1, 15) : undefined;
            newDummyData.salary = GetRandomInt(35000, 75000);
            newDummyData.dateofjoining = '2010-10-10T14:57:10';
            newDummyData.payrolltype = randomInt % 3 === 0 ? 'Weekly' : randomInt % 3 === 1 ? 'Bi-Weekly' : 'Monthly';
            //newDummyData.payrolltype = 'Bi-Weekly';
            newDummyData.employmenttype = 'Employment Type' + GetRandomInt(1, 12);
            newDummyData.employeelink = 'Link';
            newDummyData.hiddenstring = 'Hidden' + GetRandomInt(1, 15);

            dummyData.push(newDummyData);
        };

        setItems(dummyData);
    }

    React.useEffect(() => {
        SetDummyData();
    }, []);

    const onGridSave = (data: any[]): void => {
        alert('Grid Data Saved');
        LogRows(data);
        data = data.filter(y => y._grid_row_operation_ !== Operation.Delete);
        data.map((x, index) => {
            data[index]._grid_row_operation_ = Operation.None
        });
        setItems(data);
    };

    const onGridUpdate = async (data: any[]): Promise<void> => {
        console.log(items);
        console.log('Grid Data Updated:');
        LogRows(data);
    };

    function clearFilters(delay: boolean = false): void {
        // other
        setGridSearchText("");
        setNameFilterKey(null);
        setAgeFilter("");
        setDesignationFilter("");
        setHiddenStringFilter("");

        function _clearFilters(): void {
            // emit events to grid
            EventEmitter.dispatch(EventType.onSearch, { target: { value: "" } });
            EventEmitter.dispatch(EventType.onFilter, { columnKey: 'name', queryText: "" });
            EventEmitter.dispatch(EventType.onFilter, { columnKey: 'age', queryText: "" });
            EventEmitter.dispatch(EventType.onFilter, { columnKey: 'designation', queryText: "" });
            EventEmitter.dispatch(EventType.onFilter, { columnKey: 'hiddenstring', queryText: "" });
        }

        if (delay) {
            setTimeout(() => {
                _clearFilters()
            }, 0);
        } else
            _clearFilters()
    }

    async function onGridReset(data: any[]): Promise<void> {
        console.log('Grid has reset with items:');
        console.log(items);

        clearFilters(true);
    }


    const LogRows = (data: any[]): void => {
        console.log('Updated Rows');
        console.log(data.filter(item => item._grid_row_operation_ === Operation.Update));
        console.log('Added Rows');
        console.log(data.filter(item => item._grid_row_operation_ === Operation.Add));
        console.log('Deleted Rows');
        console.log(data.filter(item => item._grid_row_operation_ === Operation.Delete));
        console.log('Unchanged Rows');
        console.log(data.filter(item => item._grid_row_operation_ === Operation.None));
        console.log('Muted Rows');
        console.log(data.filter(item => item._grid_row_operation_ === Operation.Mute));
    }

    // const onPayrollChanged = (callbackRequestParamObj: ICallBackParams): any[] => {
    //     alert('Payroll Changed');
    //     return callbackRequestParamObj.data;
    // }

    // const onDateChanged = (callbackRequestParamObj: ICallBackParams): any[] => {
    //     alert('Date Changed');
    //     return callbackRequestParamObj.data;
    // }

    // const onEmploymentTypeChanged = (callbackRequestParamObj: ICallBackParams): any[] => {
    //     alert('Employment Type Changed');
    //     return callbackRequestParamObj.data;
    // }

    // const onDesignationChanged = (callbackRequestParamObj: ICallBackParams): any[] => {
    //     callbackRequestParamObj.rowindex.forEach((index) => {
    //         callbackRequestParamObj.data.filter((item) => item._grid_row_id_ == index).map((item) => item.salary = 30000);
    //     });

    //     return callbackRequestParamObj.data;
    // }

    const attachGridValueChangeCallbacks = (columnConfig: IColumnConfig[]): IColumnConfig[] => {
        //columnConfig.filter((item) => item.key == 'designation').map((item) => item.onChange = onDesignationChanged);
        //columnConfig.filter((item) => item.key == 'employmenttype').map((item) => item.onChange = onEmploymentTypeChanged);
        //columnConfig.filter((item) => item.key == 'payrolltype').map((item) => item.onChange = onPayrollChanged);
        //columnConfig.filter((item) => item.key == 'dateofjoining').map((item) => item.onChange = onDateChanged);
        return columnConfig;
    };

    const onCheckboxChange = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean): void => {
        setGridConfigOptions({ ...gridConfigOptions, [(ev.target as Element).id]: !gridConfigOptions[(ev.target as Element).id] })
    };

    const [aboveContent, setAboveContent] = React.useState<HTMLDivElement>();
    const [belowContent, setBelowContent] = React.useState<HTMLDivElement>();

    React.useEffect(() => {
        let aboveContent = document.createElement('div');

        aboveContent.innerHTML = `
                <div class="above-content" style="background: rgba(0,0,0,.05); font-weight:600; padding: 20px 0;">
                    Text here is displaying as sticky content in the "above" area
                </div>
            `;

        setAboveContent(aboveContent);
    }, []);

    React.useEffect(() => {
        let belowContent = document.createElement('div');

        belowContent.innerHTML = `
                <div class="below-content" style="background: rgba(255,255,255,.9); font-weight:600; padding: 20px 0;">
                    Text here is displaying as sticky content in the "below" area
                </div>
            `;

        setBelowContent(belowContent);


        setTimeout(() => {
            let belowContent = document.createElement('div');

            belowContent.innerHTML = `
                <div class="below-content" style="background: rgba(255,255,255,.9); font-weight:600; padding: 20px 0;">
                    Text here is displaying as sticky content in the "below" area but now it has changed!
                </div>
            `;

            setBelowContent(belowContent);

        }, 5000);
    }, []);

    return (
        <Fabric>
            <ToastContainer />
            <fieldset className={classNames.detailsDiv}>
                <legend><b>Toggle:</b></legend>
                <Stack horizontal tokens={gapStackTokens}>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableCellEdit"} label="Cell Edit" onChange={onCheckboxChange} checked={gridConfigOptions.enableCellEdit} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableRowEdit"} label="Row Edit" onChange={onCheckboxChange} checked={gridConfigOptions.enableRowEdit} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableRowEditCancel"} label="Row Edit Cancel" onChange={onCheckboxChange} checked={gridConfigOptions.enableRowEditCancel} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableBulkEdit"} label="Bulk Edit" onChange={onCheckboxChange} checked={gridConfigOptions.enableBulkEdit} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableColumnEdit"} label="Column Edit" onChange={onCheckboxChange} checked={gridConfigOptions.enableColumnEdit} />
                    </Stack.Item>
                </Stack>
                <Stack horizontal tokens={gapStackTokens}>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableExport"} label="Export" onChange={onCheckboxChange} checked={gridConfigOptions.enableExport} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableTextFieldEditMode"} label="TextField Edit Mode" onChange={onCheckboxChange} checked={gridConfigOptions.enableTextFieldEditMode} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableTextFieldEditModeCancel"} label="TextField Edit Mode Cancel" onChange={onCheckboxChange} checked={gridConfigOptions.enableTextFieldEditModeCancel} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableGridRowsDelete"} label="Row Delete" onChange={onCheckboxChange} checked={gridConfigOptions.enableGridRowsDelete} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableGridRowsAdd"} label="Row Add" onChange={onCheckboxChange} checked={gridConfigOptions.enableGridRowsAdd} />
                    </Stack.Item>
                </Stack>
                <Stack horizontal tokens={gapStackTokens}>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableColumnFilterRules"} label="Rule Based Filter" onChange={onCheckboxChange} checked={gridConfigOptions.enableColumnFilterRules} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableRowAddWithValues"} label="Row Add Panel" onChange={onCheckboxChange} checked={gridConfigOptions.enableRowAddWithValues} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableGridCopy"} label="Grid Copy" onChange={onCheckboxChange} checked={gridConfigOptions.enableGridCopy} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableRowCopy"} label="Row Copy" onChange={onCheckboxChange} checked={gridConfigOptions.enableRowCopy} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableUnsavedEditIndicator"} label="Unsaved Edit Indicator" onChange={onCheckboxChange} checked={gridConfigOptions.enableUnsavedEditIndicator} />
                    </Stack.Item>
                </Stack>
                <Stack horizontal tokens={gapStackTokens}>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableSave"} label="Save" onChange={onCheckboxChange} checked={gridConfigOptions.enableSave} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableGridReset"} label="Grid Reset" onChange={onCheckboxChange} checked={gridConfigOptions.enableGridReset} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableColumnFilters"} label="Column Filters" onChange={onCheckboxChange} checked={gridConfigOptions.enableColumnFilters} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableDefaultEditMode"} label="Default Edit Mode" onChange={onCheckboxChange} checked={gridConfigOptions.enableDefaultEditMode} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enablePanelEdit"} label="Panel Edit" onChange={onCheckboxChange} checked={gridConfigOptions.enablePanelEdit} />
                    </Stack.Item>
                </Stack>
                <Stack horizontal tokens={gapStackTokens}>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableMarqueeSelection"} label="Marquee Selection" onChange={onCheckboxChange} checked={gridConfigOptions.enableMarqueeSelection} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"enableRowMute"} label="Row Mute" onChange={onCheckboxChange} checked={gridConfigOptions.enableRowMute} />
                    </Stack.Item>
                    <Stack.Item className={classNames.checkbox}>
                        <Checkbox id={"prependRowEditActions"} label="Prepend Row 'Actions'" onChange={onCheckboxChange} checked={gridConfigOptions.prependRowEditActions} />
                    </Stack.Item>
                </Stack>
            </fieldset>
            <div style={{ display: 'flex', textAlign: 'left', marginBottom: 20, alignItems: 'flex-end' }}>
                <ComboBox selectedKey={nameFilterKey} disabled={gridInEdit} styles={{ root: { marginRight: 20 } }} options={_.uniqBy(items?.map(item => {
                    return ({
                        key: item.name,
                        text: item.name
                    })
                }), 'text')} label='Name' onChange={(event, option) => {
                    setNameFilterKey(option?.key);
                    EventEmitter.dispatch(EventType.onFilter, { columnKey: 'name', queryText: option?.text, exact: true })
                }} />

                <TextField value={ageFilter} styles={{ root: { marginRight: 20 } }} disabled={gridInEdit} onChange={(event, newValue) => {
                    setAgeFilter(newValue || "");
                    EventEmitter.dispatch(EventType.onFilter, { columnKey: 'age', queryText: (event.target as any).value })
                }} label="Age" />

                <TextField value={designationFilter} styles={{ root: { marginRight: 20 } }} disabled={gridInEdit} onChange={(event, newValue) => {
                    setDesignationFilter(newValue || "");
                    EventEmitter.dispatch(EventType.onFilter, { columnKey: 'designation', queryText: (event.target as any).value })
                }} label="Designation" />

                <TextField value={hiddenStringFilter} styles={{ root: { marginRight: 20 } }} disabled={gridInEdit} placeholder="Filter a hidden column!" onChange={(event, newValue) => {
                    setHiddenStringFilter(newValue || "");
                    EventEmitter.dispatch(EventType.onFilter, { columnKey: 'hiddenstring', queryText: (event.target as any).value })
                }} label="Hidden String" />

                <TextField placeholder="Incorrect column name" styles={{ root: { marginRight: 20 } }} disabled={gridInEdit} onChange={(event, newValue) => {
                    EventEmitter.dispatch(EventType.onFilter, { columnKey: 'errorcheck', queryText: (event.target as any).value })
                }} label="Nonexistant Field (Error Check)" />

                <PrimaryButton onClick={() => clearFilters()}>Clear Filters</PrimaryButton>
            </div>
            <div className={classNames.controlWrapper}>
                <TextField value={gridSearchText} disabled={gridInEdit} id="searchField" placeholder='Search Grid' className={mergeStyles({ width: '60vh', paddingBottom: '10px' })} onChange={
                    (event, value) => {
                        setGridSearchText(value || "")
                        EventEmitter.dispatch(EventType.onSearch, event);
                    }
                }
                />
                <Link>
                    <FontIcon
                        aria-label="View"
                        iconName="View"
                        className={iconClass}
                        onClick={toggleTeachingBubbleVisible}
                        id="tutorialinfo"
                    />
                </Link>
            </div>
            <EditableGrid
                id={1}
                enableColumnEdit={gridConfigOptions.enableColumnEdit}
                enableSave={gridConfigOptions.enableSave}
                //enableSaveText="Save to List"
                columns={attachGridValueChangeCallbacks(GridColumnConfig)}
                //customEditPanelColumns={GridColumnConfigCustomPanelEdit}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.multiple}
                enableRowEdit={gridConfigOptions.enableRowEdit}
                prependRowEditActions={gridConfigOptions.prependRowEditActions}
                enableRowEditCancel={gridConfigOptions.enableRowEditCancel}
                rowMuteOptions={{ enableRowMute: gridConfigOptions.enableRowMute }}
                enablePanelEdit={gridConfigOptions.enablePanelEdit}
                enableBulkEdit={gridConfigOptions.enableBulkEdit}
                items={items}
                enableCellEdit={gridConfigOptions.enableCellEdit}
                enableExport={gridConfigOptions.enableExport}
                enableTextFieldEditMode={gridConfigOptions.enableTextFieldEditMode}
                enableTextFieldEditModeCancel={gridConfigOptions.enableTextFieldEditModeCancel}
                enableGridRowsDelete={gridConfigOptions.enableGridRowsDelete}
                enableGridRowsAdd={gridConfigOptions.enableGridRowsAdd}
                height={'70vh'}
                width={'160vh'}
                position={'relative'}
                enableUnsavedEditIndicator={gridConfigOptions.enableUnsavedEditIndicator}
                onGridSave={onGridSave}
                enableGridReset={gridConfigOptions.enableGridReset}
                enableColumnFilters={gridConfigOptions.enableColumnFilters}
                enableColumnFilterRules={gridConfigOptions.enableColumnFilterRules}
                enableRowAddWithValues={{ enable: gridConfigOptions.enableRowAddWithValues, enableRowsCounterInPanel: true }}
                gridCopyOptions={{ enableGridCopy: gridConfigOptions.enableGridCopy, enableRowCopy: gridConfigOptions.enableRowCopy }}
                onGridStatusMessageCallback={(str) => {
                    toast.info(str, {
                        position: toast.POSITION.TOP_CENTER
                    })
                }}
                onGridUpdate={onGridUpdate}
                onGridReset={onGridReset}
                enableDefaultEditMode={gridConfigOptions.enableDefaultEditMode}
                enableMarqueeSelection={gridConfigOptions.enableMarqueeSelection}
                aboveStickyContent={aboveContent}
                belowStickyContent={belowContent}
                onGridInEditChange={(gridInEdit: boolean) => { console.log('%c Grid in edit mode? ', 'background: #222; color: #bada55'); console.log(gridInEdit ? 'yes' : 'no'); setGridInEdit(gridInEdit) }}
                onGridStateEditedChange={(gridStateEdited: boolean) => { console.log('%c Has grid been editted? ', 'background: #222; color: #bada55'); console.log(gridStateEdited ? 'yes' : 'no'); }}
                onGridSort={(data, column) => { console.log('Grid has been sorted with items:'); console.log(data); console.log('Current sorted column is:'); console.log(column); }}
                onGridFilter={(data) => { console.log('Grid has been filtered with items:'); console.log(data); }}
                enableGridInEditIndicator
                customCommandBarItems={[
                    {
                        id: 'print',
                        key: 'print',
                        text: "Print",
                        disabled: gridInEdit,
                        iconProps: { iconName: "Print" },
                        onClick: () => console.log('printing simulation!')
                    }
                ]}
                customCommandBarFarItems={[
                    {
                        id: 'div',
                        key: 'div',
                        text: "Custom Item",
                        buttonStyles: { root: { cursor: 'default' } },
                        commandBarButtonAs: () => { return <div style={{ display: 'flex', padding: '0 10px', cursor: 'default', alignItems: 'center', height: '100%' }}>Testing!</div> },
                        iconOnly: true
                    }
                ]}
                rowCanEditCheck={{
                    fieldName: "payrolltype",
                    passValue: "Weekly"
                }}
                alignCellsMiddle
                cellEditTooltip={{
                    showTooltip: true
                }}

            />

            {teachingBubbleVisible && (
                <TeachingBubble
                    target={teachingBubblePropsConfig?.config.target}
                    primaryButtonProps={teachingBubblePropsConfig?.id < teachingBubbleConfig.length - 1 ? nextBubbleProps : closeButtonProps}
                    secondaryButtonProps={teachingBubblePropsConfig?.id > 0 ? previousBubbleProps : null}
                    onDismiss={toggleTeachingBubbleVisible}
                    footerContent={teachingBubblePropsConfig?.config.footerContent}
                    headline={teachingBubblePropsConfig?.config.headline}
                    hasCloseButton={true}
                    isWide={teachingBubblePropsConfig?.config.isWide == null ? true : teachingBubblePropsConfig?.config.isWide}
                    calloutProps={{
                        directionalHint: DirectionalHint.bottomLeftEdge,
                    }}
                >
                    {teachingBubblePropsConfig?.config.innerText}
                </TeachingBubble>
            )}
        </Fabric>
    );
};

export default Consumer;