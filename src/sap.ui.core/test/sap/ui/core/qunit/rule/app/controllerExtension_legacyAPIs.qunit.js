/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/support/TestHelper",
	"sap/base/Log"
], function(testRule, Log) {
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

	QUnit.module("Sync ControllerExtension", {
		beforeEach: function(assert) {
			sap.ui.component({
				name: "mvc.testdata.ControllerExtensionTest.SyncWrongExtension"
			});
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "controllerExtension",
		async: false,
		expectedNumberOfIssues: fnIncrement(1)
	});

});