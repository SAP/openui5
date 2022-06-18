/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/thirdparty/jquery"
], function (
	basicCommandTest,
	jQuery
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
		jQuery("#qunit-fixture").hide();
	});
});
