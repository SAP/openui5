/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Dialog.
sap.ui.define([
	"./Popup",
	"./thirdparty/ui5-wc-bundles/Dialog"
], function(Popup) {
	"use strict";

	/**
	 * Constructor for a new <code>Dialog</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.Dialog
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Dialog = Popup.extend("sap.ui.webcomponents.Dialog", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-dialog",
			properties: {

				stretch: {
					type: "boolean",
				}
			},
			methods: [
				"open",
				"close"
			]
		}
	});

	return Dialog;
});
