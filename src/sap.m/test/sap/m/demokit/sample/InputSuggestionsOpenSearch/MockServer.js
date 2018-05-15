sap.ui.define(['jquery.sap.global','sap/ui/core/util/MockServer'],
	function(jQuery, MockServer1) {
	"use strict";

	var MockServer = {

		backendProductSearchService: function() {
			if (!this._osp) {

				// use explored app's demo data
				this._productCount = 0;
				jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json", {
					async: false,
					success: function (data) {
						this._productData = data;
					}.bind(this)
				});

				// init server
				this._osp = new MockServer1({
					rootUri: "http://localhost/productsearch",
					requests: [
						{
							method: "GET",
							path: "/:term",
							response: function (oXhr, sTerm) {
								var aResults = this._productData.ProductCollection
									.filter(function (mProduct) {
										return mProduct.Name.match(new RegExp('^' + sTerm, 'i'));
									})
									.map(function (mProduct) {
										return mProduct.Name;
									});
								oXhr.respondJSON(200, null, [sTerm, aResults]);
								return true;
							}.bind(this)
						}
					]
				});
				this._osp.start();
			}
			return this._osp;
		}

	};


	return MockServer;

}, /* bExport= */ true);