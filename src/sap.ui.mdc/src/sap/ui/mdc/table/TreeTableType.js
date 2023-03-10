/*!
 * ${copyright}
 */

sap.ui.define([
	"./GridTableType"
], function(
	GridTableType
) {
	"use strict";

	var InnerTable;

	/**
	 * Constructor for a new <code>TreeTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.mdc.table.GridTableType
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.109
	 * @alias sap.ui.mdc.table.TreeTableType
	 */

	var TreeTableType = GridTableType.extend("sap.ui.mdc.table.TreeTableType", {
		metadata: {
			library: "sap.ui.mdc"
		}
	});

	TreeTableType.prototype.loadModules = function() {
		if (InnerTable) {
			return Promise.resolve();
		}

		return Promise.all([
			GridTableType.prototype.loadModules.apply(this, arguments),
			this.loadUiTableLibrary().then(function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require([
						"sap/ui/table/TreeTable"
					], function(TreeTable) {
						InnerTable = TreeTable;
						resolve();
					}, function() {
						reject("Failed to load some modules");
					});
				});
			})
		]);
	};

	TreeTableType.prototype.createTable = function(sId) {
		var oTable = this.getTable();

		if (!oTable || !InnerTable) {
			return null;
		}

		var oTreeTable = new InnerTable(sId, this.getTableSettings());

		oTreeTable._oProxy._bEnableV4 = true;

		return oTreeTable;
	};

	TreeTableType.prototype.getTableSettings = function() {
		var oTable = this.getTable();
		var bSelectionSupported = oTable ? oTable.bDelegateInitialized && oTable.getControlDelegate().getSupportedFeatures(oTable)["selection"] : false;
		var mTableSettings = GridTableType.prototype.getTableSettings.apply(this, arguments);

		if (!bSelectionSupported) {
			mTableSettings.plugins[0].destroy();
			delete mTableSettings.plugins;
			mTableSettings.selectionMode = "None";
		}

		return mTableSettings;
	};

	return TreeTableType;
});
