/*global QUnit */

sap.ui.define([
	"sap/m/DateRangeSelection",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date",
	"test-resources/sap/ui/support/TestHelper"
], function(DateRangeSelection, Page, Panel, JSONModel, TypeDate, testRule) {
	"use strict";

	QUnit.module("DateRangeSelection rules", {
		beforeEach: function() {
			this.model = new JSONModel({
				date1: new Date(),
				date2: new Date()
			});
			this.page = new Page({
				content: [
					new Panel({
						id: "DateRangeSelectionTestsContext1",
						content: [
							new DateRangeSelection({
								value: {
									path: "/date1",
									type: new TypeDate({ style: "medium", strictParsing: true })
								},
								dateValue: {
									path: "/date2",
									type: new TypeDate()
								}
							}),
							new DateRangeSelection({
								value: {
									path: "/date1",
									type: new TypeDate({ style: "medium", strictParsing: true })
								},
								secondDateValue: {
									path: "/date2",
									type: new TypeDate()
								}
							}),
							new DateRangeSelection({
								dateValue: {
									path: "/date1",
									type: new TypeDate()
								},
								secondDateValue: {
									path: "/date2",
									type: new TypeDate()
								}
							}),
							new DateRangeSelection({
								value: {
									path: "/date1",
									type: new TypeDate({ style: "medium", strictParsing: true })
								}
							})
						]
					}),
					new Panel({
						id: "DateRangeSelectionTestsContext2",
						content: [
							new DateRangeSelection({
								valueFormat: "yyyy/MM"
							})
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");
			this.page.setModel(this.model);
		},
		afterEach: function() {
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
