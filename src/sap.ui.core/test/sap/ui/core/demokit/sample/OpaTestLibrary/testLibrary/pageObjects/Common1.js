sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	// in test library page object definition, OPA5 arrangements configuration can receive an instance of Common1
	// All methods defined here can be accessed directly on the Given, When or Then clauses (eg: Given.iStartMyApp())
	var Common1 = Opa5.extend("testLibrary.pageObjects.Common1", {

		iStartMyApp: function () {
			return this.iStartMyAppInAFrame("applicationUnderTest/index.html");
		}

	});

	return Common1;

});
