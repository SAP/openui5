/*
 * ! ${copyright}
 */

sap.ui.define([
	"./TableTypeBase", "../library"
], function(TableTypeBase, library) {
	"use strict";

	var InnerTable, InnerColumn, InnerRowAction, InnerRowActionItem, InnerMultiSelectionPlugin, InnerFixedRowMode, InnerAutoRowMode, InnerRowSettings;
	var RowCountMode = library.RowCountMode;
	var RowAction = library.RowAction;

	/**
	 * Constructor for a new GridTableType.
	 *
	 * @param {string} [sId] ID for the new object, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The table type info base class for the metadata driven table.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.table.TableTypeBase
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.65
	 * @alias sap.ui.mdc.table.GridTableType
	 * @ui5-metamodel This element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var GridTableType = TableTypeBase.extend("sap.ui.mdc.table.GridTableType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * See sap.ui.mdc.RowCountMode for the options.<br>
				 * Defaults to Auto --> meaning table adjusts it's height based on the parent container
				 */
				rowCountMode: {
					type: "sap.ui.mdc.RowCountMode",
					defaultValue: RowCountMode.Auto
				},
				/**
				 * RowCount of the inner table.<br>
				 * When sap.ui.mdc.RowCountMode.Auto is used - this property specifies the minAutoRowCount.<br>
				 * When sap.ui.mdc.RowCountMode.Fixed is used - this property specifies the visibleRowCount.
				 */
				rowCount: {
					type: "int",
					defaultValue: 10
				},
				/**
				 * Number of indices which can be selected in a range.
				 * Accepts positive integer values. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the Deselect All button.
				 */
				selectionLimit : {
					type : "int",
					defaultValue : 200
				},
				/**
				 * Show header selector.
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

	GridTableType.createNavigationRowAction = function(sIdPrefix, aEventInfo) {
		return new InnerRowAction(sIdPrefix + "--rowAction", {
			items: new InnerRowActionItem(sIdPrefix + "--rowActionItem", {
				type: RowAction.Navigation,
				press: aEventInfo
			})
		});
	};

	GridTableType.createMultiSelectionPlugin = function(oTable, aEventInfo) {
		return new InnerMultiSelectionPlugin(oTable.getId() + "--multiSelectPlugin", {
			selectionMode: TableTypeBase.getSelectionMode(oTable),
			selectionChange: aEventInfo
		});
	};

	GridTableType.enableColumnResizer = function(oInnerTable) {
		oInnerTable.getColumns().forEach(function(oColumn) {
			oColumn.setResizable(true);
			oColumn.setAutoResizable(true);
		});
	};

	GridTableType.disableColumnResizer = function(oInnerTable) {
		oInnerTable.getColumns().forEach(function(oColumn) {
			oColumn.setResizable(false);
			oColumn.setAutoResizable(false);
		});
	};

	GridTableType.updateSelection = function(oTable) {
		var sSelectionMode = TableTypeBase.getSelectionMode(oTable);
		oTable._oTable.getPlugins()[0].setSelectionMode(sSelectionMode);
	};

	GridTableType.updateNavigation = function(oTable, fnRowActionPress) {
		oTable._oTable.setRowActionTemplate(this.createNavigationRowAction(oTable.getId(), [
			fnRowActionPress, oTable
		]));
		oTable._oTable.setRowActionCount(1);
	};

	GridTableType.clearNavigation = function(oTable) {
		var oInnerRowAction = oTable._oTable.getRowActionTemplate();
		if (oInnerRowAction) {
			oInnerRowAction.destroy();
		}
		oTable._oTable.setRowActionTemplate();
		oTable._oTable.setRowActionCount();
	};

	GridTableType.updateRowAction = function(oTable, bNavigation, fnRowActionPress) {
		this.clearNavigation(oTable);
		if (bNavigation) {
			this.updateNavigation(oTable, fnRowActionPress);
		}
	};

	GridTableType.updateRowSettings = function(oTable, oRowSettings) {
		var oInnerRowSettings = new InnerRowSettings(undefined, oRowSettings.getAllSettings());

		oTable.getRowSettingsTemplate().destroy();
		oTable.setRowSettingsTemplate(oInnerRowSettings);
	};


	return GridTableType;
});
