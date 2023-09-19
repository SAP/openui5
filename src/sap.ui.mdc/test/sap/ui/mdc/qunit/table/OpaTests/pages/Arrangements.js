/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/table/waitForTable"
], function(
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.Opa5 */ waitForTable) {
	"use strict";

	/**
	 * @class Arrangements
	 * @extends sap.ui.test.Opa5
	 * @private
	 * @alias sap.ui.mdc.qunit.table.OpaTests.pages.Arrangements
	 */
	const Arrangements = Opa5.extend("sap.ui.mdc.tableOpaTests.pages.Arrangements", {
		iStartMyApp: function(sAppFolderName) {
			return this.iStartMyAppInAFrame({
				source: "test-resources/sap/ui/mdc/qunit/table/OpaTests/" + sAppFolderName + "/start.html",
				autoWait: true,
				width: 1024,
				height: 720
			});
		},

		/**
		 * Retrieves the table instance by ID and forwards it to the provided callback function
		 *
		 * @function
		 * @name iGetTheTableInstance
		 * @param {String} sControl Id of the MDCTable
		 * @param {function} fnCallback Callback function with table instance
		 * @returns {Promise} OPA waitFor
		 * @private
		 */
		iGetTheTableInstance: function (sControl, fnCallback) {
			return waitForTable.call(this, sControl, {
				success: function(oTable) {
					fnCallback(oTable);
				}
			});
		}
	});

	return Arrangements;
});