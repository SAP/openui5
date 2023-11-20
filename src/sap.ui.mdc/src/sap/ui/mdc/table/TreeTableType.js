/*!
 * ${copyright}
 */

sap.ui.define([
	"./GridTableType"
], function(
	GridTableType
) {
	"use strict";

	let InnerTable;

	/**
	 * Constructor for a new <code>TreeTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.mdc.table.GridTableType
	 * @author SAP SE
	 * @public
	 * @since 1.109
	 * @alias sap.ui.mdc.table.TreeTableType
	 */

	const TreeTableType = GridTableType.extend("sap.ui.mdc.table.TreeTableType", {
		metadata: {
			library: "sap.ui.mdc"
		}
	});

	/**
	 * @inheritDoc
	 */
	TreeTableType.prototype.loadModules = function() {
		if (InnerTable) {
			return Promise.resolve();
		}

		return GridTableType.prototype.loadModules.apply(this, arguments).then(function() {
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
		});
	};

	TreeTableType.prototype.createTable = function(sId) {
		const oTable = this.getTable();

		if (!oTable || !InnerTable) {
			return null;
		}

		const oTreeTable = new InnerTable(sId, this.getTableSettings());

		oTreeTable._oProxy._bEnableV4 = true;

		return oTreeTable;
	};

	return TreeTableType;
});
