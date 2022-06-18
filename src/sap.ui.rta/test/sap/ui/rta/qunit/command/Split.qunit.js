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
		commandName: "split",
		designtimeActionStructure: "split"
	}, {
		changeType: "split",
		newElementIds: [
			"myFancyElementId1",
			"myFancyElementId2"
		],
		source: new Control("myFancySourceId"),
		parentElement: new Control("myFancyParentId")
	}, {
		changeType: "split",
		newElementIds: [
			"myFancyElementId1",
			"myFancyElementId2"
		],
		sourceControlId: "myFancySourceId",
		parentId: "myFancyParentId"
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
