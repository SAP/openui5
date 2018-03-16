sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.HeapOfShards.test.integration.pages.Common", {

		iStartMyApp : function () {
			this.iStartMyAppInAFrame("../../index.html?sap-ui-language=en&sap-ui-animation=false&serverDelay=0'");
		}

	});

});