/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/p13n/AdaptationController", "sap/ui/mdc/p13n/FlexUtil"
], function (AdaptationController, FlexUtil) {
	"use strict";
	/**
	 * P13n/Settings helper class for sap.ui.mdc.Chart.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.chart.ChartSettings
	 */

	var ChartSettings = {

		showPanel: function (oControl, sP13nType, oSource, aProperties) {
			ChartSettings["showP13n" + sP13nType](oControl, oSource);
		},

		_getAdaptationController: function(oControl) {
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			if (!oControl._oAdaptationController){
				oControl._oAdaptationController = new AdaptationController({
					liveMode: false,
					adaptationControl: oControl,
					stateRetriever: function(ChartDelegate, aPropertyInfo){
						return ChartSettings.getCurrentState(oControl);
					},
					afterChangesCreated: function(oAdaptationController, aChanges){
						FlexUtil.handleChanges(aChanges);
					},
					itemConfig: {
						addOperation: "addItem",
						removeOperation: "removeItem",
						moveOperation: "moveItem",
						title: oResourceBundle.getText("chart.PERSONALIZATION_DIALOG_TITLE"),
						panelPath: "sap/ui/mdc/p13n/panels/ChartItemPanel"
					}
				});
			}
			return oControl._oAdaptationController;
		},

		/**
		 * Fetches the relevant metadata for the Chart and returns property info array
		 *
		 * @param {Object} oChart - the instance of MDC Chart
		 * @returns {Object} the current state
		 */
		getCurrentState: function (oChart) {
			return {
				items: this._getVisibleProperties(oChart),
				sorter: this._getSortedProperties(oChart)
			};
		},

		_getVisibleProperties: function (oChart) {
			var aProperties = [];
			if (oChart) {
				oChart.getItems().forEach(function (oChartItem, iIndex) {
					aProperties.push({
						name: oChartItem.getKey(),
						label: oChartItem.getLabel(),
						role: oChartItem.getRole(),
						position: iIndex
					});

				});
			}
			return aProperties;
		},

		_getSortedProperties: function(oChart) {
			return oChart.getSortConditions() ? oChart.getSortConditions().sorters : [];
		},

		showP13nChart: function (oControl, oSource) {
			var oAdaptationController = ChartSettings._getAdaptationController(oControl);
			oAdaptationController.showP13n(oSource, "Item");
		},

		showP13nSort: function(oControl, oSource){
			var oAdaptationController = ChartSettings._getAdaptationController(oControl);
			oAdaptationController.showP13n(oSource, "Sort");
		}

	};
	return ChartSettings;
});
