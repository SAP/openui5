/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery"
], function(
	basicCommandTest,
	Control,
	jQuery
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
		jQuery("#qunit-fixture").hide();
	});
});