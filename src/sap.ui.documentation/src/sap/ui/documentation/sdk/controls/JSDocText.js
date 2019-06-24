/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	"sap/base/security/sanitizeHTML"
], function(Control, sanitizeHTML) {
	"use strict";

	/**
	 * @class
	 * Renders properly JSDoc text content inside the Demo Kit
	 * @extends sap.ui.core.Control
	 * @private
	 * @ui5-restricted sdk
	 */
	return Control.extend("sap.ui.documentation.sdk.controls.JSDocText", {
		metadata: {
			properties: {
				/**
				 * JSDoc Text to be displayed by the control. This text can contain basic HTML markup needed to display
				 * JSDoc content properly.
				 */
				text: {type : "string", defaultValue : ""}
			}
		},

		renderer: {
			apiVersion: 2,

			render: function (oRm, oControl) {
			oRm.openStart("div", oControl);
			oRm.class("sapUiJSD");
			oRm.openEnd();

			// Sanitize HTML
			oRm.unsafeHtml(sanitizeHTML(oControl.getText()));

			oRm.close("div");
		}
	}});

});