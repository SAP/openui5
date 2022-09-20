sap.ui.define([
	"sap/ui/test/Opa5",
	"./AssertionsBase",
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, AssertionsBase, jQuery, PropertyStrictEquals) {
    "use strict";

    var oAssertions = {

		iShouldSeeALegend: function(sId) {
			//return Opa5.assert.ok(true);
			return this.waitFor({
				id: sId,
				success: function(oChart) {
					Opa5.assert.ok(oChart._getInnerChart().getVizProperties().legend.visible, "Legend is visible");
				},
				errorMessage: "No Chart found"
			});

		},

		iShouldSeeNoLegend: function(sId) {
			//return Opa5.assert.ok(true);

			return this.waitFor({
				id: sId,
				success: function(oChart) {
					Opa5.assert.ok(!oChart._getInnerChart().getVizProperties().legend.visible, "Legend is not visible");
				},
				errorMessage: "No Chart found"
			});

		},

		iShouldSeeTheChartWithChartType: function(sChartId,  sChartType){
			return this.waitFor({
				id: sChartId,
				success: function(oChart) {
					Opa5.assert.ok(oChart._getInnerChart().getChartType() === sChartType);
				},
				errorMessage: "No Chart found"
			});
		},

		iShouldSeeTheDrillStack: function(aCheckDrillStack, sChartId) {

			var arraysMatchElements = function (array1, array2) {

				if (array1.length !== array2.length){
					return false;
				}

				for (var i = 0; i < array1.length; i++) {
					if (array1[i] !== array2[i]) {
						return false;
				}
			}

				return true;

			};

			return this.waitFor({
				id: sChartId,
				success: function(oChart) {

					var aDrillStack = oChart._getInnerChart().getDrillStack();
					var aStackDimensions = [];

					aDrillStack.forEach(function(oStackEntry) {
						// loop over nested dimension arrays
						oStackEntry.dimension.forEach(function(sDimension) {
							if (sDimension != null && sDimension != "" && aStackDimensions.indexOf(sDimension) == -1) {
								aStackDimensions.push(sDimension);
							}
						});
					});

					Opa5.assert.ok(arraysMatchElements(aStackDimensions, aCheckDrillStack), "Drill stack is equal");
				},
				errorMessage: "No Chart found"
			});
		},

		iShouldSeeVisibleDimensionsInOrder: function(aOrderedDimensionNames, sId) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				matchers: new PropertyStrictEquals({
					name: "id",
					value: sId + "--innerChart"
				}),
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getVisibleDimensions().length === aOrderedDimensionNames.length;
				},
				success: function() {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getVisibleDimensions().length, aOrderedDimensionNames.length, "Chart contains " + aOrderedDimensionNames.length + " visible dimensions");
					aDomElements[0].getVisibleDimensions().forEach(function(sDimensionName, iIndex) {
						Opa5.assert.equal(sDimensionName, aOrderedDimensionNames[iIndex], "Dimension '" + sDimensionName + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},

		iShouldSeeVisibleMeasuresInOrder: function(aOrderedMeasureNames, sId) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				matchers: new PropertyStrictEquals({
					name: "id",
					value: sId + "--innerChart"
				}),
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getVisibleMeasures().length === aOrderedMeasureNames.length;
				},
				success: function() {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getVisibleMeasures().length, aOrderedMeasureNames.length, "Chart contains " + aOrderedMeasureNames.length + " visible measures");
					aDomElements[0].getVisibleMeasures().forEach(function(sMeasureName, iIndex) {
						Opa5.assert.equal(sMeasureName, aOrderedMeasureNames[iIndex], "Measure '" + sMeasureName + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},

		/**
		  * Checks whether the MDC Chart has an active overlay
		  * @param {string} sId Id of the MDC Chart
		  * @returns {Promise} OPA waitFor
		  */
		iShouldSeeAnOverlay: function(sId) {
			return this.waitFor({
				controlType: "sap.ui.mdc.Chart",
				id: sId,
				success: function(oChart){
					Opa5.assert.equal(oChart.$().find(".sapUiOverlay").length, 1, "Overlay was found on MDC Chart");
				}
			});
		},

		/**
		 * Checks whether the MDC Chart has no active overlay
		 * @param {string} sId Id of the MDC Chart
		 * @returns {Promise} OPA waitFor
		 */
		iShouldSeeNoOverlay: function(sId) {
			return this.waitFor({
				controlType: "sap.ui.mdc.Chart",
				id: sId,
				success: function(oChart){
					Opa5.assert.equal(oChart.$().find(".sapUiOverlay").length, 0, "No overlay was found on MDC Chart");
				}
			});
		}

    };

	return jQuery.extend(AssertionsBase, oAssertions);
});