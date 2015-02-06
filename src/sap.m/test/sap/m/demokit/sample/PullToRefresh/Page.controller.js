sap.ui.controller("sap.m.sample.PullToRefresh.Page", {

	onInit: function (oEvent) {

		// Create mock model to simulate more results from the backend
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			ProductCollection: []
		}));

		// load product data
		this._productCount = 0;
		var that = this;
		jQuery.getJSON(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"), function (oData) {
				that._productData = oData;
				that._pushNewProduct();
		});
	},

	// Simulates increasing collection of products.
	// Obviously not for productive use at all.
	_pushNewProduct: function () {
		var aColl = this._productData.ProductCollection;
		if (this._productCount < aColl.length) {
			var oView = this.getView();
			var oData = oView.getModel().getData();
			oData.ProductCollection.push(aColl[this._productCount++]);
			oView.getModel().setData(oData);
		}
	},

	// simulate a refresh of the date that lasts 2 secs
	handleRefresh : function (evt) {
		var that = this;
		setTimeout(function () {
			that.getView().byId("pullToRefresh").hide();
			that._pushNewProduct();
		}, 1000);
	}
});
