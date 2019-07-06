sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
	"use strict";
	return UIComponent.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exList.Component", {
			metadata:
				{
					manifest: "json"
				},
			init: function () {

				// call the init function of the parent
				UIComponent.prototype.init.apply(this, arguments);

				// data model
				var oData = {
					headers: [
						{ header: "Type" },
						{ header: "Brand" }
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
				this.setModel(oModel);

			}
		});
});
