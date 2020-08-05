/*global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function(jQuery, testRule) {
	"use strict";

	QUnit.module("DatePicker rules", {
		setup: function() {
			this.model = new sap.ui.model.json.JSONModel({
				date1: new Date(),
				date2: new Date()
			});
			this.page = new sap.m.Page({
				content: [
					new sap.m.Panel({
						id: "DatePickerTestsContext1",
						content: [
							new sap.m.DatePicker({
								value: {
									path: "/date1",
									type: new sap.ui.model.type.Date({ style: "medium", strictParsing: true })
								},
								dateValue: {
									path: "/date2",
									type: new sap.ui.model.type.Date()
								}
							})
						]
					}),
					new sap.m.Panel({
						id: "DatePickerTestsContext2",
						content: [
							new sap.m.DatePicker({
								value: {
									path: "/date1",
									type: new sap.ui.model.odata.type.DateTime()
								}
							})
						]
					}),
					new sap.m.Panel({
						id: "DatePickerTestsContext3",
						content: [
							new sap.m.DatePicker({
								value: {
									path: "/date1",
									type: new sap.ui.model.odata.type.Date()
								}
							})
						]
					}),
					new sap.m.Panel({
						id: "DatePickerTestsContext4",
						content: [
							new sap.m.DatePicker({
								dateValue: new Date(2018, 9, 23, 14, 24)
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
