sap.ui.require([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	var arrangements = new Opa5({
		iStartMyApp: function () {
			return this.iStartMyAppInAFrame("test-resources/sap/ui/rta/qunit/opa/appContext/index.html");
		}
	});

	Opa5.extendConfig({
		arrangements: arrangements,
		autoWait: true
	});

	return new Promise(function (resolve, reject) {
		sap.ui.require(["sap/ui/rta/appcontext/integration/AppContextDialogJourney"], resolve, reject);
	});
});