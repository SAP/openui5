/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
	"sap/ui/layout/changeHandler/RenameFormContainer"
], function (RenameFormContainer) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"renameGroup": RenameFormContainer,
		"moveControls": "default"

	};
}, /* bExport= */true);
