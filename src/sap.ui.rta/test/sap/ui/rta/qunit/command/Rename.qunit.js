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
		commandName: "rename",
		designtimeActionStructure: "rename"
	}, {
		changeType: "rename",
		renamedElement: new Control("myFancyRenamedElement"),
		newValue: "myFancyNewValue"
	}, {
		changeType: "rename",
		renamedElement: {
			id: "myFancyRenamedElement"
		},
		value: "myFancyNewValue"
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
