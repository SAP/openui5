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

		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("myColorPreview");
			if (oControl.getColor() !== undefined){
				oRm.addClass("sapThemeForegroundBorderColor-asBorderColor");
				oRm.addClass("myColorPreviewBorder");

				if (oControl.getColor() === "transparent") {
					oRm.addClass("myTransparentPreview");
				} else {
					oRm.addStyle("background-color", oControl.getColor());
				}
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.write("</div>");
		}
	});
});