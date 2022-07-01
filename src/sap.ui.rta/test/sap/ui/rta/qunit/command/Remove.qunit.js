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
		moduleName: "Test for 'remove' command with removedElement",
		commandName: "remove",
		designtimeActionStructure: "remove"
	}, {
		changeType: "hideControl",
		removedElement: new Control("myFancyRemovedControlId")
	}, {
		changeType: "hideControl",
		removedElement: {
			id: "myFancyRemovedControlId"
		}
	});

	basicCommandTest({
		moduleName: "Test for 'remove' command without removedElement",
		commandName: "remove",
		designtimeActionStructure: "remove"
	}, {
		changeType: "hideControl"
	}, {
		changeType: "hideControl",
		removedElement: {
			id: "myFancyControlId"
		}
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
