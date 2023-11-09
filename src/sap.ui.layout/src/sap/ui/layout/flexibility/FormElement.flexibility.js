/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
	"sap/ui/layout/changeHandler/RenameFormElement"
], function (RenameFormElement) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"renameField": RenameFormElement
	};
});