/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/core/Control"
], function (
	basicCommandTest,
	Control
) {
	"use strict";

	basicCommandTest({
		commandName: "split",
		designtimeActionStructure: "split"
	}, {
		changeType: "split",
		newElementIds: [
			"myFancyElementId1",
			"myFancyElementId2"
		],
		source: new Control("myFancySourceId"),
		parentElement: new Control("myFancyParentId")
	}, {
		changeType: "split",
		newElementIds: [
			"myFancyElementId1",
			"myFancyElementId2"
		],
		sourceControlId: "myFancySourceId",
		parentId: "myFancyParentId"
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
