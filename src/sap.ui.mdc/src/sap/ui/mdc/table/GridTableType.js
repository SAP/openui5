/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableTypeBase", "../library"
], function(TableTypeBase, library) {
	"use strict";

	var InnerTable, InnerColumn, InnerRowAction, InnerRowActionItem, InnerMultiSelectionPlugin, InnerFixedRowMode, InnerAutoRowMode, InnerRowSettings;
	var RowCountMode = library.RowCountMode;

	/**
	 * Constructor for a new <code>GridTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.mdc.table.TableTypeBase
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 * @since 1.65
	 * @alias sap.ui.mdc.table.GridTableType
	 * @ui5-metamodel This element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var GridTableType = TableTypeBase.extend("sap.ui.mdc.table.GridTableType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines how the table handles the row count.
				 */
				rowCountMode: {
					type: "sap.ui.mdc.RowCountMode",
					defaultValue: RowCountMode.Auto
				},
				/**
				 * Row count of the inner table.<br>
				 * This property specifies the minimum row count if <code>sap.ui.mdc.RowCountMode.Auto</code> is used.<br>
				 * This property specifies the row count if <code>sap.ui.mdc.RowCountMode.Fixed</code> is used.
				 */
				rowCount: {
					type: "int",
					defaultValue: 10
				},
				/**
				 * Number of indices which can be selected in a range.
				 * Accepts positive integer values. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the
				 * Deselect All button.
				 */
				selectionLimit : {
					type : "int",
					defaultValue : 200
				},
				/**
				 * Determines whether the header selector is shown.
				 */
				showHeaderSelector : {
					type : "boolean",
					defaultValue : true
				}
			}
		}
	});

	GridTableType.prototype.updateRelevantTableProperty = function(oTable, sProperty, vValue) {
		if (!oTable || !oTable.isA("sap.ui.table.Table")) {
			return;
		}

		if (sProperty === "rowCountMode") {
			var oRowMode = oTable.getRowMode();
			var bHideEmptyRows = false;

			if (oRowMode && (vValue === RowCountMode.Fixed && !oRowMode.isA("sap.ui.table.rowmodes.FixedRowMode") ||
							 vValue === RowCountMode.Auto && !oRowMode.isA("sap.ui.table.rowmodes.AutoRowMode"))) {
				bHideEmptyRows = oRowMode.getHideEmptyRows();
				oRowMode.destroy();
				oRowMode = null;
			}

			if (!oRowMode) {
				var RowMode = vValue === RowCountMode.Fixed ? InnerFixedRowMode : InnerAutoRowMode;
				oTable.setRowMode(new RowMode({
					hideEmptyRows: bHideEmptyRows
				}));
			}

			this._updateTableRowCount(oTable, vValue, this.getRowCount());
		} else if (sProperty === "rowCount") {
			this._updateTableRowCount(oTable, this.getRowCountMode(), vValue);
		} else if (sProperty === "selectionLimit") {
			oTable.getPlugins()[0].setLimit(vValue).setEnableNotification(vValue > 0);
		} else if (sProperty === "showHeaderSelector") {
			oTable.getPlugins()[0].setShowHeaderSelector(vValue);
		}
	};

	GridTableType.prototype._updateTableRowCount = function(oTable, sMode, iValue) {
		if (sMode === RowCountMode.Fixed) {
			oTable.getRowMode().setRowCount(iValue);
		} else {
			oTable.getRowMode().setMinRowCount(iValue);
		}
	};

	GridTableType.updateDefault = function(oTable) {
		if (oTable) {
			oTable.setRowMode(new InnerAutoRowMode({
				minRowCount: 10 // default in this class
			}));
		}
	};

	/* Below APIs are used during table creation */

	GridTableType.loadGridTableLib = function() {
		if (!this._oGridTableLibLoaded) {
			this._oGridTableLibLoaded = sap.ui.getCore().loadLibrary("sap.ui.table", true);
		}
		return this._oGridTableLibLoaded;
	};

	GridTableType.loadTableModules = function() {
		if (!InnerTable) {
			return new Promise(function(resolve, reject) {
				this.loadGridTableLib().then(function() {
					sap.ui.require([
						"sap/ui/table/Table", "sap/ui/table/Column", "sap/ui/table/RowAction", "sap/ui/table/RowActionItem", "sap/ui/table/plugins/MultiSelectionPlugin",
						"sap/ui/table/rowmodes/FixedRowMode", "sap/ui/table/rowmodes/AutoRowMode", "sap/ui/table/RowSettings"
					], function(GridTable, GridColumn, RowAction, RowActionItem, MultiSelectionPlugin, FixedRowMode, AutoRowMode, RowSettings) {
						InnerTable = GridTable;
						InnerColumn = GridColumn;
						InnerRowAction = RowAction;
						InnerRowActionItem = RowActionItem;
						InnerMultiSelectionPlugin = MultiSelectionPlugin;
						InnerFixedRowMode = FixedRowMode;
						InnerAutoRowMode = AutoRowMode;
						InnerRowSettings = RowSettings;
						resolve();
					}, function() {
						reject("Failed to load some modules");
					});
				});
			}.bind(this));
		} else {
			return Promise.resolve();
		}
	};

	GridTableType.createTable = function(sId, mSettings) {
		return new InnerTable(sId, mSettings);
	};

	GridTableType.createColumn = function(sId, mSettings) {
		var oColumn = new InnerColumn(sId, mSettings);
		/* **** Ensure that the columnSelect event is fired always (esp. mobile) **** */
		oColumn.attachColumnMenuOpen(function(oEvent){ oEvent.preventDefault(); });
		oColumn._menuHasItems = function() { return true; };
		/* **** */
		return oColumn;
	};

	GridTableType.createMultiSelectionPlugin = function(oTable, aEventInfo) {
		return new InnerMultiSelectionPlugin(oTable.getId() + "--multiSelectPlugin", {
			selectionMode: TableTypeBase.getSelectionMode(oTable),
			selectionChange: aEventInfo
		});
	};

	GridTableType.enableColumnResizer = function(oTable, oInnerTable) {
		oInnerTable.getColumns().forEach(function(oColumn) {
			oColumn.setResizable(true);
			oColumn.setAutoResizable(true);
		});

		oInnerTable.detachColumnResize(oTable._onColumnResize, oTable);
		oInnerTable.attachColumnResize(oTable._onColumnResize, oTable);
	};

	GridTableType.disableColumnResizer = function(oTable, oInnerTable) {
		oInnerTable.getColumns().forEach(function(oColumn) {
			oColumn.setResizable(false);
			oColumn.setAutoResizable(false);
		});

		oInnerTable.detachColumnResize(oTable._onColumnResize, oTable);
	};

	GridTableType.updateSelection = function(oTable) {
		var sSelectionMode = TableTypeBase.getSelectionMode(oTable);
		oTable._oTable.getPlugins()[0].setSelectionMode(sSelectionMode);
	};

	GridTableType.removeRowActions = function(oTable) {
		var oInnerRowAction = oTable._oTable.getRowActionTemplate();
		if (oInnerRowAction) {
			oInnerRowAction.destroy();
		}
		oTable._oTable.setRowActionTemplate();
		oTable._oTable.setRowActionCount();
	};

	GridTableType.updateRowSettings = function(oTable, oRowSettings, fnRowActionPress) {
		var oInnerRowSettings = new InnerRowSettings(undefined, oRowSettings.getAllSettings());
		this.updateRowActions(oTable.getParent(), oRowSettings, fnRowActionPress);
		oTable.getRowSettingsTemplate().destroy();
		oTable.setRowSettingsTemplate(oInnerRowSettings);
	};

	GridTableType.updateRowActions = function (oTable, oRowSettings) {
		this.removeRowActions(oTable);
		if (!oRowSettings) {
			return;
		}
		if (!oRowSettings.isBound("rowActions") && (!oRowSettings.getRowActions() || oRowSettings.getRowActions().length == 0)) {
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
				press: [this._onRowActionPress, oTable]
			});
			// Remove temporary metadata from row actions object
			delete oRowActions.templateInfo;
		} else {
			oRowActions.items = oRowActions.items.map(function (oRowActionItem) {
				var oInnerRowActionItem = new InnerRowActionItem({
					type: oRowActionItem.isBound("type") ? oRowActionItem.getBindingInfo("type") : oRowActionItem.getType(),
					visible: oRowActionItem.isBound("visible") ? oRowActionItem.getBindingInfo("visible") : oRowActionItem.getVisible(),
					icon: oRowActionItem.isBound("icon") ? oRowActionItem.getBindingInfo("icon") : oRowActionItem._getIcon(),
					text: oRowActionItem.isBound("text") ? oRowActionItem.getBindingInfo("text") : oRowActionItem._getText(),
					press: [this._onRowActionPress, oTable]
				});
				// Add custom data for MDC row action, so original is retrievable from inner row action item
				oInnerRowActionItem.data("rowAction", oRowActionItem);
				return oInnerRowActionItem;
			}, this);
		}

		var oInnerRowAction = new InnerRowAction(oTable.getId() + "--rowAction", oRowActions);
		oTable._oTable.setRowActionTemplate(oInnerRowAction);
		oTable._oTable.setRowActionCount(oRowSettings.getRowActionCount());
	};

	GridTableType._onRowActionPress = function (oEvent) {
		var oInnerRowActionItem = oEvent.getParameter("item");
		var oRowActionsInfo = this.getRowSettings().getAllActions();

		if (this.getRowSettings().isBound("rowActions")) {
			var sActionModel = oRowActionsInfo.items.model;
			var oActionContext = oInnerRowActionItem.getBindingContext(sActionModel);

			// Create a one time clone for the MDC RowAction and 'switch' binding context based on press action
			if (!this._oRowActionItem) {
				this._oRowActionItem = oRowActionsInfo.items.template.clone();
			}
			this._oRowActionItem.setBindingContext(oActionContext, oRowActionsInfo.items.model);

			// Set model for row settings, as it is not propagated
			this._oRowActionItem.setModel(this.getModel(sActionModel), sActionModel);
			this.getRowSettings().addDependent(this._oRowActionItem);
		} else {
			this._oRowActionItem = oInnerRowActionItem.data("rowAction");
		}
		var oRow = oEvent.getParameter("row");
		this._oRowActionItem.firePress({
			bindingContext: oRow.getBindingContext()
		});
	};

	return GridTableType;
});
