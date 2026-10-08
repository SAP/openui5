/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableTypeBase",
	"./menus/GroupHeaderRowContextMenu",
	"../enums/TableRowCountMode",
	"./utils/Personalization",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Lib"
], (
	TableTypeBase,
	GroupHeaderRowContextMenu,
	TableRowCountMode,
	PersonalizationUtils,
	MLibrary,
	JSONModel,
	Library
) => {
	"use strict";

	let InnerTable;
	let InnerColumn;
	let InnerRowAction;
	let InnerRowActionItem;
	let InnerRowModeMap;
	let InnerRowSettings;

	/**
	 * Constructor for a new <code>GridTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.<br>
	 *
	 * <b>Important Notes for <code>{@link sap.ui.mdc.table.RowSettings#setRowActionCount rowActionCount}</code>:</b><br>
	 *
	 * The <code>rowActionCount</code> property is used to determine the number of row actions that are displayed for each row in the table.
	 * The actual number of displayed actions can be limited by the underlying table type:
	 * <ul>
	 *   <li><code>GridTable</code>: Maximum number of three actions including the overflow button. 0 means no actions are visible.</li>
	 * </ul>
	 *
	 * @extends sap.ui.mdc.table.TableTypeBase
	 * @author SAP SE
	 * @public
	 * @since 1.65
	 * @alias sap.ui.mdc.table.GridTableType
	 */
	const GridTableType = TableTypeBase.extend("sap.ui.mdc.table.GridTableType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines how the table handles the row count.
				 */
				rowCountMode: {
					type: "sap.ui.mdc.enums.TableRowCountMode",
					group: "Behavior",
					defaultValue: TableRowCountMode.Auto
				},
				/**
				 * Row count of the inner table.
				 * This property specifies the minimum row count if <code>sap.ui.mdc.enums.TableRowCountMode.Auto</code> is used.
				 * This property specifies the row count if <code>sap.ui.mdc.enums.TableRowCountMode.Interactive</code> or
				 * <code>sap.ui.mdc.enums.TableRowCountMode.Fixed</code> is used.
				 */
				rowCount: {
					type: "int",
					group: "Appearance",
					defaultValue: 10
				},
				/**
				 * Number of indices which can be selected in a range.
				 * Accepts positive integer values. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the
				 * Deselect All button.
				 *
				 * <b>Note:</b> To avoid severe performance problems, the limit should only be set to 0 in the following cases:
				 * <ul>
				 *   <li>With client-side models</li>
				 *   <li>With server-side models if they are used in client mode</li>
				 *   <li>If the entity set is small</li>
				 * </ul>
				 *
				 * In other cases, we recommend to set the limit to at least double the value of the {@link sap.ui.mdc.Table#getThreshold threshold}
				 * property of the table.
				 */
				selectionLimit: {
					type: "int",
					group: "Behavior",
					defaultValue: 200
				},
				/**
				 * Determines whether the header selector is shown.
				 */
				showHeaderSelector: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * Determines whether the number of fixed columns is configurable via the column menu.
				 *
				 * @since 1.136
				 */
				enableColumnFreeze: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Defines the number of fixed columns.
				 */
				fixedColumnCount: {
					type: "int",
					group: "Appearance",
					defaultValue: 0
				},

				/**
				 * Number of records to be requested from the model when the user scrolls through the table.
				 *
				 * The property defines how many additional (not yet visible) data records from the back-end system
				 * are pre-fetched during scrolling. If the <code>scrollThreshold</code> is lower than the number of
				 * visible rows, the number of visible rows is used as the <code>scrollThreshold</code>. If the value
				 * is 0, thresholding is disabled.
				 *
				 * <b>Note:</b> This property only takes effect if it is set to a positive integer value. Otherwise
				 * the <code>threshold</code> property is used.
				 *
				 * @since 1.128
				 */
				scrollThreshold: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				}
			}
		}
	});

	/**
	 * @inheritDoc
	 */
	GridTableType.prototype.init = function() {
		TableTypeBase.prototype.init.apply(this, arguments);

		this.oTypeSettingsModel = new JSONModel({
			p13nFixedColumnCount: null
		});
	};

	/**
	 * @inheritDoc
	 */
	GridTableType.prototype.exit = function() {
		TableTypeBase.prototype.exit.apply(this, arguments);
		this.disableColumnResize();
	};

	GridTableType.prototype.updateTableByProperty = function(sProperty, vValue) {
		if (sProperty === "rowCountMode") {
			this._updateRowCountMode();
		} else if (sProperty === "rowCount") {
			this._updateRowCount();
		}
	};

	GridTableType.prototype._updateRowCountMode = function() {
		const oGridTable = this.getInnerControl();
		const sRowCountMode = this.getRowCountMode();
		let oRowMode = oGridTable?.getRowMode();

		if (!oGridTable) {
			return;
		}

		if (shouldDestroyRowMode(oRowMode, sRowCountMode)) {
			oRowMode.destroy();
			oRowMode = null;
		}

		if (!oRowMode) {
			const RowMode = InnerRowModeMap[sRowCountMode] ?? InnerRowModeMap[TableRowCountMode.Auto];
			const bHideEmptyRows = this.getTable().getCreationRow()?.getVisible() ?? false;

			oRowMode = new RowMode({
				fixedBottomRowCount: "{= ${$sap.ui.mdc.Table>/@custom/hasGrandTotal} ? 1 : 0}"
			});
			oRowMode.setHideEmptyRows?.(bHideEmptyRows);
			oGridTable.setRowMode(oRowMode);
		}

		this._updateRowCount();
	};

	function shouldDestroyRowMode(oRowMode, sNewRowCountMode) {
		return oRowMode && (
			(sNewRowCountMode === TableRowCountMode.Fixed && !oRowMode.isA("sap.ui.table.rowmodes.Fixed")) ||
			(sNewRowCountMode === TableRowCountMode.Auto && !oRowMode.isA("sap.ui.table.rowmodes.Auto")) ||
			(sNewRowCountMode === TableRowCountMode.Interactive && !oRowMode.isA("sap.ui.table.rowmodes.Interactive"))
		);
	}

	GridTableType.prototype._updateRowCount = function() {
		const oGridTable = this.getInnerControl();
		const oRowMode = oGridTable?.getRowMode();
		const iRowCount = this.getRowCount();
		const sRowCountMode = this.getRowCountMode();

		if (!oGridTable || !oRowMode) {
			return;
		}

		if (sRowCountMode === TableRowCountMode.Fixed || sRowCountMode === TableRowCountMode.Interactive) {
			oRowMode.setRowCount(iRowCount);
		} else {
			oRowMode.setMinRowCount(iRowCount);
		}
	};

	GridTableType.prototype.loadUiTableLibrary = function() {
		if (!this._oGridTableLibLoaded) {
			this._oGridTableLibLoaded = Library.load({name: "sap.ui.table"});
		}
		return this._oGridTableLibLoaded;
	};

	GridTableType.prototype.loadModules = function() {
		if (InnerTable) {
			return Promise.resolve();
		}

		return this.loadUiTableLibrary().then(() => {
			return new Promise((resolve, reject) => {
				sap.ui.require([
					"sap/ui/table/Table",
					"sap/ui/table/Column",
					"sap/ui/table/RowAction",
					"sap/ui/table/RowActionItem",
					"sap/ui/table/rowmodes/Fixed",
					"sap/ui/table/rowmodes/Auto",
					"sap/ui/table/rowmodes/Interactive",
					"sap/ui/table/RowSettings"
				], (GridTable, GridColumn, RowAction, RowActionItem, FixedRowMode, AutoRowMode, InteractiveRowMode, RowSettings) => {
					InnerTable = GridTable;
					InnerColumn = GridColumn;
					InnerRowAction = RowAction;
					InnerRowActionItem = RowActionItem;
					InnerRowModeMap = {
						[TableRowCountMode.Fixed]: FixedRowMode,
						[TableRowCountMode.Auto]: AutoRowMode,
						[TableRowCountMode.Interactive]: InteractiveRowMode
					};
					InnerRowSettings = RowSettings;
					resolve();
				}, () => {
					reject("Failed to load some modules");
				});
			});
		});
	};

	GridTableType.prototype.createTable = function() {
		const oTable = this.getTable();

		if (!oTable || !InnerTable) {
			return null;
		}

		const oGridTable = new InnerTable(this.getTableSettings());

		oGridTable.setAggregation("groupHeaderRowContextMenu", new GroupHeaderRowContextMenu());

		return oGridTable;
	};

	GridTableType.prototype.getTableSettings = function() {
		const oTable = this.getTable();
		const mSelectionBehaviorMap = {
			SingleMaster: "RowOnly"
		};
		const mRowSettingsConfig = this.getRowSettingsConfig();
		const mSettings = {
			...TableTypeBase.prototype.getTableSettings.apply(this, arguments),
			enableBusyIndicator: true,
			enableColumnReordering: false,
			threshold: {
				path: "$sap.ui.mdc.Table>/threshold",
				formatter: function(iThreshold) {
					return iThreshold > -1 ? iThreshold : undefined;
				}
			},
			scrollThreshold: "{$sap.ui.mdc.Table#type>/scrollThreshold}",
			noData: oTable._getDefaultNoDataText(),
			extension: [oTable._oToolbar],
			ariaLabelledBy: [oTable._oTableTitle],
			rowSettingsTemplate: mRowSettingsConfig ? new InnerRowSettings(mRowSettingsConfig) : null,
			selectionMode: "None",
			selectionBehavior: {
				path: "$sap.ui.mdc.Table>/selectionMode",
				formatter: function(sSelectionMode) {
					return mSelectionBehaviorMap[sSelectionMode]; // Default is "RowSelector"
				}
			},
			enableColumnFreeze: "{$sap.ui.mdc.Table#type>/enableColumnFreeze}",
			fixedColumnCount: {
				parts: [
					{path: "$sap.ui.mdc.Table#type>/fixedColumnCount"}, {path: "$typeSettings>/p13nFixedColumnCount"}
				],
				formatter: function(iFixedColumnCount, iP13nFixedColumnCount) {
					return iP13nFixedColumnCount ?? iFixedColumnCount;
				}
			},
			models: {
				$typeSettings: this.oTypeSettingsModel
			},
			columnFreeze: [onColumnFreeze, this],
			beforeOpenContextMenu: [onBeforeOpenContextMenu, this]
		};

		if (oTable.hasListeners("rowPress")) {
			mSettings.cellClick = [onCellClick, this];
		}

		return mSettings;
	};

	function onCellClick(oEvent) {
		this.callHook("RowPress", this.getTable(), {
			bindingContext: oEvent.getParameter("rowBindingContext")
		});
	}

	function onBeforeOpenContextMenu(oEvent) {
		const mEventParameters = oEvent.getParameters();
		const oTable = this.getTable();
		const oInnerTable = this.getInnerControl();
		const oRow = oInnerTable.getRows().find((oRow) => oRow.getIndex() === mEventParameters.rowIndex);

		this.callHook("BeforeOpenContextMenu", oTable, {
			bindingContext: oInnerTable.getContextByIndex(mEventParameters.rowIndex),
			column: oTable.getColumns()[mEventParameters.columnIndex],
			contextMenu: mEventParameters.contextMenu,
			event: oEvent,
			groupLevel: mEventParameters.contextMenu.isA("sap.ui.mdc.table.menus.GroupHeaderRowContextMenu") ? oRow.getLevel() : undefined
		});
	}

	GridTableType.prototype.createColumn = function(oColumn) {
		const oGridTableColumn = new InnerColumn(this.getColumnSettings(oColumn));
		const oCreationTemplate = oColumn.getCreationTemplate()?.clone();

		oCreationTemplate?.setWrapping?.(false);
		oGridTableColumn.setCreationTemplate(oCreationTemplate);

		return oGridTableColumn;
	};

	GridTableType.prototype.getColumnSettings = function(oColumn) {
		const oTemplate = oColumn.getTemplateClone();

		oTemplate?.setWrapping?.(false);

		return {
			...TableTypeBase.prototype.getColumnSettings.apply(this, arguments),
			label: oColumn.getHeaderLabel({wrapping: false}),
			template: oTemplate,
			minWidth: {
				path: "$sap.ui.mdc.table.Column>/minWidth",
				formatter: function(fMinWidth) {
					return Math.round(fMinWidth * parseFloat(MLibrary.BaseFontSize));
				}
			},
			resizable: "{$sap.ui.mdc.Table>/enableColumnResize}",
			autoResizable: "{$sap.ui.mdc.Table>/enableColumnResize}"
		};
	};

	GridTableType.prototype.enableColumnResize = function() {
		const oTable = this.getTable();
		const oGridTable = this.getInnerControl();

		if (!oTable || !oGridTable) {
			return;
		}

		oGridTable.getColumns().forEach((oColumn) => {
			oColumn.setResizable(true);
			oColumn.setAutoResizable(true);
		});
		oGridTable.detachColumnResize(onColumnResize, this);
		oGridTable.attachColumnResize(onColumnResize, this);
	};

	GridTableType.prototype.disableColumnResize = function() {
		const oTable = this.getTable();
		const oGridTable = this.getInnerControl();

		if (!oTable || !oGridTable) {
			return;
		}

		oGridTable.getColumns().forEach((oColumn) => {
			oColumn.setResizable(false);
			oColumn.setAutoResizable(false);
		});
		oGridTable.detachColumnResize(onColumnResize, this);
	};

	function onColumnResize(oEvent) {
		const oTable = this.getTable();
		const oGridTable = this.getInnerControl();
		const oGridTableColumn = oEvent.getParameter("column");
		const sWidth = oEvent.getParameter("width");
		const iIndex = oGridTable.indexOfColumn(oGridTableColumn);
		const oColumn = oTable.getColumns()[iIndex];

		this.callHook("ColumnResize", oTable, {
			column: oColumn,
			width: sWidth
		});
	}

	async function onColumnFreeze(oEvent) {
		const oTable = this.getTable();

		await Promise.resolve(); // Make asynchronous to ensure that the inner table property value is set
		PersonalizationUtils.createFixedColumnCountChange(oTable, {
			fixedColumnCount: this.getInnerControl().getFixedColumnCount()
		});
	}

	GridTableType.prototype.updateRowSettings = function() {
		const oGridTable = this.getInnerControl();

		if (!oGridTable) {
			return;
		}

		oGridTable.destroyRowSettingsTemplate();
		oGridTable.setRowSettingsTemplate(new InnerRowSettings(this.getRowSettingsConfig()));
		this.updateRowActions();
	};

	GridTableType.prototype.updateRowActions = function() {
		const oGridTable = this.getInnerControl();

		if (!oGridTable) {
			return;
		}

		// Clean up existing clones before creating new ones
		this._cleanupRowActionClones();

		const oRowSettings = this.getTable().getRowSettings();

		this._removeRowActions();

		if (!oRowSettings || !oRowSettings.isBound("rowActions") && (!oRowSettings.getRowActions() || oRowSettings.getRowActions().length === 0)) {
			return;
		}

		const oRowActions = oRowSettings.getAllActions();

		if ("templateInfo" in oRowActions) {
			const oTemplateInfo = oRowActions.templateInfo;
			// Set template for inner row actions using temporary metadata
			oRowActions.items.template = new InnerRowActionItem({
				type: oTemplateInfo.type,
				visible: oTemplateInfo.visible,
				icon: oTemplateInfo.icon,
				text: oTemplateInfo.text,
				press: [onRowActionPress, this]
			});
			// Remove temporary metadata from row actions object
			delete oRowActions.templateInfo;
		} else {
			oRowActions.items = oRowActions.items.map(function(oRowActionItem) {
				const oInnerRowActionItem = new InnerRowActionItem({
					type: oRowActionItem.isBound("type") ? oRowActionItem.getBindingInfo("type") : oRowActionItem.getType(),
					visible: oRowActionItem.isBound("visible") ? oRowActionItem.getBindingInfo("visible") : oRowActionItem.getVisible(),
					icon: oRowActionItem.isBound("icon") ? oRowActionItem.getBindingInfo("icon") : oRowActionItem.getIcon(),
					text: oRowActionItem.isBound("text") ? oRowActionItem.getBindingInfo("text") : oRowActionItem.getText(),
					press: [onRowActionPress, this]
				});
				// Add custom data for MDC row action, so original is retrievable from inner row action item
				oInnerRowActionItem.data("rowAction", oRowActionItem);
				return oInnerRowActionItem;
			}, this);
		}

		oGridTable.setRowActionTemplate(new InnerRowAction(oRowActions));

		const iActionCount = oRowSettings.getEffectiveRowActionCount();
		oGridTable.setRowActionCount(iActionCount);
	};

	GridTableType.prototype._removeRowActions = function() {
		const oGridTable = this.getInnerControl();
		const oInnerRowAction = oGridTable.getRowActionTemplate();

		if (oInnerRowAction) {
			oInnerRowAction.destroy();
		}

		oGridTable.setRowActionTemplate();
		oGridTable.setRowActionCount();
	};

	function onRowActionPress(oEvent) {
		const oTable = this.getTable();
		const oInnerRowActionItem = oEvent.getParameter("item");
		const oRowSettings = oTable.getRowSettings();
		let oRowActionItem;

		if (oRowSettings.isBound("rowActions")) {
			// For bound actions: Use singleton clone (one for all rows)
			const oTemplate = oRowSettings.getBindingInfo("rowActions").template;
			oRowActionItem = this.getRowActionClone(oTemplate);
		} else {
			const oOriginalActionItem = oInnerRowActionItem.data("rowAction");
			oRowActionItem = this.getRowActionClone(oOriginalActionItem);
		}

		// Temporarily add clone as dependent to propagate model context, then remove it to prevent
		// the clone from being destroyed when the inner RowActionItem is destroyed during rebinding.
		oInnerRowActionItem.addDependent(oRowActionItem);

		this.callHook("Press", oRowActionItem, {
			bindingContext: oEvent.getParameter("row").getBindingContext(this.getInnerControl().getBindingInfo("rows").model)
		});

		oInnerRowActionItem.removeDependent(oRowActionItem);
	}

	GridTableType.prototype.prepareRowPress = function() {
		const oGridTable = this.getInnerControl();
		if (oGridTable && !oGridTable.hasListeners("cellClick")) {
			// Only add cellClick listener, if none has been registered yet
			oGridTable.attachEvent("cellClick", onCellClick, this);
		}
	};

	GridTableType.prototype.cleanupRowPress = function() {
		const oTable = this.getTable();
		if (!oTable.hasListeners("rowPress")) {
			// Only detach cellClick listener, if table has no rowPress event listener anymore
			this.getInnerControl()?.detachEvent("cellClick", onCellClick, this);
		}
	};

	GridTableType.prototype.removeToolbar = function() {
		const oGridTable = this.getInnerControl();

		if (oGridTable) {
			oGridTable.removeExtension(this.getTable()._oToolbar);
		}
	};

	GridTableType.prototype.scrollToIndex = function(iIndex) {
		const oGridTable = this.getInnerControl();

		if (!oGridTable) {
			return Promise.reject();
		}

		return oGridTable._scrollToIndex(iIndex);
	};

	GridTableType.prototype.getRowBinding = function() {
		const oGridTable = this.getInnerControl();
		return oGridTable ? oGridTable.getBinding() : undefined;
	};

	GridTableType.prototype.bindRows = function(oBindingInfo) {
		const oGridTable = this.getInnerControl();

		if (oGridTable) {
			oGridTable.bindRows(oBindingInfo);
		}
	};

	GridTableType.prototype.isTableBound = function() {
		const oGridTable = this.getInnerControl();
		return oGridTable ? oGridTable.isBound("rows") : false;
	};

	GridTableType.prototype.insertFilterInfoBar = function(oFilterInfoBar) {
		const oGridTable = this.getInnerControl();

		if (oGridTable) {
			const sFilterInfoBarAccTextId = oFilterInfoBar.getACCTextId();

			oGridTable.insertExtension(oFilterInfoBar, 1);

			if (!oGridTable.getAriaLabelledBy().includes(sFilterInfoBarAccTextId)) {
				oGridTable.addAriaLabelledBy(sFilterInfoBarAccTextId);
			}
		}
	};

	GridTableType.prototype.setFooter = function(oFooter) {
		this.getInnerControl()?.setFooter(oFooter);
	};

	GridTableType.prototype.setContextMenu = function(oContextMenu) {
		this.getInnerControl()?.setContextMenu(oContextMenu);
	};

	GridTableType.prototype.createNoColumnsMessage = function() {
		const oMessage = TableTypeBase.prototype.createNoColumnsMessage.apply(this, arguments);
		oMessage.setEnableVerticalResponsiveness(true);
		return oMessage;
	};

	GridTableType.prototype.setNoData = function(vNoData) {
		const oGridTable = this.getInnerControl();

		if (!oGridTable) {
			return;
		}

		if (vNoData?.isA?.("sap.m.IllustratedMessage")) {
			vNoData.setEnableVerticalResponsiveness(true);
			if (!oGridTable.getAggregation("_noColumnsMessage")) {
				oGridTable.setAggregation("_noColumnsMessage", this.createNoColumnsMessage());
			}
		}

		oGridTable.setNoData(vNoData);
	};

	GridTableType.prototype.updateSortIndicator = function(oColumn, sSortOrder) {
		/** @deprecated As of version 1.120 */
		oColumn.getInnerColumn().setSorted(sSortOrder !== "None");
		oColumn.getInnerColumn().setSortOrder(sSortOrder);
	};

	GridTableType.prototype.getTableStyleClasses = function() {
		const aStyleClasses = TableTypeBase.prototype.getTableStyleClasses.apply(this, arguments);

		if (this.getRowCountMode() === TableRowCountMode.Auto) {
			aStyleClasses.push("sapUiMdcTableFitContainer");
		}

		return aStyleClasses;
	};

	GridTableType.prototype.setScrollThreshold = function(iThreshold) {
		this.setProperty("scrollThreshold", iThreshold, true);
		return this;
	};

	GridTableType.prototype.setEnableColumnFreeze = function(bEnableColumnFreeze) {
		if (this.getEnableColumnFreeze() !== bEnableColumnFreeze) {
			this.setProperty("enableColumnFreeze", bEnableColumnFreeze, true);
			this.getTable()?._updateAdaptation();
		}
		return this;
	};

	GridTableType.prototype.onModifications = function() {
		const oTable = this.getTable();
		const oState = oTable._getXConfig();
		const oTypeState = oState?.aggregations?.type;

		this.oTypeSettingsModel.setProperty("/p13nFixedColumnCount", oTypeState?.GridTable?.fixedColumnCount);
	};

	/**
	 * Determines whether the xConfig state should be shown.
	 * @returns {boolean} whether the xConfig state should be shown
	 */
	GridTableType.prototype.showXConfigState = function() {
		return this.getEnableColumnFreeze();
	};

	return GridTableType;
});