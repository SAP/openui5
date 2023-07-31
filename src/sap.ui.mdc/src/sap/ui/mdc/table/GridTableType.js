/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableTypeBase",
	"sap/ui/core/library",
	"sap/m/table/Util",
	"sap/ui/mdc/enums/TableRowCountMode"
], function(
	TableTypeBase,
	coreLibrary,
	MTableUtil,
	TableRowCountMode
) {
	"use strict";

	var InnerTable, InnerColumn, InnerRowAction, InnerRowActionItem, InnerFixedRowMode, InnerAutoRowMode, InnerRowSettings;
	var SortOrder = coreLibrary.SortOrder;

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
	var GridTableType = TableTypeBase.extend("sap.ui.mdc.table.GridTableType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines how the table handles the row count.
				 */
				rowCountMode: {
					type: "sap.ui.mdc.enums.TableRowCountMode",
					defaultValue: TableRowCountMode.Auto
				},
				/**
				 * Row count of the inner table.<br>
				 * This property specifies the minimum row count if <code>sap.ui.mdc.enums.TableRowCountMode.Auto</code> is used.<br>
				 * This property specifies the row count if <code>sap.ui.mdc.enums.TableRowCountMode.Fixed</code> is used.
				 */
				rowCount: {
					type: "int",
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
					defaultValue: 200
				},
				/**
				 * Determines whether the header selector is shown.
				 */
				showHeaderSelector: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Defines the number of fixed columns in the inner table.
				 */
				fixedColumnCount: {
					type: "int",
					defaultValue: 0
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
		var oGridTable = this.getInnerTable();

		if (!oGridTable) {
			return;
		}

		if (sProperty === "rowCountMode") {
			var oRowMode = oGridTable.getRowMode();
			var bHideEmptyRows = false;

			if (oRowMode && (vValue === TableRowCountMode.Fixed && !oRowMode.isA("sap.ui.table.rowmodes.Fixed") ||
							 vValue === TableRowCountMode.Auto && !oRowMode.isA("sap.ui.table.rowmodes.Auto"))) {
				bHideEmptyRows = oRowMode.getHideEmptyRows();
				oRowMode.destroy();
				oRowMode = null;
			}

			if (!oRowMode) {
				var RowMode = vValue === TableRowCountMode.Fixed ? InnerFixedRowMode : InnerAutoRowMode;
				oGridTable.setRowMode(new RowMode({
					hideEmptyRows: bHideEmptyRows
				}));
			}

			this._updateTableRowCount();
		} else if (sProperty === "rowCount") {
			this._updateTableRowCount();
		} else if (sProperty === "fixedColumnCount") {
			oGridTable.setFixedColumnCount(vValue);
		}
	};

	GridTableType.prototype._updateTableRowCount = function() {
		var oGridTable = this.getInnerTable();

		if (this.getRowCountMode() === TableRowCountMode.Fixed) {
			oGridTable.getRowMode().setRowCount(this.getRowCount());
		} else {
			oGridTable.getRowMode().setMinRowCount(this.getRowCount());
		}
	};

	GridTableType.prototype.loadUiTableLibrary = function() {
		if (!this._oGridTableLibLoaded) {
			this._oGridTableLibLoaded = sap.ui.getCore().loadLibrary("sap.ui.table", true);
		}
		return this._oGridTableLibLoaded;
	};

	GridTableType.prototype.loadModules = function() {
		if (InnerTable) {
			return Promise.resolve();
		}

		return this.loadUiTableLibrary().then(function() {
			return new Promise(function(resolve, reject) {
				sap.ui.require([
					"sap/ui/table/Table", "sap/ui/table/Column", "sap/ui/table/RowAction", "sap/ui/table/RowActionItem",
					"sap/ui/table/rowmodes/Fixed", "sap/ui/table/rowmodes/Auto", "sap/ui/table/RowSettings"
				], function(GridTable, GridColumn, RowAction, RowActionItem, FixedRowMode, AutoRowMode, RowSettings) {
					InnerTable = GridTable;
					InnerColumn = GridColumn;
					InnerRowAction = RowAction;
					InnerRowActionItem = RowActionItem;
					InnerFixedRowMode = FixedRowMode;
					InnerAutoRowMode = AutoRowMode;
					InnerRowSettings = RowSettings;
					resolve();
				}, function() {
					reject("Failed to load some modules");
				});
			});
		});
	};

	GridTableType.prototype.createTable = function(sId) {
		var oTable = this.getTable();

		if (!oTable || !InnerTable) {
			return null;
		}

		var oInnerTable = new InnerTable(sId, this.getTableSettings());
		oInnerTable._setHideStandardTooltips(true);
		return oInnerTable;
	};

	GridTableType.prototype.getTableSettings = function() {
		var oTable = this.getTable();
		var mSelectionBehaviorMap = {
			SingleMaster: "RowOnly"
		};

		return Object.assign({}, TableTypeBase.prototype.getTableSettings.apply(this, arguments), {
			enableBusyIndicator: true,
			enableColumnReordering: false,
			threshold: this.getThreshold(),
			cellClick: [this._onCellClick, this],
			noData: oTable._getNoDataText(),
			extension: [oTable._oToolbar],
			ariaLabelledBy: [oTable._oTitle],
			rowSettingsTemplate: this.getRowSettingsConfig(),
			selectionMode: "None",
			selectionBehavior: {
				path: "$sap.ui.mdc.Table>/selectionMode",
				formatter: function(sSelectionMode) {
					return mSelectionBehaviorMap[sSelectionMode]; // Default is "RowSelector"
				}
			}
		});
	};

	GridTableType.prototype._onCellClick = function(oEvent) {
		this.callHook("RowPress", this.getTable(), {
			bindingContext: oEvent.getParameter("rowBindingContext")
		});
	};

	GridTableType.createColumn = function(sId, mSettings) {
		return new InnerColumn(sId, mSettings);
	};

	GridTableType.prototype.enableColumnResize = function() {
		var oTable = this.getTable();
		var oGridTable = this.getInnerTable();

		if (!oTable || !oGridTable) {
			return;
		}

		oGridTable.getColumns().forEach(function(oColumn) {
			oColumn.setResizable(true);
			oColumn.setAutoResizable(true);
		});
		oGridTable.detachColumnResize(this._onColumnResize, this);
		oGridTable.attachColumnResize(this._onColumnResize, this);
	};

	GridTableType.prototype.disableColumnResize = function() {
		var oTable = this.getTable();
		var oGridTable = this.getInnerTable();

		if (!oTable || !oGridTable) {
			return;
		}

		oGridTable.getColumns().forEach(function(oColumn) {
			oColumn.setResizable(false);
			oColumn.setAutoResizable(false);
		});
		oGridTable.detachColumnResize(this._onColumnResize, this);
	};

	GridTableType.prototype._onColumnResize = function(oEvent) {
		var oTable = this.getTable();
		var oGridTable = this.getInnerTable();
		var oGridTableColumn = oEvent.getParameter("column");
		var sWidth = oEvent.getParameter("width");
		var iIndex = oGridTable.indexOfColumn(oGridTableColumn);
		var oColumn = oTable.getColumns()[iIndex];

		this.callHook("ColumnResize", oTable, {
			column: oColumn,
			width: sWidth
		});
	};

	GridTableType.prototype.updateRowSettings = function() {
		var oGridTable = this.getInnerTable();

		if (!oGridTable) {
			return;
		}

		oGridTable.destroyRowSettingsTemplate();
		oGridTable.setRowSettingsTemplate(new InnerRowSettings(this.getRowSettingsConfig()));
		this.updateRowActions();
	};

	GridTableType.prototype.updateRowActions = function() {
		var oGridTable = this.getInnerTable();

		if (!oGridTable) {
			return;
		}

		var oRowSettings = this.getTable().getRowSettings();

		this._removeRowActions();

		if (!oRowSettings || !oRowSettings.isBound("rowActions") && (!oRowSettings.getRowActions() || oRowSettings.getRowActions().length == 0)) {
			return;
		}

		var oRowActions = oRowSettings.getAllActions();

		if ("templateInfo" in oRowActions) {
			var oTemplateInfo = oRowActions.templateInfo;
			// Set template for inner row actions using temporary metadata
			oRowActions.items.template = new InnerRowActionItem({
				type: oTemplateInfo.type,
				visible: oTemplateInfo.visible,
				icon: oTemplateInfo.icon,
				text: oTemplateInfo.text,
				press: [this._onRowActionPress, this]
			});
			// Remove temporary metadata from row actions object
			delete oRowActions.templateInfo;
		} else {
			oRowActions.items = oRowActions.items.map(function(oRowActionItem) {
				var oInnerRowActionItem = new InnerRowActionItem({
					type: oRowActionItem.isBound("type") ? oRowActionItem.getBindingInfo("type") : oRowActionItem.getType(),
					visible: oRowActionItem.isBound("visible") ? oRowActionItem.getBindingInfo("visible") : oRowActionItem.getVisible(),
					icon: oRowActionItem.isBound("icon") ? oRowActionItem.getBindingInfo("icon") : oRowActionItem._getIcon(),
					text: oRowActionItem.isBound("text") ? oRowActionItem.getBindingInfo("text") : oRowActionItem._getText(),
					press: [this._onRowActionPress, this]
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
		var oGridTable = this.getInnerTable();
		var oInnerRowAction = oGridTable.getRowActionTemplate();

		if (oInnerRowAction) {
			oInnerRowAction.destroy();
		}

		oGridTable.setRowActionTemplate();
		oGridTable.setRowActionCount();
	};

	GridTableType.prototype._onRowActionPress = function(oEvent) {
		var oTable = this.getTable();
		var oInnerRowActionItem = oEvent.getParameter("item");
		var oRowSettings = oTable.getRowSettings();
		var oRowActionsInfo = oRowSettings.getAllActions();

		if (oRowSettings.isBound("rowActions")) {
			var sActionModel = oRowActionsInfo.items.model;
			var oActionContext = oInnerRowActionItem.getBindingContext(sActionModel);

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
			bindingContext: oEvent.getParameter("row").getBindingContext()
		});
	};

	GridTableType.prototype.removeToolbar = function() {
		var oGridTable = this.getInnerTable();

		if (oGridTable) {
			oGridTable.removeExtension(this.getTable()._oToolbar);
		}
	};

	GridTableType.prototype.scrollToIndex = function(iIndex) {
		var oTable = this.getTable();
		var oGridTable = this.getInnerTable();

		if (!oGridTable) {
			return Promise.reject();
		}

		return new Promise(function(resolve) {
			if (iIndex === -1) {
				iIndex = MTableUtil.isEmpty(oTable.getRowBinding()) ? 0 : oTable.getRowBinding().getLength();
			}

			if (oGridTable._setFirstVisibleRowIndex(iIndex)) {
				oGridTable.attachEventOnce("rowsUpdated", function() {
					resolve();
				});
			} else {
				resolve();
			}
		});
	};

	GridTableType.prototype.getRowBinding = function() {
		var oGridTable = this.getInnerTable();
		return oGridTable ? oGridTable.getBinding() : undefined;
	};

	GridTableType.prototype.bindRows = function(oBindingInfo) {
		var oGridTable = this.getInnerTable();

		if (oGridTable) {
			oGridTable.bindRows(oBindingInfo);
		}
	};

	GridTableType.prototype.isTableBound = function() {
		var oGridTable = this.getInnerTable();
		return oGridTable ? oGridTable.isBound("rows") : false;
	};

	GridTableType.prototype.insertFilterInfoBar = function(oFilterInfoBar, sAriaLabelId) {
		var oGridTable = this.getInnerTable();

		if (oGridTable) {
			oGridTable.insertExtension(oFilterInfoBar, 1);

			if (!oGridTable.getAriaLabelledBy().includes(sAriaLabelId)) {
				oGridTable.addAriaLabelledBy(sAriaLabelId);
			}
		}
	};

	GridTableType.prototype.updateSortIndicator = function(oColumn, sSortOrder) {
		var oGridColumn = oColumn.getInnerColumn();

		oGridColumn.setSorted(sSortOrder !== SortOrder.None);
		oGridColumn.setSortOrder(sSortOrder === SortOrder.None ? undefined : sSortOrder);
	};

	GridTableType.prototype.getContextMenuParameters = function(oEvent) {
		return {
			bindingContext: this.getInnerTable().getContextByIndex(oEvent.getParameters().rowIndex),
			column: this.getTable().getColumns()[oEvent.getParameters().columnIndex]
		};
	};

	return GridTableType;
});
