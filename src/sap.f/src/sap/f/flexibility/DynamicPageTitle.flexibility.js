/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/CombineButtons",
	"sap/m/changeHandler/SplitMenuButton"
], function (CombineButtonsHandler, SplitMenuButtonHandler) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"combineButtons": {
			"changeHandler": CombineButtonsHandler,
			"layers": {
				"CUSTOMER": false
			}
		},
		"splitMenuButton": {
			"changeHandler": SplitMenuButtonHandler,
			"layers": {
				"CUSTOMER": false
			}
		},
		"moveControls": "default"
	};
}, /* bExport= */ true);
