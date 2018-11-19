/* global QUnit */
sap.ui.define([
	"sap/ui/core/Component",
	"test-resources/sap/ui/support/TestHelper",
	"sap/base/Log"
], function(Component, testRule, Log) {
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

	QUnit.module("ControllerExtension", {
		beforeEach: function(assert) {
			return new Promise(function(resolve, reject) {
				sap.ui.require(["sap/ui/core/Component"], function(Component) {
					Component.create({
						name: "mvc.testdata.ControllerExtensionTest.Test2"
					})
					.then(function(oComponent) {
						return oComponent.getRootControl().loaded();
					})
					.then(function(oView) {
						resolve();
					});
				});
			});
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "controllerExtension",
		async: true,
		expectedNumberOfIssues: fnIncrement(1)
	});

});