sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/orderbrowser/localService/mockserver"
], function (Opa5, mockserver) {
	"use strict";

	return Opa5.extend("sap.ui.demo.orderbrowser.test.integration.pages.Common", {

		getEntitySet: function  (sEntitySet) {
			return mockserver.getMockServer().getEntitySetData(sEntitySet);
		}
	});

});