/*global QUnit */
sap.ui.define([
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Button"
], function(HorizontalLayout, Button) {
	"use strict";

	return {
		createContent: function(oController) {
			var oLayout = new HorizontalLayout();

			var oButton = new Button({
				text:"{/someText}"
			});
			oLayout.addContent(oButton);

			QUnit.config.current.assert.equal(oController, undefined, "Controller should not be given");

			return oLayout;
		}
	};

});