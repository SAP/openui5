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
		commandName: "combine",
		designtimeActionStructure: "combine"
	}, {
		changeType: "combineStuff",
		newElementId: "my-new-fancy-element-id",
		source: new Control("source"),
		combineElements: [
			new Control("combineElement1"),
			new Control("combineElement2")
		]
	}, {
		changeType: "combineStuff",
		newElementId: "my-new-fancy-element-id",
		sourceControlId: "source",
		combineElementIds: ["combineElement1", "combineElement2"]
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
