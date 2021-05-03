sap.ui.define([
	"sap/ui/test/Opa5",
	"./AssertionsBase",
	"sap/ui/thirdparty/jquery"
], function (Opa5, AssertionsBase, jQuery) {
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

		iSeeTheDrillStack: function(aCheckDrillStack, sChartId) {

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
		}

    };

	return jQuery.extend(AssertionsBase, oAssertions);
});