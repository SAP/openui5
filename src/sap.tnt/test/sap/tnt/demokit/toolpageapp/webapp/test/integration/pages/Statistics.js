sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/demo/toolpageapp/test/integration/pages/Common",
		"sap/ui/test/matchers/PropertyStrictEquals",
		"sap/ui/test/actions/Press"
	], function (Opa5,Common, PropertyStrictEquals, Press) {
		"use strict";
		var sViewName="Statistic";
		Opa5.createPageObjects({
			baseClass: Common,
			onTheStatisticsPage: {

				actions: {

					iPressTheRefreshButton: function() {
						return this.waitFor({
							id: "refresh",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Did not find the refresh button on the statistics page"
						});
					}
				},

				assertions: {
					iShouldSeeTheStatisticsView: function () {
						return this.waitFor({
							viewName: sViewName,
							success: function () {
								Opa5.assert.ok(sViewName,"The statistics view was displayed");
							},
							errorMessage: "The statistics view was not displayed"
						});
					},

					iShouldSeeTheBusyIndicator: function () {
						this.waitFor({
							id: "statisticsBlockLayout",
							viewName: sViewName,
							success: function (oView) {
								Opa5.assert.ok(oView, "The busy indicator was displayed");
							},
							errorMessage: "The busy indicator was not displayed"
						});
					}
				}
			}
		});
	}
);