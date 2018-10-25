/*global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function(jQuery, testRule) {
	"use strict";

	QUnit.module("DateRangeSelection rules", {
		setup: function() {
			this.model = new sap.ui.model.json.JSONModel({
				date1: new Date(),
				date2: new Date()
			});
			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
						id: "DateRangeSelectionTestsContext1",
						content: [
							new sap.m.DateRangeSelection({
								value: {
									path: "/date1",
									type: new sap.ui.model.type.Date({ style: "medium", strictParsing: true })
								},
								dateValue: {
									path: "/date2",
									type: new sap.ui.model.type.Date()
								}
							}),
							new sap.m.DateRangeSelection({
								value: {
									path: "/date1",
									type: new sap.ui.model.type.Date({ style: "medium", strictParsing: true })
								},
								secondDateValue: {
									path: "/date2",
									type: new sap.ui.model.type.Date()
								}
							}),
							new sap.m.DateRangeSelection({
								dateValue: {
									path: "/date1",
									type: new sap.ui.model.type.Date()
								},
								secondDateValue: {
									path: "/date2",
									type: new sap.ui.model.type.Date()
								}
							}),
							new sap.m.DateRangeSelection({
								value: {
									path: "/date1",
									type: new sap.ui.model.type.Date({ style: "medium", strictParsing: true })
								}
							})
						]
					}),
					new sap.m.Panel({
						id: "DateRangeSelectionTestsContext2",
						content: [
							new sap.m.DateRangeSelection({
								valueFormat: "yyyy/MM"
							})
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");
			this.page.setModel(this.model);
		},
		teardown: function() {
			this.page.destroy();
			this.model = null;
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "DateRangeSelectionTestsContext1",
		libName: "sap.m",
		ruleId: "drsBindingRule",
		expectedNumberOfIssues: 2
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "DateRangeSelectionTestsContext2",
		libName: "sap.m",
		ruleId: "drsValueFormatRule",
		expectedNumberOfIssues: 1
	});
});
