/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableTypeBase",
	"./menu/GroupHeaderRowContextMenu",
	"../enums/TableRowCountMode",
	"sap/m/table/Util",
	"./utils/Personalization",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Lib"
], (
	TableTypeBase,
	GroupHeaderRowContextMenu,
	TableRowCountMode,
	MTableUtil,
	PersonalizationUtils,
	JSONModel,
	Library
) => {
	"use strict";

	let InnerTable, InnerColumn, InnerRowAction, InnerRowActionItem, InnerRowModeMap, InnerRowSettings;

	/**
	 * Constructor for a new <code>GridTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.
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
				 * Row count of the inner table.<br>
				 * This property specifies the minimum row count if <code>sap.ui.mdc.enums.TableRowCountMode.Auto</code> is used.<br>
				 * This property specifies the row count if <code>sap.ui.mdc.enums.TableRowCountMode.Interactive</code> or <code>sap.ui.mdc.enums.TableRowCountMode.Fixed</code> is used.<br>
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
	GridTableType.prototype.exit = function() {
		TableTypeBase.prototype.exit.apply(this, arguments);
		this.disableColumnResize();
	};

	GridTableType.prototype.updateTableByProperty = function(sProperty, vValue) {
		const oGridTable = this.getInnerTable();

		if (!oGridTable) {
			return;
		}

		if (sProperty === "rowCountMode") {
			let oRowMode = oGridTable.getRowMode();
			let bHideEmptyRows = false;

			if (oRowMode && (vValue === TableRowCountMode.Fixed && !oRowMode.isA("sap.ui.table.rowmodes.Fixed") ||
					vValue === TableRowCountMode.Auto && !oRowMode.isA("sap.ui.table.rowmodes.Auto") ||
					vValue === TableRowCountMode.Interactive && !oRowMode.isA("sap.ui.table.rowmodes.Interactive"))) {
				const oCreationRow = this.getTable().getCreationRow();
				if (oCreationRow) {
					bHideEmptyRows = oCreationRow.getVisible();
				}
				oRowMode.destroy();
				oRowMode = null;
			}

			if (!oRowMode) {
				const RowMode = InnerRowModeMap[vValue] ?? InnerRowModeMap[TableRowCountMode.Auto];
				const oRowMode = new RowMode({
					fixedBottomRowCount: "{= ${$sap.ui.mdc.Table>/@custom/hasGrandTotal} ? 1 : 0}"
				});
				oGridTable.setRowMode(oRowMode.setHideEmptyRows?.(bHideEmptyRows) ?? oRowMode);
			}

			this._updateTableRowCount();
		} else if (sProperty === "rowCount") {
			this._updateTableRowCount();
		}
	};

	GridTableType.prototype._updateTableRowCount = function() {
		const oGridTable = this.getInnerTable();

		if (this.getRowCountMode() === TableRowCountMode.Fixed || this.getRowCountMode() === TableRowCountMode.Interactive) {
			oGridTable.getRowMode().setRowCount(this.getRowCount());
		} else {
			oGridTable.getRowMode().setMinRowCount(this.getRowCount());
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

	GridTableType.prototype.createTable = function(sId) {
		const oTable = this.getTable();

		if (!oTable || !InnerTable) {
			return null;
		}

		const oGridTable = new InnerTable(sId, this.getTableSettings());

		oGridTable.setAggregation("groupHeaderRowContextMenu", new GroupHeaderRowContextMenu());
		const oSettingsModel = new JSONModel({
			p13nFixedColumnCount: null
		});
		oGridTable.setModel(oSettingsModel, "$typeSettings");

		return oGridTable;
	};

	GridTableType.prototype.getTableSettings = function() {
		const oTable = this.getTable();
		const mSelectionBehaviorMap = {
			SingleMaster: "RowOnly"
		};
		const mRowSettingsConfig = this.getRowSettingsConfig();

		const mSettings = {
			enableBusyIndicator: true,
			enableColumnReordering: false,
			threshold: {
				path: "$sap.ui.mdc.Table>/threshold",
				formatter: function(iThreshold) {
					return iThreshold > -1 ? iThreshold : undefined;
				}
			},
			scrollThreshold: "{$sap.ui.mdc.Table#type>/scrollThreshold}",
			noData: oTable._getNoDataText(),
			extension: [oTable._oToolbar],
			ariaLabelledBy: [oTable._oTitle],
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
					{ path: "$sap.ui.mdc.Table#type>/fixedColumnCount" }, { path: "$typeSettings>/p13nFixedColumnCount" }
				],
				formatter: function(iFixedColumnCount, iP13nFixedColumnCount) {
					return iP13nFixedColumnCount ?? iFixedColumnCount;
				}
			},
			columnFreeze: [onColumnFreeze, this],
			beforeOpenContextMenu: [onBeforeOpenContextMenu, this]
		};

		if (oTable.hasListeners("rowPress")) {
			mSettings.cellClick = [onCellClick, this];
		}

		return Object.assign({}, TableTypeBase.prototype.getTableSettings.apply(this, arguments), mSettings);
	};

	function onCellClick(oEvent) {
		this.callHook("RowPress", this.getTable(), {
			bindingContext: oEvent.getParameter("rowBindingContext")
		});
	}

	function onBeforeOpenContextMenu(oEvent) {
		const mEventParameters = oEvent.getParameters();
		const oTable = this.getTable();
		const oInnerTable = this.getInnerTable();
		const oRow = oInnerTable.getRows().find((oRow) => oRow.getIndex() === mEventParameters.rowIndex);

		this.callHook("BeforeOpenContextMenu", oTable, {
			bindingContext: oInnerTable.getContextByIndex(mEventParameters.rowIndex),
			column: oTable.getColumns()[mEventParameters.columnIndex],
			contextMenu: mEventParameters.contextMenu,
			event: oEvent,
			groupLevel: mEventParameters.contextMenu.isA("sap.ui.mdc.table.menu.GroupHeaderRowContextMenu") ? oRow.getLevel() : undefined
		});
	}

	GridTableType.createColumn = function(sId, mSettings) {
		return new InnerColumn(sId, mSettings);
	};

	GridTableType.prototype.enableColumnResize = function() {
		const oTable = this.getTable();
		const oGridTable = this.getInnerTable();

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
		const oGridTable = this.getInnerTable();

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
		const oGridTable = this.getInnerTable();
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
			fixedColumnCount: this.getInnerTable().getFixedColumnCount()
		});
	}

	GridTableType.prototype.updateRowSettings = function() {
		const oGridTable = this.getInnerTable();

		if (!oGridTable) {
			return;
		}

		oGridTable.destroyRowSettingsTemplate();
		oGridTable.setRowSettingsTemplate(new InnerRowSettings(this.getRowSettingsConfig()));
		this.updateRowActions();
	};

	GridTableType.prototype.updateRowActions = function() {
		const oGridTable = this.getInnerTable();

		if (!oGridTable) {
			return;
		}

		const oRowSettings = this.getTable().getRowSettings();

		this._removeRowActions();

		if (!oRowSettings || !oRowSettings.isBound("rowActions") && (!oRowSettings.getRowActions() || oRowSettings.getRowActions().length == 0)) {
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
		oGridTable.setRowActionCount(oRowSettings.getRowActionCount());
	};

	GridTableType.prototype._removeRowActions = function() {
		const oGridTable = this.getInnerTable();
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
		const oRowActionsInfo = oRowSettings.getAllActions();

		if (oRowSettings.isBound("rowActions")) {
			const sActionModel = oRowActionsInfo.items.model;
			const oActionContext = oInnerRowActionItem.getBindingContext(sActionModel);

			// Create a one time clone for the MDC RowAction and 'switch' binding context based on press action
			if (!this._oRowActionItem) {
				this._oRowActionItem = oRowActionsInfo.items.template.clone();
			}
			this._oRowActionItem.setBindingContext(oActionContext, oRowActionsInfo.items.model);

			// Set model for row settings, as it is not propagated
			this._oRowActionItem.setModel(this.getModel(sActionModel), sActionModel);
			oRowSettings.addDependent(this._oRowActionItem);
		} else {
			this._oRowActionItem = oInnerRowActionItem.data("rowAction");
		}

		this.callHook("Press", this._oRowActionItem, {
			bindingContext: oEvent.getParameter("row").getBindingContext(this.getInnerTable().getBindingInfo("rows").model)
		});
	}

	GridTableType.prototype.prepareRowPress = function() {
		const oGridTable = this.getInnerTable();
		if (oGridTable && !oGridTable.hasListeners("cellClick")) {
			// Only add cellClick listener, if none has been registered yet
			oGridTable.attachEvent("cellClick", onCellClick, this);
		}
	};

	GridTableType.prototype.cleanupRowPress = function() {
		const oTable = this.getTable();
		if (!oTable.hasListeners("rowPress")) {
			// Only detach cellClick listener, if table has no rowPress event listener anymore
			this.getInnerTable()?.detachEvent("cellClick", onCellClick, this);
		}
	};

	GridTableType.prototype.removeToolbar = function() {
		const oGridTable = this.getInnerTable();

		if (oGridTable) {
			oGridTable.removeExtension(this.getTable()._oToolbar);
		}
	};

	GridTableType.prototype.scrollToIndex = function(iIndex) {
		const oTable = this.getTable();
		const oGridTable = this.getInnerTable();

		if (!oGridTable) {
			return Promise.reject();
		}

		return new Promise((resolve) => {
			if (iIndex === -1) {
				iIndex = MTableUtil.isEmpty(oTable.getRowBinding()) ? 0 : oTable.getRowBinding().getLength();
			}

			if (oGridTable._setFirstVisibleRowIndex(iIndex)) {
				oGridTable.attachEventOnce("rowsUpdated", () => {
					resolve();
				});
			} else {
				resolve();
			}
		});
	};

	GridTableType.prototype.getRowBinding = function() {
		const oGridTable = this.getInnerTable();
		return oGridTable ? oGridTable.getBinding() : undefined;
	};

	GridTableType.prototype.bindRows = function(oBindingInfo) {
		const oGridTable = this.getInnerTable();

		if (oGridTable) {
			oGridTable.bindRows(oBindingInfo);
		}
	};

	GridTableType.prototype.isTableBound = function() {
		const oGridTable = this.getInnerTable();
		return oGridTable ? oGridTable.isBound("rows") : false;
	};

	GridTableType.prototype.insertFilterInfoBar = function(oFilterInfoBar, sAriaLabelId) {
		const oGridTable = this.getInnerTable();

		if (oGridTable) {
			oGridTable.insertExtension(oFilterInfoBar, 1);

			if (!oGridTable.getAriaLabelledBy().includes(sAriaLabelId)) {
				oGridTable.addAriaLabelledBy(sAriaLabelId);
			}
		}
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
		const oGridTable = this.getInnerTable();
		const oState = oTable._getXConfig();
		const oTypeState = oState?.aggregations?.type;

		oGridTable.getModel("$typeSettings").setProperty("/p13nFixedColumnCount", oTypeState?.GridTable?.fixedColumnCount ?? 0);
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