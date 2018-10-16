/*global QUnit*/
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Fragment",
	"sap/ui/core/Component",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ExtensionPoint",
	"test-resources/sap/ui/support/TestHelper"
], function(Log, Fragment, Component, Controller, ExtensionPoint, testRule) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	var iIncrement = 0;
	var fnIncrement = function(iNumber){
		return function(){
			iIncrement += iNumber;
			return iIncrement;
		};
	};

	QUnit.module("sap.ui.fragment rule tests", {
		beforeEach: function () {
			sap.ui.fragment("test-resources/sap/ui/core/qunit/fragment/Fragment", "XML");
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("sap.ui.extensionpoint rule tests", {
		beforeEach: function () {
			sap.ui.extensionpoint();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("sap.ui.controller rule tests", {
		beforeEach: function () {
			Controller.extend("mySyncController", function() {
			});
			sap.ui.controller("mySyncController");
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: fnIncrement(1)
	});

	QUnit.module("sap.ui.component rule tests", {
		beforeEach: function () {
			sap.ui.component("LoremIpsum");
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "syncFactoryLoading",
		expectedNumberOfIssues: fnIncrement(1)
	});
});