/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename"
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"renameRadioButton": BaseRename.createRenameChangeHandler({
			propertyName: "text",
			changePropertyName: "radioButtonText",
			translationTextType: "XBUT"
		}),
		"unhideControl": "default"
	};
}, /* bExport= */false);