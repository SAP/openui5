/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/core/Control"
], function(
	basicCommandTest,
	Control
) {
	"use strict";

	basicCommandTest({
		commandName: "move",
		designtimeActionStructure: "move"
	}, {
		changeType: "moveControls",
		movedElements: [{
			element: new Control("myFancyMovedElementId1"),
			sourceIndex: 1,
			targetIndex: 4
		},
		{
			element: new Control("myFancyMovedElementId2"),
			sourceIndex: 2,
			targetIndex: 5
		}],
		target: {
			id: "myFancyTarget"
		},
		source: {
			parent: new Control("myFancySource")
		}
	}, {
		changeType: "moveControls",
		source: {
			id: "myFancySource"
		},
		target: {
			id: "myFancyTarget"
		},
		movedElements: [{
			id: "myFancyMovedElementId1",
			sourceIndex: 1,
			targetIndex: 4
		}, {
			id: "myFancyMovedElementId2",
			sourceIndex: 2,
			targetIndex: 5
		}]
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});