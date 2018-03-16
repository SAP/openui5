sap.ui.define([
	"sap/ui/core/Control",
	"jquery.sap.global"
], function(Control, $) {
	"use strict";
	var ColorPreview = Control.extend("sap.ui.demo.theming.control.ColorPreview", {
		metadata: {
			properties: {
				"color": "string"
			}
		},

		init : function(){
			this._controlId = this.getId();
		},

		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("myColorPreview");
			if (oControl.getColor() != undefined){
				oRm.addClass("sapThemeForegroundBorderColor-asBorderColor");
				oRm.addClass("myColorPreviewBorder");
				oRm.addStyle("background-color", oControl.getColor());
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.write("</div>");
		},

		onAfterRendering : function(oControl){
			if (this.getColor() == "transparent"){

				$('#' + oControl.srcControl.sId).css('background', 'none');
				$('#' + oControl.srcControl.sId).css('background-image', 'url("control/Transparenz.jpg")');
			}
		}
	});
	return ColorPreview;
});