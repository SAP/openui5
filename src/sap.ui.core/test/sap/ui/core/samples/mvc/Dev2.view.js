sap.ui.define(['sap/ui/commons/Button', 'sap/ui/core/mvc/JSView'],
	function(Button/*, JSView*/) {
	"use strict";

	sap.ui.jsview("sap.ui.core.mvctest.Dev2", {

		getControllerName: function() {
			return "sap.ui.core.mvctest.Dev";
		},

		/**
		 *
		 * @param oController may be null
		 * @returns {sap.ui.core.Control}
		 */
		createContent: function(oController) {
			var aControls = [];
			var oButton = new Button({text:"Hello JS View 2"});
			aControls.push(oButton.attachPress(oController.doIt,oController));
			return aControls;
		}

	});

});
