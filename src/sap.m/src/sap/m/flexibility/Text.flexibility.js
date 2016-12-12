/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/BaseRename'
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"editText": BaseRename.createRenameChangeHandler({
			propertyName: "text",
			changePropertyName: "textText",
			translationTextType: "XTXT"
		}),
		"unhideControl": "default"
	};
}, /* bExport= */ true);