sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	var oMockServer,
		sMockDataPath = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/SEPMRA_PROD_MAN/mockdata/SEPMRA_C_PD_Product.json");


	// only queries of type "{Products(Key Value) {inner query}}"" are supported
	function createResponseData (aProducts, sQuery) {
		var oParts = sQuery.match(/{(.*){(.*)}}/), // support only queries of type {Products() {inner query}}
			sProductFilter = oParts[1],
			sInnerQuery = oParts[2];

		var aRes = aProducts,
			aKeys = sInnerQuery.match(/\w+\(.+\)|\w+/g);

		var oFilter = sProductFilter.match(/\((\w+):\s(.+)\)/);

		if (oFilter) {
			var sFilterKey = oFilter[1],
				sFilterValue = oFilter[2];

			aRes = aRes.filter(function (oProduct) {
				return oProduct[sFilterKey] === sFilterValue;
			});
		}

		aRes = aRes.map(function (oProduct) {
			var oRes = {};
			aKeys.forEach(function (sKey) {
				oRes[sKey] = oProduct[sKey];
			});
			return oRes;
		});

		return {
			data: aRes,
			errors: []
		};
	}

	var oMockServerInterface = {
		_pInit: null,

		/**
		 * Initializes mock server for Products service.
		 * For demo purposes the local mock data in this folder is returned instead of real data.
		 */
		init: function () {
			this._pInit = this._pInit || new Promise(function (resolve, reject) {
				jQuery.ajax(sMockDataPath, {
					dataType: "json"
				}).done(function (oData) {
					var aProducts = oData.d.results;

					oMockServer = new MockServer({
						rootUri: "/graphql"
					});

					var aRequests = oMockServer.getRequests();

					aRequests.push({
						method: "POST",
						path: /.*/,
						response: function (oXhr) {
							var sQuery = JSON.parse(oXhr.requestBody).query;
							oXhr.respondJSON(200, null, createResponseData(aProducts, sQuery));
						}
					});

					oMockServer.setRequests(aRequests);
					oMockServer.start();
					resolve();
				}).fail(function (jqXHR, sTextStatus, sError) {
					reject(sError);
				});
			});

			return this._pInit;
		},

		/**
		 * Returns the mock server for Products service.
		 * @public
		 * @returns {sap.ui.core.util.MockServer} The mock server instance.
		 */
		getMockServer: function () {
			return oMockServer;
		}
	};

	return oMockServerInterface;
});
