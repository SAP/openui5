sap.ui.define(["sap/ui/core/Control"], function(Element) {
	"use strict";

	var Step = Element.extend("sap.dwp.workflow.controls.Step", {
		metadata: {
			properties: {
				title: {
					type: "string"
				},
				description: {
					type: "string"
				},
				status: {
					type: "string",
					defaultValue: "Ready"
					//Ready,Completed,Disabled
				},
				stepContent: {
					type: "any"
				}
			}
		}
	});
	return Step;
});