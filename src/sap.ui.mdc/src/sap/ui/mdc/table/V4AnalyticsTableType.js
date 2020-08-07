/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core", "./GridTableType"
], function(Core, GridTableType) {
	"use strict";

	var InnerV4Aggregation;

	/**
	 * Constructor for a new V4AnalyticsTableType.
	 *
	 * @param {string} [sId] ID for the new object, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The table type info base class for the metadata driven table.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.table.GridTableType
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.81
	 * @alias sap.ui.mdc.table.V4AnalyticsTableType
	 * @ui5-metamodel This element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var V4AnalyticsTableType = GridTableType.extend("sap.ui.mdc.table.V4AnalyticsTableType", {
		metadata: {
			properties: {
			}
		}
	});

	V4AnalyticsTableType.loadTableModules = function () {
		return Promise.all([GridTableType.loadTableModules(),
			new Promise(function (resolve, reject) {
				sap.ui.require([
					"sap/ui/table/plugins/V4Aggregation"
				], function (V4Aggregation) {
					InnerV4Aggregation = V4Aggregation;
					resolve();
				}, function () {
					reject("Failed to load V4Aggregation plugin");
				});
			})
		]);
	};

	V4AnalyticsTableType.createV4AggregationPlugin = function(oTable) {
		var oV4AggregationPlugin = Core.byId(oTable.getId() + "--mV4Aggregation");
		return oV4AggregationPlugin ? oV4AggregationPlugin : new InnerV4Aggregation(oTable.getId() + "--mV4Aggregation");
	};

	V4AnalyticsTableType.prototype.updateTableSettings = function() {
		// Add V4Aggregation Plugin to the ui.table.Table in order to handle OData V4 Analytics
		this.getRelevantTable().addDependent(V4AnalyticsTableType.createV4AggregationPlugin(this.getParent()));
		// Get grid table type properties and add it to the ones below
		GridTableType.prototype.updateTableSettings.call(this, GridTableType.getMetadata().getProperties());
	};

	return V4AnalyticsTableType;
});
