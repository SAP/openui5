/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function (
	basicCommandTest
) {
	"use strict";

	basicCommandTest({
		commandName: "property",
		designtimeActionStructure: "propertyChange",
		designtimeAction: false
	}, {
		changeType: "propertyChange",
		propertyName: "myFancyPropertyName",
		newValue: "myFancyValue",
		semanticMeaning: "myFancySemanticMeaning"
	}, {
		changeType: "propertyChange",
		selector: {
			id: "myFancyControlId",
			type: "sap.ui.core.Control"
		},
		content: {
			property: "myFancyPropertyName",
			newValue: "myFancyValue",
			semantic: "myFancySemanticMeaning"
		}
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
