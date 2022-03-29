/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function (
	basicCommandTest
) {
	"use strict";

	basicCommandTest({
		commandName: "resize",
		designtimeActionStructure: "resize"
	}, {
		changeType: "resize",
		content: {
			resizedElementId: "myElementId",
			newWidth: 200
		}
	}, {
		changeType: "resize",
		content: {
			resizedElementId: "myElementId",
			newWidth: 200
		}
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});