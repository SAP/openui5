sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.mdc",
		objectCapabilities: {
			"sap.ui.mdc.Control": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.Element": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.Table": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.MultiValueField": {
				properties: {
					dataType: "sap.ui.model.type.String"
				}
			},
			"sap.ui.mdc.FilterBar": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.filterbar.p13n.AdaptationFilterBar": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					adaptationControl: GenericTestCollection.ExcludeReason.CantSetDefaultValue
				}
			},
			"sap.ui.mdc.field.FieldBase": {
				properties: {
					dataType: "sap.ui.model.type.String",
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.Field": {
				properties: {
					dataType: "sap.ui.model.type.String"
				}
			},
			"sap.ui.mdc.chart.ChartTypeButton": {
				create: function (ChartTypeButton, mParameters) {
					return new Promise(function (resolve, reject) {
						sap.ui.require(["sap/ui/mdc/Chart"], function (Chart) {
							var oChart = new Chart(mParameters),
								oChartTypeButton = new ChartTypeButton(oChart);

							oChartTypeButton.destroy = function () {
								ChartTypeButton.prototype.destroy.call(this);
								oChart.destroy();
							};
							resolve(oChartTypeButton);
						}, reject);
					});
				}
			}
		}
	});

	return oConfig;
});