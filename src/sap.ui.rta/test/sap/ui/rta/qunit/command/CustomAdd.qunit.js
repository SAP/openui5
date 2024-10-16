/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function(
	basicCommandTest
) {
	"use strict";

	const mContent = {
		index: 4,
		addElementInfo: {info: "myFancyAddElementInfo"},
		aggregationName: "myFancyAggregationName",
		customItemId: "myFancyCustomItemId"
	};

	basicCommandTest({
		commandName: "customAdd",
		designtimeActionStructure: ["add", "custom"],
		additionalDesigntimeAttributes: {
			getItems() {}
		}
	}, {
		changeType: "addViaCustom",
		...mContent
	 }, {
		changeType: "addViaCustom",
		content: mContent
	  });

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});