sap.ui.define(['sap/ui/commons/Button', 'sap/ui/commons/TextView', 'sap/ui/commons/layout/VerticalLayout', 'sap/ui/core/mvc/JSView'],
	function(Button, TextView, VerticalLayout/*, JSView*/) {
	"use strict";

	sap.ui.jsview("sap.ui.core.mvctest.Test", {

		getControllerName: function() {
			return "sap.ui.core.mvctest.Test";
		},

		/**
		 *
		 * @param oController may be null
		 * @returns {sap.ui.cre.Control}
		 */
		createContent: function(oController) {
			var aControls = [];
			var oText = new TextView({text:"JS View with a Button attached to a controller function:"});
			var oButton = new Button(this.createId("myButton"), {text:"Press Me"});
			oButton.attachPress(oController.doIt,oController);
			var oLayout = new VerticalLayout("Layout1", {
				content: [oText,oButton]});
			aControls.push(oLayout);
			return aControls;
		}
	});

});
