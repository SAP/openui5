sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/model/odata/v2/ODataModel"
], function (
	Extension,
	ODataModel
) {
	"use strict";

	var BatchRequestExtension = Extension.extend("card.explorer.extension.batchRequest.BatchRequestExtension");

	BatchRequestExtension.prototype.getData = function () {
		var oCard = this.getCard();

		return oCard
			.resolveDestination("ProductsMockServer")
			.then(this.getEmployeeAndOrders.bind(this));
	};

	BatchRequestExtension.prototype.getEmployeeAndOrders = function (sServiceUrl) {
		var sSupplier = this.getCard().getCombinedParameters().supplierId,
			oModel = new ODataModel({
				serviceUrl: sServiceUrl
			});
		oModel.setDeferredGroups(["group1"]);

		oModel.read("/SEPMRA_C_PD_Supplier('" + sSupplier + "')", { groupId: "group1" });
		oModel.read("/SEPMRA_C_PD_Product", { groupId: "group1", urlParameters: {$top: 2, $filter: "Supplier eq '" + sSupplier + "'"} });

		return new Promise(function (resolve, reject) {
			oModel.submitChanges({
				success: function (oData) {
					var aData = oData.__batchResponses;
					resolve({ "supplier": aData[0].data, "products": aData[1].data });
				},
				error: function (sMessage, sResponseText) {
					reject(sResponseText);
				}
			});
		});
	};

	return BatchRequestExtension;
});
