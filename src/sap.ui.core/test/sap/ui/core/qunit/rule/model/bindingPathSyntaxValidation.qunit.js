/*global QUnit */

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"test-resources/sap/ui/support/TestHelper"
], function(JSONModel, Button, testRule) {
	"use strict";

	QUnit.module("sap.ui.core bindingPathSyntaxValidation rule tests", {

		beforeEach: function() {

			// create a Model
			var oModel = new JSONModel({
				actionName: "Say Hello"
			});

			// wrong path: 'actoinName' instead of 'actionName'
			var button = new Button({
				text:'{/actoinName}'
			});
			button.setModel(oModel);
			button.placeAt("qunit-fixture");

		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "bindingPathSyntaxValidation",
		expectedNumberOfIssues: 1
	});
});