/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/integration/testlibrary/Util"
], function(
	TestUtil
) {
	"use strict";

	var oTableUtils = {
		SortDialogTitle: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "table.SETTINGS_SORT"),
		ColumnDialogTitle: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "table.SETTINGS_COLUMN"),
		SortButtonIcon: "sap-icon://sort",
		ColumnButtonIcon: "sap-icon://action-settings",
		MoveToTopIcon: "sap-icon://collapse-group"
	};

	return oTableUtils;
});
