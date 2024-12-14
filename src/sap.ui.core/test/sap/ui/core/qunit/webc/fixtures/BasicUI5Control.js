sap.ui.define(["sap/ui/core/Control", "sap/ui/core/LabelEnablement"], function(Control, LabelEnablement) {
	"use strict";

	/**
	 * Simple fixture control that renders only a div.
	 */
	const clazz = Control.extend("webc.fixture.BasicUI5Control", {
		metadata: {
			interfaces : [
				"sap.ui.core.Label"
			],
			properties: {
				text: "string"
			},
			associations : {
				labelFor : {type : "sap.ui.core.Control", multiple : false}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.text(oControl.getText());
				oRm.close("div");
			}
		}
	});
	LabelEnablement.enrich(clazz.prototype);

	return clazz;
});