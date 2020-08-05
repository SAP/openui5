/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename"
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "title",
			translationTextType: "XTIT"
		}),
		"unhideControl": "default",
		"moveControls": "default"
	};
});