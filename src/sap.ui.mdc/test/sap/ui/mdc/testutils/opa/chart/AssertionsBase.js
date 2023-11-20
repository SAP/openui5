sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
    "use strict";

    return {
        /**
         * Assertion to check that there is a mdc chart visible on the screen.
         */
		iShouldSeeAChart: function() {
		//return Opa5.assert.ok(true);

			return this.waitFor({
				controlType: "sap.ui.mdc.Chart",
				check: function(aChart) {
					return aChart.length === 1;
				},
				success: function(aChart) {
					Opa5.assert.ok(aChart.length, 'MDC Chart is on the screen');
				},
				errorMessage: "No MDC Chart found"
			});
		},

        /**
         * Assertion to check that there is a legend visible on the screen for given mdc chart.
         * @param {string} sId Id of the chart to be checked for a visible legend
         */
		iShouldSeeALegend: function(sId) {

		},

        /**
         * Assertion to check that there is no legend visible on the screen for given mdc chart.
         * @param {string} sId Id of the chart to be checked for a visible legend
         */
		iShouldSeeNoLegend: function(sId) {

		},

        /**
         * Assertion to check that there is a chart type popover visible on the screen.
         */
		iShouldSeeAChartTypePopover: function() {

			return this.waitFor({
				controlType: "sap.m.Popover",
				success: function(aPopovers) {
					Opa5.assert.ok(aPopovers.length, "Dialogs were found");

					var oDialog = aPopovers.filter(function(oDialog){return (oDialog.getId().toLowerCase().includes("btncharttypepopover"));})[0];
					Opa5.assert.ok(oDialog, "Chart Type dialog is opened");
				},
				errorMessage: "No Dialogs found"
			});

		},

        /**
         * Assertion to check that there is chart visible with given chart type.
         * @param {string} sChartId Id of the chart to be checked for a chart type
         * @param {string} sChartType Chart type which should be selected for the given chart
         */
		iShouldSeeTheChartWithChartType: function(sChartId,  sChartType){

		},

        /**
         * Assertion to check that there is a chart with given drillstack visible.
         * @param {array} aCheckDrillStack Drillstack to check for
         * @param {string} sChartId Id of the mdc chart
         */
		 iShouldSeeTheDrillStack: function(aCheckDrillStack, sChartId) {

		},

        /**
         * Assertion to check that there is a drilldown popover visible.
         */
		iShouldSeeADrillDownPopover: function() {

			return this.waitFor({
				controlType: "sap.m.Popover",
				success: function(aPopovers) {
					Opa5.assert.ok(aPopovers.length, "Dialogs were found");

					var oDialog = aPopovers.filter(function(oDialog){return (oDialog.getId().includes("drilldownPopover"));})[0];
					Opa5.assert.ok(oDialog, "Drilldown dialog is opened");
				},
				errorMessage: "No Dialogs found"
			});

		},

		/**
         * Assertion to check that there is a drilldown popover visible.
         */
		iShouldSeeADetailsPopover: function() {
			return this.waitFor({
				controlType: "sap.m.Popover",
				success: function(aPopovers) {
					Opa5.assert.ok(aPopovers.length, "Dialogs were found");

					var oDialog = aPopovers.filter(function(oDialog){return (oDialog.getId().includes("selectionDetails"));})[0];
					Opa5.assert.ok(oDialog, "Details dialog is opened");
				},
				errorMessage: "No Dialogs found"
			});
		},
		iShouldSeeVisibleDimensionsInOrder: function(aOrderedDimensionNames, sId) {

		},
		iShouldSeeVisibleMeasuresInOrder: function(aOrderedMeasureNames, sId) {

		}

    };
});