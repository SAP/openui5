sap.ui.define([
	"sap/m/Text",
	"sap/ui/core/mvc/JSView"
], function(Text, JSView) {
	"use strict";

	sap.ui.jsview("samples.components.ext_legacyAPIs.sap.Sub1", {

		createContent : function(oController) {
			return new Text({text: "I am the SAP original view and should be replaced"});
		}
	});

});
