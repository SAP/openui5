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
			.resolveDestination("NorthwindDestination")
			.then(this.getEmployeeAndOrders.bind(this));
	};

	BatchRequestExtension.prototype.getEmployeeAndOrders = function (sServiceUrl) {
		var oModel = new ODataModel({
				serviceUrl: sServiceUrl
			});
		oModel.setDeferredGroups(["group1"]);

		oModel.read("/Employees(2)", { groupId: "group1" });
		oModel.read("/Orders", { groupId: "group1", urlParameters: {$top: 5, $filter: "EmployeeID eq 2"} });

		return new Promise(function (resolve, reject) {
			oModel.submitChanges({
				success: function (oData) {
					var aData = oData.__batchResponses;
					resolve({ "employee": aData[0].data, "orders": aData[1].data });
				},
				error: function (sMessage, sResponseText) {
					reject(sResponseText);
				}
			});
		});
	};

	return BatchRequestExtension;
});
