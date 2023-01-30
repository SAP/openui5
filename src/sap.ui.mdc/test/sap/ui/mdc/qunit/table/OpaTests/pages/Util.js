/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement"
], function(
	Core,
	P13nArrangement
) {
	"use strict";

	/**
	 * Static collection of utility functions related to OPA tests with a table.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.mdc.qunit.table.OpaTests.pages.Util
	 * @private
	 */
	var Util = {};

	Util.waitForColumnMenu = function(mConfig) {
		return this.waitFor({
			searchOpenDialogs: true,
			controlType: "sap.m.table.columnmenu.Menu",
			success: function(aColumnMenu) {
				if (mConfig && mConfig.success) {
					mConfig.success.call(this, mConfig.findAll ? aColumnMenu : aColumnMenu[0]);
				}
			},
			errorMessage: "No column menu is open"
		});
	};

	Util.getTextFromResourceBundle = function(sLibraryName, sTextKey, aValues) {
		return Core.getLibraryResourceBundle(sLibraryName).getText(sTextKey, aValues);
	};

	Util.P13nDialogInfo = P13nArrangement.P13nDialog;

	return Util;
});
