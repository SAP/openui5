jQuery.sap.require("sap.ui.layout.sample.GridTiles.Formatter");

sap.ui.controller("sap.ui.layout.sample.GridTiles.Grid", {

	productItemLink: {
		"small": [13, 1, 2, 12, 8, 9],
		"large": [7, 0]
	},

	onInit: function(oEvent) {

		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);

		var oView = this.getView();
		oView.bindElement("/ProductCollection");

		// Link up the products with the item display
		for (var sSize in this.productItemLink) {
			var iItemCount = 0;
			for (var iItem in this.productItemLink[sSize]) {
				oView
					.byId(["productitem", sSize, iItemCount++].join("-"))
					.bindElement(String(this.productItemLink[sSize][iItem]));
			}
		}
	}

});
