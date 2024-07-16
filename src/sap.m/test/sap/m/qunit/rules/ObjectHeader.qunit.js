/*global QUnit */

sap.ui.define([
	"sap/m/Page",
	"sap/m/ObjectHeader",
	"sap/m/ObjectNumber",
	"sap/m/HeaderContainer",
	"test-resources/sap/ui/support/TestHelper"
], function(Page, ObjectHeader, ObjectNumber, HeaderContainer, testRule) {
	"use strict";

	QUnit.module("ObjectHeader condensed set to true with responsive - true", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					condensed: true,
					responsive: true
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderCondensed",
		expectedNumberOfIssues: 1
	});

	QUnit.module("ObjectHeader fullScreenOptimized set to true with responsive - false", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					fullScreenOptimized: true,
					responsive: false
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderFullScreenOptimized",
		expectedNumberOfIssues: 1
	});

	QUnit.module("ObjectHeader additionalNumbers aggregation used with responsive - true", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					additionalNumbers: new ObjectNumber(),
					responsive: true
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderAdditionalNumbers",
		expectedNumberOfIssues: 1
	});

	QUnit.module("ObjectHeader headerContainer aggregation used with responsive - false", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					headerContainer: new HeaderContainer(),
					responsive: false
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderHeaderContainer",
		expectedNumberOfIssues: 1
	});
});
