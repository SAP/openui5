/*** List Report Assertions ***/
/*global QUnit */
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals", "sap/ui/test/matchers/AggregationFilled"],
	function (PropertyStrictEquals, AggregationFilled) {
		"use strict";

		return function () {

			return {

				iShouldSeeTheControl: function (sId, viewName) {
					return this.waitFor({
						id: sId,
						viewName: viewName,
						timeout: 70,
						success: function () {
							QUnit.ok(true, "The main page has the control " + sId + ".");
						},
						errorMessage: "Can't see the control" + sId + "."
					});
				}

			};
		};
	}
);
