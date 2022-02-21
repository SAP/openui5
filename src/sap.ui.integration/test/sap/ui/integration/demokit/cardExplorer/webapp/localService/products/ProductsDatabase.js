sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/ui/thirdparty/jquery"
], function(deepExtend, jQuery) {
	"use strict";

	var aInitialData, aData;

	function loadData () {
		return new Promise(function (resolve, reject) {
			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/products/data.json"), {
				dataType: "json"
			})
			.done(function (data) {
				aInitialData = data.products;
				aData = deepExtend([], aInitialData); // deep copy of the initial data
				resolve();
			})
			.fail(function (jqXHR, sTextStatus, sError) {
				reject(sError);
			});
		});
	}

	return {
		init: function () {
			this._pLoadData = this._pLoadData || loadData();

			return this._pLoadData.then(function () {
				return aData;
			});
		},

		getData: function () {
			return aData;
		},

		resetData: function () {
			aData = deepExtend([], aInitialData);
		},

		addToFavorites: function (sProductId) {
			var index = aData.findIndex(function (oEntry) {
				return oEntry.Id === sProductId;
			});

			// product not found
			if (index === -1) {
				return false;
			}

			// simulate error for certain products
			if (sProductId === "HT-1050" || sProductId === "HT-1030") {
				return false;
			}

			aData[index].IsFavorite = true;
			return true;
		},

		remove: function (sProductId) {
			var index = aData.findIndex(function (oEntry) {
				return oEntry.Id === sProductId;
			});

			// product not found
			if (index === -1) {
				return false;
			}

			aData.splice(index, 1);

			return true;
		}
	};
});