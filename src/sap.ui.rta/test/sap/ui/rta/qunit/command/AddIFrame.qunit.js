/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/thirdparty/jquery"
], function (
	basicCommandTest,
	jQuery
) {
	"use strict";

	var mProperties = {
		baseId: "myFancyBaseId",
		targetAggregation: "myFancyTargetAggregation",
		index: 4,
		url: "https://www.sap.com",
		width: "myFancyWidth",
		height: "myFancyHeight"
	};

	basicCommandTest({
		commandName: "addIFrame",
		designtimeActionStructure: "addIFrame"
	}, Object.assign({}, mProperties, {
		changeType: "addIFrame"
	}), {
		changeType: "addIFrame",
		content: Object.assign({}, mProperties)
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});