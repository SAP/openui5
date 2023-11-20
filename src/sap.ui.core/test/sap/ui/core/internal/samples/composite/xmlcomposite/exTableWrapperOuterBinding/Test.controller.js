sap.ui.define([
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Column, ColumnListItem, Text, Element, Controller, JSONModel) {
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
					}
				]
			};
			var oModel = new JSONModel(oData);

			var oTable = Element.getElementById(this.getView().getId() + "--" + "myTable");

			oTable.setModel(oModel);

			oTable.bindAggregation("columns", {
				path: "/headers",
				template: new Column({
					header: new Text({ text: "{header}" })
				})
			});

			oTable.bindAggregation("items", {
				path: "/models",
				template: new ColumnListItem({
					cells: [new Text({ text: "{product}" }), new Text({ text: "{supplier}" })]
				})
			});

		}

	});

});
