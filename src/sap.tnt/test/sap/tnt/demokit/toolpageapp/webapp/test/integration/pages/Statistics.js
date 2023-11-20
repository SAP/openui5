sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press",
	"sap/ui/VersionInfo"
], function (Opa5, PropertyStrictEquals, Press, VersionInfo) {
	"use strict";

	var sViewName = "Statistics";

	// run OPA tests for the current environment (D3 = OpenUI5, MicroCharts = SAPUI5)
	var sChartViewName = sViewName + "D3";

	VersionInfo.load().then(function (oVersionInfo) {
		if (oVersionInfo.name.startsWith("SAPUI5")) {
			sChartViewName = sViewName + "Micro";
		}
	});

	Opa5.createPageObjects({
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
						viewName: sChartViewName,
						success: function (oView) {
							Opa5.assert.ok(oView, "The busy indicator was displayed");
						},
						errorMessage: "The busy indicator was not displayed"
					});
				},

				iShouldSeeTheCharts: function () {
					if (sChartViewName.search("D3") >= 0) {
						this.waitFor({
							controlType: "sap.ui.demo.toolpageapp.control.D3PieChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 2, "Two pie charts are displayed");
							},
							errorMessage: "The pie charts are not displayed"
						});

						this.waitFor({
							controlType: "sap.ui.demo.toolpageapp.control.D3ColumnChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 2, "Two column charts are displayed");
							},
							errorMessage: "The column charts are not displayed"
						});

						this.waitFor({
							controlType: "sap.ui.demo.toolpageapp.control.D3ComparisonChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 2, "Two comparison charts are displayed");
							},
							errorMessage: "The comparison charts are not displayed"
						});

						this.waitFor({
							controlType: "sap.ui.demo.toolpageapp.control.D3Chart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.strictEqual(aCharts.length, 6, "Six D3 charts are displayed");
							},
							errorMessage: "The D3 charts are not displayed"
						});
					} else {
						this.waitFor({
							controlType: "sap.suite.ui.microchart.ComparisonMicroChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 1, "The ComparisonMicroChart is displayed");
							},
							errorMessage: "The ComparisonMicroChart is not displayed"
						});

						this.waitFor({
							controlType: "sap.suite.ui.microchart.ColumnMicroChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 1, "The ColumnMicroChart is displayed");
							},
							errorMessage: "The ColumnMicroChart is not displayed"
						});

						this.waitFor({
							controlType: "sap.suite.ui.microchart.AreaMicroChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 1, "The AreaMicroChart is displayed");
							},
							errorMessage: "The AreaMicroChart is not displayed"
						});

						this.waitFor({
							controlType: "sap.suite.ui.microchart.RadialMicroChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 2, "The RadialMicroChart are displayed");
							},
							errorMessage: "The RadialMicroChart are not displayed"
						});

						this.waitFor({
							controlType: "sap.suite.ui.microchart.BulletMicroChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 2, "The BulletMicroCharts are displayed");
							},
							errorMessage: "The BulletMicroCharts are not displayed"
						});

						this.waitFor({
							controlType: "sap.suite.ui.microchart.HarveyBallMicroChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 1, "The HarveyBallMicroChart is displayed");
							},
							errorMessage: "The HarveyBallMicroChart is not displayed"
						});

						this.waitFor({
							controlType: "sap.suite.ui.microchart.DeltaMicroChart",
							viewName: sChartViewName,
							success: function (aCharts) {
								Opa5.assert.ok(aCharts.length === 1, "The DeltaMicroChart is displayed");
							},
							errorMessage: "The DeltaMicroChart is not displayed"
						});
					}

				}
			}
		}
	});
});