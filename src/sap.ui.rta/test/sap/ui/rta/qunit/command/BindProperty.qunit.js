/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function (
	basicCommandTest
) {
	"use strict";

	basicCommandTest({
		commandName: "bindProperty",
		designtimeActionStructure: "propertyBindingChange",
		designtimeAction: false
	}, {
		changeType: "propertyBindingChange",
		propertyName: "myFancyPropertyName",
		newBinding: "{bindingString: 'myFancyBindingString'}"
	}, {
		changeType: "propertyBindingChange",
		selector: {
			id: "myFancyControlId",
			type: "sap.ui.core.Control"
		},
		content: {
			property: "myFancyPropertyName",
			newBinding: "myFancyBindingString"
		}
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
