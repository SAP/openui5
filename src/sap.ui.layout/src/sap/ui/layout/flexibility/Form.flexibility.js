/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
	"sap/ui/layout/changeHandler/AddFormContainer",
	"sap/ui/layout/changeHandler/AddFormField"
], function (AddGroup, AddFormField) {
	"use strict";

	return {
		"moveControls": "default",
		"addGroup": AddGroup,
		"addFormField" : AddFormField

	};
}, /* bExport= */true);
