/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function(
	basicCommandTest
) {
	"use strict";

	var mProperties = {
		baseId: "myFancyBaseId",
		targetAggregation: "myFancyTargetAggregation",
		index: 4,
		url: "https://www.sap.com",
		width: "myFancyWidth",
		height: "myFancyHeight",
		title: "Potato",
		advancedSettings: {
			additionalSandboxParameters: []
		}
	};

	basicCommandTest({
		commandName: "addIFrame",
		designtimeActionStructure: "addIFrame"
	}, {
		...mProperties,
		changeType: "addIFrame"
	}, {
		changeType: "addIFrame",
		content: { ...mProperties }
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});