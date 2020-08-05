/*global QUnit */

sap.ui.define([
	"sap/base/Log",
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function(Log, jQuery, testRule) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	QUnit.module("sap.ui.core EventBus logs rule tests", {

		beforeEach: function() {
			this.listener = function(){};
			sap.ui.getCore().getEventBus().subscribe("myChannel", "myEvent", this.listener);

			//these 2 publications should be responsible for 2 issues being found
			sap.ui.getCore().getEventBus().publish("otherChannel", "myEvent", {data: 47});
			sap.ui.getCore().getEventBus().publish("myListener", {data: 47});

			//event should be excluded as it starts with sap
			sap.ui.getCore().getEventBus().publish("sap.ui", "__fireUpdate", {data: 47});

			//event should not be counted as it successfully is subscribed to
			sap.ui.getCore().getEventBus().publish("myChannel", "myEvent", {data: 47});
		},
		afterEach: function() {
			sap.ui.getCore().getEventBus().unsubscribe("myChannel", "myEvent", this.listener);
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "eventBusSilentPublish",
		expectedNumberOfIssues: 2
	});
});