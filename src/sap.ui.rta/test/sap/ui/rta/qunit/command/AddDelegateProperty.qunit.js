/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function(
	basicCommandTest
) {
	"use strict";

	const mContent = {
		index: 1,
		newControlId: "newControlId",
		parentId: "myFancyParentId",
		modelType: "myFancyModelType",
		relevantContainerId: "myFancyRelevantContainerId",
		oDataServiceVersion: "myFancyVersion"
	};

	basicCommandTest(
		{
			commandName: "addDelegateProperty",
			designtimeActionStructure: ["add", "delegate"]
		},
		{
			changeType: "addFields",
			...mContent,
			bindingString: "myFancyBindingPath",
			propertyName: "propertyName",
			oDataServiceUri: "serviceUri",
			entityType: "myFancyEntityType"
		},
		{
			changeType: "addFields",
			content: {
				...mContent,
				bindingPath: "myFancyBindingPath"
			},
			oDataInformation: {
				oDataServiceUri: "serviceUri",
				propertyName: "propertyName",
				entityType: "myFancyEntityType"
			}
		}
	);

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
