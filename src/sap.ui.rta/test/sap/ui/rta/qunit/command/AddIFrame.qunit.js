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
		advancedSettings: {
			additionalSandboxParameters: []
		}
	};

	basicCommandTest({
		moduleName: "When a title is provided",
		commandName: "addIFrame",
		designtimeActionStructure: "addIFrame"
	}, {
		...mProperties,
		title: "Test IFrame",
		changeType: "addIFrame"
	}, {
		changeType: "addIFrame",
		content: { ...mProperties },
		texts: {
			title: {
				value: "Test IFrame",
				type: "XTIT"
			}
		}
	});

	basicCommandTest({
		moduleName: "When no title is provided",
		commandName: "addIFrame",
		designtimeActionStructure: "addIFrame"
	}, {
		...mProperties,
		changeType: "addIFrame"
	}, {
		changeType: "addIFrame",
		content: { ...mProperties },
		texts: {}
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});