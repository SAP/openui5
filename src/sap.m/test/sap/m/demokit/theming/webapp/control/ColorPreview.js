sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	return Control.extend("sap.ui.demo.theming.control.ColorPreview", {
		metadata: {
			properties: {
				"color": "string"
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("myColorPreview");
				if (oControl.getColor() !== undefined){
					oRm.class("sapThemeForegroundBorderColor-asBorderColor");
					oRm.class("myColorPreviewBorder");

					if (oControl.getColor() === "transparent") {
						oRm.class("myTransparentPreview");
					} else {
						oRm.style("background-color", oControl.getColor());
					}
				}
				oRm.openEnd();
				oRm.close("div");
			}
		}
	});
});