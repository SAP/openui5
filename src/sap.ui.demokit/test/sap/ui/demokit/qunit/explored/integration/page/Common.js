sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	"use strict";

	return Opa5.extend("myApp.test.arrangement.Common", {

		iStartTheExploredApp : function () {
			return this.iStartMyAppInAFrame("../../../../../../../explored.html");
		}

	});
});
