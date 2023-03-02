/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.mdc.qunit.link.opa.test.Arrangement", {
		iClearTheLocalStorageFromRtaRestart: function() {
			window.localStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
			window.localStorage.removeItem("sap.ui.rta.restart.USER");
			localStorage.clear();
		}
	});

});
