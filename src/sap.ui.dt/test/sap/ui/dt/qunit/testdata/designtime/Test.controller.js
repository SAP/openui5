sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/m/TextArea'
], function(Controller, TextArea) {
	"use strict";

	return Controller.extend("dt.view.Test", {

		onInit: function () {
		},

		onAfterRendering: function() {
			var oSimpleScrollControl = this.oView.byId("simpleScrollControl");

			if (oSimpleScrollControl) {
				oSimpleScrollControl.addContent1(new TextArea({
					height: "500px",
					width: "400px",
					value: "foo"
				}));
				oSimpleScrollControl.addContent2(new TextArea({
					height: "500px",
					width: "400px",
					value: "bar"
				}));
			}
		}
	});
});
