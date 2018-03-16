/*!
 * ${copyright}
 */

// Provides control sap.m.AccButton.
sap.ui.define(['./Button','./AccButtonRenderer'],
	function(Button, AccButtonRenderer) {
		"use strict";

	/**
	 * Constructor for a new AccButton.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The AccButton control represents button with additional capabilities for accessability settings. It is meant for private usage.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.m.AccButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AccButton = Button.extend("sap.m.AccButton", {
		metadata: {
			library : "sap.m",
			properties : {
				"tabIndex": {type : "string", defaultValue : null, bindable : "bindable"},
				"ariaHidden": {type : "string", defaultValue : null, bindable : "bindable"}
			}
		}
	});

	return AccButton;
});
