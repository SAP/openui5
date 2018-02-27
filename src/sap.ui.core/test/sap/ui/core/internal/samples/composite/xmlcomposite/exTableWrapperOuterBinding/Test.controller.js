sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exTableWrapperOuterBinding.Test", {
		onInit: function () {

			// data model
			var oData = {
				headers: [
					{ header: "Product" },
					{ header: "Supplier" }
				],
				models: [
					{
						product: "M3",
						supplier: "BMW"
					},
					{
						product: "A45",
						supplier: "Mercedes"
					},
					{
						product: "R32",
						supplier: "VW"
					},
				]
			};
			var oModel = new JSONModel(oData);

			var oTable = sap.ui.getCore().byId(this.getView().getId() + "--" + "myTable");

			oTable.setModel(oModel);

			oTable.bindAggregation("columns", {
				path: "/headers",
				template: new sap.m.Column({
					header: new sap.m.Text({ text: "{header}" })
				})
			});

			oTable.bindAggregation("items", {
				path: "/models",
				template: new sap.m.ColumnListItem({
					cells: [new sap.m.Text({ text: "{product}" }), new sap.m.Text({ text: "{supplier}" })]
				})
			});

		}

	});

});
