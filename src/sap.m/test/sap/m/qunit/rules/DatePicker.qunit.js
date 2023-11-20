/*global QUnit */

sap.ui.define([
	"sap/m/DatePicker",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTime",
	"test-resources/sap/ui/support/TestHelper",
	"sap/ui/core/date/UI5Date"
], function(DatePicker, Page, Panel, JSONModel, TypeDate, ODataTypeDate, ODataTypeDateTime, testRule, UI5Date) {
	"use strict";

	QUnit.module("DatePicker rules", {
		beforeEach: function() {
			this.model = new JSONModel({
				date1: UI5Date.getInstance(),
				date2: UI5Date.getInstance()
			});
			this.page = new Page({
				content: [
					new Panel({
						id: "DatePickerTestsContext1",
						content: [
							new DatePicker({
								value: {
									path: "/date1",
									type: new TypeDate({ style: "medium", strictParsing: true })
								},
								dateValue: {
									path: "/date2",
									type: new TypeDate()
								}
							})
						]
					}),
					new Panel({
						id: "DatePickerTestsContext2",
						content: [
							new DatePicker({
								value: {
									path: "/date1",
									type: new ODataTypeDateTime()
								}
							})
						]
					}),
					new Panel({
						id: "DatePickerTestsContext3",
						content: [
							new DatePicker({
								value: {
									path: "/date1",
									type: new ODataTypeDate()
								}
							})
						]
					}),
					new Panel({
						id: "DatePickerTestsContext4",
						content: [
							new DatePicker({
								dateValue: UI5Date.getInstance(2018, 9, 23, 14, 24)
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
		executionScopeSelectors: "DatePickerTestsContext1",
		libName: "sap.m",
		ruleId: "exclusiveValueDateValueBindingRule",
		expectedNumberOfIssues: 1
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "DatePickerTestsContext2",
		libName: "sap.m",
		ruleId: "dateTimeBindingConstraintRule",
		expectedNumberOfIssues: 1
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "DatePickerTestsContext3",
		libName: "sap.m",
		ruleId: "jsonValueBindingIsCorrect",
		expectedNumberOfIssues: 1
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "DatePickerTestsContext4",
		libName: "sap.m",
		ruleId: "dateValueHasHoursMinutesSeconds",
		expectedNumberOfIssues: 1
	});
});
