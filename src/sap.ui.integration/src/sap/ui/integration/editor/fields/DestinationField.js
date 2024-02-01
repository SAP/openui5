/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/ui/core/ListItem",
	"sap/m/ComboBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
], function (
	BaseField, ListItem, ComboBox, Sorter, Filter
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.DestinationField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var DestinationField = BaseField.extend("sap.ui.integration.editor.fields.DestinationField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	DestinationField.prototype.initVisualization = function (oConfig) {
		var that = this;
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			oVisualization = {
				type: ComboBox,
				settings: {
					busy: {
						path: 'destinations>_loading',
						formatter: function(bIsLoading) {
							if (!bIsLoading && oConfig.filter) {
								var oFilter;
								if (Array.isArray(oConfig.filter.filters)) {
									var aFilters = [];
									oConfig.filter.filters.forEach(function(oFilterConfig) {
										aFilters.push(new Filter(oFilterConfig));
									});
									var bAnd = typeof oConfig.filter.and === "boolean" ? oConfig.filter.and : false;
									oFilter = new Filter({
										filters: aFilters,
										and: bAnd
									});
								} else {
									oFilter = new Filter(oConfig.filter);
								}
								var oBinding = that.getAggregation("_field").getBinding("items");
								if (!oBinding) {
									// waiting for field init process finished
									that.attachEventOnce("afterInit", function() {
										oBinding = that.getAggregation("_field").getBinding("items");
										oBinding.filter([oFilter]);
									});
								} else {
									oBinding.filter([oFilter]);
								}
							}
							return bIsLoading;
						}
					},
					selectedKey: { path: 'currentSettings>value' },
					width: "100%",
					editable: { path: 'currentSettings>editable' },
					items: {
						path: "destinations>_values",
						template: new ListItem({
							text: "{destinations>name}",
							key: "{destinations>name}"
						})
					}
				}
			};
			oVisualization.settings.items.sorter = [];
			var aSorters = oConfig.sorter || [{
				path: 'name'
			}];
			aSorters.forEach(function(oSorterConfig) {
				oVisualization.settings.items.sorter.push(new Sorter(oSorterConfig));
			});
		}
		this._visualization = oVisualization;
	};

	return DestinationField;
});