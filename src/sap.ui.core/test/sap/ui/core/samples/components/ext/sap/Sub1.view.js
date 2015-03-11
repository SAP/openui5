sap.ui.define(['sap/ui/commons/TextView', 'sap/ui/core/mvc/JSView'],
	function(TextView, JSView) {
	"use strict";

	sap.ui.jsview("samples.components.ext.sap.Sub1", {

		createContent : function(oController) {
			return new TextView({text: "I am the SAP original view and should be replaced"});
		}
	});

});
