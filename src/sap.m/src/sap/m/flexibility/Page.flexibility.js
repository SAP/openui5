/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename"
], function (BaseRename) {
	"use strict";

	return {
		"moveElements": "default",
		"renameTitle": BaseRename.createRenameChangeHandler({
			propertyName: "title",
			changePropertyName: "pageTitle",
			translationTextType: "XTIT"
		})
	};
}, /* bExport= */false);
