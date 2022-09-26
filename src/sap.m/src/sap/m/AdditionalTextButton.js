/*!
 * ${copyright}
 */

// Provides control sap.m.AdditionalTextButton.
sap.ui.define(['./Button','./AdditionalTextButtonRenderer'],
	function(Button, AdditionalTextButtonRenderer) {
		"use strict";

	/**
	 * Constructor for a new AdditionalTextButton.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
     * The AdditionalTextButton control is a button with a second line of text. Intended for use in Calendar controls with a second calendar type. It is meant for private usage.
	 *
	 * @extends sap.m.Button
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.m.AdditionalTextButton
	 */
	var AdditionalTextButton = Button.extend("sap.m.AdditionalTextButton", {
		metadata: {
			library : "sap.m",
			properties : {
				additionalText: {type : "string", group : "Misc", defaultValue: "" }
			}
		},

		renderer: AdditionalTextButtonRenderer
	});

	return AdditionalTextButton;
});