/*global QUnit */

sap.ui.define([
		"sap/m/Page",
		"sap/m/ObjectMarker",
		"test-resources/sap/ui/support/TestHelper"
], function (Page, ObjectMarker, testRule)  {
		"use strict";

		QUnit.module("ObjectMarker with additional info and no type", {
			setup: function () {
				this.page = new Page("objectMarkerContext", {
					content: new ObjectMarker({
						additionalInfo: "Additional Info"
					})
				});
				this.page.placeAt("qunit-fixture");
			},
			teardown: function () {
				this.page.destroy();
			}
		});

		testRule({
			executionScopeType: "subtree",
			executionScopeSelectors: "objectMarkerContext",
			libName: "sap.m",
			ruleId: "objectMarkerAdditionalInfo",
			expectedNumberOfIssues: 1
		});
	});
