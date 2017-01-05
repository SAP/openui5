/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/BaseRename'
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"renameLabel": BaseRename.createRenameChangeHandler({
			propertyName: "text",
			changePropertyName: "labelText",
			translationTextType: "XFLD"
		}),
		"unhideControl": "default"
	};
}, /* bExport= */ false);