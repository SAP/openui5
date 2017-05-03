/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename"
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"renameField": BaseRename.createRenameChangeHandler({
			propertyName: "label",
			translationTextType: "XFLD",
			changePropertyName: "fieldLabel"
		})
	};
}, /* bExport= */true);