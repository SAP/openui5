/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/CombineButtons",
	"sap/m/changeHandler/SplitMenuButton"
], function (CombineButtonsHandler, SplitMenuButtonHandler) {
	"use strict";

	return {
		"moveControls": "default",
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
		}
	};
}, /* bExport= */ true);