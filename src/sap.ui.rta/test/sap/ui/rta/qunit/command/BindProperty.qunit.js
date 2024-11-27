/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function(
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
		newBinding: "{someBinding}"
	}, {
		changeType: "propertyBindingChange",
		selector: {
			id: "myFancyControlId",
			type: "sap.ui.core.Control"
		},
		content: {
			property: "myFancyPropertyName",
			newBinding: "{someBinding}"
		}
	});

	basicCommandTest({
		commandName: "bindProperty",
		moduleName: "Expression binding",
		designtimeActionStructure: "propertyBindingChange",
		designtimeAction: false
	}, {
		changeType: "propertyBindingChange",
		propertyName: "myFancyPropertyName",
		newBinding: "{= 1 === 1}"
	}, {
		changeType: "propertyBindingChange",
		selector: {
			id: "myFancyControlId",
			type: "sap.ui.core.Control"
		},
		content: {
			property: "myFancyPropertyName",
			newBinding: "{= 1 === 1}"
		}
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
