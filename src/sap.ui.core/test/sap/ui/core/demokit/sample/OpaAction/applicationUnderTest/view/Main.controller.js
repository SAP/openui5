sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/test/actions/Press',
		'sap/ui/model/json/JSONModel'
	],
function(Controller, Press, JSONModel) {
	"use strict";

	return Controller.extend("appUnderTest.view.Main", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
			var oButton = this.byId("navigationButton");
			setTimeout(function () {
				// Opa will wait until the button is not busy
				oButton.setBusy(false);
			}, 5000);
		},

		onNavButtonPress : function () {
			this.byId("myApp").to(this.byId("secondPage").getId());
		},

		onBack: function () {
			this.byId("myApp").to(this.byId("firstPage").getId());
		},

		onPress: function () {
			// You may also invoke actions without letting OPA do it
			new Press().executeOn(this.byId("secondPage"));
		},

		onDelete: function (oEvent) {
			this.byId("productList").removeItem(oEvent.getParameter("listItem"));
		},

		onToolbarButtonPress: function (oEvent) {
			this.byId("toolbar-text").setText("Pressed " + oEvent.getSource().getText() + " Button");
		}
		});

});