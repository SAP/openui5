jQuery.sap.declare("sap.m.sample.InputSuggestionsOpenSearch.MockServer");
jQuery.sap.require("sap.ui.core.util.MockServer");

sap.m.sample.InputSuggestionsOpenSearch.MockServer = {

	backendProductSearchService: function() {
		if (!this._osp) {

			// use explored app's demo data
			this._productCount = 0;
			var that = this;
			jQuery.ajax(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"), {
				async: false,
				success: function (data) {
					that._productData = data;
				}
			});

			// init server
			this._osp = new sap.ui.core.util.MockServer({
				rootUri: "http://localhost/productsearch",
				requests: [
					{
						method: "GET",
						path: "/:term",
						response: function (oXhr, sTerm) {
							var aResults = that._productData.ProductCollection
								.filter(function (mProduct) {
									return mProduct.Name.match(new RegExp('^' + sTerm, 'i'));
								})
								.map(function (mProduct) {
									return mProduct.Name
								});
							oXhr.respondJSON(200, null, [sTerm, aResults]);
						}
					}
				]
			});
			this._osp.start();
		}
		return this._osp;
	}

};
