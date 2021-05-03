/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function (
	basicCommandTest
) {
	"use strict";

	basicCommandTest({
		commandName: "bindProperty",
		designtimeActionStructure: "propertyBindingChange"
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
		jQuery("#qunit-fixture").hide();
	});
});
