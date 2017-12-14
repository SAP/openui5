
/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device'
], function(Control, Device) {
	"use strict";

	/**
	 * @class
	 * Provides the parameters texts in the API Reference with a custom CSS class so that the texts are displayed indented.
	 * @extends sap.ui.core.Control
	 */
	var ParamText = Control.extend("sap.ui.documentation.sdk.controls.ParamText", {
		metadata: {
			properties: {
				/**
				 * Text to be displayed by the control
				 */
				text: {type : "string", defaultValue : ""},
				/**
				 * Text to be displayed by the control for phone screen sizes
				 */
				phoneText: {type : "string", defaultValue : ""},
				/**
				 * Defines the custom CSS class needed for the parameter's text in the tables.
				 */
				customClass : {type : "string", group : "Behavior", defaultValue : ""},
				/**
				 * Defines the depth of the item and based on it it's decided what class should be applied to the
				 * control.
				 */
				depth : {type : "int", defaultValue: 0},
				/**
				 * Defines if the parameter should be marked as optional or not
				 */
				optional: {type : "boolean", defaultValue: false},
				/**
				 * Defines if the parameter is default
				 */
				defaultFlag: {type : "boolean", defaultValue: false}
			}
		},

		/**
		 * Returns the correct text to render based on device type and text availability
		 * @returns {string} text to render
		 * @private
		 */
		_getText: function () {
			var sPhoneText = this.getPhoneText();
			return Device.system.phone && sPhoneText ? sPhoneText : this.getText();
		},

		renderer: function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiParamText");
			oRm.addClass("depth-" + oControl.getDepth());
			oRm.addClass(oControl.getCustomClass());
			oRm.writeClasses();
			oRm.write(">");

			// text
			oRm.writeEscaped(oControl._getText());
			if (oControl.getOptional()) {
				oRm.write("?");
			}
			if (oControl.getDefaultFlag()) {
				oRm.write("<span");
				oRm.addClass("parameterDefault");
				oRm.writeClasses();
				oRm.write(">");
				oRm.write("(default)");
				oRm.write("</span>");
			}
			oRm.write("</div>");
		}
	});

	return ParamText;
});