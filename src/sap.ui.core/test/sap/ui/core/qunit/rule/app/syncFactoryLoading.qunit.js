/*global QUnit testRule*/
sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ExtensionPoint",
	"test-resources/sap/ui/support/TestHelper"
], function(Fragment, Component, Controller, ExtensionPoint) {
	"use strict";

	QUnit.module("sap.ui.core fragment rule tests", {
		beforeEach: function () {
			sap.ui.fragment("test-resources/sap/ui/core/qunit/fragment/Fragment", "XML");
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: 1
	});

	QUnit.module("sap.ui.controller rule tests", {
		beforeEach: function () {
			sap.ui.extensionpoint();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncExtensionPointLoading",
		expectedNumberOfIssues: 1
	});



	QUnit.module("sap.ui.controller rule tests", {
		beforeEach: function () {
			Controller.extend("mySyncController", function () { });
			sap.ui.controller("mySyncController");
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncControllerCreation",
		expectedNumberOfIssues: 1
	});


	QUnit.module("sap.ui.controller rule tests", {
		beforeEach: function () {
			sap.ui.component("LoremIpsum");
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncComponentCreation",
		expectedNumberOfIssues: 1
	});
});