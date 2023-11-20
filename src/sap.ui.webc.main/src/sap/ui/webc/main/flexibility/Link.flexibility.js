/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename",
	"sap/ui/webc/main/changeHandler/ChangeLinkTarget"
], function (BaseRename,ChangeLinkTarget) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "text",
			translationTextType: "XBUT"
		}),
		"changeLinkTarget": {
			"changeHandler": ChangeLinkTarget,
			"layers": {
				"CUSTOMER": false
			}
		}
	};
});