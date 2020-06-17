sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/thirdparty/jquery"
], function (MockServer, jQuery) {
	"use strict";

	return {

		connectToMockProductSearchService: function () {
			if (!this._oOSP) {
				return new Promise(function (fnResolve) {
					jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"), {
						success: function (oData) {
							this._oProductData = oData;
							this._oOSP = new MockServer({
								rootUri: "http://localhost/productsearch",
								requests: [{
									method: "GET",
									path: "/:term",
									response: function (oXHR, sTerm) {
										var aResults = this._oProductData.ProductCollection
											.filter(function (mProduct) {
												return mProduct.Name.match(new RegExp('^' + sTerm, 'i'));
											})
											.map(function (mProduct) {
												return mProduct.Name;
											});

										oXHR.respondJSON(200, null, [sTerm, aResults]);

										return true;
									}.bind(this)
								}]
							});

							this._oOSP.start();
							fnResolve(this._oOSP);
						}.bind(this)
					});

				}.bind(this));
			}

			return Promise.resolve(this._oOSP);
		}
	};
});