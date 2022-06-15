/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/thirdparty/jquery"
], function (
	basicCommandTest,
	jQuery
) {
	"use strict";

	basicCommandTest({
		commandName: "settings",
		designtimeActionStructure: "settings",
		designtimeAction: false
	}, {
		changeType: "settings",
		content: "myFancyContent"
	}, {
		changeType: "settings",
		content: "myFancyContent"
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
