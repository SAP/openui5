/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/BaseRename'
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"moveElements": "default",
		"renamePanel": BaseRename.createRenameChangeHandler({
			propertyName: "headerText",
			changePropertyName: "panelHeaderText",
			translationTextType: "XGRP"
		}),
		"unhideControl": "default"
	};
}, /* bExport= */ true);