/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function(
	basicCommandTest
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

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});