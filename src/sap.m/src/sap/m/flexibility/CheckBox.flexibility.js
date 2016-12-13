/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename"
], function (BaseRename) {
	"use strict";

	return {
            "hideControl": "default",
            "renameCheckBox": BaseRename.createRenameChangeHandler({
                propertyName: "text",
                changePropertyName: "checkBoxText",
                translationTextType: "XCKL"
            }),
            "unhideControl": "default"
	};
}, /* bExport= */false);