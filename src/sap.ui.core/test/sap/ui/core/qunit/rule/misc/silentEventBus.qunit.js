/*global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/EventBus",
	"test-resources/sap/ui/support/TestHelper"
], function(Log, EventBus, testRule) {
	"use strict";

	// the rules rely on a certain log level for analyzing issues
	Log.setLevel(4);

	QUnit.module("sap.ui.core EventBus logs rule tests", {

		beforeEach: function() {
			this.listener = function(){};
			EventBus.getInstance().subscribe("myChannel", "myEvent", this.listener);

			//these 2 publications should be responsible for 2 issues being found
			EventBus.getInstance().publish("otherChannel", "myEvent", {data: 47});
			EventBus.getInstance().publish("myListener", {data: 47});

			//event should be excluded as it starts with sap
			EventBus.getInstance().publish("sap.ui", "__fireUpdate", {data: 47});

			//event should not be counted as it successfully is subscribed to
			EventBus.getInstance().publish("myChannel", "myEvent", {data: 47});
		},
		afterEach: function() {
			EventBus.getInstance().unsubscribe("myChannel", "myEvent", this.listener);
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "eventBusSilentPublish",
		expectedNumberOfIssues: 2
	});
});