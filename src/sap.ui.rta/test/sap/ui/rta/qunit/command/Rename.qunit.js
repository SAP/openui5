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
		jQuery("#qunit-fixture").hide();
	});
});
