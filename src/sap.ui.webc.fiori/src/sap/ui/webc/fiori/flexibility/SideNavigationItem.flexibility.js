/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename"
], function (BaseRename) {
	"use strict";

	return {
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "text",
			translationTextType: "XTIT"
		})
	};
});