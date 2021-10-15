/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/SplitMenuButton",
	"sap/ui/fl/changeHandler/BaseRename"
], function (SplitMenuButtonsHandler, BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"splitMenuButton": SplitMenuButtonsHandler,
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "text",
			translationTextType: "XFLD"
		})
	};
}, /* bExport= */ true);