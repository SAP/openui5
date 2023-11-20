sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var DataExtension = Extension.extend("card.explorer.pagination.extension.DataExtension");

	DataExtension.prototype.getData = function (skip, top) {
		var oCard = this.getCard();

		return oCard.request({
			url: "https://services.odata.org/V4/Northwind/Northwind.svc/Products",
			parameters: {
				"$format": "json",
				"$count": true,
				"$skip": skip,
				"$top": top
			}
		});
	};

	return DataExtension;
});