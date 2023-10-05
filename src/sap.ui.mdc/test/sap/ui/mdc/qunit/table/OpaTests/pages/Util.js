/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement",
	"sap/ui/core/Lib"
], function(
	Core,
	P13nArrangement,
	Lib
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
	const Util = {};

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

	/**
	 * Wait for the P13n dialog.
	 *
	 * @param {object} mConfig config object
	 * @param {boolean} mConfig.findAll finds all matching controls if true, otherwise will return the first found instance
	 * @param {function} mConfig.success callback function for waitFor success
	 * @returns {Promise} OPA waitFor
	 */
	Util.waitForP13nDialog = function(mConfig) {
		return this.waitFor({
			controlType: "sap.m.Dialog",
			success: function (aDialogs) {
				if (mConfig && mConfig.success) {
					mConfig.success.call(this, mConfig.findAll ? aDialogs : aDialogs[0]);
				}
			},
			errorMessage: "No dialog was found"
		});
	};

	Util.getTextFromResourceBundle = function(sLibraryName, sTextKey, aValues) {
		return Lib.getResourceBundleFor(sLibraryName).getText(sTextKey, aValues);
	};

	Util.P13nDialogInfo = P13nArrangement.P13nDialog;

	return Util;
});
