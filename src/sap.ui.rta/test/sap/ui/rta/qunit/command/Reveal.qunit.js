/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function (
	basicCommandTest
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
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
