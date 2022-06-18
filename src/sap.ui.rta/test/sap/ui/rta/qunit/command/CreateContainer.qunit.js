/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/thirdparty/jquery"
], function(
	basicCommandTest,
	jQuery
) {
	"use strict";

	var mProperties = {
		changeType: "createContainer",
		index: 4,
		newControlId: "myFancyNewControlId",
		parentId: "myFancyParentId"
	};

	basicCommandTest({
		commandName: "createContainer",
		designtimeActionStructure: "createContainer",
		aggregation: true
	}, Object.assign({}, mProperties, {
		label: "myFancyLabel"
	}), Object.assign({}, mProperties, {
		newLabel: "myFancyLabel"
	}));

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});