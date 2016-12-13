/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/fl/changeHandler/BaseRename'
], function (jQuery, BaseRename) {
	"use strict";
	/**
	 * Change handler for renaming a button.
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.RenameRadioButton
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.46
	 */
	var RenameRadioButton = BaseRename.createRenameChangeHandler({
		propertyName: "text",
		changePropertyName: "radioButtonText",
		translationTextType: "XFLD"
	});

	return RenameRadioButton;
}, /* bExport= */ true);