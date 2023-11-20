sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/library"
], function (Control, coreLibrary) {
	"use strict";

	return Control.extend("sap.uxap.testblocks.GenericDiv", {
		metadata: {
			properties: {
				"width": {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "auto"},
				"height": {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "auto"},
				"padding": {type: "sap.ui.core.CSSSizeShortHand", group: "Dimension", defaultValue: ""},
				"margin": {type: "sap.ui.core.CSSSizeShortHand", group: "Dimension", defaultValue: ""},
				"backgroundColor": {type: "sap.ui.core.CSSColor", group: "Appearance", defaultValue: "inherit"},
				"text": {type: "string", group: "Data", defaultValue: ""}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				if (oControl.getWidth() !== "auto") {
					oRm.style("width", oControl.getWidth());
				}
				if (oControl.getHeight() !== "auto") {
					oRm.style("height", oControl.getHeight());
				}
				if (oControl.getMargin()) {
					oRm.style("margin", oControl.getMargin());
				}
				if (oControl.getPadding()) {
					oRm.style("padding", oControl.getMargin());
				}
				if (oControl.getBackgroundColor() !== "inherit") {
					oRm.style("background-color", oControl.getBackgroundColor());
				}
				oRm.openEnd();
				if (oControl.getText()) {
					oRm.text(oControl.getText());
				}
				oRm.close("div");
			}
		}
	});

});

