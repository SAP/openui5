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
			library: "sap.ui.documentation",
			properties: {
				/**
				 * JSDoc Text to be displayed by the control. This text can contain basic HTML markup needed to display
				 * JSDoc content properly.
				 */
				text: {type : "string", defaultValue : ""},

				/**
				 * Whether to run the HTML sanitizer once the content (HTML markup) is applied or not.
				 *
				 * To configure the set of allowed URLs, you can use the {@link jQuery.sap.addUrlWhitelist whitelist API}.
				 */
				sanitizeContent : {type : "boolean", group : "Misc", defaultValue : true}
			}
		},

		renderer: {
			apiVersion: 2,

			render: function (oRm, oControl) {
				var sText = oControl.getText();
				if (oControl.getSanitizeContent()) {
					sText = sanitizeHTML(sText);
				}

				oRm.openStart("div", oControl);
				oRm.class("sapUiJSD");
				oRm.openEnd();

				oRm.unsafeHtml(sText);

				oRm.close("div");
		}
	}});

});