/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
	"sap/ui/layout/changeHandler/RenameFormContainer",
	"sap/ui/layout/changeHandler/AddFormField"
], function (RenameFormContainer, AddFormField) {
	"use strict";

	return {
		"hideControl": "default",
		"renameGroup": RenameFormContainer,
		"moveControls": "default",
		"addFormField" : AddFormField

	};
}, /* bExport= */true);
