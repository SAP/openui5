/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/BaseRename'
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"moveControls": "default",
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "headerText",
			translationTextType: "XGRP"
		}),
		"unhideControl": "default"
	};
}, /* bExport= */ true);