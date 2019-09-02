sap.ui.define(['sap/ui/commons/Button', 'sap/ui/core/mvc/JSView'],
	function(Button/*, JSView*/) {
	"use strict";

	sap.ui.jsview("sap.ui.core.samples.routing.Index", {

		getControllerName: function() {
			return "sap.ui.core.samples.routing.Index";
		},

		/**
		 *
		 * @param oController may be null
		 * @returns {sap.ui.core.Control}
		 */
		createContent: function(oController) {
			return new Button({text:'Test'});
		}

	});

});
