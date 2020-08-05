sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var MainController = Controller.extend("testdata.customizing.sap.Main", {
		onInit: function() {
			this.getView().setModel(new JSONModel({
				products: [
					{ProductName: "p1"},
					{ProductName: "p2"},
					{ProductName: "p3"},
					{ProductName: "p4"}
				]
			}));

			var oTemplate = this.getView().byId("myListItem");

			this.getView().byId("myTable").bindItems({
				template: oTemplate,
				path: "/products"
			});
		}
	});

	return MainController;

});
