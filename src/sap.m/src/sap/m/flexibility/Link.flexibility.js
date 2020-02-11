/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/ChangeLinkTarget",
	"sap/ui/fl/changeHandler/BaseRename"
], function (ChangeLinkTarget, BaseRename) {
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