/*
 * ! ${copyright}
 */

sap.ui.define([
	"../TableDelegate",
	"../util/loadModules",
	"../library"
], function(
	TableDelegate,
	loadModules,
	library
) {
	"use strict";

	var TableType = library.TableType;

	/**
	 * Delegate class for sap.ui.mdc.Table to enable analytical capabilities.
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.85
	 * @alias sap.ui.mdc.table.V4AnalyticsDelegate
	 */
	var Delegate = Object.assign({}, TableDelegate);

	/**
	 * Initializes a new table property helper for V4 analytics with the property extensions merged into the property infos.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table.
	 * @returns {Promise<sap.ui.mdc.table.V4AnalyticsPropertyHelper>} A promise that resolves with the property helper.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Delegate.initPropertyHelper = function(oTable) {
		// TODO: Do this in the DelegateMixin, or provide a function in the base delegate to merge properties and extensions
		return Promise.all([
			this.fetchProperties(oTable),
			this.fetchPropertyExtensions(oTable),
			loadModules("./V4AnalyticsPropertyHelper")
		]).then(function(aResult) {
			var aProperties = aResult[0];
			var mExtensions = aResult[1];
			var PropertyHelper = aResult[2][0];
			var iMatchingExtensions = 0;
			var aPropertiesWithExtension = [];

			for (var i = 0; i < aProperties.length; i++) {
				aPropertiesWithExtension.push(Object.assign({}, aProperties[i], {
					extension: mExtensions[aProperties[i].name] || {}
				}));
				iMatchingExtensions++;
			}

			if (iMatchingExtensions !== Object.keys(mExtensions).length) {
				throw new Error("At least one property extension does not point to an existing property");
			}

			return new PropertyHelper(aPropertiesWithExtension, oTable);
		});
	};

	/**
	 * Fetches the property extensions.
	 * TODO: document structure of the extension
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @returns {Promise<object<string, object>>} Key-value map, where the key is the name of the property, and the value is the extension
	 * @protected
	 */
	Delegate.fetchPropertyExtensions = function(oTable) {
		return Promise.resolve({});
	};

	Delegate.preInit = function(oTable) {
		if (oTable._getStringType() === TableType.ResponsiveTable) {
			throw new Error("This delegate does not support the table type '" + TableDelegate.ResponsiveTable + "'.");
		}

		return enrichGridTable(oTable);
	};

	function enrichGridTable(oTable) {
		// The property helper is initialized after the table "initialized" promise resolves. So we can only wait for the property helper.
		return Promise.all([
			oTable.awaitPropertyHelper(),
			loadModules("sap/ui/table/plugins/V4Aggregation")
		]).then(function(aResult) {
			//var oPropertyHelper = oTable.getPropertyHelper();
			var V4AggregationPlugin = aResult[1][0];
			var oInnerTable = oTable._oTable;
			var oPlugin = new V4AggregationPlugin();

			// TODO: configure the plugin

			oInnerTable.addDependent(oPlugin);
		});
	}

	return Delegate;
});