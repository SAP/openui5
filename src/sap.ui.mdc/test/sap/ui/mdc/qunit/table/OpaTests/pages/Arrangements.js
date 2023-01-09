/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	/** @type sap.ui.test.Opa5 */ Opa5) {
	"use strict";

	/**
	 * @class Arrangements
	 * @extends sap.ui.test.Opa5
	 * @private
	 * @alias sap.ui.mdc.qunit.table.OpaTests.pages.Arrangements
	 */
	var Arrangements = Opa5.extend("sap.ui.mdc.tableOpaTests.pages.Arrangements", {
		 iStartMyApp: function() {
			return this.iStartMyAppInAFrame({
				source: "test-resources/sap/ui/mdc/qunit/table/OpaTests/appUnderTestMDCTable/start.html",
				autoWait: true
			});
		}
	});

	return Arrangements;
});