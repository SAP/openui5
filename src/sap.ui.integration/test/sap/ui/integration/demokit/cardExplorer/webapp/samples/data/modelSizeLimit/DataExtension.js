sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var DataExtension = Extension.extend("card.explorer.data.modelSizeLimit.DataExtension");

	DataExtension.prototype.getFilterData = function () {
		var aData = [];
		for (var i = 1; i <= 10000; i++) {
			aData.push({
				shipper: "Shipper " + i
			});
		}

		return Promise.resolve(aData);
	};

	DataExtension.prototype.getOrdersData = function (sShipperName) {
		var aData = [];
		for (var i = 1; i <= 5; i++) {
			aData.push({
				order: "Order " + i,
				shipper: sShipperName
			});
		}

		return Promise.resolve(aData);
	};

	return DataExtension;
});
