/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename"
], function (BaseRename) {
	"use strict";

	return {
		"renameUploadCollectionItem": BaseRename.createRenameChangeHandler({
			propertyName: "fileName",
			translationTextType: "XACT"
		}),
		hideControl: "default",
		unhideControl: "default"
	};
});