/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename",
	"sap/m/changeHandler/CombineButtons",
	"sap/m/changeHandler/SplitMenuButton"
], function (BaseRename, CombineButtonsHandler, SplitMenuButtonHandler) {
	"use strict";

	return {
		"moveControls": "default",
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "title",
			translationTextType: "XTIT"
		}),
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
});