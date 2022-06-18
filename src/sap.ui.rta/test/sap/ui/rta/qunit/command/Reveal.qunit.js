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
		commandName: "reveal",
		designtimeActionStructure: "reveal"
	}, {
		changeType: "unhideControl",
		revealedElementId: "myFancyRevealedElement"
	}, {
		changeType: "unhideControl",
		revealedElementId: "myFancyRevealedElement"
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
