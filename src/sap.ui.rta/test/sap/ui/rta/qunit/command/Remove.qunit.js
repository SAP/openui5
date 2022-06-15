/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery"
], function (
	basicCommandTest,
	Control,
	jQuery
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
		jQuery("#qunit-fixture").hide();
	});
});
