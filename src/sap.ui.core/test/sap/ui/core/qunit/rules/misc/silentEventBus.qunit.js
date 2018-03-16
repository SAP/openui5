/*global QUnit testRule*/

sap.ui.define([
	"jquery.sap.global"
], function(/*jQuery*/) {
	"use strict";

	QUnit.module("sap.ui.core EventBus logs rule tests", {
		beforeEach: function() {
			sap.ui.getCore().getEventBus().subscribe("myChannel", "myChannel", function(){});

			//these 2 publications should be responsible for 2 issues being found
			sap.ui.getCore().getEventBus().publish("otherChannel", "myListener", {data: 47});
			sap.ui.getCore().getEventBus().publish("myListener", {data: 47});

			//event should be excluded as it starts with sap
			sap.ui.getCore().getEventBus().publish("sap.ui", "__fireUpdate", {data: 47});

			//event should not be counted as it successfully is subscribed to
			sap.ui.getCore().getEventBus().publish("myChannel", {data: 47});

		},
		afterEach: function() {
			sap.ui.getCore().getEventBus().unsubscribe("myChannel", "myListener", function(){});

		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.core",
		ruleId: "eventBusSilentPublish",
		expectedNumberOfIssues: 2
	});
});