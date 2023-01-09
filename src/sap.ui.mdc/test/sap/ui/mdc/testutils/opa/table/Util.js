/*!
 * ${copyright}
 */
sap.ui.define([
	"../Utils"
], function(
	TestUtils
) {
	"use strict";

	var oTableUtils = {
		SortDialogTitle: TestUtils.getTextFromResourceBundle("sap.ui.mdc", "sort.PERSONALIZATION_DIALOG_TITLE"),
		ColumnDialogTitle: TestUtils.getTextFromResourceBundle("sap.ui.mdc", "table.SETTINGS_COLUMN"),
		ColumnButtonIcon: "sap-icon://action-settings",
		MoveToTopIcon: "sap-icon://collapse-group"
	};

	return oTableUtils;
});
