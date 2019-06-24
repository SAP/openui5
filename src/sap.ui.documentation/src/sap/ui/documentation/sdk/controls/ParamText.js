
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
	 * @private
	 * @ui5-restricted sdk
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
				defaultFlag: {type : "boolean", defaultValue: false},
				/**
				 * Defines if the parameter is deprecated
				 */
				deprecated: {type : "boolean", defaultValue: false},
				/**
				 * Defines if the parameter is experimental
				 */
				experimental: {type : "boolean", defaultValue: false},
				/**
				 * Defines if the parameter is a hyperlink
				 */
				href: {type : "sap.ui.core.URI"}
			},
			events : {

				/**
				 * Event is fired when the user triggers the link control.
				 */
				press : {}
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

		renderer: {
			apiVersion: 2,

			render : function (oRm, oControl) {
			var sHref = oControl.getHref();

			if (sHref) {
				oRm.openStart("a", oControl)
					.attr("href", sHref)
					.class("sapMLnk");
			} else {
				oRm.openStart("div", oControl);
			}
			oRm.class("depth-" + oControl.getDepth())
				.class("sapUiParamText")
				.openEnd();

			// text
			oRm.text(oControl._getText());
			if (oControl.getOptional()) {
				oRm.text("?");
			}
			if (oControl.getDefaultFlag()) {
				oRm.openStart("span")
					.class("parameterDefault")
					.openEnd()
					.text("(default)")
					.close("span");
			}
			if (sHref) {
				oRm.close("a")
					.openStart("div")
					.class("sapUiParamText")
					.openEnd();
			}
			if (oControl.getDeprecated()) {

				oRm.openStart("div")
					.class("deprecated")
					.openEnd("");

				oRm.icon('sap-icon://message-error');

				oRm.openStart("span")
					.class("deprecatedText")
					.openEnd()
					.text("Deprecated")
					.close("span");

				oRm.close("div");
			}
			if (oControl.getExperimental()) {

				oRm.openStart("div")
					.class("experimental")
					.openEnd();

				oRm.icon('sap-icon://message-warning');

				oRm.openStart("span")
					.class("experimentalText")
					.openEnd()
					.text("Experimental")
					.close("span");

				oRm.close("div");
			}
			oRm.close("div");
		}
	}});

	/**
	 * Handler for the <code>press</code> event.
	 *
	 * @param {jQuery.Event} oEvent The <code>press</code> event object
	 * @private
	 */
	ParamText.prototype._handlePress = function(oEvent) {
		this.firePress({/* no parameters */});
	};

	if (Device.support.touch) {
		ParamText.prototype.ontap = ParamText.prototype._handlePress;
	} else {
		ParamText.prototype.onclick = ParamText.prototype._handlePress;
	}

	return ParamText;
});