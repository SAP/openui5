/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/CombineButtons",
	"sap/m/changeHandler/SplitMenuButton"
], function (CombineButtonsHandler, SplitMenuButtonHandler) {
	"use strict";

	return {
		"combineButtons": {
			"changeHandler": CombineButtonsHandler,
			"layers": {
				"CUSTOMER": false
			}
		},
		"moveControls": "default",
		"splitMenuButton": {
			"changeHandler": SplitMenuButtonHandler,
			"layers": {
				"CUSTOMER": false
			}
		}
	};
}, /* bExport= */ true);
