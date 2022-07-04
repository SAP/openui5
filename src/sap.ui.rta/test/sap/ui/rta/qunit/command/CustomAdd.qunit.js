/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function(
	basicCommandTest
) {
	"use strict";

	var mProperties = {
		changeType: "addViaCustom",
		index: 4,
		addElementInfo: {info: "myFancyAddElementInfo"},
		aggregationName: "myFancyAggregationName",
		customItemId: "myFancyCustomItemId"
	};

	basicCommandTest({
		commandName: "customAdd",
		designtimeActionStructure: ["add", "custom"],
		additionalDesigntimeAttributes: {
			getItems: function() {}
		}
	}, Object.assign({}, mProperties), Object.assign({}, mProperties));

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});