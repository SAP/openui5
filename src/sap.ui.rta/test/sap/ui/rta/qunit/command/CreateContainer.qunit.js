/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function(
	basicCommandTest
) {
	"use strict";

	const mContent = {
		index: 4,
		newControlId: "myFancyNewControlId",
		parentId: "myFancyParentId"
	};

	basicCommandTest({
		commandName: "createContainer",
		designtimeActionStructure: "createContainer",
		aggregation: true
	}, {
		changeType: "createContainer",
		...mContent,
		label: "myFancyLabel"
	}, {
		changeType: "createContainer",
		content: {
			...mContent,
			newLabel: "myFancyLabel"
		}
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});